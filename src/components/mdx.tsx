import type { MDXComponents } from 'mdx/types';
import { M, MB } from './Math';
import { Group, Hint, Problem, Solution } from './ProblemSet';
import { Callout, Figure, Lab, MdTable, Option, Picture, Quiz, RefRow, Reveal, Sec, Step, Steps, Sub, Table, TryThis, Why } from './ui';

/**
 * Everything an .mdx page can use without importing it (provided by <MDXProvider> in main.tsx).
 * `$…$` / `$$…$$` become <M> / <MB>, and each `## Heading` becomes a <Sec> (see mdx/plugins.ts).
 * Labs and other one-off components are imported at the top of the .mdx file.
 */
export const mdxComponents: MDXComponents = {
  M,
  MB,
  Sec,
  Sub,
  Callout,
  Lab,
  TryThis,
  Steps,
  Step,
  Quiz,
  Option,
  Why,
  Table,
  Figure,
  Picture,
  Reveal,
  RefRow,
  Group,
  Problem,
  Hint,
  Solution,
  table: MdTable,
};
