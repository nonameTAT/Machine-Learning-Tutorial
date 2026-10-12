import { useEffect, useRef, useState } from 'react';
import plotlyUrl from 'plotly.js-dist-min/plotly.min.js?url';
import { cssVar, useResolvedTheme } from '../lib/theme';

// Plotly is large, so it is loaded only when a 3-D view is first opened.
//
// In the normal build it is copied as a plain file and loaded with a <script> tag. Its name is a hash of Plotly's own
// contents, so it stays the same across redeploys: a page opened before a deploy can still fetch it. (Bundled as a
// lazy chunk instead, its name would change whenever any lesson changed, and an older open page would request a
// file the new deploy no longer has.) A failed <script> load can be retried with a new tag, unlike a failed import().
// The single-file build has no separate files, so there Plotly is bundled (and the unused URL import is dropped).
type PlotlyModule = typeof import('plotly.js-dist-min');
let plotlyPromise: Promise<PlotlyModule> | null = null;

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      el.remove();
      reject(new Error(`could not fetch ${src}`));
    };
    document.head.appendChild(el);
  });
}

function loadPlotly() {
  plotlyPromise ??= (
    import.meta.env.MODE === 'single'
      ? import('plotly.js-dist-min').then((m) => (m.default ?? m) as PlotlyModule)
      : loadScript(plotlyUrl).then(() => {
          const P = (window as unknown as { Plotly?: PlotlyModule }).Plotly;
          if (!P) throw new Error('Plotly did not initialise');
          return P;
        })
  ).catch((e: unknown) => {
    // forget the failure, so “Try again” really retries
    plotlyPromise = null;
    throw e;
  });
  return plotlyPromise;
}

export interface PlotProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  height?: number;
  className?: string;
}

export function Plot({ data, layout, height = 420, className }: PlotProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'load-error' | 'draw-error'>('loading');
  const [detail, setDetail] = useState('');
  const [attempt, setAttempt] = useState(0);
  const theme = useResolvedTheme();

  useEffect(() => {
    let cancelled = false;
    const fail = (kind: 'load-error' | 'draw-error') => (e: unknown) => {
      if (cancelled) return;
      // keep only the file name of any URL in the message
      setDetail((e instanceof Error ? e.message : String(e)).replace(/\S*\/([^/\s]+)/g, '$1'));
      setStatus(kind);
    };
    loadPlotly().then((Plotly) => {
      if (cancelled || !ref.current) return;
      try {
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
        Plotly.react(ref.current, data, merged, { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['toImage'] }).then(
          () => !cancelled && setStatus('ready'),
          fail('draw-error'),
        );
      } catch (e) {
        fail('draw-error')(e);
      }
    }, fail('load-error'));
    return () => {
      cancelled = true;
    };
  }, [data, layout, height, theme, attempt]);

  useEffect(() => {
    const el = ref.current;
    return () => {
      if (el && plotlyPromise) plotlyPromise.then((P) => P.purge(el)).catch(() => undefined);
    };
  }, []);

  return (
    <div className={`plotly-wrap ${className ?? ''}`} style={{ minHeight: height }}>
      {status === 'loading' && <div className="plot-loading">Loading 3-D plot…</div>}
      {status === 'load-error' && (
        <div className="plot-loading plot-error" role="alert">
          <p>
            Could not download the 3-D plotting library ({detail}). If the site was updated after you opened this page, reloading the page fixes it.
          </p>
          <div className="btn-row">
            <button
              className="btn"
              onClick={() => {
                setStatus('loading');
                setAttempt((a) => a + 1);
              }}
            >
              Try again
            </button>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      )}
      {status === 'draw-error' && (
        <div className="plot-loading plot-error" role="alert">
          <p>
            The 3-D plot could not be drawn ({detail}). 3-D plots need WebGL: check that hardware acceleration is turned on in your browser’s settings.
          </p>
        </div>
      )}
      <div ref={ref} />
    </div>
  );
}
