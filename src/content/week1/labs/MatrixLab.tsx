import { useMemo, useState } from 'react';
import { M } from '../../../components/Math';
import { lazy3D } from '../../../components/View3D';
import { Readout, Slider, Toggle } from '../../../components/ui';
import { fmt, lstsq, rng } from '../../../lib/num';

const TRUE = { b0: -95, bh: 0.55, bb: 4.2 };
const PlaneScene = lazy3D(() => import('./PlaneFitScene'));

/** Weight from height and frame size: a plane of best fit you can rotate. */
export function PlaneFit3D() {
  const [seed, setSeed] = useState(4);
  const [noise, setNoise] = useState(4);
  const [showRes, setShowRes] = useState(true);
  const [open, setOpen] = useState(false);

  const { h, b, w, theta } = useMemo(() => {
    const r = rng(seed);
    const m = 40;
    const h = Array.from({ length: m }, () => r.range(150, 195));
    const b = h.map((hi) => 16.5 + 0.06 * (hi - 172) + 0.9 * r.normal());
    const w = h.map((hi, i) => TRUE.b0 + TRUE.bh * hi + TRUE.bb * b[i] + noise * r.normal());
    const theta = lstsq(
      h.map((hi, i) => [1, hi, b[i]]),
      w,
    )!;
    return { h, b, w, theta };
  }, [seed, noise]);

  return (
    <div className="lab-grid">
      <div>
        {open ? (
          <PlaneScene height={430} h={h} b={b} w={w} theta={theta} showRes={showRes} />
        ) : (
          <div className="plot-placeholder">
            <button className="btn btn-primary" onClick={() => setOpen(true)}>
              Load the 3-D view
            </button>
            <p className="small muted">Loaded on demand. Drag to rotate, scroll to zoom, hover a point for its values.</p>
          </div>
        )}
      </div>
      <div className="controls">
        <Slider label="noise std. dev. (kg)" value={noise} min={0} max={12} step={0.5} onChange={setNoise} />
        <Toggle label="Show residuals" checked={showRes} onChange={setShowRes} />
        <button className="btn" onClick={() => setSeed((s) => s + 1)}>
          New sample of 40 people
        </button>
        <Readout
          items={[
            { label: 'θ̂₀ (true −95)', value: fmt(theta[0], 2) },
            { label: 'θ̂_h (true 0.55)', value: fmt(theta[1], 3), tone: 'accent' },
            { label: 'θ̂_b (true 4.2)', value: fmt(theta[2], 3), tone: 'accent' },
          ]}
        />
        <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
          Model <M t="\hat w = \theta_0 + \theta_h h + \theta_b b" />, fitted by <M t="\hat\theta = (X\T X)^{-1}X\T\by" /> with rows{' '}
          <M t="(1, h_j, b_j)" />. Residuals are vertical (along w). Resample to see how much the estimates move — more noise, more movement.
        </p>
      </div>
    </div>
  );
}
