import { useCallback, useMemo } from 'react';
import { Line3D, Points3D, Scene3D, Surface, type V3 } from '../../../components/three/Scene3D';
import { fmt } from '../../../lib/num';

type P = [number, number];
const ZMAX = 400;

/**
 * 3-D view for GDLab: the MSE bowl J(θ), the gradient-descent path on it, and on the floor the same
 * equal-loss contours and path as the 2-D panel, so the two views can be matched. Loaded on demand (three.js).
 */
export default function GDBowlScene({ J, path, opt, xd, yd, contours }: { J: (p: P) => number; path: P[]; opt: P; xd: P; yd: P; contours: P[][] }) {
  const f = useCallback((a: number, b: number) => J([a, b]), [J]);
  const floor = useMemo(() => contours.map((c) => c.map(([a, b]): V3 => [a, b, 0])), [contours]);
  const { onBowl, shadow } = useMemo(() => {
    const pts = path.filter((p) => Number.isFinite(p[0]) && Math.abs(p[0]) < 1e3);
    const step = Math.max(1, Math.ceil(pts.length / 400));
    const sub = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
    return { onBowl: sub.map(([a, b]): V3 => [a, b, J([a, b]) + 1.5]), shadow: sub.map(([a, b]): V3 => [a, b, 0]) };
  }, [path, J]);
  const cur = onBowl[onBowl.length - 1];
  return (
    <Scene3D
      domain={{ x: xd, y: yd, z: [0, ZMAX] }}
      labels={{ x: 'θ₀', y: 'θ₁', z: 'J(θ)' }}
      eye={[1.5, -1.6, 0.9]}
      legend={[
        { label: 'path of θ⁽ᵗ⁾ on the bowl', cls: 'ln-res' },
        { label: 'its shadow and the contours (as in the 2-D panel)', cls: 'contour' },
        { label: 'minimum θ̂', cls: 'mark-acc', shape: 'dot' },
      ]}
    >
      <Surface
        f={f}
        n={56}
        grid={10}
        colormap={{ min: 0, max: ZMAX }}
        opacity={0.88}
        tooltip={(a, b, z) => (
          <>
            θ₀ {fmt(a, 2)}, θ₁ {fmt(b, 2)}
            <br />J {fmt(z, 2)}
          </>
        )}
      />
      {floor.map((c, i) => (
        <Line3D key={i} points={c} color="--c-data" width={1} opacity={0.55} />
      ))}
      <Line3D points={shadow} color="--c-res" width={1.4} dashed opacity={0.8} />
      <Line3D points={onBowl} color="--c-res" width={3} />
      {cur && <Line3D points={[cur, [cur[0], cur[1], 0]]} color="--muted" width={1} dashed />}
      <Points3D points={[[opt[0], opt[1], J(opt) + 1.5]]} color="--accent" size={0.04} />
      {cur && <Points3D points={[cur]} color="--c-res" size={0.035} />}
    </Scene3D>
  );
}
