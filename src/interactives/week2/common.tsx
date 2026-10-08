import type { PointerEvent as RPointerEvent } from 'react';
import type { Scales } from '../../components/Chart';
import type { Label } from '../../lib/classify';

// Shared pieces for the week 2 labs. Classes are told apart by shape as well as colour:
// positive (class 1) = circle, negative (class 0) = square.

export function ClassPt({
  cx,
  cy,
  y,
  r = 5.5,
  className = '',
  onPointerDown,
}: {
  cx: number;
  cy: number;
  y: Label;
  r?: number;
  className?: string;
  onPointerDown?: (e: RPointerEvent<SVGElement>) => void;
}) {
  if (y === 1) return <circle cx={cx} cy={cy} r={r} className={`pt pos ${className}`} onPointerDown={onPointerDown} />;
  const h = r * 0.9;
  return <rect x={cx - h} y={cy - h} width={2 * h} height={2 * h} rx={1.5} className={`pt neg ${className}`} onPointerDown={onPointerDown} />;
}

export const CLASS_LEGEND = [
  { label: 'positive (y = 1)', cls: 'pt pos', shape: 'dot' as const },
  { label: 'negative (y = 0)', cls: 'pt neg', shape: 'box' as const },
];

/** Predicted label on an nx × ny grid of cell centres (row-major, top row first). */
export function labelGrid(xd: [number, number], yd: [number, number], nx: number, ny: number, f: (x: number, y: number) => Label | null) {
  const out: (Label | null)[] = [];
  for (let j = 0; j < ny; j++) {
    const y = yd[1] - ((j + 0.5) * (yd[1] - yd[0])) / ny;
    for (let i = 0; i < nx; i++) out.push(f(xd[0] + ((i + 0.5) * (xd[1] - xd[0])) / nx, y));
  }
  return out;
}

/** Shades each grid cell by its predicted class. Opacity is applied once to the group, so overlapping cell edges leave no seams. */
export function Regions({ s, grid, nx, ny }: { s: Scales; grid: (Label | null)[]; nx: number; ny: number }) {
  const cw = (s.right - s.left) / nx;
  const ch = (s.bottom - s.top) / ny;
  return (
    <g aria-hidden opacity={0.13} shapeRendering="crispEdges">
      {grid.map((v, idx) =>
        v === null ? null : (
          <rect
            key={idx}
            x={s.left + (idx % nx) * cw}
            y={s.top + Math.floor(idx / nx) * ch}
            width={cw + 0.6}
            height={ch + 0.6}
            fill={v === 1 ? 'var(--c-pos)' : 'var(--c-neg)'}
          />
        ),
      )}
    </g>
  );
}

/**
 * Marching squares: line segments where a function sampled on a grid crosses `level`.
 * vals[j][i] is the value at (xs[i], ys[j]).
 */
export function contourSegments(vals: number[][], xs: number[], ys: number[], level: number): [number, number, number, number][] {
  const segs: [number, number, number, number][] = [];
  const lerp = (a: number, b: number, va: number, vb: number) => a + ((level - va) / (vb - va)) * (b - a);
  for (let j = 0; j < ys.length - 1; j++) {
    for (let i = 0; i < xs.length - 1; i++) {
      const v00 = vals[j][i];
      const v10 = vals[j][i + 1];
      const v01 = vals[j + 1][i];
      const v11 = vals[j + 1][i + 1];
      const pts: [number, number][] = [];
      if (v00 < level !== v10 < level) pts.push([lerp(xs[i], xs[i + 1], v00, v10), ys[j]]);
      if (v10 < level !== v11 < level) pts.push([xs[i + 1], lerp(ys[j], ys[j + 1], v10, v11)]);
      if (v01 < level !== v11 < level) pts.push([lerp(xs[i], xs[i + 1], v01, v11), ys[j + 1]]);
      if (v00 < level !== v01 < level) pts.push([xs[i], lerp(ys[j], ys[j + 1], v00, v01)]);
      if (pts.length >= 2) segs.push([pts[0][0], pts[0][1], pts[1][0], pts[1][1]]);
      if (pts.length === 4) segs.push([pts[2][0], pts[2][1], pts[3][0], pts[3][1]]);
    }
  }
  return segs;
}

/** An arrow from (x1, y1) to (x2, y2) in pixel coordinates. */
export function Arrow({ x1, y1, x2, y2, cls = 'ln-w', head = 'head-w' }: { x1: number; y1: number; x2: number; y2: number; cls?: string; head?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const L = 10;
  const p1 = [x2 - L * Math.cos(a - 0.4), y2 - L * Math.sin(a - 0.4)];
  const p2 = [x2 - L * Math.cos(a + 0.4), y2 - L * Math.sin(a + 0.4)];
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2 - 6 * Math.cos(a)} y2={y2 - 6 * Math.sin(a)} className={cls} />
      <polygon points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`} className={head} />
    </g>
  );
}

/** Format a probability-like value, showing “undefined” for 0/0. */
export const pct = (v: number, digits = 3) => (Number.isNaN(v) ? 'undefined' : v.toFixed(digits));
