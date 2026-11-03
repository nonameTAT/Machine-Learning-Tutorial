import { useCallback, useMemo } from 'react';
import { Line3D, Points3D, Scene3D, Surface, type V3 } from '../../../components/three/Scene3D';
import { fmt } from '../../../lib/num';

/** 3-D view for PlaneFit3D: the people, the fitted plane and the vertical residuals. Loaded on demand (three.js). */
export default function PlaneFitScene({ h, b, w, theta, showRes }: { h: number[]; b: number[]; w: number[]; theta: number[]; showRes: boolean }) {
  const plane = useCallback((hh: number, bb: number) => theta[0] + theta[1] * hh + theta[2] * bb, [theta]);
  const x: [number, number] = [148, 197];
  const y: [number, number] = [13.5, 20.5];
  const z = useMemo<[number, number]>(() => {
    const corners = [plane(x[0], y[0]), plane(x[1], y[1]), plane(x[0], y[1]), plane(x[1], y[0])];
    const all = [...w, ...corners];
    return [Math.floor(Math.min(...all) / 10) * 10, Math.ceil(Math.max(...all) / 10) * 10];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, plane]);
  const pts = useMemo(() => h.map((hh, i): V3 => [hh, b[i], w[i]]), [h, b, w]);
  const res = useMemo(() => h.flatMap((hh, i): V3[] => [[hh, b[i], w[i]], [hh, b[i], plane(hh, b[i])]]), [h, b, w, plane]);
  return (
    <Scene3D
      domain={{ x, y, z }}
      labels={{ x: 'height h (cm)', y: 'frame b (cm)', z: 'weight w (kg)' }}
      legend={[
        { label: 'fitted plane', cls: 'sw-fit', shape: 'box' },
        { label: 'people', cls: 'pt', shape: 'dot' },
        ...(showRes ? [{ label: 'residuals', cls: 'ln-res' }] : []),
      ]}
    >
      <Surface f={plane} n={8} grid={7} color="--c-fit" opacity={0.5} />
      {showRes && <Line3D points={res} segments color="--c-res" width={2.5} />}
      <Points3D
        points={pts}
        color="--c-data"
        tooltip={(i) => (
          <>
            height {fmt(h[i], 0)} cm
            <br />
            frame {fmt(b[i], 1)} cm
            <br />
            weight {fmt(w[i], 1)} kg
          </>
        )}
      />
    </Scene3D>
  );
}
