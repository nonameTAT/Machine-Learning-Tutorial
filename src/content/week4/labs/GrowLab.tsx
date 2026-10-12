import { useState, type ReactNode } from 'react';
import { Readout, Segmented, Toggle } from '../../../components/ui';
import { fmt } from '../../../lib/num';
import { childEntropy, entropy, gainRatio, infoGain, majority, meanOf, splitEntropy, sseOf } from '../../../lib/tree';
import { DAY_ATTR, ORGANS, ORGAN_ATTRS, TENNIS, TENNIS_ATTRS, type OrganRow, type TennisRow } from './data';
import { TreeView, type TV } from './TreeView';

// “Grow it yourself”: a tree on categorical attributes where every node shows the candidate tests,
// computed on the examples at that node only. Used for PlayTennis (classification, information gain or
// gain ratio) and for the Hammond organs (regression, weighted MSE).

interface Attr<R> {
  name: string;
  values: string[];
  get: (r: R) => string;
}

interface Score {
  /** impurity after the test: expected entropy, or weighted MSE */
  after: number;
  /** impurity removed: information gain, or MSE reduction */
  gain: number;
  splitH: number;
  ratio: number;
}

interface Task<R> {
  kind: 'class' | 'reg';
  rows: R[];
  rowName: (r: R) => string;
  /** the leaf's label; an empty leaf falls back on its parent's examples */
  leaf: (rows: R[], parent: R[]) => { label: string; tone: 'pos' | 'neg' | 'plain'; value: string | number };
  sub: (rows: R[]) => string;
  impurity: (rows: R[]) => number;
  score: (children: R[][]) => Score;
  childText: (rows: R[]) => string;
  /** training loss of a prediction for one row (0/1 for classes, squared error for prices) */
  loss: (r: R, pred: string | number) => number;
  num: (v: number) => string;
}

const tennisCounts = (rows: TennisRow[]) => [rows.filter((r) => r.play === 'Yes').length, rows.filter((r) => r.play === 'No').length];

const TENNIS_TASK: Task<TennisRow> = {
  kind: 'class',
  rows: TENNIS,
  rowName: (r) => r.day,
  leaf: (rows, parent) => {
    const c = tennisCounts(rows.length ? rows : parent);
    // a tie at a nonempty node falls back on the parent majority as well
    const use = c[0] === c[1] && rows.length ? tennisCounts(parent) : c;
    const yes = majority(use) === 0;
    return { label: (yes ? 'Yes' : 'No') + (rows.length ? '' : ' (empty)'), tone: yes ? 'pos' : 'neg', value: yes ? 'Yes' : 'No' };
  },
  sub: (rows) => {
    const c = tennisCounts(rows);
    return `${c[0]} Y · ${c[1]} N`;
  },
  impurity: (rows) => entropy(tennisCounts(rows)),
  score: (children) => {
    const kids = children.map(tennisCounts);
    return { after: childEntropy(kids), gain: infoGain(kids), splitH: splitEntropy(kids), ratio: gainRatio(kids) };
  },
  childText: (rows) => {
    const c = tennisCounts(rows);
    return `(${c[0]}, ${c[1]})`;
  },
  loss: (r, pred) => (r.play === pred ? 0 : 1),
  num: (v) => fmt(v, 4),
};

const prices = (rows: OrganRow[]) => rows.map((r) => r.price);
const money = (v: number) => (Number.isFinite(v) ? Math.round(v * 10) / 10 : NaN).toLocaleString('en-US');

const ORGAN_TASK: Task<OrganRow> = {
  kind: 'reg',
  rows: ORGANS,
  rowName: (r) => String(r.price),
  leaf: (rows, parent) => {
    const m = meanOf(prices(rows.length ? rows : parent));
    return { label: money(m) + (rows.length ? '' : ' (empty)'), tone: 'plain', value: m };
  },
  sub: (rows) => `n = ${rows.length}`,
  impurity: (rows) => (rows.length ? sseOf(prices(rows)) / rows.length : 0),
  score: (children) => {
    const n = children.reduce((s, c) => s + c.length, 0);
    const after = children.reduce((s, c) => s + sseOf(prices(c)), 0) / n;
    const parent = children.flat();
    return { after, gain: sseOf(prices(parent)) / n - after, splitH: entropy(children.map((c) => c.length)), ratio: NaN };
  },
  childText: (rows) => (rows.length ? `${money(meanOf(prices(rows)))} (n=${rows.length})` : 'empty'),
  loss: (r, pred) => (r.price - Number(pred)) ** 2,
  num: (v) => money(v),
};

interface GNode<R> {
  key: string;
  /** the tests answered on the way here, e.g. ["Outlook = Sunny"] */
  conds: string[];
  rows: R[];
  parent: R[];
  used: string[];
  attr?: Attr<R>;
  kids?: { value: string; node: GNode<R> }[];
}

