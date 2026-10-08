import { useEffect, useMemo, useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Segmented, Slider } from '../../components/ui';
import { fmt, linspace } from '../../lib/num';
import { logGrad1d, logLoss1d, sigmoid, type Label } from '../../lib/classify';
import { CLASS_LEGEND, ClassPt, contourSegments } from './common';

type Preset = 'worked' | 'overlap' | 'separable';
type B = [number, number];

const DATA: Record<Preset, { x: number[]; y: Label[]; b0: [number, number]; b1: [number, number]; alpha: number; xd: [number, number] }> = {
  // Worked example: (0, 0), (1, 1), α = 1, one step from β = 0 gives (0, 0.25)
  worked: { x: [0, 1], y: [0, 1], b0: [-6, 4], b1: [-2, 10], alpha: 1, xd: [-1, 2] },
  overlap: {
    x: [-2.5, -1.8, -1.2, -0.6, -0.2, 0.4, 0.9, 1.5, 2.1, 2.8],
    y: [0, 0, 0, 1, 0, 1, 0, 1, 1, 1],
    b0: [-4, 4],
    b1: [-2, 6],
    alpha: 1,
    xd: [-3, 3],
  },
  separable: {
    x: [-2.5, -1.8, -1.2, -0.6, 0.5, 1.1, 1.8, 2.6],
    y: [0, 0, 0, 0, 1, 1, 1, 1],
    b0: [-6, 6],
    b1: [-2, 14],
    alpha: 1,
    xd: [-3, 3],
  },
};
const LEVELS = [0.02, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 1, 1.3, 1.7, 2.2, 3, 4, 5.5];
const MAX = 6000;

