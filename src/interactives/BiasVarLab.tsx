import { useMemo, useState, type ReactElement } from 'react';
import { Chart, Legend, pathOf } from '../components/Chart';
import { Readout, Slider } from '../components/ui';
import { fmt, linspace, lstsq, matMul, mean, polyEval, polyRow, rng, solve, transpose, type Vec } from '../lib/num';

const f = (x: number) => Math.sin(2 * Math.PI * x);
const SIGMA = 0.4;
const M_TRAIN = 10;
const z = (x: number) => 2 * x - 1;
// Fixed design: the inputs stay put and only the noise is redrawn for each training set,
// so bias and variance at every x are finite and can also be computed exactly.
const XS_TRAIN = Array.from({ length: M_TRAIN }, (_, j) => j / (M_TRAIN - 1));

function fitDataset(seed: number, deg: number): Vec {
  const r = rng(seed);
  const ys = XS_TRAIN.map((x) => f(x) + SIGMA * r.normal());
  return (
    lstsq(
      XS_TRAIN.map((x) => polyRow(z(x), deg)),
      ys,
    ) ?? new Array(deg + 1).fill(0)
  );
}

/** Exact bias(x) and variance(x) for least squares with a fixed design: a(x) = φ(x)ᵀ(ΦᵀΦ)⁻¹Φᵀf, Var = σ² φ(x)ᵀ(ΦᵀΦ)⁻¹φ(x). */
function exactAt(deg: number) {
  const Phi = XS_TRAIN.map((x) => polyRow(z(x), deg));
  const thetaF = lstsq(
    Phi,
    XS_TRAIN.map((x) => f(x)),
  )!;
  const G = matMul(transpose(Phi), Phi); // ΦᵀΦ
  return (x: number) => {
    const phi = polyRow(z(x), deg);
    const w = solve(G, phi);
    const variance = w ? SIGMA ** 2 * phi.reduce((s2, v, k) => s2 + v * w[k], 0) : NaN;
    const mean0 = polyEval(thetaF, z(x));
    return { mean: mean0, bias2: (mean0 - f(x)) ** 2, variance };
  };
}

/** Average over x of exact bias², variance and noise for each degree. */
function decompositionByDegree() {
  const grid = linspace(0, 1, 101);
  return Array.from({ length: 10 }, (_, d) => {
    const ex = exactAt(d);
    let b2 = 0;
    let v = 0;
    grid.forEach((x) => {
      const e = ex(x);
      b2 += e.bias2;
      v += e.variance;
    });
    b2 /= grid.length;
    v /= grid.length;
    return { d, b2, v, noise: SIGMA ** 2, total: b2 + v + SIGMA ** 2 };
  });
}

