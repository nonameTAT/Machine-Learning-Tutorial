import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Checklist } from './components/ui';
import { PageContext, WeeksContext } from './course/context';
import { DEFAULT_ROUTE, PAGES, WEEKS } from './course/registry';
import type { Page, Week } from './course/types';
import { useStored } from './lib/storage';
import { THEMES, useThemeController, type ThemeId, type ThemePref } from './lib/theme';

function useHashRoute(): [string, (id: string) => void] {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '').split('#')[0];
    return PAGES.has(h) ? h : DEFAULT_ROUTE;
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
  const meta = PAGES.get(route)!;
  const week = meta.week;

  useEffect(() => {
    setLast((prev) => ({ ...prev, [week.n]: route }));
    setNavOpen(false);
    window.scrollTo({ top: 0 });
    const site = `ML study guide · Week ${week.n}`;
    document.title = meta.kind === 'lesson' ? `${meta.num}. ${meta.title} · ${site}` : `${meta.title} · ${site}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

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
        <span className="topbar-page" aria-hidden>
          {meta.kind === 'lesson' && <b>{meta.num}</b>}
          {meta.title}
        </span>
        <div className="topbar-right">
          <WeekSwitch current={week.n} />
          <ThemeMenu pref={theme.pref} resolved={theme.resolved} setPref={theme.setPref} />
        </div>
        <ReadingProgress route={route} />
      </header>

      <Sidebar route={route} week={week} />
      <div className="scrim" onClick={() => setNavOpen(false)} />

      <main ref={mainRef} className="main" key={route}>
        <div className="content">
          <WeeksContext.Provider value={WEEKS}>
            <PageContext.Provider value={meta}>
              {meta.kind !== 'overview' && <LessonHeader meta={meta} />}
              <meta.Component />
              {meta.kind !== 'overview' && <LessonFooter meta={meta} go={go} />}
            </PageContext.Provider>
          </WeeksContext.Provider>
        </div>
        <Outline route={route} mainRef={mainRef} />
      </main>
      {meta.kind !== 'overview' && <MobilePager meta={meta} go={go} />}
    </div>
  );
}

function ThemeSwatch({ id }: { id: ThemeId }) {
  return (
    <span className="theme-swatch" data-theme={id} aria-hidden>
      <i />
      <i />
    </span>
  );
}

function ThemeMenu({ pref, resolved, setPref }: { pref: ThemePref; resolved: ThemeId; setPref: (p: ThemePref) => void }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const opts: { id: ThemePref; label: string }[] = [{ id: 'system', label: 'System' }, ...THEMES];
  const label = `Colour theme: ${opts.find((o) => o.id === pref)?.label}`;

  useEffect(() => {
    if (!open) return;
    wrap.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, [open]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('button')];
    const i = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length].focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
      toggle.current?.focus();
    }
  };

  return (
    <div className="theme-menu" ref={wrap}>
      <button ref={toggle} className="theme-toggle" aria-haspopup="menu" aria-expanded={open} aria-label={label} title={label} onClick={() => setOpen((o) => !o)}>
        <ThemeSwatch id={resolved} />
      </button>
      {open && (
        <div className="theme-list" role="menu" aria-label="Colour theme" onKeyDown={onKey}>
          {opts.map((o) => (
            <button
              key={o.id}
              role="menuitemradio"
              aria-checked={pref === o.id}
              className={pref === o.id ? 'on' : ''}
              onClick={() => {
                setPref(o.id);
                setOpen(false);
                toggle.current?.focus();
              }}
            >
              {o.id === 'system' ? <span className="theme-swatch">◐</span> : <ThemeSwatch id={o.id} />}
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Switching weeks resumes the page you last visited in that week. */
function WeekSwitch({ current }: { current: number }) {
  const [last] = useStored<Record<string, string>>('lastByWeek', {});
  return (
    <nav className="week-switch" aria-label="Week">
      {WEEKS.map((w) => {
        const target = last[w.n] && PAGES.get(last[w.n])?.week === w ? last[w.n] : w.home;
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

function Sidebar({ route, week }: { route: string; week: Week }) {
  const [done] = useStored<Record<string, boolean>>('done', {});
  const { lessons, pages } = week;
  const n = lessons.filter((l) => done[l.id]).length;
  const current = PAGES.get(route)?.part;
  // a part is open if it holds the current page, unless the reader toggled it; toggles reset per week
  const [toggled, setToggled] = useState<{ week: number; parts: Set<string> }>({ week: week.n, parts: new Set() });
  const flipped = toggled.week === week.n ? toggled.parts : new Set<string>();
  const fixed = (p: string) => p === week.parts[0] || p === week.parts[week.parts.length - 1];
  const isOpen = (p: string) => fixed(p) || (p === current) !== flipped.has(p);
  const toggle = (p: string) => {
    const next = new Set(flipped);
    if (next.has(p)) next.delete(p);
    else next.add(p);
    setToggled({ week: week.n, parts: next });
  };
  return (
    <nav className="sidebar" aria-label="Lessons">
      <div className="side-weeks">
        <WeekSwitch current={week.n} />
      </div>
      <div className="side-head">
        <div className="side-week">Week {week.n}</div>
        <div className="side-title">{week.title}</div>
        <div className="progress-bar" role="progressbar" aria-valuenow={n} aria-valuemin={0} aria-valuemax={lessons.length} aria-label="Lessons understood">
          <div style={{ width: `${lessons.length ? (100 * n) / lessons.length : 0}%` }} />
        </div>
        <div className="progress-text">
          {n} of {lessons.length} lessons understood
        </div>
      </div>
      {week.parts.map((p) => {
        const items = pages.filter((l) => l.part === p);
        const ls = items.filter((l) => l.kind === 'lesson');
        const d = ls.filter((l) => done[l.id]).length;
        const open = isOpen(p);
        return (
          <div key={p} className={`nav-part ${open ? 'open' : ''} ${p === current ? 'current' : ''}`}>
            {fixed(p) ? (
              <div className="nav-part-title">{p}</div>
            ) : (
              <button className="nav-part-title" aria-expanded={open} onClick={() => toggle(p)}>
                <span className="chev" aria-hidden>
                  ▸
                </span>
                <span className="nav-part-name">{p}</span>
                <span className={`nav-part-count ${d === ls.length ? 'all' : ''}`}>
                  {d}/{ls.length}
                </span>
              </button>
            )}
            {open &&
              items.map((l) => (
                <a
                  key={l.id}
                  href={`#/${l.id}`}
                  title={l.title}
                  aria-current={route === l.id ? 'page' : undefined}
                  className={`nav-item ${route === l.id ? 'active' : ''} ${done[l.id] ? 'done' : ''}`}
                >
                  <span className="nav-num">{done[l.id] ? '✓' : l.num || '·'}</span>
                  <span className="nav-title">{l.title}</span>
                </a>
              ))}
          </div>
        );
      })}
      <div className="nav-foot">Progress, notes and answers are saved in this browser only (localStorage).</div>
    </nav>
  );
}

