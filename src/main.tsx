import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MDXProvider } from '@mdx-js/react';
import 'katex/dist/katex.min.css';
import './styles/global.css';
import './styles/themes.css';
import App from './App';
import { mdxComponents } from './components/mdx';
import { migrateStorage } from './lib/migrate';

migrateStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MDXProvider components={mdxComponents}>
      <App />
    </MDXProvider>
  </StrictMode>,
);
