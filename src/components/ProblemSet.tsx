import { useState, type ReactNode } from 'react';
import { Callout, Reveal, Sec } from './ui';
import { useStored } from '../lib/storage';

export type PStatus = 'none' | 'shaky' | 'solid';

export interface Problem {
  id: string;
  title: string;
  /** route id of the lesson the problem practises */
  lesson: string;
  q: ReactNode;
  hint?: ReactNode;
  sol: ReactNode;
}

export interface ProblemGroup {
  key: string;
  title: string;
  intro: string;
  items: Problem[];
}

export const problemIds = (groups: ProblemGroup[]) => groups.flatMap((g) => g.items.map((p) => p.id));

function ProblemCard({ p, storeKey }: { p: Problem; storeKey: string }) {
  const [status, setStatus] = useStored<Record<string, PStatus>>(storeKey, {});
  const st = status[p.id] ?? 'none';
  const opts: { v: PStatus; label: string }[] = [
    { v: 'none', label: 'Not yet' },
    { v: 'shaky', label: 'Shaky' },
    { v: 'solid', label: 'Solid' },
  ];
  return (
    <div className="problem" id={`p-${p.id}`}>
      <div className="problem-head">
        <span>
          <span className="problem-id">{p.id}</span>
          <span className="problem-title">{p.title}</span>{' '}
          <a className="kbd-hint" href={`#/${p.lesson}`}>
            (lesson)
          </a>
        </span>
        <span className="status-pills" role="radiogroup" aria-label={`status for ${p.id}`}>
          {opts.map((o) => (
            <button key={o.v} role="radio" aria-checked={st === o.v} className={`pill ${st === o.v ? `on s-${o.v}` : ''}`} onClick={() => setStatus({ ...status, [p.id]: o.v })}>
              {o.label}
            </button>
          ))}
        </span>
      </div>
      {p.q}
      {p.hint && (
        <Reveal label="Hint" kind="hint">
          <p>{p.hint}</p>
        </Reveal>
      )}
      <Reveal label="Show solution">{p.sol}</Reveal>
    </div>
  );
}

/** A practice page: grouped problems with hints, solutions and a self-rating stored under `storeKey`. */
export function ProblemSet({ groups, storeKey, children }: { groups: ProblemGroup[]; storeKey: string; children?: ReactNode }) {
  const [status] = useStored<Record<string, PStatus>>(storeKey, {});
  const [filter, setFilter] = useState<'all' | 'todo' | 'shaky'>('all');
  const ids = problemIds(groups);
  const shown = (p: Problem) => {
    const st = status[p.id] ?? 'none';
    return filter === 'all' || (filter === 'todo' && st !== 'solid') || (filter === 'shaky' && st === 'shaky');
  };
  const solid = ids.filter((id) => status[id] === 'solid').length;
  return (
    <>
      <Callout kind="note" title="How to use these">
        Attempt each problem on paper before opening anything. Use the hint only when stuck, then compare your reasoning — not just your final answer —
        with the solution. Rate yourself honestly; the readiness page collects your ratings.
      </Callout>
      <div className="btn-row">
        <span className="kbd-hint">
          {solid}/{ids.length} rated solid · show:
        </span>
        {(['all', 'todo', 'shaky'] as const).map((f) => (
          <button key={f} className={`pill ${filter === f ? 'on s-none' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'all' : f === 'todo' ? 'not yet solid' : 'shaky only'}
          </button>
        ))}
      </div>
      {groups.map((g) => (
        <Sec key={g.key} title={g.title}>
          <p className="muted">{g.intro}</p>
          {g.items.filter(shown).map((p) => (
            <ProblemCard key={p.id} p={p} storeKey={storeKey} />
          ))}
        </Sec>
      ))}
      {children}
    </>
  );
}
