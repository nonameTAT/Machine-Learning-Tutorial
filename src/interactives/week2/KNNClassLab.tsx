import { useMemo, useRef, useState } from 'react';
import { Chart, Legend, svgPoint } from '../../components/Chart';
import { Readout, Segmented, Slider, Toggle } from '../../components/ui';
import { clamp, fmt, rng, type Vec } from '../../lib/num';
import { neighbours, vote, type Label } from '../../lib/classify';
import { CLASS_LEGEND, ClassPt, Regions, labelGrid } from './common';

/** Shared 2-D dataset for lessons 14, 16 and 17: a wavy true boundary, then label noise (9 of the 50 labels end up flipped). */
export const KNN_XD: [number, number] = [0, 10];
export const KNN_YD: [number, number] = [0, 7];
export function knnData(seed = 12, m = 50) {
  const r = rng(seed);
  const X: Vec[] = [];
  const y: Label[] = [];
  for (let i = 0; i < m; i++) {
    const a = r.range(0.2, 9.8);
    const b = r.range(0.2, 6.8);
    let c: Label = b > 3.5 + 1.6 * Math.sin(0.9 * a) ? 1 : 0;
    if (r.uniform() < 0.1) c = c === 1 ? 0 : 1;
    X.push([Math.round(a * 10) / 10, Math.round(b * 10) / 10]);
    y.push(c);
  }
  return { X, y };
}
export const trueBoundary = (a: number) => 3.5 + 1.6 * Math.sin(0.9 * a);

// Worked trace: 1-NN → 1, 3-NN → 0, weighted 3-NN → 1 at x_q = 2.8
const TRACE = { X: [[0, 0], [1, 0], [2, 0], [4, 0], [5, 0]] as Vec[], y: [0, 0, 1, 0, 1] as Label[] };

type Mode = 'trace' | '2d';

