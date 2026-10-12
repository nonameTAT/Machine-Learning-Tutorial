import { createContext, useContext } from 'react';
import type { Page, Week } from './types';

/** The page the shell is showing; null outside a page (e.g. in the top bar). */
export const PageContext = createContext<Page | null>(null);

/** Every week, in order. Provided by the shell so pages need not import the registry. */
export const WeeksContext = createContext<Week[]>([]);

export function usePage(): Page {
  const page = useContext(PageContext);
  if (!page) throw new Error('usePage() is only available inside a page rendered by the shell.');
  return page;
}

export const useWeek = () => usePage().week;

export const useWeeks = () => useContext(WeeksContext);
