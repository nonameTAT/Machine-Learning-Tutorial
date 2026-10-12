import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../../components/Chart';
import { Readout, Slider } from '../../../components/ui';
import { fmt, linspace } from '../../../lib/num';

const XS = linspace(-3, 3, 301);
const sig = (z: number) => 1 / (1 + Math.exp(-z));
const logit = (p: number) => Math.log(p / (1 - p));

/**
 * One measurement x with x | A ~ N(+1, 1) and x | B ~ N(−1, 1), so the true log-likelihood ratio is 2x.
 * Naive Bayes sees the same measurement recorded k times and multiplies k identical factors: log-ratio 2kx.
 */
export function CalibrationLab() {
  const [k, setK] = useState(7);
  const [prior, setPrior] = useState(0.5);
  const [tau, setTau] = useState(0.5);
  const [x0, setX0] = useState(0.2);
  const lo = logit(prior);
  const truth = (x: number) => sig(2 * x + lo);
  const nb = (x: number) => sig(2 * k * x + lo);
  // where each posterior crosses the decision threshold τ
  const xTrue = (logit(tau) - lo) / 2;
  const xNb = (logit(tau) - lo) / (2 * k);
  const decide = (p: number) => (p >= tau ? 'A' : 'B');
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={330} x={[-3, 3]} y={[0, 1]} xLabel="measurement x" yLabel="P(A | x)" ariaLabel="True and Naive Bayes posteriors with a decision threshold">
          {(s) => (
            <>
              {Math.abs(xTrue - xNb) > 1e-6 && (
                <rect x={s.x(Math.min(xTrue, xNb))} y={s.top} width={Math.abs(s.x(xTrue) - s.x(xNb))} height={s.bottom - s.top} className="area-var" />
              )}
              <line x1={s.left} x2={s.right} y1={s.y(tau)} y2={s.y(tau)} className="ln-ghost" />
              <path d={pathOf(XS.map((x) => [s.x(x), s.y(truth(x))]))} className="ln-fit" />
              <path d={pathOf(XS.map((x) => [s.x(x), s.y(nb(x))]))} className="ln-res" />
              <line x1={s.x(x0)} x2={s.x(x0)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeWidth={1.5} />
              <circle cx={s.x(x0)} cy={s.y(truth(x0))} r={6} className="mark-acc" />
              <circle cx={s.x(x0)} cy={s.y(nb(x0))} r={6} className="mark" />
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'true posterior (the clue counted once)', cls: 'ln-fit' },
            { label: `Naive Bayes (the clue counted ${k} times)`, cls: 'ln-res' },
            { label: 'decision threshold τ', cls: 'ln-ghost', shape: 'dash' },
            { label: 'inputs where the two decisions differ', cls: 'area-var', shape: 'box' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="copies of the clue Naive Bayes multiplies, k" value={k} min={1} max={10} step={1} onChange={setK} />
        <Slider label="prior P(A)" value={prior} min={0.1} max={0.9} step={0.01} onChange={setPrior} format={(v) => fmt(v, 2)} />
        <Slider label="decision threshold τ on P(A | x)" value={tau} min={0.05} max={0.95} step={0.01} onChange={setTau} format={(v) => fmt(v, 2)} />
        <Slider label="query x" value={x0} min={-2} max={2} step={0.01} onChange={setX0} format={(v) => fmt(v, 2)} />
        <Readout
          items={[
            { label: 'true P(A | x)', value: fmt(truth(x0), 3) },
            { label: 'Naive Bayes P(A | x)', value: fmt(nb(x0), 3), tone: 'accent' },
            { label: 'true decision', value: decide(truth(x0)) },
            { label: 'Naive Bayes decision', value: decide(nb(x0)), tone: decide(truth(x0)) === decide(nb(x0)) ? 'good' : 'bad' },
          ]}
        />
      </div>
    </div>
  );
}
