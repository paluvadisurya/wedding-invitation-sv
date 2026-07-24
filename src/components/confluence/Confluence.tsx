import { copy } from '@/config/copy';
import { distanceBetween, towns } from '@/config/wedding';
import type { Side, TownId, WeddingEvent } from '@/config/types';
import {
  buildTimeline,
  isPast,
  type Lane,
  type TimelineBlock,
  type TimelineRow,
} from '@/lib/schedule';
import { dayNumber, fullDate, monthShort, timeRange, weekdayShort } from '@/lib/datetime';
import {
  ThreadKalash,
  ThreadNode,
  ThreadRoad,
  ThreadRun,
  ThreadSplit,
  ThreadTransit,
  ThreadWeave,
} from '@/components/ornament/Thread';
import styles from './Confluence.module.css';

/**
 * THE CONFLUENCE
 *
 * A single vertical timeline would flatten the one fact that matters most
 * about these five days: until the 25th there are two weddings running at
 * once, three hundred kilometres apart. So the schedule is drawn as a thread
 * that parts for the two towns, runs as two, and is knotted at the exact hour
 * the families meet — Edurukollu — before travelling on.
 *
 * Rendered entirely on the server. The side filter is three radio inputs and a
 * `:has()` selector — no JavaScript at all, and where `:has()` is unsupported
 * the page simply shows everything, which is the right default anyway.
 */
