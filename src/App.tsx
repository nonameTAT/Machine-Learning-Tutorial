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
        <div className="topbar-right">
          <WeekSwitch current={week.n} />
          <ThemeMenu pref={theme.pref} resolved={theme.resolved} setPref={theme.setPref} />
        </div>
      </header>

      <Sidebar route={route} week={week} />
      <div className="scrim" onClick={() => setNavOpen(false)} />

      <main ref={mainRef} className="main" key={route}>
        <div className="content">
          <WeeksContext.Provider value={WEEKS}>
            <PageContext.Provider value={meta}>
              {meta.kind !== 'overview' && <LessonHeader meta={meta} />}
              <meta.Component />
              {meta.checks.length > 0 && <Checklist id={meta.id} items={meta.checks} />}
              {meta.kind !== 'overview' && <LessonFooter meta={meta} go={go} />}
            </PageContext.Provider>
          </WeeksContext.Provider>
        </div>
        <Outline route={route} mainRef={mainRef} />
      </main>
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
          <div style={{ width: `${lessons.length ? (100 * n) / lessons.length : 0}%` }} />
        </div>
      </div>
      {week.parts.map((p) => (
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

function LessonHeader({ meta }: { meta: Page }) {
  return (
    <header className="lesson-head">
      <div className="lesson-kicker">
        {meta.part}
      </div>
      <h1>
        {meta.kind === 'lesson' && <span className="lesson-num">{meta.num}</span>}
        {meta.title}
      </h1>
      <p className="lesson-question">{meta.question}</p>
    </header>
  );
}

function LessonFooter({ meta, go }: { meta: Page; go: (id: string) => void }) {
  const [done, setDone] = useStored<Record<string, boolean>>('done', {});
  const [notes, setNotes] = useStored<string>(`notes.${meta.id}`, '');
  // Page through one week; the last page of a week leads on to the next week's overview.
  const pages = meta.week.pages;
  const i = pages.indexOf(meta);
  const prev = pages[i - 1];
  const nextWeek = WEEKS[WEEKS.indexOf(meta.week) + 1];
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
      {meta.kind === 'lesson' && (
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
