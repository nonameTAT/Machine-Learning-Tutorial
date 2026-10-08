import { useState } from 'react';
import { Chart } from '../../components/Chart';
import { Readout, Slider } from '../../components/ui';
import { fmt } from '../../lib/num';

const VALUES = ['sunny', 'overcast', 'rainy'];
const COUNTS = [3, 0, 2]; // outlook among the 5 “no” days

/** Add-α smoothing of one categorical table: every possible value receives α pseudo-counts. */
export function AlphaLab() {
  const [alpha, setAlpha] = useState(1);
  const n = COUNTS.reduce((a, b) => a + b, 0);
  const K = VALUES.length;
  const p = COUNTS.map((c) => (c + alpha) / (n + alpha * K));
  const raw = COUNTS.map((c) => c / n);
  return (
    <div className="lab-grid">
      <div>
        <Chart
          W={520}
          H={260}
          x={[0, 3]}
          y={[0, 0.7]}
          xTicks={[]}
          xLabel="outlook, given play = no"
          yLabel="estimated probability"
          ariaLabel="Smoothed probabilities"
          overlay={(s) =>
            VALUES.map((v, i) => (
              <text key={v} x={s.x(i + 0.5)} y={s.bottom + 15} textAnchor="middle" className="anno">
                {v}
              </text>
            ))
          }
        >
          {(s) => (
            <>
              {VALUES.map((v, i) => (
                <g key={v}>
                  <rect x={s.x(i + 0.18)} width={s.x(0.3) - s.x(0)} y={s.y(raw[i])} height={s.y(0) - s.y(raw[i])} fill="var(--muted)" opacity={0.35} />
                  <rect x={s.x(i + 0.52)} width={s.x(0.3) - s.x(0)} y={s.y(p[i])} height={s.y(0) - s.y(p[i])} fill="var(--c-neg)" />
                  <text x={s.x(i + 0.67)} y={s.y(p[i]) - 5} textAnchor="middle" className="anno">
                    {`${fmt(COUNTS[i] + alpha, 2)}/${fmt(n + alpha * K, 2)}`}
                  </text>
                </g>
              ))}
            </>
          )}
        </Chart>
        <div className="legend">
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--muted)', opacity: 0.35 }} /> raw counts / 5
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-neg)' }} /> smoothed (count + α) / (5 + 3α)
          </span>
        </div>
      </div>
      <div className="controls">
        <Slider label="pseudo-count α" value={alpha} min={0} max={5} step={0.25} onChange={setAlpha} format={(v) => (v === 1 ? '1 (Laplace)' : fmt(v, 2))} />
        <Readout
          items={[
            { label: 'P(overcast | no)', value: fmt(p[1], 4), tone: 'accent' },
            { label: 'sum of the three', value: fmt(p.reduce((a, b) => a + b, 0), 4) },
          ]}
        />
        <p className="small muted">
          Large α pulls every value towards the uniform 1/3: smoothing is a prior belief, and too much of it washes out the data.
        </p>
      </div>
    </div>
  );
}

/** Multiplying many small probabilities underflows double precision; adding their logs does not. */
export function UnderflowLab() {
  const [d, setD] = useState(100);
  const [p, setP] = useState(0.05);
  const prod = p ** d;
  const logSum = d * Math.log(p);
  return (
    <div>
      <Slider label="number of features d" value={d} min={10} max={1000} step={10} onChange={setD} />
      <Slider label="probability of each observed value" value={p} min={0.01} max={0.5} step={0.01} onChange={setP} format={(v) => fmt(v, 2)} />
      <Readout
        items={[
          { label: 'product of d factors (float64)', value: prod === 0 ? '0 (underflow!)' : prod.toExponential(3), tone: prod === 0 ? 'bad' : undefined },
          { label: 'sum of log factors', value: fmt(logSum, 4), tone: 'good' },
        ]}
      />
      <p className="small muted">
        Double precision cannot represent positive numbers below about 5 × 10⁻³²⁴. Comparing log scores gives the same decision as comparing products,
        because log is strictly increasing.
      </p>
    </div>
  );
}
