import { useId, useRef, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from 'react';

// A tiny SVG plotting kit. Charts use a fixed viewBox and scale to their container,
// so every interactive works on a phone as well as a wide monitor.

export interface Scales {
  x: (v: number) => number;
  y: (v: number) => number;
  /** pixel → data */
  ix: (px: number) => number;
  iy: (py: number) => number;
  W: number;
  H: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  xd: [number, number];
  yd: [number, number];
}

export function makeScales(
  W: number,
  H: number,
  xd: [number, number],
  yd: [number, number],
  margin = { l: 46, r: 14, t: 14, b: 38 },
): Scales {
  const left = margin.l;
  const right = W - margin.r;
  const top = margin.t;
  const bottom = H - margin.b;
  const x = (v: number) => left + ((v - xd[0]) / (xd[1] - xd[0])) * (right - left);
  const y = (v: number) => bottom - ((v - yd[0]) / (yd[1] - yd[0])) * (bottom - top);
  const ix = (px: number) => xd[0] + ((px - left) / (right - left)) * (xd[1] - xd[0]);
  const iy = (py: number) => yd[0] + ((bottom - py) / (bottom - top)) * (yd[1] - yd[0]);
  return { x, y, ix, iy, W, H, left, right, top, bottom, xd, yd };
}

export function niceTicks(lo: number, hi: number, count = 6): number[] {
  const span = hi - lo;
  if (!(span > 0)) return [lo];
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag;
  const start = Math.ceil(lo / step - 1e-9) * step;
  const out: number[] = [];
  for (let v = start; v <= hi + step * 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}

const tickLabel = (v: number) => {
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return v.toExponential(0);
  return String(Number(v.toPrecision(6))).replace('-', '−');
};

export interface ChartProps {
  W?: number;
  H?: number;
  x: [number, number];
  y: [number, number];
  xLabel?: string;
  yLabel?: string;
  margin?: { l: number; r: number; t: number; b: number };
  xTicks?: number[];
  yTicks?: number[];
  yTickFormat?: (v: number) => string;
  xTickFormat?: (v: number) => string;
  grid?: boolean;
  children: (s: Scales) => ReactNode;
  /** drawn above the clipped plot area (labels, handles that may sit on the edge) */
  overlay?: (s: Scales) => ReactNode;
  svgRef?: RefObject<SVGSVGElement | null>;
  onPointerDown?: (e: RPointerEvent<SVGSVGElement>, s: Scales) => void;
  onPointerMove?: (e: RPointerEvent<SVGSVGElement>, s: Scales) => void;
  onPointerUp?: (e: RPointerEvent<SVGSVGElement>, s: Scales) => void;
  className?: string;
  ariaLabel?: string;
}

export function Chart({
  W = 560,
  H = 340,
  x,
  y,
  xLabel,
  yLabel,
  margin,
  xTicks,
  yTicks,
  yTickFormat = tickLabel,
  xTickFormat = tickLabel,
  grid = true,
  children,
  overlay,
  svgRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  className,
  ariaLabel,
}: ChartProps) {
  const s = makeScales(W, H, x, y, margin);
  const clip = useId().replace(/:/g, '');
  const xt = xTicks ?? niceTicks(x[0], x[1], Math.max(3, Math.round(W / 90)));
  const yt = yTicks ?? niceTicks(y[0], y[1], Math.max(3, Math.round(H / 60)));
  const localRef = useRef<SVGSVGElement>(null);
  const ref = svgRef ?? localRef;
  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className={`chart ${className ?? ''}`}
      role="img"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown && ((e) => onPointerDown(e, s))}
      onPointerMove={onPointerMove && ((e) => onPointerMove(e, s))}
      onPointerUp={onPointerUp && ((e) => onPointerUp(e, s))}
      onPointerLeave={onPointerUp && ((e) => onPointerUp(e, s))}
    >
      <defs>
        <clipPath id={clip}>
          <rect x={s.left} y={s.top} width={s.right - s.left} height={s.bottom - s.top} />
        </clipPath>
      </defs>
      <rect className="chart-bg" x={s.left} y={s.top} width={s.right - s.left} height={s.bottom - s.top} />
      {grid && (
        <g className="chart-grid">
          {xt.map((t) => (
            <line key={`gx${t}`} x1={s.x(t)} x2={s.x(t)} y1={s.top} y2={s.bottom} />
          ))}
          {yt.map((t) => (
            <line key={`gy${t}`} y1={s.y(t)} y2={s.y(t)} x1={s.left} x2={s.right} />
          ))}
        </g>
      )}
      <g className="chart-axis">
        <line x1={s.left} x2={s.right} y1={s.bottom} y2={s.bottom} />
        <line x1={s.left} x2={s.left} y1={s.top} y2={s.bottom} />
        {xt.map((t) => (
          <text key={`tx${t}`} x={s.x(t)} y={s.bottom + 15} textAnchor="middle">
            {xTickFormat(t)}
          </text>
        ))}
        {yt.map((t) => (
          <text key={`ty${t}`} x={s.left - 6} y={s.y(t) + 4} textAnchor="end">
            {yTickFormat(t)}
          </text>
        ))}
        {xLabel && (
          <text className="chart-label" x={(s.left + s.right) / 2} y={H - 4} textAnchor="middle">
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            className="chart-label"
            transform={`translate(12 ${(s.top + s.bottom) / 2}) rotate(-90)`}
            textAnchor="middle"
          >
            {yLabel}
          </text>
        )}
      </g>
      <g clipPath={`url(#${clip})`}>{children(s)}</g>
      {overlay && <g>{overlay(s)}</g>}
    </svg>
  );
}

/** Convert a pointer event to the SVG's viewBox coordinates. */
export function svgPoint(svg: SVGSVGElement, e: { clientX: number; clientY: number }) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm.inverse());
  return { x: p.x, y: p.y };
}

/** Build an SVG path through sample points, breaking at non-finite values. */
export function pathOf(pts: [number, number][]): string {
  let d = '';
  let pen = false;
  for (const [px, py] of pts) {
    if (!Number.isFinite(px) || !Number.isFinite(py) || Math.abs(py) > 1e6) {
      pen = false;
      continue;
    }
    d += `${pen ? 'L' : 'M'}${px.toFixed(2)},${py.toFixed(2)}`;
    pen = true;
  }
  return d;
}

/** A small legend row rendered as HTML under a chart. */
export function Legend({ items }: { items: { label: ReactNode; cls: string; shape?: 'line' | 'dot' | 'dash' | 'box' }[] }) {
  return (
    <div className="legend">
      {items.map((it, i) => (
        <span key={i} className="legend-item">
          <svg width="22" height="12" aria-hidden>
            {it.shape === 'dot' ? (
              <circle cx="11" cy="6" r="4.5" className={it.cls} />
            ) : it.shape === 'box' ? (
              <rect x="4" y="1" width="14" height="10" className={it.cls} />
            ) : (
              <line x1="1" x2="21" y1="6" y2="6" className={it.cls} strokeDasharray={it.shape === 'dash' ? '4 3' : undefined} />
            )}
          </svg>
          {it.label}
        </span>
      ))}
    </div>
  );
}
