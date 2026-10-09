# Interactive machine learning study guide (Weeks 1–3)

**Live site: <https://nonametat.github.io/Machine-Learning-Tutorial/>** (redeployed to GitHub Pages on every push to
`main`).

A local study website for introductory machine learning. Every lesson follows the same arc: motivation → intuition →
precise statement → step-by-step derivation → interactive experiment → misconception checks → central idea.

| Week | Content |
| --- | --- |
| 1 · Regression | 13 lessons, practice, reference sheet, readiness |
| 2 · Classification | 18 lessons, practice, reference sheet, readiness |
| 3 · Bayesian classification | 17 lessons, practice Q1–Q12, reference sheet, readiness |

Switch weeks with the **Week 1 / 2 / 3** buttons in the top bar; each week has its own sidebar, progress bar and
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
include a residual playground, OLS calculator, gradient descent on loss contours, regularisation paths, and a
bias–variance simulation.

**Week 2 — Classification.** 18 lessons: classifier outputs and generative vs discriminative learning, the basic
linear (nearest-centroid) classifier, the sigmoid and thresholds, deriving log loss, fitting logistic regression by
gradient descent, generalisation and cross-validation, data types, confusion-matrix metrics, ROC/AUC, missing values,
Minkowski distances, metric axioms, exemplars (mean/median/medoid), the k-NN vote, feature scaling, choosing k and
distance weighting, evaluating lazy learners (LOOCV), and the curse of dimensionality. Every lesson has a lab — e.g. a
Bayes-rule posterior explorer, draggable class means with the w-vector and boundary, gradient descent on log-loss
contours (including separable data), a fold diagram and k-selection by K-fold CV, an editable confusion matrix, a
threshold sweep on the ROC curve, p-balls and a triangle-inequality tester, k-NN decision regions, scaling
neighbourhoods, and distance-concentration simulations. Classic worked examples are reproduced and checked by the
labs (e.g. AUC = 7/9, the weighted 3-NN flip, one logistic update to β = (0, 0.25)).

**Week 3 — Bayesian classification.** 17 lessons: inductive bias, Bayes’ theorem, MAP/ML and odds, base rates,
minimum expected loss, Gaussian noise and squared error, Bayes optimal and Gibbs classifiers, Bayes error, the Naive
Bayes assumption, PlayTennis, smoothing and log-space, Gaussian Naive Bayes, text representations, Bernoulli and
multinomial text models, missing values, and when Naive Bayes misleads. Labs include an area diagram of Bayes’ rule,
log-odds arithmetic, a 1,000-person base-rate icon array, risk lines for unequal costs, a Bayes-error overlap plot, a
PlayTennis classifier with exact fractions (any query, missing values, Laplace smoothing), and a spam/ham text lab that
scores any typed email under both text models. Every worked number is reproduced exactly (e.g. 1/189 vs
18/875, 2/9 vs 4/27, 0.054 vs 0.1728).

**Progress tracking** in `localStorage`: lessons marked understood, quiz answers, self-check
lists, practice ratings (`practice`, `w2.practice`, `w3.practice`), notes per page, last page per week, theme.
Nothing leaves the browser; “Reset all progress” is on each week’s overview page and clears every week.

## Code map

```text
src/
  App.tsx                     shell: top bar + week switch, sidebar, hash routing, outline, notes, pager
  lessons/registry.ts         WEEKS, parts and lesson list (id, week, title, question, …)
  lessons/pages.ts            route id → page component
  lessons/L01…L13*.tsx        week 1 lessons; checks.ts, Practice.tsx, Reference.tsx, Readiness.tsx, Home.tsx
  lessons/week2/              week 2 lessons L01…L18, checks.ts, Practice2, Reference2, Readiness2, Home2
  lessons/week3/              week 3 lessons L01…L17, checks.ts, Practice3, Reference3, Readiness3, Home3
  interactives/*.tsx          week 1 labs
  interactives/week2/*.tsx    week 2 labs; common.tsx = class markers, region shading, contours
  interactives/week3/*.tsx    week 3 labs
  components/                 KaTeX wrapper (Math), SVG chart kit (Chart), Plotly wrapper (Plot), UI pieces,
                              ProblemSet (practice pages), ReadinessReport (readiness pages)
  lib/num.ts                  seeded RNG, statistics, QR least squares, ridge, LASSO (coordinate descent)
  lib/classify.ts             sigmoid / log loss, Minkowski distances, k-NN vote with tie rules, confusion counts, ROC
  lib/frac.ts                 exact fractions for the Naive Bayes counting labs
  lib/storage.ts              localStorage-backed state hook
  styles/global.css           design tokens (light/dark) and all styles
```

To add a lesson: add an entry to `registry.ts` (with its `week`), create the page component, and map it in `pages.ts`.
To add a week: add its parts and lessons to `registry.ts`, an entry to `WEEKS`, and route ids that do not collide with
earlier weeks (weeks 2 and 3 use `w2-` and `w3-` prefixes).

Stack: React 19, TypeScript, Vite 8, KaTeX, Plotly (lazy-loaded), plain CSS.
