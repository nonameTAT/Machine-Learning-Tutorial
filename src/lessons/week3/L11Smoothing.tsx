import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, TryThis } from '../../components/ui';
import { PlayTennisLab } from '../../interactives/week3/PlayTennisLab';
import { AlphaLab, UnderflowLab } from '../../interactives/week3/SmoothingLab';
import { CHECKS3 } from './checks';

export default function L11Smoothing() {
  return (
    <>
      <Sec title="“Not observed” does not mean “impossible”">
        <p>
          No “no” day in the training data was overcast. The raw estimate <M t="\hat P(\text{overcast} \mid \text{no}) = 0/5" /> therefore makes the entire
          “no” score zero for any overcast day, whatever the other features say:
        </p>
        <MB t="\hat P(x_i \mid v_j) = 0 \;\Longrightarrow\; \hat P(v_j)\prod_i \hat P(x_i \mid v_j) = 0." />
        <p>
          With 5 “no” examples, never seeing overcast is weak evidence that it cannot happen. This is the <strong>zero-frequency problem</strong>.
        </p>
      </Sec>

      <Sec title="Pseudo-counts: Laplace and add-α smoothing">
        <p>
          Add a pseudo-count to <em>every possible value</em> (a version of the Laplace estimator). For a categorical feature with{' '}
          <M t="K_j" /> possible values:
        </p>
        <MB t="\hat P(X_j = v \mid c) = \frac{N_{j,v,c} + \alpha}{N_c + \alpha K_j}, \qquad \alpha > 0." />
        <p>
          Laplace smoothing is <M t="\alpha = 1" />; a different constant may sometimes be more appropriate. The denominator grows by{' '}
          <M t="\alpha K_j" /> because each of the <M t="K_j" /> values received <M t="\alpha" /> extra counts — so the probabilities still sum to 1.
        </p>
        <Callout kind="example" title="The “no” outlook table">
          Counts (sunny, overcast, rainy) = (3, 0, 2) and <M t="K = 3" />:
          <MB t="P(\text{sunny} \mid \text{no}) = \tfrac{4}{8}, \quad P(\text{overcast} \mid \text{no}) = \tfrac18, \quad P(\text{rainy} \mid \text{no}) = \tfrac38." />
          Humidity has only two values, so its denominator is <M t="5 + 2 = 7" />, not 8. Use the feature’s set of <em>possible</em> values, not the values
          that happened to appear in this class.
        </Callout>
        <Lab title="Add-α on one table" purpose="Grey: raw frequencies. Orange: smoothed. Watch the zero disappear and the three bars keep summing to 1.">
          <AlphaLab />
        </Lab>
        <p>
          Text models smooth the same way: the Bernoulli model adds two pseudo-documents per class (one containing every word, one containing none), and the multinomial model adds one pseudo-count per vocabulary word. Lessons 14–15 use both.
        </p>
        <Callout kind="note" title="Smoothing changes the model">
          It stops unseen events from being treated as impossible; it does not repair dependent features. One zero rules out one class; prediction becomes
          undefined only when <em>every</em> class score is zero. If smoothing is specified, apply it consistently to the whole table.
        </Callout>
        <Lab title="PlayTennis with an overcast day" purpose="Unsmoothed, the “no” score is exactly 0. Switch on Laplace smoothing and compare.">
          <PlayTennisLab initialQuery={['overcast', 'cool', 'high', 'true']} />
        </Lab>
        <TryThis
          items={[
            'Unsmoothed: “no” is impossible, so P(yes | x) = 1 — an absurdly confident claim from 14 examples.',
            'With Laplace smoothing every denominator changes: 9 + K for “yes”, 5 + K for “no”, and the prior is left as counted. Is the decision still yes?',
          ]}
        />
      </Sec>

      <Sec title="Compute in log space">
        <p>
          With many features, the product of many small probabilities can <em>underflow</em> to 0 in floating point. Since log is strictly increasing, use
        </p>
        <MB t="\ell_c = \log\hat P(c) + \sum_{j=1}^d \log\hat P(x_j \mid c), \qquad \hat y = \argmax_c \ell_c." />
        <p>This is the same decision, not a different model. Logs do not solve zero counts: <M t="\log 0" /> is still minus infinity.</p>
        <Lab title="Underflow" purpose="The product of d equal probabilities in double precision, versus the sum of their logs.">
          <UnderflowLab />
        </Lab>
      </Sec>

      <Sec title="The whole algorithm">
        <p>
          <strong>Train:</strong> count the classes; fix each feature’s possible values; count values within each class; estimate priors and conditional
          tables; smooth if required.
        </p>
        <p>
          <strong>Predict:</strong> for each class start with its log prior; add the log probability of each observed feature value; pick the largest score.
          Normalise only if a probability is requested. With precomputed tables, one prediction costs <M t="O(Kd)" /> for <M t="K" /> classes and{' '}
          <M t="d" /> features.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l11.q1"
          q={<p>Why is (0 + 1)/(5 + 1) wrong for Laplace-smoothed P(overcast | no)?</p>}
          options={[
            { text: 'It adds a pseudo-count to one value only, so the three-value table no longer sums to 1.', correct: true, why: 'Each of the K = 3 values gets one pseudo-count: denominator 5 + 3.' },
            { text: 'Laplace smoothing adds 0.5, not 1.', why: 'Laplace is α = 1; other α are possible but the denominator must still be N_c + αK.' },
          ]}
        />
        <Quiz
          id="w3.l11.q2"
          q={<p>A feature has 4 possible values; class c has 10 examples, 3 of them with value v. What is the Laplace estimate of P(v | c)?</p>}
          options={[
            { text: '4/14', correct: true, why: '(3 + 1)/(10 + 4).' },
            { text: '4/11', why: 'The denominator adds K = 4, not 1.' },
            { text: '3/10', why: 'That is the unsmoothed estimate.' },
          ]}
        />
        <Quiz
          id="w3.l11.q3"
          q={<p>Does working with log probabilities fix the zero-frequency problem?</p>}
          options={[
            { text: 'Yes — logs make every factor finite.', why: 'log 0 = −∞: an impossible event stays impossible.' },
            { text: 'No — it fixes underflow; zeros still need smoothing.', correct: true, why: 'Two different problems, two different fixes.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A zero count makes a whole class score zero. Add-α smoothing <M t="(N_{j,v,c} + \alpha)/(N_c + \alpha K_j)" /> gives every possible value a
        pseudo-count and keeps the table normalised. Sum log probabilities to avoid underflow — same decision, but logs do not remove zeros.
      </Callout>

      <Checklist id="w3-smoothing" items={CHECKS3['w3-smoothing']} />
    </>
  );
}
