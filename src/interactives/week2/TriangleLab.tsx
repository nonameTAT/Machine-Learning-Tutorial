import { useRef, useState } from 'react';
import { Chart, Legend, svgPoint } from '../../components/Chart';
import { Readout, Slider, Toggle } from '../../components/ui';
import { clamp, fmt } from '../../lib/num';
import { minkowski } from '../../lib/classify';
import { P_LIST, pLabel } from './MinkowskiLab';

type Pt = [number, number];
const NAMES = ['a', 'b', 'c'];

/** Test the triangle inequality d(a, c) ≤ d(a, b) + d(b, c) for Minkowski distances and squared Euclidean. */
export function TriangleLab() {
  const [pts, setPts] = useState<Pt[]>([
    [0, 0],
    [1, 0],
    [1, 1],
  ]);
  const [pi, setPi] = useState(1);
  const [squared, setSquared] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const p = P_LIST[pi];
  const d = (u: Pt, v: Pt) => (squared ? minkowski(u, v, 2) ** 2 : minkowski(u, v, p));
  const [a, b, c] = pts;
  const direct = d(a, c);
  const ab = d(a, b);
  const bc = d(b, c);
  const ok = direct <= ab + bc + 1e-9;

  const load = (np: Pt[], sq: boolean, idx: number) => {
    setPts(np);
    setSquared(sq);
    setPi(idx);
  };

  return (
    <div className="lab-grid">
      <div>
        <Chart
          W={440}
          H={432}
          x={[-1, 3]}
          y={[-1, 3]}
          xLabel="x₁  (drag a, b, c)"
          yLabel="x₂"
          svgRef={ref}
          className="draggable"
          ariaLabel="Three points and the triangle inequality"
          onPointerMove={(e, s) => {
            if (drag === null || !ref.current) return;
            const q = svgPoint(ref.current, e);
            const np: Pt = [Math.round(clamp(s.ix(q.x), -0.9, 2.9) * 10) / 10, Math.round(clamp(s.iy(q.y), -0.9, 2.9) * 10) / 10];
            setPts((prev) => prev.map((x, i) => (i === drag ? np : x)));
          }}
          onPointerUp={() => setDrag(null)}
        >
          {(s) => {
            const mid = (u: Pt, v: Pt) => [s.x((u[0] + v[0]) / 2), s.y((u[1] + v[1]) / 2)];
            const [m1x, m1y] = mid(a, c);
            const [m2x, m2y] = mid(a, b);
            const [m3x, m3y] = mid(b, c);
            return (
              <>
                <line x1={s.x(a[0])} y1={s.y(a[1])} x2={s.x(b[0])} y2={s.y(b[1])} className="ln-alt" />
                <line x1={s.x(b[0])} y1={s.y(b[1])} x2={s.x(c[0])} y2={s.y(c[1])} className="ln-alt" />
                <line x1={s.x(a[0])} y1={s.y(a[1])} x2={s.x(c[0])} y2={s.y(c[1])} className={ok ? 'ln-fit' : 'ln-res'} strokeWidth={3} />
                <text x={m1x - 14} y={m1y - 8} className="anno-strong" textAnchor="end">
                  {fmt(direct, 3)}
                </text>
                <text x={m2x} y={m2y + 18} className="anno" textAnchor="middle">
                  {fmt(ab, 3)}
                </text>
                <text x={m3x + 10} y={m3y + 4} className="anno">
                  {fmt(bc, 3)}
                </text>
                {pts.map((q, i) => (
                  <g key={i}>
                    <circle
                      cx={s.x(q[0])}
                      cy={s.y(q[1])}
                      r={drag === i ? 9 : 7}
                      className={`pt drag ${i === 1 ? 'val' : ''}`}
                      onPointerDown={(e) => {
                        (e.target as Element).setPointerCapture?.(e.pointerId);
                        setDrag(i);
                      }}
                    />
                    <text x={s.x(q[0]) + 10} y={s.y(q[1]) - 9} className="anno-strong">
                      {NAMES[i]}
                    </text>
                  </g>
                ))}
              </>
            );
          }}
        </Chart>
        <Legend
          items={[
            { label: 'direct: d(a, c)', cls: ok ? 'ln-fit' : 'ln-res' },
            { label: 'detour via b', cls: 'ln-alt' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="Minkowski order p" value={pi} min={0} max={P_LIST.length - 1} step={1} onChange={(v) => (setPi(v), setSquared(false))} format={(i) => (squared ? '—' : pLabel(P_LIST[i]))} />
        <Toggle label="Use squared Euclidean distance instead" checked={squared} onChange={setSquared} />
        <Readout
          items={[
            { label: 'd(a, c)', value: fmt(direct, 3), tone: ok ? 'good' : 'bad' },
            { label: 'd(a, b) + d(b, c)', value: fmt(ab + bc, 3) },
          ]}
        />
        <div className={`status ${ok ? 'good' : 'bad'}`}>
          {ok
            ? 'Triangle inequality holds for these three points (that alone proves nothing in general).'
            : 'Violated: the detour is shorter than the direct route. One counterexample is enough — this is not a metric.'}
        </div>
        <div className="btn-row">
          <button
            className="btn"
            onClick={() =>
              load(
                [
                  [0, 0],
                  [1, 0],
                  [1, 1],
                ],
                false,
                1,
              )
            }
          >
            p = ½ counterexample
          </button>
          <button
            className="btn"
            onClick={() =>
              load(
                [
                  [0, 0],
                  [1, 0],
                  [2, 0],
                ],
                true,
                5,
              )
            }
          >
            Squared Euclidean on a line
          </button>
        </div>
      </div>
    </div>
  );
}
