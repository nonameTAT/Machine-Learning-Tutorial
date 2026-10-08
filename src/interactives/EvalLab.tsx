import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../components/Chart';
import { M } from '../components/Math';
import { Readout } from '../components/ui';
import { fmt, lstsq, mean, metrics, polyEval, polyRow, rng, type Mat } from '../lib/num';
import { asFraction } from './OLSCalc';
import { sinData } from './RegLab';

/* ---------------- metrics calculator ---------------- */

export function MetricsLab() {
  const [rows, setRows] = useState<[string, string][]>([
    ['13', '12'],
    ['8', '9'],
    ['11', '8'],
    ['2', '7'],
    ['6', '4'],
  ]);
  const [nPred, setNPred] = useState('1');
  const y = rows.map((r) => Number(r[0]));
  const yh = rows.map((r) => Number(r[1]));
  const ok = rows.length >= 2 && y.every(Number.isFinite) && yh.every(Number.isFinite);
  const n = Math.max(0, Math.floor(Number(nPred) || 0));
  const M_ = ok ? metrics(y, yh, n) : null;
  const base = ok ? metrics(y, y.map(() => mean(y)), 0) : null;
  const sh = (v: number) => {
    const f = asFraction(v, 500);
    return f ? `${fmt(v, 4)} (${f})` : fmt(v, 4);
  };
  const set = (i: number, k: 0 | 1, v: string) => setRows((p) => p.map((r, j) => (j === i ? ((k === 0 ? [v, r[1]] : [r[0], v]) as [string, string]) : r)));
  return (
    <div className="lab-grid">
      <div>
        <div className="table-wrap num">
          <table>
            <thead>
              <tr>
                <th>j</th>
                <th>yⱼ</th>
                <th>ŷⱼ</th>
                <th>eⱼ</th>
                <th>eⱼ²</th>
                <th>|eⱼ|</th>
                <th>(yⱼ − ȳ)²</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const e = Number(r[0]) - Number(r[1]);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <input className="input" value={r[0]} onChange={(ev) => set(i, 0, ev.target.value)} />
                    </td>
                    <td>
                      <input className="input" value={r[1]} onChange={(ev) => set(i, 1, ev.target.value)} />
                    </td>
                    <td style={{ color: 'var(--c-res)' }}>{fmt(e, 3)}</td>
                    <td>{fmt(e * e, 3)}</td>
                    <td>{fmt(Math.abs(e), 3)}</td>
                    <td>{ok ? fmt((Number(r[0]) - mean(y)) ** 2, 3) : '—'}</td>
                    <td>
                      <button className="btn btn-ghost" onClick={() => setRows((p) => p.filter((_, j) => j !== i))} disabled={rows.length <= 2} aria-label="remove row">
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="btn-row">
          <button className="btn" onClick={() => setRows((p) => [...p, ['0', '0']])}>
            + row
          </button>
          <button
            className="btn btn-ghost"
            onClick={() =>
              setRows([
                ['0', '0'],
                ['0', '0'],
                ['6', '0'],
              ])
            }
          >
            Residuals (0, 0, 6)
          </button>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            predictors n (excl. intercept)
            <input className="input" style={{ width: 60 }} value={nPred} onChange={(e) => setNPred(e.target.value)} />
          </label>
        </div>
      </div>
      <div>
        {M_ && base ? (
          <>
            <Readout
              items={[
                { label: 'SSE', value: sh(M_.sse) },
                { label: 'MSE', value: sh(M_.mse) },
                { label: 'RMSE', value: fmt(M_.rmse, 4), tone: 'accent' },
                { label: 'MAE', value: sh(M_.mae), tone: 'accent' },
                { label: 'SST', value: sh(M_.sst) },
                { label: 'R²', value: Number.isFinite(M_.r2) ? sh(M_.r2) : 'undefined (SST = 0)', tone: M_.r2 < 0 ? 'bad' : 'accent' },
                { label: 'adjusted R²', value: Number.isFinite(M_.adjR2) ? sh(M_.adjR2) : 'needs m > n + 1' },
                { label: 'baseline RMSE (predict ȳ)', value: fmt(base.rmse, 4) },
              ]}
            />
            <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
              <M t="R^2 = 1 - \SSE/\SST" /> compares your squared error with the constant prediction ȳ. R² &lt; 0 means you did worse than that baseline.
            </p>
          </>
        ) : (
          <div className="status bad">Enter at least two numeric rows.</div>
        )}
      </div>
    </div>
  );
}

/* ---------------- protocol: train / validation / test ---------------- */

