import { useId, useState, type ReactNode } from 'react';
import { useStored } from '../lib/storage';

/* ---------------- structure ---------------- */

export function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** A titled section; its id feeds the "On this page" outline. */
export function Sec({ title, children, id }: { title: string; children: ReactNode; id?: string }) {
  return (
    <section className="sec">
      <h2 id={id ?? slug(title)}>{title}</h2>
      {children}
    </section>
  );
}

export function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="sub">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

/* ---------------- callouts ---------------- */

type CalloutKind = 'intuition' | 'definition' | 'warning' | 'note' | 'example' | 'key' | 'theorem';
const calloutLabel: Record<CalloutKind, string> = {
  intuition: 'Intuition',
  definition: 'Definition',
  warning: 'Common misconception',
  note: 'Note',
  example: 'Worked example',
  key: 'Central idea',
  theorem: 'Result',
};
const calloutIcon: Record<CalloutKind, string> = {
  intuition: '◐',
  definition: '≝',
  warning: '!',
  note: 'i',
  example: '✎',
  key: '★',
  theorem: '∴',
};

export function Callout({ kind, title, children }: { kind: CalloutKind; title?: string; children: ReactNode }) {
  return (
    <aside className={`callout callout-${kind}`}>
      <div className="callout-head">
        <span className="callout-icon" aria-hidden>
          {calloutIcon[kind]}
        </span>
        <span className="callout-kind">{calloutLabel[kind]}</span>
        {title && <span className="callout-title">{title}</span>}
      </div>
      <div className="callout-body">{children}</div>
    </aside>
  );
}

/** "Try this" prompts that turn a lab into a guided experiment. */
export function TryThis({ items }: { items: ReactNode[] }) {
  return (
    <div className="trythis">
      <div className="trythis-head">Try this</div>
      <ol>
        {items.map((it, i) => (
          <li key={i}>{it}</li>
        ))}
      </ol>
    </div>
  );
}

/* ---------------- reveal / steps ---------------- */

export function Reveal({
  label = 'Show answer',
  hideLabel = 'Hide',
  children,
  kind = 'answer',
}: {
  label?: string;
  hideLabel?: string;
  children: ReactNode;
  kind?: 'answer' | 'hint';
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`reveal reveal-${kind} ${open ? 'open' : ''}`}>
      <button className="btn btn-ghost reveal-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="chev">{open ? '▾' : '▸'}</span> {open ? hideLabel : label}
      </button>
      {open && <div className="reveal-body">{children}</div>}
    </div>
  );
}

export interface Step {
  /** what we do in this step, shown as the step heading */
  title: ReactNode;
  body: ReactNode;
}

