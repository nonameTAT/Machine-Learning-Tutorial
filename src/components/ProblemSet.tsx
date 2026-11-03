import { Children, createContext, isValidElement, useContext, useState, type ComponentType, type ReactElement, type ReactNode } from 'react';
import { Callout, Reveal, Sec } from './ui';
import { useStored } from '../lib/storage';

export type PStatus = 'none' | 'shaky' | 'solid';

/** What the rest of the site knows about a problem. A week's practice.mdx exports these as `groups`. */
export interface ProblemMeta {
  id: string;
  title: string;
  /** slug of the lesson the problem practises (as in the week's index.ts) */
  lesson: string;
}

export interface ProblemGroup {
  key: string;
  title: string;
  intro: string;
  items: ProblemMeta[];
}

export const problemIds = (groups: ProblemGroup[]) => groups.flatMap((g) => g.items.map((p) => p.id));

interface PracticeState {
  storeKey: string;
  lessonRoute: (slug: string) => string;
  shown: (id: string) => boolean;
}
const PracticeContext = createContext<PracticeState | null>(null);

function usePractice() {
  const ctx = useContext(PracticeContext);
  if (!ctx) throw new Error('<Group> and <Problem> only work in a practice page.');
  return ctx;
}

/* ---------------- written in practice.mdx ---------------- */

/** A section of problems: `<Group id="A" title="A · Derivations" intro="…">`. */
export function Group({ title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <Sec title={title}>
      {intro && <p className="muted">{intro}</p>}
      {children}
    </Sec>
  );
}

/** Revealed on request inside a <Problem>. */
export function Hint({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

/** Revealed on request inside a <Problem>. */
export function Solution({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

const isBlock = (c: ReactNode) => isValidElement(c) && typeof c.type === 'string' && ['p', 'div', 'ul', 'ol', 'table'].includes(c.type);

/** One problem. Children: the question, then an optional <Hint> and a <Solution>. */
export function Problem({ id, title, lesson, children }: ProblemMeta & { children: ReactNode }) {
  const { storeKey, lessonRoute, shown } = usePractice();
  const [status, setStatus] = useStored<Record<string, PStatus>>(storeKey, {});
  if (!shown(id)) return null;
  const st = status[id] ?? 'none';
  const opts: { v: PStatus; label: string }[] = [
    { v: 'none', label: 'Not yet' },
    { v: 'shaky', label: 'Shaky' },
    { v: 'solid', label: 'Solid' },
  ];
  const q: ReactNode[] = [];
  let hint: ReactNode[] | null = null;
  let sol: ReactNode = null;
  Children.toArray(children).forEach((c) => {
    if (isValidElement(c) && c.type === Hint) hint = Children.toArray((c as ReactElement<{ children?: ReactNode }>).props.children);
    else if (isValidElement(c) && c.type === Solution) sol = (c as ReactElement<{ children?: ReactNode }>).props.children;
    else q.push(c);
  });
  const h = hint as ReactNode[] | null;
  return (
    <div className="problem" id={`p-${id}`}>
      <div className="problem-head">
        <span>
          <span className="problem-id">{id}</span>
          <span className="problem-title">{title}</span>{' '}
          <a className="kbd-hint" href={`#/${lessonRoute(lesson)}`}>
            (lesson)
          </a>
        </span>
        <span className="status-pills" role="radiogroup" aria-label={`status for ${id}`}>
          {opts.map((o) => (
            <button key={o.v} role="radio" aria-checked={st === o.v} className={`pill ${st === o.v ? `on s-${o.v}` : ''}`} onClick={() => setStatus({ ...status, [id]: o.v })}>
              {o.label}
            </button>
          ))}
        </span>
      </div>
      {q}
      {h && (
        <Reveal label="Hint" kind="hint">
          {h.some(isBlock) ? h : <p>{h}</p>}
        </Reveal>
      )}
      <Reveal label="Show solution">{sol}</Reveal>
    </div>
  );
}

/* ---------------- the page ---------------- */

/** A practice page: the problems in `Page` (a practice.mdx) with hints, solutions and a self-rating stored under `storeKey`. */
export function ProblemSet({
  groups,
  storeKey,
  lessonRoute,
  Page,
}: {
  groups: ProblemGroup[];
  storeKey: string;
  /** lesson slug → route id */
  lessonRoute: (slug: string) => string;
  Page: ComponentType;
}) {
  const [status] = useStored<Record<string, PStatus>>(storeKey, {});
  const [filter, setFilter] = useState<'all' | 'todo' | 'shaky'>('all');
  const ids = problemIds(groups);
  const shown = (id: string) => {
    const st = status[id] ?? 'none';
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
      <PracticeContext.Provider value={{ storeKey, lessonRoute, shown }}>
        <Page />
      </PracticeContext.Provider>
    </>
  );
}
