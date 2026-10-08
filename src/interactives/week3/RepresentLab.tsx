import { useState } from 'react';
import { Readout } from '../../components/ui';
import { VOCAB, bitsOf, countsOf } from './TextNBLab';

/** One document, two representations: which words are present, and how often each occurs. */
export function RepresentLab() {
  const [doc, setDoc] = useState('a a a b');
  const [doc2, setDoc2] = useState('b a a d a e');
  const show = (d: string) => (d.toLowerCase().match(/[a-e]/g) ?? []).map((t, i) => (
    <span key={i} style={{ opacity: VOCAB.includes(t) ? 1 : 0.35, marginRight: 4, fontFamily: 'var(--font-mono)' }}>
      {t}
    </span>
  ));
  const same = (a: number[], b: number[]) => a.every((v, i) => v === b[i]);
  return (
    <div className="lab-grid even">
      {[
        [doc, setDoc],
        [doc2, setDoc2],
      ].map(([d, set], i) => (
        <div key={i}>
          <label className="field">
            document {i + 1} (letters a–e)
            <input value={d as string} onChange={(e) => (set as (v: string) => void)(e.target.value)} />
          </label>
          <div className="status">{show(d as string)}</div>
          <Readout
            items={[
              { label: 'Bernoulli: presence (a, b, c)', value: `(${bitsOf(d as string).join(', ')})` },
              { label: 'multinomial: counts (a, b, c)', value: `(${countsOf(d as string).join(', ')})` },
            ]}
          />
        </div>
      ))}
      <div className="status" style={{ gridColumn: '1 / -1' }}>
        Same presence vector: <strong>{same(bitsOf(doc), bitsOf(doc2)) ? 'yes' : 'no'}</strong> · same count vector:{' '}
        <strong>{same(countsOf(doc), countsOf(doc2)) ? 'yes' : 'no'}</strong>. Word order and stop words never matter; repetitions matter only to the
        count model.
      </div>
    </div>
  );
}
