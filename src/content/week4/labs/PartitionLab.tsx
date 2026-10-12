import { useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { Chart, Legend, svgPoint, type Scales } from '../../../components/Chart';
import { M } from '../../../components/Math';
import { Readout, Slider } from '../../../components/ui';
import { clamp, fmt } from '../../../lib/num';
import { TreeView, type TV } from './TreeView';

const XD: [number, number] = [0, 5];
const YD: [number, number] = [0, 4];

/** The two-test tree of the lesson and the three regions it carves out. Drag the query to trace its path. */
export function PartitionLab() {
  const [t1, setT1] = useState(2);
  const [t2, setT2] = useState(1);
  const [q, setQ] = useState<[number, number]>([3, 0.5]);
  const [drag, setDrag] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  const left = q[0] <= t1;
  const low = q[1] <= t2;
  const leaf = left ? 'A1' : low ? 'B' : 'A2';
  const path = left ? ['root', 'A1'] : ['root', 'n2', leaf];
  const tree: TV = {
    key: 'root',
    label: `x₁ ≤ ${fmt(t1, 1)}`,
    kids: [
      { edge: 'yes', node: { key: 'A1', label: 'A', leaf: true, tone: 'pos' } },
      {
        edge: 'no',
        node: {
          key: 'n2',
          label: `x₂ ≤ ${fmt(t2, 1)}`,
          kids: [
            { edge: 'yes', node: { key: 'B', label: 'B', leaf: true, tone: 'neg' } },
            { edge: 'no', node: { key: 'A2', label: 'A', leaf: true, tone: 'pos' } },
          ],
        },
      },
    ],
  };
  const rule = left ? `x_1 \\le ${fmt(t1, 1)}` : `x_1 > ${fmt(t1, 1)} \\;\\wedge\\; x_2 ${low ? '\\le' : '>'} ${fmt(t2, 1)}`;

  const moveTo = (e: RPointerEvent<SVGSVGElement>, s: Scales) => {
    if (!ref.current) return;
    const c = svgPoint(ref.current, e);
    setQ([Math.round(clamp(s.ix(c.x), XD[0], XD[1]) * 10) / 10, Math.round(clamp(s.iy(c.y), YD[0], YD[1]) * 10) / 10]);
  };

  return (
    <div className="lab-grid even">
      <div>
        <Chart
          W={460}
          H={380}
          x={XD}
          y={YD}
          xLabel="x₁   — drag or click to move the query"
          yLabel="x₂"
          svgRef={ref}
          className="draggable"
          ariaLabel="Three rectangular regions produced by two threshold tests"
          onPointerDown={(e, s) => {
            ref.current?.setPointerCapture?.(e.pointerId);
            setDrag(true);
            moveTo(e, s);
          }}
          onPointerMove={(e, s) => drag && moveTo(e, s)}
          onPointerUp={() => setDrag(false)}
        >
          {(s) => {
            const box = (x0: number, x1: number, y0: number, y1: number, cls: string, on: boolean) => (
              <rect x={s.x(x0)} y={s.y(y1)} width={s.x(x1) - s.x(x0)} height={s.y(y0) - s.y(y1)} className={`${cls} ${on ? 'rg-on' : ''}`} />
            );
            return (
              <>
                {box(0, t1, 0, 4, 'rg-pos', leaf === 'A1')}
                {box(t1, 5, 0, t2, 'rg-neg', leaf === 'B')}
                {box(t1, 5, t2, 4, 'rg-pos', leaf === 'A2')}
                <line x1={s.x(t1)} x2={s.x(t1)} y1={s.y(0)} y2={s.y(4)} className="ln-fit" />
                <line x1={s.x(t1)} x2={s.x(5)} y1={s.y(t2)} y2={s.y(t2)} className="ln-fit" />
                <text x={s.x(t1 / 2)} y={s.y(2)} textAnchor="middle" className="region-tag pos">
                  A
                </text>
                <text x={s.x((t1 + 5) / 2)} y={s.y(t2 / 2) + 8} textAnchor="middle" className="region-tag neg">
                  B
                </text>
                <text x={s.x((t1 + 5) / 2)} y={s.y((t2 + 4) / 2) + 8} textAnchor="middle" className="region-tag pos">
                  A
                </text>
                <circle cx={s.x(q[0])} cy={s.y(q[1])} r={7} className="mark-acc" />
              </>
            );
          }}
        </Chart>
        <Legend
          items={[
            { label: 'region predicting A', cls: 'rg-pos', shape: 'box' },
            { label: 'region predicting B', cls: 'rg-neg', shape: 'box' },
            { label: 'query', cls: 'mark-acc', shape: 'dot' },
          ]}
        />
      </div>
      <div className="controls">
        <TreeView root={tree} path={path} ariaLabel="The tree, with the query's path highlighted" />
        <Slider label="first threshold (root test on x₁)" value={t1} min={0.5} max={4.5} step={0.1} onChange={setT1} format={(v) => fmt(v, 1)} />
        <Slider label="second threshold (test on x₂, right branch only)" value={t2} min={0.3} max={3.7} step={0.1} onChange={setT2} format={(v) => fmt(v, 1)} />
        <Readout
          items={[
            { label: 'query', value: `(${fmt(q[0], 1)}, ${fmt(q[1], 1)})` },
            { label: 'tests asked', value: String(path.length - 1) },
            { label: 'prediction', value: leaf === 'B' ? 'B' : 'A', tone: 'accent' },
          ]}
        />
        <div className="panel-title">The leaf as a logical rule</div>
        <div>
          <M t={`${rule} \\;\\Rightarrow\\; ${leaf === 'B' ? 'B' : 'A'}`} />
        </div>
      </div>
    </div>
  );
}
