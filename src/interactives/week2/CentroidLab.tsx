import { useMemo, useRef, useState } from 'react';
import { Chart, Legend, svgPoint } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Segmented } from '../../components/ui';
import { clamp, fmt } from '../../lib/num';
import type { Label } from '../../lib/classify';
import { Arrow, CLASS_LEGEND, ClassPt, Regions, labelGrid } from './common';

type P = [number, number, Label];
type Preset = 'worked' | 'compact' | 'multimodal';

const PRESETS: Record<Preset, { pts: P[]; q: [number, number] }> = {
  // Worked example: p = (4, 3), n = (1, 1), boundary 3x₁ + 2x₂ = 11.5
  worked: {
    pts: [
      [3, 3, 1],
      [5, 3, 1],
      [1, 0, 0],
      [1, 2, 0],
    ],
    q: [2, 3],
  },
  compact: {
    pts: [
      [5.8, 5.6, 1],
      [7.2, 4.6, 1],
      [6.4, 6.4, 1],
      [7.8, 5.8, 1],
      [6.0, 4.2, 1],
      [7.0, 6.9, 1],
      [2.2, 2.4, 0],
      [3.4, 1.6, 0],
      [2.8, 3.4, 0],
      [3.8, 2.8, 0],
      [1.8, 1.4, 0],
      [3.0, 2.0, 0],
    ],
    q: [5, 4],
  },
  // one class in two clumps: its mean lands between them, near the other class's mean
  multimodal: {
    pts: [
      [4.6, 3.6, 1],
      [5.4, 4.4, 1],
      [5.0, 3.0, 1],
      [5.6, 3.6, 1],
      [4.4, 4.6, 1],
      [5.2, 5.0, 1],
      [1.2, 3.6, 0],
      [1.8, 4.4, 0],
      [1.4, 2.8, 0],
      [8.6, 3.6, 0],
      [8.2, 4.6, 0],
      [8.8, 2.8, 0],
    ],
    q: [2, 6.5],
  },
};

const XD: [number, number] = [-0.5, 10.5];
const YD: [number, number] = [-0.5, 8];
const NX = 55;
const NY = 42;

const meanOf = (pts: P[], c: Label): [number, number] | null => {
  const q = pts.filter((p) => p[2] === c);
  if (!q.length) return null;
  return [q.reduce((s, p) => s + p[0], 0) / q.length, q.reduce((s, p) => s + p[1], 0) / q.length];
};

