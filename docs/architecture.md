# Architecture

Where the code lives and how saved progress works. Back to the [README](../README.md); see
[Adding content](adding-content.md) to extend the course.

## Code map

```text
src/
  App.tsx                 shell: top bar + week switch, sidebar, hash routing, outline, notes, pager
  content/index.ts        discovers src/content/week*/index.ts
  content/week1…4/        the weeks (see adding-content.md); content/_template/ is the starter week (not shown on the site)
  course/types.ts         defineWeek and the WeekDef / LessonDef / Page types
  course/registry.ts      expands weeks into pages and routes; checks for duplicate routes
  course/overview.tsx     overview page and its blocks: WeekHero, StudyRoute, LaterWeeks, YourData
  course/PracticePage.tsx, ReadinessPage.tsx   generated per week
  components/             ui.tsx (Sec, Callout, Lab, Picture, Quiz, …), Math (KaTeX), Chart (SVG kit),
                          chartParts (class markers, regions, contours, arrows), Plot (Plotly), ProblemSet
  lib/num.ts              seeded RNG, statistics, QR least squares, ridge, LASSO (coordinate descent)
  lib/classify.ts         sigmoid / log loss, Minkowski distances, k-NN vote with tie rules, confusion counts, ROC
  lib/frac.ts             exact fractions for the Naive Bayes counting labs
  lib/tree.ts             entropy, gain, gain ratio; greedy classification trees with reduced-error pruning; regression trees
  lib/storage.ts          localStorage-backed state hook; lib/migrate.ts upgrades older saved progress
  lib/theme.ts            the THEMES list, the stored theme choice, and redrawing Plotly when it changes
  styles/global.css       design tokens (light/dark) and all styles
  styles/themes.css       the other themes: one block of tokens each; add a block here and list it in THEMES
```

Stack: React 19, TypeScript, Vite 8, KaTeX, Plotly (lazy-loaded), plain CSS.

## Saved progress

Progress is kept in `localStorage`: lessons marked understood, quiz answers (per lesson), self-check lists, practice
ratings (`practice`, `w2.practice`, …, `w4.practice`), notes per page, last page per week, theme. Nothing leaves the
browser; “Reset all progress” is on each week’s overview page and clears every week.
