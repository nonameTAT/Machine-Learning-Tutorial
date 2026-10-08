import { useMemo, useState } from 'react';
import { M } from '../components/Math';
import { Plot } from '../components/Plot';
import { Readout, Slider, Toggle } from '../components/ui';
import { fmt, linspace, lstsq, rng } from '../lib/num';
import { cssVar } from '../lib/theme';

const TRUE = { b0: -95, bh: 0.55, bb: 4.2 };

/** Weight from height and frame size: a plane of best fit you can rotate. */
export function PlaneFit3D() {
  const [seed, setSeed] = useState(4);
  const [noise, setNoise] = useState(4);
  const [showRes, setShowRes] = useState(true);
  const [open, setOpen] = useState(false);

  const { h, b, w, theta } = useMemo(() => {
    const r = rng(seed);
    const m = 40;
    const h = Array.from({ length: m }, () => r.range(150, 195));
    const b = h.map((hi) => 16.5 + 0.06 * (hi - 172) + 0.9 * r.normal());
    const w = h.map((hi, i) => TRUE.b0 + TRUE.bh * hi + TRUE.bb * b[i] + noise * r.normal());
    const theta = lstsq(
      h.map((hi, i) => [1, hi, b[i]]),
      w,
    )!;
    return { h, b, w, theta };
  }, [seed, noise]);

  const data = useMemo(() => {
    if (!open) return [];
    const hs = linspace(148, 197, 12);
    const bs = linspace(13.5, 20.5, 12);
    const z = bs.map((bb) => hs.map((hh) => theta[0] + theta[1] * hh + theta[2] * bb));
    const fitC = cssVar('--c-fit') || '#0f766e';
    const dataC = cssVar('--c-data') || '#2563eb';
    const resC = cssVar('--c-res') || '#e0592a';
    const traces: Plotly.Data[] = [
      {
        type: 'surface',
        x: hs,
        y: bs,
        z,
        opacity: 0.55,
        showscale: false,
        colorscale: [
          [0, fitC],
          [1, fitC],
        ],
        name: 'fitted plane',
        showlegend: true,
        hoverinfo: 'skip',
      } as Plotly.Data,
      {
        type: 'scatter3d',
        mode: 'markers',
        x: h,
        y: b,
        z: w,
        marker: { size: 4, color: dataC },
        name: 'people',
        hovertemplate: 'height %{x:.0f} cm<br>frame %{y:.1f} cm<br>weight %{z:.1f} kg<extra></extra>',
      } as Plotly.Data,
    ];
    if (showRes) {
      const xs: (number | null)[] = [];
      const ys: (number | null)[] = [];
      const zs: (number | null)[] = [];
      h.forEach((hh, i) => {
        xs.push(hh, hh, null);
        ys.push(b[i], b[i], null);
        zs.push(w[i], theta[0] + theta[1] * hh + theta[2] * b[i], null);
      });
      traces.push({ type: 'scatter3d', mode: 'lines', x: xs, y: ys, z: zs, line: { color: resC, width: 4 }, name: 'residuals', hoverinfo: 'skip' } as Plotly.Data);
    }
    return traces;
  }, [open, h, b, w, theta, showRes]);

  const layout = useMemo<Partial<Plotly.Layout>>(
    () => ({
      scene: {
        xaxis: { title: { text: 'height h (cm)' } },
        yaxis: { title: { text: 'frame b (cm)' } },
        zaxis: { title: { text: 'weight w (kg)' } },
        camera: { eye: { x: 1.6, y: -1.5, z: 0.7 } },
        aspectmode: 'cube',
      },
    }),
    [],
  );

  return (
    <div className="lab-grid">
      <div>
        {open ? (
          <Plot data={data} layout={layout} height={430} />
        ) : (
          <div className="plot-placeholder">
            <button className="btn btn-primary" onClick={() => setOpen(true)}>
              Load the 3-D view
            </button>
            <p className="small muted">Uses Plotly (loaded on demand). Drag to rotate, scroll to zoom.</p>
          </div>
        )}
      </div>
      <div className="controls">
        <Slider label="noise std. dev. (kg)" value={noise} min={0} max={12} step={0.5} onChange={setNoise} />
        <Toggle label="Show residuals" checked={showRes} onChange={setShowRes} />
        <button className="btn" onClick={() => setSeed((s) => s + 1)}>
          New sample of 40 people
        </button>
        <Readout
          items={[
            { label: 'θ̂₀ (true −95)', value: fmt(theta[0], 2) },
            { label: 'θ̂_h (true 0.55)', value: fmt(theta[1], 3), tone: 'accent' },
            { label: 'θ̂_b (true 4.2)', value: fmt(theta[2], 3), tone: 'accent' },
          ]}
        />
        <p className="small" style={{ fontFamily: 'var(--font-ui)', margin: 0 }}>
          Model <M t="\hat w = \theta_0 + \theta_h h + \theta_b b" />, fitted by <M t="\hat\theta = (X\T X)^{-1}X\T\by" /> with rows{' '}
          <M t="(1, h_j, b_j)" />. Residuals are vertical (along w). Resample to see how much the estimates move — more noise, more movement.
        </p>
      </div>
    </div>
  );
}

