import { useState } from 'react';
import { Chart, Legend, pathOf } from '../../../components/Chart';
import { MB } from '../../../components/Math';
import { Readout, Segmented, Slider } from '../../../components/ui';
import { fmt, linspace } from '../../../lib/num';

type Preset = 'left' | 'right' | 'outlier';
const PRESETS: Record<Preset, { label: string; y: number[] }> = {
  left: { label: '1, 2, 2', y: [1, 2, 2] },
  right: { label: '8, 9, 10', y: [8, 9, 10] },
  outlier: { label: '1, 2, 2, 3, 14', y: [1, 2, 2, 3, 14] },
};
type Loss = 'sq' | 'abs';
const CS = linspace(0, 15, 301);

const lossAt = (ys: number[], c: number, loss: Loss) => ys.reduce((s, v) => s + (loss === 'sq' ? (v - c) ** 2 : Math.abs(v - c)), 0);
const median = (ys: number[]) => {
  const s = [...ys].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/** One leaf, one constant prediction c for every target in it. Which c makes the total loss smallest? */
export function MeanLeafLab() {
  const [preset, setPreset] = useState<Preset>('left');
  const [loss, setLoss] = useState<Loss>('sq');
  const [c, setC] = useState(4);
  const ys = PRESETS[preset].y;
  const m = ys.length;
  const ybar = ys.reduce((a, b) => a + b, 0) / m;
  const best = loss === 'sq' ? ybar : median(ys);
  const L = lossAt(ys, c, loss);
  const Lbest = lossAt(ys, best, loss);
  const yMaxL = Math.max(...CS.map((x) => lossAt(ys, x, loss)));
  return (
    <div>
      <div className="btn-row">
        <Segmented label="targets in the leaf" options={(Object.keys(PRESETS) as Preset[]).map((p) => ({ value: p, label: PRESETS[p].label }))} value={preset} onChange={setPreset} />
        <Segmented
          label="loss"
          options={[
            { value: 'sq', label: 'squared error' },
            { value: 'abs', label: 'absolute error' },
          ]}
          value={loss}
          onChange={setLoss}
        />
      </div>
      <div className="lab-grid even">
        <div>
          <Chart W={400} H={280} x={[0.4, m + 0.6]} y={[0, 15]} xTicks={ys.map((_, i) => i + 1)} xLabel="example in the leaf" yLabel="target y" ariaLabel="Targets in the leaf and the constant prediction">
            {(s) => (
              <>
                {ys.map((v, i) => (
                  <line key={`r${i}`} x1={s.x(i + 1)} x2={s.x(i + 1)} y1={s.y(v)} y2={s.y(c)} className="ln-res" />
                ))}
                <line x1={s.left} x2={s.right} y1={s.y(c)} y2={s.y(c)} className="ln-fit" />
                <line x1={s.left} x2={s.right} y1={s.y(best)} y2={s.y(best)} className="ln-ghost" />
                {ys.map((v, i) => (
                  <circle key={`p${i}`} cx={s.x(i + 1)} cy={s.y(v)} r={6} className="pt" />
                ))}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'constant prediction c', cls: 'ln-fit' },
              { label: 'residual y − c', cls: 'ln-res' },
              { label: loss === 'sq' ? 'the mean ȳ' : 'the median', cls: 'ln-ghost', shape: 'dash' },
            ]}
          />
        </div>
        <div>
          <Chart W={400} H={280} x={[0, 15]} y={[0, yMaxL * 1.05]} xLabel="constant c" yLabel={loss === 'sq' ? 'Σ (yᵢ − c)²' : 'Σ |yᵢ − c|'} ariaLabel="Total loss as a function of the constant">
            {(s) => (
              <>
                <path d={pathOf(CS.map((x) => [s.x(x), s.y(lossAt(ys, x, loss))]))} className="ln-pen" />
                <line x1={s.x(best)} x2={s.x(best)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <circle cx={s.x(c)} cy={s.y(L)} r={6} className="mark" />
              </>
            )}
          </Chart>
        </div>
      </div>
      <div className="lab-grid">
        <div className="controls">
          <Slider label="constant c" value={c} min={0} max={15} step={0.05} onChange={setC} format={(v) => fmt(v, 2)} />
          {loss === 'sq' && (
            <MB t={`\\sum_i (y_i - c)^2 = \\underbrace{${fmt(Lbest, 3)}}_{\\sum_i (y_i - \\bar y)^2} + \\underbrace{${m}\\times(${fmt(c, 2)} - ${fmt(ybar, 3)})^2}_{m(c - \\bar y)^2} = ${fmt(L, 3)}`} />
          )}
        </div>
        <Readout
          items={[
            { label: 'mean ȳ', value: fmt(ybar, 4) },
            { label: 'median', value: fmt(median(ys), 4) },
            { label: 'loss at c', value: fmt(L, 3) },
            { label: 'smallest possible', value: `${fmt(Lbest, 3)} at c = ${fmt(best, 3)}`, tone: 'accent' },
          ]}
        />
      </div>
    </div>
  );
}
