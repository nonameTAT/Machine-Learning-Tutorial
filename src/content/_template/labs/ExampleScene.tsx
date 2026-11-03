import { Line3D, Points3D, Scene3D, Surface } from '../../../components/three/Scene3D';
import { fmt } from '../../../lib/num';
import { mse } from './exampleData';

// A scene for lazy3D: its default export receives the props given to the lazy component (minus height).
// Scene3D maps the data domain onto a cube with z up; Surface, Line3D and Points3D take data coordinates.
// Pass functions that keep their identity between renders (module-level, or useCallback), so the surface is not rebuilt.
export default function ExampleScene({ a, b }: { a: number; b: number }) {
  const z = mse(a, b);
  return (
    <Scene3D
      domain={{ x: [-4, 4], y: [0, 4], z: [0, 40] }}
      labels={{ x: 'intercept a', y: 'slope b', z: 'MSE' }}
      legend={[
        { label: 'MSE over (a, b)', cls: 'sw-fit', shape: 'box' },
        { label: 'current (a, b)', cls: 'pt hi', shape: 'dot' },
      ]}
    >
      <Surface f={mse} grid={8} colormap={{ min: 0, max: 40 }} opacity={0.9} tooltip={(x, y, v) => `a ${fmt(x, 2)}, b ${fmt(y, 2)}: MSE ${fmt(v, 2)}`} />
      <Line3D points={[[a, b, z], [a, b, 0]]} color="--muted" dashed width={1} />
      <Points3D points={[[a, b, z]]} color="--c-res" size={0.045} />
    </Scene3D>
  );
}
