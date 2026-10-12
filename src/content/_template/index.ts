import { defineWeek } from '../../course/types';
import ExampleLesson from './lessons/ExampleLesson';
import practice from './practice';

// Starter for a new week. Copy this folder to src/content/week<N>/ and it appears in the site:
// folders named week* are discovered automatically (see src/content/index.ts). This folder itself
// is ignored because its name does not start with "week".
//
// Lessons are numbered in the order listed here. To add one, write lessons/<Name>.tsx and add an
// entry to a part below; the sidebar, overview cards, pager, checklist and readiness page follow.

export default defineWeek({
  n: 99, // ← the week number
  title: 'Week title',
  summary: 'One sentence on what this week covers, shown under the overview heading.',
  // overview: Overview,   // optional page body between the heading and “Your data” (see week1/Overview.tsx)
  parts: [
    {
      title: 'I · First topic',
      lessons: [
        {
          slug: 'example', // → #/w99-example; never rename once published, progress is saved under it
          title: 'An example lesson',
          question: 'Which building blocks can a lesson use?',
          page: ExampleLesson,
          checks: ['Explain what the slope slider changes in the lab.', 'Say why the squared error is never negative.'],
        },
      ],
    },
  ],
  practice, // optional
  // reference: Reference,   // optional printable formula sheet (see week3/Reference.tsx)
  readiness: {
    items: ['One thing a student should be able to do, without notes, at the end of the week.'],
    note: 'Optional advice on what to revisit if a check fails.',
  },
});
