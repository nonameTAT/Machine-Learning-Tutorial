import { M } from '../../components/Math';
import type { Problem } from '../../components/ProblemSet';
import type { PracticeDef } from '../../course/types';

// Practice problems: grouped, each with an optional hint and a full solution. Problem ids
// (A1, A2, …) are what the self-ratings are saved under, so keep them stable.

const A: Problem[] = [
  {
    id: 'A1',
    title: 'Fit through the origin',
    lesson: 'example', // slug of the lesson this practises
    q: (
      <p>
        Derive the least-squares slope <M t="\hat\theta" /> for <M t="\hat y = \theta x" />.
      </p>
    ),
    hint: 'Differentiate the sum of squared errors and set it to zero.',
    sol: <p>…</p>,
  },
];

const practice: PracticeDef = {
  blurb: 'One line for the overview card.',
  groups: [{ key: 'A', title: 'A · Derivations', intro: 'Show the main steps.', items: A }],
};

export default practice;
