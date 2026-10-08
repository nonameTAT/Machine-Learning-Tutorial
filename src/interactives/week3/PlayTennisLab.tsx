import { useState } from 'react';
import { MB } from '../../components/Math';
import { Readout, Segmented } from '../../components/ui';
import { fadd, fdiv, frac, fprod, fstr, ftex, fval, type Frac } from '../../lib/frac';
import { fmt } from '../../lib/num';

// The PlayTennis training data.
export const ATTRS = [
  { name: 'outlook', values: ['sunny', 'overcast', 'rainy'] },
  { name: 'temperature', values: ['hot', 'mild', 'cool'] },
  { name: 'humidity', values: ['high', 'normal'] },
  { name: 'windy', values: ['false', 'true'] },
] as const;
export const TENNIS: [string, string, string, string, 'yes' | 'no'][] = [
  ['sunny', 'hot', 'high', 'false', 'no'],
  ['sunny', 'hot', 'high', 'true', 'no'],
  ['overcast', 'hot', 'high', 'false', 'yes'],
  ['rainy', 'mild', 'high', 'false', 'yes'],
  ['rainy', 'cool', 'normal', 'false', 'yes'],
  ['rainy', 'cool', 'normal', 'true', 'no'],
  ['overcast', 'cool', 'normal', 'true', 'yes'],
  ['sunny', 'mild', 'high', 'false', 'no'],
  ['sunny', 'cool', 'normal', 'false', 'yes'],
  ['rainy', 'mild', 'normal', 'false', 'yes'],
  ['sunny', 'mild', 'normal', 'true', 'yes'],
  ['overcast', 'mild', 'high', 'true', 'yes'],
  ['overcast', 'hot', 'normal', 'false', 'yes'],
  ['rainy', 'mild', 'high', 'true', 'no'],
];
const CLASSES = ['yes', 'no'] as const;
type Cls = (typeof CLASSES)[number];
const MISSING = '?';

/** P(attribute j = v | class), add-α smoothed over the attribute’s K possible values. */
function condProb(j: number, v: string, c: Cls, alpha: number): { p: Frac; count: number; nc: number; k: number } {
  const rows = TENNIS.filter((r) => r[4] === c);
  const count = rows.filter((r) => r[j] === v).length;
  const k = ATTRS[j].values.length;
  return { p: frac(count + alpha, rows.length + alpha * k), count, nc: rows.length, k };
}

export function scoreTennis(query: string[], alpha: number) {
  return CLASSES.map((c) => {
    const nc = TENNIS.filter((r) => r[4] === c).length;
    const prior = frac(nc, TENNIS.length);
    const factors = query.map((v, j) => (v === MISSING ? null : condProb(j, v, c, alpha)));
    const score = fprod([prior, ...factors.filter((f) => f !== null).map((f) => f!.p)]);
    return { c, prior, factors, score };
  });
}

export function PlayTennisLab({ initialQuery = ['sunny', 'cool', 'high', 'true'], initialAlpha = 0 }: { initialQuery?: string[]; initialAlpha?: number }) {
  const [query, setQuery] = useState<string[]>(initialQuery);
  const [alpha, setAlpha] = useState(initialAlpha);
  const res = scoreTennis(query, alpha);
  const total = fadd(res[0].score, res[1].score);
  const post = res.map((r) => (total.n === 0 ? frac(NaN) : fdiv(r.score, total)));
  const win = fval(res[0].score) > fval(res[1].score) ? 'yes' : fval(res[0].score) < fval(res[1].score) ? 'no' : 'tie';

  // keep unreduced numerators/denominators so the counting is visible
  const rawTex = (r: (typeof res)[number]) =>
    `s_{\\text{${r.c}}} = \\tfrac{${TENNIS.filter((x) => x[4] === r.c).length}}{14}${r.factors
      .map((f) => (f ? ` \\times \\tfrac{${f.count + alpha}}{${f.nc + alpha * f.k}}` : ''))
      .join('')} = ${ftex(r.score)} \\approx ${fval(r.score).toFixed(6)}`;

  return (
    <div>
      <div className="btn-row" style={{ flexWrap: 'wrap' }}>
        {ATTRS.map((a, j) => (
          <Segmented
            key={a.name}
            label={a.name}
            options={[...a.values, MISSING].map((v) => ({ value: v, label: v === MISSING ? `${a.name} ?` : a.name === 'windy' ? `windy = ${v}` : v }))}
            value={query[j]}
            onChange={(v) => setQuery((q) => q.map((x, i) => (i === j ? v : x)))}
          />
        ))}
      </div>
      <div className="btn-row">
        <Segmented
          label="smoothing"
          options={[
            { value: '0', label: 'no smoothing' },
            { value: '1', label: 'Laplace (α = 1)' },
          ]}
          value={String(alpha)}
          onChange={(v) => setAlpha(Number(v))}
        />
      </div>
      <div className="lab-grid">
        <div>
          <div className="table-wrap num" style={{ maxHeight: 330, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {ATTRS.map((a) => (
                    <th key={a.name}>{a.name}</th>
                  ))}
                  <th>play</th>
                </tr>
              </thead>
              <tbody>
                {TENNIS.map((r, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    {ATTRS.map((_, j) => (
                      <td key={j} style={r[j] === query[j] ? { background: r[4] === 'yes' ? 'color-mix(in srgb, var(--c-pos) 18%, var(--surface))' : 'color-mix(in srgb, var(--c-neg) 18%, var(--surface))', fontWeight: 650 } : undefined}>
                        {r[j]}
                      </td>
                    ))}
                    <td style={{ color: r[4] === 'yes' ? 'var(--c-pos)' : 'var(--c-neg)', fontWeight: 650 }}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">Highlighted cells match the query; count them within each class (blue = yes rows, orange = no rows).</p>
        </div>
        <div>
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th>factor</th>
                  <th>yes</th>
                  <th>no</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>prior</td>
                  <td>9/14</td>
                  <td>5/14</td>
                </tr>
                {query.map((v, j) => (
                  <tr key={j}>
                    <td>
                      {ATTRS[j].name} = {v}
                    </td>
                    {res.map((r) => {
                      const f = r.factors[j];
                      return (
                        <td key={r.c} style={f && f.count + alpha === 0 ? { color: 'var(--c-bad)', fontWeight: 700 } : undefined}>
                          {f ? (alpha ? `(${f.count} + 1)/(${f.nc} + ${f.k}) = ${f.count + 1}/${f.nc + f.k}` : `${f.count}/${f.nc}`) : 'omitted'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {res.map((r) => (
        <MB key={r.c} t={rawTex(r)} />
      ))}
      <Readout
        items={[
          { label: 'P(yes | x)', value: Number.isNaN(post[0].n) ? 'undefined' : `${fstr(post[0])} ≈ ${fmt(fval(post[0]), 4)}`, tone: 'accent' },
          { label: 'P(no | x)', value: Number.isNaN(post[1].n) ? 'undefined' : `${fstr(post[1])} ≈ ${fmt(fval(post[1]), 4)}`, tone: 'accent' },
          { label: 'prediction', value: win === 'tie' ? (total.n === 0 ? 'undefined (all scores 0)' : 'tie') : win },
        ]}
      />
      {res.some((r) => r.score.n === 0) && (
        <div className="status bad">
          A zero count makes the {res.find((r) => r.score.n === 0)!.c} score exactly 0, whatever the other features say — the zero-frequency problem
          (lesson 11).
        </div>
      )}
    </div>
  );
}
