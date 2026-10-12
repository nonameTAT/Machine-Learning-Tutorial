import { M } from '../../components/Math';
import { Sec, Table } from '../../components/ui';
import { StudyRoute } from '../../course/overview';

// Week 2 overview body; the shell adds the heading above and “Your data” below.
export default function Overview() {
  return (
    <>
      <Sec title="How to use this week">
        <p>
          The method is the same as Week 1: read a lesson for the story; predict each derivation step before revealing it; run the “Try this” experiments;
          answer the checks (and read why the wrong options are wrong); tick the self-check list honestly; then attempt the <a href="#/w2-practice">practice
          problems</a> on paper before opening solutions.
        </p>
        <p>
          Week 2 has more lessons than Week 1 but several are short (data types, missing values, metric axioms). If time is tight, the spine is lessons 2–5
          (linear and logistic classifiers), 6 and 8–9 (evaluation), and 14–17 (k-NN).
        </p>
      </Sec>

      <StudyRoute />

      <Sec title="What carries over from Week 1">
        <Table
          head={['Week 1 idea', 'Where it returns this week']}
          rows={[
            ['Maximum likelihood with Gaussian noise → squared error', 'Bernoulli labels → log loss (lesson 4)'],
            ['Gradient descent on the MSE', 'gradient descent on the log loss — same algorithm, no closed form (lesson 5)'],
            ['Train / validation / test, choosing λ or degree', 'cross-validation to choose k or a threshold (lesson 6)'],
            ['Indicator features for categories', 'data types and honest encodings (lesson 7)'],
            ['The mean as the best constant under squared error', 'the mean as the exemplar minimising squared distance (lesson 13)'],
            ['k-NN regression, feature scaling', 'k-NN classification, scaling, weighting (lessons 14–16)'],
            ['Bias–variance trade-off', 'the role of k: 1-NN low bias / high variance (lesson 16)'],
          ]}
        />
      </Sec>

      <Sec title="Reading the charts">
        <div className="legend" style={{ fontSize: 14, gap: '8px 20px' }}>
          <span className="legend-item">
            <svg width="16" height="16" aria-hidden>
              <circle cx="8" cy="8" r="6" className="pt pos" />
            </svg>
            positive class (y = 1), circles
          </span>
          <span className="legend-item">
            <svg width="16" height="16" aria-hidden>
              <rect x="2" y="2" width="12" height="12" rx="1.5" className="pt neg" />
            </svg>
            negative class (y = 0), squares
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-pos)', opacity: 0.35 }} /> / <span className="swatch" style={{ background: 'var(--c-neg)', opacity: 0.35 }} />{' '}
            predicted regions
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-fit)' }} /> fitted boundary / curve
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ border: '2px solid var(--c-bad)', background: 'transparent' }} /> red ring: misclassified
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--accent)' }} /> query point
          </span>
        </div>
        <p className="small muted">
          Classes differ in shape as well as colour. Formulas use the same colours where helpful, e.g. <M t="\cpos{\bp}" /> for the positive mean and{' '}
          <M t="\cneg{\bn}" /> for the negative mean.
        </p>
      </Sec>
    </>
  );
}
