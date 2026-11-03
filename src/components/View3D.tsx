import { Component, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react';

// three.js is large, so a 3-D scene is a separate module, loaded the first time it is shown:
//
//   const Bowl3D = lazy3D(() => import('./BowlScene'));   // module scope, once
//   <Bowl3D height={440} {...sceneProps} />
//
// The scene module's default export is a component built from components/three/Scene3D. Nothing is downloaded
// until the view comes near the visible part of the page.
// A failed download (e.g. the site was redeployed while the page was open) can be retried or fixed by reloading.

type Status = 'loading' | 'ready' | 'load-error';

class DrawBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null };
  static getDerivedStateFromError(e: unknown) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
  render() {
    if (this.state.error)
      return (
        <div className="plot-loading plot-error" role="alert">
          <p>
            The 3-D view could not be drawn ({this.state.error}). 3-D views need WebGL: check that hardware acceleration is turned on in your
            browser’s settings.
          </p>
        </div>
      );
    return this.props.children;
  }
}

export function lazy3D<P extends object>(load: () => Promise<{ default: ComponentType<P> }>) {
  let pending: Promise<ComponentType<P>> | null = null;
  const get = () =>
    (pending ??= load()
      .then((m) => m.default)
      .catch((e: unknown) => {
        pending = null; // forget the failure, so “Try again” really retries
        throw e;
      }));

  return function Lazy3D({ height = 420, ...props }: P & { height?: number }) {
    const [Scene, setScene] = useState<ComponentType<P> | null>(null);
    const [status, setStatus] = useState<Status>('loading');
    const [detail, setDetail] = useState('');
    const [attempt, setAttempt] = useState(0);
    const box = useRef<HTMLDivElement>(null);
    const [near, setNear] = useState(typeof IntersectionObserver === 'undefined');

    useEffect(() => {
      if (near || !box.current) return;
      const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setNear(true), { rootMargin: '400px 0px' });
      io.observe(box.current);
      return () => io.disconnect();
    }, [near]);

    useEffect(() => {
      if (!near) return;
      let cancelled = false;
      get().then(
        (C) => {
          if (cancelled) return;
          setScene(() => C);
          setStatus('ready');
        },
        (e: unknown) => {
          if (cancelled) return;
          // keep only the file name of any URL in the message
          setDetail((e instanceof Error ? e.message : String(e)).replace(/\S*\/([^/\s]+)/g, '$1'));
          setStatus('load-error');
        },
      );
      return () => {
        cancelled = true;
      };
    }, [attempt, near]);

    return (
      <div ref={box} className="view3d" style={{ height }}>
        {status === 'loading' && <div className="plot-loading">Loading 3-D view…</div>}
        {status === 'load-error' && (
          <div className="plot-loading plot-error" role="alert">
            <p>
              Could not download the 3-D view ({detail}). If the site was updated after you opened this page, reloading the page fixes it.
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
        {Scene && (
          <DrawBoundary>
            <Scene {...(props as P)} />
          </DrawBoundary>
        )}
      </div>
    );
  };
}
