import { useMemo, useState, type ReactNode } from 'react';
import { Chart } from '../components/Chart';
import { M } from '../components/Math';
import { Readout, Slider, Toggle } from '../components/ui';
import { fmt, lineTex, mean, metrics, ols1d } from '../lib/num';
import { EX_X, EX_Y } from './ResidualLab';

/** Best rational approximation with a small denominator, for checking hand calculations. */
export function asFraction(v: number, maxDen = 2000): string | null {
  if (!Number.isFinite(v)) return null;
  if (Math.abs(v - Math.round(v)) < 1e-9) return null;
  let [h0, h1, k0, k1] = [0, 1, 1, 0];
  let x = v;
  for (let i = 0; i < 30; i++) {
    const a = Math.floor(x);
    [h0, h1] = [h1, a * h1 + h0];
    [k0, k1] = [k1, a * k1 + k0];
    if (k1 > maxDen) return null;
    if (Math.abs(v - h1 / k1) < 1e-9) return `${h1 < 0 ? '−' : ''}${Math.abs(h1)}/${k1}`;
    const f = x - a;
    if (f < 1e-12) break;
    x = 1 / f;
  }
  return null;
}

const show = (v: number, d = 4) => {
  const f = asFraction(v);
  return f ? `${fmt(v, d)}  (= ${f})` : fmt(v, d);
};

function parse(s: string): number[] {
  return s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number);
}

