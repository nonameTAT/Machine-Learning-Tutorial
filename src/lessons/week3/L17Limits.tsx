import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { DuplicateLab } from '../../interactives/week3/DuplicateLab';
import { CHECKS3 } from './checks';

export default function L17Limits() {
  return (
    <>
      <Sec title="A good decision does not need a good probability">
        <p>
          The independence assumption is often violated, yet Naive Bayes “works surprisingly well anyway”. The reason: classification only needs
          the correct class to receive the <em>largest</em> score,
        </p>
        <MB t="\argmax_{v_j} \hat P(v_j)\prod_i \hat P(x_i \mid v_j) = \argmax_{v_j} P(v_j)\,P(x_1, \dots, x_d \mid v_j)," />
        <p>
          not that the estimated posteriors are correct. Suppose the true posteriors are <M t="(0.6, 0.4)" /> and Naive Bayes estimates{' '}
          <M t="(0.95, 0.05)" />. Under equal costs the label is right, but the confidence is badly overstated — and a cost-sensitive decision (lesson 5)
          that uses the probability itself can go wrong. NB posteriors are often unrealistically close to 1 or 0.
        </p>
      </Sec>

      <Sec title="Correlated features double-count evidence">
        <p>
          Suppose a binary feature has likelihood ratio 3, and a second feature is an identical copy. Observing both is still <em>one</em> piece of evidence:
          the true joint likelihood ratio is 3. Naive Bayes multiplies the two marginal ratios and uses <M t="3 \times 3 = 9" />. That distorts confidence —
          and, combined with the prior, can reverse the decision. Adding too many redundant attributes (e.g. identical ones) causes problems.
        </p>
        <Lab title="Counting the same clue several times" purpose="Set the prior odds and one feature’s likelihood ratio, then duplicate the feature. The true odds stay put; Naive Bayes keeps multiplying.">
          <DuplicateLab />
        </Lab>
        <TryThis
          items={[
            'Default: prior odds 1/3, ratio 2.5. The truth favours B (odds 0.83), but two copies already push Naive Bayes over to A.',
            'Set the ratio to 1 (an uninformative feature): copies change nothing. Duplicates amplify whatever direction the evidence points.',
            'Watch NB’s P(A | x) with 6 copies: confidence near 1 from a single real clue.',
          ]}
        />
      </Sec>

      <Sec title="A two-word example">
        <p>From the full posterior table, the posterior odds of spam are:</p>
        <Table
          head={['Viagra', 'lottery', 'full-table posterior odds', 'MAP']}
          rows={[
            ['0', '0', '0.31/0.69 = 0.45', 'ham'],
            ['1', '1', '0.40/0.60 = 0.67', 'ham'],
            ['0', '1', '0.65/0.35 = 1.9', 'spam'],
            ['1', '0', '0.80/0.20 = 4.0', 'spam'],
          ]}
        />
        <p>Naive Bayes instead uses the marginal (one-word) likelihoods:</p>
        <Table
          head={['class', 'P(Viagra = 1 | Y)', 'P(lottery = 1 | Y)']}
          rows={[
            ['spam', '0.40', '0.21'],
            ['ham', '0.12', '0.13'],
          ]}
        />
        <p>and multiplies them into likelihood ratios:</p>
        <Table
          head={['Viagra', 'lottery', 'NB likelihood ratio', 'full-table odds']}
          rows={[
            ['0', '0', <M t="\frac{0.60 \times 0.79}{0.88 \times 0.87} \approx 0.62" />, '0.45'],
            ['0', '1', <M t="\frac{0.60 \times 0.21}{0.88 \times 0.13} \approx 1.1" />, '1.9'],
            ['1', '0', <M t="\frac{0.40 \times 0.79}{0.12 \times 0.87} \approx 3.0" />, '4.0'],
            ['1', '1', <M t="\frac{0.40 \times 0.21}{0.12 \times 0.13} \approx 5.4" />, '0.67'],
          ]}
        />
        <p>
          With an ML rule (ratio vs 1) the simple model agrees with the MAP prediction in the first three cases, but not the fourth: when both words occur,
          the product says strongly spam while the full table says ham. Treating the two words as independent evidence missed their interaction.
        </p>
        <Callout kind="note" title="Compare like with like">
          A likelihood ratio and posterior odds differ by the prior odds. For an exact comparison, multiply the NB ratio by the prior odds before comparing
          it with the full-table posterior odds.
        </Callout>
      </Sec>

      <Sec title="A balanced verdict">
        <Table
          head={['Strengths', 'Limitations']}
          rows={[
            ['easy and fast to train (counting) and to predict', 'zero-frequency problem without smoothing'],
            ['handles many classes naturally', 'probability outputs are poorly calibrated — “a bad estimator”'],
            ['few parameters; can need less data when the assumption holds', 'strong independence assumption, rarely true; redundant features double-count'],
            ['works well with categorical inputs', 'numeric features need a distributional assumption (e.g. Gaussian)'],
          ]}
        />
        <Callout kind="warning" title="Avoid absolute claims">
          Conditional independence does not guarantee that Naive Bayes beats every other model, and violating it does not guarantee failure. Judge whether
          the assumptions preserve useful class comparisons, and keep accuracy separate from probability quality.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l17.q1"
          q={<p>Prior odds 1/2; one feature has likelihood ratio 1.5; a second feature is an exact copy. What are the true and the Naive Bayes posterior odds?</p>}
          options={[
            { text: 'true 0.75 (B); NB 1.125 (A)', correct: true, why: 'True: 1/2 × 1.5. NB: 1/2 × 1.5² — the copy flips the decision.' },
            { text: 'both 1.125', why: 'The copy adds no new evidence, so the true odds use the ratio once.' },
            { text: 'both 0.75', why: 'Naive Bayes multiplies both marginal ratios.' },
          ]}
        />
        <Quiz
          id="w3.l17.q2"
          q={<p>Naive Bayes reports P(spam | x) = 0.999 and classifies correctly. What can you conclude about the probability?</p>}
          options={[
            { text: 'It is accurate, since the label is right.', why: 'Correct ordering does not imply correct values; NB is often overconfident.' },
            { text: 'Nothing much — NB posteriors are often too extreme; check calibration before using the number.', correct: true, why: 'The probability outputs should not be taken too seriously.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Naive Bayes needs only the right <em>ordering</em> of class scores, so it can classify well despite violated assumptions — but its probabilities are
        often overconfident. Dependent or duplicated features are counted as independent evidence, which can distort confidence and even reverse decisions
        (both words in the spam example).
      </Callout>

      <Checklist id="w3-limits" items={CHECKS3['w3-limits']} />
    </>
  );
}
