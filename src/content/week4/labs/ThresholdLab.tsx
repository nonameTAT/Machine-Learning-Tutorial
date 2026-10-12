import { useState } from 'react';
import { Chart, Legend } from '../../../components/Chart';
import { ClassPt, CLASS_LEGEND } from '../../../components/chartParts';
import { Readout, Segmented, Slider } from '../../../components/ui';
import { fmt } from '../../../lib/num';
import { entropy, infoGain } from '../../../lib/tree';

type Preset = 'worked' | 'ties';
const PRESETS: Record<Preset, { x: number[]; y: string }> = {
  worked: { x: [10.2, 11.1, 11.8, 13.0, 13.6, 14.4, 15.5, 16.5, 18.0], y: '+--+++--+' },
  // 13.0 now appears twice, once with each label
  ties: { x: [10.2, 11.1, 11.8, 13.0, 13.0, 14.4, 15.5, 16.5, 18.0], y: '+--+-+--+' },
};
const XD: [number, number] = [9.6, 18.6];

/** Candidate thresholds sit between neighbouring distinct values; each is scored by the gain of the two-way split. */
export function ThresholdLab() {
  const [preset, setPreset] = useState<Preset>('worked');
  const [labels, setLabels] = useState<number[]>([...PRESETS.worked.y].map((c) => (c === '+' ? 1 : 0)));
  const [gap, setGap] = useState(2);
  const [minLeaf, setMinLeaf] = useState(1);
  const xs = PRESETS[preset].x;
  const load = (p: Preset) => {
    setPreset(p);
    setLabels([...PRESETS[p].y].map((c) => (c === '+' ? 1 : 0)));
    setGap(2);
  };

  const distinct = [...new Set(xs)];
  const groups = distinct.map((v) => [labels.filter((l, i) => xs[i] === v && l === 1).length, labels.filter((l, i) => xs[i] === v && l === 0).length]);
  const cands = distinct.slice(0, -1).map((v, i) => {
    const t = (v + distinct[i + 1]) / 2;
    const left = [0, 1].map((c) => groups.slice(0, i + 1).reduce((s, g) => s + g[c], 0));
    const right = [0, 1].map((c) => groups.slice(i + 1).reduce((s, g) => s + g[c], 0));
    const a = groups[i];
    const b = groups[i + 1];
    // a boundary unless both neighbouring values are pure and of the same class
    const pureSame = (a[0] === 0 || a[1] === 0) && (b[0] === 0 || b[1] === 0) && (a[0] > 0) === (b[0] > 0);
    const nl = left[0] + left[1];
    const nr = right[0] + right[1];
    return { t, left, right, gain: infoGain([left, right]), boundary: !pureSame, ok: nl >= minLeaf && nr >= minLeaf };
  });
  const g = Math.min(gap, cands.length) - 1;
  const cur = cands[g];
  const okGains = cands.filter((c) => c.ok).map((c) => c.gain);
  const bestGain = okGains.length ? Math.max(...okGains) : NaN;
  const bests = cands.filter((c) => c.ok && c.gain > bestGain - 1e-9).map((c) => fmt(c.t, 2));
  const parent = [labels.filter((l) => l === 1).length, labels.filter((l) => l === 0).length];

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="data"
          options={[
            { value: 'worked', label: 'worked example' },
            { value: 'ties', label: 'with a repeated value' },
          ]}
          value={preset}
          onChange={load}
        />
      </div>
      <Chart W={620} H={150} x={XD} y={[0, 1]} yTicks={[]} grid={false} xLabel="feature value — click a point to flip its label" ariaLabel="Sorted values with their labels and the chosen threshold">
        {(s) => {
          const seen = new Map<number, number>();
          return (
            <>
              <rect x={s.left} y={s.top} width={s.x(cur.t) - s.left} height={s.bottom - s.top} className="side-left" />
              {cands.map((c, i) => (
                <g key={i}>
                  {c.boundary && <polygon points={`${s.x(c.t)},${s.bottom - 2} ${s.x(c.t) - 5},${s.bottom - 11} ${s.x(c.t) + 5},${s.bottom - 11}`} className="mark-acc" />}
                </g>
              ))}
              <line x1={s.x(cur.t)} x2={s.x(cur.t)} y1={s.top} y2={s.bottom} className="ln-fit" />
              {xs.map((v, i) => {
                const k = seen.get(v) ?? 0;
                seen.set(v, k + 1);
                return (
                  <g key={i} style={{ cursor: 'pointer' }} onClick={() => setLabels(labels.map((l, j) => (j === i ? 1 - l : l)))}>
                    <ClassPt cx={s.x(v)} cy={s.y(0.55 + 0.25 * k)} y={labels[i] === 1 ? 1 : 0} r={7} />
                    {k === 0 && (
                      <text x={s.x(v)} y={s.y(0.55) + 24} textAnchor="middle" className="anno">
                        {v}
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          );
        }}
      </Chart>
      <div className="lab-grid">
        <div>
          <Chart W={560} H={230} x={XD} y={[0, Math.max(0.2, ...cands.map((c) => c.gain)) * 1.15]} xLabel="candidate threshold t (midpoints)" yLabel="information gain" ariaLabel="Gain of every candidate threshold">
            {(s) => (
              <>
                {cands.map((c, i) => (
                  <rect
                    key={i}
                    x={s.x(c.t) - 9}
                    y={s.y(c.gain)}
                    width={18}
                    height={s.y(0) - s.y(c.gain)}
                    className={`gain-bar ${i === g ? 'on' : ''} ${c.ok ? '' : 'off'}`}
                    onClick={() => setGap(i + 1)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </>
            )}
          </Chart>
          <Legend
            items={[
              ...CLASS_LEGEND.map((l) => ({ ...l, label: l.label.startsWith('positive') ? 'label +' : 'label −' })),
              { label: 'class-change boundary', cls: 'mark-acc', shape: 'dot' },
              { label: 'violates the minimum leaf size', cls: 'gain-bar off', shape: 'box' },
            ]}
          />
        </div>
        <div className="controls">
          <Slider label="threshold candidate" value={g + 1} min={1} max={cands.length} step={1} onChange={setGap} format={() => `t = ${fmt(cur.t, 2)}`} />
          <Slider label="minimum examples per leaf" value={minLeaf} min={1} max={4} step={1} onChange={setMinLeaf} />
          <Readout
            items={[
              { label: 'parent', value: `${parent[0]}+ ${parent[1]}− · H = ${fmt(entropy(parent), 4)}` },
              { label: 'left (x ≤ t)', value: `${cur.left[0]}+ ${cur.left[1]}−` },
              { label: 'right (x > t)', value: `${cur.right[0]}+ ${cur.right[1]}−` },
              { label: 'gain', value: fmt(cur.gain, 6), tone: cur.ok ? 'accent' : 'bad' },
              { label: 'best admissible t', value: bests.length ? bests.join(' and ') : 'none' },
            ]}
          />
          {!cur.ok && <div className="status bad">This threshold leaves fewer than {minLeaf} examples on one side, so it is not a candidate.</div>}
        </div>
      </div>
    </div>
  );
}
