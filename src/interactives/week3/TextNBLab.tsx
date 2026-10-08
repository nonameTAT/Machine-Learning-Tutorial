import { useState } from 'react';
import { MB } from '../../components/Math';
import { Readout, Segmented, Slider, Toggle } from '../../components/ui';
import { frac, fprod, fstr, ftex, fval, type Frac } from '../../lib/frac';
import { fmt } from '../../lib/num';

// Eight training e-mails over the words a–e; d and e are stop words.
export const EMAILS: { id: string; text: string; spam: boolean }[] = [
  { id: 'e1', text: 'b d e b b d e', spam: true },
  { id: 'e2', text: 'b c e b b d d e c c', spam: true },
  { id: 'e3', text: 'a d a d e a e e', spam: true },
  { id: 'e4', text: 'b a d b e d a b', spam: true },
  { id: 'e5', text: 'a b a b a b a e d', spam: false },
  { id: 'e6', text: 'a c a c a c a e d', spam: false },
  { id: 'e7', text: 'e a e d a e a', spam: false },
  { id: 'e8', text: 'd e d e d', spam: false },
];
export const VOCAB = ['a', 'b', 'c'];
const tokens = (s: string) => (s.toLowerCase().match(/[a-e]/g) ?? []) as string[];
export const countsOf = (s: string) => VOCAB.map((w) => tokens(s).filter((t) => t === w).length);
export const bitsOf = (s: string) => countsOf(s).map((n) => (n > 0 ? 1 : 0));

type Model = 'bernoulli' | 'multinomial';
const factorial = (n: number): number => (n <= 1 ? 1 : n * factorial(n - 1));

export function textParams(model: Model, smooth: boolean) {
  return [true, false].map((spam) => {
    const docs = EMAILS.filter((e) => e.spam === spam);
    if (model === 'bernoulli') {
      const present = VOCAB.map((_, j) => docs.filter((e) => bitsOf(e.text)[j] === 1).length);
      return present.map((c) => frac(c + (smooth ? 1 : 0), docs.length + (smooth ? 2 : 0)));
    }
    const tot = VOCAB.map((_, j) => docs.reduce((s, e) => s + countsOf(e.text)[j], 0));
    const T = tot.reduce((a, b) => a + b, 0);
    return tot.map((c) => frac(c + (smooth ? 1 : 0), T + (smooth ? VOCAB.length : 0)));
  });
}

/** Likelihood of a document under one class, as factors (with their TeX) and an exact value. */
export function textLikelihood(model: Model, theta: Frac[], doc: string) {
  if (model === 'bernoulli') {
    const z = bitsOf(doc);
    const factors = theta.map((t, j) => (z[j] ? t : frac(t.d - t.n, t.d)));
    const tex = factors.map((f, j) => (z[j] ? ftex(f) : `(1 - ${ftex(theta[j])})`)).join(' \\times ');
    return { value: fprod(factors), tex, coef: 1 };
  }
  const n = countsOf(doc);
  const L = n.reduce((a, b) => a + b, 0);
  const coef = factorial(L) / n.reduce((p, k) => p * factorial(k), 1);
  const factors = theta.flatMap((t, j) => Array.from({ length: n[j] }, () => t));
  const tex = `${coef} \\times ${theta.map((t, j) => `(${ftex(t)})^{${n[j]}}`).join('')}`;
  return { value: fprod([frac(coef), ...factors]), tex, coef };
}

export function TextNBLab({ initialModel = 'bernoulli', initialDoc = 'a b' }: { initialModel?: Model; initialDoc?: string }) {
  const [model, setModel] = useState<Model>(initialModel);
  const [smooth, setSmooth] = useState(true);
  const [doc, setDoc] = useState(initialDoc);
  const [pSpam, setPSpam] = useState(0.5);
  const theta = textParams(model, smooth);
  const lik = theta.map((t) => textLikelihood(model, t, doc));
  const ls = fval(lik[0].value);
  const lh = fval(lik[1].value);
  const lr = ls / lh;
  const post = (ls * pSpam) / (ls * pSpam + lh * (1 - pSpam));
  const toks = tokens(doc);
  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'bernoulli', label: 'Bernoulli (presence)' },
            { value: 'multinomial', label: 'Multinomial (counts)' },
          ]}
          value={model}
          onChange={setModel}
        />
        <Toggle label="Laplace smoothing" checked={smooth} onChange={setSmooth} />
      </div>
      <div className="lab-grid">
        <div className="table-wrap num">
          <table>
            <thead>
              <tr>
                <th>email</th>
                <th>words</th>
                <th>class</th>
                <th>{model === 'bernoulli' ? 'presence (a, b, c)' : 'counts (a, b, c)'}</th>
              </tr>
            </thead>
            <tbody>
              {EMAILS.map((e) => (
                <tr key={e.id}>
                  <td>{e.id}</td>
                  <td>
                    {tokens(e.text).map((t, i) => (
                      <span key={i} style={{ opacity: VOCAB.includes(t) ? 1 : 0.35, marginRight: 3 }}>
                        {t}
                      </span>
                    ))}
                  </td>
                  <td style={{ color: e.spam ? 'var(--c-pos)' : 'var(--c-neg)', fontWeight: 650 }}>{e.spam ? 'spam' : 'ham'}</td>
                  <td>({(model === 'bernoulli' ? bitsOf(e.text) : countsOf(e.text)).join(', ')})</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted">Faded letters d and e are stop words, removed from the vocabulary.</p>
        </div>
        <div className="controls">
          <label className="field">
            new email (letters a–e)
            <input value={doc} onChange={(e) => setDoc(e.target.value)} />
          </label>
          <div className="status">
            tokens kept: {toks.filter((t) => VOCAB.includes(t)).join(' ') || '(none)'} → {model === 'bernoulli' ? `bits (${bitsOf(doc).join(', ')})` : `counts (${countsOf(doc).join(', ')})`}
          </div>
          <Slider label="prior P(spam)" value={pSpam} min={0.05} max={0.95} step={0.01} onChange={setPSpam} format={(v) => fmt(v, 2)} />
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th>θ</th>
                  {VOCAB.map((w) => (
                    <th key={w}>{w}</th>
                  ))}
                  <th>sum</th>
                </tr>
              </thead>
              <tbody>
                {['spam', 'ham'].map((c, i) => (
                  <tr key={c}>
                    <td>{c}</td>
                    {theta[i].map((t, j) => (
                      <td key={j}>{fstr(t)}</td>
                    ))}
                    <td>{fmt(theta[i].reduce((s, t) => s + fval(t), 0), 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {['spam', 'ham'].map((c, i) => (
        <MB key={c} t={`P(\\text{doc} \\mid \\text{${c}}) = ${lik[i].tex} ${lik[i].value.d < 1e12 ? `= ${ftex(lik[i].value)}` : ''} \\approx ${fval(lik[i].value).toPrecision(4)}`} />
      ))}
      <Readout
        items={[
          { label: 'likelihood ratio spam : ham', value: fmt(lr, 4) },
          { label: 'prior odds', value: fmt(pSpam / (1 - pSpam), 4) },
          { label: 'P(spam | doc)', value: fmt(post, 4), tone: 'accent' },
          { label: 'ML / MAP decision', value: `${lr > 1 ? 'spam' : lr < 1 ? 'ham' : 'tie'} / ${post > 0.5 ? 'spam' : post < 0.5 ? 'ham' : 'tie'}` },
        ]}
      />
    </div>
  );
}
