import { useMemo, useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../../../components/Chart';
import { Readout, Segmented, Slider } from '../../../components/ui';
import { clamp, fmt, linspace, rng } from '../../../lib/num';

export type Kernel = 'box' | 'epan';
export const KERNELS: Record<Kernel, { label: string; K: (u: number) => number; radius: (h: number) => number }> = {
  box: { label: 'boxcar', K: (u) => (Math.abs(u) <= 0.5 ? 1 : 0), radius: (h) => h / 2 },
  epan: { label: 'Epanechnikov', K: (u) => (Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0), radius: (h) => h },
};

const f = (x: number) => Math.sin(4 * x);
const SD = Math.sqrt(1 / 3);
const GRID = linspace(0, 1, 201);
const HS = linspace(0.04, 1, 49);

function sample(seed: number) {
  const r = rng(seed);
  const X = Array.from({ length: 100 }, () => r.uniform());
  return { X, Y: X.map((x) => f(x) + SD * r.normal()) };
}

/** Normalised kernel weights at x0, or null if no observation gets positive weight. */
function weights(X: number[], x0: number, h: number, kernel: Kernel) {
  const a = X.map((x) => KERNELS[kernel].K(Math.abs(x - x0) / h));
  const tot = a.reduce((s, v) => s + v, 0);
  return tot > 0 ? a.map((v) => v / tot) : null;
}

function smooth(X: number[], Y: number[], x0: number, h: number, kernel: Kernel) {
  const w = weights(X, x0, h, kernel);
  return w ? w.reduce((s, wi, i) => s + wi * Y[i], 0) : NaN;
}

/** Mean squared distance from the true curve over the grid points where the estimate is defined. */
function curveError(X: number[], Y: number[], h: number, kernel: Kernel) {
  let s = 0;
  let n = 0;
  for (const x of GRID) {
    const v = smooth(X, Y, x, h, kernel);
    if (Number.isFinite(v)) {
      s += (v - f(x)) ** 2;
      n += 1;
    }
  }
  return n ? s / n : NaN;
}

/** The kernel smoother at work, drawn like the classic two-panel figure: move x₀, change the kernel and the bandwidth. */
export function KernelLab() {
  const [kernel, setKernel] = useState<Kernel>('box');
  const [h, setH] = useState(0.4);
  const [x0, setX0] = useState(0.5);
  const [seed, setSeed] = useState(4);
  const [drag, setDrag] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const { X, Y } = useMemo(() => sample(seed), [seed]);
  const w = weights(X, x0, h, kernel);
  const fx0 = smooth(X, Y, x0, h, kernel);
  const r = KERNELS[kernel].radius(h);
  const fit = GRID.map((x) => [x, smooth(X, Y, x, h, kernel)] as [number, number]);
  const used = w ? w.filter((v) => v > 0).length : 0;
  const wmax = w ? Math.max(...w) : 1;
  const sumW2 = w ? w.reduce((s, v) => s + v * v, 0) : NaN;
  const errCurve = useMemo(
    () => (['box', 'epan'] as Kernel[]).map((k) => HS.map((hh) => [hh, curveError(X, Y, hh, k)] as [number, number])),
    [X, Y],
  );
  const err = curveError(X, Y, h, kernel);
  const kShape = (s: { x: (v: number) => number; y: (v: number) => number; bottom: number }) => {
    const top = 1.25;
    const pts = linspace(x0 - r, x0 + r, 81).map((x) => {
      const k = KERNELS[kernel].K(Math.abs(x - x0) / h) / KERNELS[kernel].K(0);
      return `${s.x(x)},${s.bottom - (s.bottom - s.y(top)) * k}`;
    });
    return `M${s.x(x0 - r)},${s.bottom}L${pts.join('L')}L${s.x(x0 + r)},${s.bottom}Z`;
  };

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="kernel"
          options={[
            { value: 'box', label: 'boxcar  K(u) = 1{|u| ≤ ½}' },
            { value: 'epan', label: 'Epanechnikov  K(u) = ¾(1 − u²)1{|u| ≤ 1}' },
          ]}
          value={kernel}
          onChange={setKernel}
        />
        <button className="btn" onClick={() => setSeed((v) => v + 1)}>
          New sample
        </button>
      </div>
      <Chart
        W={680}
        H={380}
        x={[0, 1]}
        y={[-1.6, 1.8]}
        xLabel="x — drag to move the query x₀"
        yLabel="y"
        svgRef={ref}
        className="draggable"
        ariaLabel="Noisy observations of sin(4x), the kernel neighbourhood of the query and the fitted curve"
        onPointerDown={(e, s) => {
          ref.current?.setPointerCapture?.(e.pointerId);
          setDrag(true);
          if (ref.current) setX0(clamp(Math.round(s.ix(svgPoint(ref.current, e).x) * 200) / 200, 0, 1));
        }}
        onPointerMove={(e, s) => drag && ref.current && setX0(clamp(Math.round(s.ix(svgPoint(ref.current, e).x) * 200) / 200, 0, 1))}
        onPointerUp={() => setDrag(false)}
      >
        {(s) => (
          <>
            <path d={kShape(s)} className="sm-kernel" />
            <path d={pathOf(GRID.map((x) => [s.x(x), s.y(f(x))]))} className="sm-truth" />
            {X.map((x, i) => {
              const wi = w ? w[i] : 0;
              return wi > 0 ? (
                <circle key={i} cx={s.x(x)} cy={s.y(Y[i])} r={4.2} className="sm-sel" style={{ fillOpacity: 0.3 + (0.7 * wi) / wmax }} />
              ) : (
                <circle key={i} cx={s.x(x)} cy={s.y(Y[i])} r={3.8} className="sm-obs" />
              );
            })}
            <path d={pathOf(fit.map(([x, v]) => [s.x(x), s.y(v)]))} className="sm-fit" />
            <line x1={s.x(x0)} x2={s.x(x0)} y1={s.bottom} y2={Number.isFinite(fx0) ? s.y(fx0) : s.top} className="sm-line thin" />
            {Number.isFinite(fx0) && (
              <>
                <line x1={s.x(Math.max(0, x0 - r))} x2={s.x(Math.min(1, x0 + r))} y1={s.y(fx0)} y2={s.y(fx0)} className="sm-line" />
                <circle cx={s.x(x0)} cy={s.y(fx0)} r={6} className="sm-point" />
                <text x={s.x(x0) + 9} y={s.y(fx0) - 9} className="anno-strong">
                  f̂(x₀)
                </text>
              </>
            )}
          </>
        )}
      </Chart>
      <Legend
        items={[
          { label: 'blue: true f(x) = sin 4x', cls: 'sm-truth' },
          { label: 'grey: observations', cls: 'sm-obs', shape: 'dot' },
          { label: 'red: observations with positive weight', cls: 'sm-sel', shape: 'dot' },
          { label: 'yellow: kernel shape and support', cls: 'sm-kernel', shape: 'box' },
          { label: 'red line and point: f̂(x₀)', cls: 'sm-line' },
          { label: 'green: f̂ as x₀ sweeps across', cls: 'sm-fit' },
        ]}
      />
      <div className="lab-grid">
        <div className="controls">
          <Slider label="query x₀" value={x0} min={0} max={1} step={0.005} onChange={setX0} format={(v) => fmt(v, 3)} />
          <Slider label="bandwidth h (as written in K(‖Xᵢ − x₀‖ / h))" value={h} min={0.04} max={1} step={0.01} onChange={setH} format={(v) => fmt(v, 2)} />
          <Readout
            items={[
              { label: 'support radius', value: `${kernel === 'box' ? 'h/2' : 'h'} = ${fmt(r, 3)}` },
              { label: 'points used', value: String(used) },
              { label: 'f̂(x₀)', value: Number.isFinite(fx0) ? fmt(fx0, 4) : 'undefined (no points)', tone: 'accent' },
              { label: 'true f(x₀)', value: fmt(f(x0), 4) },
              { label: 'Σ wᵢ²  (noise var. = σ² Σ wᵢ²)', value: Number.isFinite(sumW2) ? fmt(sumW2, 4) : '—' },
            ]}
          />
        </div>
        <div>
          <Chart
            W={340}
            H={220}
            x={[0, 1]}
            y={[0, Math.max(...errCurve.flat().map((p) => (Number.isFinite(p[1]) ? p[1] : 0))) * 1.08]}
            xLabel="bandwidth h" yLabel="mean (f̂ − f)²" ariaLabel="Distance of the fitted curve from the truth against bandwidth">
            {(s) => (
              <>
                <path d={pathOf(errCurve[0].map(([hh, e]) => [s.x(hh), s.y(e)]))} className={kernel === 'box' ? 'sm-fit' : 'ln-ghost'} />
                <path d={pathOf(errCurve[1].map(([hh, e]) => [s.x(hh), s.y(e)]))} className={kernel === 'epan' ? 'sm-fit' : 'ln-ghost'} />
                <line x1={s.x(h)} x2={s.x(h)} y1={s.top} y2={s.bottom} className="ln-noise" />
                {Number.isFinite(err) && <circle cx={s.x(h)} cy={s.y(err)} r={5} className="sm-point" />}
              </>
            )}
          </Chart>
          <p className="small muted">How far the green curve is from the blue one, for every h (solid: current kernel; dashed: the other). Too small: noisy. Too large: flattened.</p>
        </div>
      </div>
    </div>
  );
}
