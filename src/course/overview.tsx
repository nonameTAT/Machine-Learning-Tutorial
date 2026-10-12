import { useState } from 'react';
import { Callout, Sec } from '../components/ui';
import { clearAllStored, readStored, useStored } from '../lib/storage';
import { useWeek, useWeeks } from './context';

// Building blocks for a week's overview page. The shell always puts <WeekHero /> above the
// week's own `overview` component and <YourData /> below it; the overview places the rest.

/** The overview page: heading, the week's own overview body (or just the study route), and the reset button. */
export function OverviewPage() {
  const Body = useWeek().def.overview ?? StudyRoute;
  return (
    <>
      <WeekHero />
      <Body />
      <YourData />
    </>
  );
}

/** Week title, summary, and continue / next-unfinished buttons. */
export function WeekHero() {
  const week = useWeek();
  const [done] = useStored<Record<string, boolean>>('done', {});
  // Read once, on arrival: the shell then records this overview itself as the week's last page.
  const [lastByWeek] = useState(() => readStored<Record<string, string>>('lastByWeek', {}));
  const lessons = week.lessons;
  const n = lessons.filter((l) => done[l.id]).length;
  const resume = week.pages.find((p) => p.id === lastByWeek[week.n] && p.id !== week.home);
  const firstTodo = lessons.find((l) => !done[l.id]);

  return (
    <div className="hero">
      <div className="hero-kicker">Machine Learning · Interactive study guide</div>
      <h1>
        Week {week.n}: {week.title}
      </h1>
      <p className="hero-sub">{week.summary}</p>
      <div className="btn-row">
        {resume ? (
          <a className="btn btn-primary" href={`#/${resume.id}`}>
            Continue: {resume.num && `${resume.num}. `}
            {resume.title} →
          </a>
        ) : (
          lessons[0] && (
            <a className="btn btn-primary" href={`#/${lessons[0].id}`}>
              Start with lesson 1 →
            </a>
          )
        )}
        {firstTodo && firstTodo.id !== resume?.id && (
          <a className="btn" href={`#/${firstTodo.id}`}>
            Next unfinished: {firstTodo.num}. {firstTodo.title}
          </a>
        )}
        <span className="kbd-hint">
          {n}/{lessons.length} lessons marked as understood
        </span>
      </div>
    </div>
  );
}

/** One card per lesson, then the practice and readiness pages. */
export function StudyRoute() {
  const week = useWeek();
  const [done] = useStored<Record<string, boolean>>('done', {});
  const practice = week.def.practice;
  return (
    <Sec title="The study route">
      <div className="cards">
        {week.lessons.map((l) => (
          <a key={l.id} href={`#/${l.id}`} className={`card ${done[l.id] ? 'done' : ''}`}>
            <span className="card-num">
              <span>Lesson {l.num}</span>
              {done[l.id] && <span className="ok">✓ understood</span>}
            </span>
            <span className="card-title">{l.title}</span>
            <span className="card-q">{l.question}</span>
          </a>
        ))}
        {practice && (
          <a href={`#/${week.route('practice')}`} className="card">
            <span className="card-num">Consolidate</span>
            <span className="card-title">Practice problems</span>
            <span className="card-q">{practice.blurb}</span>
          </a>
        )}
        <a href={`#/${week.route('readiness')}`} className="card">
          <span className="card-num">Consolidate</span>
          <span className="card-title">Readiness check</span>
          <span className="card-q">See, lesson by lesson, which checks and self-assessments you have not yet passed.</span>
        </a>
      </div>
    </Sec>
  );
}

/** Links to the weeks after this one, each with its summary. */
export function LaterWeeks() {
  const week = useWeek();
  const later = useWeeks().filter((w) => w.n > week.n);
  if (later.length === 0) return null;
  return (
    <Callout kind="note" title="Later weeks">
      {later.map((w) => (
        <span key={w.n}>
          <a href={`#/${w.home}`}>
            Week {w.n} — {w.title}
          </a>
          : {w.summary}{' '}
        </span>
      ))}
      You can switch weeks at any time with the buttons in the top bar.
    </Callout>
  );
}

export function YourData() {
  return (
    <Sec title="Your data">
      <p className="small">
        Progress, quiz answers, checklists and notes (for every week) are stored only in this browser’s localStorage. Nothing is sent anywhere.
        Clearing site data, or using a private window, starts fresh.
      </p>
      <button
        className="btn"
        onClick={() => {
          if (window.confirm('Erase all progress, quiz answers, checklists and notes stored by this guide, for every week?')) clearAllStored();
        }}
      >
        Reset all progress
      </button>
    </Sec>
  );
}