/** The basic linear classifier: boundary halfway between the class means, perpendicular to p − n. */
export function CentroidLab({ initial = 'worked' }: { initial?: Preset }) {
  const [preset, setPreset] = useState<Preset>(initial);
  const [pts, setPts] = useState<P[]>(PRESETS[initial].pts);
  const [q, setQ] = useState<[number, number]>(PRESETS[initial].q);
  const [drag, setDrag] = useState<number | 'q' | null>(null);
  const ref = useRef<SVGSVGElement>(null);

  const p = meanOf(pts, 1)!;
  const n = meanOf(pts, 0)!;
  const w: [number, number] = [p[0] - n[0], p[1] - n[1]];
  const t = (p[0] ** 2 + p[1] ** 2 - n[0] ** 2 - n[1] ** 2) / 2;
  const a: [number, number] = [(p[0] + n[0]) / 2, (p[1] + n[1]) / 2];
  const wNorm = Math.hypot(w[0], w[1]);
  const degenerate = wNorm < 1e-9;
  const score = (x: number, y: number) => x * w[0] + y * w[1];
  const predict = (x: number, y: number): Label => (score(x, y) >= t ? 1 : 0);
  const sq = (u: [number, number], v: [number, number]) => (u[0] - v[0]) ** 2 + (u[1] - v[1]) ** 2;
  const correct = pts.filter((pt) => !degenerate && predict(pt[0], pt[1]) === pt[2]).length;

  const key = pts.map((pt) => pt.join(',')).join(';');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const grid = useMemo(() => (degenerate ? [] : labelGrid(XD, YD, NX, NY, predict)), [key]);

  const load = (pr: Preset) => {
    setPreset(pr);
    setPts(PRESETS[pr].pts);
    setQ(PRESETS[pr].q);
  };

  const moveTo = (e: { clientX: number; clientY: number }, s: { ix: (v: number) => number; iy: (v: number) => number }, target: number | 'q') => {
    if (!ref.current) return;
    const c = svgPoint(ref.current, e);
    const x = Math.round(clamp(s.ix(c.x), XD[0], XD[1]) * 10) / 10;
    const y = Math.round(clamp(s.iy(c.y), YD[0], YD[1]) * 10) / 10;
    if (target === 'q') setQ([x, y]);
    else setPts((prev) => prev.map((pt, i) => (i === target ? [x, y, pt[2]] : pt)));
  };

  const sQ = score(q[0], q[1]);
  const dp = sq(q, p);
  const dn = sq(q, n);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'worked', label: 'Worked example' },
            { value: 'compact', label: 'Compact classes' },
            { value: 'multimodal', label: 'Two-clump class' },
          ]}
          value={preset}
          onChange={load}
        />
      </div>
      <div className="lab-grid">
        <div>
          <Chart
            W={560}
            H={438}
            x={XD}
            y={YD}
            xLabel="x₁ (lightness)   — drag points, or click to move the query"
            yLabel="x₂ (width)"
            svgRef={ref}
            className="draggable"
            ariaLabel="Two classes, their means and the basic linear classifier"
            onPointerDown={(e, s) => {
              ref.current?.setPointerCapture?.(e.pointerId);
              setDrag('q');
              moveTo(e, s, 'q');
            }}
            onPointerMove={(e, s) => drag !== null && moveTo(e, s, drag)}
            onPointerUp={() => setDrag(null)}
          >
            {(s) => {
              const dir = degenerate ? [0, 0] : [-w[1] / wNorm, w[0] / wNorm];
              const L = 40;
              return (
                <>
                  {!degenerate && <Regions s={s} grid={grid} nx={NX} ny={NY} />}
                  {!degenerate && (
                    <line x1={s.x(a[0] - L * dir[0])} y1={s.y(a[1] - L * dir[1])} x2={s.x(a[0] + L * dir[0])} y2={s.y(a[1] + L * dir[1])} className="ln-fit" />
                  )}
                  <line x1={s.x(n[0])} y1={s.y(n[1])} x2={s.x(p[0])} y2={s.y(p[1])} className="ln-ghost" />
                  {!degenerate && (
                    <Arrow x1={s.x(a[0])} y1={s.y(a[1])} x2={s.x(a[0] + (1.4 * w[0]) / wNorm)} y2={s.y(a[1] + (1.4 * w[1]) / wNorm)} />
                  )}
                  {pts.map(([x, y, c], i) => {
                    const wrong = !degenerate && predict(x, y) !== c;
                    return (
                      <g key={i}>
                        {wrong && <circle cx={s.x(x)} cy={s.y(y)} r={10} className="ring-miss" />}
                        <ClassPt
                          cx={s.x(x)}
                          cy={s.y(y)}
                          y={c}
                          r={drag === i ? 8 : 6.5}
                          className="drag"
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            (e.target as Element).setPointerCapture?.(e.pointerId);
                            setDrag(i);
                          }}
                        />
                      </g>
                    );
                  })}
                  <line x1={s.x(q[0])} y1={s.y(q[1])} x2={s.x(p[0])} y2={s.y(p[1])} stroke="var(--c-pos)" strokeDasharray="2 3" />
                  <line x1={s.x(q[0])} y1={s.y(q[1])} x2={s.x(n[0])} y2={s.y(n[1])} stroke="var(--c-neg)" strokeDasharray="2 3" />
                  <circle cx={s.x(p[0])} cy={s.y(p[1])} r={9} fill="var(--surface)" stroke="var(--c-pos)" strokeWidth={3} />
                  <rect x={s.x(n[0]) - 8} y={s.y(n[1]) - 8} width={16} height={16} fill="var(--surface)" stroke="var(--c-neg)" strokeWidth={3} />
                  <text x={s.x(p[0]) + 12} y={s.y(p[1]) - 8} className="anno-strong">p</text>
                  <text x={s.x(n[0]) + 12} y={s.y(n[1]) - 8} className="anno-strong">n</text>
                  <circle cx={s.x(a[0])} cy={s.y(a[1])} r={3.5} fill="var(--ink)" />
                  <circle cx={s.x(q[0])} cy={s.y(q[1])} r={7} className="mark-acc" />
                </>
              );
            }}
          </Chart>
          <Legend
            items={[
              ...CLASS_LEGEND,
              { label: 'boundary xᵀw = t', cls: 'ln-fit' },
              { label: 'w = p − n (from the midpoint)', cls: 'ln-w' },
              { label: 'misclassified', cls: 'ring-miss', shape: 'dot' },
              { label: 'query', cls: 'mark-acc', shape: 'dot' },
            ]}
          />
        </div>
        <div className="controls">
          <Readout
            items={[
              { label: 'p (positive mean)', value: `(${fmt(p[0], 2)}, ${fmt(p[1], 2)})` },
              { label: 'n (negative mean)', value: `(${fmt(n[0], 2)}, ${fmt(n[1], 2)})` },
              { label: 'w = p − n', value: `(${fmt(w[0], 2)}, ${fmt(w[1], 2)})` },
              { label: 't = (‖p‖² − ‖n‖²)/2', value: fmt(t, 3) },
            ]}
          />
          <div className="panel-title">
            Query <M t={`\\bx = (${fmt(q[0], 1)}, ${fmt(q[1], 1)})`} />
          </div>
          <Readout
            items={[
              { label: 'score xᵀw', value: fmt(sQ, 3), tone: 'accent' },
              { label: 'compare with t', value: degenerate ? 'tie' : sQ > t ? '> t' : sQ < t ? '< t' : '= t (tie)' },
              { label: '‖x − p‖²', value: fmt(dp, 3) },
              { label: '‖x − n‖²', value: fmt(dn, 3) },
            ]}
          />
          <div className={`status ${degenerate ? 'bad' : ''}`}>
            {degenerate
              ? 'The class means coincide: w = 0, so every query ties. One mean per class has thrown away what distinguishes them.'
              : `Score ${sQ > t ? 'above' : sQ < t ? 'below' : 'equal to'} t ⇔ ${dp < dn ? 'closer to p' : dp > dn ? 'closer to n' : 'equidistant'}: predict ${
                  sQ >= t ? 'positive' : 'negative'
                }. Training accuracy ${correct}/${pts.length}.`}
          </div>
          <p className="small muted">The chart uses equal scales on both axes, so “perpendicular” and “closer” look the way they are.</p>
        </div>
      </div>
    </div>
  );
}
