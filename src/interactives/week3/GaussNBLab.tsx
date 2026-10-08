import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { Readout, Segmented, Slider } from '../../components/ui';
import { fmt, linspace, mean } from '../../lib/num';

// Temperatures from the numeric PlayTennis data: the “yes” days give μ = 73, s ≈ 6.2.
const YES = [83, 70, 68, 64, 69, 75, 75, 72, 81];
const NO = [85, 80, 65, 72, 71];
const N = YES.length + NO.length;

const gauss = (x: number, mu: number, sd: number) => Math.exp(-((x - mu) ** 2) / (2 * sd * sd)) / (Math.sqrt(2 * Math.PI) * sd);

export function GaussNBLab() {
  const [conv, setConv] = useState<'sample' | 'mle'>('sample');
  const [xq, setXq] = useState(66);
  const fit = (v: number[]) => {
    const m = mean(v);
    const ss = v.reduce((s, x) => s + (x - m) ** 2, 0);
    return { m, sd: Math.sqrt(ss / (conv === 'sample' ? v.length - 1 : v.length)) };
  };
  const fy = fit(YES);
  const fn = fit(NO);
  const py = YES.length / N;
  const pn = NO.length / N;
  const dy = gauss(xq, fy.m, fy.sd);
  const dn = gauss(xq, fn.m, fn.sd);
  const post = (dy * py) / (dy * py + dn * pn);
  const xs = linspace(50, 100, 301);
  const yMax = 0.075;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={300} x={[50, 100]} y={[0, yMax]} xLabel="temperature (°F)" yLabel="density p(x | class)" ariaLabel="Class-conditional Gaussian densities">
          {(s) => (
            <>
              <path d={pathOf(xs.map((x) => [s.x(x), s.y(gauss(x, fy.m, fy.sd))]))} className="ln-pos" />
              <path d={pathOf(xs.map((x) => [s.x(x), s.y(gauss(x, fn.m, fn.sd))]))} className="ln-neg" />
              {YES.map((x, i) => (
                <circle key={`y${i}`} cx={s.x(x)} cy={s.y(0.004)} r={5} className="pt pos" />
              ))}
              {NO.map((x, i) => (
                <rect key={`n${i}`} x={s.x(x) - 4.5} y={s.y(0.010) - 4.5} width={9} height={9} className="pt neg" />
              ))}
              <line x1={s.x(xq)} x2={s.x(xq)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeDasharray="4 3" />
              <circle cx={s.x(xq)} cy={s.y(dy)} r={5} className="mark-acc" />
              <circle cx={s.x(xq)} cy={s.y(dn)} r={5} className="mark-acc" />
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: `yes: N(${fmt(fy.m, 2)}, ${fmt(fy.sd, 3)}²)`, cls: 'ln-pos' },
            { label: `no: N(${fmt(fn.m, 2)}, ${fmt(fn.sd, 3)}²)`, cls: 'ln-neg' },
            { label: 'training temperatures', cls: 'pt pos', shape: 'dot' },
          ]}
        />
      </div>
      <div className="controls">
        <Segmented
          options={[
            { value: 'sample', label: 'divide by n − 1' },
            { value: 'mle', label: 'divide by n (MLE)' },
          ]}
          value={conv}
          onChange={setConv}
        />
        <Slider label="query temperature" value={xq} min={50} max={100} step={0.5} onChange={setXq} format={(v) => fmt(v, 1)} />
        <Readout
          items={[
            { label: 'p(x | yes)', value: fmt(dy, 5) },
            { label: 'p(x | no)', value: fmt(dn, 5) },
            { label: 'score yes = (9/14)·p', value: fmt(dy * py, 5) },
            { label: 'score no = (5/14)·p', value: fmt(dn * pn, 5) },
            { label: 'P(yes | temperature)', value: fmt(post, 4), tone: 'accent' },
          ]}
        />
        <p className="small muted">Temperature alone, for clarity. In full Gaussian Naive Bayes this density is one factor among several.</p>
      </div>
    </div>
  );
}
