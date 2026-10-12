import { useRef, useState } from 'react';
import { Chart, Legend, svgPoint } from '../../../components/Chart';
import { Readout, Slider } from '../../../components/ui';
import { clamp, fmt } from '../../../lib/num';
import { meanOf, sseOf } from '../../../lib/tree';

const X = [1, 2, 3, 4, 5, 6];
const START = [1, 2, 2, 8, 9, 10];

/** A regression stump: try every gap, give each side its own mean, and keep the split with the least squared error. */
export function StumpLab() {
  const [y, setY] = useState(START);
  const [gap, setGap] = useState(3);
  const [drag, setDrag] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const n = y.length;
  const parentMse = sseOf(y) / n;
  const cands = X.slice(0, -1).map((_, i) => {
    const L = y.slice(0, i + 1);
    const R = y.slice(i + 1);
    return { t: i + 1.5, L, R, ml: meanOf(L), mr: meanOf(R), sl: sseOf(L), sr: sseOf(R), q: (sseOf(L) + sseOf(R)) / n };
  });
  const cur = cands[gap - 1];
  const best = cands.reduce((b, c) => (c.q < b.q - 1e-12 ? c : b), cands[0]);
  return (
    <div className="lab-grid">
      <div>
        <Chart
          W={520}
          H={300}
          x={[0.5, 6.5]}
          y={[0, 12]}
          xTicks={X}
          xLabel="x — drag a point up or down"
          yLabel="y"
          svgRef={ref}
          className="draggable"
          ariaLabel="Six points, a threshold and the two leaf means"
          onPointerMove={(e, s) => {
            if (drag === null || !ref.current) return;
            const v = clamp(s.iy(svgPoint(ref.current, e).y), 0, 12);
            setY(y.map((u, i) => (i === drag ? Math.round(v * 10) / 10 : u)));
          }}
          onPointerUp={() => setDrag(null)}
        >
          {(s) => (
            <>
              <line x1={s.x(cur.t)} x2={s.x(cur.t)} y1={s.top} y2={s.bottom} className="ln-ghost" />
              {y.map((v, i) => (
                <line key={`r${i}`} x1={s.x(X[i])} x2={s.x(X[i])} y1={s.y(v)} y2={s.y(i < gap ? cur.ml : cur.mr)} className="ln-res" />
              ))}
              <line x1={s.x(0.5)} x2={s.x(cur.t)} y1={s.y(cur.ml)} y2={s.y(cur.ml)} className="ln-fit" />
              <line x1={s.x(cur.t)} x2={s.x(6.5)} y1={s.y(cur.mr)} y2={s.y(cur.mr)} className="ln-fit" />
              {y.map((v, i) => (
                <circle
                  key={`p${i}`}
                  cx={s.x(X[i])}
                  cy={s.y(v)}
                  r={drag === i ? 8 : 6.5}
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
            { label: 'leaf means', cls: 'ln-fit' },
            { label: 'residuals', cls: 'ln-res' },
            { label: 'threshold', cls: 'ln-ghost', shape: 'dash' },
          ]}
        />
        <Chart W={520} H={200} x={[0.5, 6.5]} y={[0, Math.max(parentMse, ...cands.map((c) => c.q)) * 1.1]} xTicks={cands.map((c) => c.t)} xLabel="threshold t" yLabel="weighted MSE" ariaLabel="Weighted MSE of every threshold">
          {(s) => (
            <>
              <line x1={s.left} x2={s.right} y1={s.y(parentMse)} y2={s.y(parentMse)} className="ln-ghost" />
              {cands.map((c, i) => (
                <rect
                  key={i}
                  x={s.x(c.t) - 14}
                  y={s.y(c.q)}
                  width={28}
                  height={s.y(0) - s.y(c.q)}
                  className={`gain-bar ${i === gap - 1 ? 'on' : ''}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setGap(i + 1)}
                />
              ))}
            </>
          )}
        </Chart>
        <p className="small muted">Dashed line: the parent’s MSE (no split). Shorter bars are better; click a bar to select it.</p>
      </div>
      <div className="controls">
        <Slider label="threshold" value={gap} min={1} max={5} step={1} onChange={setGap} format={() => `t = ${cur.t}`} />
        <Readout
          items={[
            { label: 'left mean', value: fmt(cur.ml, 4) },
            { label: 'right mean', value: fmt(cur.mr, 4) },
            { label: 'SSE left + right', value: `${fmt(cur.sl, 3)} + ${fmt(cur.sr, 3)}` },
            { label: 'weighted MSE Q(t)', value: fmt(cur.q, 4), tone: 'accent' },
            { label: 'parent MSE', value: fmt(parentMse, 4) },
            { label: 'best threshold', value: `t = ${best.t} (Q = ${fmt(best.q, 4)})` },
          ]}
        />
        <button className="btn" onClick={() => setY(START)}>
          Reset the points
        </button>
      </div>
    </div>
  );
}
