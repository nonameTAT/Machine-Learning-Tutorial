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
pager. Progress, quiz answers and notes are saved only in your browser.

## Run it

```bash
npm install          # first time only
npm run dev          # http://localhost:5173 with hot reload
```

| Command | Result |
| --- | --- |
| `npm run build` then `npm run preview` | type-checked production build in `dist/`, served locally |
| `npm run build:single` | one self-contained file, `dist-single/index.html`, that opens directly from disk (no server) |
| `npm run typecheck` | TypeScript check only |

## Documentation

- [Course content](docs/content.md) — what each week covers and its interactive labs
- [Adding content](docs/adding-content.md) — add a week or a lesson, and the building blocks a lesson can use
- [Architecture](docs/architecture.md) — code map, stack, and how saved progress works
