# Adding content

How to add a week or a lesson, and the building blocks a lesson can use. Back to the [README](../README.md); see
[Architecture](architecture.md) for where everything lives.

## One folder per week

Each week is one folder, `src/content/week<N>/`, and its `index.ts` is the week's syllabus: title, summary, parts, and for
each lesson its slug, title, guiding question, page and self-check items. The shell builds everything else
from that file: routes, sidebar, progress bar, overview cards, lesson numbers, pager, end-of-lesson checklist and the
readiness page.

```text
src/content/week3/
  index.ts        syllabus (defineWeek)
  Overview.mdx    optional overview body (sections around <StudyRoute />)
  lessons/*.mdx   one file per lesson: Markdown text, maths, pictures, labs, quizzes
  labs/*.tsx      interactive visualisations used by the lessons (React components)
  images/         pictures imported by lessons (create when needed)
  practice.mdx    optional practice problems
  Reference.mdx   optional printable formula sheet
```

Prose lives in `.mdx` files (Markdown with components); anything interactive lives in `labs/*.tsx`.

## Add a week

Copy `src/content/_template/` to `src/content/week5/` and set `n`, `title` and `summary` in its `index.ts`. Folders
named `week*` are picked up automatically; the week switch, the pager from the previous week and the “Later weeks”
list on week 1 update themselves. Routes become `#/w5-<slug>`.

## Add a lesson

Write `lessons/Perceptron.mdx` (start from `_template/lessons/ExampleLesson.mdx`), then import it in `index.ts` and add
an entry to a part:

```ts
import Perceptron from './lessons/Perceptron.mdx';
// …
{
  slug: 'perceptron',                 // route #/w5-perceptron; don't rename once published
  title: 'The perceptron',
  question: 'How does a single neuron learn a linear boundary?',
  page: Perceptron,
  checks: ['Trace one perceptron update by hand.'],
},
```

Lessons are numbered by their position, so inserting one in the middle renumbers the rest without touching any
saved progress (everything is stored under slugs). The first three `checks` are also shown under the lesson title as
“After this lesson you can”, so put the most important first. The header's “≈ 20 min · 2 labs · 3 checks” is counted
from the lesson itself at build time. To add a part, add `{ title: 'III · …', lessons: [...] }`.

## Writing a lesson in MDX

A lesson is Markdown plus a few components. None of the components below need importing; labs and images do.

````mdx
import { PerceptronLab } from '../labs/PerceptronLab';

## Why a linear boundary?