/** Static geometric picture: ŷ is the orthogonal projection of y onto the column space of X. */
export function ProjectionDiagram() {
  return (
    <svg viewBox="0 0 560 320" className="chart" role="img" aria-label="Projection of y onto the column space of X">
      <defs>
        <marker id="arrow-ink" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--ink-soft)" />
        </marker>
        <marker id="arrow-fit" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-fit)" />
        </marker>
        <marker id="arrow-res" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-res)" />
        </marker>
        <marker id="arrow-data" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="var(--c-data)" />
        </marker>
      </defs>
      <polygon points="40,262 330,300 520,218 230,180" fill="var(--accent-soft)" stroke="var(--c-fit)" strokeOpacity="0.5" />
      <text x="470" y="270" className="anno">
        column space of X
      </text>
      <text x="470" y="286" className="anno">
        (all possible Xθ)
      </text>
      <line x1="140" y1="250" x2="250" y2="268" stroke="var(--ink-soft)" strokeWidth="2" markerEnd="url(#arrow-ink)" />
      <text x="214" y="290" className="anno">
        column 1 (ones)
      </text>
      <line x1="140" y1="250" x2="215" y2="208" stroke="var(--ink-soft)" strokeWidth="2" markerEnd="url(#arrow-ink)" />
      <text x="150" y="206" className="anno">
        column 2 (x)
      </text>
      <line x1="140" y1="250" x2="352" y2="58" stroke="var(--c-data)" strokeWidth="2.6" markerEnd="url(#arrow-data)" />
      <text x="300" y="58" className="anno-strong" fill="var(--c-data)">
        y
      </text>
      <line x1="140" y1="250" x2="352" y2="232" stroke="var(--c-fit)" strokeWidth="2.6" markerEnd="url(#arrow-fit)" />
      <text x="356" y="250" className="anno-strong">
        ŷ = Xθ̂
      </text>
      <line x1="356" y1="230" x2="356" y2="62" stroke="var(--c-res)" strokeWidth="2.4" strokeDasharray="6 4" markerEnd="url(#arrow-res)" />
      <text x="364" y="150" className="anno-strong">
        e = y − ŷ
      </text>
      <text x="364" y="166" className="anno">
        ⟂ every column: Xᵀe = 0
      </text>
      <polyline points="356,216 342,217 342,231" fill="none" stroke="var(--ink-soft)" strokeWidth="1.4" />
      <circle cx="140" cy="250" r="3.5" fill="var(--ink)" />
      <text x="122" y="268" className="anno">
        0
      </text>
    </svg>
  );
}
