import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../components/Chart';
import { Readout, Slider } from '../components/ui';
import { fmt, linspace } from '../lib/num';
import { EX_X, EX_Y } from './ResidualLab';

const m = EX_X.length;
const xbar = 7;
const ybar = 8;
const sseAt = (b1: number) => EX_X.reduce((s, x, j) => s + (EX_Y[j] - (ybar - b1 * xbar) - b1 * x) ** 2, 0);
const loglik = (b1: number, sigma: number) => -(m / 2) * Math.log(2 * Math.PI * sigma * sigma) - sseAt(b1) / (2 * sigma * sigma);
const dens = (e: number, sigma: number) => Math.exp(-(e * e) / (2 * sigma * sigma)) / Math.sqrt(2 * Math.PI * sigma * sigma);

export function LikelihoodLab() {
  const [b1, setB1] = useState(-0.3);
  const [sigma, setSigma] = useState(2);
  const b0 = ybar - b1 * xbar;
  const sse = sseAt(b1);
  const ll = loglik(b1, sigma);
  const L = Math.exp(ll);
  const widthScale = 2.6; // x-units per unit density, for drawing the sideways bells

  const grid = useMemo(() => linspace(-3, 1, 161), []);
  const sigmas = [1, 2, 4];
  const curves = sigmas.map((s) => grid.map((b) => loglik(b, s)));
  const current = grid.map((b) => loglik(b, sigma));
  const llMin = Math.min(-60, loglik(-1, sigma) - 25);
  const llMax = Math.max(...curves.flat(), loglik(-1, sigma)) + 2;

  return (
    <div>
      <div className="lab-grid even">
        <div>
          <div className="panel-title">Each prediction carries a Gaussian for y</div>
          <Chart W={520} H={360} x={[0, 15]} y={[-6, 22]} xLabel="x" yLabel="y">
            {(s) => (
              <>
                <line x1={s.x(0)} x2={s.x(15)} y1={s.y(b0)} y2={s.y(b0 + b1 * 15)} className="ln-fit" />
                {EX_X.map((x, j) => {
                  const mu = b0 + b1 * x;
                  const ys = linspace(mu - 3.5 * sigma, mu + 3.5 * sigma, 80);
                  const bell = ys.map((y) => [s.x(x + widthScale * dens(y - mu, sigma)), s.y(y)] as [number, number]);
                  const pj = dens(EX_Y[j] - mu, sigma);
                  return (
                    <g key={j}>
                      <path d={pathOf(bell)} fill="none" stroke="var(--c-pen)" strokeWidth={1.5} />
                      <line x1={s.x(x)} x2={s.x(x)} y1={s.y(mu - 3.5 * sigma)} y2={s.y(mu + 3.5 * sigma)} stroke="var(--c-pen)" strokeOpacity={0.3} />
                      <line x1={s.x(x)} x2={s.x(x + widthScale * pj)} y1={s.y(EX_Y[j])} y2={s.y(EX_Y[j])} stroke="var(--c-res)" strokeWidth={3} />
                      <circle cx={s.x(x)} cy={s.y(EX_Y[j])} r={5.5} className="pt" />
                    </g>
                  );
                })}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'line (best θ₀ for this θ₁)', cls: 'ln-fit' },
              { label: 'density p(y | xⱼ; θ, σ)', cls: 'ln-pen' },
              { label: 'density at the observed yⱼ', cls: 'ln-res' },
            ]}
          />
        </div>
        <div>
          <div className="panel-title">Log-likelihood ℓ(θ₁): current σ (bold) and σ = 1, 2, 4</div>
          <Chart W={520} H={250} x={[-3, 1]} y={[llMin, llMax]} xLabel="θ₁ (slope)" yLabel="ℓ(θ₁)">
            {(s) => (
              <>
                {curves.map((c, k) => (
                  <path
                    key={k}
                    d={pathOf(grid.map((b, i) => [s.x(b), s.y(Math.max(c[i], llMin - 10))]))}
                    className={['ln-data', 'ln-pen', 'ln-var'][k]}
                    strokeWidth={1.4}
                    strokeOpacity={0.7}
                  />
                ))}
                <path d={pathOf(grid.map((b, i) => [s.x(b), s.y(Math.max(current[i], llMin - 10))]))} className="ln-fit" strokeWidth={3.2} />
                <line x1={s.x(-1)} x2={s.x(-1)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <line x1={s.x(b1)} x2={s.x(b1)} y1={s.top} y2={s.bottom} stroke="var(--c-res)" strokeWidth={1.5} />
                {Number.isFinite(ll) && ll > llMin && <circle cx={s.x(b1)} cy={s.y(ll)} r={5} className="mark" />}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'σ = 1', cls: 'ln-data' },
              { label: 'σ = 2', cls: 'ln-pen' },
              { label: 'σ = 4', cls: 'ln-var' },
              { label: 'current σ', cls: 'ln-fit' },
              { label: 'OLS slope −1', cls: 'ln-ghost', shape: 'dash' },
            ]}
          />
          <div className="panel-title" style={{ marginTop: 8 }}>
            SSE(θ₁) — the same peak, upside down
          </div>
          <Chart W={520} H={150} x={[-3, 1]} y={[0, 300]} margin={{ l: 46, r: 14, t: 8, b: 30 }}>
            {(s) => (
              <>
                <path d={pathOf(grid.map((b) => [s.x(b), s.y(sseAt(b))]))} className="ln-res" fill="none" />
                <line x1={s.x(-1)} x2={s.x(-1)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <circle cx={s.x(b1)} cy={s.y(Math.min(sse, 300))} r={5} className="mark" />
              </>
            )}
          </Chart>
        </div>
      </div>
      <div className="lab-grid">
        <div className="controls">
          <Slider label="slope θ₁ (intercept set to ȳ − θ₁x̄)" value={b1} min={-3} max={1} step={0.01} onChange={setB1} format={(v) => fmt(v, 2)} />
          <Slider label="noise level σ" value={sigma} min={0.5} max={6} step={0.1} onChange={setSigma} format={(v) => fmt(v, 2)} />
          <div className="btn-row">
            <button className="btn btn-primary" onClick={() => setB1(-1)}>
              Maximise likelihood
            </button>
            <button className="btn" onClick={() => setSigma(Number(Math.sqrt(sseAt(b1) / m).toFixed(2)))}>
              Set σ = √(SSE/m)
            </button>
          </div>
        </div>
        <Readout
          items={[
            { label: '𝓛(θ) = Πⱼ p(yⱼ|xⱼ)', value: fmt(L, 3) },
            { label: 'ℓ(θ) = log 𝓛', value: fmt(ll, 3), tone: 'accent' },
            { label: 'SSE', value: fmt(sse, 3) },
            { label: '−(m/2)log(2πσ²) − SSE/(2σ²)', value: fmt(-(m / 2) * Math.log(2 * Math.PI * sigma * sigma) - sse / (2 * sigma * sigma), 3) },
          ]}
        />
      </div>
    </div>
  );
}
