import { useState } from 'react';
import { M } from '../../components/Math';
import { Readout, Slider } from '../../components/ui';
import { fmt } from '../../lib/num';

/** Parameter count of a full class-conditional table versus Naive Bayes. */
export function ParamCountLab() {
  const [d, setD] = useState(20);
  const full = 2 ** d - 1;
  return (
    <div>
      <Slider label="number of binary features d" value={d} min={1} max={40} step={1} onChange={setD} />
      <Readout
        items={[
          { label: 'possible feature vectors per class', value: (2 ** d).toLocaleString('en') },
          { label: 'full table: free probabilities per class', value: full.toLocaleString('en'), tone: 'bad' },
          { label: 'Naive Bayes: per class', value: d, tone: 'good' },
        ]}
      />
      <p className="small muted">
        Most of those {(2 ** d).toLocaleString('en')} combinations will never appear in a training set, so their probabilities cannot be counted.
      </p>
    </div>
  );
}

/**
 * Within one class: two binary features with marginals a, b and a dependence δ = P(1,1) − ab.
 * Naive Bayes replaces the true joint by the product of marginals (δ = 0).
 */
export function JointVsProductLab() {
  const [a, setA] = useState(0.6);
  const [b, setB] = useState(0.6);
  const [t, setT] = useState(0);
  // δ ranges over the values that keep every cell in [0, 1]; t ∈ [−1, 1] picks a point in that range
  const lo = Math.max(-a * b, -(1 - a) * (1 - b));
  const hi = Math.min(a * (1 - b), (1 - a) * b);
  const delta = t >= 0 ? t * hi : -t * lo;
  const joint = [
    [(1 - a) * (1 - b) + delta, (1 - a) * b - delta],
    [a * (1 - b) - delta, a * b + delta],
  ];
  const prod = [
    [(1 - a) * (1 - b), (1 - a) * b],
    [a * (1 - b), a * b],
  ];
  const maxErr = Math.max(...[0, 1].flatMap((i) => [0, 1].map((j) => Math.abs(joint[i][j] - prod[i][j]))));
  const cell = (v: number, p: number) => (
    <td>
      {fmt(v, 3)}
      <span className="cm-tag" style={{ display: 'block' }}>
        NB: {fmt(p, 3)}
      </span>
    </td>
  );
  return (
    <div className="lab-grid">
      <div className="table-wrap num cm">
        <table>
          <thead>
            <tr>
              <th>within class c</th>
              <th>x₂ = 0</th>
              <th>x₂ = 1</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>x₁ = 0</th>
              {cell(joint[0][0], prod[0][0])}
              {cell(joint[0][1], prod[0][1])}
            </tr>
            <tr>
              <th>x₁ = 1</th>
              {cell(joint[1][0], prod[1][0])}
              {cell(joint[1][1], prod[1][1])}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="controls">
        <Slider label={<M t="P(x_1 = 1 \mid c)" />} value={a} min={0.05} max={0.95} step={0.01} onChange={setA} format={(v) => fmt(v, 2)} />
        <Slider label={<M t="P(x_2 = 1 \mid c)" />} value={b} min={0.05} max={0.95} step={0.01} onChange={setB} format={(v) => fmt(v, 2)} />
        <Slider label="dependence within the class" value={t} min={-1} max={1} step={0.05} onChange={setT} format={(v) => (v === 0 ? 'independent' : v === 1 ? 'maximal +' : v === -1 ? 'maximal −' : fmt(v, 2))} />
        <Readout
          items={[
            { label: 'P(x₂=1 | x₁=1, c)', value: fmt(joint[1][1] / a, 3), tone: 'accent' },
            { label: 'P(x₂=1 | c)', value: fmt(b, 3) },
            { label: 'largest cell error of NB', value: fmt(maxErr, 3) },
          ]}
        />
        <p className="small muted">
          With equal marginals and maximal + dependence the two features are identical copies: P(x₂ = 1 | x₁ = 1, c) = 1.
        </p>
      </div>
    </div>
  );
}
