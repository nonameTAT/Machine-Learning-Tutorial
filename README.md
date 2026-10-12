# Interactive machine learning study guide (Weeks 1–4)

**Live site: <https://nonametat.github.io/Machine-Learning-Tutorial/>** (redeployed to GitHub Pages on every push to
`main`).

A local study website for introductory machine learning, with reference to comp9417.

| Week | Content |
| --- | --- |
| 1 · Regression | 13 lessons, practice, reference sheet, readiness |
| 2 · Classification | 18 lessons, practice, reference sheet, readiness |
| 3 · Bayesian classification | 17 lessons, practice Q1–Q12, reference sheet, readiness |
| 4 · Tree learning | 17 lessons, practice Q1–Q12, reference sheet, readiness |

Switch weeks with the **Week 1 / 2 / 3 / 4** buttons in the top bar; each week has its own sidebar, progress bar and
pager.

## Run it

```bash
npm install          # first time only
npm run dev          # http://localhost:5173 with hot reload
```

Other options:

| Command | Result |
| --- | --- |
| `npm run build` then `npm run preview` | type-checked production build in `dist/`, served locally |
| `npm run build:single` | one self-contained file, `dist-single/index.html`, that opens directly from disk (no server) |
| `npm run typecheck` | TypeScript check only |

## What is inside

**Week 1 — Regression.** 13 lessons: what is learned, loss functions, statistics, the
least-squares line, normal equations, gradient descent, maximum likelihood, assumptions, polynomial/indicator features,
ridge & LASSO, validation & metrics, k-NN/local regression, bias–variance. Labs (SVG; Plotly only for the 3-D views)
include a residual playground, squared versus absolute error with a draggable outlier, covariance as signed areas, an
OLS calculator, gradient descent on loss contours, regularisation paths, and a bias–variance simulation.

**Week 2 — Classification.** 18 lessons: classifier outputs and generative vs discriminative learning, the basic
linear (nearest-centroid) classifier, the sigmoid and thresholds, deriving log loss, fitting logistic regression by
gradient descent, generalisation and cross-validation, data types, confusion-matrix metrics, ROC/AUC, missing values,
Minkowski distances, metric axioms, exemplars (mean/median/medoid), the k-NN vote, feature scaling, choosing k and
distance weighting, evaluating lazy learners (LOOCV), and the curse of dimensionality. Every lesson has a lab — e.g. a
Bayes-rule posterior explorer, draggable class means with the w-vector and boundary, gradient descent on log-loss
contours (including separable data), a least-squares line versus a logistic curve on 0/1 labels, a fold diagram and
k-selection by K-fold CV, feature-selection leakage in CV on pure-noise data, an editable confusion matrix, a threshold
sweep on the ROC curve, AUC as a count of correctly ordered pairs, min-max versus z-score on one feature, p-balls and a triangle-inequality tester, k-NN decision regions, scaling
neighbourhoods, and distance-concentration simulations. Classic worked examples are reproduced and checked by the
labs (e.g. AUC = 7/9, the weighted 3-NN flip, one logistic update to β = (0, 0.25)).

**Week 3 — Bayesian classification.** 17 lessons: inductive bias, Bayes’ theorem, MAP/ML and odds, base rates,
minimum expected loss, Gaussian noise and squared error, Bayes optimal and Gibbs classifiers, Bayes error, the Naive
Bayes assumption, PlayTennis, smoothing and log-space, Gaussian Naive Bayes, text representations, Bernoulli and
multinomial text models, missing values, and when Naive Bayes misleads. Labs include an area diagram of Bayes’ rule,
log-odds arithmetic, a 1,000-person base-rate icon array, risk lines for unequal costs, a Bayes-error overlap plot, a
PlayTennis classifier with exact fractions (any query, missing values, Laplace smoothing), a spam/ham text lab that
scores any typed email under both text models, and true versus Naive Bayes posteriors when evidence is double-counted. Every worked number is reproduced exactly (e.g. 1/189 vs
18/875, 2/9 vs 4/27, 0.054 vs 0.1728).

