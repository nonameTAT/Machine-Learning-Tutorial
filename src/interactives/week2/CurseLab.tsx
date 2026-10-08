import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { Readout, Slider, Toggle } from '../../components/ui';
import { fmt, rng, type Vec } from '../../lib/num';
import { euclid, loocvError, type Label } from '../../lib/classify';

const DIMS = [1, 2, 3, 5, 10, 20, 50, 100, 200, 500];
const NPTS = 300;
const BINS = 24;

/** Distances from a random query to 300 uniform points in [0, 1]^d. */
function distancesIn(d: number) {
  const r = rng(100 + d);
  const q = Array.from({ length: d }, () => r.uniform());
  return Array.from({ length: NPTS }, () => euclid(Array.from({ length: d }, () => r.uniform()), q));
}

export function ConcentrationLab() {
  const [di, setDi] = useState(1);
  const all = useMemo(() => DIMS.map((d) => distancesIn(d)), []);
  const stats = all.map((ds) => {
    const lo = Math.min(...ds);
    const hi = Math.max(...ds);
    return { lo, hi, contrast: (hi - lo) / lo };
  });
  const ds = all[di];
  const { lo, hi } = stats[di];
  const counts = new Array(BINS).fill(0);
  ds.forEach((v) => counts[Math.min(BINS - 1, Math.floor((v / hi) * BINS))]++);
  const cMax = Math.max(...counts);
  const lx = (d: number) => Math.log10(d);
  return (
    <div>
      <div className="lab-grid even">
        <div>
          <div className="panel-title">Distances to the query, as a fraction of the largest</div>
          <Chart W={420} H={250} x={[0, 1]} y={[0, cMax * 1.1]} xLabel="distance / max distance" yLabel="count" ariaLabel="Histogram of distances">
            {(s) => (
              <>
                {counts.map((c, b) => (
                  <rect key={b} x={s.x(b / BINS) + 1} width={s.x(1 / BINS) - s.x(0) - 2} y={s.y(c)} height={s.y(0) - s.y(c)} className="bar-pos" />
                ))}
                <line x1={s.x(lo / hi)} x2={s.x(lo / hi)} y1={s.top} y2={s.bottom} className="ln-res" strokeDasharray="4 3" />
              </>
            )}
          </Chart>
          <Legend items={[{ label: 'nearest point', cls: 'ln-res', shape: 'dash' }]} />
        </div>
        <div>
          <div className="panel-title">Relative contrast (max − min) / min</div>
          <Chart
            W={420}
            H={250}
            x={[0, lx(500)]}
            y={[Math.log10(Math.min(...stats.map((t) => t.contrast))) - 0.3, Math.log10(Math.max(...stats.map((t) => t.contrast))) + 0.3]}
            xTicks={[0, 1, 2]}
            xTickFormat={(t) => String(10 ** t)}
            yTickFormat={(t) => fmt(10 ** t, 2)}
            xLabel="dimension d (log scale)"
            yLabel="contrast (log scale)"
            ariaLabel="Relative contrast against dimension"
          >
            {(s) => (
              <>
                <path d={pathOf(DIMS.map((d, i) => [s.x(lx(d)), s.y(Math.log10(stats[i].contrast))]))} className="ln-fit" />
                {DIMS.map((d, i) => (
                  <circle key={d} cx={s.x(lx(d))} cy={s.y(Math.log10(stats[i].contrast))} r={i === di ? 7 : 3.5} className={i === di ? 'mark' : 'mark-acc'} />
                ))}
              </>
            )}
          </Chart>
        </div>
      </div>
      <Slider label="dimension d" value={di} min={0} max={DIMS.length - 1} step={1} onChange={setDi} format={(i) => String(DIMS[i])} />
      <Readout
        items={[
          { label: 'nearest distance', value: fmt(lo, 3) },
          { label: 'farthest distance', value: fmt(hi, 3) },
          { label: 'nearest / farthest', value: fmt(lo / hi, 3), tone: 'accent' },
        ]}
      />
    </div>
  );
}

/* ---------------- irrelevant features ---------------- */

const RS = [0, 1, 2, 4, 8, 16, 32, 64];
const M = 150;

/** Two relevant features decide the class; r more features are pure noise. */
const BASE = (() => {
  const r = rng(77);
  const rel: Vec[] = [];
  const noise: Vec[] = [];
  const y: Label[] = [];
  for (let i = 0; i < M; i++) {
    const a = r.uniform();
    const b = r.uniform();
    rel.push([a, b]);
    noise.push(Array.from({ length: 64 }, () => r.uniform()));
    y.push(a + b > 1 ? 1 : 0);
  }
  return { rel, noise, y };
})();

export function IrrelevantLab() {
  const [ri, setRi] = useState(3);
  const [zero, setZero] = useState(false);
  const curve = useMemo(
    () =>
      RS.map((r) => {
        const X = BASE.rel.map((v, i) => [...v, ...BASE.noise[i].slice(0, r)]);
        return 1 - loocvError(X, BASE.y, 5);
      }),
    [],
  );
  const base = curve[0];
  const shown = (i: number) => (zero ? base : curve[i]);
  return (
    <div className="lab-grid">
      <div>
        <Chart
          W={520}
          H={280}
          x={[0, RS.length - 1]}
          y={[0.4, 1]}
          xTicks={RS.map((_, i) => i)}
          xTickFormat={(i) => String(RS[i])}
          xLabel="number of irrelevant features added"
          yLabel="5-NN LOOCV accuracy"
          ariaLabel="Accuracy against number of irrelevant features"
        >
          {(s) => (
            <>
              <line x1={s.left} x2={s.right} y1={s.y(0.5)} y2={s.y(0.5)} className="ln-ghost" />
              <path d={pathOf(RS.map((_, i) => [s.x(i), s.y(shown(i))]))} className={zero ? 'ln-alt' : 'ln-fit'} />
              {RS.map((_, i) => (
                <circle key={i} cx={s.x(i)} cy={s.y(shown(i))} r={i === ri ? 7 : 4} className={i === ri ? 'mark' : 'mark-acc'} />
              ))}
            </>
          )}
        </Chart>
        <Legend items={[{ label: zero ? 'with weights zᵣ = 0 on the noise features' : 'plain Euclidean distance', cls: zero ? 'ln-alt' : 'ln-fit' }, { label: 'chance (0.5)', cls: 'ln-ghost', shape: 'dash' }]} />
      </div>
      <div className="controls">
        <Slider label="irrelevant features" value={ri} min={0} max={RS.length - 1} step={1} onChange={setRi} format={(i) => String(RS[i])} />
        <Toggle label="Give the irrelevant features weight 0" checked={zero} onChange={setZero} />
        <Readout
          items={[
            { label: 'total features d', value: 2 + RS[ri] },
            { label: 'LOOCV accuracy', value: fmt(shown(ri), 3), tone: 'accent' },
          ]}
        />
        <p className="small muted">
          {M} points; the class is y = 1 when x₁ + x₂ &gt; 1. Every feature is uniform on [0, 1], so all are already on the same scale — the damage comes from
          irrelevance, not units.
        </p>
      </div>
    </div>
  );
}
