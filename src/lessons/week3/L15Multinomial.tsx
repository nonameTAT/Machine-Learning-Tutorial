import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, TryThis } from '../../components/ui';
import { TextNBLab } from '../../interactives/week3/TextNBLab';
import { CHECKS3 } from './checks';

export default function L15Multinomial() {
  return (
    <>
      <Sec title="A distribution over the vocabulary">
        <p>
          In the multinomial model every word <em>position</em> is a categorical variable with <M t="m" /> outcomes, drawn independently from the same
          class-specific distribution. Now <M t="\theta_{jc}" /> is the probability that a token is word <M t="j" />, given class{' '}
          <M t="c" />.
        </p>
        <Steps
          intro={<p>Training:</p>}
          steps={[
            {
              title: 'Add the count vectors within each class',
              body: (
                <p>
                  Spam: <M t="(5, 9, 3)" />; ham: <M t="(11, 3, 3)" />. Each class has 17 vocabulary tokens.
                </p>
              ),
            },
            {
              title: 'One pseudo-count per vocabulary word',
              body: <MB t="\hat\theta_{jc} = \frac{T_{jc} + 1}{T_c + m}, \qquad T_c = \sum_j T_{jc}, \quad m = |V| = 3," />,
            },
            {
              title: 'Result: 20 tokens per class after smoothing',
              body: <MB t="\hat\theta_{\text{spam}} = \big(\tfrac{6}{20}, \tfrac{10}{20}, \tfrac{4}{20}\big) = (0.3, 0.5, 0.2), \qquad \hat\theta_{\text{ham}} = \big(\tfrac{12}{20}, \tfrac{4}{20}, \tfrac{4}{20}\big) = (0.6, 0.2, 0.2)." />,
            },
          ]}
        />
        <p>
          Here the components <em>do</em> sum to 1: each token falls in exactly one vocabulary category. Class priors still count documents, not tokens.
        </p>
      </Sec>

      <Sec title="Score a count vector">
        <p>
          For counts <M t="n = (n_1, \dots, n_m)" /> with length <M t="L = \sum_j n_j" />:
        </p>
        <MB t="P(n \mid c, L) = \frac{L!}{\prod_j n_j!}\prod_{j=1}^m \theta_{jc}^{\,n_j}." />
        <p>
          Each particular ordering has probability <M t="\prod_j\theta_{jc}^{n_j}" />; the multinomial coefficient counts how many orderings share these
          counts. This model conditions on the document length rather than modelling it.
        </p>
        <Callout kind="example" title="Example: three a’s and one b">
          <M t="n = (3, 1, 0)" />, <M t="L = 4" />, coefficient <M t="4!/(3!\,1!\,0!) = 4" />:
          <MB t="P(n \mid \text{spam}) = 4 \times 0.3^3 \times 0.5 \times 0.2^0 = 0.054, \qquad P(n \mid \text{ham}) = 4 \times 0.6^3 \times 0.2 \times 0.2^0 = 0.1728." />
          The likelihood ratio is <M t="0.054/0.1728 = 5/16" />: the ML classification is <strong>ham</strong> — the opposite of the Bernoulli model for the
          same email. With equal priors the spam posterior is <M t="5/21 \approx 0.238" />.
        </Callout>
      </Sec>

      <Sec title="Why the two models disagree">
        <p>
          One occurrence of a is twice as likely in ham (0.6 vs 0.3). The multinomial model counts that evidence three times — <M t="2^3 = 8" /> in favour of
          ham — against b’s factor of 2.5 for spam: <M t="2.5/8 = 5/16" />. The Bernoulli model only records that a occurred. Neither calculation is wrong;
          the models answer different questions about the same document. The multinomial verdict comes mainly from the three occurrences of word a.
        </p>
        <p>The coefficient is the same for every class for a fixed document, so it cancels in comparisons and normalisation. The classification score is</p>
        <MB t="\ell_c = \log P(c) + \sum_j n_j\log\theta_{jc}." />
        <Callout kind="warning" title="A missing factor is not always a mistake">
          Keep the coefficient when reporting the probability of the count vector; omit it for class comparison. Absent words have exponent 0 and contribute
          nothing — do not insert Bernoulli-style <M t="(1 - \theta_{jc})" /> factors.
        </Callout>
        <Lab title="Multinomial Naive Bayes on the training emails" purpose="θ is a distribution over a, b, c per class; each occurrence of a word contributes one factor.">
          <TextNBLab initialModel="multinomial" initialDoc="a a a b" />
        </Lab>
        <TryThis
          items={[
            'Reproduce the worked example: “a a a b” gives 0.054 versus 0.1728. Switch the model to Bernoulli and watch the decision flip to spam.',
            'Remove one a at a time. At which point does the multinomial model change its mind?',
            'Try the empty email “d e”: L = 0, every factor is 1, and the decision rests on the prior alone. Compare Bernoulli.',
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l15.q1"
          q={<p>With the smoothed θ, what is P(n | spam) for the count vector n = (0, 2, 1)?</p>}
          options={[
            { text: '3 × 0.5² × 0.2 = 0.15', correct: true, why: 'L = 3, coefficient 3!/(0!2!1!) = 3.' },
            { text: '0.5² × 0.2 = 0.05', why: 'That is one ordering; the coefficient counts the 3 orderings.' },
            { text: '3 × 0.7 × 0.5² × 0.2', why: 'Absent words contribute nothing in the multinomial model (no 1 − θ factor).' },
          ]}
        />
        <Quiz
          id="w3.l15.q2"
          q={<p>Why can the multinomial coefficient be dropped when choosing the class?</p>}
          options={[
            { text: 'It is the same for every class for a given document.', correct: true, why: 'It depends only on the counts, not on θ_c.' },
            { text: 'It is always 1.', why: 'It is 4 for (3, 1, 0).' },
          ]}
        />
        <Quiz
          id="w3.l15.q3"
          q={<p>What smoothing denominator does the multinomial model use for spam?</p>}
          options={[
            { text: 'tokens in spam + vocabulary size = 17 + 3', correct: true, why: 'One pseudo-count per vocabulary word.' },
            { text: 'documents in spam + 2 = 6', why: 'That is the Bernoulli denominator.' },
            { text: '17 + 1', why: 'Every vocabulary word gets a pseudo-count.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Multinomial Naive Bayes estimates a word distribution per class, <M t="\theta_{jc} = (T_{jc} + 1)/(T_c + m)" />, and scores counts with{' '}
        <M t="\tfrac{L!}{\prod n_j!}\prod_j\theta_{jc}^{n_j}" />; the coefficient cancels in comparisons and absent words do not contribute. Repeated words
        count repeatedly, which is why it can disagree with the Bernoulli model.
      </Callout>

      <Checklist id="w3-multinomial" items={CHECKS3['w3-multinomial']} />
    </>
  );
}
