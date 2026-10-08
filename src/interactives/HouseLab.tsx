import { useState } from 'react';
import { M } from '../components/Math';
import { Slider } from '../components/ui';
import { fmt } from '../lib/num';

// Ten-house data and its fitted equation.
export const HOUSES = [
  [1360, 4, 2, 27, 251240],
  [1794, 1, 2, 42, 262602],
  [1630, 4, 2, 28, 282277],
  [1595, 4, 1, 16, 266877],
  [2138, 4, 1, 15, 346992],
  [2669, 3, 2, 47, 405283],
  [966, 2, 2, 44, 143916],
  [1738, 1, 1, 3, 278097],
  [830, 2, 1, 37, 113612],
  [1982, 4, 1, 7, 342283],
];
export const HOUSE_THETA = [-8775.58, 147.12, 9660.37, 25691.99, -1285.01];
const NAMES = ['Intercept', 'Size (sq ft)', 'Bedrooms', 'Bathrooms', 'Age (years)'];

const predict = (f: number[]) => HOUSE_THETA[0] + f.reduce((s, v, i) => s + HOUSE_THETA[i + 1] * v, 0);
const money = (v: number) => (v < 0 ? '−$' : '$') + Math.round(Math.abs(v)).toLocaleString('en-AU');

export function HouseLab() {
  const [f, setF] = useState([1600, 3, 2, 20]);
  const [row, setRow] = useState<number | null>(null);
  const set = (i: number) => (v: number) => {
    setRow(null);
    setF((p) => p.map((x, j) => (j === i ? v : x)));
  };
  const contrib = [HOUSE_THETA[0], ...f.map((v, i) => HOUSE_THETA[i + 1] * v)];
  const yhat = predict(f);

  // waterfall geometry
  let run = 0;
  const bars = contrib.map((c, i) => {
    const a = run;
    run += c;
    return { name: NAMES[i], from: a, to: run, c };
  });
  const lo = Math.min(0, ...bars.map((b) => Math.min(b.from, b.to)));
  const hi = Math.max(...bars.map((b) => Math.max(b.from, b.to)), yhat) * 1.05;
  const W = 560;
  const rowH = 30;
  const L = 112;
  const R = W - 16;
  const X = (v: number) => L + ((v - lo) / (hi - lo)) * (R - L);
  const H = rowH * (bars.length + 1) + 26;

  return (
    <div className="lab-grid">
      <div>
        <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Contribution of each term to the predicted price">
          <line x1={X(0)} x2={X(0)} y1={6} y2={H - 22} className="ln-ghost" />
          {bars.map((b, i) => {
            const y = 8 + i * rowH;
            const x0 = X(Math.min(b.from, b.to));
            const w = Math.max(1, Math.abs(X(b.to) - X(b.from)));
            return (
              <g key={i}>
                <text x={L - 8} y={y + 17} textAnchor="end" className="anno">
                  {b.name}
                </text>
                <rect x={x0} y={y + 4} width={w} height={rowH - 10} rx={3} className={b.c >= 0 ? 'bar-pos' : 'bar-neg'} />
                {i < bars.length - 1 && <line x1={X(b.to)} x2={X(b.to)} y1={y + rowH - 6} y2={y + rowH + 4} stroke="var(--muted)" strokeDasharray="2 2" />}
                {(() => {
                  const right = X(Math.max(b.from, b.to));
                  const left = X(Math.min(b.from, b.to));
                  const fits = right + 78 < R;
                  return (
                    <text x={fits ? right + 6 : left - 6} y={y + 17} className="anno" textAnchor={fits ? 'start' : 'end'}>
                      {(b.c >= 0 ? '+' : '') + money(b.c)}
                    </text>
                  );
                })()}
              </g>
            );
          })}
          {(() => {
            const y = 8 + bars.length * rowH;
            return (
              <g>
                <text x={L - 8} y={y + 17} textAnchor="end" className="anno-strong">
                  Prediction ŷ
                </text>
                <rect x={X(0)} y={y + 4} width={Math.max(1, X(yhat) - X(0))} height={rowH - 10} rx={3} fill="var(--c-fit)" />
                {X(yhat) + 84 < R ? (
                  <text x={X(yhat) + 6} y={y + 17} className="anno-strong">
                    {money(yhat)}
                  </text>
                ) : (
                  <text x={X(yhat) - 8} y={y + 17} textAnchor="end" style={{ fill: 'var(--surface)', fontSize: 12.5, fontWeight: 700 }}>
                    {money(yhat)}
                  </text>
                )}
              </g>
            );
          })()}
          <text x={X(0)} y={H - 6} textAnchor="middle" className="anno">
            $0
          </text>
        </svg>
        <p className="small muted" style={{ fontFamily: 'var(--font-ui)', margin: '4px 0 0' }}>
          Each bar is one term <M t="\theta_i x_i" />. The prediction is literally their sum — that is what “linear combination” means.
        </p>
      </div>
      <div className="controls">
        <Slider label="House size (sq ft)" value={f[0]} min={600} max={3000} step={10} onChange={set(0)} />
        <Slider label="Bedrooms" value={f[1]} min={0} max={6} step={1} onChange={set(1)} />
        <Slider label="Bathrooms" value={f[2]} min={0} max={4} step={1} onChange={set(2)} />
        <Slider label="Age (years)" value={f[3]} min={0} max={80} step={1} onChange={set(3)} />
        <div className="status">
          Predicted price: <strong>{money(yhat)}</strong>
          {row !== null && (
            <>
              <br />
              Actual (house {row + 1}): <strong>{money(HOUSES[row][4])}</strong>, residual{' '}
              <strong style={{ color: 'var(--c-res)' }}>{money(HOUSES[row][4] - yhat)}</strong>
            </>
          )}
        </div>
      </div>
      <div className="full" style={{ gridColumn: '1 / -1' }}>
        <div className="panel-title">The ten training houses — click a row to load it</div>
        <div className="table-wrap num">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Size</th>
                <th>Beds</th>
                <th>Baths</th>
                <th>Age</th>
                <th>Price y</th>
                <th>Fitted ŷ</th>
                <th>Residual y − ŷ</th>
              </tr>
            </thead>
            <tbody>
              {HOUSES.map((h, i) => {
                const p = predict(h.slice(0, 4));
                return (
                  <tr
                    key={i}
                    onClick={() => {
                      setF(h.slice(0, 4));
                      setRow(i);
                    }}
                    style={{ cursor: 'pointer', background: row === i ? 'var(--accent-soft)' : undefined }}
                  >
                    <td>{i + 1}</td>
                    <td>{h[0]}</td>
                    <td>{h[1]}</td>
                    <td>{h[2]}</td>
                    <td>{h[3]}</td>
                    <td>{h[4].toLocaleString('en-AU')}</td>
                    <td>{Math.round(p).toLocaleString('en-AU')}</td>
                    <td style={{ color: 'var(--c-res)' }}>{fmt(Math.round(h[4] - p), 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** Row-by-row trace of ŷ = Xθ for the first few houses. */
export function DesignMatrixDemo() {
  const rows = HOUSES.slice(0, 4);
  const [sel, setSel] = useState(0);
  const x = [1, ...rows[sel].slice(0, 4)];
  const terms = x.map((v, i) => `${i === 0 ? '1' : v}\\cdot(${HOUSE_THETA[i]})`);
  const yhat = predict(rows[sel].slice(0, 4));
  return (
    <div>
      <div className="lab-grid even">
        <div>
          <div className="panel-title">Design matrix X (4 rows shown) · click a row</div>
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th style={{ color: 'var(--accent)' }}>
                    x<sub>0</sub>
                  </th>
                  <th>size</th>
                  <th>beds</th>
                  <th>baths</th>
                  <th>age</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} onClick={() => setSel(i)} style={{ cursor: 'pointer', background: sel === i ? 'var(--accent-soft)' : undefined }}>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>1</td>
                    {r.slice(0, 4).map((v, j) => (
                      <td key={j}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="panel-title">Parameter vector θ</div>
          <div className="table-wrap num">
            <table>
              <tbody>
                {HOUSE_THETA.map((t, i) => (
                  <tr key={i}>
                    <td>
                      θ<sub>{i}</sub>
                    </td>
                    <td>{t}</td>
                    <td className="muted">{NAMES[i]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="panel-title">Row {sel + 1} of Xθ, traced</div>
      <div className="m-block">
        <M t={`\\hat y_{${sel + 1}} = \\bx_{${sel + 1}}\\T\\theta = ${terms.join(' + ')} \\approx ${Math.round(yhat).toLocaleString('en-AU').replace(/,/g, '{,}')}`} />
      </div>
    </div>
  );
}

/** HTML flow version of the learning pipeline so it wraps on small screens. */
export function Pipeline() {
  const steps = [
    ['Database', 'raw records'],
    ['Data retrieval', 'pick what is relevant'],
    ['Cleaning & pre-processing', 'missing values, errors'],
    ['Feature engineering & extraction', 'what the model can “see”'],
    ['Feature scaling & selection', 'comparable, useful columns'],
    ['Modelling', 'the learning algorithm'],
    ['Evaluation & tuning', 'held-out error, hyperparameters'],
    ['Deployment & monitoring', 'does it keep working?'],
  ];
  return (
    <div className="pipeline">
      {steps.map(([t, s], i) => (
        <div key={i} className={`pipe-step ${i >= 2 && i <= 4 ? 'prep' : ''}`}>
          <div className="pipe-t">{t}</div>
          <div className="pipe-s">{s}</div>
        </div>
      ))}
      <div className="pipe-loop">↺ Reiterate until model performance is satisfactory</div>
    </div>
  );
}
