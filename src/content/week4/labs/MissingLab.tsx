import { useState } from 'react';
import { Readout, Segmented } from '../../../components/ui';
import { fadd, fmul, frac, fstr, fval, type Frac } from '../../../lib/frac';
import { fmt } from '../../../lib/num';
import { TENNIS, type TennisRow } from './data';
import { TreeView, type TV } from './TreeView';

type Key = 'outlook' | 'humidity' | 'wind';
const MISSING = '?';
const VALUES: Record<Key, string[]> = { outlook: ['Sunny', 'Overcast', 'Rain'], humidity: ['High', 'Normal'], wind: ['Weak', 'Strong'] };
const NAMES: Record<Key, string> = { outlook: 'Outlook', humidity: 'Humidity', wind: 'Wind' };

interface MNode {
  key: string;
  rows: TennisRow[];
  attr?: Key;
  kids?: { value: string; node: MNode }[];
}

const sub = (rows: TennisRow[], k: Key, v: string) => rows.filter((r) => r[k] === v);
const node = (key: string, rows: TennisRow[], attr?: Key, kids?: (rows: TennisRow[]) => MNode[]): MNode => {
  if (!attr) return { key, rows };
  const ks = kids ? kids(rows) : [];
  return { key, rows, attr, kids: VALUES[attr].map((v, i) => ({ value: v, node: ks[i] })) };
};

// The tree ID3 grows on PlayTennis: Outlook at the root, Humidity under Sunny, Wind under Rain.
const TREE: MNode = node('root', TENNIS, 'outlook', (rows) => [
  node('sunny', sub(rows, 'outlook', 'Sunny'), 'humidity', (r) => [node('sunny-high', sub(r, 'humidity', 'High')), node('sunny-normal', sub(r, 'humidity', 'Normal'))]),
  node('overcast', sub(rows, 'outlook', 'Overcast')),
  node('rain', sub(rows, 'outlook', 'Rain'), 'wind', (r) => [node('rain-weak', sub(r, 'wind', 'Weak')), node('rain-strong', sub(r, 'wind', 'Strong'))]),
]);

const yesFrac = (rows: TennisRow[]) => frac(rows.filter((r) => r.play === 'Yes').length, rows.length);

/** Weight reaching every node: a known value sends all of it down one branch; a missing one splits it by training branch sizes. */
function route(n: MNode, q: Record<Key, string>, w: Frac, out: Map<string, Frac>) {
  out.set(n.key, w);
  if (!n.attr || !n.kids) return;
  const v = q[n.attr];
  for (const k of n.kids) {
    const share = v === MISSING ? frac(k.node.rows.length, n.rows.length) : frac(k.value === v ? 1 : 0);
    route(k.node, q, fmul(w, share), out);
  }
}

/** The alternative policy: replace a missing value by the most common value among the training examples at that node. */
function modalLeaf(n: MNode, q: Record<Key, string>): { leaf: MNode; filled: string[] } {
  if (!n.attr || !n.kids) return { leaf: n, filled: [] };
  let v = q[n.attr];
  const filled: string[] = [];
  if (v === MISSING) {
    const best = n.kids.reduce((b, k) => (k.node.rows.length > b.node.rows.length ? k : b), n.kids[0]);
    v = best.value;
    filled.push(`${NAMES[n.attr]} := ${v}`);
  }
  const r = modalLeaf(n.kids.find((k) => k.value === v)!.node, q);
  return { leaf: r.leaf, filled: [...filled, ...r.filled] };
}

export function MissingLab() {
  const [q, setQ] = useState<Record<Key, string>>({ outlook: 'Sunny', humidity: MISSING, wind: 'Weak' });
  const weights = new Map<string, Frac>();
  route(TREE, q, frac(1), weights);
  let pYes = frac(0);
  const leaves: MNode[] = [];
  const collect = (n: MNode) => (n.kids ? n.kids.forEach((k) => collect(k.node)) : leaves.push(n));
  collect(TREE);
  for (const l of leaves) pYes = fadd(pYes, fmul(weights.get(l.key)!, yesFrac(l.rows)));
  const modal = modalLeaf(TREE, q);
  const modalYes = fval(yesFrac(modal.leaf.rows)) > 0.5;

  const toTV = (n: MNode): TV => {
    const w = weights.get(n.key)!;
    if (!n.attr || !n.kids) {
      const yes = fval(yesFrac(n.rows)) > 0.5;
      return { key: n.key, label: yes ? 'Yes' : 'No', sub: `weight ${fstr(w)}`, leaf: true, tone: yes ? 'pos' : 'neg' };
    }
    return {
      key: n.key,
      label: NAMES[n.attr],
      sub: `weight ${fstr(w)}`,
      kids: n.kids.map((k) => ({ edge: k.value, node: toTV(k.node) })),
    };
  };
  const reached = [...weights.entries()].filter(([, w]) => w.n > 0).map(([k]) => k);

  return (
    <div>
      <div className="btn-row" style={{ flexWrap: 'wrap' }}>
        {(Object.keys(VALUES) as Key[]).map((k) => (
          <Segmented
            key={k}
            label={NAMES[k]}
            options={[...VALUES[k], MISSING].map((v) => ({ value: v, label: v === MISSING ? `${NAMES[k]} ?` : v }))}
            value={q[k]}
            onChange={(v) => setQ({ ...q, [k]: v })}
          />
        ))}
      </div>
      <TreeView root={toTV(TREE)} path={reached} slotW={104} ariaLabel="The PlayTennis tree with the weight of the query reaching each node" />
      <div className="lab-grid even">
        <div>
          <div className="panel-title">Fractional routing</div>
          <Readout
            items={[
              { label: 'P(Yes)', value: `${fstr(pYes)} ≈ ${fmt(fval(pYes), 3)}`, tone: 'accent' },
              { label: 'P(No)', value: `${fstr(fadd(frac(1), fmul(frac(-1), pYes)))} ≈ ${fmt(1 - fval(pYes), 3)}` },
              { label: 'prediction', value: fval(pYes) > 0.5 ? 'Yes' : fval(pYes) < 0.5 ? 'No' : 'tie' },
            ]}
          />
        </div>
        <div>
          <div className="panel-title">Most common value at the node</div>
          <Readout
            items={[
              { label: 'filled in', value: modal.filled.length ? modal.filled.join(', ') : 'nothing missing on the path' },
              { label: 'prediction', value: modalYes ? 'Yes' : 'No' },
            ]}
          />
        </div>
      </div>
      <p className="small muted">
        A missing value at a node sends the example down every branch, weighted by the fraction of training examples that went that way. Values the path never
        tests do not matter, missing or not.
      </p>
    </div>
  );
}
