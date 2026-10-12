import { useState } from 'react';
import { Readout, Segmented } from '../../../components/ui';
import { fmt } from '../../../lib/num';
import { gainRatio, infoGain, splitEntropy } from '../../../lib/tree';

// Eight examples, four positive (circles) and four negative (squares). A test is any assignment of
// examples to branches; gain looks at labels within branches, split entropy only at branch sizes.

type Preset = 'id' | 'binary' | 'tiny' | 'impure' | 'none';
const PRESETS: Record<Preset, { label: string; branch: number[] }> = {
  id: { label: 'unique ID', branch: [0, 1, 2, 3, 4, 5, 6, 7] },
  binary: { label: 'useful binary', branch: [0, 0, 0, 0, 1, 1, 1, 1] },
  tiny: { label: 'one tiny pure branch', branch: [0, 1, 1, 1, 1, 1, 1, 1] },
  impure: { label: 'balanced, impure', branch: [0, 0, 0, 1, 0, 1, 1, 1] },
  none: { label: 'no split', branch: [0, 0, 0, 0, 0, 0, 0, 0] },
};
const LABELS = [1, 1, 1, 1, 0, 0, 0, 0];

const childrenOf = (branch: number[]) =>
  Array.from({ length: 8 }, (_, b) => [0, 1].map((cls) => branch.filter((x, i) => x === b && LABELS[i] === 1 - cls).length)).filter((c) => c[0] + c[1] > 0);

function Token({ pos }: { pos: boolean }) {
  return (
    <svg width="22" height="22" aria-hidden>
      {pos ? <circle cx="11" cy="11" r="8" className="pt pos" /> : <rect x="3.5" y="3.5" width="15" height="15" rx="2" className="pt neg" />}
    </svg>
  );
}

export function GainRatioLab() {
  const [branch, setBranch] = useState(PRESETS.id.branch);
  const [preset, setPreset] = useState<Preset | 'custom'>('id');
  const kids = childrenOf(branch);
  const g = infoGain(kids);
  const sh = splitEntropy(kids);
  const gr = gainRatio(kids);
  const rows = (Object.keys(PRESETS) as Preset[]).map((p) => {
    const k = childrenOf(PRESETS[p].branch);
    return { p, gain: infoGain(k), sh: splitEntropy(k), gr: gainRatio(k) };
  });
  const maxGain = Math.max(...rows.map((r) => r.gain));
  const maxGr = Math.max(...rows.filter((r) => !Number.isNaN(r.gr)).map((r) => r.gr));
  const used = [...new Set(branch)].sort((a, b) => a - b);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="candidate test"
          options={[...(Object.keys(PRESETS) as Preset[]).map((p) => ({ value: p, label: PRESETS[p].label })), ...(preset === 'custom' ? [{ value: 'custom' as const, label: 'your test' }] : [])]}
          value={preset}
          onChange={(p) => {
            if (p === 'custom') return;
            setPreset(p);
            setBranch(PRESETS[p].branch);
          }}
        />
      </div>
      <div className="lab-grid">
        <div>
          <div className="branches">
            {used.map((b) => (
              <div key={b} className="branch-box">
                <div className="branch-head">branch {b + 1}</div>
                <div className="branch-tokens">
                  {branch.map((x, i) =>
                    x === b ? (
                      <button
                        key={i}
                        className="token-btn"
                        title="move to the next branch"
                        aria-label={`${LABELS[i] ? 'positive' : 'negative'} example ${i + 1}, in branch ${b + 1}; move to the next branch`}
                        onClick={() => {
                          setPreset('custom');
                          setBranch(branch.map((y, j) => (j === i ? (y + 1) % 8 : y)));
                        }}
                      >
                        <Token pos={LABELS[i] === 1} />
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="small muted">Click an example to move it to the next branch (up to eight branches).</p>
        </div>
        <div className="controls">
          <Readout
            items={[
              { label: 'information gain', value: fmt(g, 4) },
              { label: 'split entropy', value: fmt(sh, 4) },
              { label: 'gain ratio', value: Number.isNaN(gr) ? 'undefined (0/0)' : fmt(gr, 4), tone: 'accent' },
            ]}
          />
          <p className="small muted">Gain uses the labels inside each branch. Split entropy uses only how many examples each branch receives.</p>
        </div>
      </div>
      <div className="table-wrap num">
        <table>
          <thead>
            <tr>
              <th>candidate</th>
              <th>gain</th>
              <th>split entropy</th>
              <th>gain ratio</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.p}>
                <td>{PRESETS[r.p].label}</td>
                <td className={r.gain > maxGain - 1e-9 ? 'cell-win' : undefined}>{fmt(r.gain, 4)}</td>
                <td>{fmt(r.sh, 4)}</td>
                <td className={r.gr > maxGr - 1e-9 ? 'cell-win' : undefined}>{Number.isNaN(r.gr) ? 'undefined' : fmt(r.gr, 4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small muted">Highlighted: the largest value in each criterion’s column.</p>
    </div>
  );
}