export function BiasVarianceLab() {
  const [deg, setDeg] = useState(3);
  const [count, setCount] = useState(20);
  const [x0, setX0] = useState(0.2);
  const fits = useMemo(() => Array.from({ length: count }, (_, s) => fitDataset(s + 1, deg)), [count, deg]);
  const byDeg = useMemo(decompositionByDegree, []);
  const xs = linspace(0, 1, 200);
  const avg = xs.map((x) => mean(fits.map((th) => polyEval(th, z(x)))));
  const p0 = fits.map((th) => polyEval(th, z(x0)));
  const a0 = mean(p0);
  const b2 = (a0 - f(x0)) ** 2;
  const v0 = p0.length > 1 ? mean(p0.map((q) => (q - a0) ** 2)) : 0;
  const total = b2 + v0 + SIGMA ** 2;
  const exact = useMemo(() => exactAt(deg), [deg]);
  const ex0 = exact(x0);
  const barMax = Math.max(0.3, total) * 1.05;
  const lg = (v: number) => Math.log10(Math.max(v, 1e-4));

  return (
    <div>
      <div className="lab-grid">
        <div>
          <div className="panel-title">
            {count} training sets (same {M_TRAIN} inputs, fresh noise each time), each fitted with a degree-{deg} polynomial
          </div>
          <Chart W={560} H={340} x={[0, 1]} y={[-2, 2]} xLabel="x" yLabel="y">
            {(s) => (
              <>
                {fits.slice(0, 60).map((th, i) => (
                  <path key={i} d={pathOf(xs.map((x) => [s.x(x), s.y(polyEval(th, z(x)))]))} className="ln-fit-soft" />
                ))}
                <path d={pathOf(xs.map((x) => [s.x(x), s.y(f(x))]))} className="ln-truth" />
                <path d={pathOf(xs.map((x, i) => [s.x(x), s.y(avg[i])]))} className="ln-bias" strokeWidth={3} />
                <line x1={s.x(x0)} x2={s.x(x0)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeDasharray="4 3" />
                {p0.slice(0, 200).map((q, i) => (
                  <circle key={i} cx={s.x(x0)} cy={s.y(q)} r={2.6} fill="var(--c-var)" opacity={0.7} />
                ))}
                <circle cx={s.x(x0)} cy={s.y(f(x0))} r={5} fill="var(--c-truth)" />
                <circle cx={s.x(x0)} cy={s.y(a0)} r={5} className="mark" style={{ fill: 'var(--c-bias)' }} />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'one fitted model per training set', cls: 'ln-fit' },
              { label: 'average fitted model E_D[f̂(x)]', cls: 'ln-bias' },
              { label: 'true f(x)', cls: 'ln-truth', shape: 'dash' },
              { label: 'predictions at x₀', cls: 'ln-var', shape: 'dot' },
            ]}
          />
        </div>
        <div className="controls">
          <Slider label="polynomial degree (model flexibility)" value={deg} min={0} max={9} step={1} onChange={setDeg} />
          <Slider label="query point x₀" value={x0} min={0.02} max={0.98} step={0.01} onChange={setX0} format={(v) => fmt(v, 2)} />
          <div className="btn-row">
            <button className="btn" onClick={() => setCount((c) => Math.min(200, c + 1))}>
              +1 training set
            </button>
            <button className="btn" onClick={() => setCount((c) => Math.min(200, c + 20))}>
              +20
            </button>
            <button className="btn btn-ghost" onClick={() => setCount(1)}>
              Back to 1
            </button>
          </div>
          <Readout
            items={[
              { label: 'bias² at x₀ (estimate)', value: fmt(b2, 4), tone: 'accent' },
              { label: 'variance at x₀ (estimate)', value: fmt(v0, 4), tone: 'accent' },
              { label: 'noise σ²', value: fmt(SIGMA ** 2, 4) },
              { label: 'expected test error', value: fmt(total, 4) },
            ]}
          />
          <p className="small muted" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
            Exact values for this degree: bias² {fmt(ex0.bias2, 4)}, variance {fmt(ex0.variance, 4)}. The estimates converge to them as you add training
            sets.
          </p>
          <svg viewBox="0 0 300 70" className="chart" role="img" aria-label="Stacked decomposition at x0">
            {[
              { v: b2, c: 'var(--c-bias)', l: 'bias²' },
              { v: v0, c: 'var(--c-var)', l: 'variance' },
              { v: SIGMA ** 2, c: 'var(--c-noise)', l: 'noise' },
            ].reduce<{ x: number; els: ReactElement[] }>(
              (acc, seg, i) => {
                const w = (Math.min(seg.v, barMax) / barMax) * 290;
                acc.els.push(
                  <g key={i}>
                    <rect x={5 + acc.x} y={10} width={Math.max(0, w)} height={26} fill={seg.c} />
                    {w > 34 && (
                      <text x={5 + acc.x + w / 2} y={28} textAnchor="middle" style={{ fill: 'var(--surface)', fontSize: 11, fontWeight: 650 }}>
                        {seg.l}
                      </text>
                    )}
                  </g>,
                );
                acc.x += w;
                return acc;
              },
              { x: 0, els: [] },
            ).els}
            <text x={5} y={56} className="anno" style={{ fontSize: 11 }}>
              E[(y − f̂(x₀))²] = bias² + variance + noise
            </text>
          </svg>
        </div>
      </div>
      <div className="panel-title" style={{ marginTop: 10 }}>
        Averaged over x ∈ [0, 1], computed exactly for each degree (log scale)
      </div>
      <Chart W={900} H={240} x={[0, 9]} y={[-2.5, 1]} xLabel="polynomial degree" xTicks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} yTickFormat={(v) => (Number.isInteger(v) ? `1e${v}` : '')} margin={{ l: 46, r: 14, t: 10, b: 34 }}>
        {(s) => (
          <>
            <path className="ln-bias" d={pathOf(byDeg.map((r) => [s.x(r.d), s.y(lg(r.b2))]))} />
            <path className="ln-var" d={pathOf(byDeg.map((r) => [s.x(r.d), s.y(lg(r.v))]))} />
            <path className="ln-noise" d={pathOf(byDeg.map((r) => [s.x(r.d), s.y(lg(r.noise))]))} />
            <path className="ln-fit" d={pathOf(byDeg.map((r) => [s.x(r.d), s.y(lg(r.total))]))} strokeWidth={3} />
            <line x1={s.x(deg)} x2={s.x(deg)} y1={s.top} y2={s.bottom} className="ln-ghost" />
          </>
        )}
      </Chart>
      <Legend
        items={[
          { label: 'bias²', cls: 'ln-bias' },
          { label: 'variance', cls: 'ln-var' },
          { label: 'noise σ² (irreducible)', cls: 'ln-noise', shape: 'dash' },
          { label: 'expected test error (sum)', cls: 'ln-fit' },
        ]}
      />
    </div>
  );
}

/** The classic dartboard picture of bias vs variance. */
export function Dartboards() {
  const boards = [
    { t: 'low bias, low variance', bx: 0, by: 0, s: 0.12 },
    { t: 'low bias, high variance', bx: 0, by: 0, s: 0.42 },
    { t: 'high bias, low variance', bx: 0.48, by: -0.32, s: 0.11 },
    { t: 'high bias, high variance', bx: 0.42, by: -0.3, s: 0.42 },
  ];
  return (
    <div className="lab-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      {boards.map((b, i) => {
        const r = rng(31 + i);
        const pts = Array.from({ length: 14 }, () => [b.bx + b.s * r.normal(), b.by + b.s * r.normal()]);
        return (
          <svg key={i} viewBox="-1.25 -1.25 2.5 2.75" className="chart" role="img" aria-label={b.t}>
            {[1, 0.7, 0.4].map((rad) => (
              <circle key={rad} r={rad} className="target-ring" style={{ strokeWidth: 0.025 }} />
            ))}
            <circle r={0.15} className="target-bull" style={{ strokeWidth: 0.025 }} />
            {pts.map(([x, y], k) => (
              <circle key={k} cx={x} cy={-y} r={0.055} fill="var(--c-var)" stroke="var(--surface)" strokeWidth={0.015} />
            ))}
            <text x={0} y={1.42} textAnchor="middle" style={{ fontSize: 0.17, fill: 'var(--ink-soft)', fontFamily: 'var(--font-ui)' }}>
              {b.t}
            </text>
          </svg>
        );
      })}
    </div>
  );
}
