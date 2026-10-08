import { useState } from 'react';
import { Chart } from '../../components/Chart';
import { Readout, Slider } from '../../components/ui';
import { fmt, rng } from '../../lib/num';

type Pred = '+' | '−';

/** MAP hypothesis versus Bayes optimal (posterior-weighted) versus Gibbs (sampled) prediction at one input. */
export function BayesOptLab() {
  const [w, setW] = useState([0.4, 0.3, 0.3]);
  const [pred, setPred] = useState<Pred[]>(['+', '−', '−']);
  const [draws, setDraws] = useState<number[]>([]);
  const Z = w.reduce((a, b) => a + b, 0) || 1;
  const post = w.map((v) => v / Z);
  const pPlus = post.reduce((s, v, i) => s + (pred[i] === '+' ? v : 0), 0);
  const map = post.indexOf(Math.max(...post));
  const bayes = Math.abs(pPlus - 0.5) < 1e-9 ? 'tie' : pPlus > 0.5 ? '+' : '−';
  const gibbsErr = 2 * pPlus * (1 - pPlus);
  const sample = (n: number) => {
    const r = rng(Date.now() % 100000);
    const out: number[] = [];
    for (let k = 0; k < n; k++) {
      let u = r.uniform();
      let i = 0;
      while (i < post.length - 1 && u > post[i]) u -= post[i++];
      out.push(i);
    }
    setDraws(out);
  };
  const gibbsPlus = draws.length ? draws.filter((i) => pred[i] === '+').length / draws.length : NaN;
  let x0 = 0;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={220} x={[0, 1]} y={[0, 2.2]} yTicks={[]} grid={false} xLabel="posterior probability" ariaLabel="Posterior weights and the predictive distribution">
          {(s) => (
            <>
              <text x={s.left} y={s.y(2.05)} className="anno-strong">
                hypotheses, width = P(h | D), colour = prediction at x
              </text>
              {post.map((v, i) => {
                const r = (
                  <g key={i}>
                    <rect
                      x={s.x(x0)}
                      width={Math.max(0, s.x(x0 + v) - s.x(x0))}
                      y={s.y(1.85)}
                      height={s.y(1.2) - s.y(1.85)}
                      fill={pred[i] === '+' ? 'var(--c-pos)' : 'var(--c-neg)'}
                      opacity={i === map ? 0.95 : 0.55}
                      stroke="var(--surface)"
                      strokeWidth={2}
                    />
                    {v > 0.06 && (
                      <text x={(s.x(x0) + s.x(x0 + v)) / 2} y={s.y(1.48)} textAnchor="middle" className="anno-strong" style={{ fill: '#fff' }}>
                        h{i + 1}: {pred[i]} {i === map ? '(MAP)' : ''}
                      </text>
                    )}
                  </g>
                );
                x0 += v;
                return r;
              })}
              <text x={s.left} y={s.y(1.0)} className="anno-strong">
                posterior predictive P(y | x, D)
              </text>
              <rect x={s.x(0)} width={s.x(pPlus) - s.x(0)} y={s.y(0.8)} height={s.y(0.15) - s.y(0.8)} fill="var(--c-pos)" opacity={0.8} />
              <rect x={s.x(pPlus)} width={s.x(1) - s.x(pPlus)} y={s.y(0.8)} height={s.y(0.15) - s.y(0.8)} fill="var(--c-neg)" opacity={0.8} />
              {pPlus > 0.06 && (
                <text x={s.x(pPlus / 2)} y={s.y(0.43)} textAnchor="middle" className="anno-strong" style={{ fill: '#fff' }}>
                  + : {fmt(pPlus, 2)}
                </text>
              )}
              {pPlus < 0.94 && (
                <text x={s.x((1 + pPlus) / 2)} y={s.y(0.43)} textAnchor="middle" className="anno-strong" style={{ fill: '#fff' }}>
                  − : {fmt(1 - pPlus, 2)}
                </text>
              )}
              <line x1={s.x(0.5)} x2={s.x(0.5)} y1={s.y(0.9)} y2={s.y(0.05)} stroke="var(--ink)" strokeDasharray="4 3" />
            </>
          )}
        </Chart>
        <div className="btn-row">
          <button className="btn" onClick={() => sample(1)}>
            Gibbs: draw one hypothesis
          </button>
          <button className="btn" onClick={() => sample(1000)}>
            Gibbs × 1,000
          </button>
          {draws.length === 1 && (
            <span className="kbd-hint">
              drew h{draws[0] + 1} → predicts {pred[draws[0]]}
            </span>
          )}
          {draws.length > 1 && <span className="kbd-hint">predicted + in {fmt(gibbsPlus * 100, 1)}% of draws</span>}
        </div>
      </div>
      <div className="controls">
        {w.map((v, i) => (
          <div key={i}>
            <Slider
              label={`weight of h${i + 1} (normalised ${fmt(post[i], 3)})`}
              value={v}
              min={0}
              max={1}
              step={0.01}
              onChange={(nv) => setW((prev) => prev.map((x, j) => (j === i ? nv : x)))}
              format={(x) => fmt(x, 2)}
            />
            <button className="pill" onClick={() => setPred((prev) => prev.map((x, j) => (j === i ? (x === '+' ? '−' : '+') : x)))}>
              h{i + 1} predicts {pred[i]} (click to flip)
            </button>
          </div>
        ))}
        <Readout
          items={[
            { label: 'MAP hypothesis predicts', value: pred[map] },
            { label: 'Bayes optimal predicts', value: bayes, tone: 'accent' },
            { label: 'error of always +', value: fmt(1 - pPlus, 3) },
            { label: 'error of always −', value: fmt(pPlus, 3) },
            { label: 'Gibbs expected error', value: fmt(gibbsErr, 3) },
          ]}
        />
      </div>
    </div>
  );
}
