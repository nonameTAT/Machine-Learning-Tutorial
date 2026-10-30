import { useEffect, useRef, useState } from 'react';
import { Chart, pathOf, svgPoint, type Scales } from '../../../components/Chart';
import { M } from '../../../components/Math';
import { Readout, Segmented, Slider, Toggle } from '../../../components/ui';
import { clamp, fmt, linspace } from '../../../lib/num';
import { EX_X, EX_Y } from './ResidualLab';

// One parameter so every loss is a curve we can draw: the running example with x centred (x − 7)
// and the intercept held at its optimum 8, leaving only the slope θ = θ₁ to learn.
// Example j's loss is ℓ_j(θ) = (r_j − θ c_j)² with c_j = x_j − 7, r_j = y_j − 8,
// its gradient g_j(θ) = −2 (r_j − θ c_j) c_j, and J = mean ℓ_j, ∇J = mean g_j.
const C = EX_X.map((x) => x - 7);
const R = EX_Y.map((y) => y - 8);
const m = C.length;
const loss = (j: number, t: number) => (R[j] - t * C[j]) ** 2;
const grad = (j: number, t: number) => -2 * (R[j] - t * C[j]) * C[j];
const J = (t: number) => C.reduce((s, _, j) => s + loss(j, t), 0) / m;
const dJ = (t: number) => C.reduce((s, _, j) => s + grad(j, t), 0) / m;
const T_HAT = C.reduce((s, c, j) => s + c * R[j], 0) / C.reduce((s, c) => s + c * c, 0); // = −1
const BATCH_LIMIT = m / C.reduce((s, c) => s + c * c, 0); // 1/λ, λ = Σc²/m
const SGD_LIMIT = 1 / Math.max(...C.map((c) => c * c)); // every single-example step must contract

const COLORS = ['var(--c-data)', 'var(--c-fit)', 'var(--c-var)', 'var(--c-bias)', 'var(--c-pen)'];
const MEAN = 'var(--c-truth)';
const TD: [number, number] = [-7, 3];
const LD: [number, number] = [0, 100];
const GD_: [number, number] = [-80, 80];
const MAX_HIST = 600;

type Order = 'cycle' | 'shuffle';
type Kind = 'start' | 'sgd' | 'batch';
interface Hist {
  t: number;
  kind: Kind;
  j: number | null;
}

const shuffled = () => {
  const a = Array.from({ length: m }, (_, i) => i);
  for (let i = m - 1; i > 0; i--) {
    const k = Math.floor(Math.random() * (i + 1));
    [a[i], a[k]] = [a[k], a[i]];
  }
  return a;
};
const identity = () => Array.from({ length: m }, (_, i) => i);

/** A short tangent segment of fixed on-screen length through (t, v) with slope g (data units). */
function tangent(s: Scales, t: number, v: number, g: number, len = 34) {
  const px = s.x(t + 1) - s.x(t);
  const py = s.y(v + g) - s.y(v);
  const n = Math.hypot(px, py) || 1;
  const dx = (px / n) * len;
  const dy = (py / n) * len;
  const cx = s.x(t);
  const cy = s.y(v);
  return { x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy };
}

/** Horizontal arrow along a fixed height, from θ to θ' (clipped by the chart). */
function Arrow({ s, from, to, y, color, dash }: { s: Scales; from: number; to: number; y: number; color: string; dash?: boolean }) {
  const x1 = s.x(from);
  const x2 = s.x(to);
  if (!Number.isFinite(x2) || Math.abs(x2 - x1) < 2) return null;
  const dir = Math.sign(x2 - x1);
  return (
    <g>
      <line x1={x1} x2={x2 - dir * 6} y1={y} y2={y} stroke={color} strokeWidth={2.2} strokeDasharray={dash ? '5 4' : undefined} />
      <polygon points={`${x2},${y} ${x2 - dir * 9},${y - 5} ${x2 - dir * 9},${y + 5}`} fill={color} />
    </g>
  );
}

