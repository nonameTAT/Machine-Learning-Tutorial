import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { PlayTennisLab } from '../../interactives/week3/PlayTennisLab';
import { CHECKS3 } from './checks';

export default function L10PlayTennis() {
  return (
    <>
      <Sec title="Strategy: count within a class, then score the whole instance">
        <p>
          The PlayTennis data has 14 days described by outlook, temperature, humidity and wind, labelled “play” = yes (9 days) or no (5 days).
          Training Naive Bayes means building, for each class, a count table of every attribute value:
        </p>
        <Table
          head={['feature', 'value', 'yes (of 9)', 'no (of 5)']}
          rows={[
            ['outlook', 'sunny / overcast / rainy', '2 / 4 / 3', '3 / 0 / 2'],
            ['temperature', 'hot / mild / cool', '2 / 4 / 3', '2 / 2 / 1'],
            ['humidity', 'high / normal', '3 / 6', '4 / 1'],
            ['windy', 'false / true', '6 / 3', '2 / 3'],
          ]}
        />
        <p>
          Each feature’s counts sum to the size of its class. Conditioning restricts the denominator: <M t="\hat P(\text{sunny} \mid \text{yes}) = 2/9" />, not{' '}
          <M t="2/14" />.
        </p>
      </Sec>

      <Sec title="Classify a new day">
        <p>
          Query <M t="x = \langle\text{sunny}, \text{cool}, \text{high}, \text{wind} = \text{true}\rangle" />, unsmoothed estimates:
        </p>
        <Steps
          steps={[
            {
              title: 'Score “yes”: prior × one factor per feature',
              body: <MB t="s_{\text{yes}} = \frac{9}{14}\times\frac29\times\frac39\times\frac39\times\frac39 = \frac{1}{189} \approx 0.005291." />,
            },
            {
              title: 'Score “no”',
              body: <MB t="s_{\text{no}} = \frac{5}{14}\times\frac35\times\frac15\times\frac45\times\frac35 = \frac{18}{875} \approx 0.020571." />,
            },
            {
              title: 'Decide',
              body: <p>The larger score wins: predict <strong>no</strong>. The scores include the priors; they are not just the likelihoods.</p>,
            },
            {
              title: 'Normalise if a probability is requested',
              body: <MB t="\hat P(\text{yes} \mid x) = \frac{s_{\text{yes}}}{s_{\text{yes}} + s_{\text{no}}} = \frac{125}{611} \approx 0.2046, \qquad \hat P(\text{no} \mid x) = \frac{486}{611} \approx 0.7954." />,
            },
          ]}
        />
        <Callout kind="warning" title="Watch the denominators">
          A common slip is to write <M t="4/9" /> and <M t="3/9" /> in the “no” product. The count table requires <M t="4/5" /> (high humidity) and{' '}
          <M t="3/5" /> (windy) — every “no” denominator is 5, because there are 5 “no” days. Rounded, the posteriors are 0.205 and 0.795.
        </Callout>
        <Callout kind="note" title="Verify before moving on">
          <ul>
            <li>The class priors sum to 1; within a class and feature, the value probabilities sum to 1.</li>
            <li>Exactly one factor from each feature appears in each score.</li>
            <li>Every “no” conditional has denominator 5; every “yes” conditional has denominator 9.</li>
            <li>The normalised posteriors sum to 1 and are ordered like the scores.</li>
          </ul>
        </Callout>
        <Lab title="Naive Bayes on PlayTennis" purpose="Choose any day. The training table highlights the matching cells; the right-hand table shows each factor as a count; the scores use exact fractions.">
          <PlayTennisLab />
        </Lab>
        <TryThis
          items={[
            'Reproduce the worked example: (sunny, cool, high, windy = true) gives 1/189 and 18/875.',
            'Change to (overcast, …). The “no” score collapses to exactly 0 because no “no” day was overcast — then turn on Laplace smoothing (lesson 11).',
            'Find a day the model calls “yes” with high confidence. Which single feature value contributes the most?',
            'Set wind to “?” — the factor is omitted (lesson 16 explains why that is correct for Naive Bayes).',
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l10.q1"
          q={<p>What is the unsmoothed estimate of P(temperature = mild | no)?</p>}
          options={[
            { text: '2/5', correct: true, why: 'Two of the five “no” days are mild.' },
            { text: '2/14', why: 'The denominator must be the number of “no” days, not all days.' },
            { text: '6/14', why: 'That is P(mild) over both classes.' },
          ]}
        />
        <Quiz
          id="w3.l10.q2"
          q={<p>For the query (overcast, hot, normal, windy = false), what is the unsmoothed score for “no”, and why?</p>}
          options={[
            { text: '0, because P(overcast | no) = 0/5', correct: true, why: 'One zero factor makes the whole product zero.' },
            { text: 'A small positive number', why: 'Without smoothing, the overcast factor is exactly 0.' },
            { text: 'Undefined', why: 'It is defined (0); only the posterior would be undefined if all class scores were 0.' },
          ]}
        />
        <Quiz
          id="w3.l10.q3"
          q={<p>s_yes = 1/189 and s_no = 18/875. Are these the posterior probabilities?</p>}
          options={[
            { text: 'Yes', why: 'They do not sum to 1.' },
            { text: 'No — they are unnormalised scores (joint probabilities under the model); divide by their sum.', correct: true, why: 'Posterior yes = (1/189)/(1/189 + 18/875) = 125/611.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Naive Bayes trains by counting each feature value within each class and predicts by multiplying the prior with one conditional per feature:{' '}
        <M t="s_c = \hat P(c)\prod_j \hat P(x_j \mid c)" />. Use within-class denominators, compare scores for the decision, and normalise only when a
        probability is asked for.
      </Callout>

      <Checklist id="w3-playtennis" items={CHECKS3['w3-playtennis']} />
    </>
  );
}
