import { useEffect, useState } from 'react';
import { useStored } from './storage';

export type ThemeId = 'light' | 'dark' | 'sepia' | 'nord' | 'gruvbox' | 'dracula' | 'catppuccin-latte' | 'catppuccin-mocha';
export type ThemePref = 'system' | ThemeId;

/** Palettes are in styles/global.css (light, dark) and styles/themes.css (the rest). */
export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'sepia', label: 'Sepia' },
  { id: 'nord', label: 'Nord' },
  { id: 'gruvbox', label: 'Gruvbox' },
  { id: 'dracula', label: 'Dracula' },
  { id: 'catppuccin-latte', label: 'Catppuccin Latte' },
  { id: 'catppuccin-mocha', label: 'Catppuccin Mocha' },
];

function systemDark() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

/** Applies the stored theme preference to <html data-theme> and returns the resolved theme. */
export function useThemeController() {
  const [pref, setPref] = useStored<ThemePref>('theme', 'system');
  const [sysDark, setSysDark] = useState(systemDark());

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const on = () => setSysDark(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const resolved: ThemeId = pref === 'system' ? (sysDark ? 'dark' : 'light') : pref;

  useEffect(() => {
    const el = document.documentElement;
    const apply = () => {
      if (pref === 'system') delete el.dataset.theme;
      else el.dataset.theme = pref;
    };
    // paper is white, so a dark theme would print pale text on it
    const printLight = () => {
      el.dataset.theme = 'light';
    };
    apply();
    el.dataset.resolvedTheme = resolved;
    window.dispatchEvent(new CustomEvent('mlguide-theme', { detail: resolved }));
    window.addEventListener('beforeprint', printLight);
    window.addEventListener('afterprint', apply);
    return () => {
      window.removeEventListener('beforeprint', printLight);
      window.removeEventListener('afterprint', apply);
    };
  }, [pref, resolved]);

  return { pref, setPref, resolved };
}

/** Resolved theme for components that must recolour non-CSS content (Plotly). */
export function useResolvedTheme(): ThemeId {
  const get = () => (document.documentElement.dataset.resolvedTheme as ThemeId) ?? (systemDark() ? 'dark' : 'light');
  const [t, setT] = useState(get);
  useEffect(() => {
    const on = () => setT(get());
    window.addEventListener('mlguide-theme', on);
    return () => window.removeEventListener('mlguide-theme', on);
  }, []);
  return t;
}

/** Read a CSS custom property (e.g. '--c-data') as a colour string. */
export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