function buildNode<R>(splits: Record<string, string>, attrs: Attr<R>[], key: string, rows: R[], parent: R[], used: string[], conds: string[]): GNode<R> {
  const attr = attrs.find((a) => a.name === splits[key] && !used.includes(a.name));
  const node: GNode<R> = { key, conds, rows, parent, used };
  if (!attr || rows.length === 0) return node;
  node.attr = attr;
  node.kids = attr.values.map((v) => ({
    value: v,
    node: buildNode(
      splits,
      attrs,
      `${key}|${attr.name}=${v}`,
      rows.filter((r) => attr.get(r) === v),
      rows,
      [...used, attr.name],
      [...conds, `${attr.name} = ${v}`],
    ),
  }));
  return node;
}

function findNode<R>(n: GNode<R>, key: string): GNode<R> | null {
  if (n.key === key) return n;
  for (const k of n.kids ?? []) {
    const f = findNode(k.node, key);
    if (f) return f;
  }
  return null;
}

function toTV<R>(task: Task<R>, n: GNode<R>): TV {
  if (!n.attr || !n.kids) {
    const l = task.leaf(n.rows, n.parent);
    return { key: n.key, label: l.label, sub: task.sub(n.rows), leaf: true, tone: l.tone };
  }
  return { key: n.key, label: n.attr.name, sub: task.sub(n.rows), kids: n.kids.map((k) => ({ edge: k.value, node: toTV(task, k.node) })) };
}

function predictRow<R>(task: Task<R>, n: GNode<R>, r: R): string | number {
  if (!n.attr || !n.kids) return task.leaf(n.rows, n.parent).value;
  const v = n.attr.get(r);
  const k = n.kids.find((c) => c.value === v)!;
  return predictRow(task, k.node, r);
}

const depthOf = <R,>(n: GNode<R>): number => (n.kids ? 1 + Math.max(...n.kids.map((k) => depthOf(k.node))) : 0);
const leavesOf = <R,>(n: GNode<R>): number => (n.kids ? n.kids.reduce((s, k) => s + leavesOf(k.node), 0) : 1);

type Criterion = 'gain' | 'ratio';

/** Index of the best candidate under the criterion, or −1 if no candidate actually splits the examples. */
function bestIndex(kind: 'class' | 'reg', scores: Score[], criterion: Criterion) {
  const value = (s: Score) => (kind === 'reg' ? -s.after : criterion === 'ratio' ? s.ratio : s.gain);
  let best = -1;
  scores.forEach((s, i) => {
    if (s.splitH < 1e-12) return;
    if (best < 0 || value(s) > value(scores[best]) + 1e-12) best = i;
  });
  return best;
}

function autoGrow<R>(task: Task<R>, attrs: Attr<R>[], criterion: Criterion, maxDepth: number): Record<string, string> {
  const out: Record<string, string> = {};
  const go = (key: string, rows: R[], used: string[], depth: number) => {
    if (rows.length === 0 || depth >= maxDepth || task.impurity(rows) < 1e-12) return;
    const cands = attrs.filter((a) => !used.includes(a.name));
    const scores = cands.map((a) => task.score(a.values.map((v) => rows.filter((r) => a.get(r) === v))));
    const b = bestIndex(task.kind, scores, criterion);
    if (b < 0) return;
    const a = cands[b];
    out[key] = a.name;
    for (const v of a.values)
      go(
        `${key}|${a.name}=${v}`,
        rows.filter((r) => a.get(r) === v),
        [...used, a.name],
        depth + 1,
      );
  };
  go('root', task.rows, [], 0);
  return out;
}

