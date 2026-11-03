import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { remarkLessonStats, remarkMathComponents, remarkPracticeIndex, remarkSections } from './mdx/plugins.ts';

// `npm run build`         -> dist/ (serve with `npm run preview`)
// `npm run build:single`  -> dist-single/index.html, one self-contained file you can open directly
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  const content = {
    enforce: 'pre' as const,
    ...mdx({
      // lesson components (Sec, Callout, Quiz, …) come from <MDXProvider> in main.tsx, so .mdx files need no imports for them
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [remarkGfm, remarkMath, remarkMathComponents, remarkLessonStats, remarkSections, remarkPracticeIndex],
    }),
  };
  return {
    base: './',
    plugins: [content, react({ include: /\.(mdx|tsx?)$/ }), ...(single ? [viteSingleFile()] : [])],
    build: single
      ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 10_000 }
      : { outDir: 'dist', chunkSizeWarningLimit: 5_000 },
  };
});
