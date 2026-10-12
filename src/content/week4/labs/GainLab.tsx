import { useState } from 'react';
import { Chart, Legend } from '../../../components/Chart';
import { Readout, Segmented, Slider, Toggle } from '../../../components/ui';
import { fmt } from '../../../lib/num';
import { childEntropy, entropy, infoGain, total } from '../../../lib/tree';

type Preset = 'worked' | 'sizes';
const PRESETS: Record<Preset, { parent: [number, number]; left: [[number, number], [number, number]]; names: [string, string] }> = {
  // 64 examples: A1 → (21+, 5−) | (8+, 30−); A2 → (18+, 33−) | (11+, 2−)
  worked: { parent: [29, 35], left: [[21, 5], [18, 33]], names: ['A₁', 'A₂'] },
  // a large pure branch and a small balanced one, against a split that changes nothing
  sizes: { parent: [95, 5], left: [[90, 0], [48, 2]], names: ['T₁', 'T₂'] },
};

/** One candidate test drawn as blocks: width = branch size, height = branch entropy, so area / n = expected entropy. */
function SplitPicture({ name, parent, left, unweighted }: { name: string; parent: number[]; left: number[]; unweighted: boolean }) {
  const right = parent.map((c, j) => c - left[j]);
  const kids = [left, right];
  const n = total(parent);
  const h0 = entropy(parent);
  const hw = childEntropy(kids);
  const hu = (entropy(left) + entropy(right)) / 2;
  return (
    <div>
      <div className="panel-title">
        Test {name}: gain = {fmt(h0, 4)} − {fmt(hw, 4)} = <strong>{fmt(infoGain(kids), 4)}</strong>
      </div>
      <Chart W={360} H={250} x={[0, n]} y={[0, 1.08]} xLabel="examples (block width = branch size)" yLabel="entropy (bits)" ariaLabel={`Branches of test ${name}`}>
        {(s) => {
          let x0 = 0;
          return (
            <>
              {kids.map((c, v) => {
                const nv = total(c);
                const h = entropy(c);
                const r = (
                  <g key={v}>
                    <rect x={s.x(x0)} y={s.y(h)} width={s.x(x0 + nv) - s.x(x0)} height={s.y(0) - s.y(h)} className={v === 0 ? 'gain-block a' : 'gain-block b'} />
                    {nv > 0 && (
                      <text x={s.x(x0 + nv / 2)} y={s.y(Math.max(h, 0.3) / 2)} textAnchor="middle" className="anno">
                        <tspan x={s.x(x0 + nv / 2)}>
                          {c[0]}+ {c[1]}−
                        </tspan>
                        <tspan x={s.x(x0 + nv / 2)} dy="1.25em">
                          H = {fmt(h, 3)}
                        </tspan>
                      </text>
                    )}
                  </g>
                );
                x0 += nv;
                return r;
              })}
              <line x1={s.left} x2={s.right} y1={s.y(h0)} y2={s.y(h0)} className="ln-ghost" />
              <line x1={s.left} x2={s.right} y1={s.y(hw)} y2={s.y(hw)} className="ln-fit" />
              {unweighted && <line x1={s.left} x2={s.right} y1={s.y(hu)} y2={s.y(hu)} className="ln-res" strokeDasharray="3 4" />}
              <line x1={s.right - 14} x2={s.right - 14} y1={s.y(h0)} y2={s.y(hw)} className="gain-gap" />
            </>
          );
        }}
      </Chart>
    </div>
  );
}

/** Two candidate tests on the same parent. Each test's right branch is whatever its left branch does not take. */
export function GainLab() {
  const [preset, setPreset] = useState<Preset>('worked');
  const [lefts, setLefts] = useState(PRESETS.worked.left.map((l) => [...l]));
  const [unweighted, setUnweighted] = useState(false);
  const { parent, names } = PRESETS[preset];
  const load = (p: Preset) => {
    setPreset(p);
    setLefts(PRESETS[p].left.map((l) => [...l]));
  };
  const setCount = (t: number, j: number, v: number) => setLefts((prev) => prev.map((l, i) => (i === t ? l.map((x, m) => (m === j ? v : x)) : l)));
  const gains = lefts.map((l) => infoGain([l, parent.map((c, j) => c - l[j])]));
  const winner = gains[0] > gains[1] + 1e-12 ? names[0] : gains[1] > gains[0] + 1e-12 ? names[1] : 'tie';

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="example"
          options={[
            { value: 'worked', label: '64 examples (worked)' },
            { value: 'sizes', label: 'unequal branch sizes' },
          ]}
          value={preset}
          onChange={load}
        />
        <Toggle label="also show the unweighted average (wrong)" checked={unweighted} onChange={setUnweighted} />
      </div>
      <div className="lab-grid even">
        {lefts.map((l, t) => (
          <div key={t}>
            <SplitPicture name={names[t]} parent={parent} left={l} unweighted={unweighted} />
            <div className="controls">
              <Slider label={`${names[t]}: positives in the left branch`} value={l[0]} min={0} max={parent[0]} step={1} onChange={(v) => setCount(t, 0, v)} />
              <Slider label={`${names[t]}: negatives in the left branch`} value={l[1]} min={0} max={parent[1]} step={1} onChange={(v) => setCount(t, 1, v)} />
            </div>
          </div>
        ))}
      </div>
      <Legend
        items={[
          { label: 'parent entropy H(S)', cls: 'ln-ghost', shape: 'dash' },
          { label: 'expected entropy after the test (area ÷ n)', cls: 'ln-fit' },
          { label: 'gain = the gap between them', cls: 'gain-gap' },
          ...(unweighted ? [{ label: 'plain average of the two branch entropies', cls: 'ln-res', shape: 'dash' as const }] : []),
        ]}
      />
      <Readout
        items={[
          { label: 'parent', value: `${parent[0]}+ ${parent[1]}−` },
          { label: 'H(S)', value: fmt(entropy(parent), 4) },
          { label: `gain of ${names[0]}`, value: fmt(gains[0], 4) },
          { label: `gain of ${names[1]}`, value: fmt(gains[1], 4) },
          { label: 'better test', value: winner, tone: 'accent' },
        ]}
      />
    </div>
  );
}
