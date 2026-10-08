import type { ReactNode } from 'react';
import { Checklist, Sec } from './ui';
import type { PStatus } from './ProblemSet';
import { listStoredKeys, readStored, useStorageTick, useStored } from '../lib/storage';
import { weekLessons } from '../lessons/registry';

export interface ReadinessProps {
  week: number;
  /** lesson id → "can you do these without looking?" items */
  checks: Record<string, string[]>;
  /** lesson id → prefix of that lesson's quiz ids, e.g. "l3." */
  quizPrefix: Record<string, string>;
  problems: string[];
  practiceKey: string;
  practiceRoute: string;
  /** storage id and items of the whole-week checklist */
  weekCheckId: string;
  weekItems: string[];
  weekNote?: ReactNode;
}

/** Lesson-by-lesson summary of self-checks, quiz answers and practice ratings for one week. */
export function ReadinessReport({ week, checks, quizPrefix, problems, practiceKey, practiceRoute, weekCheckId, weekItems, weekNote }: ReadinessProps) {
  useStorageTick();
  const [done] = useStored<Record<string, boolean>>('done', {});
  const [practice] = useStored<Record<string, PStatus>>(practiceKey, {});
  const quizKeys = listStoredKeys('quizres.');

  const rows = weekLessons(week).map((l) => {
    const ticks = readStored<boolean[]>(`check.${l.id}`, []);
    const items = checks[l.id] ?? [];
    const ticked = items.filter((_, i) => ticks[i]).length;
    const qk = quizKeys.filter((k) => k.startsWith(`quizres.${quizPrefix[l.id]}`));
    const answered = qk.filter((k) => readStored<boolean | null>(k, null) !== null).length;
    const right = qk.filter((k) => readStored<boolean | null>(k, null) === true).length;
    const gaps = items.filter((_, i) => !ticks[i]);
    return { l, ticked, total: items.length, answered, right, gaps };
  });

  const solid = problems.filter((id) => practice[id] === 'solid').length;
  const shaky = problems.filter((id) => practice[id] === 'shaky');

  return (
    <>
      <Sec title="Lesson by lesson">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Lesson</th>
                <th>Understood</th>
                <th>Self-check</th>
                <th>Quiz (first try right / answered)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.l.id}>
                  <td>
                    <a href={`#/${r.l.id}`}>
                      {r.l.num}. {r.l.title}
                    </a>
                  </td>
                  <td style={{ color: done[r.l.id] ? 'var(--c-good)' : 'var(--muted)' }}>{done[r.l.id] ? '✓' : '—'}</td>
                  <td style={{ color: r.ticked === r.total ? 'var(--c-good)' : undefined }}>
                    {r.ticked}/{r.total}
                  </td>
                  <td>
                    {r.right}/{r.answered}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          Quiz results record your current answer for each question (use “Try again” to reset one). Self-check counts come from the list at the end of
          each lesson.
        </p>
      </Sec>

      <Sec title="Your gaps">
        {rows.every((r) => r.gaps.length === 0) ? (
          <p>Every self-check item is ticked. Now try the practice problems without notes.</p>
        ) : (
          rows
            .filter((r) => r.gaps.length > 0)
            .map((r) => (
              <div key={r.l.id} className="gap-block">
                <a href={`#/${r.l.id}`} className="gap-title">
                  {r.l.num}. {r.l.title}
                </a>
                <ul>
                  {r.gaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </Sec>

      <Sec title="Practice problems">
        <p>
          {solid}/{problems.length} rated solid.{' '}
          {shaky.length > 0 && (
            <>
              Shaky: {shaky.map((id, i) => (
                <span key={id}>
                  {i > 0 && ', '}
                  <a href={`#/${practiceRoute}`}>{id}</a>
                </span>
              ))}
              .
            </>
          )}
        </p>
      </Sec>

      <Sec title="The whole week, without looking">
        <Checklist id={weekCheckId} items={weekItems} />
        {weekNote}
      </Sec>
    </>
  );
}
