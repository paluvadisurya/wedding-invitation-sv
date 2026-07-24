/**
 * THE KANKANAM — the thread that runs the length of this site.
 *
 * Before a Telugu wedding a protective thread is tied on the bride and on the
 * groom, separately, in their own houses, on the same day. It is untied only
 * after the wedding is over. Two threads, two towns, one knot: it is the exact
 * shape of these five days, and it is why a cord and not a river runs down
 * this page.
 *
 * Everything here is generated from a small number of parameters. Nothing is
 * drawn by eye. All geometry is expressed in a normalised 100-unit-wide
 * viewBox so a single definition serves the 44px rail on a phone and the 140px
 * central gutter on a desktop, scaling uniformly.
 */

/** Horizontal centre of the rail, in viewBox units. */
export const CX = 50;
/** How far each lane sits from the centre when the thread has parted. */
export const LANE_OFFSET = 30;

export const LANE_X = {
  both: CX,
  bride: CX - LANE_OFFSET,
  groom: CX + LANE_OFFSET,
} as const;

/** Lane position as a percentage, for positioning DOM elements on the rail. */
export const lanePercent = (lane: keyof typeof LANE_X) => `${LANE_X[lane]}%`;

export interface Segment {
  /** Height of this piece in viewBox units; width is always 100. */
  height: number;
  paths: { d: string; lane: 'bride' | 'groom' | 'both' }[];
  /**
   * When two strands cross, the one named here is drawn last with a casing
   * beneath it, so the crossing reads as genuinely over-and-under rather than
   * as two lines that happen to overlap.
   */
  over?: 'bride' | 'groom';
}

/**
 * ONE BECOMES TWO — the families part for Wanaparthy and Vinukonda.
 * A symmetric pair of S-curves. The curve holds its vertical tangent at both
 * ends so it meets the straight runs above and below without a visible kink.
 */
export function split(height = 190): Segment {
  const h = height;
  const d = LANE_OFFSET;
  const arm = (dir: -1 | 1) =>
    `M ${CX} 0 C ${CX} ${h * 0.42} ${CX + dir * d} ${h * 0.5} ${CX + dir * d} ${h}`;
  return {
    height: h,
    paths: [
      { d: arm(-1), lane: 'bride' },
      { d: arm(1), lane: 'groom' },
    ],
  };
}

/**
 * TWO BECOME ONE — Edurukollu, the hour the families meet.
 *
 * The strands do not simply merge. Each crosses to the far side of the centre,
 * passes the other, and only then turns back to meet. That gives one true
 * crossing — woven, one over the other — followed by a knot. It is the only
 * place on the site where two lines touch, and it is the whole point of it.
 */
export function weave(height = 210): Segment {
  const h = height;
  const d = LANE_OFFSET;
  const reach = d * 0.5; // how far past centre each strand travels

  const arm = (dir: -1 | 1) =>
    [
      `M ${CX + dir * d} 0`,
      `C ${CX + dir * d} ${h * 0.2} ${CX - dir * reach} ${h * 0.26} ${CX - dir * reach} ${h * 0.5}`,
      `C ${CX - dir * reach} ${h * 0.74} ${CX} ${h * 0.82} ${CX} ${h}`,
    ].join(' ');

  return {
    height: h,
    paths: [
      { d: arm(-1), lane: 'bride' },
      { d: arm(1), lane: 'groom' },
    ],
    // The bride's family are the ones who walk out to receive, so theirs is
    // the strand that passes in front.
    over: 'bride',
  };
}

/**
 * THE JOURNEY — Wanaparthy to Vinukonda, the day after the wedding.
 * A single thread with a deliberate lateral drift: the celebration does not
 * merely continue, it moves. The gap in the middle is where the distance
 * marker sits.
 */
export function transit(height = 160): Segment {
  const h = height;
  return {
    height: h,
    paths: [
      {
        d: `M ${CX} 0 C ${CX} ${h * 0.3} ${CX + 9} ${h * 0.34} ${CX + 9} ${h * 0.5} C ${CX + 9} ${h * 0.66} ${CX} ${h * 0.7} ${CX} ${h}`,
        lane: 'both',
      },
    ],
  };
}

/**
 * THE ROAD — drawn in the empty lane on 25 August, when the groom's party is
 * not celebrating but driving. An interrupted line, because a journey is not a
 * ceremony and should not be dressed as one.
 */
export function road(height = 160): Segment {
  return {
    height,
    paths: [{ d: `M ${CX} 0 L ${CX} ${height}`, lane: 'both' }],
  };
}

/**
 * The finial that ends the thread — a kalash in outline, the vessel set at the
 * summit of every temple tower. Drawn on a 100-unit grid from the same
 * proportional rules as the rest: neck one third of the body, mouth one fifth
 * wider than the neck.
 */
export function kalash(): { height: number; body: string; neck: string; leaf: string } {
  return {
    height: 62,
    // Pot: a full curve resting on a narrow foot.
    body: `M ${CX - 15} 34 C ${CX - 15} 22 ${CX - 11} 17 ${CX} 17 C ${CX + 11} 17 ${CX + 15} 22 ${CX + 15} 34 C ${CX + 15} 46 ${CX + 9} 52 ${CX} 52 C ${CX - 9} 52 ${CX - 15} 46 ${CX - 15} 34 Z`,
    // Mouth and neck.
    neck: `M ${CX - 9} 17 L ${CX - 11} 10 L ${CX + 11} 10 L ${CX + 9} 17`,
    // The single mango leaf laid across the mouth.
    leaf: `M ${CX} 10 C ${CX - 7} 6 ${CX - 8} 0 ${CX} 0 C ${CX + 8} 0 ${CX + 7} 6 ${CX} 10 Z`,
  };
}
