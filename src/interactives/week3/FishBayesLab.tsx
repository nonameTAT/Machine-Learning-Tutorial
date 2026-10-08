import { useState } from 'react';
import { Chart } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Segmented, Slider } from '../../components/ui';
import { fmt } from '../../lib/num';

// P(length bin | class)
const BINS = ['> 100 cm', '50–100 cm', '< 50 cm'] as const;
const LIK = { salmon: [0.5, 0.4, 0.1], bass: [0.3, 0.5, 0.2] };

/**
 * Bayes’ rule as areas: each class gets a column whose width is its prior; within it, each length bin
 * gets a block whose height is the likelihood. The selected bin’s two blocks have areas P(x|c)P(c).
 */
export function FishBayesLab() {
  const [prior, setPrior] = useState(0.3);
  const [bin, setBin] = useState('1');
  const b = Number(bin);
  const sS = LIK.salmon[b] * prior;
  const sB = LIK.bass[b] * (1 - prior);
  const ev = sS + sB;
  const block = (x0: number, w: number, lik: number[], cls: 'neg' | 'pos', s: { x: (v: number) => number; y: (v: number) => number }) => {
    let y0 = 0;
    return lik.map((h, i) => {
      const r = (
        <g key={`${cls}${i}`}>
          <rect
            x={s.x(x0)}
            y={s.y(y0 + h)}
            width={s.x(x0 + w) - s.x(x0)}
            height={s.y(y0) - s.y(y0 + h)}
            fill={cls === 'neg' ? 'var(--c-neg)' : 'var(--c-pos)'}
            opacity={i === b ? 0.75 : 0.15}
            stroke="var(--surface)"
            strokeWidth={2}
          />
          {w > 0.08 && (
            <text x={(s.x(x0) + s.x(x0 + w)) / 2} y={(s.y(y0) + s.y(y0 + h)) / 2 + 4} textAnchor="middle" className="anno">
              {BINS[i]}: {h}
            </text>
          )}
        </g>
      );
      y0 += h;
      return r;
    });
  };
  return (
    <div className="lab-grid">
      <div>
        <Chart W={520} H={360} x={[0, 1]} y={[0, 1]} xLabel="← salmon (width = prior)   |   sea bass →" yLabel="P(length bin | class)" grid={false} ariaLabel="Area diagram of Bayes’ rule">
          {(s) => (
            <>
              {block(0, prior, LIK.salmon, 'neg', s)}
              {block(prior, 1 - prior, LIK.bass, 'pos', s)}
            </>
          )}
        </Chart>
        <p className="small muted">
          Total area is 1. The two highlighted blocks are every way to observe this length: their areas are <M t="P(x \mid c)P(c)" />, they sum to the
          evidence <M t="P(x)" />, and the posterior is each block’s share of that sum.
        </p>
      </div>
      <div className="controls">
        <Segmented options={BINS.map((l, i) => ({ value: String(i), label: l }))} value={bin} onChange={setBin} label="length bin" />
        <Slider label="prior P(salmon)" value={prior} min={0.02} max={0.98} step={0.01} onChange={setPrior} format={(v) => fmt(v, 2)} />
        <Readout
          items={[
            { label: 'salmon: P(x|c)P(c)', value: fmt(sS, 4) },
            { label: 'sea bass: P(x|c)P(c)', value: fmt(sB, 4) },
            { label: 'evidence P(x)', value: fmt(ev, 4) },
            { label: 'P(salmon | x)', value: fmt(sS / ev, 4), tone: 'accent' },
            { label: 'P(sea bass | x)', value: fmt(sB / ev, 4), tone: 'accent' },
            { label: 'MAP decision', value: sS > sB ? 'salmon' : sS < sB ? 'sea bass' : 'tie' },
          ]}
        />
        <div className="status">
          Prior alone would always say {prior > 0.5 ? 'salmon' : 'sea bass'}. The observation{' '}
          {(sS > sB) === prior > 0.5 ? 'agrees with that choice here.' : 'overturns it here.'}
        </div>
      </div>
    </div>
  );
}
