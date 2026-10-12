// Tree learning for the week 4 labs: entropy and information gain on class counts (fractional counts are
// fine, e.g. after routing a missing value), a greedy axis-parallel classification tree with reduced-error
// pruning, and a one-feature regression tree. Everything is small and explicit so labs can show the numbers.

export const log2 = (x: number) => Math.log(x) / Math.LN2;
export const total = (c: number[]) => c.reduce((s, v) => s + v, 0);

/* ---------------- impurity and gain ---------------- */

/** Entropy in bits of a vector of class counts, using 0 log 0 = 0. An empty node has entropy 0. */
export function entropy(counts: number[]): number {
  const n = total(counts);
  if (n <= 0) return 0;
  let h = 0;
  for (const c of counts) if (c > 0) h -= (c / n) * log2(c / n);
  return h;
}

/** The parent's class counts: the children's counts added up class by class. */
export const sumCounts = (children: number[][]) => children[0].map((_, j) => total(children.map((c) => c[j])));

/** Expected label entropy after the test, Σ_v (n_v / n) H(S_v). */
export function childEntropy(children: number[][]): number {
  const n = total(children.map(total));
  return n <= 0 ? 0 : children.reduce((s, c) => s + (total(c) / n) * entropy(c), 0);
}

/** Information gain H(S) − Σ_v (n_v / n) H(S_v). Never negative for consistent counts, so rounding noise is clipped. */
export const infoGain = (children: number[][]) => Math.max(0, entropy(sumCounts(children)) - childEntropy(children));

/** Entropy of branch membership: the gain-ratio denominator. Uses sizes only, never labels. */
export const splitEntropy = (children: number[][]) => entropy(children.map(total));

/** Gain ratio, or NaN when the test leaves every example in one branch (split entropy 0). */
export function gainRatio(children: number[][]) {
  const s = splitEntropy(children);
  return s < 1e-12 ? NaN : infoGain(children) / s;
}

/** Index of the largest count; ties go to the lower index. */
export function majority(counts: number[]): number {
  let b = 0;
  for (let j = 1; j < counts.length; j++) if (counts[j] > counts[b]) b = j;
  return b;
}

/* ---------------- classification tree on numeric features ---------------- */

export interface CNode {
  /** pre-order number, stable for a given tree */
  id: number;
  depth: number;
  /** indices of the training examples that reach this node */
  idx: number[];
  counts: number[];
  /** majority training label at the node: the prediction if it is (or becomes) a leaf */
  pred: number;
  split?: { f: number; t: number; gain: number; left: CNode; right: CNode };
}

export interface GrowOpts {
  /** number of classes; labels are 0 … k − 1 */
  k: number;
  maxDepth: number;
  /** every child must receive at least this many training examples */
  minLeaf?: number;
}

function bestSplit(X: number[][], y: number[], idx: number[], parent: number[], minLeaf: number) {
  const n = idx.length;
  const h0 = entropy(parent);
  let best: { f: number; t: number; gain: number } | null = null;
  for (let f = 0; f < X[0].length; f++) {
    const s = [...idx].sort((a, b) => X[a][f] - X[b][f]);
    const left = parent.map(() => 0);
    for (let j = 0; j < n - 1; j++) {
      left[y[s[j]]] += 1;
      const a = X[s[j]][f];
      const b = X[s[j + 1]][f];
      const nl = j + 1;
      // equal values cannot be separated by a threshold; respect the minimum leaf size
      if (a === b || nl < minLeaf || n - nl < minLeaf) continue;
      const right = parent.map((c, m) => c - left[m]);
      const g = h0 - (nl / n) * entropy(left) - ((n - nl) / n) * entropy(right);
      if (!best || g > best.gain + 1e-12) best = { f, t: (a + b) / 2, gain: g };
    }
  }
  return best;
}

