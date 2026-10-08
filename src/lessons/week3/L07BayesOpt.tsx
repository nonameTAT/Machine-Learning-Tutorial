import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { BayesOptLab } from '../../interactives/week3/BayesOptLab';
import { CHECKS3 } from './checks';

export default function L07BayesOpt() {
  return (
    <>
      <Sec title="The most probable model is not the question we care about">
        <p>
          A hypothesis can be a collection of predictions, or a function mapping inputs to predictions. So far we sought <M t="h_{\text{MAP}}" />.
          But given a new instance <M t="x" />, what we really want is its most probable <em>classification</em> — and <M t="h_{\text{MAP}}(x)" /> is not
          necessarily that, especially when several hypotheses support the same class.
        </p>
        <Table
          head={['hypothesis', <M t="P(h \mid D)" />, 'prediction at x']}
          rows={[
            [<M t="h_1" />, '0.4', '+'],
            [<M t="h_2" />, '0.3', '−'],
            [<M t="h_3" />, '0.3', '−'],
          ]}
        />
        <p>
          The MAP hypothesis <M t="h_1" /> predicts +. But the posterior weight supporting − is <M t="0.3 + 0.3 = 0.6" />. The most probable
          class is −.
        </p>
      </Sec>

      <Sec title="The Bayes optimal classifier">
        <p>Instead of selecting one hypothesis, average over all of them, weighted by their posteriors:</p>
        <MB t="P(v_j \mid D) = \sum_{h_i \in H} P(v_j \mid h_i)\,P(h_i \mid D), \qquad \hat v = \argmax_{v_j \in V}\sum_{h_i\in H} P(v_j \mid h_i)\,P(h_i \mid D)." />
        <Steps
          intro={<p>Apply it to the example. Each deterministic hypothesis gives probability 1 to its own prediction.</p>}
          steps={[
            {
              title: 'Write each hypothesis’s vote',
              body: <MB t="P(+ \mid h_1) = 1,\; P(- \mid h_1) = 0; \qquad P(+ \mid h_{2,3}) = 0,\; P(- \mid h_{2,3}) = 1." />,
            },
            {
              title: 'Weight by the posterior and add',
              body: <MB t="\sum_i P(+ \mid h_i)P(h_i \mid D) = 0.4, \qquad \sum_i P(- \mid h_i)P(h_i \mid D) = 0.3 + 0.3 = 0.6." />,
            },
            { title: 'Choose the largest', body: <p>The Bayes optimal classification is −, although the single most probable hypothesis says +.</p> },
          ]}
        />
        <p>
          It is a <em>weighted</em> average, not an unweighted majority vote; for probabilistic hypotheses use their actual class probabilities{' '}
          <M t="P(v \mid x, h)" />.
        </p>
        <Callout kind="theorem" title="Why “optimal”">
          Under zero-one loss, predicting <M t="y" /> is wrong with probability <M t="1 - P(y \mid x, D)" />, so choosing the largest posterior predictive
          probability minimises the error. No other method using the same hypothesis space and the same prior knowledge does better <em>on average</em>.
          Optimality is relative to that hypothesis space, prior and probability model — not a promise of perfect real-world labels.
        </Callout>
        <p>
          Why do we need anything else? The Bayes rule depends on unknown quantities — the true posteriors — which must be approximated from
          data; and summing over every hypothesis can be very expensive.
        </p>
      </Sec>

      <Sec title="The Gibbs classifier: sample instead of averaging">
        <p>Gibbs algorithm:</p>
        <ol>
          <li>Choose one hypothesis at random, according to <M t="P(h \mid D)" />.</li>
          <li>Use it to classify the new instance.</li>
        </ol>
        <p>
          In the example, Gibbs predicts + with probability 0.4 and − with probability 0.6 — it does not always pick the heavier side. Surprisingly, if target
          concepts are drawn at random from <M t="H" /> according to the prior, then
        </p>
        <MB t="\E[\text{error}_{\text{Gibbs}}] \le 2\,\E[\text{error}_{\text{Bayes optimal}}]." />
        <p className="small muted">
          This is a bound on expected error under that assumption, not a guarantee for every dataset or prediction. Gibbs avoids evaluating every hypothesis,
          though sampling from the posterior can itself be hard.
        </p>
        <Lab title="One model, all models, or a random model?" purpose="Bar widths are posterior weights; colours are each hypothesis’s prediction at x. Compare MAP, Bayes optimal and Gibbs.">
          <BayesOptLab />
        </Lab>
        <TryThis
          items={[
            'Default: MAP says +, Bayes optimal says −. Press “Gibbs × 1,000”: roughly 40% of draws predict +.',
            'Flip h₃ to +. Now all three methods agree on +.',
            'Set weights (0.42, 0.33, 0.25): the conditional errors are 0.58 for always +, 0.42 for always − (Bayes), and 2 × 0.42 × 0.58 ≈ 0.487 for Gibbs — between them, and within the factor-2 bound.',
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l7.q1"
          q={<p>Posteriors (0.5, 0.25, 0.25) with predictions (−, +, +). What do MAP-model prediction and Bayes optimal prediction give?</p>}
          options={[
            { text: 'MAP: −; Bayes optimal: tie between + and −', correct: true, why: 'The + total is 0.25 + 0.25 = 0.5, equal to −. A tie rule is needed.' },
            { text: 'MAP: −; Bayes optimal: +', why: 'The totals are equal (0.5 each), so + does not win outright.' },
            { text: 'Both +', why: 'The single most probable hypothesis predicts −.' },
          ]}
        />
        <Quiz
          id="w3.l7.q2"
          q={<p>What single operation makes Bayes optimal prediction differ from using h_MAP?</p>}
          options={[
            { text: 'It sums over hypotheses (weighted by P(h | D)) before choosing a class.', correct: true, why: 'MAP chooses one h first; Bayes optimal marginalises h out.' },
            { text: 'It uses a different prior.', why: 'Both use the same posterior over hypotheses.' },
            { text: 'It takes an unweighted majority vote of the hypotheses.', why: 'The vote is weighted by posterior probability.' },
          ]}
        />
        <Quiz
          id="w3.l7.q3"
          q={<p>The predictive distribution at x is P(+) = 0.7. What is the Gibbs classifier’s expected conditional error at x?</p>}
          options={[
            { text: '0.3', why: 'That is the Bayes optimal error.' },
            { text: '0.42', correct: true, why: 'It predicts + w.p. 0.7 (wrong w.p. 0.3) and − w.p. 0.3 (wrong w.p. 0.7): 0.21 + 0.21.' },
            { text: '0.6', why: 'Double the Bayes error is the bound, not the value.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        The most probable hypothesis need not make the most probable prediction. The Bayes optimal classifier predicts{' '}
        <M t="\argmax_v\sum_h P(v \mid h)P(h \mid D)" />, which minimises expected error for the given hypothesis space and prior. Gibbs samples one
        hypothesis from the posterior: cheaper, with expected error at most twice the Bayes optimal under the stated assumptions.
      </Callout>

      <Checklist id="w3-bayesopt" items={CHECKS3['w3-bayesopt']} />
    </>
  );
}
