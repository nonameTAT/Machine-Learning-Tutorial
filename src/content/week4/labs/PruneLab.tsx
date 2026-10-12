import { useMemo, useRef, useState } from 'react';
import { Chart, Legend, pathOf, svgPoint } from '../../../components/Chart';
import { CLASS_LEGEND } from '../../../components/chartParts';
import { Readout, Slider, Toggle } from '../../../components/ui';
import { clamp, fmt } from '../../../lib/num';
import { errorCount, growTree, reducedErrorPath } from '../../../lib/tree';
import { LeafRegions, Points, sample2d } from './regions';
import { TreeView, cnodeToTV } from './TreeView';

/** Grow a full tree, then follow reduced-error pruning one replacement at a time. */
export function PruneLab() {
  const [seed, setSeed] = useState(1);
  const [step, setStep] = useState(0);
  const [showVal, setShowVal] = useState(true);
  const data = useMemo(() => {
    const train = sample2d('wavy', 250, seed, 0.1);
    const val = sample2d('wavy', 150, 7000 + seed, 0.1);
    const test = sample2d('wavy', 2000, 9000 + seed, 0.1);
    const full = growTree(train.X, train.y, { k: 2, maxDepth: 14 });
    const path = reducedErrorPath(full, val.X, val.y).map((p) => ({ ...p, testErr: errorCount(p.tree, test.X, test.y) / 2000 }));
    return { train, val, path };
  }, [seed]);
  const { train, val, path } = data;
  const st = Math.min(step, path.length - 1);
  const cur = path[st];
  const maxLeaves = path[0].leaves;
  const minLeaves = path[path.length - 1].leaves;

  return (
    <div>
      <div className="btn-row">
        <button
          className="btn"
          onClick={() => {
            setSeed((s) => s + 1);
            setStep(0);
          }}
        >
          New sample
        </button>
        <Toggle label="show validation points (hollow)" checked={showVal} onChange={setShowVal} />
      </div>
      <div className="lab-grid even">
        <div>
          <Chart W={420} H={400} x={[0, 1]} y={[0, 1]} xLabel="x₁" yLabel="x₂" ariaLabel="Regions of the pruned tree, with training and validation points">
            {(s) => (
              <>
                <LeafRegions s={s} tree={cur.tree} />
                <Points s={s} X={train.X} y={train.y} r={3.2} />
                {showVal && <Points s={s} X={val.X} y={val.y} r={3.6} hollow />}
              </>
            )}
          </Chart>
          <Legend items={[...CLASS_LEGEND, { label: 'hollow: validation example', cls: 'pt pos hollow', shape: 'dot' }]} />
        </div>
        <div>
          <Chart
            W={420}
            H={260}
            x={[minLeaves - 1, maxLeaves + 1]}
            y={[0, 0.45]}
            xLabel="leaves (pruning moves right to left)"
            yLabel="error rate"
            ariaLabel="Validation and test error along the pruning path"
          >
            {(s) => (
              <>
                <line x1={s.x(cur.leaves)} x2={s.x(cur.leaves)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <path d={pathOf(path.map((p) => [s.x(p.leaves), s.y(p.valErr / 150)]))} className="ln-alt" />
                <path d={pathOf(path.map((p) => [s.x(p.leaves), s.y(p.testErr)]))} className="ln-fit" />
                <circle cx={s.x(cur.leaves)} cy={s.y(cur.valErr / 150)} r={5} className="mark" />
                <circle cx={s.x(cur.leaves)} cy={s.y(cur.testErr)} r={5} className="mark" />
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'validation error (used to choose prunes)', cls: 'ln-alt' },
              { label: 'error on 2000 untouched test points', cls: 'ln-fit' },
            ]}
          />
          <div className="controls">
            <Slider label="pruning steps taken" value={st} min={0} max={path.length - 1} step={1} onChange={setStep} format={(v) => `${v} of ${path.length - 1}`} />
            <Readout
              items={[
                { label: 'leaves', value: String(cur.leaves) },
                { label: 'validation errors', value: `${cur.valErr}/150`, tone: 'accent' },
                { label: 'test error', value: fmt(cur.testErr, 3) },
              ]}
            />
            <div className="status">
              {st === 0
                ? `The unpruned tree makes ${errorCount(cur.tree, train.X, train.y)} training errors: it has a leaf for almost every noisy point.`
                : `Step ${st}: node #${cur.prunedId} became a leaf, removing ${cur.saved} validation error${cur.saved === 1 ? '' : 's'}${cur.saved === 0 ? ' (no worse, and simpler)' : ''}.`}
              {st === path.length - 1 && ' Every remaining replacement would add validation errors, so pruning stops here.'}
            </div>
          </div>
        </div>
      </div>
      {cur.leaves <= 12 && (
        <div>
          <div className="panel-title">The current tree (counts: class 0 / class 1 among training examples)</div>
          <TreeView root={cnodeToTV(cur.tree, ['x₁', 'x₂'], ['0', '1'])} slotW={84} levelH={66} ariaLabel="The pruned tree" />
        </div>
      )}
    </div>
  );
}

