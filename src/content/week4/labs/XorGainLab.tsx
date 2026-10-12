import { useState } from 'react';
import { M } from '../../../components/Math';
import { Readout, Segmented, Toggle } from '../../../components/ui';
import { fmt } from '../../../lib/num';
import { infoGain } from '../../../lib/tree';
import { TreeView, type TV } from './TreeView';

// One example per combination of two Boolean inputs. Click a cell to change its label, then compare what the
// gains say at the root with what they say one level down.

type Row = { A: boolean; B: boolean; y: boolean };
const CELLS: [boolean, boolean][] = [
  [true, true],
  [true, false],
  [false, true],
  [false, false],
];
const PRESETS: Record<string, { label: string; f: (a: boolean, b: boolean) => boolean }> = {
  xor: { label: 'A XOR B', f: (a, b) => a !== b },
  and: { label: 'A AND B', f: (a, b) => a && b },
  or: { label: 'A OR B', f: (a, b) => a || b },
  a: { label: 'Y = A', f: (a) => a },
};

const counts = (rows: Row[]) => [rows.filter((r) => r.y).length, rows.filter((r) => !r.y).length];
const gainOf = (rows: Row[], v: 'A' | 'B') => infoGain([counts(rows.filter((r) => r[v])), counts(rows.filter((r) => !r[v]))]);

function grow(rows: Row[], used: ('A' | 'B')[], early: boolean, key: string): { tv: TV; rows: Row[]; leaves: { rows: Row[]; pred: boolean }[] } {
  const c = counts(rows);
  const leaf = () => {
    // majority vote; a tie predicts False
    const pred = c[0] > c[1];
    return { tv: { key, label: pred ? 'True' : 'False', sub: `${c[0]} T · ${c[1]} F`, leaf: true, tone: pred ? ('pos' as const) : ('neg' as const) }, rows, leaves: [{ rows, pred }] };
  };
  const cands = (['A', 'B'] as const).filter((v) => !used.includes(v));
  if (c[0] === 0 || c[1] === 0 || cands.length === 0) return leaf();
  const gains = cands.map((v) => gainOf(rows, v));
  const bi = gains[1] !== undefined && gains[1] > gains[0] + 1e-12 ? 1 : 0;
  if (early && gains[bi] <= 1e-12) return leaf();
  const v = cands[bi];
  const t = grow(
    rows.filter((r) => r[v]),
    [...used, v],
    early,
    `${key}${v}t`,
  );
  const f = grow(
    rows.filter((r) => !r[v]),
    [...used, v],
    early,
    `${key}${v}f`,
  );
  return {
    tv: { key, label: `${v}?`, sub: `gain ${fmt(gains[bi], 3)}`, kids: [{ edge: 't', node: t.tv }, { edge: 'f', node: f.tv }] },
    rows,
    leaves: [...t.leaves, ...f.leaves],
  };
}

export function XorGainLab() {
  const [labels, setLabels] = useState<boolean[]>(CELLS.map(([a, b]) => a !== b));
  const [preset, setPreset] = useState('xor');
  const [early, setEarly] = useState(false);
  const rows: Row[] = CELLS.map(([A, B], i) => ({ A, B, y: labels[i] }));
  const res = grow(rows, [], early, 'r');
  const errors = res.leaves.reduce((s, l) => s + l.rows.filter((r) => r.y !== l.pred).length, 0);
  const within = (v: 'A' | 'B', val: boolean, other: 'A' | 'B') => gainOf(rows.filter((r) => r[v] === val), other);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="target"
          options={[...Object.entries(PRESETS).map(([k, p]) => ({ value: k, label: p.label })), ...(preset === 'custom' ? [{ value: 'custom', label: 'your function' }] : [])]}
          value={preset}
          onChange={(k) => {
            if (k === 'custom') return;
            setPreset(k);
            setLabels(CELLS.map(([a, b]) => PRESETS[k].f(a, b)));
          }}
        />
        <Toggle label="stop when the best gain is 0" checked={early} onChange={setEarly} />
      </div>
      <div className="lab-grid">
        <div>
          <div className="truth-grid" role="group" aria-label="Truth table; click a cell to flip its label">
            <span />
            <span className="tg-head">B = t</span>
            <span className="tg-head">B = f</span>
            {[true, false].map((a) => (
              <div key={String(a)} style={{ display: 'contents' }}>
                <span className="tg-head">A = {a ? 't' : 'f'}</span>
                {[true, false].map((b) => {
                  const i = CELLS.findIndex(([x, y]) => x === a && y === b);
                  return (
                    <button
                      key={String(b)}
                      className={`tg-cell ${labels[i] ? 'pos' : 'neg'}`}
                      onClick={() => {
                        setPreset('custom');
                        setLabels(labels.map((l, j) => (j === i ? !l : l)));
                      }}
                    >
                      {labels[i] ? 'True' : 'False'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th>where</th>
                  <th>gain of A</th>
                  <th>gain of B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>root (all four)</td>
                  <td>{fmt(gainOf(rows, 'A'), 4)}</td>
                  <td>{fmt(gainOf(rows, 'B'), 4)}</td>
                </tr>
                <tr>
                  <td>inside A = t</td>
                  <td>—</td>
                  <td>{fmt(within('A', true, 'B'), 4)}</td>
                </tr>
                <tr>
                  <td>inside A = f</td>
                  <td>—</td>
                  <td>{fmt(within('A', false, 'B'), 4)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="controls">
          <TreeView root={res.tv} slotW={88} ariaLabel="The greedily grown tree" />
          <Readout
            items={[
              { label: 'training errors', value: `${errors}/4`, tone: errors ? 'bad' : 'good' },
              { label: 'leaves', value: String(res.leaves.length) },
            ]}
          />
          <p className="small muted">
            Ties in gain go to A; a tied leaf predicts False. <M t="\text{gain} = 0" /> at the root means one test alone tells you nothing — not that the
            pair of tests is useless.
          </p>
        </div>
      </div>
    </div>
  );
}
