import { useState } from 'react';
import { Readout, Segmented, Slider } from '../../components/ui';
import { fmt } from '../../lib/num';

const COLOURS = ['red', 'green', 'blue'] as const;
type Colour = (typeof COLOURS)[number];
const CODINGS: Record<string, Record<Colour, number>> = {
  a: { red: 1, green: 2, blue: 3 },
  b: { red: 1, blue: 2, green: 3 },
  c: { green: 1, red: 2, blue: 3 },
};
const SW: Record<Colour, string> = { red: '#dc2626', green: '#16a34a', blue: '#2563eb' };

/** Arbitrary integer codes for a nominal feature invent distances; matching and one-hot do not. */
export function CategoryCodeLab() {
  const [coding, setCoding] = useState('a');
  const code = CODINGS[coding];
  const pairs: [Colour, Colour][] = [
    ['red', 'green'],
    ['red', 'blue'],
    ['green', 'blue'],
  ];
  const nearestToRed = (['green', 'blue'] as Colour[]).sort((u, v) => Math.abs(code[u] - code.red) - Math.abs(code[v] - code.red));
  const tie = Math.abs(code.green - code.red) === Math.abs(code.blue - code.red);
  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={Object.keys(CODINGS).map((k) => ({
            value: k,
            label: COLOURS.map((c) => `${c[0].toUpperCase()}=${CODINGS[k][c]}`).join(' '),
          }))}
          value={coding}
          onChange={setCoding}
          label="coding"
        />
      </div>
      <div className="table-wrap num">
        <table>
          <thead>
            <tr>
              <th>pair</th>
              <th>|code difference|</th>
              <th>simple matching</th>
              <th>one-hot, Euclidean</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(([u, v]) => (
              <tr key={u + v}>
                <td>
                  <span className="swatch" style={{ background: SW[u] }} /> {u} – <span className="swatch" style={{ background: SW[v] }} /> {v}
                </td>
                <td style={{ fontWeight: 650 }}>{Math.abs(code[u] - code[v])}</td>
                <td>1</td>
                <td>√2 ≈ 1.414</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="status">
        Under this coding the colour “closest” to red is <strong>{tie ? 'a tie' : nearestToRed[0]}</strong>. Relabel the same three colours and the answer
        changes — the distances came from the arbitrary codes, not from the colours. Matching and one-hot treat every pair of different colours alike.
      </div>
    </div>
  );
}

/** Hours on a 24-hour clock: raw subtraction versus going round the clock. */
export function ClockLab() {
  const [a, setA] = useState(23);
  const [b, setB] = useState(1);
  const raw = Math.abs(a - b);
  const circ = Math.min(raw, 24 - raw);
  const ang = (h: number) => (h / 24) * 2 * Math.PI - Math.PI / 2;
  const R = 70;
  const cx = 90;
  const cy = 90;
  const pt = (h: number) => [cx + R * Math.cos(ang(h)), cy + R * Math.sin(ang(h))];
  const [ax, ay] = pt(a);
  const [bx, by] = pt(b);
  // the short arc from a to b
  const forward = (((b - a) % 24) + 24) % 24;
  const sweep = forward <= 12 ? 1 : 0;
  const chord = 2 * Math.sin((Math.PI * circ) / 24);
  return (
    <div className="lab-grid">
      <svg viewBox="0 0 180 180" className="chart" style={{ maxWidth: 240 }} role="img" aria-label="24-hour clock">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--line)" strokeWidth={2} />
        {[0, 6, 12, 18].map((h) => {
          const [x, y] = [cx + (R + 12) * Math.cos(ang(h)), cy + (R + 12) * Math.sin(ang(h))];
          return (
            <text key={h} x={x} y={y + 4} textAnchor="middle" className="anno">
              {h}
            </text>
          );
        })}
        <path d={`M${ax},${ay} A${R},${R} 0 0 ${sweep} ${bx},${by}`} fill="none" stroke="var(--accent)" strokeWidth={4} />
        <circle cx={ax} cy={ay} r={7} className="pt pos" />
        <rect x={bx - 6} y={by - 6} width={12} height={12} className="pt neg" />
      </svg>
      <div className="controls">
        <Slider label="time a (hours)" value={a} min={0} max={23.5} step={0.5} onChange={setA} />
        <Slider label="time b (hours)" value={b} min={0} max={23.5} step={0.5} onChange={setB} />
        <Readout
          items={[
            { label: 'raw |a − b|', value: fmt(raw, 1) },
            { label: 'round the clock', value: fmt(circ, 1), tone: 'accent' },
            { label: '(sin, cos) chord', value: fmt(chord, 3) },
          ]}
        />
        <p className="small muted">
          The chord is the Euclidean distance after encoding an hour h as (sin 2πh/24, cos 2πh/24) — one common way to make a cyclic
          feature’s distances respect the cycle.
        </p>
      </div>
    </div>
  );
}
