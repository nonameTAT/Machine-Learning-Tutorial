import type { WeekDef } from '../course/types';

// Every folder named week<N> with an index.ts is a week of the guide; nothing else needs registering.
// To add one, copy _template/ to week<N>/ and edit its index.ts.
const modules = import.meta.glob<WeekDef>('./week*/index.ts', { eager: true, import: 'default' });

export const WEEK_DEFS: WeekDef[] = Object.values(modules).sort((a, b) => a.n - b.n);