const plural = (k: number, one: string) => `${k} ${one}${k === 1 ? '' : 's'}`;

function LessonHeader({ meta }: { meta: Page }) {
  const [done] = useStored<Record<string, boolean>>('done', {});
  const st = meta.stats;
  const goals = meta.checks.slice(0, 3);
  return (
    <header className="lesson-head">
      <div className="lesson-kicker">
        {meta.part}
        {meta.kind === 'lesson' && (
          <span className="chip">
            Lesson {meta.num} of {meta.week.lessons.length}
          </span>
        )}
      </div>
      <h1>
        {meta.kind === 'lesson' && <span className="lesson-num">{meta.num}</span>}
        {meta.title}
      </h1>
      <p className="lesson-question">{meta.question}</p>
      {meta.kind === 'lesson' && st && (
        <div className="lesson-meta">
          <span>
            <i aria-hidden>◷</i> ≈ {st.minutes} min
          </span>
          {st.labs > 0 && (
            <span>
              <i aria-hidden>◈</i> {plural(st.labs, 'lab')}
            </span>
          )}
          {st.derivations > 0 && (
            <span>
              <i aria-hidden>∑</i> {plural(st.derivations, 'derivation')}
            </span>
          )}
          {st.quizzes > 0 && (
            <span>
              <i aria-hidden>?</i> {plural(st.quizzes, 'check')}
            </span>
          )}
          {done[meta.id] && <span className="is-done">✓ understood</span>}
        </div>
      )}
      {goals.length > 0 && (
        <div className="lesson-goals">
          <div className="goals-title">After this lesson you can</div>
          <ul>
            {goals.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
          {meta.checks.length > goals.length && (
            <a
              className="goals-more"
              href={`#/${meta.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('before-you-move-on')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              + {meta.checks.length - goals.length} more in the end-of-lesson check
            </a>
          )}
        </div>
      )}
    </header>
  );
}

/** The previous and next page; the last page of a week leads on to the next week's overview. */
function neighbours(meta: Page) {
  const pages = meta.week.pages;
  const i = pages.indexOf(meta);
  const nextWeek = WEEKS[WEEKS.indexOf(meta.week) + 1];
  return {
    prev: pages[i - 1] as { id: string; title: string } | undefined,
    next: (pages[i + 1] ?? (nextWeek && { id: nextWeek.home, title: `Week ${nextWeek.n}: ${nextWeek.title}` })) as { id: string; title: string } | undefined,
  };
}

function LessonFooter({ meta, go }: { meta: Page; go: (id: string) => void }) {
  const [done, setDone] = useStored<Record<string, boolean>>('done', {});
  const [notes, setNotes] = useStored<string>(`notes.${meta.id}`, '');
  const { prev, next } = neighbours(meta);
  return (
    <footer className="lesson-foot">
      {meta.kind === 'lesson' && (
        <section className={`lesson-end ${done[meta.id] ? 'is-done' : ''}`}>
          <h2 id="before-you-move-on">Before you move on</h2>
          {meta.checks.length > 0 && <Checklist id={meta.id} items={meta.checks} />}
          <button className={`btn complete-btn ${done[meta.id] ? 'is-done' : 'btn-primary'}`} onClick={() => setDone({ ...done, [meta.id]: !done[meta.id] })}>
            {done[meta.id] ? '✓ Marked as understood — click to undo' : 'Mark this lesson as understood'}
          </button>
        </section>
      )}
      <details className="notes" open={notes.length > 0}>
        <summary>My notes for this page {notes.length > 0 && <span className="muted">· saved</span>}</summary>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write the central idea in your own words, questions for your tutor, mistakes you made…"
          rows={6}
        />
      </details>
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

/** Phones: previous / next always within reach at the bottom of the screen. */
function MobilePager({ meta, go }: { meta: Page; go: (id: string) => void }) {
  const { prev, next } = neighbours(meta);
  const pos = meta.week.pages.indexOf(meta) + 1;
  return (
    <nav className="mobile-pager" aria-label="Previous and next page">
      <button className="btn btn-ghost" disabled={!prev} onClick={() => prev && go(prev.id)} aria-label={prev ? `Previous: ${prev.title}` : 'No previous page'}>
        ←
      </button>
      <span className="mobile-pager-pos">
        {pos} / {meta.week.pages.length}
      </span>
      <button className="btn btn-primary" disabled={!next} onClick={() => next && go(next.id)} aria-label={next ? `Next: ${next.title}` : 'No next page'}>
        Next →
      </button>
    </nav>
  );
}

/** A thin bar under the top bar showing how far down the page you are. */
function ReadingProgress({ route }: { route: string }) {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? Math.min(1, h.scrollTop / max) : 0})`;
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      cancelAnimationFrame(raf);
    };
  }, [route]);
  return <div ref={bar} className="read-progress" aria-hidden />;
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
