import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../../../components/Chart';
import { Readout, Slider } from '../../../components/ui';
import { fmt, linspace, rng } from '../../../lib/num';
import { growRegTree, predictReg, regLeaves } from '../../../lib/tree';

const f = (x: number) => 0.3 * Math.cos(x) + 0.4 * Math.log(10 * x);
const SIGMA = 0.2;
const MAXD = 8;
const XD: [number, number] = [0, 12];

function sample(n: number, seed: number) {
  const r = rng(seed);
  const x = Array.from({ length: n }, () => r.range(1, 10));
  return { x, y: x.map((v) => f(v) + SIGMA * r.normal()) };
}

/** A regression tree on y = 0.3 cos x + 0.4 ln(10x) + noise, observed only for 1 ≤ x ≤ 10. */
export function RegTreeLab() {
  const [depth, setDepth] = useState(3);
  const [minLeaf, setMinLeaf] = useState(1);
  const [seed, setSeed] = useState(200);
  const train = useMemo(() => sample(100, seed), [seed]);
  const test = useMemo(() => sample(2000, seed + 1), [seed]);
  const curve = useMemo(
    () =>
      Array.from({ length: MAXD + 1 }, (_, d) => {
        const t = growRegTree(train.x, train.y, { maxDepth: d, minLeaf });
        const mse = (s: { x: number[]; y: number[] }) => s.x.reduce((a, v, i) => a + (s.y[i] - predictReg(t, v)) ** 2, 0) / s.x.length;
        return { d, tree: t, tr: mse(train), te: mse(test), leaves: regLeaves(t).length };
      }),
    [train, test, minLeaf],
  );
  const cur = curve[depth];
  const steps = regLeaves(cur.tree).map((l) => [Math.max(l.lo, XD[0]), Math.min(l.hi, XD[1]), l.mean] as const);
  const best = curve.reduce((b, c) => (c.te < b.te - 1e-12 ? c : b), curve[0]);
  return (
    <div>
      <div className="lab-grid">
        <div>
          <Chart W={560} H={320} x={XD} y={[0.2, 2.2]} xLabel="x (training inputs only between 1 and 10)" yLabel="y" ariaLabel="A piecewise-constant regression tree fit">
            {(s) => (
              <>
                <rect x={s.x(0)} y={s.top} width={s.x(1) - s.x(0)} height={s.bottom - s.top} className="no-data" />
                <rect x={s.x(10)} y={s.top} width={s.x(12) - s.x(10)} height={s.bottom - s.top} className="no-data" />
                <path d={pathOf(linspace(0.15, 12, 300).map((v) => [s.x(v), s.y(f(v))]))} className="ln-truth" />
                {train.x.map((v, i) => (
                  <circle key={i} cx={s.x(v)} cy={s.y(train.y[i])} r={3.2} className="pt" />
                ))}
                <path d={steps.map(([a, b, m], i) => `${i ? 'L' : 'M'}${s.x(a)},${s.y(m)}L${s.x(b)},${s.y(m)}`).join('')} className="ln-fit" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'training data', cls: 'pt', shape: 'dot' },
              { label: 'true mean f(x)', cls: 'ln-truth' },
              { label: 'tree prediction (one constant per leaf)', cls: 'ln-fit' },
              { label: 'no training data', cls: 'no-data', shape: 'box' },
            ]}
          />
        </div>
        <div className="controls">
          <Slider label="maximum depth" value={depth} min={0} max={MAXD} step={1} onChange={setDepth} />
          <Slider label="minimum examples per leaf" value={minLeaf} min={1} max={15} step={1} onChange={setMinLeaf} />
          <button className="btn" onClick={() => setSeed((v) => v + 2)}>
            New training sample
          </button>
          <Readout
            items={[
              { label: 'leaves', value: String(cur.leaves) },
              { label: 'training MSE', value: fmt(cur.tr, 4) },
              { label: 'test MSE', value: fmt(cur.te, 4), tone: 'accent' },
              { label: 'noise variance σ²', value: fmt(SIGMA ** 2, 4) },
            ]}
          />
          <Chart W={300} H={170} x={[-0.5, MAXD + 0.5]} y={[0, Math.max(...curve.map((c) => c.te)) * 1.1]} xLabel="depth" yLabel="MSE" ariaLabel="Training and test MSE by depth">
            {(s) => (
              <>
                <line x1={s.left} x2={s.right} y1={s.y(SIGMA ** 2)} y2={s.y(SIGMA ** 2)} className="ln-noise" />
                <path d={pathOf(curve.map((c) => [s.x(c.d), s.y(c.tr)]))} className="ln-data" />
                <path d={pathOf(curve.map((c) => [s.x(c.d), s.y(c.te)]))} className="ln-alt" />
                <circle cx={s.x(best.d)} cy={s.y(best.te)} r={5} className="mark-acc" />
                <line x1={s.x(depth)} x2={s.x(depth)} y1={s.top} y2={s.bottom} className="ln-ghost" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'train', cls: 'ln-data' },
              { label: 'test', cls: 'ln-alt' },
              { label: 'σ²', cls: 'ln-noise', shape: 'dash' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
