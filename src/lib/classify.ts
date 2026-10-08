// Classification toolkit for the week 2 labs: sigmoid / log loss, distances, k-NN votes, confusion counts, ROC.
// Plain arrays throughout so the labs can display every intermediate value.

import type { Vec } from './num';

export type Label = 0 | 1;

/* ---------------- logistic regression ---------------- */

export const sigmoid = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));

/** Inverse sigmoid: the score at which σ(z) = p. */
export const logit = (p: number) => Math.log(p / (1 - p));

/** Loss of one observation: −log of the probability given to its true label. Clipped so p = 0 or 1 stays finite. */
export function obsLoss(p: number, y: Label) {
  const q = y === 1 ? p : 1 - p;
  return -Math.log(Math.max(q, 1e-300));
}

/** Average binary cross-entropy J(β) for 1-D inputs with score β0 + β1 x. */
export function logLoss1d(xs: Vec, ys: Label[], b0: number, b1: number) {
  let s = 0;
  for (let j = 0; j < xs.length; j++) s += obsLoss(sigmoid(b0 + b1 * xs[j]), ys[j]);
  return s / xs.length;
}

/** ∇J for 1-D inputs: (1/m) Xᵀ(p − y) with X = [1, x]. */
export function logGrad1d(xs: Vec, ys: Label[], b0: number, b1: number): [number, number] {
  let g0 = 0;
  let g1 = 0;
  for (let j = 0; j < xs.length; j++) {
    const r = sigmoid(b0 + b1 * xs[j]) - ys[j];
    g0 += r;
    g1 += r * xs[j];
  }
  return [g0 / xs.length, g1 / xs.length];
}

/* ---------------- distances ---------------- */

/**
 * Minkowski distance of order p. p = Infinity gives Chebyshev (max), p = 0 gives the
 * mismatch count Σ I[xᵣ ≠ zᵣ] (the so-called “L0”, which is not a Minkowski norm).
 */
export function minkowski(a: Vec, b: Vec, p: number) {
  if (p === 0) return a.reduce((s, ai, r) => s + (ai !== b[r] ? 1 : 0), 0);
  if (p === Infinity) return Math.max(...a.map((ai, r) => Math.abs(ai - b[r])));
  let s = 0;
  for (let r = 0; r < a.length; r++) s += Math.abs(a[r] - b[r]) ** p;
  return s ** (1 / p);
}

export const euclid = (a: Vec, b: Vec) => {
  let s = 0;
  for (let r = 0; r < a.length; r++) s += (a[r] - b[r]) ** 2;
  return Math.sqrt(s);
};

/* ---------------- k-nearest neighbours ---------------- */

export interface Neighbour {
  i: number;
  d: number;
}

/**
 * The k training points closest to q, nearest first. Equal distances are ordered by index,
 * which is this site's stated tie rule at the neighbourhood boundary. `exclude` removes one
 * training index (leave-one-out).
 */
export function neighbours(X: Vec[], q: Vec, k: number, dist: (a: Vec, b: Vec) => number = euclid, exclude = -1): Neighbour[] {
  const all: Neighbour[] = [];
  for (let i = 0; i < X.length; i++) if (i !== exclude) all.push({ i, d: dist(X[i], q) });
  all.sort((a, b) => a.d - b.d || a.i - b.i);
  return all.slice(0, Math.max(1, Math.min(k, all.length)));
}

export interface Vote {
  winner: Label;
  /** total (possibly weighted) vote for class 0 and class 1 */
  tally: [number, number];
  /** a tie was broken by the nearest neighbour's label */
  tie: boolean;
  /** an exact match (distance 0) decided a weighted vote */
  exact: boolean;
  weights: number[];
}

/**
 * Majority vote (or inverse-square-distance weighted vote, w = 1/d²) among the neighbours.
 * Ties go to the class of the nearest tied neighbour. In a weighted vote, any neighbour at
 * distance 0 is an exact match: only exact matches vote, since 1/0² is undefined.
 */