**Week 4 — Tree learning.** 17 lessons: trees as adaptive partitions, what trees can represent (Boolean functions,
completeness), top-down induction, entropy, information gain, growing PlayTennis, gain ratio and identifiers, numeric
thresholds, greedy search and XOR, overfitting and pre-pruning, training error with conflicting labels, reduced-error
pruning and the one-SE rule, rules/costs/missing values, regression trees, regression splits (including the Hammond
organs), model trees, and kernel smoothing. Labs include a point traced through a tree and its partition, a staircase
approximating a diagonal, trees for any Boolean function under any variable order, gain drawn as areas, a
grow-it-yourself tree for PlayTennis (gain or gain ratio, with or without the Day identifier) and for the organ prices,
a threshold scanner, depth-versus-error and reduced-error pruning on noisy 2-D data, fractional routing of missing
values with exact fractions, a regression stump with draggable points, constant versus linear leaves on cos(πx), and a
kernel smoother drawn like the classic two-panel figure. Every worked number is reproduced (e.g. gains 0.266 vs 0.121,
Outlook 0.247, 2/12 unavoidable errors, Q = 4/9, Epanechnikov 4/7).

**Progress tracking** in `localStorage`: lessons marked understood, quiz answers (per lesson), self-check
lists, practice ratings (`practice`, `w2.practice`, …, `w4.practice`), notes per page, last page per week, theme.
Nothing leaves the browser; “Reset all progress” is on each week’s overview page and clears every week.

## Adding content

Each week is one folder, `src/content/week<N>/`, and its `index.ts` is the week's syllabus: title, summary, parts, and for
each lesson its slug, title, guiding question, page component and self-check items. The shell builds everything else
from that file: routes, sidebar, progress bar, overview cards, lesson numbers, pager, end-of-lesson checklist and the
readiness page.

```text
src/content/week3/
  index.ts        syllabus (defineWeek)
  Overview.tsx    optional overview body (sections around <StudyRoute />)
  lessons/*.tsx   one file per lesson: text, maths, pictures, labs, quizzes
  labs/*.tsx      interactive visualisations used by the lessons
  images/         pictures imported by lessons (create when needed)
  practice.tsx    optional practice problems (PracticeDef)
  Reference.tsx   optional printable formula sheet
```

**Add a week.** Copy `src/content/_template/` to `src/content/week5/` and set `n`, `title` and `summary` in its
`index.ts`. Folders named `week*` are picked up automatically; the week switch, the pager from the previous week
and the “Later weeks” list on week 1 update themselves. Routes become `#/w5-<slug>`.

**Add a lesson.** Write `lessons/MyLesson.tsx` (start from `_template/lessons/ExampleLesson.tsx`), then add an entry
to a part in `index.ts`:

```ts
{
  slug: 'perceptron',                 // route #/w5-perceptron; don't rename once published
  title: 'The perceptron',
  question: 'How does a single neuron learn a linear boundary?',
  page: Perceptron,
  checks: ['Trace one perceptron update by hand.'],
},
```

Lessons are numbered by their position, so inserting one in the middle renumbers the rest without touching any
saved progress (everything is stored under slugs). To add a part, add `{ title: 'III · …', lessons: [...] }`.

**Inside a lesson** (all from `src/components/`):

| Building block | Use |
| --- | --- |
| `<Sec title>` | a section; also an “On this page” entry |
| `<M t>` / `<MB t>` | inline / display KaTeX (shared macros in `Math.tsx`) |
| `<Callout kind>` | intuition, definition, warning, note, example, key, theorem |
| `<Picture src alt caption width invert>` | an image: `import fig from '../images/fig.png'`; `invert` suits black-on-white line art in dark mode |
| `<Lab title purpose>` + a lab component | an interactive visualisation; labs use `Chart` (SVG), `Plot` (Plotly 3-D) and `Slider`, `Segmented`, `Toggle`, `Readout` |
| `<TryThis items>` | guided experiments under a lab |
| `<Steps steps>` | a derivation revealed one line at a time |
| `<Quiz id="q1" q options>` | a multiple-choice check; ids only need to be unique within the lesson |
| `<Table>`, `<Figure>`, `<Reveal>` | tables, captioned inline SVG, hidden answers |

The self-check list comes from `checks` in `index.ts`; don't add a `<Checklist>` to the lesson. Practice problems
(`practice.tsx`) refer to lessons by slug.

## Code map

```text
src/
  App.tsx                 shell: top bar + week switch, sidebar, hash routing, outline, notes, pager
  content/index.ts        discovers src/content/week*/index.ts
  content/week1…4/        the weeks (see above); content/_template/ is the starter week (not shown on the site)
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
  styles/global.css       design tokens (light/dark) and all styles
```

Stack: React 19, TypeScript, Vite 8, KaTeX, Plotly (lazy-loaded), plain CSS.
