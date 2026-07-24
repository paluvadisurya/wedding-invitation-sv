/**
 * PULLI KOLAM — generated, not drawn.
 *
 * A kolam begins as a grid of dots (pulli) chalked on the ground at dawn. The
 * line is then walked around them in one unbroken stroke until every dot is
 * enclosed. In the interlaced kind — sikku kolam — the stroke behaves exactly
 * like a ball on a billiard table: it travels at forty-five degrees, reflects
 * off the edges of the grid, and eventually returns to where it began. Some
 * grids close in a single loop; others need several, and which is which is
 * decided by arithmetic, not by the person drawing.
 *
 * That is the whole algorithm below. The dots are placed, the reflected paths
 * are followed until they close, and the corners are rounded. Nothing is
 * hand-tuned, so changing `cols` and `rows` yields a different — but still
 * correct — kolam.
 */

export interface KolamOptions {
  /** Grid extent. Odd numbers give the symmetric kolams; try 4×4, 5×3, 7×5. */
  cols: number;
  rows: number;
  /** Distance between dots, in SVG units. */
  spacing?: number;
  /** Corner radius as a fraction of half a cell. 1 gives fully circular turns. */
  round?: number;
  padding?: number;
}

export interface Kolam {
  width: number;
  height: number;
  /** One `d` string per closed loop. Their count is a property of the grid. */
  loops: string[];
  /** The pulli themselves — the dots the loops are drawn around. */
  dots: { x: number; y: number }[];
}

/** Triangle wave on [0, k] with period 2k. This is the reflection. */
function reflect(t: number, k: number): number {
  const period = 2 * k;
  const s = ((t % period) + period) % period;
  return s <= k ? s : period - s;
}

/**
 * Where the trajectory strikes an exact corner of the grid, both coordinates
 * reflect on the same step and the line doubles straight back on itself. Left
 * alone that renders as a spike. A kolam drawn by hand turns there instead, in
 * a small round cap, so we substitute a three-point detour that the corner
 * rounding below resolves into exactly that turn.
 */
function capReversals(
  pts: { x: number; y: number }[],
  size: number,
): { x: number; y: number }[] {
  const n = pts.length;
  const out: { x: number; y: number }[] = [];

  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];

    const isReversal =
      Math.abs(next.x - prev.x) < 1e-6 && Math.abs(next.y - prev.y) < 1e-6;

    if (!isReversal) {
      out.push(cur);
      continue;
    }

    // Unit vector along the incoming edge, and its perpendicular.
    const len = Math.hypot(cur.x - prev.x, cur.y - prev.y) || 1;
    const ux = (cur.x - prev.x) / len;
    const uy = (cur.y - prev.y) / len;
    const nx = -uy;
    const ny = ux;
    const d = size;

    out.push(
      { x: cur.x - ux * d + nx * d, y: cur.y - uy * d + ny * d },
      { x: cur.x + ux * d * 0.35, y: cur.y + uy * d * 0.35 },
      { x: cur.x - ux * d - nx * d, y: cur.y - uy * d - ny * d },
    );
  }

  return out;
}

/**
 * Converts a closed polyline into a path whose corners are arcs. Each vertex
 * is cut back along both of its edges and bridged with a quadratic, which is
 * what gives a kolam its continuous, rope-like turn.
 */
function roundedLoop(pts: { x: number; y: number }[], radius: number): string {
  const n = pts.length;
  if (n < 3) return '';
  const parts: string[] = [];

  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];

    const inLen = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const outLen = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);

    const entry = {
      x: cur.x - ((cur.x - prev.x) / inLen) * r,
      y: cur.y - ((cur.y - prev.y) / inLen) * r,
    };
    const exit = {
      x: cur.x + ((next.x - cur.x) / outLen) * r,
      y: cur.y + ((next.y - cur.y) / outLen) * r,
    };

    parts.push(
      i === 0 ? `M ${entry.x.toFixed(2)} ${entry.y.toFixed(2)}` : `L ${entry.x.toFixed(2)} ${entry.y.toFixed(2)}`,
    );
    parts.push(`Q ${cur.x.toFixed(2)} ${cur.y.toFixed(2)} ${exit.x.toFixed(2)} ${exit.y.toFixed(2)}`);
  }

  parts.push('Z');
  return parts.join(' ');
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

export function generateKolam({
  cols,
  rows,
  spacing = 24,
  round = 1,
  // The round caps at the grid's corners reach outside the lattice, so the
  // default padding is exactly enough to contain them.
  padding = spacing * 0.55,
}: KolamOptions): Kolam {
  const half = spacing / 2;
  const period = lcm(2 * cols, 2 * rows);

  const loops: string[] = [];
  const claimed = new Set<string>();

  // Each starting offset traces one closed trajectory. Offsets already covered
  // by an earlier loop are skipped, so every edge of the figure is drawn once.
  for (let phase = 0; phase < 2 * cols; phase++) {
    const key0 = `${reflect(0 + phase, cols)},${reflect(0, rows)},${phase}`;
    if (claimed.has(key0)) continue;

    const pts: { x: number; y: number }[] = [];
    let closed = false;

    for (let t = 0; t < period; t++) {
      const i = reflect(t + phase, cols);
      const j = reflect(t, rows);
      const k = `${i},${j},${(t + phase) % (2 * cols)}`;
      if (t > 0 && k === key0) {
        closed = true;
        break;
      }
      claimed.add(k);
      pts.push({
        x: padding + i * spacing,
        y: padding + j * spacing,
      });
    }

    if (pts.length > 2) {
      loops.push(roundedLoop(capReversals(pts, half * 0.62), half * round));
    }
    if (!closed && loops.length > 8) break; // safety valve on absurd grids
  }

  // The pulli sit at the centre of every cell the line encloses — one dot per
  // eye of the weave. They are the reason the figure exists, so they are drawn
  // last, over the stroke, never under it.
  const dots: { x: number; y: number }[] = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      dots.push({
        x: padding + (i + 0.5) * spacing,
        y: padding + (j + 0.5) * spacing,
      });
    }
  }

  return {
    width: cols * spacing + padding * 2,
    height: rows * spacing + padding * 2,
    loops,
    dots,
  };
}
