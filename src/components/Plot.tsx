import { useEffect, useRef, useState } from 'react';
import { cssVar, useResolvedTheme } from '../lib/theme';

// Plotly is large, so it is loaded only when a 3-D view is first opened.
type PlotlyModule = typeof import('plotly.js-dist-min');
let plotlyPromise: Promise<PlotlyModule> | null = null;
const loadPlotly = () => (plotlyPromise ??= import('plotly.js-dist-min').then((m) => (m.default ?? m) as PlotlyModule));

export interface PlotProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  height?: number;
  className?: string;
}

export function Plot({ data, layout, height = 420, className }: PlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const theme = useResolvedTheme();

  useEffect(() => {
    let cancelled = false;
    loadPlotly()
      .then((Plotly) => {
        if (cancelled || !ref.current) return;
        const ink = cssVar('--ink') || '#222';
        const muted = cssVar('--muted') || '#666';
        const grid = cssVar('--grid') || '#ddd';
        const axis = { gridcolor: grid, zerolinecolor: muted, color: muted, backgroundcolor: 'rgba(0,0,0,0)', showbackground: false };
        const base: Partial<Plotly.Layout> = {
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: ink, family: 'system-ui, -apple-system, Segoe UI, sans-serif', size: 12 },
          margin: { l: 10, r: 10, t: 10, b: 10 },
          height,
          showlegend: true,
          legend: { orientation: 'h', y: -0.02, font: { color: ink } },
        };
        const merged: Partial<Plotly.Layout> = {
          ...base,
          ...layout,
          scene: layout?.scene
            ? {
                ...layout.scene,
                xaxis: { ...axis, ...(layout.scene.xaxis ?? {}) },
                yaxis: { ...axis, ...(layout.scene.yaxis ?? {}) },
                zaxis: { ...axis, ...(layout.scene.zaxis ?? {}) },
              }
            : undefined,
        };
        if (!layout?.scene) delete merged.scene;
        return Plotly.react(ref.current, data, merged, { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['toImage'] });
      })
      .then(() => !cancelled && setStatus('ready'))
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [data, layout, height, theme]);

  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el && plotlyPromise) plotlyPromise.then((P) => P.purge(el)).catch(() => undefined);
    };
  }, []);

  return (
    <div className={`plotly-wrap ${className ?? ''}`} style={{ minHeight: height }}>
      {status === 'loading' && <div className="plot-loading">Loading 3-D plot…</div>}
      {status === 'error' && <div className="plot-loading">Could not load Plotly.</div>}
      <div ref={ref} />
    </div>
  );
}