export function SGDLossLab() {
  const [order, setOrder] = useState<Order>('cycle');
  const [logA, setLogA] = useState(Math.log10(0.02));
  const [hist, setHist] = useState<Hist[]>([{ t: 1, kind: 'start', j: null }]);
  const [perm, setPerm] = useState<number[]>(identity);
  const [k, setK] = useState(0); // SGD updates taken so far
  const [running, setRunning] = useState(false);
  const [tangents, setTangents] = useState(true);
  const lossRef = useRef<SVGSVGElement>(null);
  const gradRef = useRef<SVGSVGElement>(null);

  const alpha = 10 ** logA;
  const theta = hist[hist.length - 1].t;
  const diverged = !Number.isFinite(theta) || Math.abs(theta) > 1e4;
  const next = perm[k % m];
  const gs = C.map((_, j) => grad(j, theta));
  const gMean = dJ(theta);
  const gSd = Math.sqrt(gs.reduce((s, g) => s + (g - gMean) ** 2, 0) / m);
  const sgdTo = theta - alpha * gs[next];
  const batchTo = theta - alpha * gMean;

  const reset = (t = hist[0].t) => {
    setRunning(false);
    setHist([{ t, kind: 'start', j: null }]);
    setK(0);
    setPerm(order === 'cycle' ? identity() : shuffled());
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  const push = (h: Hist) => setHist((p) => (p.length >= MAX_HIST ? [...p.slice(1), h] : [...p, h]));

  const sgdStep = () => {
    push({ t: sgdTo, kind: 'sgd', j: next });
    const k2 = k + 1;
    setK(k2);
    if (k2 % m === 0 && order === 'shuffle') setPerm(shuffled());
  };
  const batchStep = () => push({ t: batchTo, kind: 'batch', j: null });

  useEffect(() => {
    if (!running) return;
    if (diverged) {
      setRunning(false);
      return;
    }
    const id = setTimeout(sgdStep, 280);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, hist]);

  const pick = (svg: SVGSVGElement | null, e: { clientX: number; clientY: number }, s: Scales) => {
    if (!svg) return;
    reset(Number(clamp(s.ix(svgPoint(svg, e).x), TD[0], TD[1]).toFixed(2)));
  };

  const ts = linspace(TD[0], TD[1], 241);
  const recent = hist.slice(-12);
  const finite = Number.isFinite(theta) && !diverged;
  const opacity = (j: number) => (j === next ? 1 : 0.42);

  return (
    <div>
      <div className="btn-row">
        <Segmented
          label="example order"
          options={[
            { value: 'cycle', label: 'Examples in order 1→5' },
            { value: 'shuffle', label: 'Reshuffle each epoch' },
          ]}
          value={order}
          onChange={setOrder}
        />
        <Toggle label="Show tangents (slopes)" checked={tangents} onChange={setTangents} />
      </div>

      <div className="lab-grid even">
        <div>
          <div className="panel-title">Losses ℓⱼ(θ) of each example, and their mean J(θ) — click to move θ</div>
          <Chart
            W={520}
            H={360}
            x={TD}
            y={LD}
            xLabel="θ (slope)"
            yLabel="loss"
            svgRef={lossRef}
            className="draggable"
            onPointerDown={(e, s) => pick(lossRef.current, e, s)}
          >
            {(s) => (
              <>
                {C.map((_, j) => (
                  <path
                    key={j}
                    d={pathOf(ts.map((t) => [s.x(t), s.y(loss(j, t))]))}
                    fill="none"
                    stroke={COLORS[j]}
                    strokeWidth={j === next ? 2.6 : 1.6}
                    strokeOpacity={opacity(j)}
                  />
                ))}
                <path d={pathOf(ts.map((t) => [s.x(t), s.y(J(t))]))} fill="none" stroke={MEAN} strokeWidth={3.2} />
                <line x1={s.x(T_HAT)} x2={s.x(T_HAT)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                {recent.slice(0, -1).map((h, i) => (
                  <circle key={i} cx={s.x(h.t)} cy={s.y(J(h.t))} r={3} fill="var(--c-res)" opacity={0.2 + (0.6 * i) / recent.length} />
                ))}
                {finite && (
                  <>
                    <line x1={s.x(theta)} x2={s.x(theta)} y1={s.top} y2={s.bottom} stroke="var(--muted)" strokeWidth={1} />
                    {tangents &&
                      C.map((_, j) => (
                        <line key={j} {...tangent(s, theta, loss(j, theta), gs[j])} stroke={COLORS[j]} strokeWidth={2} strokeOpacity={opacity(j)} />
                      ))}
                    {tangents && <line {...tangent(s, theta, J(theta), gMean, 44)} stroke={MEAN} strokeWidth={2.6} />}
                    {C.map((_, j) => (
                      <circle key={j} cx={s.x(theta)} cy={s.y(loss(j, theta))} r={j === next ? 5 : 3.5} fill={COLORS[j]} stroke="var(--surface)" strokeWidth={1.5} />
                    ))}
                    <circle cx={s.x(theta)} cy={s.y(J(theta))} r={6} className="mark" />
                    <Arrow s={s} from={theta} to={batchTo} y={s.bottom - 26} color={MEAN} dash />
                    <Arrow s={s} from={theta} to={sgdTo} y={s.bottom - 12} color="var(--c-res)" />
                  </>
                )}
              </>
            )}
          </Chart>
          <SampleLegend next={next} />
          <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: '4px 0 0' }}>
            Arrows at the bottom: <span style={{ color: 'var(--c-res)', fontWeight: 650 }}>solid</span> = the next SGD step (example{' '}
            {next + 1} only); dashed = the batch step (mean gradient). Grey dashed line = minimiser θ̂ of J.
          </p>
        </div>

        <div>
          <div className="panel-title">Gradients gⱼ(θ) = ℓⱼ′(θ), and their mean ∇J(θ)</div>
          <Chart
            W={520}
            H={300}
            x={TD}
            y={GD_}
            xLabel="θ (slope)"
            yLabel="gradient"
            svgRef={gradRef}
            className="draggable"
            onPointerDown={(e, s) => pick(gradRef.current, e, s)}
          >
            {(s) => (
              <>
                <line x1={s.left} x2={s.right} y1={s.y(0)} y2={s.y(0)} stroke="var(--muted)" strokeWidth={1.2} />
                {C.map((_, j) => (
                  <path
                    key={j}
                    d={pathOf(ts.map((t) => [s.x(t), s.y(grad(j, t))]))}
                    fill="none"
                    stroke={COLORS[j]}
                    strokeWidth={j === next ? 2.6 : 1.6}
                    strokeOpacity={opacity(j)}
                  />
                ))}
                <path d={pathOf(ts.map((t) => [s.x(t), s.y(dJ(t))]))} fill="none" stroke={MEAN} strokeWidth={3.2} />
                <line x1={s.x(T_HAT)} x2={s.x(T_HAT)} y1={s.top} y2={s.bottom} className="ln-ghost" />
                {finite && (
                  <>
                    <line x1={s.x(theta)} x2={s.x(theta)} y1={s.top} y2={s.bottom} stroke="var(--muted)" strokeWidth={1} />
                    {C.map((_, j) => (
                      <circle key={j} cx={s.x(theta)} cy={s.y(gs[j])} r={j === next ? 5.5 : 4} fill={COLORS[j]} stroke="var(--surface)" strokeWidth={1.5} />
                    ))}
                    <rect x={s.x(theta) - 6} y={s.y(gMean) - 6} width={12} height={12} transform={`rotate(45 ${s.x(theta)} ${s.y(gMean)})`} fill={MEAN} stroke="var(--surface)" strokeWidth={1.5} />
                  </>
                )}
              </>
            )}
          </Chart>
          <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: '2px 0 6px' }}>
            Dots: each example’s gradient at the current θ. Diamond: their average, which is exactly ∇J(θ). At θ̂ the diamond sits on zero, but the dots do
            not.
          </p>
          <div className="panel-title">θ after each update</div>
          <Chart W={520} H={150} x={[0, Math.max(20, hist.length - 1)]} y={TD} margin={{ l: 46, r: 14, t: 8, b: 30 }}>
            {(s) => (
              <>
                <line x1={s.left} x2={s.right} y1={s.y(T_HAT)} y2={s.y(T_HAT)} className="ln-ghost" />
                <path className="ln-res" d={pathOf(hist.map((h, i) => [s.x(i), s.y(h.t)]))} />
                {hist.length < 120 &&
                  hist.map((h, i) => <circle key={i} cx={s.x(i)} cy={s.y(h.t)} r={2.6} fill={h.j === null ? MEAN : COLORS[h.j]} />)}
              </>
            )}
          </Chart>
        </div>
      </div>

      <div className="lab-grid" style={{ marginTop: 10 }}>
        <div className="controls">
          <Slider label={<>learning rate α</>} value={logA} min={-3} max={-0.9} step={0.05} onChange={setLogA} format={() => fmt(alpha, 4)} />
          <div className="btn-row">
            <button className="btn" onClick={sgdStep} disabled={diverged}>
              SGD step (example {next + 1})
            </button>
            <button className="btn" onClick={batchStep} disabled={diverged}>
              Batch step
            </button>
            <button className="btn btn-primary" onClick={() => setRunning((r) => !r)} disabled={diverged}>
              {running ? 'Pause' : 'Run SGD'}
            </button>
            <button className="btn btn-ghost" onClick={() => reset()}>
              Reset
            </button>
          </div>
          {diverged && <div className="status bad">Diverged: a single example’s step overshoots its own bowl. Lower α and reset.</div>}
          <Readout
            items={[
              { label: 'SGD updates', value: k },
              { label: 'θ', value: finite ? fmt(theta, 3) : '—' },
              { label: 'J(θ)', value: finite ? fmt(J(theta), 3) : '∞', tone: 'accent' },
              { label: `g${'₁₂₃₄₅'[next]}(θ) (next)`, value: finite ? fmt(gs[next], 2) : '—' },
              { label: '∇J(θ) = mean gⱼ', value: finite ? fmt(gMean, 2) : '—' },
              { label: 'spread of gⱼ (sd)', value: finite ? fmt(gSd, 2) : '—' },
            ]}
          />
          <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
            Here θ̂ = {fmt(T_HAT, 3)}. Batch GD is stable for <M t={`\\alpha < 1/\\lambda = ${fmt(BATCH_LIMIT, 3)}`} />; each SGD step on example{' '}
            <M t="j" /> multiplies the distance to that example’s own minimiser by <M t="1 - 2\alpha c_j^2" />, so the steepest examples need{' '}
            <M t={`\\alpha < ${fmt(SGD_LIMIT, 4)}`} />.
          </p>
        </div>
        <div>
          <div className="panel-title">At the current θ</div>
          <div className="table-wrap num">
            <table>
              <thead>
                <tr>
                  <th>j</th>
                  <th>xⱼ − 7</th>
                  <th>yⱼ − 8</th>
                  <th>ℓⱼ(θ)</th>
                  <th>gⱼ(θ)</th>
                </tr>
              </thead>
              <tbody>
                {C.map((c, j) => (
                  <tr
                    key={j}
                    style={j === next ? { background: 'color-mix(in srgb, var(--c-res) 12%, transparent)', fontWeight: 650 } : undefined}
                  >
                    <td style={{ color: COLORS[j], fontWeight: 700 }}>{j + 1}</td>
                    <td>{c}</td>
                    <td>{R[j]}</td>
                    <td>{finite ? fmt(loss(j, theta), 2) : '—'}</td>
                    <td>{finite ? fmt(gs[j], 2) : '—'}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '2px solid var(--line)', fontWeight: 700 }}>
                  <td colSpan={3}>mean</td>
                  <td>{finite ? fmt(J(theta), 2) : '—'}</td>
                  <td>{finite ? fmt(gMean, 2) : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SampleLegend({ next }: { next: number }) {
  const item = (label: string, color: string, w: number, key: string | number, bold = false) => (
    <span key={key} className="legend-item" style={bold ? { fontWeight: 700, color: 'var(--ink)' } : undefined}>
      <svg width="22" height="12" aria-hidden>
        <line x1="1" x2="21" y1="6" y2="6" stroke={color} strokeWidth={w} />
      </svg>
      {label}
    </span>
  );
  return (
    <div className="legend">
      {C.map((_, j) => item(`ℓ${'₁₂₃₄₅'[j]}${j === next ? ' (next)' : ''}`, COLORS[j], 2.4, j, j === next))}
      {item('J = mean', MEAN, 3.4, 'mean')}
    </div>
  );
}
