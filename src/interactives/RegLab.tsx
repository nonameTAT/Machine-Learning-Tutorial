import { useMemo, useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../components/Chart';
import { M } from '../components/Math';
import { Readout, Segmented, Slider } from '../components/ui';
import { clamp, eig2, fmt, lasso, linspace, mean, polyEval, polyRow, ridge, rng, type Mat, type Vec } from '../lib/num';

/* ---------------- shared data: 12 noisy points from sin(2πx) ---------------- */

const DEG = 9;
const f = (x: number) => Math.sin(2 * Math.PI * x);
const z = (x: number) => 2 * x - 1;

export function sinData(seed = 7, nTrain = 12, nVal = 40, noise = 0.25) {
  const r = rng(seed);
  const train = Array.from({ length: nTrain }, (_, i) => {
    const x = (i + 0.5 + 0.6 * (r.uniform() - 0.5)) / nTrain;
    return [x, f(x) + noise * r.normal()] as [number, number];
  });
  const val = Array.from({ length: nVal }, () => {
    const x = r.uniform();
    return [x, f(x) + noise * r.normal()] as [number, number];
  });
  return { train, val };
}

type Method = 'ridge' | 'lasso';

const lamOf = (v: number) => (v <= -9 ? 0 : 10 ** v);

function fitPoly(train: [number, number][], lam: number, method: Method, deg = DEG): Vec {
  const X: Mat = train.map(([x]) => polyRow(z(x), deg));
  const y = train.map(([, yy]) => yy);
  if (method === 'ridge' || lam === 0) return ridge(X, y, lam) ?? new Array(deg + 1).fill(0);
  return lasso(X, y, lam);
}

const mseOn = (theta: Vec, pts: [number, number][]) => mean(pts.map(([x, y]) => (y - polyEval(theta, z(x))) ** 2));
const symlog = (v: number) => Math.sign(v) * Math.log10(1 + Math.abs(v));

export function RegularisationLab() {
  const { train, val } = useMemo(() => sinData(), []);
  const [v, setV] = useState(-9);
  const [method, setMethod] = useState<Method>('ridge');
  const lam = lamOf(v);
  const theta = useMemo(() => fitPoly(train, lam, method), [train, lam, method]);

  // validation curve across λ (warm-started for LASSO)
  const curve = useMemo(() => {
    const grid = linspace(-8, 2, 41).reverse();
    let warm: Vec | undefined;
    const out = grid.map((g) => {
      const l = 10 ** g;
      let th: Vec;
      if (method === 'ridge') th = fitPoly(train, l, 'ridge');
      else {
        const X: Mat = train.map(([x]) => polyRow(z(x), DEG));
        th = lasso(
          X,
          train.map(([, yy]) => yy),
          l,
          warm,
          4000,
        );
        warm = th;
      }
      return { g, tr: mseOn(th, train), va: mseOn(th, val) };
    });
    return out.reverse();
  }, [train, val, method]);

  const xs = linspace(0, 1, 300);
  const trM = mseOn(theta, train);
  const vaM = mseOn(theta, val);
  const zeros = theta.slice(1).filter((t) => Math.abs(t) < 1e-10).length;
  const norm2 = theta.slice(1).reduce((s, t) => s + t * t, 0);
  const coefMax = Math.max(1, ...theta.slice(1).map((t) => Math.abs(symlog(t))));
  const vaMax = Math.min(1.5, Math.max(...curve.map((c) => c.va)));

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'ridge', label: 'Ridge (L2)' },
            { value: 'lasso', label: 'LASSO (L1)' },
          ]}
          value={method}
          onChange={setMethod}
        />
        <span className="kbd-hint">Degree-9 polynomial, 12 training points, intercept unpenalised.</span>
      </div>
      <div className="lab-grid">
        <div>
          <Chart W={540} H={320} x={[0, 1]} y={[-1.8, 1.8]} xLabel="x" yLabel="y">
            {(s) => (
              <>
                <path d={pathOf(xs.map((x) => [s.x(x), s.y(f(x))]))} className="ln-truth" />
                {val.map(([x, y], i) => (
                  <circle key={`v${i}`} cx={s.x(x)} cy={s.y(y)} r={3} className="pt hollow" style={{ stroke: 'var(--c-alt)' }} />
                ))}
                <path d={pathOf(xs.map((x) => [s.x(x), s.y(polyEval(theta, z(x)))]))} className="ln-fit" />
                {train.map(([x, y], i) => (
                  <circle key={i} cx={s.x(x)} cy={s.y(y)} r={5} className="pt" />
                ))}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'training', cls: 'pt', shape: 'dot' },
              { label: 'validation', cls: 'pt hollow', shape: 'dot' },
              { label: 'fit', cls: 'ln-fit' },
              { label: 'true mean sin(2πx)', cls: 'ln-truth', shape: 'dash' },
            ]}
          />
        </div>
        <div className="controls">
          <Slider label={<M t="\lambda" />} value={v} min={-9} max={2} step={0.1} onChange={setV} format={() => (lam === 0 ? '0 (plain least squares)' : fmt(lam, 3))} />
          <Readout
            items={[
              { label: 'training MSE', value: fmt(trM, 4) },
              { label: 'validation MSE', value: fmt(vaM, 4), tone: 'accent' },
              { label: 'Σ θᵢ² (i ≥ 1)', value: fmt(norm2, 3) },
              { label: 'exact zeros', value: `${zeros} / ${DEG}` },
            ]}
          />
          <div>
            <div className="panel-title">Coefficients θ₁…θ₉ (signed log scale)</div>
            <svg viewBox="0 0 300 140" className="chart">
              <line x1={0} x2={300} y1={62} y2={62} stroke="var(--muted)" />
              {theta.slice(1).map((t, i) => {
                const h = (symlog(t) / coefMax) * 54;
                const bw = 300 / DEG;
                return (
                  <g key={i}>
                    <rect x={i * bw + 5} width={bw - 10} y={h >= 0 ? 62 - h : 62} height={Math.max(Math.abs(h), Math.abs(t) < 1e-10 ? 0 : 1)} className={t >= 0 ? 'bar-pos' : 'bar-neg'} />
                    {Math.abs(t) < 1e-10 && (
                      <text x={i * bw + bw / 2} y={57} textAnchor="middle" className="anno" style={{ fontSize: 10 }}>
                        0
                      </text>
                    )}
                    <text x={i * bw + bw / 2} y={135} textAnchor="middle" className="anno" style={{ fontSize: 10 }}>
                      θ{i + 1}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
      <div className="panel-title" style={{ marginTop: 6 }}>
        Training vs validation MSE across λ — the dot is your current λ
      </div>
      <Chart W={900} H={200} x={[-8, 2]} y={[0, vaMax]} xLabel="log₁₀ λ" margin={{ l: 46, r: 14, t: 8, b: 34 }}>
        {(s) => (
          <>
            <path d={pathOf(curve.map((c) => [s.x(c.g), s.y(Math.min(c.tr, vaMax * 1.2))]))} className="ln-data" />
            <path d={pathOf(curve.map((c) => [s.x(c.g), s.y(Math.min(c.va, vaMax * 1.2))]))} className="ln-alt" />
            {lam > 0 && <circle cx={s.x(v)} cy={s.y(Math.min(vaM, vaMax))} r={5} className="mark" />}
          </>
        )}
      </Chart>
      <Legend
        items={[
          { label: 'training MSE', cls: 'ln-data' },
          { label: 'validation MSE', cls: 'ln-alt' },
        ]}
      />
    </div>
  );
}

/* ---------------- constraint geometry ---------------- */

type P = [number, number];

function l2Solve(hat: P, rho: number, t: number): P {
  if (Math.hypot(hat[0], hat[1]) <= t) return hat;
  const Ah: P = [hat[0] + rho * hat[1], rho * hat[0] + hat[1]];
  const at = (mu: number): P => {
    // (A + μI)⁻¹ A θ̂ for A = [[1, ρ], [ρ, 1]]
    const a = 1 + mu;
    const det = a * a - rho * rho;
    return [(a * Ah[0] - rho * Ah[1]) / det, (-rho * Ah[0] + a * Ah[1]) / det];
  };
  let lo = 0;
  let hi = 1;
  while (Math.hypot(...at(hi)) > t) hi *= 2;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (Math.hypot(...at(mid)) > t) lo = mid;
    else hi = mid;
  }
  return at(hi);
}

const quad = (p: P, hat: P, rho: number) => {
  const d0 = p[0] - hat[0];
  const d1 = p[1] - hat[1];
  return d0 * d0 + 2 * rho * d0 * d1 + d1 * d1;
};

function l1Solve(hat: P, rho: number, t: number): P {
  if (Math.abs(hat[0]) + Math.abs(hat[1]) <= t) return hat;
  const V: P[] = [
    [t, 0],
    [0, t],
    [-t, 0],
    [0, -t],
  ];
  let best: P = V[0];
  let bestQ = Infinity;
  for (let k = 0; k < 4; k++) {
    const P0 = V[k];
    const P1 = V[(k + 1) % 4];
    const d: P = [P1[0] - P0[0], P1[1] - P0[1]];
    const w: P = [P0[0] - hat[0], P0[1] - hat[1]];
    const Ad: P = [d[0] + rho * d[1], rho * d[0] + d[1]];
    const s = clamp(-(w[0] * Ad[0] + w[1] * Ad[1]) / (d[0] * Ad[0] + d[1] * Ad[1]), 0, 1);
    const p: P = [P0[0] + s * d[0], P0[1] + s * d[1]];
    const q = quad(p, hat, rho);
    if (q < bestQ) {
      bestQ = q;
      best = p;
    }
  }
  return best.map((c) => (Math.abs(c) < 1e-9 ? 0 : c)) as P;
}

function GeoPanel({
  kind,
  hat,
  rho,
  t,
  onDrag,
}: {
  kind: 'l2' | 'l1';
  hat: P;
  rho: number;
  t: number;
  onDrag: (p: P) => void;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [drag, setDrag] = useState(false);
  const sol = kind === 'l2' ? l2Solve(hat, rho, t) : l1Solve(hat, rho, t);
  const E = eig2(1, rho, 1);
  const ell = (c: number) =>
    linspace(0, 2 * Math.PI, 120).map((u) => {
      const r1 = Math.sqrt(c / E.l1);
      const r2 = Math.sqrt(c / E.l2);
      return [hat[0] + r1 * Math.cos(u) * E.v1[0] + r2 * Math.sin(u) * E.v2[0], hat[1] + r1 * Math.cos(u) * E.v1[1] + r2 * Math.sin(u) * E.v2[1]] as P;
    });
  const cSol = quad(sol, hat, rho);
  const levels = cSol > 1e-9 ? [0.25, 0.5, 1.5, 2.2].map((k) => k * cSol) : [0.3, 1, 2.5];
  const zero = sol.findIndex((c) => c === 0);
  const inside = sol[0] === hat[0] && sol[1] === hat[1];
  return (
    <div>
      <div className="panel-title">{kind === 'l2' ? 'Ridge: θ₁² + θ₂² ≤ t²' : 'LASSO: |θ₁| + |θ₂| ≤ t'}</div>
      <Chart
        W={400}
        H={400}
        x={[-3, 3]}
        y={[-3, 3]}
        xLabel="θ₁"
        yLabel="θ₂"
        svgRef={ref}
        className="draggable"
        margin={{ l: 40, r: 12, t: 12, b: 36 }}
        onPointerDown={(e, s) => {
          if (!ref.current) return;
          setDrag(true);
          ref.current.setPointerCapture?.(e.pointerId);
          const q = svgPoint(ref.current, e);
          onDrag([clamp(s.ix(q.x), -2.9, 2.9), clamp(s.iy(q.y), -2.9, 2.9)]);
        }}
        onPointerMove={(e, s) => {
          if (!drag || !ref.current) return;
          const q = svgPoint(ref.current, e);
          onDrag([clamp(s.ix(q.x), -2.9, 2.9), clamp(s.iy(q.y), -2.9, 2.9)]);
        }}
        onPointerUp={() => setDrag(false)}
      >
        {(s) => (
          <>
            <line x1={s.x(0)} x2={s.x(0)} y1={s.top} y2={s.bottom} stroke="var(--muted)" />
            <line x1={s.left} x2={s.right} y1={s.y(0)} y2={s.y(0)} stroke="var(--muted)" />
            {kind === 'l2' ? (
              <circle cx={s.x(0)} cy={s.y(0)} r={s.x(t) - s.x(0)} className="area-pen" />
            ) : (
              <polygon points={`${s.x(t)},${s.y(0)} ${s.x(0)},${s.y(t)} ${s.x(-t)},${s.y(0)} ${s.x(0)},${s.y(-t)}`} className="area-pen" />
            )}
            {levels.map((c, i) => (
              <path key={i} className="contour" d={pathOf(ell(c).map(([a, b]) => [s.x(a), s.y(b)])) + 'Z'} />
            ))}
            {!inside && <path className="contour touch" d={pathOf(ell(cSol).map(([a, b]) => [s.x(a), s.y(b)])) + 'Z'} />}
            <circle cx={s.x(hat[0])} cy={s.y(hat[1])} r={7} className="handle" />
            <text x={s.x(hat[0]) + 10} y={s.y(hat[1]) - 8} className="anno-strong">
              θ̂ OLS
            </text>
            <circle cx={s.x(sol[0])} cy={s.y(sol[1])} r={6} className="mark" />
          </>
        )}
      </Chart>
      <div className={`status ${zero >= 0 && !inside ? 'good' : ''}`}>
        Solution: ({fmt(sol[0], 3)}, {fmt(sol[1], 3)})
        {inside ? ' — OLS point is inside the region, so the constraint is inactive.' : zero >= 0 ? ` — θ${zero + 1} is exactly 0 (a corner).` : ' — both coefficients non-zero.'}
      </div>
    </div>
  );
}

export function PenaltyGeometryLab() {
  const [hat, setHat] = useState<P>([2.2, 0.9]);
  const [rho, setRho] = useState(0.4);
  const [t, setT] = useState(1);
  return (
    <div>
      <div className="lab-grid even">
        <GeoPanel kind="l2" hat={hat} rho={rho} t={t} onDrag={setHat} />
        <GeoPanel kind="l1" hat={hat} rho={rho} t={t} onDrag={setHat} />
      </div>
      <div className="lab-grid even">
        <Slider label="constraint size t" value={t} min={0.2} max={2.8} step={0.05} onChange={setT} format={(x) => fmt(x, 2)} />
        <Slider label="feature correlation ρ (tilts the ellipses)" value={rho} min={-0.9} max={0.9} step={0.05} onChange={setRho} format={(x) => fmt(x, 2)} />
      </div>
      <Legend
        items={[
          { label: 'allowed region', cls: 'area-pen', shape: 'box' },
          { label: 'SSE contours around θ̂', cls: 'contour' },
          { label: 'first contour to touch the region', cls: 'contour touch' },
          { label: 'constrained solution', cls: 'mark', shape: 'dot' },
        ]}
      />
    </div>
  );
}

/* ---------------- coefficient paths ---------------- */

const PATH_TRUE = [3, -2, 0, 1.5, 0, 0];
const PATH_CLS = ['ln-data', 'ln-res', 'ln-fit', 'ln-pen', 'ln-var', 'ln-bias'];

export function CoefPathLab() {
  const [lg, setLg] = useState(1.5);
  const paths = useMemo(() => {
    const r = rng(99);
    const m = 50;
    const n = PATH_TRUE.length;
    const raw = Array.from({ length: m }, () => {
      const base = r.normal();
      return Array.from({ length: n }, (_, i) => (i < 3 ? 0.6 * base : 0) + r.normal());
    });
    // standardise columns so the penalty treats features equally
    const mu = Array.from({ length: n }, (_, i) => mean(raw.map((row) => row[i])));
    const sd = Array.from({ length: n }, (_, i) => Math.sqrt(mean(raw.map((row) => (row[i] - mu[i]) ** 2))));
    const Z = raw.map((row) => row.map((v, i) => (v - mu[i]) / sd[i]));
    const y = Z.map((row) => 1 + row.reduce((s, v, i) => s + v * PATH_TRUE[i], 0) + 1.2 * r.normal());
    const X: Mat = Z.map((row) => [1, ...row]);
    const grid = linspace(-1, 4, 60);
    const ridgeP = grid.map((g) => ridge(X, y, 10 ** g)!.slice(1));
    let warm: Vec | undefined;
    const lassoP = [...grid]
      .reverse()
      .map((g) => {
        const th = lasso(X, y, 10 ** g, warm, 5000);
        warm = th;
        return th.slice(1);
      })
      .reverse();
    return { grid, ridgeP, lassoP };
  }, []);
  const yMax = 3.5;
  const panel = (title: string, P: Vec[]) => (
    <div>
      <div className="panel-title">{title}</div>
      <Chart W={440} H={280} x={[-1, 4]} y={[-yMax, yMax]} xLabel="log₁₀ λ  (stronger penalty →)" yLabel="coefficient" margin={{ l: 42, r: 12, t: 10, b: 36 }}>
        {(s) => (
          <>
            <line x1={s.left} x2={s.right} y1={s.y(0)} y2={s.y(0)} stroke="var(--muted)" />
            {PATH_TRUE.map((_, i) => (
              <path key={i} className={PATH_CLS[i]} d={pathOf(paths.grid.map((g, k) => [s.x(g), s.y(P[k][i])]))} />
            ))}
            <line x1={s.x(lg)} x2={s.x(lg)} y1={s.top} y2={s.bottom} className="ln-ghost" />
          </>
        )}
      </Chart>
    </div>
  );
  const k = Math.round(((lg + 1) / 5) * (paths.grid.length - 1));
  return (
    <div>
      <div className="lab-grid even">
        {panel('Ridge paths', paths.ridgeP)}
        {panel('LASSO paths', paths.lassoP)}
      </div>
      <Slider label="log₁₀ λ marker" value={lg} min={-1} max={4} step={0.05} onChange={setLg} format={(x) => fmt(x, 2)} />
      <div className="table-wrap num">
        <table>
          <thead>
            <tr>
              <th>feature</th>
              {PATH_TRUE.map((_, i) => (
                <th key={i}>x{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>true θ</td>
              {PATH_TRUE.map((v, i) => (
                <td key={i}>{v}</td>
              ))}
            </tr>
            <tr>
              <td>ridge</td>
              {paths.ridgeP[k].map((v, i) => (
                <td key={i}>{fmt(v, 3)}</td>
              ))}
            </tr>
            <tr>
              <td>LASSO</td>
              {paths.lassoP[k].map((v, i) => (
                <td key={i} style={{ fontWeight: Math.abs(v) < 1e-10 ? 700 : undefined, color: Math.abs(v) < 1e-10 ? 'var(--c-good)' : undefined }}>
                  {Math.abs(v) < 1e-10 ? '0' : fmt(v, 3)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <Legend items={PATH_TRUE.map((v, i) => ({ label: `x${i + 1} (true ${v})`, cls: PATH_CLS[i] }))} />
    </div>
  );
}
