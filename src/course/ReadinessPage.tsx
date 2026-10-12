import { Checklist, Sec } from '../components/ui';
import { problemIds, type PStatus } from '../components/ProblemSet';
import { listStoredKeys, readStored, useStorageTick, useStored } from '../lib/storage';
import { useWeek } from './context';

/** Lesson-by-lesson summary of self-checks, quiz answers and practice ratings for the current week. */
export function ReadinessPage() {
  useStorageTick();
  const week = useWeek();
  const { practice, readiness } = week.def;
  const problems = practice ? problemIds(practice.groups) : [];
  const [done] = useStored<Record<string, boolean>>('done', {});
  const [ratings] = useStored<Record<string, PStatus>>(week.key('practice'), {});
  const quizKeys = listStoredKeys('quizres.');

  const rows = week.lessons.map((l) => {
    const ticks = readStored<boolean[]>(`check.${l.id}`, []);
    const items = l.checks;
    const ticked = items.filter((_, i) => ticks[i]).length;
    const qk = quizKeys.filter((k) => k.startsWith(`quizres.${l.id}.`));
    const answered = qk.filter((k) => readStored<boolean | null>(k, null) !== null).length;
    const right = qk.filter((k) => readStored<boolean | null>(k, null) === true).length;
    const gaps = items.filter((_, i) => !ticks[i]);
    return { l, ticked, total: items.length, answered, right, gaps };
  });

  const solid = problems.filter((id) => ratings[id] === 'solid').length;
  const shaky = problems.filter((id) => ratings[id] === 'shaky');

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

      {practice && (
        <Sec title="Practice problems">
          <p>
            {solid}/{problems.length} rated solid.{' '}
            {shaky.length > 0 && (
              <>
                Shaky: {shaky.map((id, i) => (
                  <span key={id}>
                    {i > 0 && ', '}
                    <a href={`#/${week.route('practice')}`}>{id}</a>
                  </span>
                ))}
                .
              </>
            )}
          </p>
        </Sec>
      )}

      {readiness && (
        <Sec title="The whole week, without looking">
          <Checklist id={week.key('week')} items={readiness.items} />
          {readiness.note && <p className="small muted">{readiness.note}</p>}
        </Sec>
      )}
    </>
  );
}
