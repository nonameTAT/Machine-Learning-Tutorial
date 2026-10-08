// Exact fractions for small counting calculations (Naive Bayes tables), so labs can show 1/189 rather than 0.00529.

export interface Frac {
  n: number;
  d: number;
}

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

export function frac(n: number, d = 1): Frac {
  if (d === 0) return { n: NaN, d: 1 };
  const g = gcd(n, d) || 1;
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g, d: (s * d) / g };
}

export const fmul = (a: Frac, b: Frac) => frac(a.n * b.n, a.d * b.d);
export const fadd = (a: Frac, b: Frac) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
export const fdiv = (a: Frac, b: Frac) => frac(a.n * b.d, a.d * b.n);
export const fprod = (fs: Frac[]) => fs.reduce(fmul, frac(1));
export const fval = (a: Frac) => a.n / a.d;

/** "3/5", or "0" / "1" for whole numbers. */
export const fstr = (a: Frac) => (Number.isNaN(a.n) ? 'undefined' : a.d === 1 ? String(a.n) : `${a.n}/${a.d}`);

/** TeX for a fraction, e.g. \tfrac{3}{5}. */
export const ftex = (a: Frac) => (a.d === 1 ? String(a.n) : `\\tfrac{${a.n}}{${a.d}}`);
