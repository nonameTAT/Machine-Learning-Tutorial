import { useState } from 'react';
import { M } from '../../../components/Math';
import { Readout, Segmented } from '../../../components/ui';
import { TreeView, type TV } from './TreeView';

type Assign = Record<string, boolean>;

interface Fn {
  id: string;
  label: string;
  tex: string;
  vars: string[];
  f: (v: Assign) => boolean;
}

const parity = (v: Assign, vars: string[]) => vars.filter((x) => v[x]).length % 2 === 1;

const FNS: Fn[] = [
  { id: 'andnot', label: 'A ∧ ¬B', tex: 'A \\wedge \\neg B', vars: ['A', 'B'], f: (v) => v.A && !v.B },
  { id: 'orand', label: 'A ∨ (B ∧ C)', tex: 'A \\vee (B \\wedge C)', vars: ['A', 'B', 'C'], f: (v) => v.A || (v.B && v.C) },
  { id: 'xor', label: 'A XOR B', tex: 'A \\oplus B', vars: ['A', 'B'], f: (v) => v.A !== v.B },
  { id: 'twoand', label: '(A ∧ B) ∨ (C ∧ D)', tex: '(A \\wedge B) \\vee (C \\wedge D)', vars: ['A', 'B', 'C', 'D'], f: (v) => (v.A && v.B) || (v.C && v.D) },
  { id: 'par3', label: 'parity(A, B, C)', tex: 'A \\oplus B \\oplus C', vars: ['A', 'B', 'C'], f: (v) => parity(v, ['A', 'B', 'C']) },
  { id: 'par4', label: 'parity(A, B, C, D)', tex: 'A \\oplus B \\oplus C \\oplus D', vars: ['A', 'B', 'C', 'D'], f: (v) => parity(v, ['A', 'B', 'C', 'D']) },
];

/** Every assignment of the variables not yet fixed, merged with the fixed ones. */
function completions(vars: string[], fixed: Assign): Assign[] {
  let out: Assign[] = [{ ...fixed }];
  for (const v of vars) if (!(v in fixed)) out = out.flatMap((a) => [{ ...a, [v]: true }, { ...a, [v]: false }]);
  return out;
}

const dependsOn = (fn: Fn, fixed: Assign, v: string) => completions(fn.vars, { ...fixed, [v]: true }).some((a) => fn.f(a) !== fn.f({ ...a, [v]: false }));

interface Built {
  tv: TV;
  leaves: number;
  tests: number;
  depth: number;
  /** conjunctions leading to True leaves */
  rules: string[];
}

/**
 * Substitute variables one at a time, in `order`. Stop as soon as the restricted function is constant;
 * skip a variable the restricted function no longer depends on (testing it would give two identical subtrees).
 */
function build(fn: Fn, order: string[], fixed: Assign = {}, key = 'r', lits: string[] = []): Built {
  const outs = completions(fn.vars, fixed).map(fn.f);
  if (outs.every((o) => o === outs[0])) {
    const val = outs[0];
    return {
      tv: { key, label: val ? 'True' : 'False', leaf: true, tone: val ? 'pos' : 'neg' },
      leaves: 1,
      tests: 0,
      depth: 0,
      rules: val ? [lits.length ? lits.join(' ∧ ') : 'always'] : [],
    };
  }
  const v = order.find((x) => !(x in fixed) && dependsOn(fn, fixed, x))!;
  const t = build(fn, order, { ...fixed, [v]: true }, `${key}${v}t`, [...lits, v]);
  const f = build(fn, order, { ...fixed, [v]: false }, `${key}${v}f`, [...lits, `¬${v}`]);
  return {
    tv: { key, label: `${v}?`, kids: [{ edge: 't', node: t.tv }, { edge: 'f', node: f.tv }] },
    leaves: t.leaves + f.leaves,
    tests: 1 + t.tests + f.tests,
    depth: 1 + Math.max(t.depth, f.depth),
    rules: [...t.rules, ...f.rules],
  };
}

function permutations(xs: string[]): string[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) => permutations([...xs.slice(0, i), ...xs.slice(i + 1)]).map((p) => [x, ...p]));
}

/** Build a tree for a Boolean function by fixing one variable at a time; reorder the variables and compare sizes. */
export function BooleanTreeLab() {
  const [id, setId] = useState('andnot');
  const fn = FNS.find((f) => f.id === id)!;
  const [orders, setOrders] = useState<Record<string, string[]>>({});
  const order = orders[id] ?? fn.vars;
  const res = build(fn, order);
  const sizes = permutations(fn.vars).map((p) => build(fn, p).leaves);
  const best = Math.min(...sizes);
  const worst = Math.max(...sizes);
  const moveEarlier = (i: number) => {
    if (i === 0) return;
    const next = [...order];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setOrders({ ...orders, [id]: next });
  };

  return (
    <div>
      <div className="btn-row">
        <Segmented label="Boolean function" options={FNS.map((f) => ({ value: f.id, label: f.label }))} value={id} onChange={setId} />
      </div>
      <div className="btn-row">
        <span className="small">Variable order (click a variable to move it earlier):</span>
        {order.map((v, i) => (
          <button key={v} className="btn" onClick={() => moveEarlier(i)} disabled={i === 0} aria-label={`move ${v} earlier`}>
            {i > 0 && '← '}
            {v}
          </button>
        ))}
      </div>
      <TreeView root={res.tv} slotW={res.leaves > 8 ? 62 : 80} levelH={64} ariaLabel={`A decision tree for ${fn.label}`} />
      <p className="small muted" style={{ textAlign: 'center' }}>
        <M t={`Y = ${fn.tex}`} /> — left branches t, right branches f.
      </p>
      <div className="lab-grid even">
        <Readout
          items={[
            { label: 'tests (internal nodes)', value: String(res.tests) },
            { label: 'leaves', value: String(res.leaves), tone: 'accent' },
            { label: 'depth', value: String(res.depth) },
            { label: 'leaves over all orders', value: best === worst ? String(best) : `${best} to ${worst}` },
          ]}
        />
        <div className="controls">
          <div className="panel-title">Paths to True (one rule per True leaf)</div>
          <ul className="small" style={{ margin: 0 }}>
            {res.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <p className="small muted">
            A variable is tested only if the function, restricted by the answers so far, still depends on it. That is why A ∨ (B ∧ C) stops after A = t.
          </p>
        </div>
      </div>
    </div>
  );
}