const SIZES = [4, 8, 16, 32];
const SE = [0.02, 0.014, 0.01, 0.012];
const START = [0.18, 0.137, 0.13, 0.134];

/** Cross-validated error for four tree sizes. Drag an estimate up or down and compare the two selection rules. */
export function OneSELab() {
  const [cv, setCv] = useState(START);
  const [drag, setDrag] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const iMin = cv.reduce((b, v, i) => (v < cv[b] - 1e-12 ? i : b), 0);
  const thr = cv[iMin] + SE[iMin];
  const iOne = cv.findIndex((v) => v <= thr + 1e-12);
  return (
    <div className="lab-grid">
      <div>
        <Chart
          W={520}
          H={320}
          x={[1.5, 5.5]}
          y={[0.08, 0.24]}
          xTicks={[2, 3, 4, 5]}
          xTickFormat={(v) => String(2 ** v)}
          xLabel="tree size (leaves) — drag an estimate up or down"
          yLabel="cross-validated error"
          svgRef={ref}
          className="draggable"
          ariaLabel="Cross-validated error with standard-error bars for four tree sizes"
          onPointerMove={(e, s) => {
            if (drag === null || !ref.current) return;
            const v = clamp(s.iy(svgPoint(ref.current, e).y), 0.09, 0.23);
            setCv(cv.map((c, i) => (i === drag ? Math.round(v * 1000) / 1000 : c)));
          }}
          onPointerUp={() => setDrag(null)}
        >
          {(s) => (
            <>
              <line x1={s.left} x2={s.right} y1={s.y(thr)} y2={s.y(thr)} className="ln-res" strokeDasharray="6 4" />
              {cv.map((v, i) => {
                const x = s.x(Math.log2(SIZES[i]));
                return (
                  <g key={i}>
                    <line x1={x} x2={x} y1={s.y(v - SE[i])} y2={s.y(v + SE[i])} className="ln-data" />
                    <line x1={x - 7} x2={x + 7} y1={s.y(v - SE[i])} y2={s.y(v - SE[i])} className="ln-data" />
                    <line x1={x - 7} x2={x + 7} y1={s.y(v + SE[i])} y2={s.y(v + SE[i])} className="ln-data" />
                    {i === iOne && <circle cx={x} cy={s.y(v)} r={13} className="ring-q" />}
                    {i === iMin && <circle cx={x} cy={s.y(v)} r={10} className="ring-miss" />}
                    <circle
                      cx={x}
                      cy={s.y(v)}
                      r={7}
                      className="handle"
                      onPointerDown={(e) => {
                        (e.target as Element).setPointerCapture?.(e.pointerId);
                        setDrag(i);
                      }}
                    />
                    <text x={x + 18} y={s.y(v) + 4} className="anno">
                      {v.toFixed(3)}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </Chart>
        <Legend
          items={[
            { label: 'estimate ± its standard error', cls: 'ln-data' },
            { label: 'minimum + SE at the minimum', cls: 'ln-res', shape: 'dash' },
            { label: 'minimum-error choice', cls: 'ring-miss', shape: 'dot' },
            { label: 'one-SE choice', cls: 'ring-q', shape: 'dot' },
          ]}
        />
      </div>
      <div className="controls">
        <Readout
          items={[
            { label: 'minimum-error rule', value: `${SIZES[iMin]} leaves` },
            { label: 'threshold', value: `${cv[iMin].toFixed(3)} + ${SE[iMin].toFixed(3)} = ${thr.toFixed(3)}` },
            { label: 'one-SE rule', value: `${SIZES[iOne]} leaves`, tone: 'accent' },
          ]}
        />
        <button className="btn" onClick={() => setCv(START)}>
          Reset to the worked example
        </button>
        <p className="small muted">The one-SE rule takes the smallest tree whose estimate is at or below the threshold. Only the minimum’s own SE sets the line.</p>
      </div>
    </div>
  );
}
