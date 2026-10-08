import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { BayesErrorLab } from '../../interactives/week3/BayesErrorLab';
import { CHECKS3 } from './checks';

export default function L08BayesError() {
  return (
    <>
      <Sec title="Uncertainty can remain even with the right probabilities">
        <p>
          Suppose that for some input <M t="x" /> the <em>true</em> class probabilities are <M t="P(c_1 \mid x) = 0.7" /> and{' '}
          <M t="P(c_2 \mid x) = 0.3" />. Predicting <M t="c_1" /> is wrong with probability 0.3; predicting <M t="c_2" /> is wrong with probability 0.7. We
          should predict <M t="c_1" />, but no amount of learning can make that error 0 — inputs like this genuinely come from both classes.
        </p>
        <p>What is the best performance any classifier could achieve? Define the probability of error at an input:</p>
        <MB t="P(\text{error} \mid x) = \begin{cases} P(c_1 \mid x) & \text{if we predict } c_2 \\ P(c_2 \mid x) & \text{if we predict } c_1, \end{cases} \qquad P(\text{error}) = \sum_x P(\text{error} \mid x)\,P(x)." />
        <p>
          The rule “predict <M t="c_1" /> if <M t="P(c_1 \mid x) > P(c_2 \mid x)" />” makes each <M t="P(\text{error} \mid x)" /> as small as possible, so on
          average it minimises the probability of classification error. Its error is the <strong>Bayes error</strong>:
        </p>
        <MB t="R^*(x) = 1 - \max_c P(c \mid x), \qquad R^* = \E_X\big[1 - \max_c P(c \mid X)\big]." />
        <p>
          For two classes <M t="R^*(x) = \min\{P(c_1 \mid x), P(c_2 \mid x)\}" />. For discrete inputs the expectation is a weighted sum over <M t="x" />;
          for continuous inputs, an integral. Bayes error concerns zero-one classification error, not an arbitrary cost-sensitive loss.
        </p>
      </Sec>

      <Sec title="Worked example: two input patterns">
        <Callout kind="example">
          <Table
            head={['x', 'P(x)', 'P(c₁ | x)', 'decision', 'error at x']}
            rows={[
              ['a', '0.4', '0.8', 'c₁', '0.2'],
              ['b', '0.6', '0.3', 'c₂', '0.3'],
            ]}
          />
          <MB t="R^* = 0.4 \times 0.2 + 0.6 \times 0.3 = 0.26." />
          The best achievable expected accuracy with these features is 0.74. Averaging 0.2 and 0.3 without the weights <M t="P(x)" /> would be wrong — the
          patterns do not occur equally often.
        </Callout>
        <Lab title="The overlap you cannot remove" purpose="Two classes with Gaussian features. The red area is the Bayes error; move your threshold and compare its error with the minimum.">
          <BayesErrorLab />
        </Lab>
        <TryThis
          items={[
            'Move your threshold onto the dashed Bayes boundary: the excess error drops to 0. Anywhere else you pay more.',
            'Set the separation to 0: the classes are indistinguishable and the Bayes error equals min(P(c₁), P(c₂)) — the best rule ignores x and predicts the more common class.',
            'Make the classes unequally likely: the Bayes boundary shifts away from the more common class (lesson 2’s prior effect).',
          ]}
        />
      </Sec>

      <Sec title="What more data can and cannot do">
        <p>
          Lesson 7 averaged uncertainty about <em>hypotheses given finite data</em>. This lesson assumes the true class posterior is known and asks for the
          minimum attainable error using these features. Both apply the same principle: maximise the appropriate posterior under zero-one loss.
        </p>
        <Callout kind="note">
          More representative training data can bring a learned rule closer to the Bayes rule. It cannot remove the overlap already present in the true{' '}
          <M t="P(c \mid x)" /> for a fixed feature set. New, informative <em>features</em> change that posterior — and can lower the Bayes error.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l8.q1"
          q={<p>P(x = a) = 0.5 with P(c₁ | a) = 0.9; P(x = b) = 0.5 with P(c₁ | b) = 0.5. What is the Bayes error?</p>}
          options={[
            { text: '0.3', correct: true, why: '0.5 × 0.1 + 0.5 × 0.5 = 0.05 + 0.25.' },
            { text: '0.1', why: 'That is the error at a only; b contributes 0.5 × 0.5.' },
            { text: '0.7', why: '0.7 is the best achievable accuracy, 1 − 0.3.' },
          ]}
        />
        <Quiz
          id="w3.l8.q2"
          q={<p>“With enough training data, any classifier can reach 100% accuracy.” Evaluate.</p>}
          options={[
            { text: 'True — more data removes uncertainty.', why: 'Data improve estimates of P(c|x); they cannot remove overlap in the true P(c|x).' },
            { text: 'False: with fixed features, error cannot go below the Bayes error, which is positive whenever classes overlap.', correct: true, why: 'Better features, not more rows, can lower it.' },
          ]}
        />
        <Quiz
          id="w3.l8.q3"
          q={<p>For three classes with posterior (0.5, 0.3, 0.2) at x, what is R*(x)?</p>}
          options={[
            { text: '0.5', correct: true, why: '1 − max = 1 − 0.5.' },
            { text: '0.2', why: 'With more than two classes, the error is 1 − max, not the minimum posterior.' },
            { text: '0', why: 'The prediction is wrong whenever the true class is the second or third.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Even the best rule — predict the class with the largest true posterior — errs with probability <M t="1 - \max_c P(c \mid x)" /> at each input.
        Averaged over inputs this is the Bayes error <M t="R^* = \E_X[1 - \max_c P(c \mid X)]" />: the floor for any classifier using these features.
      </Callout>

      <Checklist id="w3-bayeserror" items={CHECKS3['w3-bayeserror']} />
    </>
  );
}
