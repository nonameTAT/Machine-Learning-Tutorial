import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Figure, Lab, Quiz, Sec, Steps, Table, TryThis } from '../components/ui';
import { BiasVarianceLab, Dartboards } from '../interactives/BiasVarLab';

export default function L13BiasVariance() {
  return (
    <>
      <Sec title="The puzzle">
        <p>
          Lessons 9–12 kept meeting the same pattern: a more flexible model (higher degree, smaller λ, smaller k) fits the training data better, yet past
          some point predicts new data worse. There are three regimes — <strong>underfitting</strong> (too simple to capture the truth),{' '}
          <strong>good fit</strong>, and <strong>overfitting</strong> (chasing noise). Why does extra flexibility eventually hurt? The answer is to stop
          thinking about the one model you fitted and imagine <em>all the models you could have fitted</em>.
        </p>
      </Sec>

      <Sec title="Imagine repeating the whole training process">
        <p>
          Your training set is one random draw. Fix a query input <M t="x" />. Draw a fresh training set <M t="D" />, fit the same procedure, and
          record the prediction <M t="\hat f_D(x)" />. Repeat many times. Two different things can go wrong:
        </p>
        <ul>
          <li>
            <strong>Bias</strong> — the <em>average</em> prediction is in the wrong place: <M t="\Bias(x) = \E_D[\hat f_D(x)] - f(x)" />. A high-bias
            model pays little attention to the data and oversimplifies; it errs on training and test data alike.
          </li>
          <li>
            <strong>Variance</strong> — predictions scatter from one training set to the next:{' '}
            <M t="\Var_D(\hat f_D(x)) = \E_D\big[(\hat f_D(x) - \E_D[\hat f_D(x)])^2\big]" />. A high-variance model pays a lot of attention to its
            particular training data, does very well on it, and generalises poorly.
          </li>
        </ul>
        <Figure caption="Each dart is the prediction from one training set; the bull’s-eye is the truth f(x). Bias is where the cluster is centred; variance is how spread out it is.">
          <Dartboards />
        </Figure>
        <Callout kind="warning">
          The variance here is across <em>training sets</em> at a <em>fixed input</em>. It is not the spread of the raw y values, and not how much one
          model’s predictions vary across different x’s.
        </Callout>
        <p>
          In these terms: <strong>underfitting</strong> typically means high bias and low variance; <strong>overfitting</strong> means the
          model has captured the noise along with the pattern — low bias, high variance.
        </p>
      </Sec>

      <Sec title="The decomposition">
        <p>
          Assume <M t="y = f(x) + \varepsilon" /> with <M t="\E[\varepsilon] = 0" />, <M t="\Var(\varepsilon) = \sigma^2" />, and the test noise
          independent of the training data. Then the expected squared error of a new prediction at <M t="x" /> splits into three parts:
        </p>
        <MB t="\E\big[(y - \hat f(x))^2\big] = \underbrace{\big(f(x) - \E[\hat f(x)]\big)^2}_{\cbias{\Bias^2}} + \underbrace{\Var\big(\hat f(x)\big)}_{\cvar{\text{variance}}} + \underbrace{\Var(\varepsilon)}_{\cnoise{\text{irreducible error}}}." />
        <Steps
          intro={<p>Derive it rather than memorise it. Write <M t="a = \E_D[\hat f_D(x)]" /> for the average prediction.</p>}
          steps={[
            {
              title: 'Add and subtract the average prediction',
              body: <MB t="y - \hat f_D = \underbrace{(f - a)}_{\text{fixed}} + \underbrace{(a - \hat f_D)}_{\text{mean } 0 \text{ over } D} + \underbrace{\varepsilon}_{\text{mean } 0}." />,
            },
            {
              title: 'Square and take expectations',
              body: <MB t="\E[(y - \hat f_D)^2] = (f-a)^2 + \E[(a - \hat f_D)^2] + \E[\varepsilon^2] + 2\,\text{(cross terms)}." />,
            },
            {
              title: 'The cross terms vanish',
              body: (
                <>
                  <MB t="\begin{aligned} 2(f-a)\,\E[a - \hat f_D] &= 0, \\ 2(f-a)\,\E[\varepsilon] &= 0, \\ 2\,\E[(a - \hat f_D)\varepsilon] &= 2\,\E[a - \hat f_D]\,\E[\varepsilon] = 0. \end{aligned}" />
                  <p>The last uses independence between the test noise and the training set.</p>
                </>
              ),
            },
            {
              title: 'Read off the three terms',
              body: <MB t="\E[(y - \hat f_D(x))^2] = \Bias(x)^2 + \Var_D(\hat f_D(x)) + \sigma^2." />,
            },
          ]}
        />
        <ul>
          <li>
            <strong>Irreducible error</strong> <M t="\sigma^2" /> is the inherent noise in the system: unknown factors or chance. No model can remove it.
          </li>
          <li>
            <strong>Reducible error</strong> — bias² plus variance — can and should be reduced by adjusting the model.
          </li>
        </ul>
        <Callout kind="note">
          If you measure error against the noiseless target <M t="f(x)" /> instead of a new noisy <M t="y" />, the <M t="\sigma^2" /> term disappears:{' '}
          <M t="\E[(\hat f - f)^2] = \Bias^2 + \Var" />. That two-term version is the MSE of an <em>estimator</em>.
        </Callout>
      </Sec>

      <Sec title="Make it concrete">
        <p>
          Suppose <M t="f(x) = 10" /> and noise variance is 1. Procedure A’s predictions across training sets are 8, 10, 12 with equal probability:
          average 10, so bias 0; variance <M t="(4 + 0 + 4)/3 = 8/3" />; expected error <M t="0 + 8/3 + 1 = 11/3 \approx 3.67" />. Procedure B always
          predicts 9: bias −1, variance 0, expected error <M t="1 + 0 + 1 = 2" />.
        </p>
        <p>
          <strong>The biased procedure wins.</strong> When comparing unbiased estimators we prefer the one with minimum variance, but in
          general we compare estimators with some bias and some variance, and a little bias can buy a lot less variance. That is exactly what
          regularisation does.
        </p>
      </Sec>

      <Sec title="Watch the tradeoff happen">
        <Lab
          title="Bias and variance by simulation"
          purpose="Truth: sin(2πx) plus Gaussian noise with σ = 0.4. Every training set uses the same 10 equally spaced inputs with freshly drawn noise. Add training sets and vary the degree; the decomposition at x₀ is estimated from the fits you have drawn, and the bottom chart is computed exactly."
        >
          <BiasVarianceLab />
        </Lab>
        <TryThis
          items={[
            'Degree 0 or 1: the fits barely move between training sets (low variance), but their average misses the sine wave (high bias).',
            'Degree 9: ten coefficients for ten points, so every fit passes through its own noisy data. The average fit is close to the truth (low bias), but individual fits swing wildly, especially near the edges (high variance).',
            'Add more training sets at a fixed degree. The estimates of bias² and variance stabilise — they are properties of the procedure, not of one fit.',
            'In the bottom chart, find the degree that minimises expected test error. Bias falls and variance rises with degree; their sum is U-shaped, sitting on the noise floor.',
            'Move x₀ to the edges at high degree: variance is largest where data are sparse and the polynomial is least constrained.',
          ]}
        />
      </Sec>

      <Sec title="Finding the balance in practice">
        <Table
          head={['To increase flexibility (↓ bias, ↑ variance)', 'To decrease flexibility (↑ bias, ↓ variance)']}
          rows={[
            ['higher polynomial degree / more features', 'lower degree / fewer features'],
            ['smaller ridge or LASSO λ', 'larger λ'],
            ['smaller k in k-NN', 'larger k'],
          ]}
        />
        <p>
          These are tendencies, not guaranteed monotone laws for every dataset. And since <M t="f" /> is unknown, there is no formula that tells you the
          balance point. Instead, estimate total error on <strong>unseen validation data</strong> and adjust the model’s complexity until it is minimised
          — precisely the protocol of lesson 11.
        </p>
        <Callout kind="intuition">
          A common diagnostic: high training <em>and</em> validation error → likely high bias (underfit; add flexibility). Low training error but much
          higher validation error → likely high variance (overfit; regularise, simplify, or get more data). More data reduces variance; it does not fix
          bias from a too-simple model.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l13.q1"
          q={<p>At a fixed input, procedure A predicts 4 or 8 with equal probability; B always predicts 5. The truth is 6 and noise variance is 2. Which has lower expected squared prediction error?</p>}
          options={[
            { text: 'A, because it is unbiased.', why: 'A: bias 0, variance 4, total 0 + 4 + 2 = 6.' },
            { text: 'B, despite being biased.', correct: true, why: 'B: bias −1, variance 0, total 1 + 0 + 2 = 3 < 6. Unbiasedness alone is not enough.' },
            { text: 'They are equal.', why: 'Compute each: 6 vs 3.' },
          ]}
        />
        <Quiz
          id="l13.q2"
          q={<p>A model’s average prediction over all <em>inputs</em> equals the average target. Does it have zero bias in the bias–variance sense?</p>}
          options={[
            { text: 'Yes.', why: 'Bias is defined at a fixed input, averaging over training sets. Positive and negative errors at different x can cancel in an input-average.' },
            { text: 'Not necessarily.', correct: true, why: 'A flat line at ȳ fitted to a sine wave has this property and is heavily biased at most x.' },
          ]}
        />
        <Quiz
          id="l13.q3"
          q={<p>Collecting much more training data (same model) mainly reduces…</p>}
          options={[
            { text: 'bias', why: 'A too-simple model stays too simple however much data you give it.' },
            { text: 'variance', correct: true, why: 'With more data each fit depends less on the particular sample.' },
            { text: 'irreducible error', why: 'σ² is a property of the data-generating process; no model or dataset size removes it.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Imagine retraining on many datasets. Bias is how far the average prediction is from the truth; variance is how much predictions scatter between
        datasets. Expected squared error = bias² + variance + irreducible noise. Flexibility trades bias for variance, so the best model is the one with
        the smallest <em>sum</em>, found in practice with validation data — not the one that fits the training data best.
      </Callout>

      <Checklist id="biasvar" items={CHECKS.biasvar} />
    </>
  );
}
