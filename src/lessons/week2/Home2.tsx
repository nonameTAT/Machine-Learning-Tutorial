import { M } from '../../components/Math';
import { Sec, Table } from '../../components/ui';
import { clearAllStored, useStored } from '../../lib/storage';
import { LESSONS, weekLessons, weekMeta } from '../registry';

export default function Home2() {
  const [done] = useStored<Record<string, boolean>>('done', {});
  const [lastByWeek] = useStored<Record<string, string>>('lastByWeek', {});
  const week = weekMeta(2);
  const lessons = weekLessons(2);
  const n = lessons.filter((l) => done[l.id]).length;
  const resume = LESSONS.find((l) => l.id === lastByWeek[2] && l.id !== week.home);
  const firstTodo = lessons.find((l) => !done[l.id]);

  return (
    <>
      <div className="hero">
        <div className="hero-kicker">Machine Learning · Interactive study guide</div>
        <h1>Week 2: Classification</h1>
        <p className="hero-sub">
          From a decision boundary to a defensible evaluation — linear classifiers, logistic regression, evaluation, distances and k-nearest neighbours.
        </p>
        <div className="btn-row">
          {resume ? (
            <a className="btn btn-primary" href={`#/${resume.id}`}>
              Continue: {resume.num && `${resume.num}. `}
              {resume.title} →
            </a>
          ) : (
            <a className="btn btn-primary" href="#/w2-classifier">
              Start with lesson 1 →
            </a>
          )}
          {firstTodo && firstTodo.id !== resume?.id && (
            <a className="btn" href={`#/${firstTodo.id}`}>
              Next unfinished: {firstTodo.num}. {firstTodo.title}
            </a>
          )}
          <span className="kbd-hint">
            {n}/{lessons.length} lessons marked as understood
          </span>
        </div>
      </div>

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

      <Sec title="The study route">
        <div className="cards">
          {lessons.map((l) => (
            <a key={l.id} href={`#/${l.id}`} className={`card ${done[l.id] ? 'done' : ''}`}>
              <span className="card-num">
                <span>
                  Lesson {l.num}
                </span>
                {done[l.id] && <span className="ok">✓ understood</span>}
              </span>
              <span className="card-title">{l.title}</span>
              <span className="card-q">{l.question}</span>
            </a>
          ))}
          <a href="#/w2-practice" className="card">
            <span className="card-num">Consolidate</span>
            <span className="card-title">Practice problems</span>
            <span className="card-q">Central arguments, numerical problems and “diagnose the claim” — with hints and full solutions.</span>
          </a>
          <a href="#/w2-readiness" className="card">
            <span className="card-num">Consolidate</span>
            <span className="card-title">Readiness check</span>
            <span className="card-q">See, lesson by lesson, which checks and self-assessments you have not yet passed.</span>
          </a>
        </div>
      </Sec>

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

      <Sec title="Your data">
        <p className="small">
          Progress, quiz answers, checklists and notes (for every week) are stored only in this browser’s localStorage. Nothing is sent anywhere.
        </p>
        <button
          className="btn"
          onClick={() => {
            if (window.confirm('Erase all progress, quiz answers, checklists and notes stored by this guide, for every week?')) clearAllStored();
          }}
        >
          Reset all progress
        </button>
      </Sec>
    </>
  );
}
