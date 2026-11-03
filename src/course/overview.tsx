import { useState } from 'react';
import { Sec } from '../components/ui';
import { problemIds } from '../components/ProblemSet';
import { clearAllStored, readStored, useStored } from '../lib/storage';
import { useWeek, useWeeks } from './context';
import type { Page, Week } from './types';

// Building blocks for a week's overview page. The shell always puts <WeekHero /> and <WeekCards />
// above the week's own `overview` component and <YourData /> below it; the overview places the rest.

/** The overview page: heading, every week, the week's own overview body (or just the study route), and the reset button. */
export function OverviewPage() {
  const Body = useWeek().def.overview ?? StudyRoute;
  return (
    <>
      <WeekHero />
      <WeekCards />
      <Body />
      <YourData />
    </>
  );
}

const sum = (pages: Page[], f: (p: Page) => number) => pages.reduce((s, p) => s + f(p), 0);
const hours = (min: number) => (min < 90 ? `${min} min` : `${Math.round(min / 30) / 2} h`);

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

  const labs = sum(lessons, (l) => l.stats?.labs ?? 0);
  const minutes = sum(lessons, (l) => l.stats?.minutes ?? 0);
  const problems = week.def.practice ? problemIds(week.def.practice.groups).length : 0;

  return (
    <div className="hero">
      <div className="hero-kicker">Machine Learning · Interactive study guide</div>
      <h1>
        Week {week.n}: {week.title}
      </h1>
      <p className="hero-sub">{week.summary}</p>
      <dl className="hero-stats">
        <div>
          <dt>lessons</dt>
          <dd>{lessons.length}</dd>
        </div>
        <div>
          <dt>interactive labs</dt>
          <dd>{labs}</dd>
        </div>
        {problems > 0 && (
          <div>
            <dt>practice problems</dt>
            <dd>{problems}</dd>
          </div>
        )}
        <div>
          <dt>study time</dt>
          <dd>≈ {hours(minutes)}</dd>
        </div>
      </dl>
      <div className="hero-progress">
        <div className="progress-bar">
          <div style={{ width: `${lessons.length ? (100 * n) / lessons.length : 0}%` }} />
        </div>
      </div>
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

function LessonCard({ l, done }: { l: Page; done: boolean }) {
  return (
    <a href={`#/${l.id}`} className={`card ${done ? 'done' : ''}`}>
      <span className="card-num">
        <span>Lesson {l.num}</span>
        {done ? <span className="ok">✓ understood</span> : l.stats && <span>≈ {l.stats.minutes} min{l.stats.labs > 0 && ` · ${l.stats.labs} lab${l.stats.labs > 1 ? 's' : ''}`}</span>}
      </span>
      <span className="card-title">{l.title}</span>
      <span className="card-q">{l.question}</span>
    </a>
  );
}

/** The lessons, grouped by part, then the practice and readiness pages. */
export function StudyRoute() {
  const week = useWeek();
  const [done] = useStored<Record<string, boolean>>('done', {});
  const practice = week.def.practice;
  return (
    <Sec title="The study route">
      {week.def.parts.map((part) => {
        const ls = week.lessons.filter((l) => l.part === part.title);
        const d = ls.filter((l) => done[l.id]).length;
        return (
          <div key={part.title} className="route-part">
            <div className="route-part-head">
              <span>{part.title}</span>
              <span className={`route-part-count ${d === ls.length ? 'all' : ''}`}>
                {d}/{ls.length}
              </span>
            </div>
            <div className="cards">
              {ls.map((l) => (
                <LessonCard key={l.id} l={l} done={!!done[l.id]} />
              ))}
            </div>
          </div>
        );
      })}
      <div className="route-part">
        <div className="route-part-head">
          <span>Consolidate</span>
        </div>
        <div className="cards">
          {practice && (
            <a href={`#/${week.route('practice')}`} className="card card-consolidate">
              <span className="card-num">Practice</span>
              <span className="card-title">Practice problems</span>
              <span className="card-q">{practice.blurb}</span>
            </a>
          )}
          <a href={`#/${week.route('readiness')}`} className="card card-consolidate">
            <span className="card-num">Self-assessment</span>
            <span className="card-title">Readiness check</span>
            <span className="card-q">See, lesson by lesson, which checks and self-assessments you have not yet passed.</span>
          </a>
        </div>
      </div>
    </Sec>
  );
}

/** Every week as a card with its progress; the current week is highlighted. */
export function WeekCards() {
  const week = useWeek();
  const weeks = useWeeks();
  const [done] = useStored<Record<string, boolean>>('done', {});
  const [last] = useStored<Record<string, string>>('lastByWeek', {});
  if (weeks.length < 2) return null;
  const progress = (w: Week) => w.lessons.filter((l) => done[l.id]).length;
  return (
    <nav className="week-cards" aria-label="All weeks">
      {weeks.map((w) => {
        const d = progress(w);
        const here = w.n === week.n;
        const resume = last[w.n] && w.pages.some((p) => p.id === last[w.n]) && last[w.n] !== w.home ? last[w.n] : null;
        return (
          <a key={w.n} href={`#/${here || !resume ? w.home : resume}`} className={`week-card ${here ? 'here' : ''}`} aria-current={here ? 'page' : undefined}>
            <span className="week-card-n">Week {w.n}</span>
            <span className="week-card-title">{w.title}</span>
            <span className="progress-bar">
              <span style={{ width: `${w.lessons.length ? (100 * d) / w.lessons.length : 0}%` }} />
            </span>
            <span className="week-card-foot">
              {d}/{w.lessons.length} lessons
              {!here && <span className="week-card-go">{resume ? 'Continue →' : d > 0 ? 'Open →' : 'Start →'}</span>}
            </span>
          </a>
        );
      })}
    </nav>
  );
}

const ARC: [string, string][] = [
  ['Why', 'why the idea is needed'],
  ['Picture', 'an intuition or picture'],
  ['Statement', 'the precise statement'],
  ['Derivation', 'step by step: predict each line first'],
  ['Experiment', 'a lab you run yourself'],
  ['Checks', 'questions on typical mistakes'],
  ['Central idea', 'the lesson in a few lines'],
];

/** The order every lesson follows, as a row of steps. */
export function LearningArc() {
  return (
    <ol className="arc" aria-label="How each lesson is built">
      {ARC.map(([t, d], i) => (
        <li key={t}>
          <span className="arc-n">{i + 1}</span>
          <span className="arc-t">{t}</span>
          <span className="arc-d">{d}</span>
        </li>
      ))}
    </ol>
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
