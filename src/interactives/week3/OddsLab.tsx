import { useState } from 'react';
import { Chart } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Slider } from '../../components/ui';
import { fmt } from '../../lib/num';
import { Arrow } from '../week2/common';

const PRESETS: { label: string; prior: number; l1: number; l2: number }[] = [
  { label: 'h₁ vs h₂', prior: 0.9, l1: 0.2, l2: 0.8 },
  { label: 'Text, equal priors', prior: 0.5, l1: 2 / 9, l2: 4 / 27 },
  { label: 'Text, P(spam) = 1/3', prior: 1 / 3, l1: 2 / 9, l2: 4 / 27 },
];

/** In log space, Bayes’ rule for two classes is addition: log posterior odds = log prior odds + log likelihood ratio. */
export function OddsLab() {
  const [prior, setPrior] = useState(0.9);
  const [l1, setL1] = useState(0.2);
  const [l2, setL2] = useState(0.8);
  const po = prior / (1 - prior);
  const lr = l1 / l2;
  const post = po * lr;
  const L = Math.log10;
  const clampL = (v: number) => Math.max(-2.4, Math.min(2.4, v));
  const ticks = [-2, -1, 0, 1, 2];
  return (
    <div>
      <div className="btn-row">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className="btn"
            onClick={() => {
              setPrior(p.prior);
              setL1(p.l1);
              setL2(p.l2);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="lab-grid">
        <div>
          <Chart
            W={560}
            H={230}
            x={[-2.5, 2.5]}
            y={[0, 3.6]}
            xTicks={ticks}
            yTicks={[]}
            xTickFormat={(t) => String(10 ** t)}
            xLabel="odds for class 1 versus class 2 (log scale)"
            ariaLabel="Odds on a log scale"
          >
            {(s) => (
              <>
                <rect x={s.x(0)} width={s.right - s.x(0)} y={s.top} height={s.bottom - s.top} className="rg-pos" />
                <rect x={s.left} width={s.x(0) - s.left} y={s.top} height={s.bottom - s.top} className="rg-neg" />
                <line x1={s.x(0)} x2={s.x(0)} y1={s.top} y2={s.bottom} stroke="var(--ink)" strokeWidth={1.5} />
                <text x={s.left + 6} y={s.y(3.3)} className="anno">
                  favours class 2
                </text>
                <text x={s.right - 6} y={s.y(3.3)} className="anno" textAnchor="end">
                  favours class 1
                </text>
                <Arrow x1={s.x(0)} y1={s.y(2.5)} x2={s.x(clampL(L(po)))} y2={s.y(2.5)} cls="ln-alt" head="head-w" />
                <text x={s.x(clampL(L(po))) + (po >= 1 ? 8 : -8)} y={s.y(2.5) + 4} className="anno" textAnchor={po >= 1 ? 'start' : 'end'}>
                  prior odds {fmt(po, 3)}
                </text>
                <Arrow x1={s.x(clampL(L(po)))} y1={s.y(1.6)} x2={s.x(clampL(L(po) + L(lr)))} y2={s.y(1.6)} cls="ln-fit" head="mark-acc" />
                <text x={s.x(clampL(L(po) + L(lr))) + (lr >= 1 ? 8 : -8)} y={s.y(1.6) + 4} className="anno" textAnchor={lr >= 1 ? 'start' : 'end'}>
                  × likelihood ratio {fmt(lr, 3)}
                </text>
                <circle cx={s.x(clampL(L(post)))} cy={s.y(0.7)} r={8} className="mark" />
                <text x={s.x(clampL(L(post))) + (post >= 1 ? 12 : -12)} y={s.y(0.7) + 4} className="anno-strong" textAnchor={post >= 1 ? 'start' : 'end'}>
                  posterior odds {fmt(post, 3)}
                </text>
              </>
            )}
          </Chart>
        </div>
        <div className="controls">
          <Slider label={<M t="P(c_1)" />} value={prior} min={0.01} max={0.99} step={0.01} onChange={setPrior} format={(v) => fmt(v, 3)} />
          <Slider label={<M t="P(x \mid c_1)" />} value={l1} min={0.01} max={1} step={0.01} onChange={setL1} format={(v) => fmt(v, 3)} />
          <Slider label={<M t="P(x \mid c_2)" />} value={l2} min={0.01} max={1} step={0.01} onChange={setL2} format={(v) => fmt(v, 3)} />
          <Readout
            items={[
              { label: 'P(c₁ | x) = o/(1 + o)', value: fmt(post / (1 + post), 4), tone: 'accent' },
              { label: 'ML decision (LR vs 1)', value: lr > 1 ? 'class 1' : lr < 1 ? 'class 2' : 'tie' },
              { label: 'MAP decision (odds vs 1)', value: post > 1 ? 'class 1' : post < 1 ? 'class 2' : 'tie' },
              { label: 'LR needed for class 1', value: `> ${fmt(1 / po, 3)}` },
            ]}
          />
          {lr > 1 !== post > 1 && <div className="status bad">ML and MAP disagree: the evidence points one way, but not strongly enough to overcome the prior.</div>}
        </div>
      </div>
    </div>
  );
}
