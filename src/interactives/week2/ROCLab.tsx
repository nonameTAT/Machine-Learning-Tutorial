import { useMemo, useState } from 'react';
import { Chart, Legend, pathOf } from '../../components/Chart';
import { Readout, Segmented, Slider, Toggle } from '../../components/ui';
import { fmt, rng } from '../../lib/num';
import { confusion, rates, rocCurve, sigmoid, type Label } from '../../lib/classify';
import { CLASS_LEGEND, ClassPt, pct } from './common';

type Mode = 'example' | 'sim';
// Worked example: AUC = 7/9
const EX_S = [0.95, 0.85, 0.75, 0.6, 0.4, 0.1];
const EX_Y: Label[] = [1, 0, 1, 1, 0, 0];

function simulate(sep: number) {
  const r = rng(17);
  const s: number[] = [];
  const y: Label[] = [];
  const jit: number[] = [];
  for (let i = 0; i < 80; i++) {
    const c: Label = i < 40 ? 1 : 0;
    s.push(sigmoid((c ? sep / 2 : -sep / 2) + r.normal()));
    y.push(c);
    jit.push(r.range(-0.28, 0.28));
  }
  return { s, y, jit };
}

export function ROCLab() {
  const [mode, setMode] = useState<Mode>('example');
  const [sep, setSep] = useState(2);
  const [thr, setThr] = useState(0.5);
  const [cube, setCube] = useState(false);
  const sim = useMemo(() => simulate(sep), [sep]);
  const raw = mode === 'example' ? EX_S : sim.s;
  const y = mode === 'example' ? EX_Y : sim.y;
  const jit = mode === 'example' ? EX_S.map(() => 0) : sim.jit;
  const s = cube ? raw.map((v) => v ** 3) : raw;
  const { pts, auc } = rocCurve(s, y);
  const yhat = s.map((v) => (v >= thr ? 1 : 0) as Label);
  const c = confusion(y, yhat);
  const r = rates(c);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'example', label: 'Six observations' },
            { value: 'sim', label: '80 simulated scores' },
          ]}
          value={mode}
          onChange={setMode}
        />
        <Toggle label="Cube every score (s → s³)" checked={cube} onChange={setCube} />
      </div>
      <div className="lab-grid even">
        <div>
          <div className="panel-title">Scores; predict positive at or above the threshold</div>
          <Chart W={420} H={250} x={[0, 1]} y={[-0.6, 1.6]} yTicks={[0, 1]} yTickFormat={(v) => (v === 1 ? 'pos' : 'neg')} xLabel={cube ? 'score³' : 'score'} ariaLabel="Scores by class">
            {(sc) => (
              <>
                <rect x={sc.x(thr)} width={Math.max(0, sc.right - sc.x(thr))} y={sc.top} height={sc.bottom - sc.top} className="rg-pos" />
                <line x1={sc.x(thr)} x2={sc.x(thr)} y1={sc.top} y2={sc.bottom} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="5 4" />
                {s.map((v, i) => (
                  <g key={i}>
                    {yhat[i] !== y[i] && <circle cx={sc.x(v)} cy={sc.y(y[i] + jit[i])} r={9} className="ring-miss" />}
                    <ClassPt cx={sc.x(v)} cy={sc.y(y[i] + jit[i])} y={y[i]} r={mode === 'example' ? 6.5 : 4.5} />
                  </g>
                ))}
              </>
            )}
          </Chart>
          <Legend items={[...CLASS_LEGEND, { label: 'predicted positive region', cls: 'rg-pos', shape: 'box' }, { label: 'wrong', cls: 'ring-miss', shape: 'dot' }]} />
        </div>
        <div>
          <div className="panel-title">ROC curve — AUC {fmt(auc, 4)}</div>
          <Chart W={420} H={380} x={[0, 1]} y={[0, 1]} xLabel="false-positive rate" yLabel="true-positive rate" ariaLabel="ROC curve">
            {(sc) => (
              <>
                <path d={`${pathOf(pts.map((p) => [sc.x(p.fpr), sc.y(p.tpr)]))}L${sc.x(1)},${sc.y(0)}Z`} className="area-pen" style={{ strokeWidth: 0 }} />
                <line x1={sc.x(0)} y1={sc.y(0)} x2={sc.x(1)} y2={sc.y(1)} className="ln-ghost" />
                <path d={pathOf(pts.map((p) => [sc.x(p.fpr), sc.y(p.tpr)]))} className="ln-fit" />
                {pts.map((p, i) => (
                  <circle key={i} cx={sc.x(p.fpr)} cy={sc.y(p.tpr)} r={mode === 'example' ? 3.5 : 2} fill="var(--c-fit)" />
                ))}
                <circle cx={sc.x(Number.isNaN(r.fpr) ? 0 : r.fpr)} cy={sc.y(Number.isNaN(r.rec) ? 0 : r.rec)} r={7} className="mark" />
              </>
            )}
          </Chart>
        </div>
      </div>
      <div className="lab-grid">
        <div>
          <Slider label="threshold" value={thr} min={0} max={1} step={0.005} onChange={setThr} format={(v) => fmt(v, 3)} />
          {mode === 'sim' && <Slider label="class separation" value={sep} min={0} max={5} step={0.1} onChange={setSep} format={(v) => fmt(v, 1)} />}
        </div>
        <Readout
          items={[
            { label: 'TP / FN', value: `${c.tp} / ${c.fn}` },
            { label: 'FP / TN', value: `${c.fp} / ${c.tn}` },
            { label: 'TPR (recall)', value: pct(r.rec), tone: 'accent' },
            { label: 'FPR', value: pct(r.fpr), tone: 'accent' },
            { label: 'precision', value: pct(r.prec) },
            { label: 'accuracy', value: pct(r.acc) },
          ]}
        />
      </div>
    </div>
  );
}
