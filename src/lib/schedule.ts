import { events } from '@/config/events';
import { muhurtham } from '@/config/wedding';
import type { Phase, Side, TownId, WeddingEvent } from '@/config/types';
import { instant } from './datetime';

export const PHASE_ORDER: Phase[] = [
  'prelude',
  'parallel',
  'confluence',
  'union',
  'journey',
];

/** A single calendar day within a phase, holding whatever happens on it. */
export interface ScheduleDay {
  /** `YYYY-MM-DD`, or null for the one event with only an approximate window. */
  date: string | null;
  dateApprox?: string;
  bride: WeddingEvent[];
  groom: WeddingEvent[];
  both: WeddingEvent[];
  /**
   * True when one side has a ceremony this day and the other is on the road.
   * On 25 August this is what is actually happening to the groom's party, and
   * the timeline draws a journey rather than an empty column.
   */
  travellingSide: Side | null;
}

export interface SchedulePhase {
  phase: Phase;
  days: ScheduleDay[];
  /** Does this phase run as two separate columns? */
  isSplit: boolean;
}

/** The instant the wedding begins, exact hour or provisional. */
export function muhurthamInstant(): Date {
  return instant(muhurtham.date, muhurtham.time ?? muhurtham.provisionalStart);
}

/** When does an event start? Approximate-window events sort to their phase. */
export function eventInstant(e: WeddingEvent): Date | null {
  if (!e.date || !e.start) return null;
  return instant(e.date, e.start);
}

/** Has this finished? Used to render the engagement as memory, not schedule. */
export function isPast(e: WeddingEvent, now: Date): boolean {
  if (!e.date) return false;
  return instant(e.date, e.end ?? '23:59').getTime() < now.getTime();
}

/**
 * The next thing to happen, for the countdown's contextual line. Returns null
 * once everything is behind us — the site should then simply stop counting.
 */
export function nextEvent(now: Date = new Date()): WeddingEvent | null {
  const upcoming = events
    .filter((e) => !isPast(e, now))
    .map((e) => ({ e, t: eventInstant(e) }))
    .filter((x): x is { e: WeddingEvent; t: Date } => x.t !== null)
    .sort((a, b) => a.t.getTime() - b.t.getTime());
  return upcoming[0]?.e ?? null;
}

/**
 * Groups the flat event list into the shape the timeline draws: phases, each
 * holding days, each holding up to two parallel columns.
 *
 * Filtering by side happens here rather than in the component, so that a phase
 * which loses all its events simply disappears and the thread closes over it.
 */
export function buildSchedule(sideFilter: Side | 'all' = 'all'): SchedulePhase[] {
  const visible = events.filter(
    (e) => sideFilter === 'all' || e.side === 'both' || e.side === sideFilter,
  );

  return PHASE_ORDER.map((phase) => {
    const inPhase = visible.filter((e) => e.phase === phase);
    if (inPhase.length === 0) return null;

    // Preserve config order, but group by calendar day.
    const dayKeys: (string | null)[] = [];
    for (const e of inPhase) {
      if (!dayKeys.includes(e.date)) dayKeys.push(e.date);
    }

    const days: ScheduleDay[] = dayKeys.map((date) => {
      const onDay = inPhase.filter((e) => e.date === date);
      const bride = onDay.filter((e) => e.side === 'bride');
      const groom = onDay.filter((e) => e.side === 'groom');
      const both = onDay.filter((e) => e.side === 'both');

      // If exactly one side has ceremonies and someone else has a journey noted
      // for that day, the other side is in transit.
      let travellingSide: Side | null = null;
      if (phase === 'confluence' && bride.length > 0 && groom.length === 0) {
        travellingSide = 'groom';
      }

      return {
        date,
        dateApprox: onDay.find((e) => e.dateApprox)?.dateApprox,
        bride,
        groom,
        both,
        travellingSide,
      };
    });

    // A phase draws as two columns only if some day in it actually has both.
    const isSplit = days.some(
      (d) => d.bride.length > 0 || d.groom.length > 0 || d.travellingSide !== null,
    );

    return { phase, days, isSplit };
  }).filter((p): p is SchedulePhase => p !== null);
}

/* ==========================================================================
   THE TIMELINE
   The thread's shape is derived from the ceremonies themselves rather than
   hard-coded, which matters more than it sounds: it means the knot lands on
   Edurukollu — the hour the families actually meet — and not merely at some
   convenient boundary between two headings. Remove an event, or the whole
   phase around it, and the thread still parts and rejoins in the right places.
   ========================================================================== */

