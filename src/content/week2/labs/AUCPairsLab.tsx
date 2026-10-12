import { useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../../../components/Chart';
import { ClassPt, CLASS_LEGEND } from '../../../components/chartParts';
import { Readout, Segmented } from '../../../components/ui';
import { rocCurve, type Label } from '../../../lib/classify';
import { clamp, fmt } from '../../../lib/num';

type Preset = 'worked' | 'bigger' | 'perfect' | 'reversed';
const PRESETS: Record<Preset, { label: string; pos: number[]; neg: number[] }> = {
  worked: { label: 'worked example (7/9)', pos: [0.95, 0.75, 0.6], neg: [0.85, 0.4, 0.1] },
  bigger: { label: '5 positives, 4 negatives', pos: [0.9, 0.8, 0.7, 0.55, 0.3], neg: [0.85, 0.6, 0.45, 0.2] },
  perfect: { label: 'perfect ranking', pos: [0.9, 0.8, 0.7], neg: [0.4, 0.3, 0.2] },
  reversed: { label: 'reversed ranking', pos: [0.4, 0.3, 0.2], neg: [0.9, 0.8, 0.7] },
};

/** AUC as counting: the area under the ROC staircase is made of one cell per (positive, negative) pair the scores put in the right order. */
export function AUCPairsLab() {
  const [pos, setPos] = useState(PRESETS.worked.pos);
  const [neg, setNeg] = useState(PRESETS.worked.neg);
  const [preset, setPreset] = useState<Preset | 'custom'>('worked');
  const [drag, setDrag] = useState<{ cls: 'pos' | 'neg'; i: number } | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const P = pos.length;
  const N = neg.length;
  // rows: positives from highest score (bottom) to lowest; columns: negatives from highest score (left) to lowest
  const ps = [...pos].sort((a, b) => b - a);
  const ns = [...neg].sort((a, b) => b - a);
  const cmp = (a: number, b: number) => (Math.abs(a - b) < 1e-9 ? 0.5 : a > b ? 1 : 0);
  const good = ps.reduce((s, a) => s + ns.reduce((t, b) => t + cmp(a, b), 0), 0);
  const roc = rocCurve([...pos, ...neg], [...pos.map(() => 1 as Label), ...neg.map(() => 0 as Label)]);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="scores"
          options={[...(Object.keys(PRESETS) as Preset[]).map((p) => ({ value: p, label: PRESETS[p].label })), ...(preset === 'custom' ? [{ value: 'custom' as const, label: 'your scores' }] : [])]}
          value={preset}
          onChange={(p) => {
            if (p === 'custom') return;
            setPreset(p);
            setPos(PRESETS[p].pos);
            setNeg(PRESETS[p].neg);
          }}
        />
      </div>
      <Chart
        W={640}
        H={140}
        x={[0, 1]}
        y={[0, 1]}
        yTicks={[]}
        grid={false}
        xLabel="score — drag any example left or right"
        svgRef={ref}
        className="draggable"
        ariaLabel="Scores of the positive and negative examples"
        onPointerMove={(e, s) => {
          if (!drag || !ref.current) return;
          const v = Math.round(clamp(s.ix(svgPoint(ref.current, e).x), 0, 1) * 100) / 100;
          setPreset('custom');
          if (drag.cls === 'pos') setPos(pos.map((u, i) => (i === drag.i ? v : u)));
          else setNeg(neg.map((u, i) => (i === drag.i ? v : u)));
        }}
        onPointerUp={() => setDrag(null)}
      >
        {(s) => (
          <>
            <text x={s.left + 4} y={s.y(0.72) - 12} className="anno">
              positives
            </text>
            <text x={s.left + 4} y={s.y(0.28) - 12} className="anno">
              negatives
            </text>
            {pos.map((v, i) => (
              <ClassPt
                key={`p${i}`}
                cx={s.x(v)}
                cy={s.y(0.72)}
                y={1}
                r={8}
                className="drag"
                onPointerDown={(e) => {
                  (e.target as Element).setPointerCapture?.(e.pointerId);
                  setDrag({ cls: 'pos', i });
                }}
              />
            ))}
            {neg.map((v, i) => (
              <ClassPt
                key={`n${i}`}
                cx={s.x(v)}
                cy={s.y(0.28)}
                y={0}
                r={8}
                className="drag"
                onPointerDown={(e) => {
                  (e.target as Element).setPointerCapture?.(e.pointerId);
                  setDrag({ cls: 'neg', i });
                }}
              />
            ))}
          </>
        )}
      </Chart>
      <div className="lab-grid">
        <div>
          <Chart
            W={440}
            H={440}
            x={[0, 1]}
            y={[0, 1]}
            xTicks={[0, 0.5, 1]}
            yTicks={[0, 0.5, 1]}
            grid={false}
            xLabel="false positive rate (one column per negative)"
            yLabel="true positive rate (one row per positive)"
            ariaLabel="ROC staircase over a grid of positive-negative pairs"
          >
            {(s) => (
              <>
                {ps.map((a, i) =>
                  ns.map((b, j) => {
                    const c = cmp(a, b);
                    const x0 = s.x(j / N);
                    const x1 = s.x((j + 1) / N);
                    const y0 = s.y(i / P);
                    const y1 = s.y((i + 1) / P);
                    return (
                      <g key={`${i}-${j}`}>
                        {c === 1 && <rect x={x0} y={y1} width={x1 - x0} height={y0 - y1} className="pair-good" />}
                        {c === 0.5 && <polygon points={`${x0},${y0} ${x1},${y0} ${x1},${y1}`} className="pair-good" />}
                        <rect x={x0} y={y1} width={x1 - x0} height={y0 - y1} className="pair-cell" />
                        <text x={(x0 + x1) / 2} y={(y0 + y1) / 2 + 4} textAnchor="middle" className="anno">
                          {fmt(a, 2)} {c === 1 ? '>' : c === 0 ? '<' : '='} {fmt(b, 2)}
                        </text>
                      </g>
                    );
                  }),
                )}
                <path d={pathOf(roc.pts.map((p) => [s.x(p.fpr), s.y(p.tpr)]))} className="ln-fit" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'pair ranked correctly (positive scored higher)', cls: 'pair-good', shape: 'box' },
              { label: 'ROC curve', cls: 'ln-fit' },
            ]}
          />
        </div>
        <div className="controls">
          <Readout
            items={[
              { label: 'pairs P × N', value: `${P} × ${N} = ${P * N}` },
              { label: 'correctly ordered (ties ½)', value: fmt(good, 2) },
              { label: 'fraction of pairs', value: `${fmt(good, 2)}/${P * N} = ${fmt(good / (P * N), 4)}`, tone: 'accent' },
              { label: 'area under the ROC curve', value: fmt(roc.auc, 4), tone: 'accent' },
            ]}
          />
          <p className="small muted">
            Sort both classes by score. Walking down the scores, each positive moves the ROC curve up one row and each negative moves it right one column.
            So the column of a negative is filled exactly up to the number of positives scored above it — one shaded cell per correctly ordered pair.
          </p>
          <Legend items={CLASS_LEGEND} />
        </div>
      </div>
    </div>
  );
}
