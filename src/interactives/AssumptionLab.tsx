import { useMemo, useState, type ReactNode } from 'react';
import { Chart, pathOf } from '../components/Chart';
import { Segmented } from '../components/ui';
import { linspace, mean, ols1d, rng } from '../lib/num';

type Scenario = 'good' | 'nonlinear' | 'hetero' | 'dependent' | 'heavy';

const INFO: Record<Scenario, { label: string; violated: string; look: ReactNode; consequence: ReactNode }> = {
  good: {
    label: 'All assumptions hold',
    violated: 'none',
    look: 'Residuals form a structureless horizontal band around 0 with roughly constant spread; the histogram looks bell-shaped.',
    consequence: 'Least squares is the maximum-likelihood fit, and the usual probabilistic statements about it are justified.',
  },
  nonlinear: {
    label: 'Curved mean',
    violated: 'Linearity: E[y | x] is not linear in the chosen features.',
    look: 'A systematic U (or arch) in residuals vs fitted: the line is too high in the middle and too low at the ends.',
    consequence: (
      <>
        Predictions are <strong>systematically</strong> wrong in parts of the input range (bias). Fix the representation — e.g. add <em>x²</em> (lesson
        9) — rather than the fitting method.
      </>
    ),
  },
  hetero: {
    label: 'Fan-shaped spread',
    violated: 'Homoscedasticity: Var(y | x) grows with x.',
    look: 'A funnel: residual spread widens as the fitted value grows.',
    consequence: (
      <>
        The line can still be reasonable, but equal weighting of all squared residuals is no longer the likelihood-optimal choice, and uncertainty is
        understated where noise is large. Weighted least squares or transforming y (e.g. log) are common responses.
      </>
    ),
  },
  dependent: {
    label: 'Correlated errors (time order)',
    violated: 'Independence: each error is similar to the previous one.',
    look: 'Plotted in collection order, residuals come in long runs above and below 0 instead of jumping around randomly.',
    consequence: (
      <>
        The likelihood no longer factors into a product, and the data contain less independent information than m suggests, so the fit looks more
        certain than it is. Typical in time series.
      </>
    ),
  },
  heavy: {
    label: 'Heavy-tailed noise',
    violated: 'Normality of residuals: occasional errors are far larger than a Gaussian allows.',
    look: 'Most residuals are tightly clustered but a few are extreme; the histogram has a sharp peak and long tails compared with the fitted bell curve.',
    consequence: (
      <>
        Squared loss lets those few points pull the line (lesson 2). A loss that grows more slowly, such as absolute error, is more robust (lesson 7’s
        Laplace remark).
      </>
    ),
  },
};

function generate(sc: Scenario, seed: number) {
  const r = rng(seed);
  const n = 90;
  let x: number[];
  let y: number[];
  if (sc === 'dependent') {
    x = linspace(0, 10, n);
    let e = 0;
    y = x.map((xi) => {
      e = 0.93 * e + 0.45 * r.normal();
      return 2 + 0.8 * xi + 1.4 * e;
    });
  } else {
    x = Array.from({ length: n }, () => r.range(0, 10));
    y = x.map((xi) => {
      if (sc === 'nonlinear') return 0.5 + 0.17 * xi * xi + 0.7 * r.normal();
      if (sc === 'hetero') return 2 + 0.8 * xi + (0.15 + 0.38 * xi) * r.normal();
      if (sc === 'heavy') {
        const chi = (r.normal() ** 2 + r.normal() ** 2 + r.normal() ** 2) / 3;
        return 2 + 0.8 * xi + (0.7 * r.normal()) / Math.sqrt(chi);
      }
      return 2 + 0.8 * xi + r.normal();
    });
  }
  const fit = ols1d(x, y)!;
  const yhat = x.map((xi) => fit.b0 + fit.b1 * xi);
  const res = y.map((yi, i) => yi - yhat[i]);
  return { x, y, fit, yhat, res };
}

