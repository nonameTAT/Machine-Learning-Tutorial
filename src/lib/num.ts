// Small numerical toolkit: seeded randomness, statistics, least squares (QR), ridge, LASSO.
// Everything here is plain arrays so the interactives can show intermediate values.

export type Vec = number[];
export type Mat = number[][];

/* ---------------- random numbers ---------------- */

export function rng(seed: number) {
  let a = seed >>> 0;
  const uniform = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let spare: number | null = null;
  const normal = () => {
    if (spare !== null) {
      const s = spare;
      spare = null;
      return s;
    }
    let u = 0;
    while (u === 0) u = uniform();
    const v = uniform();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return r * Math.cos(2 * Math.PI * v);
  };
  return { uniform, normal, range: (lo: number, hi: number) => lo + (hi - lo) * uniform() };
}
export type Rng = ReturnType<typeof rng>;

/* ---------------- descriptive statistics ---------------- */

export const sum = (v: Vec) => v.reduce((s, x) => s + x, 0);
export const mean = (v: Vec) => sum(v) / v.length;

export function variance(v: Vec, ddof = 1) {
  const m = mean(v);
  return sum(v.map((x) => (x - m) ** 2)) / (v.length - ddof);
}

export function covariance(x: Vec, y: Vec, ddof = 1) {
  const mx = mean(x);
  const my = mean(y);
  return sum(x.map((xi, i) => (xi - mx) * (y[i] - my))) / (x.length - ddof);
}

export function correlation(x: Vec, y: Vec) {
  const sx = Math.sqrt(variance(x));
  const sy = Math.sqrt(variance(y));
  if (sx === 0 || sy === 0) return NaN;
  return covariance(x, y) / (sx * sy);
}

/** One-feature OLS with a free intercept. Returns null if every x is identical. */
export function ols1d(x: Vec, y: Vec): { b0: number; b1: number; sxx: number; sxy: number } | null {
  const mx = mean(x);
  const my = mean(y);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < x.length; i++) {
    sxx += (x[i] - mx) ** 2;
    sxy += (x[i] - mx) * (y[i] - my);
  }
  if (sxx < 1e-12) return null;
  const b1 = sxy / sxx;
  return { b0: my - b1 * mx, b1, sxx, sxy };
}

export interface Metrics {
  sse: number;
  mse: number;
  rmse: number;
  mae: number;
  sst: number;
  r2: number;
  adjR2: number;
}

/** Regression metrics on one evaluation set; nPred excludes the intercept. */
export function metrics(y: Vec, yhat: Vec, nPred = 1): Metrics {
  const m = y.length;
  const my = mean(y);
  let sse = 0;
  let sae = 0;
  let sst = 0;
  for (let i = 0; i < m; i++) {
    const e = y[i] - yhat[i];
    sse += e * e;
    sae += Math.abs(e);
    sst += (y[i] - my) ** 2;
  }
  const r2 = sst > 0 ? 1 - sse / sst : NaN;
  const adjR2 = m - nPred - 1 > 0 ? 1 - ((1 - r2) * (m - 1)) / (m - nPred - 1) : NaN;
  return { sse, mse: sse / m, rmse: Math.sqrt(sse / m), mae: sae / m, sst, r2, adjR2 };
}

/* ---------------- linear algebra ---------------- */

export const dot = (a: Vec, b: Vec) => a.reduce((s, ai, i) => s + ai * b[i], 0);
export const matVec = (A: Mat, v: Vec) => A.map((row) => dot(row, v));
export const transpose = (A: Mat): Mat => A[0].map((_, j) => A.map((row) => row[j]));
export const matMul = (A: Mat, B: Mat): Mat => {
  const Bt = transpose(B);
  return A.map((row) => Bt.map((col) => dot(row, col)));
};

/** Solve A x = b by Gaussian elimination with partial pivoting; null when (near) singular. */
export function solve(A: Mat, b: Vec): Vec | null {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  const scale = Math.max(1e-300, ...A.flat().map(Math.abs));
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12 * scale) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/**
 * Least squares via Householder QR (more stable than forming XᵀX).
 * Returns null if X is rank deficient (to working precision).
 */