export function ProtocolLab() {
  const { train, val, test } = useMemo(() => {
    const a = sinData(21, 14, 30);
    const b = sinData(22, 2, 30);
    return { train: a.train, val: a.val, test: b.val };
  }, []);
  const z = (x: number) => 2 * x - 1;
  const cands = useMemo(
    () =>
      Array.from({ length: 10 }, (_, d) => {
        const th = lstsq(
          train.map(([x]) => polyRow(z(x), d)),
          train.map(([, y]) => y),
        )!;
        const mse = (pts: [number, number][]) => mean(pts.map(([x, y]) => (y - polyEval(th, z(x))) ** 2));
        return { d, tr: mse(train), va: mse(val), te: mse(test) };
      }),
    [train, val, test],
  );
  const [pick, setPick] = useState<number | null>(null);
  const [locked, setLocked] = useState<number | null>(null);
  const [peeked, setPeeked] = useState(false);
  const bestVal = cands.reduce((b, c) => (c.va < b.va ? c : b));
  const bestTest = cands.reduce((b, c) => (c.te < b.te ? c : b));
  const yMax = 0.6;
  return (
    <div>
      <div className="lab-grid">
        <div>
          <Chart W={540} H={280} x={[0, 9]} y={[0, yMax]} xLabel="polynomial degree" yLabel="MSE" xTicks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}>
            {(s) => (
              <>
                <path className="ln-data" d={pathOf(cands.map((c) => [s.x(c.d), s.y(Math.min(c.tr, yMax * 1.5))]))} />
                <path className="ln-alt" d={pathOf(cands.map((c) => [s.x(c.d), s.y(Math.min(c.va, yMax * 1.5))]))} />
                {(locked !== null || peeked) && (
                  <path className="ln-res" fill="none" strokeDasharray="5 4" d={pathOf(cands.map((c) => [s.x(c.d), s.y(Math.min(c.te, yMax * 1.5))]))} />
                )}
                {cands.map((c) => (
                  <circle
                    key={c.d}
                    cx={s.x(c.d)}
                    cy={s.y(Math.min(c.va, yMax))}
                    r={pick === c.d ? 8 : 5}
                    className="pt val"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setPick(c.d)}
                  />
                ))}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'training MSE', cls: 'ln-data' },
              { label: 'validation MSE (click a point to choose)', cls: 'ln-alt' },
              ...(locked !== null || peeked ? [{ label: 'test MSE', cls: 'ln-res', shape: 'dash' as const }] : []),
            ]}
          />
        </div>
        <div className="controls">
          <div className="status">
            {pick === null ? 'Choose a degree by clicking a validation point.' : `Chosen: degree ${pick} (validation MSE ${fmt(cands[pick].va, 4)}).`}
          </div>
          <div className="btn-row">
            <button className="btn btn-primary" disabled={pick === null || locked !== null} onClick={() => setLocked(pick)}>
              Lock in &amp; evaluate on test set
            </button>
            <button className="btn btn-ghost" onClick={() => setPeeked(true)} disabled={peeked}>
              Peek at test errors
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setPick(null);
                setLocked(null);
                setPeeked(false);
              }}
            >
              Reset
            </button>
          </div>
          {locked !== null && (
            <Readout
              items={[
                { label: `test MSE of degree ${locked}`, value: fmt(cands[locked].te, 4), tone: 'accent' },
                { label: `its validation MSE`, value: fmt(cands[locked].va, 4) },
                { label: 'best-by-validation degree', value: bestVal.d },
              ]}
            />
          )}
          {peeked && (
            <div className="status bad">
              You looked at test errors before locking in. Picking the test-best model (degree {bestTest.d}, test MSE {fmt(bestTest.te, 4)}) and reporting
              that number would be optimistic: the test set has been used for selection, so it no longer estimates performance on new data.
            </div>
          )}
          {locked !== null && pick !== locked && <div className="status bad">Changing your choice after seeing the test result turns the test set into a second validation set.</div>}
        </div>
      </div>
    </div>
  );
}

/* ---------------- greedy forward selection ---------------- */

const FEAT = ['x₁', 'x₂', 'x₃', 'x₄', 'x₅'];