export function LogisticGDLab() {
  const [preset, setPreset] = useState<Preset>('worked');
  const D = DATA[preset];
  const [logA, setLogA] = useState(0);
  const [path, setPath] = useState<B[]>([[0, 0]]);
  const [running, setRunning] = useState(false);
  const ref = useRef<SVGSVGElement>(null);
  const alpha = 10 ** logA;
  const cur = path[path.length - 1];
  const J = (b: B) => logLoss1d(D.x, D.y, b[0], b[1]);
  const g = logGrad1d(D.x, D.y, cur[0], cur[1]);
  const gn = Math.hypot(g[0], g[1]);

  const contours = useMemo(() => {
    const xs = linspace(D.b0[0], D.b0[1], 81);
    const ys = linspace(D.b1[0], D.b1[1], 81);
    const vals = ys.map((b1) => xs.map((b0) => logLoss1d(D.x, D.y, b0, b1)));
    return LEVELS.map((lv) => ({ lv, segs: contourSegments(vals, xs, ys, lv) }));
  }, [D]);

  const reset = (start: B = [0, 0]) => {
    setRunning(false);
    setPath([start]);
  };
  const load = (p: Preset) => {
    setPreset(p);
    setLogA(Math.log10(DATA[p].alpha));
    reset();
  };
  const steps = (n: number) =>
    setPath((prev) => {
      const out = [...prev];
      for (let i = 0; i < n && out.length < MAX; i++) {
        const b = out[out.length - 1];
        const gr = logGrad1d(D.x, D.y, b[0], b[1]);
        // simultaneous update: both components use the old β
        out.push([b[0] - alpha * gr[0], b[1] - alpha * gr[1]]);
      }
      return out;
    });

  useEffect(() => {
    if (!running) return;
    if (gn < 1e-7 || path.length >= MAX) {
      setRunning(false);
      return;
    }
    const id = requestAnimationFrame(() => steps(4));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, path]);

  const grid = linspace(D.xd[0], D.xd[1], 200);
  const correct = D.x.filter((x, j) => (sigmoid(cur[0] + cur[1] * x) >= 0.5 ? 1 : 0) === D.y[j]).length;
  const prev = path.length > 1 ? path[path.length - 2] : null;
  const runaway = preset !== 'overlap' && cur[1] > 6;

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'worked', label: 'Worked example (2 points)' },
            { value: 'overlap', label: 'Overlapping classes' },
            { value: 'separable', label: 'Separable classes' },
          ]}
          value={preset}
          onChange={load}
        />
      </div>
      <div className="lab-grid even">
        <div>
          <div className="panel-title">Contours of J(β) — click to choose a start</div>
          <Chart
            W={420}
            H={360}
            x={D.b0}
            y={D.b1}
            xLabel="β₀ (intercept)"
            yLabel="β₁ (slope)"
            svgRef={ref}
            className="draggable"
            ariaLabel="Contours of the log loss with the gradient-descent path"
            onPointerDown={(e, s) => {
              if (!ref.current) return;
              const c = svgPoint(ref.current, e);
              reset([Number(s.ix(c.x).toFixed(2)), Number(s.iy(c.y).toFixed(2))]);
            }}
          >
            {(s) => (
              <>
                {contours.map(({ lv, segs }) => (
                  <g key={lv}>
                    {segs.map(([a, b, c, d], i) => (
                      <line key={i} x1={s.x(a)} y1={s.y(b)} x2={s.x(c)} y2={s.y(d)} className="contour" />
                    ))}
                  </g>
                ))}
                <path d={pathOf(path.map(([a, b]) => [s.x(a), s.y(b)]))} className="ln-res" />
                {path.length < 60 && path.map(([a, b], i) => <circle key={i} cx={s.x(a)} cy={s.y(b)} r={2.5} fill="var(--c-res)" />)}
                <circle cx={s.x(path[0][0])} cy={s.y(path[0][1])} r={5} className="handle" />
                <circle cx={s.x(cur[0])} cy={s.y(cur[1])} r={6} className="mark" />
              </>
            )}
          </Chart>
        </div>
        <div>
          <div className="panel-title">The fitted probability curve at the current β</div>
          <Chart W={420} H={360} x={D.xd} y={[-0.1, 1.1]} yTicks={[0, 0.5, 1]} xLabel="x" yLabel="P(y = 1 | x)" ariaLabel="Current sigmoid fit">
            {(s) => (
              <>
                <line x1={s.left} x2={s.right} y1={s.y(0.5)} y2={s.y(0.5)} className="ln-ghost" />
                <path d={pathOf(grid.map((x) => [s.x(x), s.y(sigmoid(cur[0] + cur[1] * x))]))} className="ln-fit" />
                {D.x.map((x, j) => (
                  <ClassPt key={j} cx={s.x(x)} cy={s.y(D.y[j])} y={D.y[j]} r={6} />
                ))}
              </>
            )}
          </Chart>
          <Legend items={[...CLASS_LEGEND, { label: 'σ(β₀ + β₁x)', cls: 'ln-fit' }]} />
        </div>
      </div>
      <div className="lab-grid">
        <div>
          <Slider label={<M t="\text{learning rate } \alpha" />} value={logA} min={-2} max={1} step={0.05} onChange={setLogA} format={(v) => fmt(10 ** v, 3)} />
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => steps(1)}>
              1 step
            </button>
            <button className="btn" onClick={() => steps(10)}>
              10 steps
            </button>
            <button className="btn" onClick={() => setRunning((r) => !r)}>
              {running ? 'Pause' : 'Run'}
            </button>
            <button className="btn btn-ghost" onClick={() => reset(path[0])}>
              Reset
            </button>
          </div>
          {prev && path.length === 2 && (
            <div className="status">
              Step 1: ∇J(β_old) = ({fmt(logGrad1d(D.x, D.y, prev[0], prev[1])[0], 4)}, {fmt(logGrad1d(D.x, D.y, prev[0], prev[1])[1], 4)}), so β_new = β_old − α∇J
              = ({fmt(cur[0], 4)}, {fmt(cur[1], 4)}). Loss {fmt(J(prev), 4)} → {fmt(J(cur), 4)}.
            </div>
          )}
          {runaway && (
            <div className="status bad">
              The classes are separable: J keeps creeping towards 0 while β₁ grows without bound. There is no finite minimiser — the curve just gets
              steeper.
            </div>
          )}
        </div>
        <Readout
          items={[
            { label: 'iteration', value: path.length - 1 },
            { label: 'β = (β₀, β₁)', value: `(${fmt(cur[0], 3)}, ${fmt(cur[1], 3)})` },
            { label: 'J(β)', value: fmt(J(cur), 5), tone: 'accent' },
            { label: '‖∇J‖', value: fmt(gn, 4) },
            { label: 'training accuracy', value: `${correct}/${D.x.length}` },
          ]}
        />
      </div>
    </div>
  );
}
