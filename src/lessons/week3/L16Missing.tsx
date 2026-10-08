import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { MissingLab } from '../../interactives/week3/MissingLab';
import { PlayTennisLab } from '../../interactives/week3/PlayTennisLab';
import { CHECKS3 } from './checks';

export default function L16Missing() {
  return (
    <>
      <Sec title="Missing is not the same as zero">
        <p>
          “The word does not occur” is a <em>known</em> Bernoulli value, 0 — it contributes an absence factor. “We have not checked whether it occurs” is
          missing information, which must account for both possibilities. Week 2’s warning applies here too: never quietly replace a missing value with 0.
        </p>
        <p>A very basic approach for Naive Bayes:</p>
        <ul>
          <li>
            <strong>Training:</strong> an instance with a missing value is not included in the frequency counts for that attribute’s value–class
            combinations. Its other attributes, and its class label for the prior, are still used.
          </li>
          <li>
            <strong>Classification:</strong> the attribute is omitted from the calculation.
          </li>
        </ul>
        <p>With <M t="N_{jc}^{\text{obs}}" /> observed values of feature <M t="j" /> in class <M t="c" />, smoothing becomes</p>
        <MB t="\hat P(X_j = v \mid c) = \frac{N_{j,v,c} + \alpha}{N_{jc}^{\text{obs}} + \alpha K_j}." />
        <p className="small muted">This assumes the observed cases are suitable for estimating that feature’s distribution (compare Week 2, lesson 10).</p>
      </Sec>

      <Sec title="Why omitting the factor is exactly right for Naive Bayes">
        <Steps
          intro={
            <p>
              Let <M t="o" /> be the observed features and <M t="m" /> one missing categorical feature. The right quantity is the probability of what we did
              observe.
            </p>
          }
          steps={[
            { title: 'Marginalise over the unknown value', body: <MB t="P(o \mid c) = \sum_{m} P(o, m \mid c)." /> },
            { title: 'Apply the Naive Bayes factorisation', body: <MB t="\sum_m P(o, m \mid c) = \sum_m P(o \mid c)\,P(m \mid c) = P(o \mid c)\sum_m P(m \mid c)." /> },
            {
              title: 'The missing feature’s probabilities sum to 1',
              body: (
                <p>
                  So <M t="P(o \mid c)" /> is just the product of the <em>observed</em> factors: multiply only those. (For a continuous missing feature, its
                  density integrates to 1.)
                </p>
              ),
            },
          ]}
        />
        <Lab title="PlayTennis with an unknown feature" purpose="Set any attribute to “?”: its factor is omitted for both classes, and the remaining factors decide.">
          <PlayTennisLab initialQuery={['rainy', 'hot', 'normal', '?']} />
        </Lab>
        <TryThis
          items={[
            'Compare the posterior with wind = false, wind = true and wind = ?. The “?” answer always lies between the two: it is their average, weighted by how likely each wind value is given the features you did observe.',
            'Set every attribute to “?”: only the priors remain, so the prediction is the majority class “yes”.',
          ]}
        />
      </Sec>

      <Sec title="Can we do better? A general posterior table">
        <p>
          Return to the full posterior table from lesson 1. We skimmed an email and saw “lottery”, but not whether it contains “Viagra”. Rows (0, 1)
          and (1, 1) disagree:
        </p>
        <Table
          head={['Viagra', 'lottery', 'P(spam | ·)', 'decision']}
          rows={[
            ['0', '1', '0.65', 'spam'],
            ['1', '1', '0.40', 'ham'],
          ]}
        />
        <p>By total probability, average the rows using the probability of Viagra <em>among emails with lottery = 1</em>:</p>
        <MB t="P(\text{spam} \mid L = 1) = \sum_{v\in\{0,1\}} P(\text{spam} \mid V = v, L = 1)\,P(V = v \mid L = 1)." />
        <p>
          Suppose one in ten emails contains Viagra: <M t="0.65 \times 0.90 + 0.40 \times 0.10 = 0.625" />, and{' '}
          <M t="P(\text{ham} \mid L = 1) = 0.375" />. Because Viagra is rare, the answer stays close to the (0, 1) row.
        </p>
        <Callout kind="warning" title="A qualification">
          That calculation weights by the <em>marginal</em> <M t="P(\text{Viagra} = 1) = 0.10" />. That is only valid if Viagra and lottery are marginally
          independent, or if the 0.10 is really <M t="P(\text{Viagra} = 1 \mid \text{lottery} = 1)" />. Naive Bayes’ conditional independence given the
          class does not imply marginal independence. Also, missing is different from an observed but previously unseen category — that is the smoothing
          problem.
        </Callout>
        <Lab title="Average the rows with the right weight" purpose="The posterior for an email with “lottery” and unknown “Viagra” is a weighted average of the two rows.">
          <MissingLab />
        </Lab>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l16.q1"
          q={<p>In a Naive Bayes model, a test instance has feature j missing. What should you do with feature j?</p>}
          options={[
            { text: 'Treat it as 0.', why: 'A missing value is not an observed 0 (or absence).' },
            { text: 'Omit its factor for every class.', correct: true, why: 'Marginalising gives Σ_m P(m | c) = 1, so it drops out.' },
            { text: 'Use the most common value of feature j.', why: 'That inserts a guess as if it were observed.' },
          ]}
        />
        <Quiz
          id="w3.l16.q2"
          q={<p>P(spam | V=0, L=1) = 0.65, P(spam | V=1, L=1) = 0.40, P(V=1 | L=1) = 0.5. What is P(spam | L=1)?</p>}
          options={[
            { text: '0.525', correct: true, why: '0.65 × 0.5 + 0.40 × 0.5.' },
            { text: '0.65', why: 'That assumes Viagra is certainly absent.' },
            { text: '1.05', why: 'The rows must be weighted, not added.' },
          ]}
        />
        <Quiz
          id="w3.l16.q3"
          q={<p>During training, example 7 has humidity missing. What happens to its other features?</p>}
          options={[
            { text: 'They are still counted; only humidity’s counts (and denominator) exclude it.', correct: true, why: 'Per-feature counts use the observed values of that feature.' },
            { text: 'The whole example is deleted.', why: 'That throws away its observed information (and can bias the sample).' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A missing value is unknown, not zero. In Naive Bayes, marginalising a missing feature multiplies by <M t="\sum_m P(m \mid c) = 1" />, so you simply
        omit its factor; in training, leave it out of that feature’s counts. For a general posterior table, average over the unknown value with weights
        conditional on what <em>was</em> observed.
      </Callout>

      <Checklist id="w3-missing" items={CHECKS3['w3-missing']} />
    </>
  );
}
