import { useEffect, useMemo, useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../components/Chart';
import { M } from '../components/Math';
import { Plot } from '../components/Plot';
import { Readout, Segmented, Slider, Toggle } from '../components/ui';
import { eig2, fmt, linspace } from '../lib/num';
import { cssVar } from '../lib/theme';
import { EX_X, EX_Y } from './ResidualLab';

type Mode = 'batch' | 'sgd';
type P = [number, number];
const MAX_PATH = 4000;

function setup(centred: boolean) {
  const mx = 7;
  const xs = centred ? EX_X.map((x) => x - mx) : EX_X;
  const m = xs.length;
  // A = XᵀX / m, so J(θ) = J* + (θ − θ*)ᵀ A (θ − θ*)
  const a = 1;
  const b = xs.reduce((s, x) => s + x, 0) / m;
  const d = xs.reduce((s, x) => s + x * x, 0) / m;
  const opt: P = centred ? [8, -1] : [15, -1];
  const J = (t: P) => xs.reduce((s, x, j) => s + (EX_Y[j] - t[0] - t[1] * x) ** 2, 0) / m;
  const grad = (t: P): P => {
    let g0 = 0;
    let g1 = 0;
    xs.forEach((x, j) => {
      const e = EX_Y[j] - t[0] - t[1] * x;
      g0 += -2 * e;
      g1 += -2 * e * x;
    });
    return [g0 / m, g1 / m];
  };
  const E = eig2(a, b, d);
  return { xs, m, A: { a, b, d }, opt, J, grad, Jstar: J(opt), eig: E, alphaMax: 1 / E.l1 };
}

export function GDLab() {
  const [centred, setCentred] = useState(false);
  const [mode, setMode] = useState<Mode>('batch');
  const [logA, setLogA] = useState(-2.0);
  const [start, setStart] = useState<P>([0, 0]);
  const [path, setPath] = useState<P[]>([[0, 0]]);
  const [running, setRunning] = useState(false);
  const [show3d, setShow3d] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const S = useMemo(() => setup(centred), [centred]);
  const alpha = 10 ** logA;
  const cur = path[path.length - 1];
  const diverged = !Number.isFinite(cur[0]) || !Number.isFinite(cur[1]) || Math.abs(cur[0]) > 1e5 || Math.abs(cur[1]) > 1e5;
  const t = path.length - 1;
  const gNow = S.grad(cur);
  const converged = Math.hypot(gNow[0], gNow[1]) < 1e-6;

  const step = (th: P, k: number): P => {
    if (mode === 'batch') {
      const g = S.grad(th);
      return [th[0] - alpha * g[0], th[1] - alpha * g[1]];
    }
    // SGD: for j = 1..m, θ ← θ + 2α (y_j − h_θ(x_j)) x_j  (one example per update)
    const j = k % S.m;
    const x = S.xs[j];
    const e = EX_Y[j] - th[0] - th[1] * x;
    return [th[0] + 2 * alpha * e, th[1] + 2 * alpha * e * x];
  };

  const reset = (p: P = start) => {
    setRunning(false);
    setStart(p);
    setPath([p]);
  };

  // Changing the problem invalidates the current path.
  useEffect(() => {
    reset([0, 0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centred, mode]);

  const doSteps = (n: number) =>
    setPath((p) => {
      const out = [...p];
      for (let i = 0; i < n && out.length < MAX_PATH; i++) {
        const last = out[out.length - 1];
        const next = step(last, out.length - 1);
        out.push(next);
        if (!Number.isFinite(next[0]) || Math.abs(next[0]) > 1e5 || Math.abs(next[1]) > 1e5) break;
      }
      return out;
    });

  useEffect(() => {
    if (!running) return;
    if (diverged || converged || path.length >= MAX_PATH) {
      setRunning(false);
      return;
    }
    const id = requestAnimationFrame(() => doSteps(mode === 'batch' ? 3 : 5));
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, path]);

  const xd: [number, number] = [S.opt[0] - 20, S.opt[0] + 20];
  const yd: [number, number] = [S.opt[1] - 2.5, S.opt[1] + 2.5];
  const levels = [0.25, 1, 4, 12, 30, 70, 150, 300, 600];
  const ellipse = (c: number): P[] =>
    linspace(0, 2 * Math.PI, 160).map((u) => {
      const r1 = Math.sqrt(c / S.eig.l1);
      const r2 = Math.sqrt(c / S.eig.l2);
      return [
        S.opt[0] + r1 * Math.cos(u) * S.eig.v1[0] + r2 * Math.sin(u) * S.eig.v2[0],
        S.opt[1] + r1 * Math.cos(u) * S.eig.v1[1] + r2 * Math.sin(u) * S.eig.v2[1],
      ];
    });

  // loss-gap history, on a log scale
  const gaps = path.map((p) => Math.max(1e-8, S.J(p) - S.Jstar));
  const lg = gaps.map((g) => (Number.isFinite(g) ? Math.log10(g) : 8));
  const maxLg = Math.min(8, Math.max(2, ...lg.filter(Number.isFinite)));
  const minLg = Math.max(-8, Math.min(-2, ...lg.filter(Number.isFinite)));

  const trace = path.slice(-6).map((p, i, arr) => {
    const k = path.length - arr.length + i;
    return { k, p, J: S.J(p), j: mode === 'sgd' && k > 0 ? ((k - 1) % S.m) + 1 : null };
  });

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'batch', label: 'Batch GD' },
            { value: 'sgd', label: 'Stochastic GD' },
          ]}
          value={mode}
          onChange={setMode}
        />
        <Toggle label="Centre x first (x − 7)" checked={centred} onChange={setCentred} />
      </div>
      <div className="lab-grid even">
        <div>
          <div className="panel-title">Loss contours over (θ₀, θ₁) — click to choose a start</div>
          <Chart
            W={520}
            H={380}
            x={xd}
            y={yd}
            xLabel="θ₀ (intercept)"
            yLabel="θ₁ (slope)"
            svgRef={svgRef}
            className="draggable"
            onPointerDown={(e, s) => {
              if (!svgRef.current) return;
              const q = svgPoint(svgRef.current, e);
              reset([Number(s.ix(q.x).toFixed(2)), Number(s.iy(q.y).toFixed(2))]);
            }}
          >
            {(s) => (
              <>
                {levels.map((c) => (
                  <path key={c} className="contour" d={pathOf(ellipse(c).map(([a, b]) => [s.x(a), s.y(b)])) + 'Z'} />
                ))}
                <path
                  d={pathOf(path.filter((_, i) => path.length < 800 || i % Math.ceil(path.length / 800) === 0 || i === path.length - 1).map(([a, b]) => [s.x(a), s.y(b)]))}
                  fill="none"
                  stroke="var(--c-res)"
                  strokeWidth={1.6}
                />
                {path.length < 80 &&
                  path.map(([a, b], i) => <circle key={i} cx={s.x(a)} cy={s.y(b)} r={2.4} fill="var(--c-res)" />)}
                <circle cx={s.x(S.opt[0])} cy={s.y(S.opt[1])} r={5} className="mark-acc" />
                {Number.isFinite(cur[0]) && <circle cx={s.x(cur[0])} cy={s.y(cur[1])} r={6} className="mark" />}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'equal-loss contours', cls: 'contour' },
              { label: 'path of θ⁽ᵗ⁾', cls: 'ln-res' },
              { label: 'minimum θ̂', cls: 'mark-acc', shape: 'dot' },
            ]}
          />
        </div>
        <div>
          <div className="panel-title">Current line on the data</div>
          <Chart W={520} H={240} x={[0, 14]} y={[-5, 20]} xLabel="x" yLabel="y">
            {(s) => {
              const f = (x: number) => cur[0] + cur[1] * (centred ? x - 7 : x);
              return (
                <>
                  <line x1={s.x(0)} x2={s.x(14)} y1={s.y(15)} y2={s.y(1)} className="ln-ghost" />
                  {Number.isFinite(cur[0]) && <line x1={s.x(0)} x2={s.x(14)} y1={s.y(f(0))} y2={s.y(f(14))} className="ln-fit" />}
                  {EX_X.map((x, j) => (
                    <circle
                      key={j}
                      cx={s.x(x)}
                      cy={s.y(EX_Y[j])}
                      r={mode === 'sgd' && t > 0 && (t - 1) % S.m === j ? 8 : 6}
                      className={`pt ${mode === 'sgd' && t > 0 && (t - 1) % S.m === j ? 'hi' : ''}`}
                    />
                  ))}
                </>
              );
            }}
          </Chart>
          <div className="panel-title" style={{ marginTop: 8 }}>
            Loss gap J(θ⁽ᵗ⁾) − J* (log scale) vs. update t
          </div>
          <Chart
            W={520}
            H={170}
            x={[0, Math.max(10, path.length - 1)]}
            y={[minLg, maxLg]}
            margin={{ l: 46, r: 14, t: 8, b: 30 }}
            yTickFormat={(v) => (Number.isInteger(v) ? `1e${v}` : '')}
          >
            {(s) => <path className="ln-pen" d={pathOf(lg.map((v, i) => [s.x(i), s.y(v)]))} />}
          </Chart>
        </div>
      </div>
      <div className="lab-grid" style={{ marginTop: 10 }}>
        <div className="controls">
          <Slider label={<>learning rate α</>} value={logA} min={-3.5} max={-0.5} step={0.05} onChange={setLogA} format={() => fmt(alpha, 4)} />
          <div className="btn-row">
            <button className="btn" onClick={() => doSteps(1)} disabled={diverged}>
              Step
            </button>
            <button className="btn" onClick={() => doSteps(mode === 'batch' ? 10 : S.m)} disabled={diverged}>
              {mode === 'batch' ? '+10 steps' : '+1 epoch (5 updates)'}
            </button>
            <button className="btn btn-primary" onClick={() => setRunning((r) => !r)} disabled={diverged}>
              {running ? 'Pause' : 'Run'}
            </button>
            <button className="btn btn-ghost" onClick={() => reset()}>
              Reset
            </button>
          </div>
          {diverged && <div className="status bad">Diverged: the steps overshoot and grow. Lower α and reset.</div>}
          {converged && !diverged && <div className="status good">Converged: ‖∇J‖ &lt; 10⁻⁶ after {t} updates.</div>}
          <Readout
            items={[
              { label: 'updates t', value: t },
              { label: 'θ₀, θ₁', value: diverged ? '—' : `${fmt(cur[0], 3)}, ${fmt(cur[1], 3)}` },
              { label: 'J(θ) (MSE)', value: diverged ? '∞' : fmt(S.J(cur), 4), tone: 'accent' },
              { label: 'batch α limit 1/λₘₐₓ', value: fmt(S.alphaMax, 4) },
            ]}
          />
          <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
            For this quadratic loss, batch GD converges exactly when <M t="0 < \alpha < 1/\lambda_{\max}(X\T X/m)" />. The ratio of the two eigenvalues
            (here {fmt(S.eig.l1 / S.eig.l2, 1)}) sets how elongated the bowl is, and therefore how slowly the last stretch goes.
          </p>
        </div>
        <div>
          <div className="panel-title">Execution trace (last updates)</div>
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th>t</th>
                  {mode === 'sgd' && <th>example j</th>}
                  <th>θ₀</th>
                  <th>θ₁</th>
                  <th>J(θ)</th>
                </tr>
              </thead>
              <tbody>
                {trace.map((r) => (
                  <tr key={r.k}>
                    <td>{r.k}</td>
                    {mode === 'sgd' && <td>{r.j ?? '—'}</td>}
                    <td>{fmt(r.p[0], 4)}</td>
                    <td>{fmt(r.p[1], 4)}</td>
                    <td>{fmt(r.J, 4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Toggle label="Show the loss bowl in 3-D (Plotly)" checked={show3d} onChange={setShow3d} />
        </div>
      </div>
      {show3d && <Bowl3D S={S} path={path} xd={xd} yd={yd} />}
    </div>
  );
}

function Bowl3D({ S, path, xd, yd }: { S: ReturnType<typeof setup>; path: P[]; xd: [number, number]; yd: [number, number] }) {
  const data = useMemo(() => {
    const t0 = linspace(xd[0], xd[1], 40);
    const t1 = linspace(yd[0], yd[1], 40);
    // values above the axis range are clipped by Plotly rather than flattened, so the bowl keeps its shape
    const z = t1.map((b) => t0.map((a) => S.J([a, b])));
    const pts = path.filter((p) => Number.isFinite(p[0]) && Math.abs(p[0]) < 1e3);
    const step = Math.max(1, Math.ceil(pts.length / 400));
    const sub = pts.filter((_, i) => i % step === 0 || i === pts.length - 1);
    return [
      {
        type: 'surface',
        x: t0,
        y: t1,
        z,
        opacity: 0.85,
        colorscale: 'Viridis',
        showscale: false,
        name: 'J(θ)',
        cmin: 0,
        cmax: 400,
        hovertemplate: 'θ₀ %{x:.2f}<br>θ₁ %{y:.2f}<br>J %{z:.2f}<extra></extra>',
      },
      {
        type: 'scatter3d',
        mode: 'lines+markers',
        x: sub.map((p) => p[0]),
        y: sub.map((p) => p[1]),
        z: sub.map((p) => S.J(p) + 1),
        line: { color: cssVar('--c-res') || '#e0592a', width: 5 },
        marker: { size: 2.5, color: cssVar('--c-res') || '#e0592a' },
        name: 'GD path',
      },
    ] as Plotly.Data[];
  }, [S, path, xd, yd]);
  const layout = useMemo<Partial<Plotly.Layout>>(
    () => ({
      scene: {
        xaxis: { title: { text: 'θ₀' } },
        yaxis: { title: { text: 'θ₁' } },
        zaxis: { title: { text: 'J(θ)' }, range: [0, 400] },
        camera: { eye: { x: 1.5, y: -1.6, z: 0.9 } },
        aspectmode: 'cube',
      },
    }),
    [],
  );
  return <Plot data={data} layout={layout} height={440} />;
}
