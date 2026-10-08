import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../components/ui';
import { CorrelationLab, EstimatorLab } from '../interactives/StatsLab';

export default function L03Stats() {
  return (
    <>
      <Sec title="Why statistics shows up in machine learning">
        <p>
          A training set is a <em>sample</em>. What we care about is how the model behaves on the whole <em>population</em> of inputs it will meet.
          Every claim about a fitted model — that a coefficient is meaningful, that test error predicts future error — is a claim from sample to
          population. This lesson gives the vocabulary for those claims and for the summaries (covariance, correlation) that the least-squares formulas
          are built from.
        </p>
        <Table
          head={['', 'Probability', 'Statistics']}
          rows={[
            ['Direction', 'population → samples', 'samples → population'],
            ['Typical question', '“If the coin is fair, how likely are 8 heads in 10?”', '“Having seen 8 heads in 10, is the coin fair?”'],
            ['Kind of reasoning', 'deductive — sound given the model', 'inductive — conclusions can be wrong'],
          ]}
        />
      </Sec>

      <Sec title="Sampling: when can a sample speak for the population?">
        <p>
          You do not need to sip a cup of tea several times to decide that it is too hot: a homogeneous population needs few observations.
          Irregular populations need either a full census or a sample that <em>closely resembles</em> the population. What we want from a sampling
          method:
        </p>
        <ul>
          <li>no systematic bias — or none we cannot account for;</li>
          <li>the chance of an unrepresentative sample can be calculated (so we can refuse to conclude when it is high);</li>
          <li>that chance shrinks as the sample grows.</li>
        </ul>
        <Callout kind="warning" title="More data does not cure bias">
          Larger samples reduce <em>random</em> sampling variation. They do nothing for a <em>systematic</em> flaw. A million house sales from only the
          most expensive suburbs is still a poor basis for predicting prices across the city — the estimate just becomes very precisely wrong.
        </Callout>
      </Sec>

      <Sec title="Estimators and what “unbiased” means">
        <p>
          A <strong>population parameter</strong> (say the mean <M t="\mu" />) is a fixed but unknown number. An <strong>estimator</strong> is a rule
          applied to random data, such as <M t="\bar x = \tfrac1N\sum_i x_i" />. Because the sample is random, the estimate is random: draw another
          sample and you get another value.
        </p>
        <Callout kind="definition" title="Unbiased estimator">
          <M t="\hat\theta" /> is unbiased for <M t="\theta" /> if <M t="\E[\hat\theta] = \theta" />: averaged over all the samples you could have drawn,
          it is exactly right. It says nothing about whether <em>your particular</em> estimate is close.
        </Callout>
        <p>The standard estimators, with their bias status made precise:</p>
        <Table
          head={['Estimator', 'Formula', 'Bias']}
          rows={[
            ['Sample mean', <M t="\bar x = \tfrac{1}{N}\sum_{i=1}^N x_i" />, 'unbiased for μ'],
            ['Sample variance', <M t="s^2 = \tfrac{1}{N-1}\sum_i (x_i - \bar x)^2" />, 'unbiased for σ² (i.i.d., finite variance)'],
            ['Sample std. deviation', <M t="s = \sqrt{s^2}" />, 'biased (usually low) — even though s² is unbiased'],
            ['Sample median', 'middle ordered value', 'robust to outliers; unbiased for symmetric populations, generally biased otherwise'],
            ['Sample range', <M t="\max_i x_i - \min_i x_i" />, 'biased low: a sample rarely contains the population’s extremes'],
          ]}
        />
        <Lab
          title="Estimator bias by simulation"
          purpose="Draw many samples of size N, apply each estimator, and average the results. Unbiasedness is a property of that long-run average."
        >
          <EstimatorLab />
        </Lab>
        <TryThis
          items={[
            <>
              With N = 2 and the uniform population, add 2000 samples. Compare the two variance estimators: the <M t="1/N" /> version should settle near{' '}
              <M t="(N-1)/N = 0.5" /> of the truth.
            </>,
            <>Increase N to 30. Does the 1/N bias shrink? Does the range get closer to 10?</>,
            <>Switch to the skewed population. The median is now biased for the population median, while the mean is still unbiased.</>,
            <>Look at s: unbiased s² does not give unbiased s, because the square root is concave (Jensen’s inequality).</>,
          ]}
        />
        <p>
          <strong>Why divide by N − 1?</strong> The deviations are measured from <M t="\bar x" />, which is computed from the same data and is
          therefore closer to the data than the true <M t="\mu" /> is. Dividing by N would systematically under-estimate the spread. The derivation is
          short:
        </p>
        <Steps
          steps={[
            {
              title: 'Split each deviation through the true mean',
              body: (
                <MB t="\sum_i (x_i - \bar x)^2 = \sum_i (x_i - \mu)^2 - N(\bar x - \mu)^2" />
              ),
            },
            {
              title: 'Take expectations of each piece',
              body: (
                <>
                  <MB t="\E\Big[\sum_i (x_i-\mu)^2\Big] = N\sigma^2, \qquad \E\big[(\bar x - \mu)^2\big] = \Var(\bar x) = \frac{\sigma^2}{N}." />
                  <p>The second uses independence: the variance of an average of N i.i.d. variables is σ²/N.</p>
                </>
              ),
            },
            {
              title: 'Combine',
              body: (
                <>
                  <MB t="\E\Big[\sum_i (x_i - \bar x)^2\Big] = N\sigma^2 - \sigma^2 = (N-1)\sigma^2 \;\Rightarrow\; \E[s^2] = \sigma^2." />
                  <p>One “degree of freedom” is used up by estimating the mean.</p>
                </>
              ),
            },
          ]}
        />
      </Sec>

      <Sec title="Covariance: do the deviations move together?">
        <p>
          Covariance asks a simple question of each pair: are <M t="x_i" /> and <M t="y_i" /> on the <em>same side</em> of their means? Same side
          gives a positive product <M t="(x_i - \bar x)(y_i - \bar y)" />, opposite sides a negative one. Averaging the products:
        </p>
        <MB t="\Cov(x,y) = \frac{\sum_i (x_i-\bar x)(y_i - \bar y)}{N-1} = \frac{\big(\sum_i x_i y_i\big) - N\bar x\bar y}{N-1}." />
        <p>
          Its units are (units of x)·(units of y), so its size depends on measurement scale: switching from metres to centimetres multiplies it by 100.
          Correlation removes that scale.
        </p>
        <Callout kind="definition" title="Pearson correlation">
          <MB t="r = \frac{\Cov(x,y)}{\sqrt{\Var(x)\,\Var(y)}} = \frac{\Cov(x,y)}{s_x s_y}, \qquad -1 \le r \le 1," />
          defined when both standard deviations are positive. r near +1: high x with high y, low scatter; near 0: no <em>linear</em> association; near
          −1: strong inverse linear association.
        </Callout>
        <p>
          You will meet this ratio again: the least-squares slope is <M t="\hat\theta_1 = \Cov(x,y)/\Var(x) = r\,s_y/s_x" /> (lesson 4). Same
          ingredients, different normalisation — slope carries units, r does not.
        </p>
      </Sec>

      <Sec title="What correlation does and does not say">
        <Lab title="Correlation explorer" purpose="Generate datasets and watch how r, covariance and slope respond. Each mode targets one classic caution about correlation.">
          <CorrelationLab />
        </Lab>
        <ul>
          <li>
            <strong>It only measures linear association.</strong> Take <M t="x = (-1, 0, 1)" /> and <M t="y = x^2 = (1, 0, 1)" />. Then{' '}
            <M t="\bar x = 0" />, and <M t="\sum_i x_i (y_i - \bar y) = (-1)(1/3) + 0 + (1)(1/3) = 0" />, so <M t="r = 0" /> despite a perfect
            relationship.
          </li>
          <li>
            <strong>It does not model the relationship.</strong> Given r and a new x you cannot compute y: you also need the means and standard
            deviations (that is exactly what the regression line adds).
          </li>
          <li>
            <strong>Same correlation, different relationships</strong> (Anscombe’s quartet) — and <strong>same relationship, different correlation</strong>{' '}
            (add more noise around the same line and r drops). So don’t compare datasets by their correlations.
          </li>
          <li>
            <strong>It is not causation</strong>, in either direction.
          </li>
        </ul>
        <Callout kind="warning">
          “r = 0, so x is useless for predicting y” is false. The curve mode shows a near-perfect predictor with r ≈ 0. A zero correlation rules out only a
          linear trend.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l3.q1"
          q={<p>An estimator is unbiased. Which conclusion is justified?</p>}
          options={[
            { text: 'Every estimate it produces equals the true parameter.', why: 'Unbiasedness is about the average over repeated samples, not any single estimate.' },
            { text: 'Its average over repeated samples equals the true parameter.', correct: true, why: 'That is the definition E[θ̂] = θ.' },
            { text: 'It has the smallest possible error.', why: 'An unbiased estimator can have large variance; a slightly biased one can have smaller total error (see lesson 13).' },
          ]}
        />
        <Quiz
          id="l3.q2"
          q={<p>Every value of y is doubled. What happens to Cov(x, y), r, and the least-squares slope?</p>}
          options={[
            { text: 'All three double.', why: 'r is scale-free, so it cannot double.' },
            { text: 'Cov and slope double; r is unchanged.', correct: true, why: 'Cov(x, 2y) = 2Cov(x, y), slope = Cov/Var(x) doubles, while r divides by s_y which also doubles.' },
            { text: 'Nothing changes.', why: 'Covariance and slope carry the units of y.' },
          ]}
        />
        <Quiz
          id="l3.q3"
          q={<p>Why does the sample range tend to underestimate the population range?</p>}
          options={[
            { text: 'Because it divides by N − 1.', why: 'The range involves no division at all.' },
            { text: 'Because the sample’s max and min can never be beyond the population’s, and usually fall short of them.', correct: true, why: 'max − min of a sample is always ≤ the population range, so its expectation is below it unless the extremes are certain to be sampled.' },
            { text: 'It doesn’t; the range is unbiased.', why: 'Try the simulation with the uniform population: the average sample range is below 10.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A sample is evidence about a population, and estimators are random. “Unbiased” means right on average across samples. Covariance measures
        whether deviations move together (in units); correlation rescales it to [−1, 1] and only detects <em>linear</em> association. Neither models the
        relationship, and neither establishes causation.
      </Callout>

      <Checklist id="stats" items={CHECKS.stats} />
    </>
  );
}
