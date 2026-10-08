import { useMemo, useState } from 'react';
import { Readout, Segmented, Slider } from '../../components/ui';
import { fmt, rng } from '../../lib/num';
import { knnPredict, sigmoid, type Label } from '../../lib/classify';

type Method = 'holdout' | 'kfold' | 'loocv';
const M_DEV = 20;

/** Contiguous folds over 0..m−1: fold sizes differ by at most one. */
function blockFolds(m: number, K: number): number[] {
  return Array.from({ length: m }, (_, i) => Math.min(K - 1, Math.floor((i * K) / m)));
}

/** Diagram of which observations train and which validate in each fit. */
export function FoldLab() {
  const [method, setMethod] = useState<Method>('kfold');
  const [K, setK] = useState(5);
  const fits = method === 'holdout' ? 1 : method === 'loocv' ? M_DEV : K;
  const fold = method === 'kfold' ? blockFolds(M_DEV, K) : method === 'loocv' ? Array.from({ length: M_DEV }, (_, i) => i) : [];
  const isVal = (fit: number, i: number) => (method === 'holdout' ? i >= 14 : fold[i] === fit);
  const valSizes = Array.from({ length: fits }, (_, f) => Array.from({ length: M_DEV }, (_, i) => isVal(f, i)).filter(Boolean).length);
  const minV = Math.min(...valSizes);
  const maxV = Math.max(...valSizes);
  const range = (a: number, b: number) => (a === b ? `${a}` : `${a}–${b}`);
  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'holdout', label: 'Holdout' },
            { value: 'kfold', label: 'K-fold' },
            { value: 'loocv', label: 'Leave-one-out' },
          ]}
          value={method}
          onChange={setMethod}
        />
      </div>
      {method === 'kfold' && <Slider label="number of folds K" value={K} min={2} max={10} step={1} onChange={setK} />}
      <div className="folds" role="img" aria-label="Fold diagram">
        {Array.from({ length: fits }, (_, f) => (
          <div key={f} className="fold-row">
            <span className="fold-label">fit {f + 1}</span>
            {Array.from({ length: M_DEV }, (_, i) => (
              <span key={i} className={`fold-cell ${isVal(f, i) ? 'val' : 'train'}`} />
            ))}
            <span style={{ width: 10 }} />
            {Array.from({ length: 5 }, (_, i) => (
              <span key={`t${i}`} className="fold-cell test" style={{ flex: 1 }} />
            ))}
          </div>
        ))}
      </div>
      <div className="legend">
        <span className="legend-item">
          <span className="swatch" style={{ background: 'color-mix(in srgb, var(--c-data) 55%, var(--surface))' }} /> training
        </span>
        <span className="legend-item">
          <span className="swatch" style={{ background: 'var(--c-var)' }} /> validation (held out in this fit)
        </span>
        <span className="legend-item">
          <span className="swatch" style={{ background: 'var(--muted)' }} /> test set — reserved, never used for choosing
        </span>
      </div>
      <Readout
        items={[
          { label: 'fits to run', value: fits, tone: 'accent' },
          { label: 'training size per fit', value: range(M_DEV - maxV, M_DEV - minV) },
          { label: 'validation size per fit', value: range(minV, maxV) },
          { label: 'times each point is validated', value: method === 'holdout' ? '0 or 1' : '1' },
        ]}
      />
    </div>
  );
}

/* ---------------- choosing k by K-fold cross-validation ---------------- */

const KS = [1, 3, 5, 9, 15, 21];
const M = 30;
const truthP = (x: number) => sigmoid(1.2 * (x - 5));

function sample(seed: number, m: number) {
  const r = rng(seed);
  const X: number[][] = [];
  const y: Label[] = [];
  for (let i = 0; i < m; i++) {
    const x = r.range(0, 10);
    X.push([x]);
    y.push(r.uniform() < truthP(x) ? 1 : 0);
  }
  return { X, y };
}

function shuffledFolds(m: number, K: number, seed: number) {
  const r = rng(seed);
  const order = Array.from({ length: m }, (_, i) => i);
  for (let i = m - 1; i > 0; i--) {
    const j = Math.floor(r.uniform() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const fold = new Array(m).fill(0);
  order.forEach((obs, pos) => (fold[obs] = Math.min(K - 1, Math.floor((pos * K) / m))));
  return fold;
}

const FRESH = sample(9999, 4000);

export function CVSelectLab() {
  const [dataSeed, setDataSeed] = useState(3);
  const [foldSeed, setFoldSeed] = useState(1);
  const [K, setK] = useState(5);
  const { X, y } = useMemo(() => sample(dataSeed, M), [dataSeed]);
  const fold = useMemo(() => shuffledFolds(M, K, foldSeed), [K, foldSeed]);

  const table = useMemo(
    () =>
      KS.map((k) => {
        const mistakes = Array.from({ length: K }, (_, f) => {
          const tr = X.map((_, i) => i).filter((i) => fold[i] !== f);
          const Xtr = tr.map((i) => X[i]);
          const ytr = tr.map((i) => y[i]);
          return X.reduce((s, x, i) => s + (fold[i] === f && knnPredict(Xtr, ytr, x, Math.min(k, Xtr.length)) !== y[i] ? 1 : 0), 0);
        });
        const cv = mistakes.reduce((a, b) => a + b, 0) / M;
        const fresh = FRESH.X.reduce((s, x, i) => s + (knnPredict(X, y, x, k) !== FRESH.y[i] ? 1 : 0), 0) / FRESH.X.length;
        return { k, mistakes, cv, fresh };
      }),
    [X, y, fold, K],
  );
  const best = table.reduce((b, r) => (r.cv < b.cv ? r : b), table[0]);
  const foldSizes = Array.from({ length: K }, (_, f) => fold.filter((v) => v === f).length);

  return (
    <div>
      <Slider label="number of folds K" value={K} min={2} max={10} step={1} onChange={setK} />
      <div className="btn-row">
        <button className="btn" onClick={() => setFoldSeed((s) => s + 1)}>
          Reshuffle the folds
        </button>
        <button className="btn" onClick={() => setDataSeed((s) => s + 1)}>
          Draw a new dataset
        </button>
        <span className="kbd-hint">fold sizes: {foldSizes.join(', ')}</span>
      </div>
      <div className="table-wrap num">
        <table>
          <thead>
            <tr>
              <th>k (neighbours)</th>
              {Array.from({ length: K }, (_, f) => (
                <th key={f}>fold {f + 1}</th>
              ))}
              <th>CV error</th>
              <th>error on 4,000 fresh points</th>
            </tr>
          </thead>
          <tbody>
            {table.map((r) => (
              <tr key={r.k} style={{ background: r.k === best.k ? 'var(--accent-soft)' : undefined }}>
                <td>
                  {r.k} {r.k === best.k && '← chosen'}
                </td>
                {r.mistakes.map((c, f) => (
                  <td key={f}>{c}</td>
                ))}
                <td>
                  {r.mistakes.reduce((a, b) => a + b, 0)}/{M} = {fmt(r.cv, 3)}
                </td>
                <td className="muted">{fmt(r.fresh, 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">
        Cells are validation mistakes of k-NN in each fold (m = {M} development points, 1 feature, labels drawn from a smooth P(y = 1 | x)). Ties in CV
        error go to the smaller k. The last column is an oracle you never have in practice: it shows how far the CV estimate is from the truth.
      </p>
    </div>
  );
}
