import { M } from '../components/Math';
import { Callout, Sec } from '../components/ui';
import { clearAllStored, useStored } from '../lib/storage';
import { LESSONS, weekLessons } from './registry';

export default function Home() {
  const [done] = useStored<Record<string, boolean>>('done', {});
  const [lastByWeek] = useStored<Record<string, string>>('lastByWeek', {});
  const last = lastByWeek[1] ?? 'home';
  const lessons = weekLessons(1);
  const n = lessons.filter((l) => done[l.id]).length;
  const resume = LESSONS.find((l) => l.id === last && l.id !== 'home');
  const firstTodo = lessons.find((l) => !done[l.id]);

  return (
    <>
      <div className="hero">
        <div className="hero-kicker">Machine Learning · Interactive study guide</div>
        <h1>Week 1: Regression</h1>
        <p className="hero-sub">From fitting a line to reasoning about generalisation — an interactive study guide to linear regression and its foundations.</p>
        <div className="btn-row">
          {resume ? (
            <a className="btn btn-primary" href={`#/${resume.id}`}>
              Continue: {resume.num && `${resume.num}. `}
              {resume.title} →
            </a>
          ) : (
            <a className="btn btn-primary" href="#/learning">
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

      <Callout kind="note" title="Later weeks">
        <a href="#/w2-home">Week 2 — Classification</a>: the basic linear classifier, logistic regression, evaluation (cross-validation, confusion matrices,
        ROC), distances and k-NN. <a href="#/w3-home">Week 3 — Bayesian classification</a>: Bayes’ rule, MAP/ML, expected loss, Bayes optimal prediction
        and Naive Bayes. You can switch weeks at any time with the buttons in the top bar.
      </Callout>

      <Sec title="How this guide teaches">
        <p>
          Each lesson follows the same arc, because understanding comes in that order: <strong>why the idea is needed</strong> →{' '}
          <strong>an intuition or picture</strong> → <strong>the precise statement</strong> → <strong>a derivation you advance step by step</strong>{' '}
          (predict each line before revealing it) → <strong>an experiment</strong> you run in an interactive lab → <strong>checks</strong> that target
          common misconceptions → <strong>the central idea</strong> in a few sentences.
        </p>
        <ol>
          <li>Read a lesson once for the story. Do the “Try this” experiments — they are where intuition is built.</li>
          <li>Close the page and explain the central idea out loud. Reconstruct the key derivation on paper.</li>
          <li>Answer the checks; read the explanation for the wrong options too.</li>
          <li>
            Tick the “Can you do these without looking?” list honestly, then mark the lesson as understood. Write notes or questions for your tutor in
            the notes box at the bottom of every page.
          </li>
          <li>
            Attempt the <a href="#/practice">practice problems</a> before opening their solutions; use the <a href="#/reference">reference sheet</a>{' '}
            only once you can derive what is on it.
          </li>
        </ol>
        <Callout kind="note" title="Notation used throughout">
          <M t="m" /> = number of training examples, <M t="n" /> = number of features <em>excluding</em> the intercept, <M t="\bx_j" /> = the{' '}
          <M t="j" />-th input with a leading 1, <M t="X" /> = the <M t="m\times(n+1)" /> design matrix, <M t="\theta" /> = parameters,{' '}
          <M t="e_j = y_j - \hat y_j" /> = residual.
        </Callout>
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
          <a href="#/practice" className="card">
            <span className="card-num">Consolidate</span>
            <span className="card-title">Practice problems</span>
            <span className="card-q">Derivations, calculations and “diagnose the claim” — with hints and full solutions.</span>
          </a>
          <a href="#/readiness" className="card">
            <span className="card-num">Consolidate</span>
            <span className="card-title">Readiness check</span>
            <span className="card-q">See, lesson by lesson, which checks and self-assessments you have not yet passed.</span>
          </a>
        </div>
      </Sec>

      <Sec title="What is machine learning?">
        <blockquote className="quote">
          “The field of machine learning is concerned with the question of how to construct computer programs that automatically improve from
          experience.” <span className="muted">— T. Mitchell, <em>Machine Learning</em> (1997)</span>
        </blockquote>
        <blockquote className="quote">
          “The term machine learning refers to the automated detection of meaningful patterns in data.”{' '}
          <span className="muted">— Shalev-Shwartz &amp; Ben-David, <em>Understanding Machine Learning</em> (2014)</span>
        </blockquote>
        <blockquote className="quote">
          “Data mining is the extraction of implicit, previously unknown, and potentially useful information from data.”{' '}
          <span className="muted">— I. Witten et al., <em>Data Mining</em> (2016)</span>
        </blockquote>
        <p>
          Typical applications: image classification and object detection, spam filtering, speech recognition, event detection, recommender
          systems, human-behaviour recognition, medical diagnosis.
        </p>
      </Sec>

      <Sec title="Reading the charts">
        <div className="legend" style={{ fontSize: 14, gap: '8px 20px' }}>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-data)' }} /> data
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-fit)' }} /> fitted model
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-res)' }} /> residuals / errors / current point
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-alt)' }} /> comparison model / validation data
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-pen)' }} /> penalty / likelihood
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-bias)' }} /> bias
          </span>
          <span className="legend-item">
            <span className="swatch" style={{ background: 'var(--c-var)' }} /> variance
          </span>
        </div>
        <p className="small muted">
          Dashed dark curves are the true (normally unknown) mean function in simulated data. The same colours are used in formulas, e.g.{' '}
          <M t="\cres{e_j}" />, <M t="\cbias{\Bias^2}" />, <M t="\cvar{\text{variance}}" />.
        </p>
      </Sec>

      <Sec title="Your data">
        <p className="small">
          Progress, quiz answers, checklists and notes (for every week) are stored only in this browser’s localStorage. Nothing is sent anywhere.
          Clearing site data, or using a private window, starts fresh.
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
