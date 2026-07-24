import { kalash, lanePercent, road, split, transit, weave, type Segment } from '@/lib/ornament/cord';
import styles from './Thread.module.css';

export type Lane = 'bride' | 'groom' | 'both';

const laneClass: Record<Lane, string> = {
  bride: styles.bride,
  groom: styles.groom,
  both: styles.both,
};

/**
 * All thread graphics are decorative. The narrative they carry — parting,
 * meeting, moving on — is written out in the phase headings as real text, so
 * nothing here needs to be announced twice.
 */
const decorative = { 'aria-hidden': true as const, focusable: 'false' as const };

/**
 * A straight run of thread, stretched to whatever height its grid row turns out
 * to be. Straight runs are DOM elements rather than SVG precisely because they
 * have to stretch: a rectangle survives being stretched, a curve does not.
 */
export function ThreadRun({ lanes }: { lanes: Lane[] }) {
  return (
    <div className={styles.run} aria-hidden="true">
      {lanes.map((lane) => (
        <span
          key={lane}
          data-lane={lane}
          data-reveal="run"
          className={`${styles.line} ${laneClass[lane]}`}
          style={{ left: lanePercent(lane) }}
        />
      ))}
    </div>
  );
}

/**
 * A shaped piece of thread between two phases. Rendered at a fixed aspect ratio
 * so one definition serves the narrow rail on a phone and the wide central
 * gutter on a desktop, scaling uniformly rather than distorting.
 */
function SegmentSvg({ segment }: { segment: Segment }) {
  const { height, paths, over } = segment;
  const front = over ? paths.find((p) => p.lane === over) : undefined;
  const back = over ? paths.filter((p) => p.lane !== over) : paths;

  return (
    <svg
      className={styles.segment}
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="xMidYMid meet"
      {...decorative}
    >
      {back.map((p) => (
        <path
          key={p.lane}
          d={p.d}
          pathLength={1}
          data-lane={p.lane}
          data-reveal="draw"
          className={`${styles.stroke} ${laneClass[p.lane]}`}
        />
      ))}
      {front && (
        <>
          {/* The casing: a wider stroke in the page's own colour laid down
              first, so the crossing reads as genuinely over-and-under rather
              than as two lines that happen to overlap. */}
          <path d={front.d} pathLength={1} data-reveal="draw" className={styles.casing} />
          <path
            d={front.d}
            pathLength={1}
            data-lane={front.lane}
            data-reveal="draw"
            className={`${styles.stroke} ${laneClass[front.lane]}`}
          />
        </>
      )}
    </svg>
  );
}

/** One thread becomes two: the families part for Wanaparthy and Vinukonda. */
export const ThreadSplit = () => <SegmentSvg segment={split()} />;

/** Two become one: Edurukollu, the only place on this site where lines touch. */
export const ThreadWeave = () => <SegmentSvg segment={weave()} />;

/** The move to Vinukonda — the thread drifts rather than merely continuing. */
export const ThreadTransit = () => <SegmentSvg segment={transit()} />;

/**
 * The interrupted line drawn in the lane of whoever is on the road that day.
 * A DOM element rather than SVG for the same reason as `ThreadRun`: it has to
 * stretch to an unknown height, and a dashed border survives that intact.
 */
export function ThreadRoad({ lane }: { lane: Lane }) {
  return (
    <div className={styles.run} aria-hidden="true">
      <span
        data-lane={lane}
        data-reveal="run"
        className={`${styles.line} ${styles.roadLine} ${laneClass[lane]}`}
        style={{ left: lanePercent(lane) }}
      />
    </div>
  );
}

/**
 * The finial. A kalash is the vessel set at the summit of a temple tower, and
 * this is the only place on the site where the thread stops rather than
 * continues.
 */
export function ThreadKalash() {
  const k = kalash();
  return (
    <svg
      className={styles.kalash}
      data-reveal="finial"
      viewBox={`0 0 100 ${k.height}`}
      preserveAspectRatio="xMidYMid meet"
      {...decorative}
    >
      <path d={k.leaf} className={styles.kalashLeaf} />
      <path d={k.neck} className={styles.kalashStroke} />
      <path d={k.body} className={styles.kalashStroke} />
    </svg>
  );
}

/**
 * A pulli — the dot a kolam is drawn around — marking one event on its lane.
 * The muhurtham gets a ring, and is the only node that does.
 *
 * Positioning is deliberately left to whoever places it: the dot has to line up
 * with its own ceremony's first line of type, which only the timeline knows.
 */
export function ThreadNode({ lane, emphasis }: { lane: Lane; emphasis?: boolean }) {
  return (
    <span
      data-lane={lane}
      className={`${styles.node} ${laneClass[lane]}`}
      data-emphasis={emphasis || undefined}
      data-reveal="node"
      aria-hidden="true"
    />
  );
}
