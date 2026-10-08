import { useRef, useState } from 'react';
import { Chart, Legend, svgPoint } from '../components/Chart';
import { M } from '../components/Math';
import { Readout, Slider, Toggle } from '../components/ui';
import { clamp, fmt, lineTex, linspace, mean, ols1d } from '../lib/num';

// The recurring 5-point example; OLS fit is ŷ = 15 − x.
export const EX_X = [3, 6, 7, 8, 11];
export const EX_Y = [13, 8, 11, 2, 6];
const ORIGINAL: [number, number][] = EX_X.map((x, i) => [x, EX_Y[i]]);

export function ResidualLab() {
  const [pts, setPts] = useState<[number, number][]>(ORIGINAL);
  const [t0, setT0] = useState(8);
  const [t1, setT1] = useState(0);
  const [squares, setSquares] = useState(true);
  const [showOls, setShowOls] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const fit = ols1d(xs, ys);
  const orig = ols1d(EX_X, EX_Y)!;
  const moved = pts.some((p, i) => p[0] !== ORIGINAL[i][0] || p[1] !== ORIGINAL[i][1]);
  const res = pts.map(([x, y]) => y - (t0 + t1 * x));
  const sse = res.reduce((s, e) => s + e * e, 0);
  const sumE = res.reduce((s, e) => s + e, 0);
  const olsSse = fit ? pts.reduce((s, [x, y]) => s + (y - fit.b0 - fit.b1 * x) ** 2, 0) : NaN;
  const outlierOn = pts[4][1] === EX_Y[4] + 10 && pts[4][0] === EX_X[4];

  const snap = () => {
    if (!fit) return;
    setT0(Number(fit.b0.toFixed(3)));
    setT1(Number(fit.b1.toFixed(3)));
  };

  return (
    <div className="lab-grid">
      <div>
        <Chart
          W={560}
          H={380}
          x={[0, 14]}
          y={[-5, 25]}
          xLabel="x"
          yLabel="y"
          svgRef={svgRef}
          className="draggable"
          ariaLabel="Scatter plot with an adjustable line and residuals"
          onPointerMove={(e, s) => {
            if (drag === null || !svgRef.current) return;
            const p = svgPoint(svgRef.current, e);
            const nx = Math.round(clamp(s.ix(p.x), 0.5, 13.5) * 10) / 10;
            const ny = Math.round(clamp(s.iy(p.y), -4.5, 24.5) * 10) / 10;
            setPts((prev) => prev.map((q, i) => (i === drag ? [nx, ny] : q)));
          }}
          onPointerUp={() => setDrag(null)}
        >
          {(s) => {
            const line = (b0: number, b1: number, cls: string) => (
              <line x1={s.x(0)} x2={s.x(14)} y1={s.y(b0)} y2={s.y(b0 + b1 * 14)} className={cls} />
            );
            return (
              <>
                {squares &&
                  pts.map(([x, y], i) => {
                    const yh = t0 + t1 * x;
                    const side = Math.abs(s.y(y) - s.y(yh));
                    const left = s.x(x) + side > s.right;
                    return <rect key={`sq${i}`} className="sq-res" x={left ? s.x(x) - side : s.x(x)} y={Math.min(s.y(y), s.y(yh))} width={side} height={side} />;
                  })}
                {moved && line(orig.b0, orig.b1, 'ln-ghost')}
                {showOls && fit && line(fit.b0, fit.b1, 'ln-alt')}
                {line(t0, t1, 'ln-fit')}
                {pts.map(([x, y], i) => (
                  <line key={`r${i}`} x1={s.x(x)} x2={s.x(x)} y1={s.y(y)} y2={s.y(t0 + t1 * x)} className="ln-res" />
                ))}
                {pts.map(([x, y], i) => (
                  <circle
                    key={`p${i}`}
                    cx={s.x(x)}
                    cy={s.y(y)}
                    r={drag === i ? 9 : 7}
                    className="pt drag"
                    onPointerDown={(e) => {
                      (e.target as Element).setPointerCapture?.(e.pointerId);
                      setDrag(i);
                    }}
                  />
                ))}
                <circle cx={s.x(mean(xs))} cy={s.y(mean(ys))} r={4} className="mark-acc" />
              </>
            );
          }}
        </Chart>
        <Legend
          items={[
            { label: 'your line', cls: 'ln-fit' },
            { label: 'residual eⱼ', cls: 'ln-res' },
            { label: 'eⱼ² as area', cls: 'sq-res', shape: 'box' },
            ...(showOls ? [{ label: 'OLS line', cls: 'ln-alt' }] : []),
            ...(moved ? [{ label: 'OLS on original data', cls: 'ln-ghost', shape: 'dash' as const }] : []),
            { label: 'centroid (x̄, ȳ)', cls: 'mark-acc', shape: 'dot' as const },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label={<M t="\theta_0" />} value={t0} min={-5} max={25} step={0.05} onChange={setT0} format={(v) => fmt(v, 2)} />
        <Slider label={<M t="\theta_1" />} value={t1} min={-3} max={2} step={0.01} onChange={setT1} format={(v) => fmt(v, 2)} />
        <Readout
          items={[
            { label: 'Σ eⱼ', value: fmt(sumE, 2) },
            { label: 'SSE = Σ eⱼ²', value: fmt(sse, 2), tone: 'accent' },
            { label: 'MSE = SSE / 5', value: fmt(sse / 5, 2) },
            { label: 'best possible SSE', value: fmt(olsSse, 2) },
          ]}
        />
        <div className="btn-row">
          <button className="btn btn-primary" onClick={snap}>
            Snap to least squares
          </button>
          <button
            className="btn"
            onClick={() => setPts((p) => p.map((q, i) => (i === 4 ? [EX_X[4], outlierOn ? EX_Y[4] : EX_Y[4] + 10] : q)))}
          >
            {outlierOn ? 'Remove' : 'Add'} +10 error at x = 11
          </button>
          <button className="btn btn-ghost" onClick={() => setPts(ORIGINAL)} disabled={!moved}>
            Reset points
          </button>
        </div>
        <Toggle label="Show squared residuals" checked={squares} onChange={setSquares} />
        <Toggle label="Show OLS line" checked={showOls} onChange={setShowOls} />
        {fit && (
          <p className="small muted" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
            OLS for current points: <M t={lineTex(fit.b0, fit.b1)} />. Drag points to
            move them.
          </p>
        )}
      </div>
    </div>
  );
}

/** Static comparison of |e| and e² as penalty shapes. */
export function LossShapes() {
  const es = linspace(-4, 4, 161);
  return (
    <div>
      <Chart W={520} H={250} x={[-4, 4]} y={[0, 9]} xLabel="residual e = y − ŷ" yLabel="penalty">
        {(s) => (
          <>
            <path className="ln-data" d={es.map((e, i) => `${i ? 'L' : 'M'}${s.x(e)},${s.y(Math.abs(e))}`).join('')} />
            <path className="ln-res" fill="none" strokeWidth={2.6} d={es.map((e, i) => `${i ? 'L' : 'M'}${s.x(e)},${s.y(Math.min(e * e, 9.5))}`).join('')} />
            <text x={s.x(2.95)} y={s.y(8.3)} className="anno">
              e²
            </text>
            <text x={s.x(3.3)} y={s.y(3.8)} className="anno">
              |e|
            </text>
          </>
        )}
      </Chart>
      <Legend
        items={[
          { label: 'absolute error |e|', cls: 'ln-data' },
          { label: 'squared error e²', cls: 'ln-res' },
        ]}
      />
    </div>
  );
}
