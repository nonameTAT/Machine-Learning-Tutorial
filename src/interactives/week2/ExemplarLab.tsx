import { useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../../components/Chart';
import { Readout } from '../../components/ui';
import { clamp, fmt, linspace, mean } from '../../lib/num';

const PRESETS: { label: string; xs: number[] }[] = [
  { label: '0, 2, 10 (worked example)', xs: [0, 2, 10] },
  { label: '1, 5, 6', xs: [1, 5, 6] },
  { label: 'with an outlier', xs: [1, 2, 3, 4, 13] },
  { label: 'four points', xs: [1, 3, 6, 11] },
];
const ADD = [5, 12, 7, 3.5, 9, 0.5];

/** Mean (minimises squared distance), median (minimises absolute distance) and medoid (best observed point). */
export function ExemplarLab() {
  const [xs, setXs] = useState<number[]>(PRESETS[0].xs);
  const [drag, setDrag] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const S = (c: number) => xs.reduce((s, x) => s + (x - c) ** 2, 0);
  const A = (c: number) => xs.reduce((s, x) => s + Math.abs(x - c), 0);
  const mu = mean(xs);
  const sorted = [...xs].sort((a, b) => a - b);
  const n = sorted.length;
  const medLo = sorted[Math.floor((n - 1) / 2)];
  const medHi = sorted[Math.floor(n / 2)];
  const totals = xs.map((x) => A(x));
  const minTot = Math.min(...totals);
  const medoids = xs.filter((_, i) => Math.abs(totals[i] - minTot) < 1e-9);
  const grid = linspace(-2, 14, 321);
  const Smax = Math.max(S(-2), S(14));

  const chartProps = {
    W: 560,
    x: [-2, 14] as [number, number],
  };

  return (
    <div className="lab-grid">
      <div>
        <div className="panel-title">The observations (drag them) and three candidate exemplars</div>
        <Chart
          {...chartProps}
          H={120}
          y={[-1, 1]}
          yTicks={[]}
          grid={false}
          svgRef={ref}
          className="draggable"
          ariaLabel="Observations on a line"
          onPointerMove={(e, s) => {
            if (drag === null || !ref.current) return;
            const q = svgPoint(ref.current, e);
            const v = Math.round(clamp(s.ix(q.x), -1.5, 13.5) * 10) / 10;
            setXs((prev) => prev.map((x, i) => (i === drag ? v : x)));
          }}
          onPointerUp={() => setDrag(null)}
        >
          {(s) => (
            <>
              <line x1={s.left} x2={s.right} y1={s.y(0)} y2={s.y(0)} stroke="var(--line)" />
              <rect x={s.x(medLo) - 2} width={s.x(medHi) - s.x(medLo) + 4} y={s.y(0.75)} height={s.y(-0.75) - s.y(0.75)} className="rg-pos" />
              <line x1={s.x(mu)} x2={s.x(mu)} y1={s.y(0.85)} y2={s.y(-0.85)} className="ln-alt" />
              {medoids.map((m, i) => (
                <circle key={i} cx={s.x(m)} cy={s.y(0)} r={12} className="ring-miss" style={{ stroke: 'var(--c-fit)' }} />
              ))}
              {xs.map((x, i) => (
                <circle
                  key={i}
                  cx={s.x(x)}
                  cy={s.y(0)}
                  r={drag === i ? 9 : 7}
                  className="pt drag"
                  onPointerDown={(e) => {
                    (e.target as Element).setPointerCapture?.(e.pointerId);
                    setDrag(i);
                  }}
                />
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'mean', cls: 'ln-alt' },
            { label: n % 2 ? 'median' : 'median (any point in the band)', cls: 'rg-pos', shape: 'box' },
            { label: 'medoid', cls: 'ln-fit', shape: 'dot' },
          ]}
        />
        <div className="panel-title" style={{ marginTop: 10 }}>
          Total squared distance Σ(xⱼ − c)² — minimised by the mean
        </div>
        <Chart {...chartProps} H={170} y={[0, Smax]} xLabel="candidate centre c" ariaLabel="Sum of squared distances">
          {(s) => (
            <>
              <path d={pathOf(grid.map((c) => [s.x(c), s.y(S(c))]))} className="ln-alt" />
              <circle cx={s.x(mu)} cy={s.y(S(mu))} r={5} fill="var(--c-alt)" />
            </>
          )}
        </Chart>
        <div className="panel-title" style={{ marginTop: 10 }}>
          Total absolute distance Σ|xⱼ − c| — minimised by the median; dots = observed candidates
        </div>
        <Chart {...chartProps} H={170} y={[0, Math.max(A(-2), A(14))]} xLabel="candidate centre c" ariaLabel="Sum of absolute distances">
          {(s) => (
            <>
              <path d={pathOf(grid.map((c) => [s.x(c), s.y(A(c))]))} className="ln-fit" />
              {xs.map((x, i) => (
                <circle key={i} cx={s.x(x)} cy={s.y(totals[i])} r={5} className={`pt ${Math.abs(totals[i] - minTot) < 1e-9 ? 'hi' : ''}`} />
              ))}
            </>
          )}
        </Chart>
      </div>
      <div className="controls">
        <div className="btn-row">
          {PRESETS.map((p) => (
            <button key={p.label} className="btn" onClick={() => setXs(p.xs)}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="btn-row">
          <button className="btn" disabled={xs.length >= 9} onClick={() => setXs((v) => [...v, ADD[v.length % ADD.length]])}>
            + point
          </button>
          <button className="btn" disabled={xs.length <= 2} onClick={() => setXs((v) => v.slice(0, -1))}>
            − point
          </button>
        </div>
        <Readout
          items={[
            { label: 'mean', value: fmt(mu, 3), tone: 'accent' },
            { label: 'Σ squared at mean', value: fmt(S(mu), 3) },
            { label: 'median', value: medLo === medHi ? fmt(medLo, 2) : `[${fmt(medLo, 2)}, ${fmt(medHi, 2)}]` },
            { label: 'medoid', value: medoids.map((m) => fmt(m, 2)).join(' or ') },
            { label: 'Σ |·| at medoid', value: fmt(minTot, 3) },
          ]}
        />
        <div className="table-wrap num">
          <table>
            <thead>
              <tr>
                <th>candidate xᵢ</th>
                <th>Σⱼ |xⱼ − xᵢ|</th>
              </tr>
            </thead>
            <tbody>
              {xs.map((x, i) => (
                <tr key={i} style={{ background: Math.abs(totals[i] - minTot) < 1e-9 ? 'var(--accent-soft)' : undefined }}>
                  <td>{fmt(x, 2)}</td>
                  <td>{fmt(totals[i], 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          In one dimension the geometric median is the ordinary median. Finding the medoid compares every observed point with every other: n² distances.
        </p>
      </div>
    </div>
  );
}