function GrowLab<R>({
  task,
  attrs,
  criterion,
  criterionControl,
  autoDepth = Infinity,
  slotW,
  extraControls,
  initial = {},
}: {
  task: Task<R>;
  attrs: Attr<R>[];
  criterion: Criterion;
  criterionControl?: ReactNode;
  autoDepth?: number;
  slotW?: number;
  extraControls?: ReactNode;
  initial?: Record<string, string>;
}) {
  const [splits, setSplits] = useState<Record<string, string>>(initial);
  const [sel, setSel] = useState('root');
  const root = buildNode(splits, attrs, 'root', task.rows, task.rows, [], []);
  const node = findNode(root, sel) ?? root;
  const cands = attrs.filter((a) => !node.used.includes(a.name));
  const scores = cands.map((a) => task.score(a.values.map((v) => node.rows.filter((r) => a.get(r) === v))));
  const best = bestIndex(task.kind, scores, criterion);
  const showRatio = task.kind === 'class' && (criterion === 'ratio' || attrs.length > 3);
  const loss = task.rows.reduce((s, r) => s + task.loss(r, predictRow(task, root, r)), 0);
  const split = (name: string | null) => {
    const next = { ...splits };
    // drop this node's old subtree choices, then set the new test
    for (const k of Object.keys(next)) if (k === node.key || k.startsWith(`${node.key}|`)) delete next[k];
    if (name) next[node.key] = name;
    setSplits(next);
  };

  return (
    <div>
      <div className="btn-row">
        <button className="btn btn-primary" onClick={() => setSplits(autoGrow(task, attrs, criterion, autoDepth))}>
          Grow greedily{Number.isFinite(autoDepth) ? ` (${autoDepth} levels)` : ''}
        </button>
        <button
          className="btn"
          onClick={() => {
            setSplits({});
            setSel('root');
          }}
        >
          Reset to a single leaf
        </button>
        {criterionControl}
        {extraControls}
      </div>
      <TreeView root={toTV(task, root)} selected={node.key} onSelect={setSel} slotW={slotW} ariaLabel="The tree grown so far; select a node to inspect it" />
      <Readout
        items={[
          { label: 'leaves', value: String(leavesOf(root)) },
          { label: 'depth', value: String(depthOf(root)) },
          task.kind === 'class'
            ? { label: 'training errors', value: `${loss}/${task.rows.length}`, tone: loss === 0 ? 'good' : 'accent' }
            : { label: 'training MSE', value: money(loss / task.rows.length), tone: 'accent' },
        ]}
      />
      <div className="node-panel">
        <div className="panel-title">
          Selected node: {node.conds.length ? node.conds.join(' ∧ ') : 'the root (all examples)'} — click any node in the tree to inspect it
        </div>
        <p className="small" style={{ margin: '4px 0' }}>
          {node.rows.length} example{node.rows.length === 1 ? '' : 's'}: {node.rows.map(task.rowName).join(', ') || 'none'} · {task.sub(node.rows)} ·{' '}
          {task.kind === 'class' ? 'H' : 'MSE'} = {task.num(task.impurity(node.rows))}
        </p>
        {node.rows.length === 0 ? (
          <p className="small muted">No training examples reach this branch, so its leaf copies the parent’s prediction.</p>
        ) : task.impurity(node.rows) < 1e-12 ? (
          <p className="small muted">This node is pure (zero {task.kind === 'class' ? 'entropy' : 'error'}): nothing is left to explain.</p>
        ) : null}
        {cands.length > 0 && node.rows.length > 0 && (
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th>test</th>
                  <th>children {task.kind === 'class' ? '(Yes, No)' : '(mean price)'}</th>
                  <th>{task.kind === 'class' ? 'H after' : 'weighted MSE'}</th>
                  <th>{task.kind === 'class' ? 'gain' : 'reduction'}</th>
                  {showRatio && <th>split H</th>}
                  {showRatio && <th>gain ratio</th>}
                  <th />
                </tr>
              </thead>
              <tbody>
                {cands.map((a, i) => {
                  const sc = scores[i];
                  const on = node.attr?.name === a.name;
                  return (
                    <tr key={a.name} className={i === best ? 'row-best' : undefined}>
                      <td>
                        <strong>{a.name}</strong>
                      </td>
                      <td className="small">
                        {a.name === 'Day'
                          ? '14 singletons, each pure'
                          : a.values.map((v) => `${v} ${task.childText(node.rows.filter((r) => a.get(r) === v))}`).join('; ')}
                      </td>
                      <td>{task.num(sc.after)}</td>
                      <td>{task.num(sc.gain)}</td>
                      {showRatio && <td>{fmt(sc.splitH, 4)}</td>}
                      {showRatio && <td>{Number.isNaN(sc.ratio) ? 'undefined' : fmt(sc.ratio, 4)}</td>}
                      <td>
                        <button className={`btn ${on ? '' : 'btn-ghost'}`} onClick={() => split(on ? null : a.name)} disabled={sc.splitH < 1e-12}>
                          {on ? 'Undo split' : 'Split here'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {cands.length === 0 && node.rows.length > 0 && <p className="small muted">Every attribute has already been tested on this path.</p>}
        <p className="small muted">
          The highlighted row is the greedy choice here ({task.kind === 'reg' ? 'smallest weighted MSE' : criterion === 'ratio' ? 'largest gain ratio' : 'largest information gain'}). Every
          number in the table uses only the examples at this node.
        </p>
      </div>
    </div>
  );
}

/** ID3 on PlayTennis. With `withDay`, the row identifier joins the candidates (the gain-ratio lesson). */
export function TennisGrowLab({ withDay = false, initialCriterion = 'gain' }: { withDay?: boolean; initialCriterion?: Criterion }) {
  const [criterion, setCriterion] = useState<Criterion>(initialCriterion);
  const [day, setDay] = useState(withDay);
  const attrs = day ? [...TENNIS_ATTRS, DAY_ATTR] : TENNIS_ATTRS;
  return (
    <GrowLab
      key={day ? 'day' : 'nod'}
      task={TENNIS_TASK}
      attrs={attrs}
      criterion={criterion}
      slotW={day ? 62 : 96}
      criterionControl={
        <Segmented
          label="split criterion"
          options={[
            { value: 'gain', label: 'information gain' },
            { value: 'ratio', label: 'gain ratio' },
          ]}
          value={criterion}
          onChange={setCriterion}
        />
      }
      extraControls={<Toggle label="Day (row ID) is a candidate" checked={day} onChange={setDay} />}
    />
  );
}

/** A regression tree on the organ prices, scored by weighted MSE. */
export function OrganGrowLab() {
  return <GrowLab task={ORGAN_TASK} attrs={ORGAN_ATTRS} criterion="gain" autoDepth={2} slotW={84} />;
}
