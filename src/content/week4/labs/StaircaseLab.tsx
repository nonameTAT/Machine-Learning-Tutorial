import { useMemo, useState } from 'react';
import { Chart, Legend } from '../../../components/Chart';
import { CLASS_LEGEND } from '../../../components/chartParts';
import { Readout, Segmented, Slider } from '../../../components/ui';
import { errorCount, growTree, leafCount, truncate } from '../../../lib/tree';
import { LeafRegions, Points, sample2d } from './regions';

const XD: [number, number] = [0, 1];

/** A diagonal boundary, learned with single-feature thresholds: every extra level refines the staircase. */
export function StaircaseLab() {
  const [depth, setDepth] = useState(3);
  const [mode, setMode] = useState<'tree' | 'oblique'>('tree');
  const train = useMemo(() => sample2d('diagonal', 150, 7, 0), []);
  const test = useMemo(() => sample2d('diagonal', 3000, 99, 0), []);
  const full = useMemo(() => growTree(train.X, train.y, { k: 2, maxDepth: 10 }), [train]);
  const tree = truncate(full, depth);
  const leaves = leafCount(tree);
  const oblique = mode === 'oblique';
  return (
    <div className="lab-grid">
      <div>
        <Chart W={460} H={440} x={XD} y={XD} xLabel="x₁" yLabel="x₂" ariaLabel="A tree's rectangular regions approximating a diagonal boundary">
          {(s) => (
            <>
              {oblique ? (
                <>
                  <polygon points={`${s.x(0)},${s.y(0)} ${s.x(1)},${s.y(1)} ${s.x(0)},${s.y(1)}`} className="rg-pos" />
                  <polygon points={`${s.x(0)},${s.y(0)} ${s.x(1)},${s.y(1)} ${s.x(1)},${s.y(0)}`} className="rg-neg" />
                </>
              ) : (
                <LeafRegions s={s} tree={tree} />
              )}
              <line x1={s.x(0)} y1={s.y(0)} x2={s.x(1)} y2={s.y(1)} className="ln-truth" />
              <Points s={s} X={train.X} y={train.y} r={3.6} />
            </>
          )}
        </Chart>
        <Legend items={[...CLASS_LEGEND, { label: 'true boundary x₂ = x₁', cls: 'ln-truth' }]} />
      </div>
      <div className="controls">
        <Segmented
          label="kind of test"
          options={[
            { value: 'tree', label: 'axis-parallel tree' },
            { value: 'oblique', label: 'one oblique test' },
          ]}
          value={mode}
          onChange={setMode}
        />
        {!oblique && <Slider label="maximum depth" value={depth} min={1} max={10} step={1} onChange={setDepth} />}
        <Readout
          items={
            oblique
              ? [
                  { label: 'tests', value: '1: x₂ − x₁ > 0' },
                  { label: 'leaves', value: '2' },
                  { label: 'test error', value: '0', tone: 'good' },
                ]
              : [
                  { label: 'tests (internal nodes)', value: String(leaves - 1) },
                  { label: 'leaves', value: String(leaves) },
                  { label: 'training errors', value: `${errorCount(tree, train.X, train.y)}/150` },
                  { label: 'error on 3000 new points', value: `${((100 * errorCount(tree, test.X, test.y)) / 3000).toFixed(1)}%`, tone: 'accent' },
                ]
          }
        />
        <p className="small muted">
          Every split is a vertical or horizontal cut, so leaves are rectangles. A diagonal can only be approached by a staircase whose steps need ever more
          leaves — and the steps can only be placed where training points show the class changes.
        </p>
      </div>
    </div>
  );
}