/** A derivation you advance one step at a time, so you can predict the next line first. */
export function Steps({ steps, intro }: { steps: Step[]; intro?: ReactNode }) {
  const [shown, setShown] = useState(1);
  return (
    <div className="steps">
      {intro && <div className="steps-intro">{intro}</div>}
      <ol className="steps-list">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="step">
            <div className="step-num">{i + 1}</div>
            <div className="step-content">
              <div className="step-title">{s.title}</div>
              <div className="step-body">{s.body}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="steps-ctrl">
        {shown < steps.length ? (
          <>
            <button className="btn btn-primary" onClick={() => setShown((n) => n + 1)}>
              Next step ({shown}/{steps.length})
            </button>
            <span className="steps-tip">Predict the next line before you click.</span>
            <button className="btn btn-ghost" onClick={() => setShown(steps.length)}>
              Show all
            </button>
          </>
        ) : (
          <button className="btn btn-ghost" onClick={() => setShown(1)}>
            Collapse to first step
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------------- controls ---------------- */

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
}: {
  label: ReactNode;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const id = useId();
  return (
    <div className="slider">
      <label htmlFor={id}>
        <span className="slider-label">{label}</span>
        <span className="slider-val">{format ? format(value) : value}</span>
      </label>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          className={o.value === value ? 'on' : ''}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="toggle-track" aria-hidden>
        <span className="toggle-thumb" />
      </span>
      <span>{label}</span>
    </label>
  );
}

/** A framed interactive with a title, a short purpose, and the widget. */
export function Lab({ title, purpose, children, wide = true }: { title: string; purpose?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <div className={`lab ${wide ? 'wide' : ''}`}>
      <div className="lab-head">
        <span className="lab-badge">Interactive</span>
        <span className="lab-title">{title}</span>
      </div>
      {purpose && <p className="lab-purpose">{purpose}</p>}
      <div className="lab-body">{children}</div>
    </div>
  );
}

export function Readout({ items }: { items: { label: ReactNode; value: ReactNode; tone?: string }[] }) {
  return (
    <div className="readout">
      {items.map((it, i) => (
        <div key={i} className={`readout-item ${it.tone ?? ''}`}>
          <div className="readout-label">{it.label}</div>
          <div className="readout-value">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

export function Figure({ children, caption, wide }: { children: ReactNode; caption?: ReactNode; wide?: boolean }) {
  return (
    <figure className={`fig ${wide ? 'wide' : ''}`}>
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/* ---------------- quizzes & checklists ---------------- */

export interface QuizOption {
  text: ReactNode;
  correct?: boolean;
  why: ReactNode;
}

/** A multiple-choice check. The chosen answer is remembered between visits. */
export function Quiz({ id, q, options }: { id: string; q: ReactNode; options: QuizOption[] }) {
  const [picked, setPickedRaw] = useStored<number | null>(`quiz.${id}`, null);
  const [, setResult] = useStored<boolean | null>(`quizres.${id}`, null);
  const correctIdx = options.findIndex((o) => o.correct);
  const setPicked = (i: number | null) => {
    setPickedRaw(i);
    setResult(i === null ? null : i === correctIdx);
  };
  const done = picked !== null;
  return (
    <div className={`quiz ${done ? (options[picked!]?.correct ? 'right' : 'wrong') : ''}`}>
      <div className="quiz-q">
        <span className="quiz-tag">Check</span>
        <div>{q}</div>
      </div>
      <div className="quiz-opts">
        {options.map((o, i) => {
          const state = !done ? '' : i === correctIdx ? 'is-correct' : i === picked ? 'is-picked' : 'is-dim';
          return (
            <button key={i} className={`quiz-opt ${state}`} onClick={() => !done && setPicked(i)} disabled={done}>
              <span className="quiz-letter">{String.fromCharCode(65 + i)}</span>
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
      {done && (
        <div className="quiz-feedback">
          <p>
            <strong>{options[picked!].correct ? 'Correct.' : 'Not quite.'}</strong> {options[picked!].why}
          </p>
          {!options[picked!].correct && correctIdx >= 0 && (
            <p>
              <strong>{String.fromCharCode(65 + correctIdx)} is right:</strong> {options[correctIdx].why}
            </p>
          )}
          <button className="btn btn-ghost" onClick={() => setPicked(null)}>
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

/** "Can you do this without looking?" items, stored per lesson. */
export function Checklist({ id, items }: { id: string; items: ReactNode[] }) {
  const [ticks, setTicks] = useStored<boolean[]>(`check.${id}`, []);
  const n = items.filter((_, i) => ticks[i]).length;
  return (
    <div className="checklist">
      <div className="checklist-head">
        <span>Can you do these without looking?</span>
        <span className="checklist-count">
          {n}/{items.length}
        </span>
      </div>
      <ul>
        {items.map((it, i) => (
          <li key={i}>
            <label>
              <input
                type="checkbox"
                checked={!!ticks[i]}
                onChange={(e) =>
                  setTicks((prev) => {
                    const next = [...prev];
                    next[i] = e.target.checked;
                    return next;
                  })
                }
              />
              <span>{it}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Table({ head, rows, className }: { head: ReactNode[]; rows: ReactNode[][]; className?: string }) {
  return (
    <div className={`table-wrap ${className ?? ''}`}>
      <table>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
