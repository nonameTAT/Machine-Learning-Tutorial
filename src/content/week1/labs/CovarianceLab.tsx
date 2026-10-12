import { useRef, useState } from 'react';
import { Chart, Legend, svgPoint } from '../../../components/Chart';
import { Readout, Segmented, Toggle } from '../../../components/ui';
import { clamp, fmt } from '../../../lib/num';

type Preset = 'positive' | 'negative' | 'none' | 'curve';
const PRESETS: Record<Preset, { label: string; pts: [number, number][] }> = {
  positive: { label: 'rising', pts: [[1.5, 2.2], [2.5, 3.6], [3.4, 2.8], [4.6, 5.1], [5.5, 4.4], [6.5, 6.8], [7.6, 6.1], [8.5, 8.2]] },
  negative: { label: 'falling', pts: [[1.5, 8.0], [2.5, 6.6], [3.4, 7.2], [4.6, 5.0], [5.5, 5.6], [6.5, 3.4], [7.6, 4.0], [8.5, 1.9]] },
  none: { label: 'no pattern', pts: [[1.5, 6.5], [2.5, 2.5], [3.4, 8.0], [4.6, 4.2], [5.5, 7.4], [6.5, 3.0], [7.6, 6.2], [8.5, 3.6]] },
  // symmetric about x = 5, so the signed areas cancel exactly
  curve: { label: 'U-shape', pts: [[1.5, 8.4], [2.5, 5.6], [3.5, 3.7], [4.5, 2.3], [5.5, 2.3], [6.5, 3.7], [7.5, 5.6], [8.5, 8.4]] },
};

/** Each point and the mean point span a rectangle; covariance is the average signed area. */
export function CovarianceLab() {
  const [pts, setPts] = useState(PRESETS.positive.pts);
  const [preset, setPreset] = useState<Preset | 'custom'>('positive');
  const [cm, setCm] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  const k = cm ? 100 : 1; // x measured in centimetres instead of metres
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p[0], 0) / n;
  const my = pts.reduce((s, p) => s + p[1], 0) / n;
  const prods = pts.map(([x, y]) => (x - mx) * k * (y - my));
  const pos = prods.filter((p) => p > 0).reduce((a, b) => a + b, 0);
  const neg = prods.filter((p) => p < 0).reduce((a, b) => a + b, 0);
  const cov = (pos + neg) / (n - 1);
  const sx = Math.sqrt(pts.reduce((s, p) => s + ((p[0] - mx) * k) ** 2, 0) / (n - 1));
  const sy = Math.sqrt(pts.reduce((s, p) => s + (p[1] - my) ** 2, 0) / (n - 1));
  const r = sx > 0 && sy > 0 ? cov / (sx * sy) : NaN;

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="data"
          options={[...(Object.keys(PRESETS) as Preset[]).map((p) => ({ value: p, label: PRESETS[p].label })), ...(preset === 'custom' ? [{ value: 'custom' as const, label: 'your data' }] : [])]}
          value={preset}
          onChange={(p) => {
            if (p === 'custom') return;
            setPreset(p);
            setPts(PRESETS[p].pts);
          }}
        />
        <Toggle label="measure x in centimetres instead of metres" checked={cm} onChange={setCm} />
      </div>
      <div className="lab-grid">
        <div>
          <Chart
            W={480}
            H={420}
            x={[0, 10]}
            y={[0, 10]}
            xTickFormat={(v) => String(v * k)}
            xLabel={`x (${cm ? 'cm' : 'm'}) — drag the points`}
            yLabel="y"
            svgRef={ref}
            className="draggable"
            ariaLabel="Points with the rectangle each one spans with the mean point"
            onPointerMove={(e, s) => {
              if (drag === null || !ref.current) return;
              const c = svgPoint(ref.current, e);
              const p: [number, number] = [Math.round(clamp(s.ix(c.x), 0.2, 9.8) * 10) / 10, Math.round(clamp(s.iy(c.y), 0.2, 9.8) * 10) / 10];
              setPreset('custom');
              setPts(pts.map((q, i) => (i === drag ? p : q)));
            }}
            onPointerUp={() => setDrag(null)}
          >
            {(s) => (
              <>
                {pts.map(([x, y], i) => (
                  <rect
                    key={`r${i}`}
                    x={s.x(Math.min(x, mx))}
                    y={s.y(Math.max(y, my))}
                    width={Math.abs(s.x(x) - s.x(mx))}
                    height={Math.abs(s.y(y) - s.y(my))}
                    className={prods[i] >= 0 ? 'rg-pos' : 'rg-neg'}
                    stroke={prods[i] >= 0 ? 'var(--c-pos)' : 'var(--c-neg)'}
                    strokeOpacity={0.5}
                  />
                ))}
                <line x1={s.x(mx)} x2={s.x(mx)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                <line x1={s.left} x2={s.right} y1={s.y(my)} y2={s.y(my)} className="ln-ghost" />
                <circle cx={s.x(mx)} cy={s.y(my)} r={5} fill="var(--ink)" />
                {pts.map(([x, y], i) => (
                  <circle
                    key={`p${i}`}
                    cx={s.x(x)}
                    cy={s.y(y)}
                    r={drag === i ? 8 : 6}
                    className="pt drag"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      (e.target as Element).setPointerCapture?.(e.pointerId);
                      setDrag(i);
                    }}
                  />
                ))}
              </>
            )}
          </Chart>
          <Legend
            items={[
              { label: 'same side of both means: product > 0', cls: 'rg-pos', shape: 'box' },
              { label: 'opposite sides: product < 0', cls: 'rg-neg', shape: 'box' },
              { label: 'the means x̄ and ȳ', cls: 'ln-ghost', shape: 'dash' },
            ]}
          />
        </div>
        <div className="controls">
          <Readout
            items={[
              { label: 'Σ of positive products', value: fmt(pos, 3) },
              { label: 'Σ of negative products', value: fmt(neg, 3) },
              { label: 'Cov(x, y) = total / (N − 1)', value: fmt(cov, 3), tone: 'accent' },
              { label: 'standard deviation of x', value: fmt(sx, 3) },
              { label: 'standard deviation of y', value: fmt(sy, 3) },
              { label: 'r = Cov / (both standard deviations)', value: Number.isNaN(r) ? 'undefined' : fmt(r, 3), tone: 'accent' },
            ]}
          />
          <p className="small muted">
            Each product (xᵢ − x̄)(yᵢ − ȳ) is the signed area of a rectangle: blue counts for, orange against. Covariance adds them up; its size depends on
            the units. r divides by both spreads and does not.
          </p>
        </div>
      </div>
    </div>
  );
}
