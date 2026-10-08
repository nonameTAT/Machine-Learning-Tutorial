import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { ConvexityLab, LossCurveLab } from '../../interactives/week2/LossLab';
import { CHECKS2 } from './checks';

export default function L04LogLoss() {
  return (
    <>
      <Sec title="Which coefficients? Ask which make the labels most probable">
        <p>
          Lesson 3 gave a model with unknown coefficients β. To fit it we need an objective. Week 1 found one with <strong>maximum likelihood</strong>:
          tell a story of how the data arise, then choose the parameters under which the observed data are most probable. With Gaussian noise that
          story produced squared error. Here the response is a single yes/no outcome, so the natural story is a biased coin whose probability of heads
          depends on the input.
        </p>
        <p>
          Write <M t="p_j = h_\beta(\bx_j) = \sigma(\bxt_j\T\beta)" />. The probability the model assigns to the label actually observed can be written in
          one line:
        </p>
        <MB t="P(Y_j = y_j \mid \bx_j; \beta) = p_j^{\,y_j}(1 - p_j)^{1 - y_j}." />
        <p>
          Check both cases: if <M t="y_j = 1" /> the second factor is <M t="(1-p_j)^0 = 1" />, leaving <M t="p_j" />; if <M t="y_j = 0" /> the first factor
          is 1, leaving <M t="1 - p_j" />. The exponents act as a switch that picks the probability of the true label. This is a <strong>Bernoulli</strong>{' '}
          model whose parameter depends on the input.
        </p>
      </Sec>

      <Sec title="From the likelihood to the loss">
        <Steps
          intro={<p>Assume the observations are independent given their inputs. Predict each line before revealing it.</p>}
          steps={[
            {
              title: 'Independence: the likelihood is a product',
              body: <MB t="\Lik(\beta) = \prod_{j=1}^m P(Y_j = y_j \mid \bx_j; \beta) = \prod_{j=1}^m p_j^{\,y_j}(1 - p_j)^{1 - y_j}." />,
            },
            {
              title: 'Take logs: products become sums',
              body: (
                <>
                  <MB t="\ell(\beta) = \log\Lik(\beta) = \sum_{j=1}^m \big[y_j\log p_j + (1 - y_j)\log(1 - p_j)\big]." />
                  <p>Log is strictly increasing, so it does not move the maximiser. It also avoids multiplying hundreds of numbers below 1.</p>
                </>
              ),
            },
            {
              title: 'Negate and average: a loss to minimise',
              body: (
                <>
                  <MB t="\boxed{\;J(\beta) = -\frac1m\sum_{j=1}^m \big[y_j\log p_j + (1 - y_j)\log(1 - p_j)\big]\;}" />
                  <p>
                    This is the cost function, usually called <strong>binary cross-entropy</strong> or <strong>log loss</strong> — two
                    names for the same formula. Maximising ℓ and minimising <M t="J" /> give the same β; the <M t="1/m" /> only rescales. Logs are natural
                    logs.
                  </p>
                </>
              ),
            },
          ]}
        />
        <Callout kind="note" title="Where each assumption is used">
          <strong>Independence</strong> is used once: to write the joint probability as a product. The <strong>binary labels</strong> are used to select
          the right factor through the exponents <M t="y_j" /> and <M t="1 - y_j" />. The sigmoid form of <M t="p_j" /> has not been used yet — it enters
          when we differentiate (lesson 5).
        </Callout>
      </Sec>

      <Sec title="Read the loss one observation at a time">
        <p>
          For a positive observation the loss is <M t="-\log p" />; for a negative one it is <M t="-\log(1 - p)" />. Either way, the model pays{' '}
          <M t="-\log(\text{probability it gave to the true label})" />.
        </p>
        <Table
          head={['true y', 'predicted p', 'loss', 'interpretation']}
          rows={[
            ['1', '0.9', <M t="-\log 0.9 \approx 0.105" />, 'confident and correct'],
            ['1', '0.1', <M t="-\log 0.1 \approx 2.303" />, 'confident and wrong'],
            ['0', '0.1', <M t="-\log 0.9 \approx 0.105" />, 'high probability on class 0 — correct'],
            ['0', '0.9', <M t="-\log 0.1 \approx 2.303" />, 'low probability on the true class'],
          ]}
        />
        <p>
          Both <M t="p = 0.51" /> and <M t="p = 0.99" /> predict class 1 at threshold ½, but their losses for a positive are 0.673 and 0.010. Accuracy
          cannot tell them apart; likelihood-based training can. And as the probability of the true label tends to 0, its loss tends to infinity.
        </p>
        <Lab title="Loss of a single observation" purpose="Slide the predicted probability. The circle is the loss if the truth is positive, the square if it is negative.">
          <LossCurveLab />
        </Lab>
      </Sec>

      <Sec title="Why not reuse squared error?">
        <p>
          Plugging the sigmoid into the Week 1 squared loss gives a <strong>non-convex</strong> function of the coefficients, with flat regions
          where gradient methods make little progress. Log loss, by contrast, is convex (lesson 5).
        </p>
        <Lab
          title="Both losses as a function of one coefficient"
          purpose="Eight points, two of them on the ‘wrong’ side; score z = b·x. Move b and compare the shapes."
        >
          <ConvexityLab />
        </Lab>
        <TryThis
          items={[
            'Move b far to the left. Log loss keeps rising (it punishes the confident mistakes); squared error levels off at 0.75 — the gradient almost vanishes there.',
            'Compare the two minimisers. They need not coincide: the objectives are different, not two ways of writing the same one.',
            'Explain, without calculus, why a bounded function that is not constant cannot be convex on the whole real line.',
          ]}
        />
        <Callout kind="warning" title="Keep the claim precise">
          Squared error of a sigmoid can be minimised — it is not “impossible”. It just lacks the likelihood justification and the convexity that make log
          loss the natural choice. Conversely, binary labels do not make every least-squares calculation invalid; the model, objective and
          interpretation must simply match.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l4.q1"
          q={<p>For an observation with y = 0, which factor of p^y (1 − p)^(1−y) survives?</p>}
          options={[
            { text: 'p', why: 'p⁰ = 1; p is the probability of class 1.' },
            { text: '1 − p', correct: true, why: 'With y = 0, the exponent of (1 − p) is 1 and the exponent of p is 0.' },
            { text: 'p(1 − p)', why: 'That is the sigmoid’s derivative, not the Bernoulli probability.' },
          ]}
        />
        <Quiz
          id="w2.l4.q2"
          q={<p>Where does the independence assumption enter the derivation of log loss?</p>}
          options={[
            { text: 'In writing the joint likelihood as a product of per-observation probabilities.', correct: true, why: 'Exactly as in Week 1’s Gaussian derivation.' },
            { text: 'In taking the logarithm.', why: 'The log is valid for any positive likelihood.' },
            { text: 'In choosing the sigmoid.', why: 'The sigmoid is the model for pⱼ; independence concerns how observations combine.' },
          ]}
        />
        <Quiz
          id="w2.l4.q3"
          q={<p>Two models classify every training point correctly at threshold ½. Model A assigns probability 0.99 to each true label, model B 0.6. Which has lower log loss?</p>}
          options={[
            { text: 'Same — accuracy is equal.', why: 'Accuracy ignores how confident a correct prediction is; log loss does not.' },
            { text: 'A: about 0.010 per observation vs about 0.511 for B.', correct: true, why: '−log 0.99 ≈ 0.010 and −log 0.6 ≈ 0.511.' },
            { text: 'B, because it is less overconfident.', why: 'On these training labels, higher probability on the true label always lowers log loss.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A binary label given <M t="\bx" /> is Bernoulli with probability <M t="p = \sigma(\bxt\T\beta)" />, so <M t="P(y \mid \bx) = p^y(1 - p)^{1-y}" />.
        Independence makes the likelihood a product; its negative average log is the log loss{' '}
        <M t="J(\beta) = -\frac1m\sum_j[y_j\log p_j + (1 - y_j)\log(1 - p_j)]" />, which charges <M t="-\log" /> of the probability given to the true label.
      </Callout>

      <Checklist id="w2-logloss" items={CHECKS2['w2-logloss']} />
    </>
  );
}