/**
 * Greedy top-down growth with binary splits x_f ≤ t at midpoints, chosen by information gain.
 * A node becomes a leaf when it is pure, at maxDepth, or has no admissible split. Ties in gain keep
 * the first candidate (lower feature index, then smaller threshold), so the result is deterministic.
 */
export function growTree(X: number[][], y: number[], { k, maxDepth, minLeaf = 1 }: GrowOpts): CNode {
  let next = 0;
  const grow = (idx: number[], depth: number): CNode => {
    const counts = new Array(k).fill(0);
    for (const i of idx) counts[y[i]] += 1;
    const node: CNode = { id: next++, depth, idx, counts, pred: majority(counts) };
    const impure = counts.filter((c) => c > 0).length > 1;
    if (!impure || depth >= maxDepth || idx.length < 2 * minLeaf) return node;
    const best = bestSplit(X, y, idx, counts, minLeaf);
    if (!best) return node;
    const L = idx.filter((i) => X[i][best.f] <= best.t);
    const R = idx.filter((i) => X[i][best.f] > best.t);
    node.split = { ...best, left: grow(L, depth + 1), right: grow(R, depth + 1) };
    return node;
  };
  return grow(
    X.map((_, i) => i),
    0,
  );
}

export function leafOf(node: CNode, x: number[]): CNode {
  let n = node;
  while (n.split) n = x[n.split.f] <= n.split.t ? n.split.left : n.split.right;
  return n;
}

export const predict = (node: CNode, x: number[]) => leafOf(node, x).pred;

export const leafCount = (n: CNode): number => (n.split ? leafCount(n.split.left) + leafCount(n.split.right) : 1);

export const treeDepth = (n: CNode): number => (n.split ? 1 + Math.max(treeDepth(n.split.left), treeDepth(n.split.right)) : 0);

export function errorCount(node: CNode, X: number[][], y: number[]) {
  let e = 0;
  for (let i = 0; i < X.length; i++) if (predict(node, X[i]) !== y[i]) e += 1;
  return e;
}

/** The same tree cut off at `depth`: deeper nodes are replaced by their ancestor's majority leaf. */
export function truncate(node: CNode, depth: number): CNode {
  if (!node.split) return node;
  if (node.depth >= depth) return { ...node, split: undefined };
  return { ...node, split: { ...node.split, left: truncate(node.split.left, depth), right: truncate(node.split.right, depth) } };
}

/** A copy of the tree with node `id` replaced by a leaf predicting that node's training majority. */
export function pruneAt(node: CNode, id: number): CNode {
  if (node.id === id) return { ...node, split: undefined };
  if (!node.split) return node;
  return { ...node, split: { ...node.split, left: pruneAt(node.split.left, id), right: pruneAt(node.split.right, id) } };
}

export interface PruneStep {
  tree: CNode;
  leaves: number;
  /** validation errors of this tree */
  valErr: number;
  /** the node made into a leaf to reach this tree (null for the unpruned tree) */
  prunedId: number | null;
  /** validation errors removed by that replacement (0 = no worse) */
  saved: number;
}

/**
 * Reduced-error pruning. At each step every internal node is a candidate: replace its subtree by a leaf
 * labelled with the node's training majority, and count the validation errors among the examples that
 * reach it before and after. Take the replacement that removes the most errors (ties → the larger
 * subtree, i.e. the simpler tree), and stop when every replacement would add errors.
 */
