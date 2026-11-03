// Types for importing .mdx files (compiled by @mdx-js/rollup, see vite.config.ts).
declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { ProblemGroup } from './components/ProblemSet';
  import type { PageStats } from './course/types';
  const MDXContent: ComponentType;
  export default MDXContent;
  /** generated: size of the page, for “≈ 20 min · 2 labs” */
  export const stats: PageStats;
  /** practice.mdx only: one line for the overview card */
  export const blurb: string;
  /** practice.mdx only: generated from its <Group> / <Problem> elements */
  export const groups: ProblemGroup[];
}
