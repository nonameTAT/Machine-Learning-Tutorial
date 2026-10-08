import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { SigmoidLab } from '../../interactives/week2/SigmoidLab';
import { CHECKS2 } from './checks';

export default function L03Sigmoid() {
  return (
    <>
      <Sec title="Why not just fit a line to the 0/1 labels?">
        <p>
          Plot a binary label against one input and you get two horizontal rows of points. Week 1 gives us a hammer — least squares — so why
          not fit a line and threshold it at ½? There are several problems. The decisive one is about <em>what the output means</em>:
        </p>
        <ul>
          <li>
            We want <M t="P(y = 1 \mid \bx)" />, a number in <M t="[0, 1]" />. A line is unbounded: far enough out it predicts values below 0 or above 1,
            which cannot be probabilities.
          </li>
          <li>
            The Week 1 justification for squared error was Gaussian noise around the mean (lesson 7 of Week 1). A binary response is not Gaussian, so that
            likelihood argument does not apply. (Least-squares <em>algebra</em> still runs — it just lacks the probabilistic justification.)
          </li>
          <li>A line also reacts to points far from the boundary: an easy, very large x drags the line and shifts where it crosses ½.</li>
        </ul>
        <p>
          The fix keeps the linear score but changes the <em>output scale</em>: feed the score through a function that squashes every real number into
          (0, 1).
        </p>
      </Sec>

      <Sec title="The sigmoid turns a score into a probability">
        <p>Logistic regression models</p>
        <MB t="P(y = 1 \mid \bx) = h_\beta(\bx) = \sigma(z) = \frac{1}{1 + e^{-z}}, \qquad z = \bxt\T\beta = \beta_0 + \sum_{r=1}^d \beta_rx_r," />
        <MB t="P(y = 0 \mid \bx) = 1 - h_\beta(\bx)." />
        <p>
          The labels stay 0 or 1; the model estimates their <em>conditional probabilities</em>. Logistic regression seeks to model the probability of a
          class given the inputs, estimate it for a new observation, and classify from that estimate.
        </p>
        <Table
          head={['Property of σ', 'Why it matters']}
          rows={[
            [<M t="0 < \sigma(z) < 1" />, 'every finite score gives a valid probability'],
            [<M t="\sigma(0) = \tfrac12" />, 'score 0 means “undecided”'],
            ['strictly increasing', 'a larger score always means a larger probability: the ordering of scores is preserved'],
            [<M t="\sigma(-z) = 1 - \sigma(z)" />, 'the two classes are treated symmetrically'],
            [<><M t="\sigma(z) \to 1" /> as <M t="z \to \infty" /></>, 'probabilities approach, but never reach, 0 and 1'],
          ]}
        />
        <Callout kind="example">
          With <M t="z = -2 + x" />: at <M t="x = 1, 2, 4" /> the scores are <M t="-1, 0, 2" /> and the probabilities are{' '}
          <M t="\sigma(-1) \approx 0.269" />, <M t="0.5" />, <M t="\sigma(2) \approx 0.881" />.
        </Callout>
      </Sec>

      <Sec title="The decision boundary is still linear">
        <p>Predict class 1 when the estimated probability is at least ½. Because σ is increasing and σ(0) = ½:</p>
        <MB t="h_\beta(\bx) \ge 0.5 \iff \bxt\T\beta \ge 0." />
        <p>
          The <em>probability</em> is a nonlinear function of the score, but the <em>decision boundary</em> <M t="\bxt\T\beta = 0" /> is a hyperplane in
          feature space. That is why logistic regression is called a linear model. As in Week 1, adding transformed features (say{' '}
          <M t="x^2" />) gives a boundary that is linear in the new features and curved in the original input.
        </p>
        <Steps
          intro={<p>The ½ threshold is a convention, not a law. For a general threshold τ, invert the sigmoid.</p>}
          steps={[
            { title: 'Start from the probability condition', body: <MB t="\sigma(z) \ge \tau \iff \frac{1}{1 + e^{-z}} \ge \tau, \qquad 0 < \tau < 1." /> },
            { title: 'Rearrange (all quantities positive)', body: <MB t="1 + e^{-z} \le \frac1\tau \iff e^{-z} \le \frac{1 - \tau}{\tau}." /> },
            {
              title: 'Take logs (log is increasing)',
              body: (
                <>
                  <MB t="\boxed{\;\sigma(z) \ge \tau \iff z \ge \log\frac{\tau}{1 - \tau}\;}" />
                  <p>
                    <M t="\log\frac{\tau}{1 - \tau}" /> is the <em>log-odds</em> (logit) of τ. For τ = 0.5 it is 0, recovering the rule above.
                  </p>
                </>
              ),
            },
            {
              title: 'Apply it to z = −2 + x with τ = 0.8',
              body: (
                <p>
                  <M t="\log(0.8/0.2) = \log 4 \approx 1.386" />, so predict positive when <M t="x \ge 2 + \log 4 \approx 3.386" />. Raising the threshold
                  moves the boundary <em>without refitting</em> the probability model — the mechanism behind ROC curves (lesson 9).
                </p>
              ),
            },
          ]}
        />
        <Lab
          title="Score → probability → label"
          purpose="Adjust the coefficients and the threshold. The shaded side of the dashed boundary is predicted positive; red rings mark training mistakes."
        >
          <SigmoidLab />
        </Lab>
        <TryThis
          items={[
            'Press “Fit” to get the maximum-likelihood coefficients (lesson 4 explains what that means). Note the log loss, then nudge either slider: the loss rises.',
            'Press “× 2” a few times. The boundary stays put (at τ = ½) and the labels do not change, but the curve becomes steeper: the probabilities become more extreme. Watch the log loss.',
            'Raise τ to 0.8. The boundary moves right to x* = (log 4 − β₀)/β₁: fewer positives predicted, fewer false positives, more missed positives.',
            'Turn on the least-squares line. It leaves [0, 1] at both ends of the range.',
          ]}
        />
      </Sec>

      <Sec title="Reading the coefficients">
        <p>
          Because <M t="\log\frac{p}{1 - p} = \bxt\T\beta" />, logistic regression is linear in the <strong>log-odds</strong>. Increasing feature{' '}
          <M t="x_r" /> by one unit (others fixed) adds <M t="\beta_r" /> to the log-odds, i.e. multiplies the odds <M t="p/(1 - p)" /> by{' '}
          <M t="e^{\beta_r}" />. This is one sense in which the model is “easy to interpret” — but note it is the <em>odds</em>, not the
          probability, that change by a constant factor.
        </p>
        <Callout kind="warning">
          Multiplying every coefficient by a positive constant <M t="c" /> leaves the sign of the score — and so the ½-boundary and the labels away from
          ties — unchanged. It does <em>not</em> leave the probabilities unchanged: <M t="\sigma(cz)" /> is more extreme than <M t="\sigma(z)" /> for{' '}
          <M t="c > 1" />. The labels and the probabilities are different outputs.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l3.q1"
          q={<p>A model has score z = −log 3 + x log 3. What is the probability at x = 2, and the boundary for τ = 0.75?</p>}
          options={[
            { text: '3/4; x ≥ 2', correct: true, why: 'At x = 2, z = log 3 and σ(log 3) = 1/(1 + 1/3) = 3/4. For τ = 0.75 we need z ≥ log 3, i.e. x ≥ 2.' },
            { text: '1/2; x ≥ 1', why: '1/2 is the probability at x = 1 (z = 0). x ≥ 1 is the τ = 0.5 boundary.' },
            { text: '3; x ≥ 3', why: 'e^z = 3 is the odds, not the probability.' },
          ]}
        />
        <Quiz
          id="w2.l3.q2"
          q={<p>Every coefficient is multiplied by 10. Which statement is correct?</p>}
          options={[
            { text: 'Nothing changes.', why: 'The probabilities change: σ(10z) is much more extreme.' },
            { text: 'The 0.5 boundary and the labels away from ties are unchanged; the probabilities become more extreme.', correct: true, why: 'sign(10z) = sign(z), but σ(10z) ≠ σ(z).' },
            { text: 'The boundary moves ten times further from the origin.', why: 'The boundary z = 0 is the same set of points.' },
          ]}
        />
        <Quiz
          id="w2.l3.q3"
          q={<p>“Logistic regression is nonlinear because σ is nonlinear.” Evaluate.</p>}
          options={[
            { text: 'True — it cannot be called a linear model.', why: 'It is called linear because of its decision boundary.' },
            { text: 'Half true: the probability is nonlinear in the score, but the decision boundary is linear in the features.', correct: true, why: 'σ(z) ≥ τ ⇔ z ≥ logit(τ), and z is linear in the features.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Logistic regression keeps a linear score <M t="z = \bxt\T\beta" /> and squashes it with <M t="\sigma(z) = 1/(1 + e^{-z})" /> into an estimate
        of <M t="P(y = 1 \mid \bx)" />. Since σ is increasing, <M t="\sigma(z) \ge \tau \iff z \ge \log\frac{\tau}{1 - \tau}" />: the boundary is a
        hyperplane, and changing τ moves it without refitting.
      </Callout>

      <Checklist id="w2-sigmoid" items={CHECKS2['w2-sigmoid']} />
    </>
  );
}
