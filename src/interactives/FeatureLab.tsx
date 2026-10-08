import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../components/Chart';
import { M } from '../components/Math';
import { Readout, Slider, Toggle } from '../components/ui';
import { fmt, linspace, lstsq, mean, polyEval, polyRow, rng } from '../lib/num';

const truth = (x: number) => 0.5 + 1.8 * x - 0.17 * x * x;
const toZ = (x: number) => (x - 5) / 5; // fit in z ∈ [−1, 1] for numerical stability; same function space

function makeData() {
  const r = rng(2024);
  const train = Array.from({ length: 15 }, () => {
    const x = r.range(0, 10);
    return [x, truth(x) + 0.8 * r.normal()] as [number, number];
  });
  const held = Array.from({ length: 40 }, () => {
    const x = r.range(0, 10);
    return [x, truth(x) + 0.8 * r.normal()] as [number, number];
  });
  return { train, held };
}

export function PolyFeatureLab() {
  const { train, held } = useMemo(makeData, []);
  const [deg, setDeg] = useState(1);
  const [showHeld, setShowHeld] = useState(false);
  const [showTruth, setShowTruth] = useState(false);

  const fits = useMemo(
    () =>
      Array.from({ length: 10 }, (_, d) => {
        const theta = lstsq(
          train.map(([x]) => polyRow(toZ(x), d)),
          train.map(([, y]) => y),
        );
        const mse = (pts: [number, number][]) => (theta ? mean(pts.map(([x, y]) => (y - polyEval(theta, toZ(x))) ** 2)) : NaN);
        return { theta, train: mse(train), held: mse(held) };
      }),
    [train, held],
  );
  const cur = fits[deg];
  const xs = linspace(0, 10, 300);
  const maxBar = Math.max(...fits.slice(0, 10).map((f) => (showHeld ? Math.min(f.held, 6) : f.train)));

  return (
    <div className="lab-grid">
      <div>
        <Chart W={540} H={340} x={[0, 10]} y={[-3, 7.5]} xLabel="x" yLabel="y">
          {(s) => (
            <>
              {showTruth && <path d={pathOf(xs.map((x) => [s.x(x), s.y(truth(x))]))} className="ln-truth" />}
              {cur.theta && <path d={pathOf(xs.map((x) => [s.x(x), s.y(polyEval(cur.theta!, toZ(x)))]))} className="ln-fit" />}
              {showHeld && held.map(([x, y], i) => <circle key={`h${i}`} cx={s.x(x)} cy={s.y(y)} r={3.5} className="pt hollow" style={{ stroke: 'var(--c-alt)' }} />)}
              {train.map(([x, y], i) => (
                <circle key={i} cx={s.x(x)} cy={s.y(y)} r={5} className="pt" />
              ))}
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'training data', cls: 'pt', shape: 'dot' },
            { label: `degree-${deg} least-squares fit`, cls: 'ln-fit' },
            ...(showHeld ? [{ label: 'held-out data', cls: 'pt hollow', shape: 'dot' as const }] : []),
            ...(showTruth ? [{ label: 'true mean E[y|x]', cls: 'ln-truth', shape: 'dash' as const }] : []),
          ]}
        />
      </div>
      <div className="controls">
        <Slider label="polynomial degree d" value={deg} min={0} max={9} step={1} onChange={setDeg} />
        <div className="m-block" style={{ fontSize: 14 }}>
          <M t={`\\hat y = ${Array.from({ length: deg + 1 }, (_, k) => (k === 0 ? '\\theta_0' : k === 1 ? '\\theta_1 x' : `\\theta_${k} x^${k}`)).join(' + ')}`} />
        </div>
        <Toggle label="Show held-out data (not used for fitting)" checked={showHeld} onChange={setShowHeld} />
        <Toggle label="Show the true mean curve" checked={showTruth} onChange={setShowTruth} />
        <Readout
          items={[
            { label: 'coefficients', value: deg + 1 },
            { label: 'training MSE', value: fmt(cur.train, 3), tone: 'accent' },
            ...(showHeld ? [{ label: 'held-out MSE', value: fmt(cur.held, 3) }] : []),
          ]}
        />
        <div>
          <div className="panel-title">{showHeld ? 'Training (solid) vs held-out (outline) MSE by degree' : 'Training MSE by degree'}</div>
          <svg viewBox="0 0 300 120" className="chart">
            {fits.map((f, d) => {
              const bw = 300 / fits.length;
              const h = (v: number) => (Math.min(v, maxBar) / maxBar) * 96;
              return (
                <g key={d} onClick={() => setDeg(d)} style={{ cursor: 'pointer' }}>
                  <rect x={d * bw + 4} width={showHeld ? bw / 2 - 4 : bw - 8} y={104 - h(f.train)} height={h(f.train)} className="bar-pos" opacity={d === deg ? 1 : 0.45} />
                  {showHeld && (
                    <rect x={d * bw + bw / 2} width={bw / 2 - 4} y={104 - h(f.held)} height={h(f.held)} fill="none" stroke="var(--c-alt)" strokeWidth={1.6} opacity={d === deg ? 1 : 0.55} />
                  )}
                  <text x={d * bw + bw / 2} y={117} textAnchor="middle" className="anno" style={{ fontSize: 10 }}>
                    {d}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <div className="panel-title">First rows of the design matrix for degree {deg} — the curve is still a linear combination of fixed columns</div>
        <div className="table-wrap num">
          <table>
            <thead>
              <tr>
                {Array.from({ length: deg + 1 }, (_, k) => (
                  <th key={k}>{k === 0 ? '1' : k === 1 ? 'x' : `x^${k}`}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {train.slice(0, 3).map(([x], i) => (
                <tr key={i}>
                  {Array.from({ length: deg + 1 }, (_, k) => (
                    <td key={k}>{fmt(x ** k, 3)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/** An indicator D and an interaction D × Age. */
export function InteractionLab() {
  const [inter, setInter] = useState(false);
  const [age, setAge] = useState(40);
  const c = inter ? 0.21 : 0;
  const f0 = (a: number) => 70 + 0.44 * a;
  const f1 = (a: number) => 70 + 5 + 0.44 * a + c * a;
  return (
    <div className="lab-grid">
      <div>
        <Chart W={540} H={320} x={[0, 80]} y={[60, 140]} xLabel="age A (years)" yLabel="blood pressure ŷ">
          {(s) => (
            <>
              <line x1={s.x(0)} x2={s.x(80)} y1={s.y(f0(0))} y2={s.y(f0(80))} className="ln-data" />
              <line x1={s.x(0)} x2={s.x(80)} y1={s.y(f1(0))} y2={s.y(f1(80))} className="ln-alt" />
              <line x1={s.x(age)} x2={s.x(age)} y1={s.y(f0(age))} y2={s.y(f1(age))} stroke="var(--c-res)" strokeWidth={3} />
              <circle cx={s.x(age)} cy={s.y(f0(age))} r={5} fill="var(--c-data)" />
              <circle cx={s.x(age)} cy={s.y(f1(age))} r={5} fill="var(--c-alt)" />
              <text x={s.x(age) + 8} y={(s.y(f0(age)) + s.y(f1(age))) / 2 + 4} className="anno-strong">
                gap {fmt(f1(age) - f0(age), 2)}
              </text>
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'D = 0 (no drug)', cls: 'ln-data' },
            { label: 'D = 1 (drug)', cls: 'ln-alt' },
            { label: 'predicted difference at this age', cls: 'ln-res' },
          ]}
        />
      </div>
      <div className="controls">
        <Toggle label={<>Include interaction z = D × Age</>} checked={inter} onChange={setInter} />
        <Slider label="age A" value={age} min={0} max={80} step={1} onChange={setAge} />
        <div className="m-block">
          <M t={inter ? '\\hat y = 70 + 5D + 0.44A + 0.21\\,DA' : '\\hat y = 70 + 5D + 0.44A'} />
        </div>
        <div className="table-wrap">
          <table>
            <tbody>
              <tr>
                <th>D = 0</th>
                <td>
                  <M t="\hat y = 70 + 0.44A" />
                </td>
              </tr>
              <tr>
                <th>D = 1</th>
                <td>
                  <M t={inter ? '\\hat y = 75 + 0.65A' : '\\hat y = 75 + 0.44A'} />
                </td>
              </tr>
              <tr>
                <th>Gap</th>
                <td>
                  <M t={inter ? '5 + 0.21A' : '5 \\text{ at every age}'} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
          {inter
            ? 'With the interaction, the drug changes the slope as well as the level: the lines fan out. The coefficient 5 is now the gap at age 0 only.'
            : 'Without an interaction, D shifts the line up by 5 but cannot change its slope: the lines are parallel.'}
        </p>
      </div>
    </div>
  );
}
