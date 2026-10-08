import { useState } from 'react';
import { Chart, Legend } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Slider, Table } from '../../components/ui';
import { fmt } from '../../lib/num';

/** Conditional risk of the two actions as the posterior varies; the cheaper action switches at C_FP/(C_FP + C_FN). */
export function RiskLab() {
  const [p, setP] = useState(0.2085);
  const [cfn, setCfn] = useState(10);
  const [cfp, setCfp] = useState(1);
  const rPresent = (q: number) => cfp * (1 - q);
  const rAbsent = (q: number) => cfn * q;
  const thr = cfp / (cfp + cfn);
  const yMax = Math.max(cfp, cfn) * 1.05;
  const act = rPresent(p) < rAbsent(p) ? 'predict present' : rPresent(p) > rAbsent(p) ? 'predict absent' : 'either (equal risk)';
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={320} x={[0, 1]} y={[0, yMax]} xLabel="posterior P(present | x)" yLabel="expected loss R(a | x)" ariaLabel="Conditional risk of two actions">
          {(s) => (
            <>
              <rect x={s.x(thr)} width={s.right - s.x(thr)} y={s.top} height={s.bottom - s.top} className="rg-pos" />
              <line x1={s.x(0)} y1={s.y(rPresent(0))} x2={s.x(1)} y2={s.y(rPresent(1))} className="ln-pos" />
              <line x1={s.x(0)} y1={s.y(rAbsent(0))} x2={s.x(1)} y2={s.y(rAbsent(1))} className="ln-neg" />
              <line x1={s.x(0.5)} x2={s.x(0.5)} y1={s.top} y2={s.bottom} className="ln-ghost" />
              <line x1={s.x(p)} x2={s.x(p)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeDasharray="4 3" />
              <circle cx={s.x(p)} cy={s.y(rPresent(p))} r={6} className="pt pos" />
              <rect x={s.x(p) - 5} y={s.y(rAbsent(p)) - 5} width={10} height={10} className="pt neg" />
              <text x={s.x(thr) + 6} y={s.top + 16} className="anno">
                threshold {fmt(thr, 3)}
              </text>
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'R(predict present) = C_FP (1 − p)', cls: 'ln-pos' },
            { label: 'R(predict absent) = C_FN p', cls: 'ln-neg' },
            { label: 'MAP threshold ½', cls: 'ln-ghost', shape: 'dash' },
            { label: 'minimum-risk action is “present”', cls: 'rg-pos', shape: 'box' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="posterior p" value={p} min={0} max={1} step={0.0005} onChange={setP} format={(v) => fmt(v, 4)} />
        <Slider label={<M t="C_{\text{FN}}" />} value={cfn} min={0.5} max={20} step={0.5} onChange={setCfn} format={(v) => fmt(v, 1)} />
        <Slider label={<M t="C_{\text{FP}}" />} value={cfp} min={0.5} max={20} step={0.5} onChange={setCfp} format={(v) => fmt(v, 1)} />
        <Table
          head={['action ↓ / truth →', 'present', 'absent']}
          rows={[
            ['predict present', '0', fmt(cfp, 1)],
            ['predict absent', fmt(cfn, 1), '0'],
          ]}
        />
        <Readout
          items={[
            { label: 'R(present | x)', value: fmt(rPresent(p), 4) },
            { label: 'R(absent | x)', value: fmt(rAbsent(p), 4) },
            { label: 'minimum-risk action', value: act, tone: 'accent' },
            { label: 'MAP action', value: p > 0.5 ? 'predict present' : 'predict absent' },
          ]}
        />
      </div>
    </div>
  );
}
