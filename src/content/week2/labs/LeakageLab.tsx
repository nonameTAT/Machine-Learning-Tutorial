import { useMemo, useState } from 'react';
import { Chart, Legend } from '../../../components/Chart';
import { Readout, Slider } from '../../../components/ui';
import { fmt, rng } from '../../../lib/num';

const N = 50;
const FOLDS = 5;
const RUNS = 20;

/**
 * One dataset of pure noise: N examples, p standard-normal features, labels shuffled at random (25 of each).
 * Returns 5-fold CV accuracy of a nearest-centroid classifier on the q features whose class means differ most,
 * with the features chosen (a) once on all N examples, or (b) afresh inside every fold.
 */
function runOnce(p: number, q: number, seed: number) {
  const r = rng(seed);
  const X = Array.from({ length: N }, () => Float64Array.from({ length: p }, () => r.normal()));
  const y: number[] = Array.from({ length: N }, (_, i) => (i < N / 2 ? 1 : 0));
  for (let i = N - 1; i > 0; i--) {
    const j = Math.floor(r.uniform() * (i + 1));
    [y[i], y[j]] = [y[j], y[i]];
  }
  const select = (idx: number[]) => {
    const score = new Float64Array(p);
    const n1 = idx.filter((i) => y[i] === 1).length;
    const n0 = idx.length - n1;
    for (let f = 0; f < p; f++) {
      let s1 = 0;
      let s0 = 0;
      for (const i of idx) {
        if (y[i] === 1) s1 += X[i][f];
        else s0 += X[i][f];
      }
      score[f] = Math.abs(s1 / n1 - s0 / n0);
    }
    return Array.from(score.keys())
      .sort((a, b) => score[b] - score[a])
      .slice(0, q);
  };
  const fold = (i: number) => i % FOLDS;
  const cv = (inside: boolean) => {
    const global = inside ? null : select(Array.from({ length: N }, (_, i) => i));
    let correct = 0;
    for (let k = 0; k < FOLDS; k++) {
      const tr = Array.from({ length: N }, (_, i) => i).filter((i) => fold(i) !== k);
      const te = Array.from({ length: N }, (_, i) => i).filter((i) => fold(i) === k);
      const feats = global ?? select(tr);
      const cen = [0, 1].map((c) => {
        const m = tr.filter((i) => y[i] === c);
        return feats.map((f) => m.reduce((s, i) => s + X[i][f], 0) / m.length);
      });
      for (const i of te) {
        const d = cen.map((ce) => feats.reduce((s, f, j) => s + (X[i][f] - ce[j]) ** 2, 0));
        if ((d[1] < d[0] ? 1 : 0) === y[i]) correct += 1;
      }
    }
    return correct / N;
  };
  return { wrong: cv(false), right: cv(true) };
}

/** Feature selection is part of the procedure: do it outside cross-validation and noise looks like signal. */
export function LeakageLab() {
  const [p, setP] = useState(1000);
  const [q, setQ] = useState(20);
  const [seed, setSeed] = useState(1);
  const runs = useMemo(() => Array.from({ length: RUNS }, (_, s) => runOnce(p, q, 1000 * seed + s)), [p, q, seed]);
  const mean = (k: 'wrong' | 'right') => runs.reduce((a, r) => a + r[k], 0) / RUNS;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={540} H={230} x={[0, 1]} y={[-0.6, 1.6]} yTicks={[]} grid={false} xLabel="5-fold cross-validated accuracy (each dot is one dataset)" ariaLabel="Cross-validated accuracy with selection outside and inside the folds">
          {(s) => (
            <>
              <line x1={s.x(0.5)} x2={s.x(0.5)} y1={s.top} y2={s.bottom} className="ln-truth" />
              <text x={s.x(0.5) + 6} y={s.top + 14} className="anno">
                true accuracy: 0.5 (labels are random)
              </text>
              {(['wrong', 'right'] as const).map((k, row) => {
                const yy = row === 0 ? 1 : 0;
                return (
                  <g key={k}>
                    <text x={s.left + 6} y={s.y(yy) - 16} className="anno-strong">
                      {k === 'wrong' ? 'select features on all data, then CV' : 'select features inside every fold'}
                    </text>
                    {runs.map((r, i) => (
                      <circle key={i} cx={s.x(r[k])} cy={s.y(yy) + ((i % 5) - 2) * 3} r={5} className={k === 'wrong' ? 'pt hi' : 'pt'} opacity={0.75} />
                    ))}
                    <line x1={s.x(mean(k))} x2={s.x(mean(k))} y1={s.y(yy) - 12} y2={s.y(yy) + 12} stroke="var(--ink)" strokeWidth={3} />
                  </g>
                );
              })}
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'selection leaks the validation labels', cls: 'pt hi', shape: 'dot' },
            { label: 'selection repeated inside each fold', cls: 'pt', shape: 'dot' },
            { label: 'dashed: the true accuracy; black tick: mean of the 20 datasets', cls: 'ln-truth', shape: 'dash' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="noise features p" value={p} min={50} max={2000} step={50} onChange={setP} />
        <Slider label="features kept q" value={q} min={2} max={50} step={1} onChange={setQ} />
        <button className="btn" onClick={() => setSeed((v) => v + 1)}>
          New datasets
        </button>
        <Readout
          items={[
            { label: 'mean CV accuracy, selection outside', value: fmt(mean('wrong'), 3), tone: 'bad' },
            { label: 'mean CV accuracy, selection inside', value: fmt(mean('right'), 3), tone: 'good' },
          ]}
        />
        <p className="small muted">
          50 examples, labels assigned at random, so nothing can be predicted. The classifier is the nearest-centroid rule of lesson 2, using the q features
          whose class means differ most.
        </p>
      </div>
    </div>
  );
}
