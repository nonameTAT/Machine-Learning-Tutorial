// Remark plugins that turn plain Markdown in lesson files into the guide's components.
// Build-time only: vite.config.ts passes them to @mdx-js/rollup.
import { parse } from 'acorn';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Node = { type: string; children?: Node[]; [k: string]: any };

const attr = (name: string, value: string | null) => ({ type: 'mdxJsxAttribute', name, value });

function walk(node: Node, fn: (n: Node, parent: Node | null, i: number) => void, parent: Node | null = null, i = 0) {
  fn(node, parent, i);
  node.children?.forEach((c, j) => walk(c, fn, node, j));
}

/** Plain text of a node, for headings. */
function toText(node: Node): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'inlineMath') return node.value;
  return (node.children ?? []).map(toText).join('');
}

/** `$…$` → <M t="…" />, and a `$$` block → <MB t="…" />, so Markdown maths uses the shared macros and styles. */
export function remarkMathComponents() {
  return (tree: Node) => {
    walk(tree, (n) => {
      if (n.type === 'inlineMath') Object.assign(n, { type: 'mdxJsxTextElement', name: 'M', attributes: [attr('t', n.value)], children: [], data: undefined });
      else if (n.type === 'math') Object.assign(n, { type: 'mdxJsxFlowElement', name: 'MB', attributes: [attr('t', n.value)], children: [], data: undefined, meta: undefined });
    });
  };
}

/**
 * Each top-level `## Heading` starts a <Sec title="Heading">, which runs until the next `##`.
 * Sections feed the “On this page” outline. Content before the first heading stays outside any section.
 */
export function remarkSections() {
  return (tree: Node) => {
    const out: Node[] = [];
    let sec: Node | null = null;
    for (const child of tree.children ?? []) {
      if (child.type === 'heading' && child.depth === 2) {
        sec = { type: 'mdxJsxFlowElement', name: 'Sec', attributes: [attr('title', toText(child))], children: [], position: child.position };
        out.push(sec);
      } else if (sec && child.type !== 'mdxjsEsm') {
        sec.children!.push(child);
      } else {
        out.push(child);
      }
    }
    tree.children = out;
  };
}

/**
 * Practice files: collect every <Group id title intro> and its <Problem id title lesson> into
 * `export const groups`, so the readiness page and progress counts can list problems without rendering them.
 */
export function remarkPracticeIndex() {
  return (tree: Node, file: { path?: string }) => {
    const str = (n: Node, name: string) => {
      const a = n.attributes?.find((x: any) => x.name === name);
      if (a == null) return undefined;
      if (typeof a.value !== 'string') throw new Error(`${file.path}: <${n.name} ${name}> must be a plain string`);
      return a.value;
    };
    const groups: { key: string; title: string; intro: string; items: { id: string; title: string; lesson: string }[] }[] = [];
    walk(tree, (n) => {
      if (n.type !== 'mdxJsxFlowElement' || n.name !== 'Group') return;
      const items: (typeof groups)[number]['items'] = [];
      walk(n, (p) => {
        if ((p.type === 'mdxJsxFlowElement' || p.type === 'mdxJsxTextElement') && p.name === 'Problem') {
          items.push({ id: str(p, 'id')!, title: str(p, 'title') ?? '', lesson: str(p, 'lesson')! });
        }
      });
      groups.push({ key: str(n, 'id')!, title: str(n, 'title') ?? '', intro: str(n, 'intro') ?? '', items });
    });
    if (groups.length === 0) return;
    const value = `export const groups = ${JSON.stringify(groups)};`;
    tree.children!.unshift({ type: 'mdxjsEsm', value, data: { estree: parse(value, { ecmaVersion: 'latest', sourceType: 'module' }) } });
  };
}

/**
 * `export const stats = { words, labs, quizzes, derivations, minutes }` for every page, so the shell can show
 * “≈ 20 min · 2 labs · 3 checks” in lesson headers and on overview cards without rendering the lesson.
 */
export function remarkLessonStats() {
  return (tree: Node) => {
    const s = { words: 0, labs: 0, quizzes: 0, derivations: 0, minutes: 0 };
    walk(tree, (n) => {
      if (n.type === 'text') s.words += (n.value.match(/\S+/g) ?? []).length;
      else if (n.type === 'mdxJsxFlowElement' || n.type === 'mdxJsxTextElement') {
        if (n.name === 'Lab') s.labs += 1;
        else if (n.name === 'Quiz') s.quizzes += 1;
        else if (n.name === 'Steps') s.derivations += 1;
        else if (n.name === 'M' || n.name === 'MB') s.words += 2;
      }
    });
    // careful reading of technical prose, plus time to play with each lab and answer each check
    const raw = s.words / 160 + s.labs * 4 + s.quizzes * 1 + s.derivations * 2;
    s.minutes = Math.max(5, Math.round(raw / 5) * 5);
    const value = `export const stats = ${JSON.stringify(s)};`;
    tree.children!.unshift({ type: 'mdxjsEsm', value, data: { estree: parse(value, { ecmaVersion: 'latest', sourceType: 'module' }) } });
  };
}
