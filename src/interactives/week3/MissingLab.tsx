import { useState } from 'react';
import { Chart } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Slider } from '../../components/ui';
import { fmt } from '../../lib/num';

// P(spam | Viagra, lottery) for the rows with lottery = 1
const P_V0 = 0.65;
const P_V1 = 0.4;

/** “lottery” observed, “Viagra” unknown: average the two table rows, weighted by P(Viagra | lottery = 1). */
export function MissingLab() {
  const [w, setW] = useState(0.1);
  const p = P_V0 * (1 - w) + P_V1 * w;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={520} H={260} x={[0, 1]} y={[0.3, 0.75]} xLabel="weight P(Viagra = 1 | lottery = 1)" yLabel="P(spam | lottery = 1)" ariaLabel="Marginalising over a missing feature">
          {(s) => (
            <>
              <line x1={s.left} x2={s.right} y1={s.y(0.5)} y2={s.y(0.5)} className="ln-ghost" />
              <line x1={s.x(0)} y1={s.y(P_V0)} x2={s.x(1)} y2={s.y(P_V1)} className="ln-fit" />
              <circle cx={s.x(0)} cy={s.y(P_V0)} r={6} className="pt" />
              <circle cx={s.x(1)} cy={s.y(P_V1)} r={6} className="pt" />
              <text x={s.x(0) + 10} y={s.y(P_V0) - 8} className="anno">
                row (Viagra = 0, lottery = 1): 0.65
              </text>
              <text x={s.x(1) - 10} y={s.y(P_V1) + 18} className="anno" textAnchor="end">
                row (Viagra = 1, lottery = 1): 0.40
              </text>
              <circle cx={s.x(w)} cy={s.y(p)} r={7} className="mark" />
            </>
          )}
        </Chart>
      </div>
      <div className="controls">
        <Slider label={<M t="P(\text{Viagra} = 1 \mid \text{lottery} = 1)" />} value={w} min={0} max={1} step={0.01} onChange={setW} format={(v) => fmt(v, 2)} />
        <Readout
          items={[
            { label: 'P(spam | lottery = 1)', value: fmt(p, 4), tone: 'accent' },
            { label: 'P(ham | lottery = 1)', value: fmt(1 - p, 4) },
            { label: 'decision', value: p > 0.5 ? 'spam' : p < 0.5 ? 'ham' : 'tie' },
          ]}
        />
        <p className="small muted">
          The answer is a weighted average of the two rows, so it always lies between 0.40 and 0.65. The weight must describe Viagra among emails that contain
          “lottery”.
        </p>
      </div>
    </div>
  );
}
