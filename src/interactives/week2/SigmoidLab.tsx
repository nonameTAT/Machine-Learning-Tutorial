import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Slider, Toggle } from '../../components/ui';
import { fmt, linspace, ols1d } from '../../lib/num';
import { logLoss1d, logit, sigmoid, type Label } from '../../lib/classify';
import { CLASS_LEGEND, ClassPt } from './common';

// Overlapping 1-D data: negatives mostly on the left, positives on the right.
export const SIG_X = [0.8, 1.6, 2.3, 3.0, 3.7, 4.4, 5.6, 4.0, 5.1, 6.0, 6.7, 7.5, 8.3, 9.2];
export const SIG_Y: Label[] = [0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1];

/** Maximum-likelihood logistic fit for 1-D data by Newton's method (data must not be separable). */
export function fitLogistic1d(xs: number[], ys: Label[]): [number, number] {
  let b0 = 0;
  let b1 = 0;
  for (let it = 0; it < 60; it++) {
    let g0 = 0;
    let g1 = 0;
    let h00 = 0;
    let h01 = 0;
    let h11 = 0;
    xs.forEach((x, j) => {
      const p = sigmoid(b0 + b1 * x);
      const w = p * (1 - p);
      g0 += p - ys[j];
      g1 += (p - ys[j]) * x;
      h00 += w;
      h01 += w * x;
      h11 += w * x * x;
    });
    const det = h00 * h11 - h01 * h01;
    if (Math.abs(det) < 1e-14) break;
    const d0 = (h11 * g0 - h01 * g1) / det;
    const d1 = (-h01 * g0 + h00 * g1) / det;
    b0 -= d0;
    b1 -= d1;
    if (Math.hypot(d0, d1) < 1e-12) break;
  }
  return [b0, b1];
}

export function SigmoidLab() {
  const [b0, setB0] = useState(-5);
  const [b1, setB1] = useState(1);
  const [tau, setTau] = useState(0.5);
  const [ls, setLs] = useState(false);
  const z = (x: number) => b0 + b1 * x;
  const p = (x: number) => sigmoid(z(x));
  const grid = linspace(0, 10, 301);
  const yhat = (x: number): Label => (p(x) >= tau ? 1 : 0);
  const correct = SIG_X.filter((x, j) => yhat(x) === SIG_Y[j]).length;
  const loss = logLoss1d(SIG_X, SIG_Y, b0, b1);
  const zStar = logit(tau);
  const xStar = Math.abs(b1) > 1e-9 ? (zStar - b0) / b1 : NaN;
  const lsFit = ols1d(SIG_X, SIG_Y)!;
  const lsAt = (x: number) => lsFit.b0 + lsFit.b1 * x;

  const strips: [number, number, Label][] = [];
  grid.forEach((x, i) => {
    const c = yhat(x);
    const x1 = i < grid.length - 1 ? grid[i + 1] : x;
    const last = strips[strips.length - 1];
    if (last && last[2] === c) last[1] = x1;
    else strips.push([x, x1, c]);
  });

  const scale = (c: number) => {
    setB0(Number((b0 * c).toFixed(3)));
    setB1(Number((b1 * c).toFixed(3)));
  };
  const fit = () => {
    const [f0, f1] = fitLogistic1d(SIG_X, SIG_Y);
    setB0(Number(f0.toFixed(3)));
    setB1(Number(f1.toFixed(3)));
  };

  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={340} x={[0, 10]} y={[-0.35, 1.35]} yTicks={[0, 0.25, 0.5, 0.75, 1]} xLabel="x" yLabel="P(y = 1 | x)" ariaLabel="Sigmoid fit to binary data">
          {(s) => (
            <>
              {strips.map(([a, b, c], i) => (
                <rect key={i} x={s.x(a)} width={s.x(b) - s.x(a)} y={s.top} height={s.bottom - s.top} className={c ? 'rg-pos' : 'rg-neg'} />
              ))}
              <line x1={s.left} x2={s.right} y1={s.y(0)} y2={s.y(0)} className="ln-fit-soft" />
              <line x1={s.left} x2={s.right} y1={s.y(1)} y2={s.y(1)} className="ln-fit-soft" />
              <line x1={s.left} x2={s.right} y1={s.y(tau)} y2={s.y(tau)} className="ln-ghost" />
              {ls && <line x1={s.x(0)} x2={s.x(10)} y1={s.y(lsAt(0))} y2={s.y(lsAt(10))} className="ln-alt" />}
              <path d={pathOf(grid.map((x) => [s.x(x), s.y(p(x))]))} className="ln-fit" />
              {Number.isFinite(xStar) && <line x1={s.x(xStar)} x2={s.x(xStar)} y1={s.top} y2={s.bottom} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="5 4" />}
              {SIG_X.map((x, j) => (
                <g key={j}>
                  {yhat(x) !== SIG_Y[j] && <circle cx={s.x(x)} cy={s.y(SIG_Y[j])} r={10} className="ring-miss" />}
                  <ClassPt cx={s.x(x)} cy={s.y(SIG_Y[j])} y={SIG_Y[j]} r={6} />
                </g>
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            ...CLASS_LEGEND,
            { label: 'σ(β₀ + β₁x)', cls: 'ln-fit' },
            { label: 'threshold τ', cls: 'ln-ghost', shape: 'dash' },
            { label: 'misclassified', cls: 'ring-miss', shape: 'dot' },
            ...(ls ? [{ label: 'least-squares line on 0/1 labels', cls: 'ln-alt' }] : []),
          ]}
        />
      </div>
      <div className="controls">
        <Slider label={<M t="\beta_0" />} value={b0} min={-40} max={10} step={0.05} onChange={setB0} format={(v) => fmt(v, 2)} />
        <Slider label={<M t="\beta_1" />} value={b1} min={-2} max={8} step={0.01} onChange={setB1} format={(v) => fmt(v, 2)} />
        <Slider label="probability threshold τ" value={tau} min={0.05} max={0.95} step={0.01} onChange={setTau} format={(v) => fmt(v, 2)} />
        <div className="btn-row">
          <button className="btn" onClick={() => scale(2)}>
            × 2 coefficients
          </button>
          <button className="btn" onClick={() => scale(0.5)}>
            ÷ 2
          </button>
          <button className="btn btn-primary" onClick={fit}>
            Fit (max. likelihood)
          </button>
        </div>
        <Toggle label="Show a least-squares line fitted to the 0/1 labels" checked={ls} onChange={setLs} />
        <Readout
          items={[
            { label: 'score threshold log(τ/(1−τ))', value: fmt(zStar, 3) },
            { label: 'boundary x*', value: Number.isFinite(xStar) ? fmt(xStar, 3) : 'none' },
            { label: 'training accuracy', value: `${correct}/${SIG_X.length}`, tone: 'accent' },
            { label: 'average log loss', value: fmt(loss, 4) },
          ]}
        />
        {ls && (
          <div className="status">
            The least-squares line predicts {fmt(lsAt(0), 2)} at x = 0 and {fmt(lsAt(10), 2)} at x = 10 — outside [0, 1], so not a probability.
          </div>
        )}
      </div>
    </div>
  );
}
