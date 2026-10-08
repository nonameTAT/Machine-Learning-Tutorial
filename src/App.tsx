import { useEffect, useRef, useState } from 'react';
import { LESSONS, WEEKS, lessonIndex, weekLessons, weekMeta, weekPages, type LessonMeta } from './lessons/registry';
import { PAGES } from './lessons/pages';
import { useStored } from './lib/storage';
import { useThemeController, type ThemePref } from './lib/theme';

function useHashRoute(): [string, (id: string) => void] {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '').split('#')[0];
    return LESSONS.some((l) => l.id === h) ? h : 'home';
  };
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => setRoute(parse());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return [route, (id: string) => (window.location.hash = `/${id}`)];
}

export default function App() {
  const [route, go] = useHashRoute();
  const [, setLast] = useStored<Record<string, string>>('lastByWeek', {});
  const [navOpen, setNavOpen] = useState(false);
  const theme = useThemeController();
  const mainRef = useRef<HTMLElement>(null);
  const meta = LESSONS[lessonIndex(route)];
  const week = weekMeta(meta.week);

  useEffect(() => {
    setLast((prev) => ({ ...prev, [meta.week]: route }));
    setNavOpen(false);
    window.scrollTo({ top: 0 });
    const site = `ML study guide · Week ${week.n}`;
    document.title = meta.num && meta.lesson ? `${meta.num}. ${meta.title} · ${site}` : `${meta.title} · ${site}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  const Page = PAGES[route];

  return (
    <div className={`app ${navOpen ? 'nav-open' : ''}`}>
      <header className="topbar">
        <button className="btn btn-ghost nav-toggle" onClick={() => setNavOpen((o) => !o)} aria-label="Toggle navigation">
          ☰
        </button>
        <a className="brand" href={`#/${week.home}`}>
          <span className="brand-mark" aria-hidden>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <rect width="24" height="24" rx="6" className="brand-bg" />
              <path d="M4 18 L20 6" className="brand-line" />
              <circle cx="8" cy="12" r="1.8" className="brand-dot" />
              <circle cx="13" cy="14" r="1.8" className="brand-dot" />
              <circle cx="16.5" cy="7.5" r="1.8" className="brand-dot" />
            </svg>
          </span>
          <span className="brand-text">
            ML study guide{' '}
            <span className="brand-sub">
              Week {week.n} · {week.title}
            </span>
          </span>
        </a>
        <div className="topbar-right">
          <WeekSwitch current={week.n} />
          <ThemeSwitch pref={theme.pref} setPref={theme.setPref} />
        </div>
      </header>

      <Sidebar route={route} week={week.n} />
      <div className="scrim" onClick={() => setNavOpen(false)} />

      <main ref={mainRef} className="main" key={route}>
        <div className="content">
          {meta.id !== week.home && <LessonHeader meta={meta} />}
          <Page />
          {meta.id !== week.home && <LessonFooter meta={meta} go={go} />}
        </div>
        <Outline route={route} mainRef={mainRef} />
      </main>
    </div>
  );
}

function ThemeSwitch({ pref, setPref }: { pref: ThemePref; setPref: (p: ThemePref) => void }) {
  const opts: { v: ThemePref; label: string; icon: string }[] = [
    { v: 'light', label: 'Light', icon: '☀' },
    { v: 'system', label: 'System', icon: '◐' },
    { v: 'dark', label: 'Dark', icon: '☾' },
  ];
  return (
    <div className="theme-switch" role="radiogroup" aria-label="Colour theme">
      {opts.map((o) => (
        <button key={o.v} role="radio" aria-checked={pref === o.v} className={pref === o.v ? 'on' : ''} onClick={() => setPref(o.v)} title={o.label}>
          {o.icon}
        </button>
      ))}
    </div>
  );
}

/** Switching weeks resumes the page you last visited in that week. */
function WeekSwitch({ current }: { current: number }) {
  const [last] = useStored<Record<string, string>>('lastByWeek', {});
  return (
    <nav className="week-switch" aria-label="Week">
      {WEEKS.map((w) => {
        const target = last[w.n] && lessonIndex(last[w.n]) >= 0 ? last[w.n] : w.home;
        return (
          <a key={w.n} href={`#/${w.n === current ? w.home : target}`} className={w.n === current ? 'on' : ''} aria-current={w.n === current ? 'page' : undefined} title={`Week ${w.n} · ${w.title}`}>
            <span className="ws-full">Week {w.n}</span>
            <span className="ws-short">W{w.n}</span>
          </a>
        );
      })}
    </nav>
  );
}

function Sidebar({ route, week }: { route: string; week: number }) {
  const [done] = useStored<Record<string, boolean>>('done', {});
  const lessons = weekLessons(week);
  const pages = weekPages(week);
  const n = lessons.filter((l) => done[l.id]).length;
  return (
    <nav className="sidebar" aria-label="Lessons">
      <div className="progress-box">
        <div className="progress-text">
          <span>Progress</span>
          <span>
            {n}/{lessons.length} lessons
          </span>
        </div>
        <div className="progress-bar">
          <div style={{ width: `${(100 * n) / lessons.length}%` }} />
        </div>
      </div>
      {weekMeta(week).parts.map((p) => (
        <div key={p} className="nav-part">
          <div className="nav-part-title">{p}</div>
          {pages.filter((l) => l.part === p).map((l) => (
            <a key={l.id} href={`#/${l.id}`} className={`nav-item ${route === l.id ? 'active' : ''} ${done[l.id] ? 'done' : ''}`}>
              <span className="nav-num">{done[l.id] ? '✓' : l.num || '·'}</span>
              <span className="nav-title">{l.title}</span>
            </a>
          ))}
        </div>
      ))}
      <div className="nav-foot">Progress, notes and answers are saved in this browser only (localStorage).</div>
    </nav>
  );
}

function LessonHeader({ meta }: { meta: LessonMeta }) {
  return (
    <header className="lesson-head">
      <div className="lesson-kicker">
        {meta.part}
      </div>
      <h1>
        {meta.lesson && <span className="lesson-num">{meta.num}</span>}
        {meta.title}
      </h1>
      <p className="lesson-question">{meta.question}</p>
    </header>
  );
}

function LessonFooter({ meta, go }: { meta: LessonMeta; go: (id: string) => void }) {
  const [done, setDone] = useStored<Record<string, boolean>>('done', {});
  const [notes, setNotes] = useStored<string>(`notes.${meta.id}`, '');
  // Page through one week; the last page of a week leads on to the next week's overview.
  const pages = weekPages(meta.week);
  const i = pages.findIndex((l) => l.id === meta.id);
  const prev = pages[i - 1];
  const nextWeek = WEEKS.find((w) => w.n === meta.week + 1);
  const next = pages[i + 1] ?? (nextWeek && { id: nextWeek.home, title: `Week ${nextWeek.n}: ${nextWeek.title}` });
  return (
    <footer className="lesson-foot">
      <details className="notes" open={notes.length > 0}>
        <summary>My notes for this page {notes.length > 0 && <span className="muted">· saved</span>}</summary>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write the central idea in your own words, questions for your tutor, mistakes you made…"
          rows={6}
        />
      </details>
      {meta.lesson && (
        <button className={`btn complete-btn ${done[meta.id] ? 'is-done' : 'btn-primary'}`} onClick={() => setDone({ ...done, [meta.id]: !done[meta.id] })}>
          {done[meta.id] ? '✓ Marked as understood — click to undo' : 'Mark this lesson as understood'}
        </button>
      )}
      <div className="pager">
        {prev ? (
          <button className="pager-btn" onClick={() => go(prev.id)}>
            <span className="pager-dir">← Previous</span>
            <span className="pager-title">{prev.title}</span>
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button className="pager-btn next" onClick={() => go(next.id)}>
            <span className="pager-dir">Next →</span>
            <span className="pager-title">{next.title}</span>
          </button>
        )}
      </div>
    </footer>
  );
}

/** "On this page" outline built from the rendered h2 headings. */
function Outline({ route, mainRef }: { route: string; mainRef: React.RefObject<HTMLElement | null> }) {
  const [heads, setHeads] = useState<{ id: string; text: string }[]>([]);
  const [active, setActive] = useState('');
  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;
    const collect = () => {
      const hs = Array.from(root.querySelectorAll<HTMLHeadingElement>('.content h2[id]'));
      setHeads(hs.map((h) => ({ id: h.id, text: h.textContent ?? '' })));
      return hs;
    };
    const hs = collect();
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis[0]) setActive(vis[0].target.id);
      },
      { rootMargin: '-60px 0px -70% 0px' },
    );
    hs.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [route, mainRef]);
  if (heads.length < 2) return <aside className="outline" />;
  return (
    <aside className="outline" aria-label="On this page">
      <div className="outline-title">On this page</div>
      {heads.map((h) => (
        <a
          key={h.id}
          href={`#/${route}`}
          className={active === h.id ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            document.getElementById(h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          {h.text}
        </a>
      ))}
    </aside>
  );
}
