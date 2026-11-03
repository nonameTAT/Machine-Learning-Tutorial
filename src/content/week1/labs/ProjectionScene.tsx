import { Arrow3D, Line3D, Patch3D, Points3D, Scene3D, type V3 } from '../../../components/three/Scene3D';
import { XS } from './ProjectionLab';

const R: [number, number] = [-1, 3.5]; // the same range on every axis keeps right angles right
const ONES: V3 = [1, 1, 1];
const X: V3 = [XS[0], XS[1], XS[2]];
const O: V3 = [0, 0, 0];
const add = (a: V3, b: V3, k = 1): V3 => [a[0] + k * b[0], a[1] + k * b[1], a[2] + k * b[2]];
const sub = (a: V3, b: V3): V3 => add(a, b, -1);
const norm = (a: V3) => Math.hypot(...a);
const unitv = (a: V3): V3 => {
  const n = norm(a);
  return [a[0] / n, a[1] / n, a[2] / n];
};
// a big patch of span{1, x}; the scene cuts it off at the box
const PLANE: V3[] = [
  [-12, -5],
  [12, -5],
  [12, 5],
  [-12, 5],
].map(([s, t]) => add(add(O, ONES, s), X, t));

/** 3-D view for ProjectionLab. Loaded on demand (three.js). */
export default function ProjectionScene({ y, yhat, other }: { y: V3; yhat: V3; other: V3 | null }) {
  const e = sub(y, yhat);
  // right-angle mark at ŷ: one side along e, the other along the plane
  const u = unitv(norm(yhat) > 0.3 ? sub(O, yhat) : ONES);
  const showCorner = norm(e) > 0.4;
  const v = showCorner ? unitv(e) : u;
  const d = 0.25;
  const eHat = norm(e) > 1e-6 ? unitv(e) : ([0, 0, 1] as V3);
  const corner: V3[] = [add(yhat, v, d), add(add(yhat, v, d), u, d), add(yhat, u, d)];
  const nudge = (p: V3, k = 0.22): V3 => add(p, [0, 0, k]);
  return (
    <Scene3D
      domain={{ x: R, y: R, z: R }}
      labels={{ x: 'observation 1', y: 'observation 2', z: 'observation 3' }}
      // perpendicular to (1, 1, 1), so the vectors fan out, and 50° off the plane's normal, so e is seen nearly full length
      eye={[-0.32, -0.49, 0.81]}
      legend={[
        { label: 'column space of X (all Xθ)', cls: 'sw-fit', shape: 'box' },
        { label: 'y', cls: 'ln-data' },
        { label: 'ŷ = Xθ̂', cls: 'ln-fit' },
        { label: 'e = y − ŷ', cls: 'ln-res' },
        ...(other ? [{ label: 'another Xθ', cls: 'ln-alt' }] : []),
      ]}
      notes={[
        { at: nudge(ONES), text: '1', color: '--ink-soft' },
        { at: nudge(X), text: 'x', color: '--ink-soft' },
        { at: nudge(y), text: 'y', color: '--c-data' },
        { at: add(yhat, eHat, -0.28), text: 'ŷ', color: '--c-fit' },
        { at: add(add(yhat, e, 0.5), u, -0.22), text: 'e', color: '--c-res' },
        ...(other ? [{ at: add(other, [0, 0, -0.3]), text: 'Xθ', color: '--c-alt' }] : []),
      ]}
    >
      <Patch3D corners={PLANE} color="--c-fit" opacity={0.22} edges={false} />
      <Arrow3D from={O} to={ONES} color="--ink-soft" width={2} />
      <Arrow3D from={O} to={X} color="--ink-soft" width={2} />
      <Arrow3D from={O} to={y} color="--c-data" width={3} />
      <Arrow3D from={O} to={yhat} color="--c-fit" width={3} />
      {norm(e) > 0.05 && <Arrow3D from={yhat} to={y} color="--c-res" width={2.5} dashed />}
      {showCorner && <Line3D points={corner} color="--ink-soft" width={1.5} />}
      {other && (
        <>
          <Arrow3D from={O} to={other} color="--c-alt" width={2} dashed />
          <Line3D points={[other, y]} color="--c-alt" width={2} dashed />
          <Line3D points={[other, yhat]} color="--c-alt" width={1} opacity={0.6} />
        </>
      )}
      <Points3D points={[O]} color="--ink" size={0.03} />
    </Scene3D>
  );
}
