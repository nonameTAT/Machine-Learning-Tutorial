import { M } from '../../components/Math';
import { Callout, Sec } from '../../components/ui';
import { LaterWeeks, StudyRoute } from '../../course/overview';

// Week 1 overview body; the shell adds the heading above and “Your data” below.
export default function Overview() {
  return (
    <>
      <LaterWeeks />

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

      <StudyRoute />

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
    </>
  );
}
