import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, TryThis } from '../../components/ui';
import { TextNBLab } from '../../interactives/week3/TextNBLab';
import { CHECKS3 } from './checks';

export default function L14Bernoulli() {
  return (
    <>
      <Sec title="One binary probability per word and class">
        <p>
          In the multivariate Bernoulli model, a document is a bit vector <M t="z = (z_1, \dots, z_m)" /> over the vocabulary, and each bit is a separate
          coin with its own probability <M t="\theta_{jc} = P(X_j = 1 \mid c)" />. Training:
        </p>
        <Steps
          steps={[
            {
              title: 'Add the bit vectors within each class',
              body: (
                <p>
                  Spam: <M t="(2, 3, 1)" />; ham: <M t="(3, 1, 1)" /> — the number of documents in each class containing a, b, c. There are 4 documents per
                  class.
                </p>
              ),
            },
            {
              title: 'Smooth with two pseudo-documents',
              body: (
                <>
                  <p>One containing every word and one containing none, so each word gains one “present” and one “absent”:</p>
                  <MB t="\hat\theta_{jc} = \frac{\text{documents in } c \text{ containing word } j + 1}{N_c + 2}." />
                </>
              ),
            },
            {
              title: 'Result',
              body: <MB t="\hat\theta_{\text{spam}} = \big(\tfrac36, \tfrac46, \tfrac26\big) = \big(\tfrac12, \tfrac23, \tfrac13\big), \qquad \hat\theta_{\text{ham}} = \big(\tfrac46, \tfrac26, \tfrac26\big) = \big(\tfrac23, \tfrac13, \tfrac13\big)." />,
            },
          ]}
        />
        <p>
          These three components need <em>not</em> sum to 1: they describe three separate binary variables. For each word, present and absent probabilities
          do sum to 1. For example, the presence of b is twice as likely in spam as in ham.
        </p>
      </Sec>

      <Sec title="Score a document using both outcomes">
        <MB t="P(z \mid c) = \prod_{j=1}^m \theta_{jc}^{\,z_j}(1 - \theta_{jc})^{1 - z_j}." />
        <p>
          The exponent selects the right factor. An absent word is still <em>observed to be absent</em>, so its factor <M t="1 - \theta_{jc}" /> cannot be
          dropped.
        </p>
        <Callout kind="example" title="Example: an email containing a and b but not c">
          <M t="z = (1, 1, 0)" />:
          <MB t="P(z \mid \text{spam}) = \tfrac12 \times \tfrac23 \times \big(1 - \tfrac13\big) = \tfrac29 \approx 0.222, \qquad P(z \mid \text{ham}) = \tfrac23 \times \tfrac13 \times \big(1 - \tfrac13\big) = \tfrac{4}{27} \approx 0.148." />
          The likelihood ratio is <M t="(2/9)/(4/27) = 3/2" />: the ML classification is spam, and with equal priors MAP agrees, with spam posterior{' '}
          <M t="3/5" />.
        </Callout>
        <p>
          With 1/3 spam and 2/3 ham the prior odds are 1/2 and the posterior odds <M t="\tfrac32 \times \tfrac12 = \tfrac34" />: MAP predicts ham.
          The <em>feature evidence</em> is unchanged — only the prior moved. The MAP decision is spam exactly when the prior odds exceed 2/3.
        </p>
        <Lab title="Bernoulli Naive Bayes on the training emails" purpose="θ is estimated from the training emails; the new email is scored with one factor per vocabulary word, present or absent.">
          <TextNBLab initialModel="bernoulli" initialDoc="a b" />
        </Lab>
        <TryThis
          items={[
            'Reproduce the worked example: email “a b” gives 2/9 versus 4/27 and likelihood ratio 3/2. Then set P(spam) = 1/3: the decision flips to ham.',
            'Change the email to “a a a b”: nothing changes — the presence vector is still (1, 1, 0).',
            'Try an email with no vocabulary words (“d e”). Every factor is an absence factor, and they do not cancel between classes.',
            'Turn smoothing off: the parameters become (2/4, 3/4, 1/4) and (3/4, 1/4, 1/4).',
          ]}
        />
        <Callout kind="warning" title="Do not confuse the denominators">
          Bernoulli smoothing uses the number of documents in the class plus 2. It does not use total word occurrences, and it does not add the vocabulary
          size.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l14.q1"
          q={<p>Using the smoothed θ, what is P(z | ham) for z = (0, 1, 1)?</p>}
          options={[
            { text: '(1 − 2/3) × 1/3 × 1/3 = 1/27', correct: true, why: 'a is absent (factor 1 − θ_a), b and c are present.' },
            { text: '1/3 × 1/3 = 1/9', why: 'The absence of a must contribute its factor 1 − 2/3.' },
            { text: '2/3 × 1/3 × 1/3 = 2/27', why: 'a is absent, so use 1 − θ_a, not θ_a.' },
          ]}
        />
        <Quiz
          id="w3.l14.q2"
          q={<p>Why do the smoothed θ_spam components (1/2, 2/3, 1/3) not sum to 1?</p>}
          options={[
            { text: 'A smoothing error.', why: 'They are not meant to sum to 1.' },
            { text: 'Each is the probability of a separate binary event (that word present), not a distribution over words.', correct: true, why: 'A document can contain several words at once.' },
          ]}
        />
        <Quiz
          id="w3.l14.q3"
          q={<p>The likelihood ratio for an email is 3/2. Below what prior odds P(spam)/P(ham) does MAP predict ham?</p>}
          options={[
            { text: '2/3', correct: true, why: 'Posterior odds = 3/2 × prior odds < 1 ⇔ prior odds < 2/3.' },
            { text: '3/2', why: 'That is the likelihood ratio itself.' },
            { text: '1', why: 'Prior odds of 1 give posterior odds 3/2: spam.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Bernoulli Naive Bayes estimates <M t="\theta_{jc} = (\text{docs in } c \text{ with word } j + 1)/(N_c + 2)" /> and scores a bit vector with{' '}
        <M t="\prod_j \theta_{jc}^{z_j}(1 - \theta_{jc})^{1 - z_j}" /> — absent words count as evidence. Repetitions are invisible to it, and the prior
        enters only through the posterior odds.
      </Callout>

      <Checklist id="w3-bernoulli" items={CHECKS3['w3-bernoulli']} />
    </>
  );
}
