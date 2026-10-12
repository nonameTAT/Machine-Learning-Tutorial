import { useRef, useState } from 'react';
import { Chart, Legend, svgPoint } from '../../../components/Chart';
import { Readout, Segmented } from '../../../components/ui';
import { clamp, fmt, ols1d } from '../../../lib/num';

const X = [1, 2, 3, 4, 5, 6, 7, 8];
const CLEAN = [2.6, 3.9, 4.2, 5.3, 6.1, 6.6, 7.8, 8.4];
type Preset = 'clean' | 'end' | 'middle';
const PRESETS: Record<Preset, { label: string; y: number[] }> = {
  clean: { label: 'no outlier', y: CLEAN },
  end: { label: 'outlier at the end (x = 8)', y: CLEAN.map((v, i) => (i === 7 ? 20 : v)) },
  middle: { label: 'outlier in the middle (x = 4)', y: CLEAN.map((v, i) => (i === 3 ? 20 : v)) },
};

/** Least absolute deviations: some best line passes through two data points, so trying every pair is exact for small data. */
function lad(x: number[], y: number[]) {
  let best = { b0: 0, b1: 0, sae: Infinity };
  for (let i = 0; i < x.length; i++)
    for (let j = i + 1; j < x.length; j++) {
      if (x[i] === x[j]) continue;
      const b1 = (y[j] - y[i]) / (x[j] - x[i]);
      const b0 = y[i] - b1 * x[i];
      const sae = x.reduce((s, xv, k) => s + Math.abs(y[k] - b0 - b1 * xv), 0);
      if (sae < best.sae - 1e-9) best = { b0, b1, sae };
    }
  return best;
}

/** Squared versus absolute error with one point dragged far away: which line follows it, and how hard each point pulls. */
export function OutlierLab() {
  const [ys, setYs] = useState(PRESETS.end.y);
  const [preset, setPreset] = useState<Preset | 'custom'>('end');
  const [drag, setDrag] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const ols = ols1d(X, ys)!;
  const l1 = lad(X, ys);
  const olsClean = ols1d(X, CLEAN)!;
  const l1Clean = lad(X, CLEAN);
  const eSq = ys.map((y, i) => y - ols.b0 - ols.b1 * X[i]);
  const eAbs = ys.map((y, i) => y - l1.b0 - l1.b1 * X[i]);
  // |∂loss/∂ŷⱼ|: 2|e| for squared error; 1 for absolute error (a point exactly on the line pulls with any force in [−1, 1])
  const pullSq = eSq.map((e) => 2 * Math.abs(e));
  const pullAbs: number[] = eAbs.map((e) => (Math.abs(e) > 1e-9 ? 1 : 0));
  const shareSq = pullSq.map((p) => p / pullSq.reduce((a, b) => a + b, 0));
  const shareAbs = pullAbs.map((p) => p / Math.max(1, pullAbs.reduce((a, b) => a + b, 0)));
  const far = eSq.reduce((b, e, i) => (Math.abs(e) > Math.abs(eSq[b]) ? i : b), 0);
  const line = (b0: number, b1: number) => [0, 9].map((x) => [x, b0 + b1 * x] as const);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="data"
          options={[...(Object.keys(PRESETS) as Preset[]).map((p) => ({ value: p, label: PRESETS[p].label })), ...(preset === 'custom' ? [{ value: 'custom' as const, label: 'your data' }] : [])]}
          value={preset}
          onChange={(p) => {
            if (p === 'custom') return;
            setPreset(p);
            setYs(PRESETS[p].y);
          }}
        />
      </div>
      <div className="lab-grid">
        <div>
          <Chart
            W={540}
            H={340}
            x={[0, 9]}
            y={[0, 22]}
            xLabel="x — drag any point up or down"
            yLabel="y"
            svgRef={ref}
            className="draggable"
            ariaLabel="Eight points with a least-squares line and a least-absolute-error line"
            onPointerMove={(e, s) => {
              if (drag === null || !ref.current) return;
              const v = Math.round(clamp(s.iy(svgPoint(ref.current, e).y), 0, 22) * 10) / 10;
              setPreset('custom');
              setYs(ys.map((u, i) => (i === drag ? v : u)));
            }}
            onPointerUp={() => setDrag(null)}
          >
            {(s) => {
              const seg = (pts: readonly (readonly [number, number])[], cls: string, dash?: string) => (
                <line x1={s.x(pts[0][0])} y1={s.y(pts[0][1])} x2={s.x(pts[1][0])} y2={s.y(pts[1][1])} className={cls} strokeDasharray={dash} opacity={dash ? 0.45 : 1} />
              );
              return (
                <>
                  {seg(line(olsClean.b0, olsClean.b1), 'ln-fit', '5 5')}
                  {seg(line(l1Clean.b0, l1Clean.b1), 'ln-alt', '5 5')}
                  {seg(line(ols.b0, ols.b1), 'ln-fit')}
                  {seg(line(l1.b0, l1.b1), 'ln-alt')}
                  {X.map((x, i) => (
                    <circle
                      key={i}
                      cx={s.x(x)}
                      cy={s.y(ys[i])}
                      r={drag === i ? 8 : 6}
                      className={`pt drag ${i === far && Math.abs(eSq[i]) > 4 ? 'hi' : ''}`}
                      onPointerDown={(e) => {
                        (e.target as Element).setPointerCapture?.(e.pointerId);
                        setDrag(i);
                      }}
                    />
                  ))}
                </>
              );
            }}
          </Chart>
          <Legend
            items={[
              { label: 'least squares (minimise Σ e²)', cls: 'ln-fit' },
              { label: 'least absolute error (minimise Σ |e|)', cls: 'ln-alt' },
              { label: 'faint dashed: the same fits on the clean data', cls: 'ln-ghost', shape: 'dash' },
            ]}
          />
        </div>
        <div className="controls">
          <div className="panel-title">Each point’s share of the total pull on its line</div>
          <Chart W={300} H={210} x={[0.4, 8.6]} y={[0, 1]} xTicks={X} yLabel="share of pull" ariaLabel="How strongly each point pulls on each fitted line">
            {(s) => (
              <>
                {X.map((x, i) => (
                  <g key={i}>
                    <rect x={s.x(x) - 9} y={s.y(shareSq[i])} width={8} height={s.y(0) - s.y(shareSq[i])} fill="var(--c-fit)" />
                    <rect x={s.x(x) + 1} y={s.y(shareAbs[i])} width={8} height={s.y(0) - s.y(shareAbs[i])} fill="var(--c-alt)" />
                  </g>
                ))}
              </>
            )}
          </Chart>
          <p className="small muted" style={{ margin: 0 }}>
            Pull = |∂loss/∂ŷⱼ|: 2|eⱼ| under squared error, so it grows with the residual; 1 under absolute error for every point off the line, however far.
          </p>
          <Readout
            items={[
              { label: 'least-squares slope', value: `${fmt(olsClean.b1, 3)} → ${fmt(ols.b1, 3)}` },
              { label: 'absolute-error slope', value: `${fmt(l1Clean.b1, 3)} → ${fmt(l1.b1, 3)}` },
              { label: `point x = ${X[far]}: share of pull`, value: `${fmt(shareSq[far], 2)} vs ${fmt(shareAbs[far], 2)}`, tone: 'accent' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
