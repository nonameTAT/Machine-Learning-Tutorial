import { useEffect, useState } from 'react';
import { useStored } from './storage';

export type ThemePref = 'system' | 'light' | 'dark';

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

  const resolved: 'light' | 'dark' = pref === 'system' ? (sysDark ? 'dark' : 'light') : pref;

  useEffect(() => {
    const el = document.documentElement;
    if (pref === 'system') delete el.dataset.theme;
    else el.dataset.theme = pref;
    el.dataset.resolvedTheme = resolved;
    window.dispatchEvent(new CustomEvent('mlguide-theme', { detail: resolved }));
  }, [pref, resolved]);

  return { pref, setPref, resolved };
}

/** Resolved theme for components that must recolour non-CSS content (Plotly). */
export function useResolvedTheme(): 'light' | 'dark' {
  const get = () => (document.documentElement.dataset.resolvedTheme as 'light' | 'dark') ?? (systemDark() ? 'dark' : 'light');
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