export function Confluence({ now }: { now: Date }) {
  const blocks = buildTimeline();
  if (blocks.length <= 1) return null;

  return (
    <section id="days" className={styles.section} aria-labelledby="days-title">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{copy.confluence.eyebrow}</p>
        <h2 id="days-title" className={styles.title}>
          {copy.confluence.title.split('\n').map((line) => (
            <span key={line} className={styles.titleLine}>
              {line}
            </span>
          ))}
        </h2>
        <p className={styles.lede}>{copy.confluence.lede}</p>
      </div>

      <div className={styles.wrap}>
        <SideFilter />
        <ol className={styles.timeline}>
          {blocks.map((block, i) => (
            <Block key={blockKey(block, i)} block={block} now={now} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function blockKey(block: TimelineBlock, i: number): string {
  switch (block.kind) {
    case 'row':
      return block.row.key;
    case 'day':
      return `day-${block.date ?? block.dateApprox ?? i}`;
    case 'phase':
      return `phase-${block.phase}`;
    default:
      return `${block.kind}-${i}`;
  }
}

function Block({ block, now }: { block: TimelineBlock; now: Date }) {
  switch (block.kind) {
    case 'phase': {
      const meta = copy.confluence.phase[block.phase];
      return (
        <li className={styles.phaseHead}>
          <div className={styles.phaseRail}>
            <ThreadRun lanes={block.lanes} />
          </div>
          <div className={styles.phaseText} data-reveal="plaque">
            <h3 className={styles.phaseTitle}>{meta.title}</h3>
            {meta.note && <p className={styles.phaseNote}>{meta.note}</p>}
          </div>
        </li>
      );
    }

    case 'day':
      return (
        <li className={styles.dayHead}>
          <div className={styles.dayRail}>
            <ThreadRun lanes={block.lanes} />
          </div>
          <p className={styles.dayDate} data-reveal="plaque">
            {block.date ? (
              <>
                <span className={styles.dayNum}>{dayNumber(block.date)}</span>
                <span className={styles.dayMeta}>
                  <span>{monthShort(block.date)}</span>
                  <span className={styles.dayWeekday}>{weekdayShort(block.date)}</span>
                </span>
              </>
            ) : (
              <span className={styles.dayApprox}>
                {block.dateApprox ?? copy.confluence.pending.date}
              </span>
            )}
          </p>
        </li>
      );

    case 'join':
      return (
        <li className={styles.join}>
          <div className={styles.joinRail}>
            {block.join === 'split' ? (
              <ThreadSplit />
            ) : block.join === 'weave' ? (
              <ThreadWeave />
            ) : (
              <ThreadTransit />
            )}
          </div>
          {block.join === 'transit' && <Journey from={block.from} to={block.to} />}
        </li>
      );

    case 'row':
      return <Row row={block.row} now={now} />;

    case 'end':
      return (
        <li className={styles.end}>
          <div className={styles.endRail}>
            <ThreadKalash />
          </div>
        </li>
      );
  }
}

function Row({ row, now }: { row: TimelineRow; now: Date }) {
  // When one side is driving rather than celebrating, its lane is drawn as a
  // broken line, so the rail's solid lanes are only those actually holding a
  // ceremony that day.
  const travellingLane: Lane | null =
    row.travelling === 'groom' ? 'groom' : row.travelling === 'bride' ? 'bride' : null;
  const solidLanes = row.lanes.filter((l) => l !== travellingLane);

  return (
    <li className={styles.pair}>
      <div className={styles.rail}>
        <ThreadRun lanes={solidLanes} />
        {travellingLane && <ThreadRoad lane={travellingLane} />}
      </div>

      {row.both ? (
        <div className={styles.cellBoth}>
          <EventEntry event={row.both} now={now} />
        </div>
      ) : (
        <>
          <div className={styles.cellBride}>
            {row.bride && <EventEntry event={row.bride} now={now} />}
          </div>
          <div className={styles.cellGroom}>
            {row.groom ? (
              <EventEntry event={row.groom} now={now} />
            ) : travellingLane ? (
              <OnTheRoad side={travellingLane} />
            ) : null}
          </div>
        </>
      )}
    </li>
  );
}

/**
 * Three radio inputs. Choosing a side does not remove the other one — it steps
 * it back. A guest attending only Wanaparthy should still be able to see that
 * the other half of the family is doing the same things on the same mornings.
 */
function SideFilter() {
  const options: { id: string; value: Side | 'all'; label: string }[] = [
    { id: 'side-all', value: 'all', label: copy.confluence.filter.all },
    { id: 'side-bride', value: 'bride', label: copy.confluence.filter.bride },
    { id: 'side-groom', value: 'groom', label: copy.confluence.filter.groom },
  ];

  return (
    <fieldset className={styles.filter}>
      <legend className={styles.filterLegend}>{copy.confluence.filter.label}</legend>
      <div className={styles.filterOptions}>
        {options.map((o) => (
          <span key={o.id}>
            <input
              type="radio"
              name="side"
              id={o.id}
              value={o.value}
              defaultChecked={o.value === 'all'}
              className={styles.filterInput}
            />
            <label htmlFor={o.id} className={styles.filterLabel}>
              {o.label}
            </label>
          </span>
        ))}
      </div>
      <p className={styles.filterHint}>{copy.confluence.filter.hint}</p>
    </fieldset>
  );
}

/** The celebration itself moving towns, between the wedding and the reception. */
function Journey({ from, to }: { from: TownId; to: TownId }) {
  const km = distanceBetween(from, to);
  return (
    <p className={styles.joinNote} data-reveal="plaque">
      {km !== null && <span className={styles.joinDistance}>{km} km</span>}
      <span className={styles.joinRoute}>
        {towns[from].name} → {towns[to].name}
      </span>
    </p>
  );
}

function OnTheRoad({ side }: { side: Lane }) {
  const from = side === 'groom' ? towns.vinukonda : towns.wanaparthy;
  const to = side === 'groom' ? towns.wanaparthy : towns.vinukonda;
  return (
    <p className={styles.road} data-lane={side} data-reveal="entry">
      <span className={styles.roadLabel}>On the road</span>
      <span className={styles.roadDetail}>
        {from.name} → {to.name}, in time for the evening.
      </span>
    </p>
  );
}

function EventEntry({ event, now }: { event: WeddingEvent; now: Date }) {
  const past = isPast(event, now);
  const town = towns[event.townId];
  const time = timeRange(event.start, event.end, event.endLabel);
  const pending = copy.confluence.pending;

  return (
    <article
      className={styles.entry}
      data-reveal="entry"
      data-lane={event.side}
      data-past={past || undefined}
      data-muhurtham={event.isMuhurtham || undefined}
    >
      {/* The dot lives inside its own ceremony so it lines up with the first
          line of type automatically, at any width. */}
      <span className={styles.nodeSlot}>
        <ThreadNode lane={event.side} emphasis={event.isMuhurtham} />
      </span>

      <h4 className={styles.entryName}>{event.name}</h4>
      {event.pronunciation && <p className={styles.pronunciation}>{event.pronunciation}</p>}

      <p className={styles.entryMeta}>
        <span>{time ?? pending.time}</span>
        <span className={styles.entryDot} aria-hidden="true" />
        <span>{town.name}</span>
      </p>

      <p className={styles.entryMeaning} data-pending={!event.meaning || undefined}>
        {event.meaning ?? pending.meaning}
      </p>

      <p className={styles.entryFoot}>
        <span className={styles.entryVenue} data-pending={!event.venue.name || undefined}>
          {event.venue.name ?? pending.venue}
        </span>
        {past && <span className={styles.entryPast}>{copy.confluence.past}</span>}
        {event.confidence === 'tentative' && !past && (
          <span className={styles.entryPast}>Not yet fixed</span>
        )}
      </p>

      {event.date && (
        <p className="visually-hidden">
          {fullDate(event.date)}
          {time ? `, ${time}` : ''}. {town.name}, {town.state}.
        </p>
      )}
    </article>
  );
}
