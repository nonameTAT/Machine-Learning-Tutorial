import { useState } from 'react';
import { Chart, Legend } from '../../components/Chart';
import { Readout, Slider } from '../../components/ui';
import { fmt } from '../../lib/num';

/** k identical copies of one feature: the true evidence is counted once, Naive Bayes counts it k times. */
export function DuplicateLab() {
  const [lpo, setLpo] = useState(Math.log10(1 / 3));
  const [llr, setLlr] = useState(Math.log10(2.5));
  const [k, setK] = useState(2);
  const po = 10 ** lpo;
  const lr = 10 ** llr;
  const ks = [1, 2, 3, 4, 5, 6];
  const trueOdds = po * lr;
  const nbOdds = (n: number) => po * lr ** n;
  const L = Math.log10;
  const lo = Math.min(L(trueOdds), L(nbOdds(6)), L(po)) - 0.3;
  const hi = Math.max(L(trueOdds), L(nbOdds(6)), L(po)) + 0.3;
  const dec = (o: number) => (o > 1 ? 'class A' : o < 1 ? 'class B' : 'tie');
  return (
    <div className="lab-grid">
      <div>
        <Chart
          W={560}
          H={300}
          x={[0.5, 6.5]}
          y={[Math.min(lo, -0.5), Math.max(hi, 0.5)]}
          xTicks={ks}
          yTickFormat={(t) => fmt(10 ** t, 2)}
          xLabel="copies of the same feature"
          yLabel="posterior odds A : B (log scale)"
          ariaLabel="Posterior odds with duplicated features"
        >
          {(s) => (
            <>
              <rect x={s.left} width={s.right - s.left} y={s.top} height={Math.max(0, s.y(0) - s.top)} className="rg-pos" />
              <line x1={s.left} x2={s.right} y1={s.y(0)} y2={s.y(0)} stroke="var(--ink)" strokeWidth={1.2} />
              <line x1={s.x(0.5)} x2={s.x(6.5)} y1={s.y(L(trueOdds))} y2={s.y(L(trueOdds))} className="ln-fit" />
              {ks.map((n) => (
                <circle key={n} cx={s.x(n)} cy={s.y(L(nbOdds(n)))} r={n === k ? 8 : 5} className={n === k ? 'mark' : 'pt hi'} />
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'true posterior odds (the copies add nothing)', cls: 'ln-fit' },
            { label: 'Naive Bayes odds: prior × LR^copies', cls: 'pt hi', shape: 'dot' },
            { label: 'odds > 1: class A', cls: 'rg-pos', shape: 'box' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="prior odds A : B" value={lpo} min={-1.5} max={1.5} step={0.01} onChange={setLpo} format={(v) => fmt(10 ** v, 3)} />
        <Slider label="likelihood ratio of the feature" value={llr} min={-1} max={1} step={0.01} onChange={setLlr} format={(v) => fmt(10 ** v, 3)} />
        <Slider label="copies" value={k} min={1} max={6} step={1} onChange={setK} />
        <Readout
          items={[
            { label: 'true odds', value: `${fmt(trueOdds, 3)} → ${dec(trueOdds)}` },
            { label: 'Naive Bayes odds', value: `${fmt(nbOdds(k), 3)} → ${dec(nbOdds(k))}`, tone: dec(nbOdds(k)) !== dec(trueOdds) ? 'bad' : 'accent' },
            { label: 'NB P(A | x)', value: fmt(nbOdds(k) / (1 + nbOdds(k)), 3) },
            { label: 'true P(A | x)', value: fmt(trueOdds / (1 + trueOdds), 3) },
          ]}
        />
      </div>
    </div>
  );
}
