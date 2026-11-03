# Architecture

Where the code lives and how saved progress works. Back to the [README](../README.md); see
[Adding content](adding-content.md) to extend the course.

## Code map

```text
src/
  App.tsx                 shell: top bar (week switch, reading progress), collapsible sidebar, hash routing,
                          lesson header (time, labs, goals), “On this page” outline, end-of-lesson card, pager
  content/index.ts        discovers src/content/week*/index.ts
  content/week1…4/        the weeks (see adding-content.md): index.ts + .mdx pages + labs/*.tsx;
                          content/_template/ is the starter week (not shown on the site)
  course/types.ts         defineWeek and the WeekDef / LessonDef / Page types
  course/registry.ts      expands weeks into pages and routes; checks for duplicate routes
  course/overview.tsx     overview page and its blocks: WeekHero, WeekCards, StudyRoute, LearningArc, YourData
  course/PracticePage.tsx, ReadinessPage.tsx   generated per week
  components/             ui.tsx (Sec, Callout, Lab, Picture, Quiz, Steps, …), Math (KaTeX), Chart (SVG kit),
                          chartParts (class markers, regions, contours, arrows), ProblemSet (practice pages)
  components/mdx.tsx      the components every .mdx file can use without importing them (given to <MDXProvider> in main.tsx)
  components/View3D.tsx   lazy3D(): loads a 3-D scene module on first use, with retry/reload and WebGL error states
  components/three/       Scene3D kit on react-three-fiber: Scene3D (axes, orbit, labels, notes, legend),
                          Surface, Patch3D, Arrow3D, Line3D, Points3D
mdx/plugins.ts            build-time remark plugins: $…$ → <M>, ## → <Sec>, practice.mdx → `groups`,
                          every page → `stats` (words, labs, checks, ≈ minutes)
  lib/num.ts              seeded RNG, statistics, QR least squares, ridge, LASSO (coordinate descent)
  lib/classify.ts         sigmoid / log loss, Minkowski distances, k-NN vote with tie rules, confusion counts, ROC
  lib/frac.ts             exact fractions for the Naive Bayes counting labs
  lib/tree.ts             entropy, gain, gain ratio; greedy classification trees with reduced-error pruning; regression trees
  lib/storage.ts          localStorage-backed state hook; lib/migrate.ts upgrades older saved progress
  lib/theme.ts            the THEMES list, the stored theme choice, and a hook for recolouring WebGL views when it changes
  styles/global.css       design tokens (light/dark) and all styles
  styles/themes.css       the other themes: one block of tokens each; add a block here and list it in THEMES
```

Stack: React 19, TypeScript, Vite 8, MDX 3 (with remark-gfm and remark-math), KaTeX, three.js via react-three-fiber and
drei (lazy-loaded), plain CSS.

## How an .mdx page is built

`@mdx-js/rollup` (in `vite.config.ts`) compiles each `.mdx` file into a React component. Three plugins in
`mdx/plugins.ts` run first:

- `$…$` and `$$…$$` (parsed by remark-math) become `<M t>` and `<MB t>`, so Markdown maths uses the shared KaTeX macros;
- each top-level `## Heading` becomes `<Sec title="Heading">` wrapping everything up to the next `##`;
- every page exports `stats` (word, lab, quiz and derivation counts and a rough study time), which the registry
  attaches to its page by component; the lesson header, the overview cards and the week totals read it;
- in a file with `<Group>`/`<Problem>` elements, their attributes are collected into `export const groups`, which the
  readiness page and progress counts use without rendering the problems.

GFM tables are rendered by `MdTable` (a scrolling wrapper). Components are resolved through `<MDXProvider>`, so a lesson
imports only its labs.

## 3-D views

three.js is about 250 kB gzipped, so it is only downloaded when a 3-D view comes near the visible part of the page. A lab declares its scene once,
`const Bowl3D = lazy3D(() => import('./GDBowlScene'))`, and renders `<Bowl3D height={460} … />`; the scene file is
the only one that imports `components/three/Scene3D`. Scenes take data coordinates and map them onto a cube with z up.
Axis labels and hover tips are ordinary DOM in an overlay, moved to the projected 3-D positions each frame (drei's
`<Html>` is avoided: it creates a React root per label, which breaks unmounting under React 19). Rendering is on demand
(`frameloop="demand"`), so an idle view costs nothing.

## Saved progress

Progress is kept in `localStorage`: lessons marked understood, quiz answers (per lesson), self-check lists, practice
ratings (`practice`, `w2.practice`, …, `w4.practice`), notes per page, last page per week, theme. Nothing leaves the
browser; “Reset all progress” is on each week’s overview page and clears every week.

## Layout

Three columns from 1200 px (sidebar, content, “On this page”); below that the outline is hidden, and below 960 px the
sidebar becomes a drawer. On phones (≤ 760 px) a bar at the bottom holds previous / next, and (≤ 560 px) the week
switch moves from the top bar into the drawer. Prose is capped at `--prose` (720 px); labs and wide figures use the
whole column, and a lab stacks its panels when the lab itself is narrower than 720 px (a container query), whatever the
window size.
