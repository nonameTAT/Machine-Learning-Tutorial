import { WEEK_DEFS } from '../content';
import { OverviewPage } from './overview';
import { PracticePage } from './PracticePage';
import { ReadinessPage } from './ReadinessPage';
import type { Page, Week, WeekDef } from './types';

const START = 'Start here';
const END = 'Consolidate';

const join = (prefix: string, sep: string, s: string) => (prefix ? `${prefix}${sep}${s}` : s);

/** Expand a week's definition into its pages, in study order. */
function buildWeek(def: WeekDef): Week {
  const prefix = def.prefix ?? `w${def.n}`;
  const route = (slug: string) => join(prefix, '-', slug);
  const week: Week = {
    n: def.n,
    title: def.title,
    summary: def.summary,
    prefix,
    home: route('home'),
    parts: [START, ...def.parts.map((p) => p.title), END],
    pages: [],
    lessons: [],
    def,
    route,
    key: (name) => join(prefix, '.', name),
  };
  const add = (p: Omit<Page, 'week' | 'checks'> & { checks?: string[] }) => week.pages.push({ checks: [], ...p, week });

  add({ id: week.home, kind: 'overview', part: START, num: '', title: 'Overview & study route', question: 'How should I study this week?', Component: OverviewPage });
  let n = 0;
  for (const part of def.parts) {
    for (const l of part.lessons) {
      n += 1;
      add({ id: route(l.slug), kind: 'lesson', part: part.title, num: String(n), title: l.title, question: l.question, checks: l.checks, Component: l.page });
    }
  }
  if (def.practice) {
    add({ id: route('practice'), kind: 'practice', part: END, num: 'P', title: 'Practice problems', question: 'Can I reproduce the reasoning on my own?', Component: PracticePage });
  }
  if (def.reference) {
    add({ id: route('reference'), kind: 'reference', part: END, num: 'R', title: 'Reference sheet', question: 'Every formula on one page, with its conditions.', Component: def.reference });
  }
  add({ id: route('readiness'), kind: 'readiness', part: END, num: '✓', title: 'Readiness check', question: 'Where are my gaps?', Component: ReadinessPage });

  week.lessons = week.pages.filter((p) => p.kind === 'lesson');
  return week;
}

export const WEEKS: Week[] = WEEK_DEFS.map(buildWeek);

/** Route id → page, across every week. */
export const PAGES = new Map<string, Page>();
for (const w of WEEKS) {
  if (WEEKS.some((o) => o !== w && o.n === w.n)) throw new Error(`Two weeks are numbered ${w.n}.`);
  for (const p of w.pages) {
    const clash = PAGES.get(p.id);
    if (clash) {
      throw new Error(
        `Route "${p.id}" is used twice (week ${clash.week.n} and week ${w.n}). Lesson slugs must be unique within a week, ` +
          `must not be home/practice/reference/readiness, and week prefixes must differ.`,
      );
    }
    PAGES.set(p.id, p);
  }
}
if (WEEKS.length === 0) throw new Error('No weeks found: expected src/content/week<N>/index.ts.');

/** Where an unknown or empty route lands. */
export const DEFAULT_ROUTE = WEEKS[0].home;
