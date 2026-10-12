import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../../../components/Chart';
import { Readout, Segmented, Slider } from '../../../components/ui';
import { fmt, linspace, ols1d, rng } from '../../../lib/num';
import { meanOf, sseOf } from '../../../lib/tree';

const N = 41;
const XS = linspace(-1, 1, N);
const sd = (v: number[]) => Math.sqrt(sseOf(v) / v.length);

type Leaf = 'const' | 'linear';

/** Fit one leaf: a constant (the mean) or a least-squares line. Returns the prediction function and its SSE. */
function fitLeaf(x: number[], y: number[], kind: Leaf) {
  if (kind === 'const' || x.length < 2) {
    const m = meanOf(y);
    return { f: () => m, sse: sseOf(y) };
  }
  const o = ols1d(x, y)!;
  return { f: (v: number) => o.b0 + o.b1 * v, sse: y.reduce((s, v, i) => s + (v - o.b0 - o.b1 * x[i]) ** 2, 0) };
}

/** y = cos(πx) on [−1, 1]: one split, constant or linear leaves, and two ways of scoring the split. */
export function ModelTreeLab() {
  const [split, setSplit] = useState(20);
  const [kind, setKind] = useState<Leaf>('linear');
  const [noise, setNoise] = useState(0);
  const ys = useMemo(() => {
    const r = rng(11);
    return XS.map((x) => Math.cos(Math.PI * x) + noise * r.normal());
  }, [noise]);
  const crit = useMemo(() => {
    const whole = fitLeaf(XS, ys, 'linear').sse;
    return Array.from({ length: N - 3 }, (_, k) => {
      const i = k + 2;
      const L = ys.slice(0, i);
      const R = ys.slice(i);
      const sdr = sd(ys) - (i / N) * sd(L) - ((N - i) / N) * sd(R);
      const lin = fitLeaf(XS.slice(0, i), L, 'linear').sse + fitLeaf(XS.slice(i), R, 'linear').sse;
      return { i, s: (XS[i - 1] + XS[i]) / 2, sdr, linGain: whole - lin };
    });
  }, [ys]);
  const cur = crit.find((c) => c.i === split)!;
  const bestSdr = crit.reduce((b, c) => (c.sdr > b.sdr + 1e-12 ? c : b), crit[0]);
  const bestLin = crit.reduce((b, c) => (c.linGain > b.linGain + 1e-12 ? c : b), crit[0]);
  const left = fitLeaf(XS.slice(0, split), ys.slice(0, split), kind);
  const right = fitLeaf(XS.slice(split), ys.slice(split), kind);
  const one = fitLeaf(XS, ys, kind);
  const maxSdr = Math.max(...crit.map((c) => c.sdr));
  const maxLin = Math.max(...crit.map((c) => c.linGain));

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="leaf model"
          options={[
            { value: 'const', label: 'constant leaves (regression tree)' },
            { value: 'linear', label: 'linear leaves (model tree)' },
          ]}
          value={kind}
          onChange={setKind}
        />
      </div>
      <div className="lab-grid even">
        <div>
          <Chart W={420} H={300} x={[-1.05, 1.05]} y={[-1.6, 1.6]} xLabel="x" yLabel="y" ariaLabel="cos(πx) data with a one-split tree">
            {(s) => (
              <>
                <line x1={s.x(cur.s)} x2={s.x(cur.s)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <path d={pathOf(linspace(-1, 1, 200).map((v) => [s.x(v), s.y(Math.cos(Math.PI * v))]))} className="ln-truth" />
                <line x1={s.x(-1)} x2={s.x(1)} y1={s.y(one.f(-1))} y2={s.y(one.f(1))} className="ln-alt" strokeDasharray="5 4" />
                {XS.map((x, i) => (
                  <circle key={i} cx={s.x(x)} cy={s.y(ys[i])} r={3.4} className="pt" />
                ))}
                <line x1={s.x(-1)} x2={s.x(cur.s)} y1={s.y(left.f(-1))} y2={s.y(left.f(cur.s))} className="ln-fit" />
                <line x1={s.x(cur.s)} x2={s.x(1)} y1={s.y(right.f(cur.s))} y2={s.y(right.f(1))} className="ln-fit" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'cos(πx)', cls: 'ln-truth' },
              { label: 'no split (one leaf)', cls: 'ln-alt', shape: 'dash' },
              { label: 'one split, two leaves', cls: 'ln-fit' },
            ]}
          />
        </div>
        <div>
          <Chart W={420} H={300} x={[-1.05, 1.05]} y={[0, 1.08]} xLabel="split point s" yLabel="score ÷ its maximum" ariaLabel="Two split criteria across all split points">
            {(s) => (
              <>
                <line x1={s.x(cur.s)} x2={s.x(cur.s)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <path d={pathOf(crit.map((c) => [s.x(c.s), s.y(maxSdr > 0 ? c.sdr / maxSdr : 0)]))} className="ln-var" />
                <path d={pathOf(crit.map((c) => [s.x(c.s), s.y(maxLin > 0 ? c.linGain / maxLin : 0)]))} className="ln-fit" />
                <circle cx={s.x(bestSdr.s)} cy={s.y(1)} r={5.5} className="mark" />
                <circle cx={s.x(bestLin.s)} cy={s.y(1)} r={5.5} className="mark-acc" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'standard deviation reduction (SDR)', cls: 'ln-var' },
              { label: 'drop in squared error of linear leaves', cls: 'ln-fit' },
            ]}
          />
        </div>
      </div>
      <div className="lab-grid">
        <div className="controls">
          <Slider label="split point s" value={split} min={2} max={N - 2} step={1} onChange={setSplit} format={() => fmt(cur.s, 3)} />
          <Slider label="noise standard deviation" value={noise} min={0} max={0.3} step={0.01} onChange={setNoise} format={(v) => fmt(v, 2)} />
        </div>
        <Readout
          items={[
            { label: 'SSE, one leaf', value: fmt(one.sse, 3) },
            { label: 'SSE, two leaves', value: fmt(left.sse + right.sse, 3), tone: 'accent' },
            { label: 'SDR at s', value: fmt(cur.sdr, 4) },
            { label: 'best s by SDR', value: fmt(bestSdr.s, 3) },
            { label: 'best s for linear leaves', value: fmt(bestLin.s, 3) },
          ]}
        />
      </div>
    </div>
  );
}
