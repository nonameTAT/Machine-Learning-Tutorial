import { useMemo, useState } from 'react';
import { M } from '../../../components/Math';
import { Readout, Slider, Toggle } from '../../../components/ui';
import { lazy3D } from '../../../components/View3D';
import { fmt, lstsq } from '../../../lib/num';

const Scene = lazy3D(() => import('./ProjectionScene'));

/** The design used in the picture: m = 3 observations, an intercept column and x = (1, 2, 3). */
export const XS = [1, 2, 3];
type V3 = [number, number, number];
const fit = (t: number[]) => XS.map((x) => t[0] + t[1] * x) as V3;
const sq = (v: number[]) => v.reduce((s, a) => s + a * a, 0);
/** rounding noise like 4e-16 shown as 0 */
const f3 = (v: number) => fmt(Math.abs(v) < 1e-9 ? 0 : v, 3);

/** y in ℝ³, its projection ŷ onto the column space of X, and the residual e ⟂ that plane. */
export function ProjectionLab() {
  const [y, setY] = useState<V3>([3, 0.5, 2.5]);
  const [compare, setCompare] = useState(false);
  const [theta, setTheta] = useState<[number, number]>([0.5, 0.6]);

  const r = useMemo(() => {
    const th = lstsq(
      XS.map((x) => [1, x]),
      y,
    )!;
    const yhat = fit(th);
    const e = y.map((v, i) => v - yhat[i]) as V3;
    const other = fit(theta);
    return { th, yhat, e, other, eOther: y.map((v, i) => v - other[i]), gap: yhat.map((v, i) => v - other[i]) };
  }, [y, theta]);
  const setYi = (i: number) => (v: number) => setY((p) => p.map((a, k) => (k === i ? v : a)) as V3);

  return (
    <div className="lab-grid">
      <Scene height={460} y={y} yhat={r.yhat} other={compare ? r.other : null} />
      <div className="controls">
        <Slider label="y₁" value={y[0]} min={0} max={3.5} step={0.1} onChange={setYi(0)} />
        <Slider label="y₂" value={y[1]} min={0} max={3.5} step={0.1} onChange={setYi(1)} />
        <Slider label="y₃" value={y[2]} min={0} max={3.5} step={0.1} onChange={setYi(2)} />
        <Readout
          items={[
            { label: 'θ̂ = (θ̂₀, θ̂₁)', value: `${fmt(r.th[0], 3)}, ${fmt(r.th[1], 3)}` },
            { label: 'Xᵀe = (Σe, Σxe)', value: `${f3(r.e[0] + r.e[1] + r.e[2])}, ${f3(r.e.reduce((s, a, i) => s + a * XS[i], 0))}`, tone: 'accent' },
            { label: '‖e‖² (minimum SSE)', value: fmt(sq(r.e), 3) },
          ]}
        />
        <Toggle label="Compare with another θ" checked={compare} onChange={setCompare} />
        {compare && (
          <>
            <Slider label="θ₀" value={theta[0]} min={-2} max={4} step={0.05} onChange={(v) => setTheta([v, theta[1]])} />
            <Slider label="θ₁" value={theta[1]} min={-1.5} max={2} step={0.05} onChange={(v) => setTheta([theta[0], v])} />
            <button className="btn" onClick={() => setTheta([Number(r.th[0].toFixed(2)), Number(r.th[1].toFixed(2))])}>
              Move θ to θ̂
            </button>
            <Readout
              items={[
                { label: '‖y − Xθ‖² (its SSE)', value: fmt(sq(r.eOther), 3), tone: 'accent' },
                { label: '‖e‖² + ‖X(θ̂ − θ)‖²', value: fmt(sq(r.e) + sq(r.gap), 3) },
              ]}
            />
          </>
        )}
        <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
          One axis per observation. The columns of <M t="X" /> are <M t="\mathbf 1 = (1,1,1)" /> and <M t="\bx = (1,2,3)" />; every prediction{' '}
          <M t="X\theta" /> lies in the plane they span.
        </p>
      </div>
    </div>
  );
}
