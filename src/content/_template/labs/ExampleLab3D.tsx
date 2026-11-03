import { useState } from 'react';
import { Readout, Slider } from '../../../components/ui';
import { lazy3D } from '../../../components/View3D';
import { fmt } from '../../../lib/num';
import { mse } from './exampleData';

// A 3-D lab: ordinary React state and controls, plus a scene that is loaded on demand.
// lazy3D is called once, at module scope; the scene file (ExampleScene.tsx) is the only place that imports three.js.
const Scene = lazy3D(() => import('./ExampleScene'));

export function ExampleLab3D() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(1);
  return (
    <div className="lab-grid">
      <Scene height={380} a={a} b={b} />
      <div className="controls">
        <Slider label="intercept a" value={a} min={-4} max={4} step={0.1} onChange={setA} />
        <Slider label="slope b" value={b} min={0} max={4} step={0.05} onChange={setB} />
        <Readout items={[{ label: 'MSE at (a, b)', value: fmt(mse(a, b), 3), tone: 'accent' }]} />
      </div>
    </div>
  );
}
