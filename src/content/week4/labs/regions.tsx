import type { Scales } from '../../../components/Chart';
import { ClassPt } from '../../../components/chartParts';
import type { Label } from '../../../lib/classify';
import { rng } from '../../../lib/num';
import type { CNode } from '../../../lib/tree';

// Shared pieces for the labs that grow axis-parallel trees on two numeric features in [0, 1]².

export interface LeafRect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  node: CNode;
}

/** The rectangle of every leaf: a left child gets x_f ≤ t, a right child x_f > t. */
export function leafRects(n: CNode, x0: number, x1: number, y0: number, y1: number): LeafRect[] {
  if (!n.split) return [{ x0, x1, y0, y1, node: n }];
  const { f, t, left, right } = n.split;
  return f === 0
    ? [...leafRects(left, x0, t, y0, y1), ...leafRects(right, t, x1, y0, y1)]
    : [...leafRects(left, x0, x1, y0, t), ...leafRects(right, x0, x1, t, y1)];
}

/** Each leaf drawn as its own rectangle, tinted by the leaf's prediction (blue = class 1). */
export function LeafRegions({ s, tree }: { s: Scales; tree: CNode }) {
  return (
    <g>
      {leafRects(tree, s.xd[0], s.xd[1], s.yd[0], s.yd[1]).map((r) => (
        <rect
          key={r.node.id}
          x={s.x(r.x0)}
          y={s.y(r.y1)}
          width={s.x(r.x1) - s.x(r.x0)}
          height={s.y(r.y0) - s.y(r.y1)}
          className={`leaf-rect ${r.node.pred === 1 ? 'rg-pos' : 'rg-neg'}`}
        />
      ))}
    </g>
  );
}

export function Points({ s, X, y, hollow = false, r = 4.2 }: { s: Scales; X: number[][]; y: number[]; hollow?: boolean; r?: number }) {
  return (
    <g>
      {X.map((x, i) => (
        <ClassPt key={i} cx={s.x(x[0])} cy={s.y(x[1])} y={y[i] as Label} r={r} className={hollow ? 'hollow' : ''} />
      ))}
    </g>
  );
}

export type Shape = 'wavy' | 'diagonal' | 'xor';

/** The noiseless rule for each shape: class 1 above the curve, on the diagonal's upper side, or in the off-diagonal quadrants. */
export function truth(shape: Shape, a: number, b: number): Label {
  if (shape === 'diagonal') return b > a ? 1 : 0;
  if (shape === 'xor') return a > 0.5 !== b > 0.5 ? 1 : 0;
  return b > wavy(a) ? 1 : 0;
}
export const wavy = (a: number) => 0.5 + 0.22 * Math.sin(2 * Math.PI * a - 0.5);

/** n points uniform on [0, 1]², labelled by the shape and then flipped with probability `noise`. */
export function sample2d(shape: Shape, n: number, seed: number, noise: number) {
  const r = rng(seed);
  const X: number[][] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = r.uniform();
    const b = r.uniform();
    const c = truth(shape, a, b);
    X.push([a, b]);
    y.push(r.uniform() < noise ? 1 - c : c);
  }
  return { X, y };
}
