import { useCallback, useEffect, useState } from 'react';

/** Every key this site writes starts with this prefix, so "reset progress" can find them all. */
export const PREFIX = 'c9417.';
const EVENT = 'mlguide-storage';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* private mode or quota: the page still works, it just forgets */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }));
}

/**
 * useState backed by localStorage. Components using the same key stay in sync,
 * so ticking a lesson complete updates the sidebar immediately.
 */
export function useStored<T>(key: string, fallback: T): [T, (v: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => read(key, fallback));

  useEffect(() => {
    setValue(read(key, fallback));
    const onChange = (e: Event) => {
      const k = (e as CustomEvent<string>).detail;
      if (k === key || k === '*') setValue(read(key, fallback));
    };
    window.addEventListener(EVENT, onChange);
    return () => window.removeEventListener(EVENT, onChange);
    // fallback is intentionally not a dependency: callers pass literals
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (v: T | ((prev: T) => T)) => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(read(key, fallback)) : v;
      write(key, next);
      setValue(next);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, set];
}

export function readStored<T>(key: string, fallback: T): T {
  return read(key, fallback);
}

export function clearAllStored() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX) && k !== PREFIX + 'theme') keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: '*' }));
}

/** Collect every quiz/check key so the home page can summarise them. */
export function listStoredKeys(startsWith: string): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX + startsWith)) out.push(k.slice(PREFIX.length));
    }
  } catch {
    /* ignore */
  }
  return out;
}

export function useStorageTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const on = () => setTick((t) => t + 1);
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return tick;
}
