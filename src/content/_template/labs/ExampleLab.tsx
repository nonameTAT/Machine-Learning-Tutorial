import { useState } from 'react';
import { Chart, Legend } from '../../../components/Chart';
import { Readout, Slider } from '../../../components/ui';
import { fmt } from '../../../lib/num';

// A lab is an ordinary React component: state, a <Chart> drawn in data coordinates, and controls.
// Lessons wrap it in <Lab title=… purpose=…>. Colours come from CSS classes (pt, ln-fit, ln-res, …)
// so the chart follows the light/dark theme.

const PTS: [number, number][] = [
  [1, 1.8],
  [2, 4.4],
  [3, 5.7],
  [4, 8.5],
  [5, 9.6],
];

export function ExampleLab() {
  const [slope, setSlope] = useState(1.5);
  const sse = PTS.reduce((s, [x, y]) => s + (y - slope * x) ** 2, 0);
  return (
    <div className="lab-grid">
      <div>
        <Chart W={560} H={320} x={[0, 6]} y={[0, 12]} xLabel="x" yLabel="y" ariaLabel="Points, a line through the origin and its residuals">
          {(s) => (
            <>
              {PTS.map(([x, y], i) => (
                <line key={`r${i}`} x1={s.x(x)} x2={s.x(x)} y1={s.y(y)} y2={s.y(slope * x)} className="ln-res" />
              ))}
              <line x1={s.x(0)} y1={s.y(0)} x2={s.x(6)} y2={s.y(6 * slope)} className="ln-fit" />
              {PTS.map(([x, y], i) => (
                <circle key={`p${i}`} cx={s.x(x)} cy={s.y(y)} r={5} className="pt" />
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'data', cls: 'pt', shape: 'dot' },
            { label: 'ŷ = θx', cls: 'ln-fit' },
            { label: 'residual', cls: 'ln-res' },
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="slope θ" value={slope} min={0} max={3} step={0.05} onChange={setSlope} format={(v) => fmt(v, 2)} />
        <Readout items={[{ label: 'sum of squared errors', value: fmt(sse, 3), tone: 'accent' }]} />
      </div>
    </div>
  );
}
