import { useState } from 'react';
import { Readout, Slider } from '../../components/ui';
import { fmt } from '../../lib/num';

const COLS = 40;
const ROWS = 25;
const N = COLS * ROWS;

/** Natural frequencies for a diagnostic test: 1,000 people, coloured by true status and test result. */
export function BaseRateLab() {
  const [prev, setPrev] = useState(0.008);
  const [sens, setSens] = useState(0.98);
  const [spec, setSpec] = useState(0.97);
  const [tests, setTests] = useState(1);
  const pPos = sens ** tests; // P(all n tests positive | C)
  const fPos = (1 - spec) ** tests; // P(all n tests positive | not C)
  const sC = prev * pPos;
  const sN = (1 - prev) * fPos;
  const post = sC / (sC + sN);
  // expected counts out of N, rounded for the picture
  const present = Math.round(N * prev);
  const tp = Math.round(N * sC);
  const fp = Math.round(N * sN);
  const kind = (i: number) => (i < tp ? 'tp' : i < present ? 'fn' : i < present + fp ? 'fp' : 'tn');
  const fill: Record<string, string> = { tp: 'var(--c-pos)', fn: 'var(--c-pos)', fp: 'var(--c-neg)', tn: 'var(--muted)' };
  const op: Record<string, number> = { tp: 1, fn: 0.3, fp: 1, tn: 0.12 };
  const cell = 11;
  return (
    <div className="lab-grid">
      <div>
        <svg viewBox={`0 0 ${COLS * cell} ${ROWS * cell}`} className="chart" role="img" aria-label="Icon array of 1,000 people">
          {Array.from({ length: N }, (_, i) => {
            const k = kind(i);
            return <rect key={i} x={(i % COLS) * cell + 1} y={Math.floor(i / COLS) * cell + 1} width={cell - 2} height={cell - 2} rx={2} fill={fill[k]} opacity={op[k]} />;
          })}
        </svg>
        <div className="legend">
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-pos)' }} /> has the condition, {tests > 1 ? 'all tests' : 'test'} positive ({tp})
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-pos)', opacity: 0.3 }} /> has it, missed ({present - tp})
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-neg)' }} /> does not have it, {tests > 1 ? 'all tests' : 'test'} positive ({fp})
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--muted)', opacity: 0.25 }} /> does not have it, not flagged
          </span>
        </div>
        <p className="small muted">Expected counts out of 1,000, rounded for the picture; the readouts use exact probabilities.</p>
      </div>
      <div className="controls">
        <Slider label="prevalence P(C)" value={prev} min={0.001} max={0.2} step={0.001} onChange={setPrev} format={(v) => fmt(v, 3)} />
        <Slider label="sensitivity P(+ | C)" value={sens} min={0.5} max={1} step={0.005} onChange={setSens} format={(v) => fmt(v, 3)} />
        <Slider label="specificity P(− | ¬C)" value={spec} min={0.5} max={0.999} step={0.001} onChange={setSpec} format={(v) => fmt(v, 3)} />
        <Slider label="positive tests in a row" value={tests} min={1} max={3} step={1} onChange={setTests} />
        <Readout
          items={[
            { label: 'score, condition', value: fmt(sC, 5) },
            { label: 'score, no condition', value: fmt(sN, 5) },
            { label: `P(C | ${tests > 1 ? `${tests} positives` : '+'})`, value: fmt(post, 4), tone: 'accent' },
            { label: 'MAP label', value: post > 0.5 ? 'condition present' : 'condition absent' },
          ]}
        />
        {tests > 1 && (
          <p className="small muted">
            Repeated tests are treated as independent <em>given</em> the true status: P(all positive | C) = sensitivity^{tests}. That is the Naive Bayes
            assumption in miniature.
          </p>
        )}
      </div>
    </div>
  );
}