export type Lane = 'bride' | 'groom' | 'both';

/** One ceremony from each side, level with each other where they mirror. */
export interface TimelineRow {
  key: string;
  bride?: WeddingEvent;
  groom?: WeddingEvent;
  both?: WeddingEvent;
  /** The side that is driving rather than celebrating, on the day they travel. */
  travelling?: Side | null;
  lanes: Lane[];
}

export type TimelineBlock =
  | { kind: 'phase'; phase: Phase; lanes: Lane[] }
  | { kind: 'day'; date: string | null; dateApprox?: string; lanes: Lane[] }
  | { kind: 'row'; row: TimelineRow }
  | { kind: 'join'; join: 'split' | 'weave'; lanes: Lane[] }
  | { kind: 'join'; join: 'transit'; lanes: Lane[]; from: TownId; to: TownId }
  | { kind: 'end' };

const sameLanes = (a: Lane[], b: Lane[]) => a.length === b.length && a.every((l, i) => l === b[i]);

const SPLIT_LANES: Lane[] = ['bride', 'groom'];
const JOINED_LANES: Lane[] = ['both'];

function rowsForDay(day: ScheduleDay | undefined): TimelineRow[] {
  if (!day) return [];
  const rows: TimelineRow[] = [];
  const pairs = Math.max(day.bride.length, day.groom.length);

  for (let i = 0; i < pairs; i++) {
    rows.push({
      key: `${day.date ?? 'x'}-pair-${i}`,
      bride: day.bride[i],
      groom: day.groom[i],
      travelling: i === 0 ? day.travellingSide : null,
      lanes: SPLIT_LANES,
    });
  }

  for (const e of day.both) {
    rows.push({ key: e.id, both: e, lanes: JOINED_LANES });
  }

  return rows;
}

/**
 * Flattens the schedule into the exact sequence of things to draw, inserting a
 * shaped piece of thread wherever the number of lanes changes, and a transit
 * marker wherever the celebration changes town.
 */
export function buildTimeline(): TimelineBlock[] {
  const phases = buildSchedule('all');
  const blocks: TimelineBlock[] = [];

  // The thread starts in whatever shape the very first ceremony needs.
  let current: Lane[] = rowsForDay(phases[0]?.days[0])[0]?.lanes ?? JOINED_LANES;
  let currentTown: WeddingEvent['townId'] | null = null;

  /** Parts or knots the thread if `next` needs a different number of lanes. */
  const transitionTo = (next: Lane[]) => {
    if (sameLanes(current, next)) return;
    const parting = sameLanes(next, SPLIT_LANES);
    blocks.push({ kind: 'join', join: parting ? 'split' : 'weave', lanes: current });
    current = next;
    // While the families are apart there is no single place the celebration
    // *is*, so "where we were last" stops meaning anything until they rejoin.
    if (parting) currentTown = null;
  };

  /**
   * Marks a genuine relocation of the whole celebration — which only happens
   * while the thread is single. Everyone travelling to their own town during
   * the parallel days is already told by the thread parting, and does not need
   * a second announcement.
   */
  const maybeTransit = (rows: TimelineRow[]) => {
    const next = rows.find((r) => r.both)?.both?.townId ?? null;
    if (!next) return;
    if (currentTown && next !== currentTown && sameLanes(current, JOINED_LANES)) {
      blocks.push({ kind: 'join', join: 'transit', lanes: current, from: currentTown, to: next });
    }
    currentTown = next;
  };

  for (const phase of phases) {
    // A heading is drawn in the shape of whatever follows it.
    const phaseLanes = rowsForDay(phase.days[0])[0]?.lanes ?? current;
    transitionTo(phaseLanes);
    maybeTransit(phase.days.flatMap(rowsForDay));
    blocks.push({ kind: 'phase', phase: phase.phase, lanes: phaseLanes });

    for (const day of phase.days) {
      const rows = rowsForDay(day);
      const dayLanes = rows[0]?.lanes ?? current;
      transitionTo(dayLanes);
      maybeTransit(rows);
      blocks.push({ kind: 'day', date: day.date, dateApprox: day.dateApprox, lanes: dayLanes });

      for (const row of rows) {
        transitionTo(row.lanes);
        blocks.push({ kind: 'row', row });
      }
    }
  }

  blocks.push({ kind: 'end' });
  return blocks;
}
