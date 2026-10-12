import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../../components/Chart';
import { Readout, Segmented, Slider } from '../../../components/ui';
import { fmt, linspace } from '../../../lib/num';
import { entropy, log2, total } from '../../../lib/tree';

const CLASS_FILL = ['var(--c-pos)', 'var(--c-neg)', 'var(--c-alt)'];
const PS = linspace(0, 1, 201);

/** Class counts at a node → proportions, surprise −log₂ p and the entropy as expected surprise. */
export function EntropyLab() {
  const [k, setK] = useState<'2' | '3'>('2');
  const [counts, setCounts] = useState([9, 5, 4]);
  const kk = Number(k);
  const c = counts.slice(0, kk);
  const n = total(c);
  const p = c.map((v) => (n ? v / n : 0));
  const H = entropy(c);
  const set = (j: number, v: number) => setCounts((prev) => prev.map((x, i) => (i === j ? v : x)));

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="number of classes"
          options={[
            { value: '2', label: 'two classes' },
            { value: '3', label: 'three classes' },
          ]}
          value={k}
          onChange={setK}
        />
      </div>
      <div className="lab-grid">
        <div>
          <Chart
            W={460}
            H={300}
            x={[0.4, kk + 0.6]}
            y={[0, 1]}
            xTicks={c.map((_, j) => j + 1)}
            xTickFormat={(v) => `class ${v}`}
            yLabel="probability / bits"
            ariaLabel="Class proportions and each class's contribution to the entropy"
          >
            {(s) => (
              <>
                {p.map((pj, j) => {
                  const x = j + 1;
                  const contrib = pj > 0 ? -pj * log2(pj) : 0;
                  const bw = s.x(0.3) - s.x(0);
                  return (
                    <g key={j}>
                      <rect x={s.x(x - 0.33)} y={s.y(pj)} width={bw} height={s.y(0) - s.y(pj)} fill={CLASS_FILL[j]} opacity={0.3} />
                      <rect x={s.x(x + 0.03)} y={s.y(contrib)} width={bw} height={s.y(0) - s.y(contrib)} fill={CLASS_FILL[j]} />
                      <text x={s.x(x - 0.18)} y={s.y(pj) - 6} textAnchor="middle" className="anno">
                        p = {fmt(pj, 3)}
                      </text>
                      <text x={s.x(x + 0.18)} y={s.y(contrib) - 6} textAnchor="middle" className="anno-strong">
                        {fmt(contrib, 3)}
                      </text>
                      <text x={s.x(x)} y={s.y(0.93)} textAnchor="middle" className="anno">
                        surprise −log₂ p = {pj > 0 ? fmt(-log2(pj), 3) : '∞ (never seen)'}
                      </text>
                    </g>
                  );
                })}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'pale bars: proportion pⱼ', cls: 'bar-soft', shape: 'box' },
              { label: 'solid bars: contribution −pⱼ log₂ pⱼ (they add up to H)', cls: 'bar-pos', shape: 'box' },
            ]}
          />
        </div>
        <div className="controls">
          {c.map((v, j) => (
            <Slider key={j} label={`class ${j + 1} count`} value={v} min={0} max={20} step={1} onChange={(x) => set(j, x)} />
          ))}
          <Readout
            items={[
              { label: 'examples n', value: String(n) },
              { label: 'entropy H(S)', value: `${fmt(H, 4)} bits`, tone: 'accent' },
              { label: `maximum log₂ ${kk}`, value: fmt(log2(kk), 4) },
            ]}
          />
          {kk === 2 ? (
            <Chart W={300} H={190} x={[0, 1]} y={[0, 1.05]} xLabel="p = proportion of class 1" yLabel="H(p)" ariaLabel="Binary entropy curve">
              {(s) => (
                <>
                  <path d={pathOf(PS.map((q) => [s.x(q), s.y(entropy([q, 1 - q]))]))} className="ln-fit" />
                  {n > 0 && <circle cx={s.x(p[0])} cy={s.y(H)} r={6} className="mark" />}
                </>
              )}
            </Chart>
          ) : (
            <p className="small muted">With three classes the largest possible entropy is log₂ 3 ≈ 1.585 bits, reached only at equal proportions.</p>
          )}
        </div>
      </div>
    </div>
  );
}
