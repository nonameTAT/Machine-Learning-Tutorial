import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../../../components/Chart';
import { ClassPt, CLASS_LEGEND } from '../../../components/chartParts';
import { Readout, Slider, Toggle } from '../../../components/ui';
import { sigmoid } from '../../../lib/classify';
import { fmt, linspace, ols1d } from '../../../lib/num';

// Overlapping classes, so logistic regression has a finite maximum-likelihood fit.
const NEG = [1, 1.8, 2.5, 3.2, 4.0, 5.2];
const POS = [4.6, 5.8, 6.4, 7.0, 7.8, 8.5];
const XD: [number, number] = [0, 31];
const XS = linspace(XD[0], XD[1], 400);

/** Logistic regression by Newton's method (a handful of iterations suffices for one feature). */
function logistic(x: number[], y: number[]) {
  let b0 = 0;
  let b1 = 0;
  for (let it = 0; it < 60; it++) {
    let g0 = 0;
    let g1 = 0;
    let h00 = 1e-9;
    let h01 = 0;
    let h11 = 1e-9;
    x.forEach((v, i) => {
      const p = sigmoid(b0 + b1 * v);
      const w = p * (1 - p);
      g0 += y[i] - p;
      g1 += (y[i] - p) * v;
      h00 += w;
      h01 += w * v;
      h11 += w * v * v;
    });
    const det = h00 * h11 - h01 * h01;
    b0 += (h11 * g0 - h01 * g1) / det;
    b1 += (h00 * g1 - h01 * g0) / det;
  }
  return { b0, b1 };
}

/** The same 0/1 data fitted by a least-squares line and by logistic regression; add one easy positive far to the right. */
export function LinearProbLab() {
  const [extra, setExtra] = useState(true);
  const [far, setFar] = useState(24);
  const x = [...NEG, ...POS, ...(extra ? [far] : [])];
  const y = [...NEG.map(() => 0), ...POS.map(() => 1), ...(extra ? [1] : [])];
  const ls = ols1d(x, y)!;
  const lg = logistic(x, y);
  const base = useMemo(() => {
    const xb = [...NEG, ...POS];
    const yb = [...NEG.map(() => 0), ...POS.map(() => 1)];
    const l = ols1d(xb, yb)!;
    const g = logistic(xb, yb);
    return { ls: (0.5 - l.b0) / l.b1, lg: -g.b0 / g.b1 };
  }, []);
  const lsCross = (0.5 - ls.b0) / ls.b1;
  const lgCross = -lg.b0 / lg.b1;
  const lsAt = (v: number) => ls.b0 + ls.b1 * v;

  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={330} x={XD} y={[-0.45, 1.6]} yTicks={[0, 0.5, 1]} xLabel="x" yLabel="label / predicted value" ariaLabel="Binary labels with a least-squares line and a logistic curve">
          {(s) => (
            <>
              <rect x={s.left} y={s.top} width={s.right - s.left} height={s.y(1) - s.top} className="out-band" />
              <rect x={s.left} y={s.y(0)} width={s.right - s.left} height={s.bottom - s.y(0)} className="out-band" />
              <line x1={s.left} x2={s.right} y1={s.y(0.5)} y2={s.y(0.5)} className="ln-noise" />
              <line x1={s.x(lsCross)} x2={s.x(lsCross)} y1={s.top} y2={s.bottom} className="ln-alt" strokeDasharray="4 4" />
              <line x1={s.x(lgCross)} x2={s.x(lgCross)} y1={s.top} y2={s.bottom} className="ln-fit" strokeDasharray="4 4" />
              <line x1={s.x(XD[0])} y1={s.y(lsAt(XD[0]))} x2={s.x(XD[1])} y2={s.y(lsAt(XD[1]))} className="ln-alt" />
              <path d={pathOf(XS.map((v) => [s.x(v), s.y(sigmoid(lg.b0 + lg.b1 * v))]))} className="ln-fit" />
              {x.map((v, i) => (
                <ClassPt key={i} cx={s.x(v)} cy={s.y(y[i])} y={y[i] === 1 ? 1 : 0} r={i === x.length - 1 && extra ? 7.5 : 6} />
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            ...CLASS_LEGEND,
            { label: 'least-squares line', cls: 'ln-alt' },
            { label: 'logistic regression', cls: 'ln-fit' },
            { label: 'dashed verticals: where each crosses ½', cls: 'ln-ghost', shape: 'dash' },
            { label: 'shaded: values no probability can take', cls: 'out-band', shape: 'box' },
          ]}
        />
      </div>
      <div className="controls">
        <Toggle label="add one easy positive far to the right" checked={extra} onChange={setExtra} />
        {extra && <Slider label="its position x" value={far} min={10} max={30} step={0.5} onChange={setFar} format={(v) => fmt(v, 1)} />}
        <Readout
          items={[
            { label: 'line crosses ½ at', value: `x = ${fmt(lsCross, 2)}` },
            { label: 'without the far point', value: `x = ${fmt(base.ls, 2)}` },
            { label: 'logistic crosses ½ at', value: `x = ${fmt(lgCross, 2)}`, tone: 'accent' },
            { label: 'without the far point', value: `x = ${fmt(base.lg, 2)}` },
            { label: 'line’s prediction at x = 0', value: fmt(lsAt(0), 2) },
            { label: extra ? `line’s prediction at x = ${fmt(far, 1)}` : 'line’s prediction at x = 30', value: fmt(lsAt(extra ? far : 30), 2) },
          ]}
        />
        <p className="small muted">
          The far point is already on the correct side of both boundaries. The logistic curve is close to 1 there, so the point barely affects its fit.
          The line predicts more than 1 there and is penalised for overshooting, so it tilts — and its crossing moves.
        </p>
      </div>
    </div>
  );
}
