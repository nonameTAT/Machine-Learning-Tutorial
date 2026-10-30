import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'katex/dist/katex.min.css';
import './styles/global.css';
import './styles/themes.css';
import App from './App';
import { migrateStorage } from './lib/migrate';

migrateStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