export function vote(nb: Neighbour[], y: Label[], weighted: boolean): Vote {
  const exactSet = weighted ? nb.filter((n) => n.d === 0) : [];
  const exact = exactSet.length > 0;
  const voters = exact ? exactSet : nb;
  const weights = nb.map((n) => (!weighted ? 1 : exact ? (n.d === 0 ? 1 : 0) : 1 / (n.d * n.d)));
  const tally: [number, number] = [0, 0];
  nb.forEach((n, r) => (tally[y[n.i]] += weights[r]));
  let winner: Label;
  let tie = false;
  if (Math.abs(tally[0] - tally[1]) < 1e-12) {
    tie = true;
    winner = y[voters[0].i];
  } else winner = tally[1] > tally[0] ? 1 : 0;
  return { winner, tally, tie, exact, weights };
}

export function knnPredict(X: Vec[], y: Label[], q: Vec, k: number, weighted = false, dist = euclid, exclude = -1): Label {
  return vote(neighbours(X, q, k, dist, exclude), y, weighted).winner;
}

/** Leave-one-out error rate of k-NN on (X, y). */
export function loocvError(X: Vec[], y: Label[], k: number, weighted = false, dist = euclid) {
  let wrong = 0;
  for (let i = 0; i < X.length; i++) if (knnPredict(X, y, X[i], k, weighted, dist, i) !== y[i]) wrong++;
  return wrong / X.length;
}

/** Training error of k-NN when each training point may retrieve itself. */
export function resubError(X: Vec[], y: Label[], k: number, weighted = false, dist = euclid) {
  let wrong = 0;
  for (let i = 0; i < X.length; i++) if (knnPredict(X, y, X[i], k, weighted, dist) !== y[i]) wrong++;
  return wrong / X.length;
}

/* ---------------- confusion matrix and metrics ---------------- */

export interface Counts {
  tp: number;
  fn: number;
  fp: number;
  tn: number;
}

export function confusion(y: Label[], yhat: Label[]): Counts {
  const c = { tp: 0, fn: 0, fp: 0, tn: 0 };
  y.forEach((yi, j) => {
    if (yi === 1) yhat[j] === 1 ? c.tp++ : c.fn++;
    else yhat[j] === 1 ? c.fp++ : c.tn++;
  });
  return c;
}

/** Metrics from counts; a fraction with a zero denominator is NaN (undefined), never silently 0. */
export function rates({ tp, fn, fp, tn }: Counts) {
  const div = (a: number, b: number) => (b === 0 ? NaN : a / b);
  const m = tp + fn + fp + tn;
  return {
    m,
    acc: div(tp + tn, m),
    err: div(fp + fn, m),
    prec: div(tp, tp + fp),
    rec: div(tp, tp + fn),
    f1: div(2 * tp, 2 * tp + fp + fn),
    fpr: div(fp, fp + tn),
    tnr: div(tn, fp + tn),
  };
}

/* ---------------- ROC ---------------- */

export interface RocPoint {
  fpr: number;
  tpr: number;
  /** predict positive when score ≥ thr (Infinity = predict nothing positive) */
  thr: number;
}

/**
 * ROC points from (score, label) pairs, sweeping the threshold down through each distinct score.
 * Tied scores cross together, giving a diagonal segment rather than an arbitrary staircase.
 */
export function rocCurve(scores: Vec, y: Label[]): { pts: RocPoint[]; auc: number } {
  const P = y.filter((v) => v === 1).length;
  const N = y.length - P;
  const order = scores.map((s, i) => [s, i] as const).sort((a, b) => b[0] - a[0]);
  const pts: RocPoint[] = [{ fpr: 0, tpr: 0, thr: Infinity }];
  let tp = 0;
  let fp = 0;
  for (let r = 0; r < order.length; ) {
    const s = order[r][0];
    while (r < order.length && order[r][0] === s) {
      if (y[order[r][1]] === 1) tp++;
      else fp++;
      r++;
    }
    pts.push({ fpr: N ? fp / N : 0, tpr: P ? tp / P : 0, thr: s });
  }
  let auc = 0;
  for (let i = 1; i < pts.length; i++) auc += ((pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr)) / 2;
  return { pts, auc };
}
