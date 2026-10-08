import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`         -> dist/ (serve with `npm run preview`)
// `npm run build:single`  -> dist-single/index.html, one self-contained file you can open directly
export default defineConfig(({ mode }) => {
  const single = mode === 'single';
  return {
    base: './',
    plugins: single ? [react(), viteSingleFile()] : [react()],
    build: single
      ? { outDir: 'dist-single', assetsInlineLimit: 100_000_000, chunkSizeWarningLimit: 10_000 }
      : { outDir: 'dist', chunkSizeWarningLimit: 5_000 },
  };
});
