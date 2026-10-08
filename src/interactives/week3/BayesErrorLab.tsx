import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { Readout, Slider } from '../../components/ui';
import { fmt, linspace } from '../../lib/num';

const gauss = (x: number, mu: number) => Math.exp(-((x - mu) ** 2) / 2) / Math.sqrt(2 * Math.PI);
const XS = linspace(-6, 6, 1201);
const DX = XS[1] - XS[0];

/** Two overlapping classes: the Bayes error is the area under min_c p(x, c); any threshold rule pays at least that. */
export function BayesErrorLab() {
  const [sep, setSep] = useState(2);
  const [prior, setPrior] = useState(0.5);
  const [t, setT] = useState(0.5);
  const j0 = (x: number) => (1 - prior) * gauss(x, -sep / 2);
  const j1 = (x: number) => prior * gauss(x, sep / 2);
  const bayesErr = XS.reduce((s, x) => s + Math.min(j0(x), j1(x)), 0) * DX;
  const ruleErr = XS.reduce((s, x) => s + (x > t ? j0(x) : j1(x)), 0) * DX;
  // Bayes boundary: where the joints cross (between the means)
  const bnd = Math.log((1 - prior) / prior) / sep;
  const yMax = Math.max(...XS.map((x) => Math.max(j0(x), j1(x)))) * 1.1;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={300} x={[-5, 5]} y={[0, yMax]} xLabel="feature x" yLabel="p(x, c) = p(x | c) P(c)" ariaLabel="Joint densities and the Bayes error">
          {(s) => {
            const fillPath = (pts: [number, number][]) => (pts.length ? `M${s.x(pts[0][0])},${s.y(0)}${pts.map(([x, y]) => `L${s.x(x)},${s.y(y)}`).join('')}L${s.x(pts[pts.length - 1][0])},${s.y(0)}Z` : '');
            // error of the threshold rule: class-1 mass left of t plus class-2 mass right of t
            const missed = XS.filter((x) => x <= t).map((x) => [x, j1(x)] as [number, number]);
            const falseAlarm = XS.filter((x) => x >= t).map((x) => [x, j0(x)] as [number, number]);
            return (
              <>
                <path d={fillPath(missed)} className="area-var" />
                <path d={fillPath(falseAlarm)} className="area-var" />
                <path d={fillPath(XS.map((x) => [x, Math.min(j0(x), j1(x))]))} className="area-bad" />
                <path d={pathOf(XS.map((x) => [s.x(x), s.y(j0(x))]))} className="ln-neg" />
                <path d={pathOf(XS.map((x) => [s.x(x), s.y(j1(x))]))} className="ln-pos" />
                {Number.isFinite(bnd) && <line x1={s.x(bnd)} x2={s.x(bnd)} y1={s.top} y2={s.bottom} className="ln-ghost" />}
                <line x1={s.x(t)} x2={s.x(t)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeWidth={2} />
              </>
            );
          }}
        </Chart>
        <Legend
          items={[
            { label: 'class 1: p(x | c₁)P(c₁)', cls: 'ln-pos' },
            { label: 'class 2: p(x | c₂)P(c₂)', cls: 'ln-neg' },
            { label: 'Bayes error (unavoidable overlap)', cls: 'area-bad', shape: 'box' },
            { label: 'error paid by your threshold', cls: 'area-var', shape: 'box' },
            { label: 'Bayes boundary', cls: 'ln-ghost', shape: 'dash' },
            { label: 'your threshold', cls: 'ln-fit' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="class separation" value={sep} min={0} max={5} step={0.1} onChange={setSep} format={(v) => fmt(v, 1)} />
        <Slider label="prior P(c₁)" value={prior} min={0.05} max={0.95} step={0.01} onChange={setPrior} format={(v) => fmt(v, 2)} />
        <Slider label="your threshold: predict c₁ if x > t" value={t} min={-4} max={4} step={0.05} onChange={setT} format={(v) => fmt(v, 2)} />
        <Readout
          items={[
            { label: 'Bayes error R*', value: fmt(bayesErr, 4), tone: 'accent' },
            { label: 'best accuracy', value: fmt(1 - bayesErr, 4) },
            { label: 'your rule’s error', value: fmt(ruleErr, 4) },
            { label: 'excess over R*', value: fmt(ruleErr - bayesErr, 4) },
          ]}
        />
        <p className="small muted">
          Shaded amber: the error your threshold pays. Its area is never smaller than the red overlap, and equals it when the threshold sits on the Bayes
          boundary.
        </p>
      </div>
    </div>
  );
}
