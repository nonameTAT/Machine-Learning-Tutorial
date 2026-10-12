import { useState } from 'react';
import { Chart, Legend } from '../../../components/Chart';
import { Readout, Slider, Toggle } from '../../../components/ui';
import { fmt } from '../../../lib/num';

const AGES = [22, 25, 31, 35, 38, 41, 47, 52];
const OUTLIER = 95;

/** One feature on three scales. The scaler is fitted on the training values only; the test value is transformed with the same numbers. */
export function NormaliseLab() {
  const [outlier, setOutlier] = useState(false);
  const [test, setTest] = useState(60);
  const train = outlier ? [...AGES, OUTLIER] : AGES;
  const a = Math.min(...train);
  const b = Math.max(...train);
  const mu = train.reduce((s, v) => s + v, 0) / train.length;
  const sd = Math.sqrt(train.reduce((s, v) => s + (v - mu) ** 2, 0) / train.length);
  const mm = (v: number) => (v - a) / (b - a);
  const z = (v: number) => (v - mu) / sd;
  const rows = [
    { title: 'raw age (years)', f: (v: number) => v, d: [0, 110] as [number, number], band: null as [number, number] | null },
    { title: 'min-max: (x − a) / (b − a)', f: mm, d: [-0.6, 2.1] as [number, number], band: [0, 1] as [number, number] },
    { title: 'z-score: (x − μ) / s', f: z, d: [-3, 5] as [number, number], band: null },
  ];
  return (
    <div className="lab-grid">
      <div>
        {rows.map((r) => (
          <div key={r.title}>
            <div className="panel-title">{r.title}</div>
            <Chart W={540} H={86} x={r.d} y={[0, 1]} yTicks={[]} grid={false} margin={{ l: 20, r: 16, t: 8, b: 24 }} ariaLabel={`Training and test values on the ${r.title} scale`}>
              {(s) => (
                <>
                  {r.band && <rect x={s.x(r.band[0])} y={s.top} width={s.x(r.band[1]) - s.x(r.band[0])} height={s.bottom - s.top} className="side-left" />}
                  {train.map((v, i) => (
                    <circle key={i} cx={s.x(r.f(v))} cy={s.y(0.5)} r={6} className={`pt ${v === OUTLIER && outlier ? 'hi' : ''}`} />
                  ))}
                  <rect x={s.x(r.f(test)) - 6} y={s.y(0.5) - 6} width={12} height={12} transform={`rotate(45 ${s.x(r.f(test))} ${s.y(0.5)})`} className="mark-acc" />
                </>
              )}
            </Chart>
          </div>
        ))}
        <Legend
          items={[
            { label: 'training values', cls: 'pt', shape: 'dot' },
            { label: 'test value (transformed with the training numbers)', cls: 'mark-acc', shape: 'box' },
            { label: 'the training range [0, 1] after min-max', cls: 'side-left', shape: 'box' },
          ]}
        />
      </div>
      <div className="controls">
        <Toggle label={`add one unusual training value (${OUTLIER})`} checked={outlier} onChange={setOutlier} />
        <Slider label="test value" value={test} min={10} max={80} step={1} onChange={setTest} />
        <Readout
          items={[
            { label: 'a, b (min, max)', value: `${a}, ${b}` },
            { label: 'μ, s', value: `${fmt(mu, 2)}, ${fmt(sd, 2)}` },
            { label: 'test → min-max', value: fmt(mm(test), 3), tone: mm(test) < 0 || mm(test) > 1 ? 'accent' : undefined },
            { label: 'test → z-score', value: fmt(z(test), 3) },
            { label: 'gap 22 → 52 after min-max', value: fmt(mm(52) - mm(22), 3) },
            { label: 'gap 22 → 52 after z-score', value: fmt(z(52) - z(22), 3) },
          ]}
        />
        <p className="small muted">s is the standard deviation with denominator n, as in the scaling lab below.</p>
      </div>
    </div>
  );
}
