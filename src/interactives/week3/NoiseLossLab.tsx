import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { Readout, Segmented, Slider } from '../../components/ui';
import { fmt, linspace } from '../../lib/num';

type Noise = 'gauss' | 'laplace';

/** The negative log density of the noise is the loss each residual pays (σ = b = 1, constants dropped). */
export function NoiseLossLab() {
  const [noise, setNoise] = useState<Noise>('gauss');
  const [b1, setB1] = useState(0);
  const [b2, setB2] = useState(2);
  const A = [1, 1];
  const B = [b1, b2];
  const loss = (e: number, n: Noise) => (n === 'gauss' ? (e * e) / 2 : Math.abs(e));
  // log-likelihoods with σ = 1 (Gaussian) or b = 1 (Laplace)
  const ll = (r: number[], n: Noise) =>
    r.reduce((s, e) => s + (n === 'gauss' ? -0.5 * Math.log(2 * Math.PI) - (e * e) / 2 : -Math.log(2) - Math.abs(e)), 0);
  const la = ll(A, noise);
  const lb = ll(B, noise);
  const es = linspace(-3, 3, 241);
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={300} x={[-3, 3]} y={[0, 4.6]} xLabel="residual ε = y − h(x)" yLabel="−log p(ε) + const" ariaLabel="Loss implied by the noise model">
          {(s) => (
            <>
              <path d={pathOf(es.map((e) => [s.x(e), s.y(loss(e, noise === 'gauss' ? 'laplace' : 'gauss'))]))} className="ln-ghost" />
              <path d={pathOf(es.map((e) => [s.x(e), s.y(loss(e, noise))]))} className="ln-fit" />
              {A.map((e, i) => (
                <circle key={`a${i}`} cx={s.x(e)} cy={s.y(loss(e, noise))} r={6} className="pt pos" />
              ))}
              {B.map((e, i) => (
                <rect key={`b${i}`} x={s.x(e) - 5} y={s.y(loss(e, noise)) - 5} width={10} height={10} className="pt neg" />
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: noise === 'gauss' ? 'Gaussian: ε²/2 (squared error)' : 'Laplace: |ε| (absolute error)', cls: 'ln-fit' },
            { label: 'the other noise model', cls: 'ln-ghost', shape: 'dash' },
            { label: 'model A residuals (1, 1)', cls: 'pt pos', shape: 'dot' },
            { label: 'model B residuals', cls: 'pt neg', shape: 'box' },
          ]}
        />
      </div>
      <div className="controls">
        <Segmented
          options={[
            { value: 'gauss', label: 'Gaussian noise' },
            { value: 'laplace', label: 'Laplace noise' },
          ]}
          value={noise}
          onChange={setNoise}
        />
        <Slider label="model B residual 1" value={b1} min={-3} max={3} step={0.1} onChange={setB1} format={(v) => fmt(v, 1)} />
        <Slider label="model B residual 2" value={b2} min={-3} max={3} step={0.1} onChange={setB2} format={(v) => fmt(v, 1)} />
        <Readout
          items={[
            { label: 'SSE: A / B', value: `${fmt(2, 2)} / ${fmt(b1 * b1 + b2 * b2, 2)}` },
            { label: 'Σ|e|: A / B', value: `${fmt(2, 2)} / ${fmt(Math.abs(b1) + Math.abs(b2), 2)}` },
            { label: 'log-lik A', value: fmt(la, 3) },
            { label: 'log-lik B', value: fmt(lb, 3) },
            { label: 'ML prefers', value: Math.abs(la - lb) < 1e-9 ? 'tie' : la > lb ? 'model A' : 'model B', tone: 'accent' },
          ]}
        />
        <p className="small muted">σ = 1 for the Gaussian, scale b = 1 for the Laplace density p(ε) = ½e^(−|ε|).</p>
      </div>
    </div>
  );
}
