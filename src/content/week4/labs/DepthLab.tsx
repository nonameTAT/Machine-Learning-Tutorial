import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../../../components/Chart';
import { CLASS_LEGEND } from '../../../components/chartParts';
import { Readout, Segmented, Slider } from '../../../components/ui';
import { fmt, linspace } from '../../../lib/num';
import { errorCount, growTree, leafCount, truncate } from '../../../lib/tree';
import { LeafRegions, Points, sample2d, wavy, type Shape } from './regions';

const MAXD = 12;
const NTR = 250;
const NVA = 2000;
const XD: [number, number] = [0, 1];

/** Grow a tree on noisy data and watch training error fall while held-out error turns back up. */
export function DepthLab({ initialShape = 'wavy' }: { initialShape?: Shape }) {
  const [shape, setShape] = useState<Shape>(initialShape);
  const [noise, setNoise] = useState(0.1);
  const [seed, setSeed] = useState(1);
  const [depth, setDepth] = useState(3);
  const [minLeaf, setMinLeaf] = useState(1);
  const train = useMemo(() => sample2d(shape, NTR, seed, noise), [shape, seed, noise]);
  const val = useMemo(() => sample2d(shape, NVA, 5000 + seed, noise), [shape, seed, noise]);
  const full = useMemo(() => growTree(train.X, train.y, { k: 2, maxDepth: MAXD, minLeaf }), [train, minLeaf]);
  const curve = useMemo(
    () =>
      Array.from({ length: MAXD }, (_, i) => {
        const t = truncate(full, i + 1);
        return { d: i + 1, tr: errorCount(t, train.X, train.y) / NTR, va: errorCount(t, val.X, val.y) / NVA, leaves: leafCount(t) };
      }),
    [full, train, val],
  );
  const tree = truncate(full, depth);
  const cur = curve[depth - 1];
  const best = curve.reduce((b, c) => (c.va < b.va - 1e-12 ? c : b), curve[0]);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="true boundary"
          options={[
            { value: 'wavy', label: 'wavy curve' },
            { value: 'xor', label: 'XOR quadrants' },
          ]}
          value={shape}
          onChange={setShape}
        />
        <button className="btn" onClick={() => setSeed((s) => s + 1)}>
          New training sample
        </button>
      </div>
      <div className="lab-grid even">
        <div>
          <Chart W={420} H={400} x={XD} y={XD} xLabel="x₁" yLabel="x₂" ariaLabel="Regions of the depth-limited tree with the training points">
            {(s) => (
              <>
                <LeafRegions s={s} tree={tree} />
                {shape === 'wavy' ? (
                  <path d={pathOf(linspace(0, 1, 120).map((a) => [s.x(a), s.y(wavy(a))]))} className="ln-truth" />
                ) : (
                  <>
                    <line x1={s.x(0.5)} x2={s.x(0.5)} y1={s.y(0)} y2={s.y(1)} className="ln-truth" />
                    <line x1={s.x(0)} x2={s.x(1)} y1={s.y(0.5)} y2={s.y(0.5)} className="ln-truth" />
                  </>
                )}
                <Points s={s} X={train.X} y={train.y} r={3.4} />
              </>
            )}
          </Chart>
          <Legend items={[...CLASS_LEGEND, { label: 'noiseless boundary', cls: 'ln-truth' }]} />
        </div>
        <div>
          <Chart W={420} H={300} x={[0.5, MAXD + 0.5]} y={[0, 0.55]} xTicks={[1, 2, 4, 6, 8, 10, 12]} xLabel="maximum depth" yLabel="error rate" ariaLabel="Training and held-out error against depth">
            {(s) => (
              <>
                <line x1={s.x(depth)} x2={s.x(depth)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <path d={pathOf(curve.map((c) => [s.x(c.d), s.y(c.tr)]))} className="ln-data" />
                <path d={pathOf(curve.map((c) => [s.x(c.d), s.y(c.va)]))} className="ln-alt" />
                <line x1={s.left} x2={s.right} y1={s.y(noise)} y2={s.y(noise)} className="ln-noise" />
                <circle cx={s.x(best.d)} cy={s.y(best.va)} r={6} className="mark-acc" />
                <circle cx={s.x(depth)} cy={s.y(cur.tr)} r={4.5} className="mark" />
                <circle cx={s.x(depth)} cy={s.y(cur.va)} r={4.5} className="mark" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'training error', cls: 'ln-data' },
              { label: 'held-out error (2000 new points)', cls: 'ln-alt' },
              { label: 'label-noise rate', cls: 'ln-noise', shape: 'dash' },
              { label: 'lowest held-out error', cls: 'mark-acc', shape: 'dot' },
            ]}
          />
          <div className="controls">
            <Slider label="maximum depth" value={depth} min={1} max={MAXD} step={1} onChange={setDepth} />
            <Slider label="minimum examples per leaf" value={minLeaf} min={1} max={20} step={1} onChange={setMinLeaf} />
            <Slider label="label noise (fraction flipped)" value={noise} min={0} max={0.3} step={0.01} onChange={setNoise} format={(v) => fmt(v, 2)} />
            <Readout
              items={[
                { label: 'leaves', value: String(cur.leaves) },
                { label: 'training error', value: fmt(cur.tr, 3) },
                { label: 'held-out error', value: fmt(cur.va, 3), tone: 'accent' },
                { label: 'best depth (held-out)', value: String(best.d) },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
