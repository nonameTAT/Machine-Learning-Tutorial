import { useState } from 'react';
import { Readout, Slider } from '../../../components/ui';
import { fmt } from '../../../lib/num';

// Examples with identical inputs reach the same leaf of any tree that tests only those inputs, so
// disagreement inside an input tuple is error that no amount of splitting removes.

const TUPLES = ['000', '001', '010', '011', '100', '101', '110', '111'];
// [count with Y = 0, count with Y = 1] for each (A, B, C), from the 12-example table
const INITIAL: [number, number][] = [
  [1, 0],
  [2, 0],
  [1, 0],
  [1, 1],
  [1, 0],
  [0, 1],
  [0, 2],
  [1, 1],
];

export function ConflictLab() {
  const [cnt, setCnt] = useState(INITIAL.map((c) => [...c]));
  const bump = (i: number, j: number, d: number) => setCnt(cnt.map((c, a) => (a === i ? c.map((v, b) => (b === j ? Math.max(0, Math.min(5, v + d)) : v)) : c)));
  const n = cnt.reduce((s, c) => s + c[0] + c[1], 0);
  const emin = cnt.reduce((s, c) => s + Math.min(c[0], c[1]), 0);
  return (
    <div>
      <div className="table-wrap num">
        <table>
          <thead>
            <tr>
              <th>A B C</th>
              <th>Y = 0</th>
              <th>Y = 1</th>
              <th>leaf predicts</th>
              <th>unavoidable errors</th>
            </tr>
          </thead>
          <tbody>
            {cnt.map((c, i) => {
              const tot = c[0] + c[1];
              const conflict = c[0] > 0 && c[1] > 0;
              return (
                <tr key={i} className={conflict ? 'row-conflict' : undefined}>
                  <td className="mono">{TUPLES[i].split('').join(' ')}</td>
                  {[0, 1].map((j) => (
                    <td key={j}>
                      <span className="stepper">
                        <button className="btn btn-ghost" onClick={() => bump(i, j, -1)} aria-label={`fewer Y = ${j} at ${TUPLES[i]}`}>
                          −
                        </button>
                        <span>{c[j]}</span>
                        <button className="btn btn-ghost" onClick={() => bump(i, j, 1)} aria-label={`more Y = ${j} at ${TUPLES[i]}`}>
                          +
                        </button>
                      </span>
                    </td>
                  ))}
                  <td>{tot === 0 ? '—' : c[0] === c[1] ? 'either (tie)' : c[0] > c[1] ? '0' : '1'}</td>
                  <td>{tot === 0 ? '—' : Math.min(c[0], c[1])}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Readout
        items={[
          { label: 'examples', value: String(n) },
          { label: 'fewest possible training errors', value: `${emin} of ${n}`, tone: 'accent' },
          { label: 'as a fraction', value: n ? fmt(emin / n, 4) : '—' },
        ]}
      />
      <p className="small muted">
        A tree that tests A, then B, then C gives every tuple its own leaf, labelled by majority, and makes exactly E_min errors. Highlighted rows are the
        tuples that force a mistake.
      </p>
    </div>
  );
}

/** The worst case: every example has the same inputs and the labels are spread as evenly as possible over k classes. */
export function WorstCaseLab() {
  const [k, setK] = useState(3);
  const [n, setN] = useState(12);
  const nn = Math.max(n, k);
  const per = Array.from({ length: k }, (_, j) => Math.floor(nn / k) + (j < nn % k ? 1 : 0));
  const right = Math.max(...per);
  const fills = ['var(--c-pos)', 'var(--c-neg)', 'var(--c-alt)', 'var(--c-good)', 'var(--c-var)', 'var(--c-bias)'];
  return (
    <div className="lab-grid">
      <div>
        <div className="token-row" aria-label={`${nn} examples with identical inputs, labels spread over ${k} classes`}>
          {per.flatMap((m, j) =>
            Array.from({ length: m }, (_, i) => (
              <span key={`${j}-${i}`} className={`token-dot ${j === 0 ? 'kept' : ''}`} style={{ background: fills[j] }} title={`class ${j + 1}`} />
            )),
          )}
        </div>
        <p className="small muted">
          All {nn} examples share one input tuple, so they share one leaf. The leaf predicts class 1 (outlined); every other label is an error.
        </p>
      </div>
      <div className="controls">
        <Slider label="number of classes k" value={k} min={2} max={6} step={1} onChange={setK} />
        <Slider label="number of examples n" value={nn} min={k} max={30} step={1} onChange={setN} />
        <Readout
          items={[
            { label: 'correct (largest class)', value: `⌈n/k⌉ = ${right}` },
            { label: 'training error', value: `${nn - right}/${nn} = ${fmt((nn - right) / nn, 4)}`, tone: 'accent' },
            { label: 'limit 1 − 1/k', value: fmt(1 - 1 / k, 4) },
          ]}
        />
      </div>
    </div>
  );
}