export function OLSCalculator() {
  const [xs, setXs] = useState(EX_X.join(', '));
  const [ys, setYs] = useState(EX_Y.join(', '));
  const [xq, setXq] = useState('9');
  const x = parse(xs);
  const y = parse(ys);
  const bad = x.some(Number.isNaN) || y.some(Number.isNaN);
  const lenOk = x.length === y.length && x.length >= 2;
  const fit = !bad && lenOk ? ols1d(x, y) : null;

  let body: ReactNode = null;
  if (bad) body = <div className="status bad">Could not read a number — separate values with commas or spaces.</div>;
  else if (!lenOk) body = <div className="status bad">x and y need the same number of values (at least 2). Now: {x.length} vs {y.length}.</div>;
  else if (!fit) body = <div className="status bad">All x values are identical, so S_xx = 0: the slope is not identifiable (the design matrix is rank-deficient).</div>;
  else {
    const mx = mean(x);
    const my = mean(y);
    const yhat = x.map((v) => fit.b0 + fit.b1 * v);
    const e = y.map((v, i) => v - yhat[i]);
    const m = metrics(y, yhat, 1);
    const q = Number(xq);
    const sumE = e.reduce((a, b) => a + b, 0);
    const sumXE = e.reduce((a, b, i) => a + b * x[i], 0);
    body = (
      <>
        <div className="table-wrap num">
          <table>
            <thead>
              <tr>
                <th>x</th>
                <th>y</th>
                <th>x − x̄</th>
                <th>y − ȳ</th>
                <th>(x − x̄)²</th>
                <th>(x − x̄)(y − ȳ)</th>
                <th>ŷ</th>
                <th>e = y − ŷ</th>
              </tr>
            </thead>
            <tbody>
              {x.map((xi, i) => (
                <tr key={i}>
                  <td>{fmt(xi, 4)}</td>
                  <td>{fmt(y[i], 4)}</td>
                  <td>{fmt(xi - mx, 4)}</td>
                  <td>{fmt(y[i] - my, 4)}</td>
                  <td>{fmt((xi - mx) ** 2, 4)}</td>
                  <td>{fmt((xi - mx) * (y[i] - my), 4)}</td>
                  <td>{fmt(yhat[i], 4)}</td>
                  <td style={{ color: 'var(--c-res)' }}>{fmt(e[i], 4)}</td>
                </tr>
              ))}
              <tr className="total">
                <td colSpan={4}>
                  x̄ = {show(mx)}, ȳ = {show(my)}
                </td>
                <td>S_xx = {fmt(fit.sxx, 4)}</td>
                <td>S_xy = {fmt(fit.sxy, 4)}</td>
                <td />
                <td>Σe = {fmt(Math.abs(sumE) < 1e-9 ? 0 : sumE, 4)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Readout
          items={[
            { label: 'θ̂₁ = S_xy / S_xx', value: show(fit.b1), tone: 'accent' },
            { label: 'θ̂₀ = ȳ − θ̂₁x̄', value: show(fit.b0), tone: 'accent' },
            { label: 'SSE', value: show(m.sse) },
            { label: 'MSE', value: show(m.mse) },
            { label: 'R²', value: show(m.r2) },
            { label: 'Σ xⱼeⱼ (should be 0)', value: fmt(Math.abs(sumXE) < 1e-9 ? 0 : sumXE, 4), tone: Math.abs(sumXE) < 1e-6 ? 'good' : 'bad' },
          ]}
        />
        <div className="btn-row" style={{ fontFamily: 'var(--font-ui)', fontSize: 14 }}>
          <span>
            Fitted line: <M t={lineTex(fit.b0, fit.b1, 4)} />
          </span>
          <span style={{ marginLeft: 'auto' }}>
            predict at x ={' '}
            <input className="input" style={{ width: 80, display: 'inline-block' }} value={xq} onChange={(e) => setXq(e.target.value)} /> → ŷ ={' '}
            <strong>{Number.isFinite(q) ? show(fit.b0 + fit.b1 * q) : '—'}</strong>
          </span>
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="lab-grid even">
        <label className="field">
          x values
          <input value={xs} onChange={(e) => setXs(e.target.value)} />
        </label>
        <label className="field">
          y values
          <input value={ys} onChange={(e) => setYs(e.target.value)} />
        </label>
      </div>
      <div className="btn-row">
        <button
          className="btn btn-ghost"
          onClick={() => {
            setXs(EX_X.join(', '));
            setYs(EX_Y.join(', '));
          }}
        >
          Worked example
        </button>
        <button
          className="btn btn-ghost"
          onClick={() => {
            setXs('0, 1, 2');
            setYs('1, 2, 2');
          }}
        >
          Practice B1 data
        </button>
      </div>
      {body}
    </div>
  );
}

/** Translate x (and optionally centre y) and watch which coefficient moves. */
export function CenteringLab() {
  const [a, setA] = useState(0);
  const [cy, setCy] = useState(false);
  const mx = mean(EX_X);
  const my = mean(EX_Y);
  const b = cy ? -my : 0;
  const xs = EX_X.map((x) => x + a);
  const ys = EX_Y.map((y) => y + b);
  const fit = useMemo(() => ols1d(xs, ys)!, [a, b]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="lab-grid">
      <div>
        <Chart W={540} H={340} x={[-12, 22]} y={[-12, 26]} xLabel="x′ = x + a" yLabel="y′">
          {(s) => (
            <>
              <line x1={s.x(0)} x2={s.x(0)} y1={s.top} y2={s.bottom} stroke="var(--muted)" strokeWidth={1.5} />
              <line y1={s.y(0)} y2={s.y(0)} x1={s.left} x2={s.right} stroke="var(--muted)" strokeWidth={1.5} />
              <line x1={s.x(-12)} x2={s.x(22)} y1={s.y(fit.b0 + fit.b1 * -12)} y2={s.y(fit.b0 + fit.b1 * 22)} className="ln-fit" />
              {xs.map((x, i) => (
                <circle key={i} cx={s.x(x)} cy={s.y(ys[i])} r={6} className="pt" />
              ))}
              <circle cx={s.x(0)} cy={s.y(fit.b0)} r={6} className="mark" />
              <text x={s.x(0) + 9} y={s.y(fit.b0) - 8} className="anno-strong">
                intercept θ₀′ = {fmt(fit.b0, 2)}
              </text>
              <circle cx={s.x(mx + a)} cy={s.y(my + b)} r={4} className="mark-acc" />
            </>
          )}
        </Chart>
      </div>
      <div className="controls">
        <Slider label="shift a added to every x" value={a} min={-10} max={10} step={0.5} onChange={setA} format={(v) => fmt(v, 1)} />
        <div className="btn-row">
          <button className="btn" onClick={() => setA(-mx)}>
            Centre x (a = −x̄ = −7)
          </button>
          <button className="btn btn-ghost" onClick={() => setA(0)}>
            a = 0
          </button>
        </div>
        <Toggle label="Also centre y (subtract ȳ = 8)" checked={cy} onChange={setCy} />
        <Readout
          items={[
            { label: 'slope θ₁', value: fmt(fit.b1, 3), tone: 'accent' },
            { label: 'intercept θ₀′', value: fmt(fit.b0, 3) },
            { label: 'check: 15 − (−1)·a + b', value: fmt(15 + a + b, 3) },
          ]}
        />
        <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
          The slope never changes: it is built from deviations from the mean, which a translation leaves alone. Centring x makes the intercept equal to
          ȳ; centring both makes it 0.
        </p>
      </div>
    </div>
  );
}