export function ForwardSelectionLab() {
  const data = useMemo(() => {
    const r = rng(71);
    const m = 30;
    const X = Array.from({ length: m }, () => {
      const x1 = r.normal();
      const x2 = 0.85 * x1 + 0.5 * r.normal(); // correlated with x1
      const x3 = r.normal();
      return [x1, x2, x3, r.normal(), r.normal()];
    });
    const y = X.map((x) => 2 + 1.5 * x[0] - 1.0 * x[2] + 1.0 * r.normal());
    return { X, y, m };
  }, []);
  const fitR2 = (cols: number[]) => {
    const D: Mat = data.X.map((row) => [1, ...cols.map((c) => row[c])]);
    const th = lstsq(D, data.y)!;
    const yh = D.map((row) => row.reduce((s, v, i) => s + v * th[i], 0));
    return metrics(data.y, yh, cols.length);
  };
  const steps = useMemo(() => {
    const out: { chosen: number[]; cands: { c: number; r2: number; adj: number }[]; r2: number; adj: number }[] = [];
    let chosen: number[] = [];
    out.push({ chosen: [], cands: [], r2: 0, adj: 0 });
    while (chosen.length < 5) {
      const cands = [0, 1, 2, 3, 4]
        .filter((c) => !chosen.includes(c))
        .map((c) => {
          const mm = fitR2([...chosen, c]);
          return { c, r2: mm.r2, adj: mm.adjR2 };
        });
      const best = cands.reduce((b, c) => (c.r2 > b.r2 ? c : b));
      chosen = [...chosen, best.c];
      out.push({ chosen, cands, r2: best.r2, adj: best.adj });
    }
    return out;
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const [k, setK] = useState(1);
  const cur = steps[k];
  const bestAdjStep = steps.slice(1).reduce((b, s, i) => (s.adj > steps[b].adj ? i + 1 : b), 1);
  return (
    <div className="lab-grid">
      <div>
        <div className="panel-title">
          Step {k}: try adding each remaining feature to {'{'}
          {steps[k - 1].chosen.map((c) => FEAT[c]).join(', ') || 'intercept only'}
          {'}'}
        </div>
        <div className="table-wrap num">
          <table>
            <thead>
              <tr>
                <th>candidate</th>
                <th>R² after adding</th>
                <th>adjusted R²</th>
              </tr>
            </thead>
            <tbody>
              {cur.cands.map((c) => (
                <tr key={c.c} style={{ background: c.c === cur.chosen[cur.chosen.length - 1] ? 'var(--accent-soft)' : undefined }}>
                  <td>
                    {FEAT[c.c]} {c.c === cur.chosen[cur.chosen.length - 1] && '← chosen (largest R²)'}
                  </td>
                  <td>{fmt(c.r2, 4)}</td>
                  <td>{fmt(c.adj, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="btn-row">
          <button className="btn" disabled={k <= 1} onClick={() => setK(k - 1)}>
            ← Previous step
          </button>
          <button className="btn btn-primary" disabled={k >= 5} onClick={() => setK(k + 1)}>
            Next step →
          </button>
        </div>
      </div>
      <div>
        <div className="panel-title">Fit quality along the greedy path</div>
        <Chart W={340} H={240} x={[0, 5]} y={[0, 1]} xLabel="features in model" xTicks={[0, 1, 2, 3, 4, 5]} margin={{ l: 38, r: 10, t: 10, b: 34 }}>
          {(s) => (
            <>
              <path className="ln-data" d={pathOf(steps.map((st, i) => [s.x(i), s.y(st.r2)]))} />
              <path className="ln-alt" d={pathOf(steps.map((st, i) => [s.x(i), s.y(Math.max(0, st.adj))]))} />
              <line x1={s.x(k)} x2={s.x(k)} y1={s.top} y2={s.bottom} className="ln-ghost" />
              <circle cx={s.x(bestAdjStep)} cy={s.y(steps[bestAdjStep].adj)} r={5} className="mark" />
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'R²', cls: 'ln-data' },
            { label: 'adjusted R²', cls: 'ln-alt' },
            { label: 'max adjusted R²', cls: 'mark', shape: 'dot' },
          ]}
        />
        <p className="small" style={{ fontFamily: 'var(--font-ui)' }}>
          Truth: y depends on x₁ and x₃ only; x₂ is a noisy copy of x₁, and x₄, x₅ are pure noise. R² keeps rising to the end.{' '}
          {(() => {
            const set = steps[bestAdjStep].chosen;
            const clean = set.length === 2 && set.includes(0) && set.includes(2);
            return clean
              ? 'Adjusted R² peaks exactly when the two useful features are in, then falls as useless ones are added.'
              : `Adjusted R² peaks at ${set.length} features, which includes a useless one — it is only a rough guard; validation error is the better judge.`;
          })()}
        </p>
      </div>
    </div>
  );
}
