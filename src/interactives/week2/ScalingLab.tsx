import { useMemo, useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../../components/Chart';
import { Readout, Segmented, Slider } from '../../components/ui';
import { clamp, fmt, linspace, mean, rng, type Vec } from '../../lib/num';
import { euclid, loocvError, neighbours, vote, type Label } from '../../lib/classify';
import { CLASS_LEGEND, ClassPt } from './common';

type Scale = 'raw' | 'minmax' | 'z';
const XD: [number, number] = [18, 72];
const YD: [number, number] = [15000, 125000];

// Age (years) decides the class; income (dollars) is on a far larger scale and unrelated.
const DATA = (() => {
  const r = rng(23);
  const X: Vec[] = [];
  const y: Label[] = [];
  for (let i = 0; i < 40; i++) {
    const age = Math.round(r.range(20, 70));
    const inc = Math.round(r.range(20000, 120000) / 500) * 500;
    X.push([age, inc]);
    y.push(age + 4 * r.normal() > 45 ? 1 : 0);
  }
  return { X, y };
})();

/** Scaling statistics, fitted on the training data. */
const STATS = (() => {
  const col = (j: number) => DATA.X.map((x) => x[j]);
  return [0, 1].map((j) => {
    const v = col(j);
    const mu = mean(v);
    return { min: Math.min(...v), max: Math.max(...v), mu, sd: Math.sqrt(mean(v.map((t) => (t - mu) ** 2))) };
  });
})();

/** Per-feature divisor: distance in this scale = Euclidean distance after dividing each coordinate difference by it. */
const unit = (sc: Scale, j: number) => (sc === 'raw' ? 1 : sc === 'minmax' ? STATS[j].max - STATS[j].min : STATS[j].sd);
const transform = (sc: Scale) => (x: Vec): Vec => (sc === 'raw' ? x : x.map((v, j) => (v - (sc === 'minmax' ? STATS[j].min : STATS[j].mu)) / unit(sc, j)));

export function ScalingLab() {
  const [sc, setSc] = useState<Scale>('raw');
  const [k, setK] = useState(3);
  const [q, setQ] = useState<[number, number]>([50, 60000]);
  const [drag, setDrag] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const T = transform(sc);
  const TX = useMemo(() => DATA.X.map(T), [sc]); // eslint-disable-line react-hooks/exhaustive-deps
  const nb = neighbours(TX, T(q), k, euclid);
  const v = vote(nb, DATA.y, false);
  const r = nb[nb.length - 1].d;
  const nbSet = new Set(nb.map((n) => n.i));
  const acc = useMemo(
    () => (['raw', 'minmax', 'z'] as Scale[]).map((s2) => 1 - loocvError(DATA.X.map(transform(s2)), DATA.y, k)),
    [k],
  );
  const move = (e: { clientX: number; clientY: number }, s: { ix: (v: number) => number; iy: (v: number) => number }) => {
    if (!ref.current) return;
    const c = svgPoint(ref.current, e);
    setQ([Math.round(clamp(s.ix(c.x), 20, 70)), Math.round(clamp(s.iy(c.y), 20000, 120000) / 500) * 500]);
  };
  // the set of points at distance r from the query, drawn in raw units
  const ellipse = linspace(0, 2 * Math.PI, 160).map((t) => [q[0] + r * unit(sc, 0) * Math.cos(t), q[1] + r * unit(sc, 1) * Math.sin(t)] as [number, number]);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'raw', label: 'Raw units' },
            { value: 'minmax', label: 'Min-max' },
            { value: 'z', label: 'Z-score' },
          ]}
          value={sc}
          onChange={setSc}
        />
      </div>
      <div className="lab-grid">
        <div>
          <Chart
            W={520}
            H={420}
            x={XD}
            y={YD}
            xLabel="age (years)"
            yLabel="income ($)"
            yTickFormat={(t) => `${t / 1000}k`}
            margin={{ l: 52, r: 14, t: 14, b: 38 }}
            svgRef={ref}
            className="draggable"
            ariaLabel="k-NN neighbourhood under different feature scalings"
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
                <path d={pathOf(ellipse.map(([a, b]) => [s.x(a), s.y(b)])) + 'Z'} fill="var(--accent-soft)" stroke="var(--accent)" strokeDasharray="4 3" />
                {nb.map((n) => (
                  <line key={n.i} x1={s.x(q[0])} y1={s.y(q[1])} x2={s.x(DATA.X[n.i][0])} y2={s.y(DATA.X[n.i][1])} stroke="var(--accent)" strokeOpacity={0.6} />
                ))}
                {DATA.X.map((x, i) => (
                  <g key={i} opacity={nbSet.has(i) ? 1 : 0.5}>
                    {nbSet.has(i) && <circle cx={s.x(x[0])} cy={s.y(x[1])} r={10} fill="none" stroke="var(--accent)" strokeWidth={2} />}
                    <ClassPt cx={s.x(x[0])} cy={s.y(x[1])} y={DATA.y[i]} />
                  </g>
                ))}
                <circle cx={s.x(q[0])} cy={s.y(q[1])} r={7} className="mark-acc" />
              </>
            )}
          </Chart>
          <Legend items={[...CLASS_LEGEND, { label: 'points as close as the k-th neighbour', cls: 'ring-q', shape: 'dot' }, { label: 'query (drag)', cls: 'mark-acc', shape: 'dot' }]} />
        </div>
        <div className="controls">
          <Slider label="neighbours k" value={k} min={1} max={9} step={1} onChange={setK} />
          <Readout
            items={[
              { label: 'query', value: `${q[0]} y, $${(q[1] / 1000).toFixed(1)}k` },
              { label: 'prediction', value: v.winner === 1 ? 'positive' : 'negative', tone: 'accent' },
            ]}
          />
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th>scaling</th>
                  <th>LOOCV accuracy ({k}-NN)</th>
                </tr>
              </thead>
              <tbody>
                {(['raw', 'minmax', 'z'] as Scale[]).map((s2, i) => (
                  <tr key={s2} style={{ background: s2 === sc ? 'var(--accent-soft)' : undefined }}>
                    <td>{s2 === 'raw' ? 'raw units' : s2 === 'minmax' ? 'min-max' : 'z-score'}</td>
                    <td>{fmt(acc[i], 3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="small muted">
            Training statistics: age {STATS[0].min}–{STATS[0].max} (sd {fmt(STATS[0].sd, 3)}); income ${STATS[1].min / 1000}k–${STATS[1].max / 1000}k (sd $
            {fmt(STATS[1].sd / 1000, 3)}k). In this data the class depends on age only.
          </p>
        </div>
      </div>
    </div>
  );
}
