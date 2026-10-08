import { Sec, Table } from '../../components/ui';
import { clearAllStored, useStored } from '../../lib/storage';
import { LESSONS, weekLessons, weekMeta } from '../registry';

export default function Home3() {
  const [done] = useStored<Record<string, boolean>>('done', {});
  const [lastByWeek] = useStored<Record<string, string>>('lastByWeek', {});
  const week = weekMeta(3);
  const lessons = weekLessons(3);
  const n = lessons.filter((l) => done[l.id]).length;
  const resume = LESSONS.find((l) => l.id === lastByWeek[3] && l.id !== week.home);
  const firstTodo = lessons.find((l) => !done[l.id]);

  return (
    <>
      <div className="hero">
        <div className="hero-kicker">Machine Learning · Interactive study guide</div>
        <h1>Week 3: Bayesian classification</h1>
        <p className="hero-sub">
          From assumptions to probabilities to decisions — Bayes’ rule, MAP and ML, expected loss, Bayes optimal prediction, and Naive
          Bayes for categorical, numeric and text data.
        </p>
        <div className="btn-row">
          {resume ? (
            <a className="btn btn-primary" href={`#/${resume.id}`}>
              Continue: {resume.num && `${resume.num}. `}
              {resume.title} →
            </a>
          ) : (
            <a className="btn btn-primary" href="#/w3-bias">
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

      <Sec title="The thread of the week">
        <p>
          Week 2 separated classes with a boundary or with nearby examples. Week 3 asks a different question: <em>which class could plausibly have generated
          this observation, and how should uncertainty affect the decision?</em> Choose assumptions, estimate probabilities, update beliefs with evidence, then
          choose a prediction using the relevant loss. Naive Bayes makes this practical by simplifying how features interact.
        </p>
        <p>
          If time is short, the spine is lessons 2–5 (Bayes’ rule, odds, base rates, costs), 9–11 (Naive Bayes, PlayTennis, smoothing) and 13–15 (text
          models). Lessons 6–8 connect the framework to regression and to the limits of any classifier.
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
          <a href="#/w3-practice" className="card">
            <span className="card-num">Consolidate</span>
            <span className="card-title">Practice problems</span>
            <span className="card-q">Twelve problems on probability, decisions and Naive Bayes, with full answers.</span>
          </a>
          <a href="#/w3-readiness" className="card">
            <span className="card-num">Consolidate</span>
            <span className="card-title">Readiness check</span>
            <span className="card-q">See, lesson by lesson, which checks and self-assessments you have not yet passed.</span>
          </a>
        </div>
      </Sec>

      <Sec title="What carries over">
        <Table
          head={['Earlier idea', 'Where it returns this week']}
          rows={[
            ['Week 1: least squares from Gaussian maximum likelihood', 'the same derivation as an instance of Bayesian learning (lesson 6)'],
            ['Week 1: bias–variance', 'inductive bias versus statistical bias (lesson 1)'],
            ['Week 2: generative vs discriminative, Bayes’ rule', 'developed fully: MAP, ML, odds (lessons 2–3)'],
            ['Week 2: confusion matrix, thresholds, costs of errors', 'minimum expected loss and the cost threshold (lesson 5)'],
            ['Week 2: missing values, feature types', 'missing features and categorical tables in Naive Bayes (lessons 10, 16)'],
          ]}
        />
      </Sec>

      <Sec title="Subtleties worth remembering">
        <ul>
          <li>
            <strong>Inductive vs statistical bias:</strong> stronger inductive assumptions do not necessarily create greater statistical bias; it depends on whether they match the
            problem (lesson 1).
          </li>
          <li>
            <strong>PlayTennis:</strong> the “no” PlayTennis product needs 4/5 and 3/5, not denominators of 9 (lesson 10).
          </li>
          <li>
            <strong>Gaussian Naive Bayes:</strong> distinguish variance from standard deviation; the Gaussian prefactor is 1/(√(2π)σ) (lesson 12).
          </li>
          <li>
            <strong>Missing features:</strong> marginalising a missing feature in a general posterior table needs weights conditional on the observed features
            (lesson 16).
          </li>
          <li>
            <strong>Odds:</strong> likelihood ratios and posterior odds differ by the prior odds; comparing each with 1 is a different rule unless the
            priors are equal (lessons 3, 17).
          </li>
          <li>
            <strong>Zero counts:</strong> a zero factor eliminates one class score, not necessarily every prediction (lesson 11).
          </li>
        </ul>
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
