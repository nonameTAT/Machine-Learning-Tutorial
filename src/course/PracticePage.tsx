import { ProblemSet } from '../components/ProblemSet';
import { useWeek } from './context';

/** The week's practice problems, from its practice.mdx (wired up as `practice` in index.ts). */
export function PracticePage() {
  const week = useWeek();
  const practice = week.def.practice;
  if (!practice) return null;
  return <ProblemSet groups={practice.groups} storeKey={week.key('practice')} lessonRoute={week.route} Page={practice.page} />;
}