Plain paragraphs, **bold**, *italic*, `code` and [links](#/w5-perceptron). Inline maths $\bw\T\bx + b$,
and display maths between `$$` lines:

$$
\hat y = \sign(\bw\T\bx + b).
$$

<Callout kind="intuition" title="Optional title">
Markdown works inside components. Leave the content on its own lines.
</Callout>

<Lab title="Train a perceptron" purpose="Click to add points; watch the boundary move.">
<PerceptronLab />
</Lab>

<TryThis>
1. Add a misclassified point and press Step.
2. Make the data non-separable. What happens?
</TryThis>

<Steps>
Optional intro before the first step.

<Step title="Write the update">
$$
\bw \leftarrow \bw + y_j\bx_j
$$
</Step>

<Step title="Check it moves the right way">
After the update, $y_j\bw\T\bx_j$ has grown by $\|\bx_j\|^2$.
</Step>
</Steps>

## Check your understanding

<Quiz id="q1">
A point is misclassified with $y_j = +1$. Which way does $\bw$ move?

<Option correct>Towards $\bx_j$. <Why>The update adds $y_j\bx_j = \bx_j$.</Why></Option>
<Option>Away from $\bx_j$. <Why>That would make the point more wrong.</Why></Option>
</Quiz>
````

- **Sections:** each `## Heading` starts a section (and an “On this page” entry) that runs to the next `##`. Use `###`
  for sub-headings.
- **Maths:** `$…$` inline, `$$` on their own lines for display. The shared macros (`\bx`, `\T`, `\SSE`, `\cfit{…}`, …)
  are in `src/components/Math.tsx`. A display formula with a label needs the component form: `<MB t="…" label="(1)" />`.
- **Escaping:** in text, write `\$` for a dollar sign and `\<`, `\{` for `<` and `{` (MDX reads them as JSX). Inside
  `$…$` no escaping is needed.
- **Inside components**, put Markdown content on its own lines between the opening and closing tags. Content on the same
  line as a tag (like `<Option>…</Option>` above) stays inline, without a paragraph.
- **Attributes are JavaScript:** `title="…"` is a plain string (no Markdown). For maths in an attribute, use JSX:
  `purpose={<>Fit <M t="\theta" /> by eye</>}`.
- **Comments:** `{/* … */}`.

| Building block | Use |
| --- | --- |
| `## Heading` | a section; also an “On this page” entry |
| `$…$` / `$$…$$` | inline / display KaTeX (or `<M t>` / `<MB t>` where Markdown cannot go) |
| `<Callout kind title?>` | intuition, definition, warning, note, example, key, theorem |
| `<Picture src alt caption width invert>` | an image: `import fig from '../images/fig.png'`; `invert` suits black-on-white line art in dark mode |
| `<Lab title purpose>` + a lab component | an interactive visualisation from `labs/` |
| `<TryThis>` + a numbered list | guided experiments under a lab |
| `<Steps>` + `<Step title>` | a derivation revealed one step at a time |
| `<Quiz id>` + question + `<Option correct?>…<Why>…</Why></Option>` | a multiple-choice check; ids only need to be unique within the lesson |
| Markdown pipe tables | tables; for cells with `\|` or block content use `<Table head={[…]} rows={[[…]]} />` |
| `<Figure caption>`, `<Reveal label>` | captioned inline SVG, hidden answers |
| `<RefRow f="…" note="…" />` | one formula row of a reference sheet |

The self-check list comes from `checks` in `index.ts`; don't add a `<Checklist>` to the lesson.

## Writing a lab

A lab is an ordinary React component in `labs/*.tsx`: state, controls from `components/ui` (`Slider`, `Segmented`,
`Toggle`, `Readout`) and a picture. See `_template/labs/`.

- **2-D:** `<Chart>` (`components/Chart.tsx`) draws SVG in data coordinates; colour with CSS classes (`pt`, `ln-fit`,
  `ln-res`, `contour`, …) so it follows the theme.
- **3-D:** put the scene in its own file whose default export uses `components/three/Scene3D`, and load it with
  `lazy3D`, so three.js is downloaded only when the view is shown:

  ```tsx
  // labs/BowlLab.tsx
  const Bowl = lazy3D(() => import('./BowlScene'));   // module scope
  export function BowlLab() { /* state, sliders … */ return <Bowl height={420} a={a} b={b} />; }

  // labs/BowlScene.tsx
  export default function BowlScene({ a, b }: { a: number; b: number }) {
    return (
      <Scene3D domain={{ x: [-4, 4], y: [0, 4], z: [0, 40] }} labels={{ x: 'a', y: 'b', z: 'MSE' }}>
        <Surface f={mse} colormap={{ min: 0, max: 40 }} grid={8} tooltip={(x, y, z) => `MSE ${z.toFixed(2)}`} />
        <Points3D points={[[a, b, mse(a, b)]]} color="--c-res" />
        <Line3D points={[[a, b, mse(a, b)], [a, b, 0]]} dashed />
      </Scene3D>
    );
  }
  ```

  Everything takes data coordinates; the domain is stretched onto a cube with z up, and anything outside the box is cut
  off. Give every axis the same range when angles matter (as in `labs/ProjectionScene.tsx`). Besides `Surface`,
  `Line3D` and `Points3D` there are `Patch3D` (a flat polygon, e.g. a plane), `Arrow3D` (vectors), and the `notes`
  prop of `Scene3D` for text pinned to points. `eye` sets the starting camera direction; walls and tick labels follow it. Colours are CSS variables (`'--c-fit'`) or literal colours. Pass functions that keep
  their identity (module level or `useCallback`) to `Surface`, or it is rebuilt on every render. The week 1 scenes
  (`labs/PlaneFitScene.tsx`, `labs/GDBowlScene.tsx`, `labs/ProjectionScene.tsx`) are fuller examples.

## Practice problems

`practice.mdx` holds the problems; `index.ts` wires it up:

```ts
import Practice, { blurb, groups } from './practice.mdx';
// …
practice: { blurb, groups, page: Practice },
```

```mdx
export const blurb = 'One line for the overview card.';

<Group id="A" title="A · Derivations" intro="Show the main steps.">

<Problem id="A1" title="Loss scaling" lesson="loss">

The question, in Markdown.

<Hint>Optional; one line.</Hint>

<Solution>
The full solution, in Markdown.
</Solution>

</Problem>

</Group>
```

`groups` is generated from the `<Group>` and `<Problem>` attributes at build time, so keep them plain strings. `lesson`
is a lesson slug; never rename a published problem `id` (self-ratings are stored under it). Anything after the last
group is shown below the problems.
