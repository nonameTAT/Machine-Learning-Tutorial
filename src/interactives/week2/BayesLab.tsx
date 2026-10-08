import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Slider } from '../../components/ui';
import { fmt, linspace } from '../../lib/num';

const gauss = (x: number, mu: number, sd: number) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (sd * Math.sqrt(2 * Math.PI));
const MU0 = 3.5;
const MU1 = 6.5;
const SD0 = 1.2;

/** A generative classifier in one dimension: class-conditional densities × priors → posterior. */
export function BayesLab() {
  const [prior, setPrior] = useState(0.5);
  const [sd1, setSd1] = useState(1.2);
  const [xq, setXq] = useState(5.4);
  const grid = linspace(-1, 11, 361);
  const l0 = (x: number) => gauss(x, MU0, SD0);
  const l1 = (x: number) => gauss(x, MU1, sd1);
  const post = (x: number) => (l1(x) * prior) / (l1(x) * prior + l0(x) * (1 - prior));
  const yMax = 1.08 * Math.max(...grid.map((x) => Math.max(l0(x), l1(x))));
  const a1 = l1(xq) * prior;
  const a0 = l0(xq) * (1 - prior);
  const pq = a1 / (a0 + a1);
  const byLik: 0 | 1 = l1(xq) >= l0(xq) ? 1 : 0;
  const byPost: 0 | 1 = pq >= 0.5 ? 1 : 0;

  // x-intervals on which the posterior favours class 1
  const strips: [number, number, 0 | 1][] = [];
  grid.forEach((x, i) => {
    const c: 0 | 1 = post(x) >= 0.5 ? 1 : 0;
    const x1 = i < grid.length - 1 ? grid[i + 1] : x;
    const last = strips[strips.length - 1];
    if (last && last[2] === c) last[1] = x1;
    else strips.push([x, x1, c]);
  });

  return (
    <div className="lab-grid">
      <div>
        <div className="panel-title">Class-conditional densities, weighted by the priors</div>
        <Chart W={560} H={250} x={[-1, 11]} y={[0, yMax]} xLabel="feature x (lightness)" yLabel="density" ariaLabel="Weighted class densities">
          {(s) => (
            <>
              <path d={pathOf(grid.map((x) => [s.x(x), s.y(l0(x))]))} className="ln-ghost" style={{ stroke: 'var(--c-neg)' }} />
              <path d={pathOf(grid.map((x) => [s.x(x), s.y(l1(x))]))} className="ln-ghost" style={{ stroke: 'var(--c-pos)' }} />
              <path d={`${pathOf(grid.map((x) => [s.x(x), s.y(l0(x) * (1 - prior))]))}L${s.x(11)},${s.y(0)}L${s.x(-1)},${s.y(0)}Z`} className="area-neg" />
              <path d={`${pathOf(grid.map((x) => [s.x(x), s.y(l1(x) * prior)]))}L${s.x(11)},${s.y(0)}L${s.x(-1)},${s.y(0)}Z`} className="area-pos" />
              <path d={pathOf(grid.map((x) => [s.x(x), s.y(l0(x) * (1 - prior))]))} className="ln-neg" />
              <path d={pathOf(grid.map((x) => [s.x(x), s.y(l1(x) * prior)]))} className="ln-pos" />
              <line x1={s.x(xq)} x2={s.x(xq)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeDasharray="4 3" />
              <circle cx={s.x(xq)} cy={s.y(a1)} r={5} className="pt pos" />
              <rect x={s.x(xq) - 4.5} y={s.y(a0) - 4.5} width={9} height={9} className="pt neg" />
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'p(x | y=1) P(y=1)', cls: 'ln-pos' },
            { label: 'p(x | y=0) P(y=0)', cls: 'ln-neg' },
            { label: 'unweighted p(x | y)', cls: 'ln-ghost', shape: 'dash' },
          ]}
        />
        <div className="panel-title" style={{ marginTop: 10 }}>
          Posterior P(y = 1 | x) — the shaded class is predicted
        </div>
        <Chart W={560} H={170} x={[-1, 11]} y={[0, 1]} yTicks={[0, 0.5, 1]} xLabel="feature x" ariaLabel="Posterior probability">
          {(s) => (
            <>
              {strips.map(([a, b, c], i) => (
                <rect key={i} x={s.x(a)} width={s.x(b) - s.x(a)} y={s.top} height={s.bottom - s.top} className={c ? 'rg-pos' : 'rg-neg'} />
              ))}
              <line x1={s.left} x2={s.right} y1={s.y(0.5)} y2={s.y(0.5)} className="ln-ghost" />
              <path d={pathOf(grid.map((x) => [s.x(x), s.y(post(x))]))} className="ln-fit" />
              <line x1={s.x(xq)} x2={s.x(xq)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeDasharray="4 3" />
              <circle cx={s.x(xq)} cy={s.y(pq)} r={6} className="mark-acc" />
            </>
          )}
        </Chart>
      </div>
      <div className="controls">
        <Slider label="query x" value={xq} min={-1} max={11} step={0.05} onChange={setXq} format={(v) => fmt(v, 2)} />
        <Slider label={<M t="\text{prior } P(y=1)" />} value={prior} min={0.02} max={0.98} step={0.01} onChange={setPrior} format={(v) => fmt(v, 2)} />
        <Slider label={<M t="\text{spread of class 1, } \sigma_1" />} value={sd1} min={0.5} max={2.5} step={0.05} onChange={setSd1} format={(v) => fmt(v, 2)} />
        <Readout
          items={[
            { label: 'p(x | y=1)', value: fmt(l1(xq), 3) },
            { label: 'p(x | y=0)', value: fmt(l0(xq), 3) },
            { label: '× prior, class 1', value: fmt(a1, 3) },
            { label: '× prior, class 0', value: fmt(a0, 3) },
            { label: 'P(y=1 | x)', value: fmt(pq, 3), tone: 'accent' },
            { label: 'prediction', value: byPost === 1 ? 'positive' : 'negative' },
          ]}
        />
        <div className={`status ${byLik !== byPost ? 'bad' : ''}`}>
          {byLik !== byPost
            ? `Likelihoods alone favour class ${byLik}, but after weighting by the priors the posterior favours class ${byPost}.`
            : `Likelihoods alone and the posterior agree here (class ${byPost}).`}
        </div>
        <p className="small muted">
          Class 0 is fixed at mean {MU0}, spread {SD0}; class 1 has mean {MU1}. The denominator p(x) is the sum of the two weighted heights — the same for
          both classes at this x.
        </p>
      </div>
    </div>
  );
}
