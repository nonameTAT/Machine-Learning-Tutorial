import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { Readout, Slider, Toggle } from '../../components/ui';
import { fmt, linspace } from '../../lib/num';
import { sigmoid, type Label } from '../../lib/classify';

/** Loss of one observation as a function of the predicted probability p = P(y = 1 | x). */
export function LossCurveLab() {
  const [p, setP] = useState(0.8);
  const [sq, setSq] = useState(false);
  const ps = linspace(0.001, 0.999, 400);
  const Y = 5;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={300} x={[0, 1]} y={[0, Y]} xLabel="predicted probability p = P(y = 1 | x)" yLabel="loss" ariaLabel="Log loss curves">
          {(s) => (
            <>
              <path d={pathOf(ps.map((q) => [s.x(q), s.y(Math.min(-Math.log(q), Y + 1))]))} className="ln-pos" />
              <path d={pathOf(ps.map((q) => [s.x(q), s.y(Math.min(-Math.log(1 - q), Y + 1))]))} className="ln-neg" />
              {sq && (
                <>
                  <path d={pathOf(ps.map((q) => [s.x(q), s.y((1 - q) ** 2)]))} className="ln-pos" strokeDasharray="6 4" strokeWidth={1.8} />
                  <path d={pathOf(ps.map((q) => [s.x(q), s.y(q ** 2)]))} className="ln-neg" strokeDasharray="6 4" strokeWidth={1.8} />
                </>
              )}
              <line x1={s.x(p)} x2={s.x(p)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeDasharray="4 3" />
              <circle cx={s.x(p)} cy={s.y(Math.min(-Math.log(p), Y))} r={6} className="pt pos" />
              <rect x={s.x(p) - 5} y={s.y(Math.min(-Math.log(1 - p), Y)) - 5} width={10} height={10} className="pt neg" />
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'true y = 1: −log p', cls: 'ln-pos' },
            { label: 'true y = 0: −log(1 − p)', cls: 'ln-neg' },
            ...(sq ? [{ label: 'squared error (p − y)²', cls: 'ln-ghost', shape: 'dash' as const }] : []),
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="predicted p" value={p} min={0.01} max={0.99} step={0.01} onChange={setP} format={(v) => fmt(v, 2)} />
        <Toggle label="Compare with squared error" checked={sq} onChange={setSq} />
        <Readout
          items={[
            { label: 'log loss if y = 1', value: fmt(-Math.log(p), 3), tone: 'accent' },
            { label: 'log loss if y = 0', value: fmt(-Math.log(1 - p), 3) },
            ...(sq
              ? [
                  { label: 'squared if y = 1', value: fmt((1 - p) ** 2, 3) },
                  { label: 'squared if y = 0', value: fmt(p ** 2, 3) },
                ]
              : []),
          ]}
        />
        <p className="small muted">
          A confident mistake (p → 0 for a positive) costs without limit under log loss; squared error never charges more than 1 for any single
          observation.
        </p>
      </div>
    </div>
  );
}

// Eight centred points with two "wrong-side" observations, score z = b·x (no intercept).
const LX = [-3, -2, -1, -0.5, 0.5, 1, 2, 3];
const LY: Label[] = [0, 0, 1, 0, 1, 0, 1, 1];

/** Average loss as a function of one coefficient: log loss is convex, squared error of σ(bx) is not. */
export function ConvexityLab() {
  const [b, setB] = useState(1);
  const bs = linspace(-6, 8, 281);
  const J = (c: number) => LX.reduce((s, x, j) => s - Math.log(Math.max(1e-300, LY[j] ? sigmoid(c * x) : 1 - sigmoid(c * x))), 0) / LX.length;
  const Q = (c: number) => LX.reduce((s, x, j) => s + (sigmoid(c * x) - LY[j]) ** 2, 0) / LX.length;
  const argmin = (f: (c: number) => number) => bs.reduce((best, c) => (f(c) < f(best) ? c : best), bs[0]);
  const bJ = argmin(J);
  const bQ = argmin(Q);
  return (
    <div>
      <div className="lab-grid even">
        <div>
          <div className="panel-title">Average log loss J(b)</div>
          <Chart W={420} H={240} x={[-6, 8]} y={[0, 3]} xLabel="coefficient b" ariaLabel="Log loss against the coefficient">
            {(s) => (
              <>
                <path d={pathOf(bs.map((c) => [s.x(c), s.y(Math.min(J(c), 3.5))]))} className="ln-fit" />
                <line x1={s.x(bJ)} x2={s.x(bJ)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <circle cx={s.x(b)} cy={s.y(Math.min(J(b), 3))} r={6} className="mark-acc" />
              </>
            )}
          </Chart>
        </div>
        <div>
          <div className="panel-title">Average squared error of σ(bx)</div>
          <Chart W={420} H={240} x={[-6, 8]} y={[0, 0.8]} xLabel="coefficient b" ariaLabel="Squared error against the coefficient">
            {(s) => (
              <>
                <path d={pathOf(bs.map((c) => [s.x(c), s.y(Q(c))]))} className="ln-alt" />
                <line x1={s.x(bQ)} x2={s.x(bQ)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <circle cx={s.x(b)} cy={s.y(Q(b))} r={6} className="mark-acc" />
              </>
            )}
          </Chart>
        </div>
      </div>
      <Slider label="coefficient b (score z = b·x)" value={b} min={-6} max={8} step={0.05} onChange={setB} format={(v) => fmt(v, 2)} />
      <Readout
        items={[
          { label: 'J(b)', value: fmt(J(b), 4), tone: 'accent' },
          { label: 'squared error', value: fmt(Q(b), 4) },
          { label: 'minimiser of J', value: fmt(bJ, 2) },
          { label: 'minimiser of squared', value: fmt(bQ, 2) },
        ]}
      />
      <p className="small muted">
        Data: x = (−3, −2, −1, −½, ½, 1, 2, 3) with labels (0, 0, 1, 0, 1, 0, 1, 1). The squared-error curve flattens towards 0.75 on the left and 0.25 on
        the right: it is bounded, so it cannot be convex, and far from the optimum its slope almost vanishes.
      </p>
    </div>
  );
}
