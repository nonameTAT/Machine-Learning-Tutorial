import { useMemo, useRef, useState, type PointerEvent } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../components/Chart';
import { Readout, Segmented, Slider, Toggle } from '../components/ui';
import { clamp, fmt, linspace, mean, ols1d, rng } from '../lib/num';

const truth = (x: number) => 3 + 2 * Math.sin(0.8 * x) + 0.15 * x;

type Mode = 'mean' | 'local';

function predictAt(pts: [number, number][], xq: number, k: number, mode: Mode) {
  const nb = pts
    .map((p, i) => ({ i, d: Math.abs(p[0] - xq), x: p[0], y: p[1] }))
    .sort((a, b) => a.d - b.d || a.i - b.i)
    .slice(0, k);
  if (mode === 'mean' || k < 2) return { yhat: mean(nb.map((n) => n.y)), nb, line: null as null | { b0: number; b1: number } };
  const fit = ols1d(
    nb.map((n) => n.x),
    nb.map((n) => n.y),
  );
  if (!fit) return { yhat: mean(nb.map((n) => n.y)), nb, line: null };
  return { yhat: fit.b0 + fit.b1 * xq, nb, line: fit };
}

export function KNNLab() {
  const pts = useMemo(() => {
    const r = rng(5);
    return Array.from({ length: 24 }, () => {
      const x = r.range(0, 10);
      return [x, truth(x) + 0.55 * r.normal()] as [number, number];
    });
  }, []);
  const [xq, setXq] = useState(4.2);
  const [k, setK] = useState(3);
  const [mode, setMode] = useState<Mode>('mean');
  const [curve, setCurve] = useState(true);
  const [showTruth, setShowTruth] = useState(false);
  const [drag, setDrag] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const { yhat, nb, line } = predictAt(pts, xq, k, mode);
  const grid = linspace(0, 10, 401);
  const curvePts = curve ? grid.map((g) => [g, predictAt(pts, g, k, mode).yhat] as [number, number]) : [];
  const nbSet = new Set(nb.map((n) => n.i));
  const radius = nb[nb.length - 1].d;

  const move = (e: PointerEvent<SVGSVGElement>, s: { ix: (v: number) => number }) => {
    if (!ref.current) return;
    const p = svgPoint(ref.current, e);
    setXq(Number(clamp(s.ix(p.x), 0, 10).toFixed(2)));
  };

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'mean', label: 'k-NN average' },
            { value: 'local', label: 'Local linear fit' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      <div className="lab-grid">
        <div>
          <Chart
            W={560}
            H={340}
            x={[0, 10]}
            y={[-0.5, 8]}
            xLabel="x  (drag anywhere to move the query)"
            yLabel="y"
            svgRef={ref}
            className="draggable"
            onPointerDown={(e, s) => {
              setDrag(true);
              ref.current?.setPointerCapture?.(e.pointerId);
              move(e, s);
            }}
            onPointerMove={(e, s) => drag && move(e, s)}
            onPointerUp={() => setDrag(false)}
          >
            {(s) => (
              <>
                <rect x={s.x(Math.max(0, xq - radius))} width={s.x(Math.min(10, xq + radius)) - s.x(Math.max(0, xq - radius))} y={s.top} height={s.bottom - s.top} fill="var(--accent-soft)" opacity={0.7} />
                {showTruth && <path d={pathOf(grid.map((g) => [s.x(g), s.y(truth(g))]))} className="ln-truth" />}
                {curve && <path d={pathOf(curvePts.map(([a, b]) => [s.x(a), s.y(b)]))} className="ln-fit" strokeWidth={1.8} />}
                {line && (
                  <line
                    x1={s.x(xq - radius)}
                    x2={s.x(xq + radius)}
                    y1={s.y(line.b0 + line.b1 * (xq - radius))}
                    y2={s.y(line.b0 + line.b1 * (xq + radius))}
                    className="ln-alt"
                  />
                )}
                {nb.map((n) => (
                  <line key={`l${n.i}`} x1={s.x(n.x)} y1={s.y(n.y)} x2={s.x(xq)} y2={s.y(yhat)} stroke="var(--c-res)" strokeOpacity={0.45} />
                ))}
                {pts.map(([x, y], i) => (
                  <circle key={i} cx={s.x(x)} cy={s.y(y)} r={nbSet.has(i) ? 6.5 : 5} className={`pt ${nbSet.has(i) ? 'hi' : 'dim'}`} />
                ))}
                <line x1={s.x(xq)} x2={s.x(xq)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="4 3" />
                <circle cx={s.x(xq)} cy={s.y(yhat)} r={7} className="mark-acc" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'k nearest neighbours', cls: 'pt hi', shape: 'dot' },
              { label: 'prediction at the query', cls: 'mark-acc', shape: 'dot' },
              ...(curve ? [{ label: 'prediction for every x', cls: 'ln-fit' }] : []),
              ...(line ? [{ label: 'local line', cls: 'ln-alt' }] : []),
              ...(showTruth ? [{ label: 'true mean', cls: 'ln-truth', shape: 'dash' as const }] : []),
            ]}
          />
        </div>
        <div className="controls">
          <Slider label="query xq" value={xq} min={0} max={10} step={0.05} onChange={setXq} format={(v) => fmt(v, 2)} />
          <Slider label="neighbours k" value={k} min={1} max={pts.length} step={1} onChange={setK} format={(v) => (v === pts.length ? `${v} (= m)` : String(v))} />
          <Toggle label="Show the whole prediction curve" checked={curve} onChange={setCurve} />
          <Toggle label="Show the true mean" checked={showTruth} onChange={setShowTruth} />
          <Readout
            items={[
              { label: 'prediction ŷ_q', value: fmt(yhat, 3), tone: 'accent' },
              { label: 'neighbourhood radius', value: fmt(radius, 3) },
            ]}
          />
          <div className="table-wrap num" style={{ maxHeight: 180, overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>rank</th>
                  <th>xᵢ</th>
                  <th>distance</th>
                  <th>yᵢ</th>
                </tr>
              </thead>
              <tbody>
                {nb.map((n, r) => (
                  <tr key={n.i}>
                    <td>{r + 1}</td>
                    <td>{fmt(n.x, 2)}</td>
                    <td>{fmt(n.d, 3)}</td>
                    <td>{fmt(n.y, 2)}</td>
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

/* ---------------- feature scale decides who the neighbours are ---------------- */

const HOUSES: [string, number, number, number][] = [
  ['A', 118, 1, 410],
  ['B', 125, 2, 455],
  ['C', 150, 4, 560],
  ['D', 95, 4, 385],
  ['E', 200, 5, 720],
  ['F', 110, 4, 430],
];
const Q = [120, 4];

export function ScaleLab() {
  const [scaled, setScaled] = useState(false);
  const mu = [mean(HOUSES.map((h) => h[1])), mean(HOUSES.map((h) => h[2]))];
  const sd = [1, 2].map((c, i) => Math.sqrt(mean(HOUSES.map((h) => ((h[c] as number) - mu[i]) ** 2))));
  const tr = (v: number, i: number) => (scaled ? (v - mu[i]) / sd[i] : v);
  const dist = HOUSES.map((h) => Math.hypot(tr(h[1], 0) - tr(Q[0], 0), tr(h[2], 1) - tr(Q[1], 1)));
  const order = dist.map((d, i) => [d, i]).sort((a, b) => a[0] - b[0]);
  const nn = new Set([order[0][1], order[1][1]]);
  const pred = mean([...nn].map((i) => HOUSES[i][3]));
  return (
    <div>
      <div className="btn-row">
        <Toggle label="Standardise features (using training mean and std. dev.)" checked={scaled} onChange={setScaled} />
      </div>
      <div className="table-wrap num">
        <table>
          <thead>
            <tr>
              <th>house</th>
              <th>area (m²)</th>
              <th>bedrooms</th>
              <th>price ($k)</th>
              <th>distance to query (120 m², 4 bed)</th>
            </tr>
          </thead>
          <tbody>
            {HOUSES.map((h, i) => (
              <tr key={h[0]} style={{ background: nn.has(i) ? 'var(--accent-soft)' : undefined }}>
                <td>
                  {h[0]} {nn.has(i) && '← 2-NN'}
                </td>
                <td>{scaled ? `${h[1]} → ${fmt(tr(h[1], 0), 2)}` : h[1]}</td>
                <td>{scaled ? `${h[2]} → ${fmt(tr(h[2], 1), 2)}` : h[2]}</td>
                <td>{h[3]}</td>
                <td>{fmt(dist[i], 3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="status">
        2-NN prediction: <strong>${fmt(pred, 1)}k</strong> —{' '}
        {scaled
          ? 'after standardising, one bedroom counts about as much as ~25 m², so the 4-bedroom houses D and F become the neighbours.'
          : 'unscaled, area (spread ≈ 34 m²) swamps bedrooms (spread ≈ 1.4): A and B win despite having 1–2 bedrooms.'}
      </div>
    </div>
  );
}
