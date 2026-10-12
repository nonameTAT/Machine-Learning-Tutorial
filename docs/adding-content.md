# Adding content

How to add a week or a lesson, and the building blocks a lesson can use. Back to the [README](../README.md); see
[Architecture](architecture.md) for where everything lives.

## One folder per week

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

## Add a week

Copy `src/content/_template/` to `src/content/week5/` and set `n`, `title` and `summary` in its `index.ts`. Folders
named `week*` are picked up automatically; the week switch, the pager from the previous week and the “Later weeks”
list on week 1 update themselves. Routes become `#/w5-<slug>`.

## Add a lesson

Write `lessons/MyLesson.tsx` (start from `_template/lessons/ExampleLesson.tsx`), then add an entry to a part in
`index.ts`:

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

## Inside a lesson

All from `src/components/`:

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
