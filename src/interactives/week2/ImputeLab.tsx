import { useMemo, useState } from 'react';
import { Chart, Legend } from '../../components/Chart';
import { Readout, Segmented, Slider } from '../../components/ui';
import { fmt, mean, rng } from '../../lib/num';

type Mech = 'random' | 'high';
type Strategy = 'delete' | 'mean' | 'median';
const N = 16;
const TRUE = (() => {
  const r = rng(41);
  return Array.from({ length: N }, () => Math.round((20 + 5 * r.normal()) * 10) / 10);
})();
const median = (v: number[]) => {
  const s = [...v].sort((a, b) => a - b);
  const h = s.length / 2;
  return s.length % 2 ? s[Math.floor(h)] : (s[h - 1] + s[h]) / 2;
};
const sd = (v: number[]) => {
  const m = mean(v);
  return Math.sqrt(mean(v.map((x) => (x - m) ** 2)));
};

/** Which values go missing: a random subset, or preferentially the large ones. */
function missingSet(mech: Mech, count: number) {
  const r = rng(mech === 'random' ? 21 : 8);
  const key = TRUE.map((v, i) => ({ i, k: mech === 'random' ? r.uniform() : -(v + 2.5 * r.normal()) }));
  return new Set(
    key
      .sort((a, b) => a.k - b.k)
      .slice(0, count)
      .map((o) => o.i),
  );
}

export function ImputeLab() {
  const [mech, setMech] = useState<Mech>('random');
  const [strategy, setStrategy] = useState<Strategy>('mean');
  const [count, setCount] = useState(5);
  const miss = useMemo(() => missingSet(mech, count), [mech, count]);
  const observed = TRUE.filter((_, i) => !miss.has(i));
  const fill = strategy === 'median' ? median(observed) : mean(observed);
  const completed = strategy === 'delete' ? observed : TRUE.map((v, i) => (miss.has(i) ? fill : v));
  const lo = Math.min(...TRUE) - 1;
  const hi = Math.max(...TRUE) + 1;
  const rowY = { true: 2, obs: 1, comp: 0 };
  const label = (v: number) => (v === 2 ? 'true values' : v === 1 ? 'observed' : strategy === 'delete' ? 'rows kept' : 'completed');

  return (
    <div>
      <div className="btn-row">
        <Segmented
          options={[
            { value: 'random', label: 'Missing at random' },
            { value: 'high', label: 'Large values go missing' },
          ]}
          value={mech}
          onChange={setMech}
        />
        <Segmented
          options={[
            { value: 'delete', label: 'Delete rows' },
            { value: 'mean', label: 'Mean' },
            { value: 'median', label: 'Median' },
          ]}
          value={strategy}
          onChange={setStrategy}
        />
      </div>
      <Chart W={920} H={250} x={[lo, hi]} y={[-0.6, 2.6]} yTicks={[0, 1, 2]} yTickFormat={label} margin={{ l: 92, r: 14, t: 14, b: 38 }} grid={false} xLabel="value (e.g. temperature, °C)" ariaLabel="True, observed and completed values">
        {(s) => {
          const mline = (v: number, row: number, cls: string) => <line x1={s.x(v)} x2={s.x(v)} y1={s.y(row - 0.38)} y2={s.y(row + 0.38)} className={cls} />;
          return (
            <>
              {[0, 1, 2].map((r) => (
                <line key={r} x1={s.left} x2={s.right} y1={s.y(r)} y2={s.y(r)} stroke="var(--grid)" />
              ))}
              {TRUE.map((v, i) => (
                <circle key={`t${i}`} cx={s.x(v)} cy={s.y(rowY.true)} r={5} className={`pt ${miss.has(i) ? 'hi' : 'dim'}`} />
              ))}
              {TRUE.map((v, i) => !miss.has(i) && <circle key={`o${i}`} cx={s.x(v)} cy={s.y(rowY.obs)} r={5} className="pt" />)}
              {strategy === 'delete'
                ? observed.map((v, i) => <circle key={`c${i}`} cx={s.x(v)} cy={s.y(rowY.comp)} r={5} className="pt" />)
                : TRUE.map((v, i) =>
                    miss.has(i) ? (
                      <circle key={`c${i}`} cx={s.x(fill)} cy={s.y(rowY.comp) + ((i % 5) - 2) * 4} r={5} className="pt hollow" style={{ stroke: 'var(--c-alt)' }} />
                    ) : (
                      <circle key={`c${i}`} cx={s.x(v)} cy={s.y(rowY.comp)} r={5} className="pt" />
                    ),
                  )}
              {mline(mean(TRUE), 2, 'ln-truth')}
              {mline(mean(observed), 1, 'ln-fit')}
              {mline(mean(completed), 0, 'ln-fit')}
            </>
          );
        }}
      </Chart>
      <Legend
        items={[
          { label: 'value that went missing (unknown in practice)', cls: 'pt hi', shape: 'dot' },
          { label: 'observed value', cls: 'pt', shape: 'dot' },
          ...(strategy !== 'delete' ? [{ label: 'imputed value', cls: 'pt hollow', shape: 'dot' as const }] : []),
          { label: 'mean of the row', cls: 'ln-fit' },
        ]}
      />
      <Slider label="number of missing values" value={count} min={0} max={10} step={1} onChange={setCount} format={(v) => `${v} of ${N}`} />
      <Readout
        items={[
          { label: 'true mean', value: fmt(mean(TRUE), 2) },
          { label: strategy === 'delete' ? 'mean of kept rows' : 'completed mean', value: fmt(mean(completed), 2), tone: 'accent' },
          { label: 'true std. dev.', value: fmt(sd(TRUE), 2) },
          { label: strategy === 'delete' ? 'std. dev. of kept rows' : 'completed std. dev.', value: fmt(sd(completed), 2), tone: 'accent' },
          { label: 'rows available', value: `${completed.length} of ${N}` },
        ]}
      />
    </div>
  );
}