export function AssumptionLab() {
  const [sc, setSc] = useState<Scenario>('good');
  const [seed, setSeed] = useState(11);
  const { x, y, fit, yhat, res } = useMemo(() => generate(sc, seed), [sc, seed]);
  const sd = Math.sqrt(mean(res.map((e) => e * e)));
  const rmax = Math.min(12, Math.max(4, ...res.map(Math.abs)) * 1.1);
  const yMin = Math.min(...y, ...yhat);
  const yMax = Math.max(...y, ...yhat);
  const pad = (yMax - yMin) * 0.08;

  // histogram
  const nb = 18;
  const edges = linspace(-rmax, rmax, nb + 1);
  const counts = new Array(nb).fill(0);
  res.forEach((e) => {
    const k = Math.min(nb - 1, Math.max(0, Math.floor(((e + rmax) / (2 * rmax)) * nb)));
    counts[k] += 1;
  });
  const bw = edges[1] - edges[0];
  const dens = counts.map((c) => c / (res.length * bw));
  const gauss = (e: number) => Math.exp(-(e * e) / (2 * sd * sd)) / Math.sqrt(2 * Math.PI * sd * sd);
  const dMax = Math.max(...dens, gauss(0)) * 1.1;
  const info = INFO[sc];
  const order = sc === 'dependent';

  return (
    <div>
      <div className="btn-row">
        <Segmented options={(Object.keys(INFO) as Scenario[]).map((k) => ({ value: k, label: INFO[k].label }))} value={sc} onChange={setSc} />
        <button className="btn btn-ghost" onClick={() => setSeed((s) => s + 1)}>
          New sample
        </button>
      </div>
      <div className="lab-grid three">
        <div>
          <div className="panel-title">Data and OLS line</div>
          <Chart W={360} H={260} x={[0, 10]} y={[yMin - pad, yMax + pad]} xLabel={order ? 'x (= time order)' : 'x'} margin={{ l: 38, r: 10, t: 10, b: 34 }}>
            {(s) => (
              <>
                {x.map((xi, i) => (
                  <circle key={i} cx={s.x(xi)} cy={s.y(y[i])} r={3.2} className="pt" />
                ))}
                <line x1={s.x(0)} x2={s.x(10)} y1={s.y(fit.b0)} y2={s.y(fit.b0 + 10 * fit.b1)} className="ln-fit" />
              </>
            )}
          </Chart>
        </div>
        <div>
          <div className="panel-title">{order ? 'Residuals in collection order' : 'Residuals vs fitted values'}</div>
          <Chart
            W={360}
            H={260}
            x={order ? [0, 10] : [Math.min(...yhat), Math.max(...yhat)]}
            y={[-rmax, rmax]}
            xLabel={order ? 'time' : 'fitted ŷ'}
            margin={{ l: 38, r: 10, t: 10, b: 34 }}
          >
            {(s) => (
              <>
                <line x1={s.left} x2={s.right} y1={s.y(0)} y2={s.y(0)} className="ln-ghost" />
                {order && <path d={pathOf(x.map((xi, i) => [s.x(xi), s.y(res[i])]))} stroke="var(--c-res)" strokeOpacity={0.5} fill="none" />}
                {res.map((e, i) => (
                  <circle key={i} cx={s.x(order ? x[i] : yhat[i])} cy={s.y(e)} r={3.2} fill="var(--c-res)" />
                ))}
              </>
            )}
          </Chart>
        </div>
        <div>
          <div className="panel-title">Residual histogram vs Gaussian</div>
          <Chart W={360} H={260} x={[-rmax, rmax]} y={[0, dMax]} xLabel="residual" margin={{ l: 38, r: 10, t: 10, b: 34 }} yTickFormat={() => ''}>
            {(s) => (
              <>
                {dens.map((d, k) => (
                  <rect key={k} x={s.x(edges[k]) + 1} width={Math.max(0, s.x(edges[k + 1]) - s.x(edges[k]) - 2)} y={s.y(d)} height={s.y(0) - s.y(d)} className="bar-pos" opacity={0.55} />
                ))}
                <path d={pathOf(linspace(-rmax, rmax, 120).map((e) => [s.x(e), s.y(gauss(e))]))} className="ln-pen" />
              </>
            )}
          </Chart>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <tbody>
            <tr>
              <th style={{ width: '22%' }}>Assumption at risk</th>
              <td>{info.violated}</td>
            </tr>
            <tr>
              <th>What to look for</th>
              <td>{info.look}</td>
            </tr>
            <tr>
              <th>What it affects</th>
              <td>{info.consequence}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
