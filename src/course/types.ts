import type { ComponentType, ReactNode } from 'react';
import type { ProblemGroup } from '../components/ProblemSet';

// What a week's index.ts describes. The shell builds routes, the sidebar, the overview
// cards, the pager, end-of-lesson checklists and the readiness page from this alone.

/** One module of a week: a page of text, pictures and interactive labs. */
export interface LessonDef {
  /** URL slug, unique within the week. The route is `#/<prefix>-<slug>` (week 1: `#/<slug>`). Never rename a published slug: progress is stored under it. */
  slug: string;
  title: string;
  /** The one question this lesson answers, shown under the title and on the overview card. */
  question: string;
  /** The lesson body. The header, checklist, notes and pager are added around it. */
  page: ComponentType;
  /** “Can you do these without looking?” items, shown at the end of the lesson and on the readiness page. */
  checks?: string[];
}

export interface PartDef {
  /** e.g. 'II · Logistic regression' */
  title: string;
  lessons: LessonDef[];
}

export interface PracticeDef {
  /** One line for the overview card. */
  blurb: string;
  groups: ProblemGroup[];
  /** Shown after the problems, e.g. a list of common mistakes. */
  footer?: ReactNode;
}

export interface ReadinessDef {
  /** Whole-week “without looking” checklist at the end of the readiness page. */
  items: string[];
  /** One short paragraph under that checklist. */
  note?: string;
}

export interface WeekDef {
  /** Week number: sets the order of the week switch and “Week n” labels. */
  n: number;
  title: string;
  /** One sentence under the overview heading, also used where other weeks link to this one. */
  summary: string;
  /** Route and storage prefix. Defaults to `w<n>`, giving routes like `#/w4-perceptron`. */
  prefix?: string;
  /** Body of the overview page, between the heading and “Your data”. Defaults to the study route. */
  overview?: ComponentType;
  parts: PartDef[];
  practice?: PracticeDef;
  /** A printable formula sheet. */
  reference?: ComponentType;
  readiness?: ReadinessDef;
}

/** Identity function that gives a week's index.ts type checking and editor completion. */
export const defineWeek = (week: WeekDef) => week;

/* ---------------- what the registry builds ---------------- */

export type PageKind = 'overview' | 'lesson' | 'practice' | 'reference' | 'readiness';

/** A routable page. */
export interface Page {
  /** route id: `#/<id>` */
  id: string;
  kind: PageKind;
  week: Week;
  part: string;
  /** sidebar badge: the lesson number, or P / R / ✓ */
  num: string;
  title: string;
  question: string;
  checks: string[];
  Component: ComponentType;
}

export interface Week {
  n: number;
  title: string;
  summary: string;
  prefix: string;
  /** route id of the overview page */
  home: string;
  /** part titles in sidebar order, including “Start here” and “Consolidate” */
  parts: string[];
  /** every page of the week, in study order */
  pages: Page[];
  /** the pages that count towards progress */
  lessons: Page[];
  def: WeekDef;
  /** route id of one of this week's pages, e.g. route('practice') */
  route: (slug: string) => string;
  /** storage key scoped to this week, e.g. key('practice') → 'w2.practice' */
  key: (name: string) => string;
}
