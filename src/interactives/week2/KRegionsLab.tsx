import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { Readout, Slider, Toggle } from '../../components/ui';
import { fmt, linspace } from '../../lib/num';
import { loocvError, neighbours, resubError, vote } from '../../lib/classify';
import { CLASS_LEGEND, ClassPt, Regions, labelGrid } from './common';
import { KNN_XD, KNN_YD, knnData, trueBoundary } from './KNNClassLab';

const NX = 60;
const NY = 42;

/** Decision regions of k-NN as k grows, with and without inverse-square distance weighting. */
export function KRegionsLab() {
  const { X, y } = useMemo(() => knnData(), []);
  const m = X.length;
  const [k, setK] = useState(1);
  const [weighted, setWeighted] = useState(false);
  const [truth, setTruth] = useState(false);
  const grid = useMemo(() => labelGrid(KNN_XD, KNN_YD, NX, NY, (a, b) => vote(neighbours(X, [a, b], k), y, weighted).winner), [X, y, k, weighted]);
  const train = useMemo(() => resubError(X, y, k, weighted), [X, y, k, weighted]);
  const loo = useMemo(() => loocvError(X, y, Math.min(k, m - 1), weighted), [X, y, k, weighted, m]);
  const pos = y.filter((v) => v === 1).length;
  const constant = grid.every((v) => v === grid[0]);
  const xs = linspace(KNN_XD[0], KNN_XD[1], 200);

  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={402} x={KNN_XD} y={KNN_YD} xLabel="x₁" yLabel="x₂" ariaLabel="k-NN decision regions">
          {(s) => (
            <>
              <Regions s={s} grid={grid} nx={NX} ny={NY} />
              {truth && <path d={pathOf(xs.map((a) => [s.x(a), s.y(trueBoundary(a))]))} className="ln-truth" />}
              {X.map((x, i) => (
                <ClassPt key={i} cx={s.x(x[0])} cy={s.y(x[1])} y={y[i]} />
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            ...CLASS_LEGEND,
            { label: 'predicted positive', cls: 'rg-pos', shape: 'box' },
            { label: 'predicted negative', cls: 'rg-neg', shape: 'box' },
            ...(truth ? [{ label: 'true boundary (before label noise)', cls: 'ln-truth', shape: 'dash' as const }] : []),
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="neighbours k" value={k} min={1} max={m} step={1} onChange={setK} format={(v) => (v === m ? `${v} (= m)` : String(v))} />
        <Toggle label="Distance-weighted vote (w = 1/d²)" checked={weighted} onChange={setWeighted} />
        <Toggle label="Show the true boundary" checked={truth} onChange={setTruth} />
        <Readout
          items={[
            { label: 'training error (self included)', value: fmt(train, 3) },
            { label: 'LOOCV error', value: fmt(loo, 3), tone: 'accent' },
            { label: 'class balance', value: `${pos} pos / ${m - pos} neg` },
          ]}
        />
        {constant && (
          <div className="status">Every query gets the same label: the training-majority class. The neighbourhood is no longer local.</div>
        )}
        {k === m && weighted && !constant && (
          <div className="status good">All m points vote, but nearer ones count more — the prediction still varies with the query (Shepard-style weighting).</div>
        )}
        <p className="small muted">LOOCV uses at most m − 1 neighbours, since one point is always held out.</p>
      </div>
    </div>
  );
}
