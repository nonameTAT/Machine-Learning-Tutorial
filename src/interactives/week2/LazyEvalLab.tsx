import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { Readout, Slider, Toggle } from '../../components/ui';
import { fmt } from '../../lib/num';
import { loocvError, resubError } from '../../lib/classify';
import { knnData } from './KNNClassLab';

/** Training error with self-matches versus leave-one-out error, for every k. */
export function LazyEvalLab() {
  const { X, y } = useMemo(() => knnData(), []);
  const m = X.length;
  const d = X[0].length;
  const [k, setK] = useState(1);
  const [weighted, setWeighted] = useState(false);
  const ks = Array.from({ length: m - 1 }, (_, i) => i + 1);
  const curves = useMemo(() => ks.map((kk) => ({ k: kk, train: resubError(X, y, kk, weighted), loo: loocvError(X, y, kk, weighted) })), [weighted]); // eslint-disable-line react-hooks/exhaustive-deps
  const cur = curves[k - 1];
  const best = curves.reduce((b, c) => (c.loo < b.loo ? c : b), curves[0]);
  const yMax = Math.max(0.6, ...curves.map((c) => c.loo)) + 0.05;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={300} x={[0, m]} y={[0, yMax]} xLabel="neighbours k" yLabel="error rate" ariaLabel="Training and leave-one-out error against k">
          {(s) => (
            <>
              <path d={pathOf(curves.map((c) => [s.x(c.k), s.y(c.train)]))} className="ln-fit" />
              <path d={pathOf(curves.map((c) => [s.x(c.k), s.y(c.loo)]))} className="ln-alt" />
              <line x1={s.x(k)} x2={s.x(k)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeDasharray="4 3" />
              <circle cx={s.x(best.k)} cy={s.y(best.loo)} r={6} className="mark" />
              <circle cx={s.x(k)} cy={s.y(cur.loo)} r={5} fill="var(--c-alt)" />
              <circle cx={s.x(k)} cy={s.y(cur.train)} r={5} fill="var(--c-fit)" />
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'training error (each point may retrieve itself)', cls: 'ln-fit' },
            { label: 'leave-one-out error', cls: 'ln-alt' },
            { label: 'lowest LOOCV error', cls: 'mark', shape: 'dot' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="neighbours k" value={k} min={1} max={m - 1} step={1} onChange={setK} />
        <Toggle label="Distance-weighted vote" checked={weighted} onChange={setWeighted} />
        <Readout
          items={[
            { label: 'training error', value: fmt(cur.train, 3) },
            { label: 'LOOCV error', value: fmt(cur.loo, 3), tone: 'accent' },
            { label: 'best k by LOOCV', value: `${best.k} (${fmt(best.loo, 3)})` },
          ]}
        />
        <div className="panel-title">Brute-force cost for this data (m = {m}, d = {d})</div>
        <Readout
          items={[
            { label: 'storage', value: `m·d = ${m * d} numbers` },
            { label: 'one query', value: `${m} distances` },
            { label: 'LOOCV, one k', value: `m(m−1) = ${m * (m - 1)} distances` },
          ]}
        />
        <p className="small muted">Same 50-point dataset as lesson 16.</p>
      </div>
    </div>
  );
}
