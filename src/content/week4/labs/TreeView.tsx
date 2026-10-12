import type { ReactNode } from 'react';
import type { CNode } from '../../../lib/tree';

// A small SVG tree drawer shared by the week 4 labs. Leaves sit in equal slots from left to right and
// every internal node is centred over its children, so the picture reads like a textbook tree.

export interface TV {
  /** unique within the tree; used for highlighting and selection */
  key: string;
  label: string;
  /** a smaller second line, e.g. the class counts at the node */
  sub?: string;
  leaf?: boolean;
  /** leaf colour: pos = blue (yes / true / class A), neg = orange */
  tone?: 'pos' | 'neg' | 'plain';
  kids?: { edge: string; node: TV }[];
}

interface Placed {
  n: TV;
  x: number;
  d: number;
}

function layout(root: TV) {
  const nodes: Placed[] = [];
  const edges: { from: Placed; to: Placed; label: string }[] = [];
  let slot = 0;
  let depth = 0;
  const place = (n: TV, d: number): Placed => {
    depth = Math.max(depth, d);
    const kids = (n.kids ?? []).map((k) => ({ label: k.edge, p: place(k.node, d + 1) }));
    let x: number;
    if (kids.length === 0) {
      x = slot + 0.5;
      slot += 1;
    } else x = (kids[0].p.x + kids[kids.length - 1].p.x) / 2;
    const me = { n, x, d };
    nodes.push(me);
    for (const k of kids) edges.push({ from: me, to: k.p, label: k.label });
    return me;
  };
  place(root, 0);
  return { nodes, edges, slots: slot, depth };
}

/**
 * Draws a tree. `path` highlights a root-to-leaf route (node keys); `selected` outlines one node;
 * `onSelect` makes nodes clickable.
 */
export function TreeView({
  root,
  path = [],
  selected,
  onSelect,
  slotW = 92,
  levelH = 74,
  ariaLabel,
  edgeExtra,
}: {
  root: TV;
  path?: string[];
  selected?: string;
  onSelect?: (key: string) => void;
  slotW?: number;
  levelH?: number;
  ariaLabel?: string;
  /** optional extra drawing per edge, e.g. a routing weight */
  edgeExtra?: (fromKey: string, toKey: string) => ReactNode;
}) {
  const { nodes, edges, slots, depth } = layout(root);
  const padX = 6;
  const top = 26;
  const W = Math.max(slots * slotW + 2 * padX, 160);
  const H = depth * levelH + 2 * top + 4;
  const off = (W - slots * slotW) / 2;
  const cx = (p: Placed) => off + p.x * slotW;
  const cy = (p: Placed) => top + p.d * levelH;
  const size = (n: TV) => {
    const len = Math.max(n.label.length * 7.6, (n.sub?.length ?? 0) * 6.2);
    return { w: Math.min(Math.max(len + 16, 40), slotW - 6), h: n.sub ? 40 : 28 };
  };
  const on = new Set(path);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="tree-svg" style={{ maxWidth: W * 1.15 }} role="img" aria-label={ariaLabel ?? 'A decision tree'}>
      {edges.map((e) => {
        const hl = on.has(e.from.n.key) && on.has(e.to.n.key);
        const x1 = cx(e.from);
        const y1 = cy(e.from) + size(e.from.n).h / 2;
        const x2 = cx(e.to);
        const y2 = cy(e.to) - size(e.to.n).h / 2;
        const lx = x1 + 0.5 * (x2 - x1);
        const ly = y1 + 0.5 * (y2 - y1) + 4;
        return (
          <g key={`${e.from.n.key}>${e.to.n.key}`}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} className={`tree-edge ${hl ? 'hl' : ''}`} />
            <text x={lx} y={ly} textAnchor="middle" className={`tree-edge-label ${hl ? 'hl' : ''}`}>
              {e.label}
            </text>
            {edgeExtra?.(e.from.n.key, e.to.n.key)}
          </g>
        );
      })}
      {nodes.map((p) => {
        const { w, h } = size(p.n);
        const cls = ['tree-node', p.n.leaf ? 'leaf' : 'test', p.n.tone ?? '', on.has(p.n.key) ? 'hl' : '', selected === p.n.key ? 'sel' : '', onSelect ? 'clickable' : '']
          .filter(Boolean)
          .join(' ');
        return (
          <g
            key={p.n.key}
            className={cls}
            onClick={onSelect && (() => onSelect(p.n.key))}
            onKeyDown={onSelect && ((e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(p.n.key)))}
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            aria-label={onSelect ? `${p.n.label}${p.n.sub ? `, ${p.n.sub}` : ''}` : undefined}
          >
            <rect x={cx(p) - w / 2} y={cy(p) - h / 2} width={w} height={h} rx={p.n.leaf ? 12 : 5} />
            <text x={cx(p)} y={cy(p) + (p.n.sub ? -3 : 4.5)} textAnchor="middle">
              {p.n.label}
            </text>
            {p.n.sub && (
              <text x={cx(p)} y={cy(p) + 12} textAnchor="middle" className="sub">
                {p.n.sub}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Convert a learned numeric classification tree into a drawable one. */
export function cnodeToTV(n: CNode, featureNames: string[], classNames: string[], digits = 2): TV {
  const sub = n.counts.join(' / ');
  if (!n.split) return { key: `n${n.id}`, label: classNames[n.pred], sub, leaf: true, tone: n.pred === 1 ? 'pos' : 'neg' };
  return {
    key: `n${n.id}`,
    label: `${featureNames[n.split.f]} ≤ ${Number(n.split.t.toFixed(digits))}`,
    sub,
    kids: [
      { edge: 'yes', node: cnodeToTV(n.split.left, featureNames, classNames, digits) },
      { edge: 'no', node: cnodeToTV(n.split.right, featureNames, classNames, digits) },
    ],
  };
}