export function reducedErrorPath(tree: CNode, Xv: number[][], yv: number[]): PruneStep[] {
  const steps: PruneStep[] = [{ tree, leaves: leafCount(tree), valErr: errorCount(tree, Xv, yv), prunedId: null, saved: 0 }];
  let cur = tree;
  for (;;) {
    // validation examples reaching each node of the current tree
    const reach = new Map<number, number[]>();
    Xv.forEach((x, i) => {
      let n = cur;
      for (;;) {
        const list = reach.get(n.id);
        if (list) list.push(i);
        else reach.set(n.id, [i]);
        if (!n.split) break;
        n = x[n.split.f] <= n.split.t ? n.split.left : n.split.right;
      }
    });
    let best: { id: number; saved: number; size: number } | null = null;
    for (const n of internalNodes(cur)) {
      let sub = 0;
      let leaf = 0;
      for (const i of reach.get(n.id) ?? []) {
        if (predict(n, Xv[i]) !== yv[i]) sub += 1;
        if (n.pred !== yv[i]) leaf += 1;
      }
      const saved = sub - leaf;
      const size = leafCount(n);
      if (saved >= 0 && (!best || saved > best.saved || (saved === best.saved && size > best.size))) best = { id: n.id, saved, size };
    }
    if (!best) break;
    cur = pruneAt(cur, best.id);
    steps.push({ tree: cur, leaves: leafCount(cur), valErr: errorCount(cur, Xv, yv), prunedId: best.id, saved: best.saved });
  }
  return steps;
}

export function internalNodes(n: CNode): CNode[] {
  return n.split ? [n, ...internalNodes(n.split.left), ...internalNodes(n.split.right)] : [];
}

/* ---------------- regression on one feature ---------------- */

export const meanOf = (v: number[]) => (v.length ? total(v) / v.length : NaN);
/** Sum of squared deviations from the mean (0 for fewer than two values). */
export const sseOf = (v: number[]) => {
  const m = meanOf(v);
  return v.reduce((s, a) => s + (a - m) ** 2, 0);
};

export interface RNode {
  id: number;
  depth: number;
  idx: number[];
  mean: number;
  sse: number;
  /** the leaf's interval of x: (lo, hi] */
  lo: number;
  hi: number;
  split?: { t: number; left: RNode; right: RNode };
}

/** One-feature regression tree: constant (mean) leaves, splits chosen to minimise total child squared error. */
export function growRegTree(x: number[], y: number[], { maxDepth, minLeaf = 1 }: { maxDepth: number; minLeaf?: number }): RNode {
  let next = 0;
  const grow = (idx: number[], depth: number, lo: number, hi: number): RNode => {
    const ys = idx.map((i) => y[i]);
    const node: RNode = { id: next++, depth, idx, mean: meanOf(ys), sse: sseOf(ys), lo, hi };
    if (depth >= maxDepth || idx.length < 2 * minLeaf || node.sse < 1e-12) return node;
    const s = [...idx].sort((a, b) => x[a] - x[b]);
    const n = s.length;
    let sl = 0;
    let sl2 = 0;
    const st = total(ys);
    const st2 = ys.reduce((a, v) => a + v * v, 0);
    let best: { t: number; err: number } | null = null;
    for (let j = 0; j < n - 1; j++) {
      const v = y[s[j]];
      sl += v;
      sl2 += v * v;
      const nl = j + 1;
      if (x[s[j]] === x[s[j + 1]] || nl < minLeaf || n - nl < minLeaf) continue;
      const sr = st - sl;
      const sr2 = st2 - sl2;
      const err = sl2 - (sl * sl) / nl + (sr2 - (sr * sr) / (n - nl));
      if (!best || err < best.err - 1e-12) best = { t: (x[s[j]] + x[s[j + 1]]) / 2, err };
    }
    if (!best || best.err >= node.sse - 1e-12) return node;
    const t = best.t;
    node.split = {
      t,
      left: grow(
        idx.filter((i) => x[i] <= t),
        depth + 1,
        lo,
        t,
      ),
      right: grow(
        idx.filter((i) => x[i] > t),
        depth + 1,
        t,
        hi,
      ),
    };
    return node;
  };
  return grow(
    x.map((_, i) => i),
    0,
    -Infinity,
    Infinity,
  );
}

export function predictReg(node: RNode, v: number): number {
  let n = node;
  while (n.split) n = v <= n.split.t ? n.split.left : n.split.right;
  return n.mean;
}

export function regLeaves(n: RNode): RNode[] {
  return n.split ? [...regLeaves(n.split.left), ...regLeaves(n.split.right)] : [n];
}
