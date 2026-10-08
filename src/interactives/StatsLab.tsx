import { useMemo, useState, type ReactNode } from 'react';
import { Chart, Legend } from '../components/Chart';
import { M } from '../components/Math';
import { Readout, Segmented, Slider, Toggle } from '../components/ui';
import { correlation, covariance, fmt, mean, ols1d, rng, variance } from '../lib/num';

/* ---------------- estimator bias simulation ---------------- */

type Pop = 'uniform' | 'exp';
const POPS: Record<Pop, { label: string; draw: (r: ReturnType<typeof rng>) => number; mu: number; median: number; var: number; range: number | null }> = {
  uniform: { label: 'Uniform(0, 10)', draw: (r) => 10 * r.uniform(), mu: 5, median: 5, var: 100 / 12, range: 10 },
  exp: { label: 'Skewed: Exponential(mean 2)', draw: (r) => -2 * Math.log(1 - r.uniform()), mu: 2, median: 2 * Math.LN2, var: 4, range: null },
};

interface Acc {
  n: number;
  mean: number;
  median: number;
  s2: number;
  v2: number;
  s: number;
  range: number;
}
const empty = (): Acc => ({ n: 0, mean: 0, median: 0, s2: 0, v2: 0, s: 0, range: 0 });

export function EstimatorLab() {
  const [pop, setPop] = useState<Pop>('uniform');
  const [N, setN] = useState(3);
  const [acc, setAcc] = useState<Acc>(empty);
  const [last, setLast] = useState<number[]>([]);
  const [seed, setSeed] = useState(1);
  const P = POPS[pop];

  const draw = (k: number) => {
    const r = rng(seed * 7919 + acc.n);
    const a = { ...acc };
    let sample: number[] = [];
    for (let t = 0; t < k; t++) {
      sample = Array.from({ length: N }, () => P.draw(r));
      const sorted = [...sample].sort((p, q) => p - q);
      const med = N % 2 ? sorted[(N - 1) / 2] : (sorted[N / 2 - 1] + sorted[N / 2]) / 2;
      const s2 = variance(sample, 1);
      a.n += 1;
      a.mean += mean(sample);
      a.median += med;
      a.s2 += s2;
      a.v2 += variance(sample, 0);
      a.s += Math.sqrt(s2);
      a.range += sorted[N - 1] - sorted[0];
    }
    setAcc(a);
    setLast(sample);
    setSeed((s) => s + 1);
  };
  const reset = (p = pop, n = N) => {
    setPop(p);
    setN(n);
    setAcc(empty());
    setLast([]);
  };

  const rows: { label: ReactNode; truth: number | null; avg: number; tag: string }[] = [
    { label: <M t="\bar x" />, truth: P.mu, avg: acc.mean / acc.n, tag: 'mean μ' },
    { label: 'median', truth: P.median, avg: acc.median / acc.n, tag: 'population median' },
    { label: <><M t="s^2" /> (÷ N − 1)</>, truth: P.var, avg: acc.s2 / acc.n, tag: 'σ²' },
    { label: <><M t="\hat\sigma^2" /> (÷ N)</>, truth: P.var, avg: acc.v2 / acc.n, tag: 'σ²' },
    { label: <M t="s = \sqrt{s^2}" />, truth: Math.sqrt(P.var), avg: acc.s / acc.n, tag: 'σ' },
    { label: 'range', truth: P.range, avg: acc.range / acc.n, tag: 'population range' },
  ];

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'uniform', label: POPS.uniform.label },
            { value: 'exp', label: POPS.exp.label },
          ]}
          value={pop}
          onChange={(p) => reset(p, N)}
        />
      </div>
      <div className="lab-grid">
        <div>
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th>Estimator</th>
                  <th>Target</th>
                  <th>True value</th>
                  <th>Average of estimates</th>
                  <th>Avg ÷ truth</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const ratio = r.truth ? r.avg / r.truth : NaN;
                  const off = acc.n > 200 && Math.abs(ratio - 1) > 0.03;
                  return (
                    <tr key={i}>
                      <td style={{ whiteSpace: 'nowrap' }}>{r.label}</td>
                      <td className="muted">{r.tag}</td>
                      <td>{r.truth === null ? '∞ (unbounded)' : fmt(r.truth, 3)}</td>
                      <td>{acc.n ? fmt(r.avg, 3) : '—'}</td>
                      <td style={{ color: acc.n ? (off ? 'var(--c-bad)' : 'var(--c-good)') : undefined, fontWeight: 650 }}>
                        {acc.n && r.truth ? fmt(ratio, 3) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="small muted" style={{ fontFamily: 'var(--font-ui)' }}>
            An estimator is unbiased when its <em>average over many samples</em> equals the truth (ratio → 1). Red ratios have settled away from 1 after
            200+ samples.
          </p>
        </div>
        <div className="controls">
          <Slider label="Sample size N" value={N} min={2} max={30} step={1} onChange={(n) => reset(pop, n)} />
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => draw(1)}>
              Draw 1 sample
            </button>
            <button className="btn" onClick={() => draw(100)}>
              +100
            </button>
            <button className="btn" onClick={() => draw(2000)}>
              +2000
            </button>
            <button className="btn btn-ghost" onClick={() => reset()}>
              Reset
            </button>
          </div>
          <Readout items={[{ label: 'samples drawn', value: acc.n }]} />
          {last.length > 0 && (
            <div className="small" style={{ fontFamily: 'var(--font-ui)' }}>
              <div className="panel-title">Most recent sample</div>
              <span className="mono">{last.map((v) => v.toFixed(2)).join(', ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- correlation explorer ---------------- */

const ANSCOMBE_X = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
const ANSCOMBE: [number[], number[]][] = [
  [ANSCOMBE_X, [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68]],
  [ANSCOMBE_X, [9.14, 8.14, 8.74, 8.77, 9.26, 8.1, 6.13, 3.1, 9.13, 7.26, 4.74]],
  [ANSCOMBE_X, [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73]],
  [
    [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8],
    [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.5, 5.56, 7.91, 6.89],
  ],
];

type CorrMode = 'linear' | 'curve' | 'outlier' | 'anscombe';

export function CorrelationLab() {
  const [mode, setMode] = useState<CorrMode>('linear');
  const [rho, setRho] = useState(0.7);
  const [scale, setScale] = useState(1);
  const [seed, setSeed] = useState(3);
  const [which, setWhich] = useState(0);
  const [showFit, setShowFit] = useState(true);

  const { xs, ys, xd, yd } = useMemo(() => {
    const r = rng(seed);
    if (mode === 'linear') {
      const n = 60;
      const z1 = Array.from({ length: n }, () => r.normal());
      const z2 = Array.from({ length: n }, () => r.normal());
      const xs = z1.map((v) => 5 + 1.6 * v);
      const ys = z1.map((v, i) => 5 + scale * 1.6 * (rho * v + Math.sqrt(1 - rho * rho) * z2[i]));
      return { xs, ys, xd: [0, 10] as [number, number], yd: [5 - 6 * scale, 5 + 6 * scale] as [number, number] };
    }
    if (mode === 'curve') {
      const xs = Array.from({ length: 41 }, (_, i) => -2 + i * 0.1);
      const ys = xs.map((x) => x * x + 0.15 * r.normal());
      return { xs, ys, xd: [-2.3, 2.3] as [number, number], yd: [-1, 5] as [number, number] };
    }
    if (mode === 'outlier') {
      const xs = Array.from({ length: 25 }, () => 2 + 2 * r.uniform());
      const ys = Array.from({ length: 25 }, () => 2 + 2 * r.uniform());
      xs.push(9.5);
      ys.push(9.5);
      return { xs, ys, xd: [0, 10.5] as [number, number], yd: [0, 10.5] as [number, number] };
    }
    const [ax, ay] = ANSCOMBE[which];
    return { xs: ax, ys: ay, xd: [2, 20] as [number, number], yd: [2, 14] as [number, number] };
  }, [mode, rho, scale, seed, which]);

  const r = correlation(xs, ys);
  const fit = ols1d(xs, ys);
  const sx = Math.sqrt(variance(xs));
  const sy = Math.sqrt(variance(ys));

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'linear', label: 'Linear (choose ρ)' },
            { value: 'curve', label: 'Perfect curve' },
            { value: 'outlier', label: 'One outlier' },
            { value: 'anscombe', label: 'Anscombe’s quartet' },
          ]}
          value={mode}
          onChange={setMode}
        />
      </div>
      <div className="lab-grid">
        <div>
          <Chart W={540} H={360} x={xd} y={yd} xLabel="x" yLabel="y">
            {(s) => (
              <>
                {showFit && fit && <line x1={s.x(xd[0])} x2={s.x(xd[1])} y1={s.y(fit.b0 + fit.b1 * xd[0])} y2={s.y(fit.b0 + fit.b1 * xd[1])} className="ln-fit" />}
                {xs.map((x, i) => (
                  <circle key={i} cx={s.x(x)} cy={s.y(ys[i])} r={mode === 'outlier' && i === xs.length - 1 ? 7 : 5} className={`pt ${mode === 'outlier' && i === xs.length - 1 ? 'hi' : ''}`} />
                ))}
              </>
            )}
          </Chart>
          <Legend items={[{ label: 'data', cls: 'pt', shape: 'dot' }, ...(showFit ? [{ label: 'least-squares line', cls: 'ln-fit' }] : [])]} />
        </div>
        <div className="controls">
          {mode === 'linear' && (
            <>
              <Slider label="target correlation ρ" value={rho} min={-1} max={1} step={0.05} onChange={setRho} format={(v) => fmt(v, 2)} />
              <Slider label="multiply y-spread by" value={scale} min={0.25} max={3} step={0.25} onChange={setScale} format={(v) => `×${v}`} />
              <button className="btn" onClick={() => setSeed((s) => s + 1)}>
                New sample
              </button>
            </>
          )}
          {mode === 'anscombe' && (
            <Segmented
              options={[0, 1, 2, 3].map((i) => ({ value: String(i), label: ['I', 'II', 'III', 'IV'][i] }))}
              value={String(which)}
              onChange={(v) => setWhich(Number(v))}
            />
          )}
          <Toggle label="Show least-squares line" checked={showFit} onChange={setShowFit} />
          <Readout
            items={[
              { label: 'Pearson r', value: fmt(r, 3), tone: 'accent' },
              { label: 'cov(x, y)', value: fmt(covariance(xs, ys), 3) },
              { label: 'sₓ, s_y', value: `${fmt(sx, 2)}, ${fmt(sy, 2)}` },
              { label: 'slope = r·s_y/sₓ', value: fit ? fmt(fit.b1, 3) : '—' },
            ]}
          />
          <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
            {mode === 'linear' &&
              'Stretch y with the second slider: covariance and slope scale with it, but r does not move. Correlation is scale-free; slope is not.'}
            {mode === 'curve' && 'y is (almost) a deterministic function of x, yet r ≈ 0: correlation only detects linear association.'}
            {mode === 'outlier' && 'The cluster on its own has no linear trend; the single far point manufactures a large r.'}
            {mode === 'anscombe' &&
              'All four datasets have r ≈ 0.816 and the same fitted line ŷ ≈ 3 + 0.5x. Their relationships are completely different. Always plot the data.'}
          </p>
        </div>
      </div>
    </div>
  );
}
