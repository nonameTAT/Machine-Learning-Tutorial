import { useState } from 'react';
import { Chart, Legend } from '../../../components/Chart';
import { M } from '../../../components/Math';
import { Readout, Slider } from '../../../components/ui';
import { fmt } from '../../../lib/num';

/** A leaf with estimated P(positive) = p: compare the expected cost of each action rather than taking a vote. */
export function CostLab() {
  const [p, setP] = useState(0.2);
  const [cfp, setCfp] = useState(1);
  const [cfn, setCfn] = useState(10);
  const rPos = cfp * (1 - p);
  const rNeg = cfn * p;
  const thr = cfp / (cfp + cfn);
  const yMax = Math.max(cfp, cfn) * 1.08;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={520} H={300} x={[0, 1]} y={[0, yMax]} xLabel="estimated P(positive) at the leaf" yLabel="expected cost" ariaLabel="Expected cost of each action against the leaf's positive probability">
          {(s) => (
            <>
              <line x1={s.x(0)} y1={s.y(cfp)} x2={s.x(1)} y2={s.y(0)} className="ln-pos" />
              <line x1={s.x(0)} y1={s.y(0)} x2={s.x(1)} y2={s.y(cfn)} className="ln-neg" />
              <line x1={s.x(thr)} x2={s.x(thr)} y1={s.top} y2={s.bottom} className="ln-ghost" />
              <line x1={s.x(0.5)} x2={s.x(0.5)} y1={s.top} y2={s.bottom} className="ln-noise" />
              <line x1={s.x(p)} x2={s.x(p)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeWidth={2} />
              <circle cx={s.x(p)} cy={s.y(rPos)} r={5.5} className="pt pos" />
              <rect x={s.x(p) - 5} y={s.y(rNeg) - 5} width={10} height={10} className="pt neg" />
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: <>predict positive: <M t="C_{\text{FP}}(1 - p)" /></>, cls: 'ln-pos' },
            { label: <>predict negative: <M t="C_{\text{FN}}\,p" /></>, cls: 'ln-neg' },
            { label: <>cost threshold <M t="C_{\text{FP}}/(C_{\text{FP}} + C_{\text{FN}})" /></>, cls: 'ln-ghost', shape: 'dash' },
            { label: 'majority-vote threshold 0.5', cls: 'ln-noise', shape: 'dash' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="P(positive) at the leaf" value={p} min={0} max={1} step={0.01} onChange={setP} format={(v) => fmt(v, 2)} />
        <Slider label={<>cost of a false positive <M t="C_{\text{FP}}" /></>} value={cfp} min={0.5} max={10} step={0.5} onChange={setCfp} />
        <Slider label={<>cost of a false negative <M t="C_{\text{FN}}" /></>} value={cfn} min={0.5} max={20} step={0.5} onChange={setCfn} />
        <Readout
          items={[
            { label: 'R(predict +)', value: fmt(rPos, 3) },
            { label: 'R(predict −)', value: fmt(rNeg, 3) },
            { label: 'minimum-cost action', value: rPos < rNeg ? 'positive' : rPos > rNeg ? 'negative' : 'tie', tone: 'accent' },
            { label: 'majority vote', value: p > 0.5 ? 'positive' : p < 0.5 ? 'negative' : 'tie' },
          ]}
        />
      </div>
    </div>
  );
}
