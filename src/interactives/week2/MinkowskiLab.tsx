import { useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../../components/Chart';
import { Slider, Toggle } from '../../components/ui';
import { clamp, fmt, linspace } from '../../lib/num';
import { minkowski } from '../../lib/classify';

export const P_LIST = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 8, Infinity];
export const pLabel = (p: number) => (p === Infinity ? '∞' : p === 0.5 ? '½' : p === 0.25 ? '¼' : p === 0.75 ? '¾' : String(p));

/** Points u/‖u‖_p for directions u round the circle: the boundary of the p-ball of radius r about c. */
export function pBall(c: [number, number], r: number, p: number, n = 240): [number, number][] {
  return linspace(0, 2 * Math.PI, n).map((t) => {
    const u = [Math.cos(t), Math.sin(t)];
    const nrm = minkowski(u, [0, 0], p);
    return [c[0] + (r * u[0]) / nrm, c[1] + (r * u[1]) / nrm];
  });
}

type Pt = [number, number];
const NAMES = ['A', 'B', 'C'];

export function MinkowskiLab() {
  const [pi, setPi] = useState(5);
  const [q, setQ] = useState<Pt>([0, 0]);
  const [cands, setCands] = useState<Pt[]>([
    [2.5, 0],
    [1.6, 1.6],
    [-1.2, -2.4],
  ]);
  const [refs, setRefs] = useState(true);
  const [drag, setDrag] = useState<number | 'q' | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const p = P_LIST[pi];
  const cols: { label: string; p: number }[] = [
    { label: 'd₁', p: 1 },
    { label: 'd₂', p: 2 },
    { label: 'd∞', p: Infinity },
    { label: 'mismatches', p: 0 },
    { label: `current p = ${pLabel(p)}`, p },
  ];
  const D = cands.map((c) => cols.map((col) => minkowski(c, q, col.p)));
  const best = cols.map((_, j) => Math.min(...D.map((row) => row[j])));
  const cur = D.map((row) => row[cols.length - 1]);
  const nearest = cur.indexOf(Math.min(...cur));
  const r = cur[nearest];

  const move = (e: { clientX: number; clientY: number }, s: { ix: (v: number) => number; iy: (v: number) => number }) => {
    if (drag === null || !ref.current) return;
    const c = svgPoint(ref.current, e);
    const pt: Pt = [Math.round(clamp(s.ix(c.x), -3.9, 3.9) * 10) / 10, Math.round(clamp(s.iy(c.y), -3.9, 3.9) * 10) / 10];
    if (drag === 'q') setQ(pt);
    else setCands((prev) => prev.map((x, i) => (i === drag ? pt : x)));
  };

  return (
    <div className="lab-grid">
      <div>
        <Chart
          W={440}
          H={432}
          x={[-4, 4]}
          y={[-4, 4]}
          xLabel="x₁  (drag the query or any candidate)"
          yLabel="x₂"
          svgRef={ref}
          className="draggable"
          ariaLabel="Minkowski distance ball about the query"
          onPointerMove={(e, s) => move(e, s)}
          onPointerUp={() => setDrag(null)}
        >
          {(s) => {
            const down = (id: number | 'q') => (e: React.PointerEvent<SVGElement>) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              setDrag(id);
            };
            return (
              <>
                {refs &&
                  [1, 2, Infinity].map((rp) => <path key={rp} d={pathOf(pBall(q, r, rp).map(([a, b]) => [s.x(a), s.y(b)])) + 'Z'} className="ln-ghost" strokeWidth={1} />)}
                <path d={pathOf(pBall(q, r, p).map(([a, b]) => [s.x(a), s.y(b)])) + 'Z'} className="area-pen" />
                {cands.map((c, i) => (
                  <g key={i}>
                    <line x1={s.x(q[0])} y1={s.y(q[1])} x2={s.x(c[0])} y2={s.y(c[1])} stroke={i === nearest ? 'var(--c-res)' : 'var(--line)'} strokeWidth={i === nearest ? 2 : 1} />
                    <circle cx={s.x(c[0])} cy={s.y(c[1])} r={drag === i ? 9 : 7} className={`pt drag ${i === nearest ? 'hi' : ''}`} onPointerDown={down(i)} />
                    <text x={s.x(c[0]) + 10} y={s.y(c[1]) - 8} className="anno-strong">
                      {NAMES[i]}
                    </text>
                  </g>
                ))}
                <circle cx={s.x(q[0])} cy={s.y(q[1])} r={drag === 'q' ? 9 : 7} className="mark-acc" style={{ cursor: 'grab' }} onPointerDown={down('q')} />
              </>
            );
          }}
        </Chart>
        <Legend
          items={[
            { label: `ball of the current p through the nearest candidate`, cls: 'area-pen', shape: 'box' },
            ...(refs ? [{ label: 'p = 1, 2, ∞ balls of the same radius', cls: 'ln-ghost', shape: 'dash' as const }] : []),
            { label: 'nearest under current p', cls: 'pt hi', shape: 'dot' },
            { label: 'query', cls: 'mark-acc', shape: 'dot' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="order p" value={pi} min={0} max={P_LIST.length - 1} step={1} onChange={setPi} format={(i) => pLabel(P_LIST[i])} />
        <Toggle label="Show p = 1, 2, ∞ for comparison" checked={refs} onChange={setRefs} />
        <div className="table-wrap num">
          <table>
            <thead>
              <tr>
                <th />
                {cols.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {D.map((row, i) => (
                <tr key={i}>
                  <td>{NAMES[i]}</td>
                  {row.map((v, j) => (
                    <td key={j} style={{ fontWeight: v === best[j] ? 700 : 400, color: v === best[j] ? 'var(--c-res)' : undefined }}>
                      {fmt(v, 3)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          Bold = nearest in that column. The shaded shape is every point at the same distance from the query as the nearest candidate — the nearest
          candidate is the first one the growing ball touches.
        </p>
      </div>
    </div>
  );
}
