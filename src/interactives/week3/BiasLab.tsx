import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { M } from '../../components/Math';
import { Readout, Slider, Toggle } from '../../components/ui';
import { fmt, linspace } from '../../lib/num';

/** Several hypotheses agree on the training points and disagree everywhere else. */
export function BiasLab() {
  const [a, setA] = useState(10);
  const [xq, setXq] = useState(2);
  const [third, setThird] = useState(false);
  const pts: [number, number][] = third ? [[0, 0], [1, 1], [2, 2]] : [[0, 0], [1, 1]];
  const f = (x: number) => x;
  const g = (x: number) => x + a * x * (x - 1);
  const nn = (x: number) => pts.reduce((best, p) => (Math.abs(p[0] - x) < Math.abs(best[0] - x) ? p : best), pts[0])[1];
  const xs = linspace(-1, 3, 401);
  const sse = (h: (x: number) => number) => pts.reduce((s, [x, y]) => s + (h(x) - y) ** 2, 0);
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={340} x={[-1, 3]} y={[-6, 26]} xLabel="x" yLabel="prediction" ariaLabel="Hypotheses that fit the same data">
          {(s) => (
            <>
              <path d={pathOf(xs.map((x) => [s.x(x), s.y(f(x))]))} className="ln-fit" />
              <path d={pathOf(xs.map((x) => [s.x(x), s.y(g(x))]))} className="ln-alt" />
              <path d={pathOf(xs.map((x) => [s.x(x), s.y(nn(x))]))} className="ln-var" />
              <line x1={s.x(xq)} x2={s.x(xq)} y1={s.top} y2={s.bottom} stroke="var(--accent)" strokeDasharray="4 3" />
              {pts.map(([x, y], i) => (
                <circle key={i} cx={s.x(x)} cy={s.y(y)} r={7} className="pt" />
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'f(x) = x', cls: 'ln-fit' },
            { label: 'g(x) = x + a·x(x − 1)', cls: 'ln-alt' },
            { label: '1-nearest-neighbour', cls: 'ln-var' },
            { label: 'training data', cls: 'pt', shape: 'dot' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label={<M t="a \text{ in } g" />} value={a} min={-3} max={10} step={0.5} onChange={setA} format={(v) => fmt(v, 1)} />
        <Slider label="new input x" value={xq} min={-1} max={3} step={0.1} onChange={setXq} format={(v) => fmt(v, 1)} />
        <Toggle label="Also observe (2, 2)" checked={third} onChange={setThird} />
        <Readout
          items={[
            { label: 'f(x)', value: fmt(f(xq), 2) },
            { label: 'g(x)', value: fmt(g(xq), 2), tone: 'accent' },
            { label: '1-NN', value: fmt(nn(xq), 2) },
            { label: 'training SSE of g', value: fmt(sse(g), 2) },
          ]}
        />
        <div className={`status ${sse(g) === 0 ? 'good' : ''}`}>
          {sse(g) === 0
            ? 'All three hypotheses fit the training data perfectly — the data alone cannot choose between them.'
            : 'The extra observation rules this g out, but infinitely many other curves still pass through all the points.'}
        </div>
      </div>
    </div>
  );
}