export function lstsq(X: Mat, y: Vec): Vec | null {
  const m = X.length;
  const n = X[0].length;
  if (m < n) return null;
  const A = X.map((r) => [...r]);
  const b = [...y];
  const colNorm0 = Math.max(...Array.from({ length: n }, (_, j) => Math.hypot(...A.map((r) => r[j]))), 1e-300);
  for (let k = 0; k < n; k++) {
    let norm = 0;
    for (let i = k; i < m; i++) norm += A[i][k] ** 2;
    norm = Math.sqrt(norm);
    if (norm < 1e-11 * colNorm0) return null;
    const alpha = A[k][k] > 0 ? -norm : norm;
    const v = new Array(m).fill(0);
    for (let i = k; i < m; i++) v[i] = A[i][k];
    v[k] -= alpha;
    const vv = v.reduce((s, vi) => s + vi * vi, 0);
    if (vv > 0) {
      for (let j = k; j < n; j++) {
        let s = 0;
        for (let i = k; i < m; i++) s += v[i] * A[i][j];
        const f = (2 * s) / vv;
        for (let i = k; i < m; i++) A[i][j] -= f * v[i];
      }
      let s = 0;
      for (let i = k; i < m; i++) s += v[i] * b[i];
      const f = (2 * s) / vv;
      for (let i = k; i < m; i++) b[i] -= f * v[i];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = b[r];
    for (let k = r + 1; k < n; k++) s -= A[r][k] * x[k];
    x[r] = s / A[r][r];
  }
  return x;
}

/** Ridge: minimise ||y - Xθ||² + λ Σ_{i≥1} θ_i² (column 0 = intercept, unpenalised). */
export function ridge(X: Mat, y: Vec, lambda: number, penaliseIntercept = false): Vec | null {
  if (lambda <= 0) return lstsq(X, y);
  const n = X[0].length;
  const s = Math.sqrt(lambda);
  const extraRows: Mat = [];
  for (let i = penaliseIntercept ? 0 : 1; i < n; i++) {
    const row = new Array(n).fill(0);
    row[i] = s;
    extraRows.push(row);
  }
  return lstsq([...X, ...extraRows], [...y, ...new Array(extraRows.length).fill(0)]);
}

/**
 * LASSO by cyclic coordinate descent: minimise ||y - Xθ||² + λ Σ_{i≥1} |θ_i|.
 * Column 0 must be the intercept column of ones (left unpenalised).
 */
export function lasso(X: Mat, y: Vec, lambda: number, warm?: Vec, maxSweeps = 20000, tol = 1e-10): Vec {
  const m = X.length;
  const n = X[0].length;
  const theta = warm ? [...warm] : new Array(n).fill(0);
  const r = y.map((yi, i) => yi - dot(X[i], theta));
  const z = Array.from({ length: n }, (_, j) => X.reduce((s, row) => s + row[j] * row[j], 0));
  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let maxChange = 0;
    for (let j = 0; j < n; j++) {
      if (z[j] === 0) continue;
      let rho = 0;
      for (let i = 0; i < m; i++) rho += X[i][j] * (r[i] + X[i][j] * theta[j]);
      // d/dθ_j of SSE is -2(rho - z θ_j); the subgradient condition gives a soft threshold at λ/2.
      const next = j === 0 ? rho / z[j] : softThreshold(rho, lambda / 2) / z[j];
      const delta = next - theta[j];
      if (delta !== 0) {
        for (let i = 0; i < m; i++) r[i] -= X[i][j] * delta;
        theta[j] = next;
        maxChange = Math.max(maxChange, Math.abs(delta));
      }
    }
    if (maxChange < tol) break;
  }
  return theta;
}

const softThreshold = (a: number, t: number) => (a > t ? a - t : a < -t ? a + t : 0);

/** Symmetric 2×2 eigen-decomposition: returns eigenvalues (desc) and unit eigenvectors. */
export function eig2(a: number, b: number, d: number) {
  // matrix [[a, b], [b, d]]
  const tr = a + d;
  const det = a * d - b * b;
  const disc = Math.sqrt(Math.max(0, (tr * tr) / 4 - det));
  const l1 = tr / 2 + disc;
  const l2 = tr / 2 - disc;
  let v1: [number, number];
  if (Math.abs(b) > 1e-14) v1 = [l1 - d, b];
  else v1 = a >= d ? [1, 0] : [0, 1];
  const nv = Math.hypot(v1[0], v1[1]);
  v1 = [v1[0] / nv, v1[1] / nv];
  const v2: [number, number] = [-v1[1], v1[0]];
  return { l1, l2, v1, v2 };
}

/* ---------------- helpers ---------------- */

export const linspace = (a: number, b: number, n: number) =>
  Array.from({ length: n }, (_, i) => a + ((b - a) * i) / (n - 1));

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Format a number compactly for read-outs. */
export function fmt(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return Number.isNaN(v) ? 'undefined' : v > 0 ? '∞' : '−∞';
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1e5 || a < 1e-3) return v.toExponential(2).replace('-', '−');
  const s = Number(v.toFixed(digits)).toString();
  return s.replace('-', '−');
}

/** Polynomial design row [1, z, z², …, z^d]. */
export const polyRow = (z: number, d: number) => Array.from({ length: d + 1 }, (_, k) => z ** k);

export const polyEval = (theta: Vec, z: number) => theta.reduce((s, t, k) => s + t * z ** k, 0);

/** TeX for a fitted line, e.g. "\hat y = 15 - x". */
export function lineTex(b0: number, b1: number, digits = 3, v = 'x'): string {
  const a = Math.abs(b1);
  const slope = Math.abs(a - 1) < 1e-12 ? '' : fmt(a, digits) + '\\,';
  return `\\hat y = ${fmt(b0, digits).replace('−', '-')} ${b1 < 0 ? '-' : '+'} ${slope}${v}`;
}