export function KNNClassLab() {
  const [mode, setMode] = useState<Mode>('trace');
  const data2 = useMemo(() => knnData(), []);
  const D = mode === 'trace' ? TRACE : data2;
  const [q, setQ] = useState<[number, number]>([2.8, 0]);
  const [k, setK] = useState(3);
  const [weighted, setWeighted] = useState(false);
  const [regions, setRegions] = useState(false);
  const [drag, setDrag] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const xd: [number, number] = mode === 'trace' ? [-0.5, 6] : KNN_XD;
  const yd: [number, number] = mode === 'trace' ? [-1, 1] : KNN_YD;
  const kk = Math.min(k, D.X.length);
  const nb = neighbours(D.X, q, kk);
  const v = vote(nb, D.y, weighted);
  const radius = nb[nb.length - 1].d;
  const fracPos = nb.filter((n) => D.y[n.i] === 1).length / nb.length;
  const nbSet = new Set(nb.map((n) => n.i));
  const NX = 60;
  const NY = 42;
  const grid = useMemo(
    () => (regions && mode === '2d' ? labelGrid(xd, yd, NX, NY, (a, b) => vote(neighbours(D.X, [a, b], kk), D.y, weighted).winner) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [regions, mode, kk, weighted],
  );

  const load = (m: Mode) => {
    setMode(m);
    setQ(m === 'trace' ? [2.8, 0] : [4.2, 3.6]);
    setK(m === 'trace' ? 3 : 5);
  };
  const move = (e: { clientX: number; clientY: number }, s: { ix: (v: number) => number; iy: (v: number) => number }) => {
    if (!ref.current) return;
    const c = svgPoint(ref.current, e);
    const a = Math.round(clamp(s.ix(c.x), xd[0], xd[1]) * 10) / 10;
    const b = mode === 'trace' ? 0 : Math.round(clamp(s.iy(c.y), yd[0], yd[1]) * 10) / 10;
    setQ([a, b]);
  };

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'trace', label: '1-D trace' },
            { value: '2d', label: '2-D data with label noise' },
          ]}
          value={mode}
          onChange={load}
        />
      </div>
      <div className="lab-grid">
        <div>
          <Chart
            W={560}
            H={mode === 'trace' ? 170 : 402}
            x={xd}
            y={yd}
            yTicks={mode === 'trace' ? [] : undefined}
            xLabel="x₁  (drag to move the query)"
            yLabel={mode === 'trace' ? undefined : 'x₂'}
            svgRef={ref}
            className="draggable"
            ariaLabel="k-nearest-neighbour vote"
            onPointerDown={(e, s) => {
              ref.current?.setPointerCapture?.(e.pointerId);
              setDrag(true);
              move(e, s);
            }}
            onPointerMove={(e, s) => drag && move(e, s)}
            onPointerUp={() => setDrag(false)}
          >
            {(s) => (
              <>
                {regions && mode === '2d' && <Regions s={s} grid={grid} nx={NX} ny={NY} />}
                {mode === 'trace' ? (
                  <rect x={s.x(q[0] - radius)} width={s.x(q[0] + radius) - s.x(q[0] - radius)} y={s.top} height={s.bottom - s.top} fill="var(--accent-soft)" />
                ) : (
                  <circle cx={s.x(q[0])} cy={s.y(q[1])} r={s.x(radius) - s.x(0)} className="ring-q" />
                )}
                {nb.map((n) => (
                  <line key={`l${n.i}`} x1={s.x(q[0])} y1={s.y(q[1])} x2={s.x(D.X[n.i][0])} y2={s.y(D.X[n.i][1])} stroke="var(--accent)" strokeOpacity={0.5} />
                ))}
                {D.X.map((x, i) => (
                  <g key={i} opacity={nbSet.has(i) ? 1 : 0.45}>
                    {nbSet.has(i) && <circle cx={s.x(x[0])} cy={s.y(x[1])} r={11} fill="none" stroke="var(--accent)" strokeWidth={2} />}
                    <ClassPt cx={s.x(x[0])} cy={s.y(x[1])} y={D.y[i]} r={mode === 'trace' ? 7 : 5.5} />
                    {mode === 'trace' && (
                      <text x={s.x(x[0])} y={s.y(x[1]) + 26} textAnchor="middle" className="anno">
                        {x[0]}
                      </text>
                    )}
                  </g>
                ))}
                <circle cx={s.x(q[0])} cy={s.y(q[1])} r={7} className="mark-acc" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              ...CLASS_LEGEND,
              { label: 'query', cls: 'mark-acc', shape: 'dot' },
              { label: `the ${kk} nearest`, cls: 'ring-q', shape: 'dot' },
              ...(regions && mode === '2d' ? [{ label: 'predicted region', cls: 'rg-pos', shape: 'box' as const }] : []),
            ]}
          />
        </div>
        <div className="controls">
          <Slider label="neighbours k" value={k} min={1} max={mode === 'trace' ? 5 : 25} step={1} onChange={setK} />
          <Toggle label="Distance-weighted vote (w = 1/d²)" checked={weighted} onChange={setWeighted} />
          {mode === '2d' && <Toggle label="Shade the predicted regions" checked={regions} onChange={setRegions} />}
          <Readout
            items={[
              { label: weighted ? 'weight for class 1' : 'votes for class 1', value: fmt(v.tally[1], 3) },
              { label: weighted ? 'weight for class 0' : 'votes for class 0', value: fmt(v.tally[0], 3) },
              { label: 'prediction', value: v.winner === 1 ? 'positive (1)' : 'negative (0)', tone: 'accent' },
              { label: 'fraction positive', value: fmt(fracPos, 3) },
            ]}
          />
          {(v.tie || v.exact) && (
            <div className="status bad">
              {v.exact ? 'The query coincides with a training point (distance 0): 1/d² is undefined, so only the exact matches vote. ' : ''}
              {v.tie ? 'Tied vote — broken in favour of the nearest neighbour’s class.' : ''}
            </div>
          )}
          <div className="table-wrap num" style={{ maxHeight: 220, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>rank</th>
                  <th>point</th>
                  <th>distance</th>
                  <th>label</th>
                  {weighted && <th>weight 1/d²</th>}
                </tr>
              </thead>
              <tbody>
                {nb.map((n, r) => (
                  <tr key={n.i}>
                    <td>{r + 1}</td>
                    <td>{mode === 'trace' ? D.X[n.i][0] : `(${fmt(D.X[n.i][0], 1)}, ${fmt(D.X[n.i][1], 1)})`}</td>
                    <td>{fmt(n.d, 3)}</td>
                    <td>{D.y[n.i]}</td>
                    {weighted && <td>{v.exact ? (n.d === 0 ? 'exact' : '—') : fmt(v.weights[r], 4)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
