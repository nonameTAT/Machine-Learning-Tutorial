import { useState } from 'react';
import { rates, type Counts } from '../../lib/classify';
import { fmt } from '../../lib/num';

type Cell = keyof Counts;
interface MetricDef {
  key: string;
  name: string;
  formula: string;
  question: string;
  num: Cell[];
  den: Cell[];
  value: (r: ReturnType<typeof rates>) => number;
}

const METRICS: MetricDef[] = [
  { key: 'acc', name: 'Accuracy', formula: '(TP + TN) / m', question: 'Of all cases, how many labels were correct?', num: ['tp', 'tn'], den: ['tp', 'fn', 'fp', 'tn'], value: (r) => r.acc },
  { key: 'err', name: 'Error', formula: '(FP + FN) / m = 1 − accuracy', question: 'Of all cases, how many were wrong?', num: ['fp', 'fn'], den: ['tp', 'fn', 'fp', 'tn'], value: (r) => r.err },
  { key: 'prec', name: 'Precision', formula: 'TP / (TP + FP)', question: 'Of the predicted positives, how many really are positive?', num: ['tp'], den: ['tp', 'fp'], value: (r) => r.prec },
  { key: 'rec', name: 'Recall (TPR, sensitivity)', formula: 'TP / (TP + FN)', question: 'Of the actual positives, how many were found?', num: ['tp'], den: ['tp', 'fn'], value: (r) => r.rec },
  { key: 'f1', name: 'F1', formula: '2TP / (2TP + FP + FN)', question: 'Harmonic mean of precision and recall (ignores TN).', num: ['tp'], den: ['tp', 'fp', 'fn'], value: (r) => r.f1 },
  { key: 'fpr', name: 'False-positive rate', formula: 'FP / (FP + TN)', question: 'Of the actual negatives, how many were wrongly flagged?', num: ['fp'], den: ['fp', 'tn'], value: (r) => r.fpr },
];

const PRESETS: { label: string; c: Counts }[] = [
  { label: 'Worked example', c: { tp: 12, fn: 8, fp: 6, tn: 74 } },
  { label: 'Predict everything negative', c: { tp: 0, fn: 20, fp: 0, tn: 80 } },
  { label: 'Rare positives', c: { tp: 2, fn: 3, fp: 5, tn: 990 } },
  { label: 'Flag everything', c: { tp: 20, fn: 0, fp: 80, tn: 0 } },
];

export function ConfusionLab() {
  const [c, setC] = useState<Counts>(PRESETS[0].c);
  const [sel, setSel] = useState('prec');
  const r = rates(c);
  const def = METRICS.find((m) => m.key === sel)!;
  const cls = (k: Cell) => (def.num.includes(k) ? 'cell num-hl' : def.den.includes(k) ? 'cell den-hl' : 'cell');
  const input = (k: Cell, tag: string) => (
    <td className={cls(k)}>
      <input
        className="input"
        type="number"
        min={0}
        value={c[k]}
        aria-label={tag}
        style={{ width: 72, textAlign: 'center', fontSize: 16 }}
        onChange={(e) => setC({ ...c, [k]: Math.max(0, Math.floor(Number(e.target.value) || 0)) })}
      />
      <span className="cm-tag">{tag}</span>
    </td>
  );
  const show = (v: number) => (Number.isNaN(v) ? 'undefined (0/0)' : fmt(v, 3));
  return (
    <div>
      <div className="btn-row">
        {PRESETS.map((p) => (
          <button key={p.label} className="btn" onClick={() => setC(p.c)}>
            {p.label}
          </button>
        ))}
      </div>
      <div className="lab-grid">
        <div>
          <div className="table-wrap cm">
            <table>
              <thead>
                <tr>
                  <th>actual ↓ / predicted →</th>
                  <th>positive</th>
                  <th>negative</th>
                  <th>total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>positive</th>
                  {input('tp', 'TP')}
                  {input('fn', 'FN')}
                  <td>{c.tp + c.fn}</td>
                </tr>
                <tr>
                  <th>negative</th>
                  {input('fp', 'FP')}
                  {input('tn', 'TN')}
                  <td>{c.fp + c.tn}</td>
                </tr>
                <tr className="total">
                  <th>total</th>
                  <td>{c.tp + c.fp}</td>
                  <td>{c.fn + c.tn}</td>
                  <td>{r.m}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="legend">
            <span className="legend-item">
              <span className="swatch" style={{ background: 'color-mix(in srgb, var(--accent) 24%, var(--surface))' }} /> numerator
            </span>
            <span className="legend-item">
              <span className="swatch" style={{ background: 'color-mix(in srgb, var(--c-var) 18%, var(--surface))' }} /> rest of the denominator
            </span>
          </div>
          <div className="status">
            <strong>{def.name}</strong> = {def.formula} = <strong>{show(def.value(r))}</strong>. {def.question}
          </div>
          <div className="status">
            Baseline “predict everything negative” on these data: accuracy {show(r.m ? (c.fp + c.tn) / r.m : NaN)}, recall 0.
          </div>
        </div>
        <div className="metric-list" role="radiogroup" aria-label="Metric">
          {METRICS.map((m) => (
            <button key={m.key} role="radio" aria-checked={sel === m.key} className={`metric-row ${sel === m.key ? 'on' : ''}`} onClick={() => setSel(m.key)}>
              <span>{m.name}</span>
              <span className="mv">{show(m.value(r))}</span>
              <span className="mq">{m.formula}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
