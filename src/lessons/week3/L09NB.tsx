import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, TryThis } from '../../components/ui';
import { JointVsProductLab, ParamCountLab } from '../../interactives/week3/IndependenceLab';
import { CHECKS3 } from './checks';

export default function L09NB() {
  return (
    <>
      <Sec title="The practical obstacle">
        <p>
          Naive Bayes is, along with decision trees, neural networks and nearest neighbour, one of the most practical learning methods. It applies
          the MAP rule to an instance described by attributes <M t="\langle x_1, \dots, x_d\rangle" />:
        </p>
        <MB t="v_{\text{MAP}} = \argmax_{v_j\in V} P(v_j \mid x_1, \dots, x_d) = \argmax_{v_j\in V} P(x_1, \dots, x_d \mid v_j)\,P(v_j)." />
        <p>
          Estimating <M t="P(v_j)" /> is easy: count. Estimating <M t="P(x_1, \dots, x_d \mid v_j)" /> is not. The number of possible feature combinations
          explodes, and most of them never appear in the training data, so their probabilities cannot be counted.
        </p>
        <Lab title="How big is the full table?" purpose="Count the probabilities a full class-conditional table needs, compared with Naive Bayes.">
          <ParamCountLab />
        </Lab>
      </Sec>

      <Sec title="The Naive Bayes assumption">
        <p>Replace the large joint table with one small distribution per feature and class:</p>
        <MB t="P(x_1, \dots, x_d \mid v_j) = \prod_{i=1}^d P(x_i \mid v_j)." />
        <p>
          Attributes are assumed statistically independent <em>given the class</em>: once the class is known, the value of one attribute tells us nothing
          about another. This is a <strong>modelling assumption</strong>, not a consequence of Bayes’ theorem.
        </p>
        <Steps
          intro={<p>What does the assumption actually replace? Look at two features.</p>}
          steps={[
            { title: 'The exact chain rule', body: <MB t="P(x_1, x_2 \mid c) = P(x_1 \mid c)\,P(x_2 \mid x_1, c)." /> },
            {
              title: 'The assumption',
              body: (
                <>
                  <MB t="P(x_2 \mid x_1, c) = P(x_2 \mid c)\;\Longrightarrow\; P(x_1, x_2 \mid c) = P(x_1 \mid c)\,P(x_2 \mid c)." />
                  <p>Knowing feature 1 does not change the distribution of feature 2 within the class.</p>
                </>
              ),
            },
            {
              title: 'Many features',
              body: (
                <p>
                  The full product needs <em>mutual</em> conditional independence of all features given the class — not merely independence of each pair.
                </p>
              ),
            },
          ]}
        />
        <Callout kind="warning" title="Three different “independences”">
          <ul>
            <li>
              <strong>Conditional</strong> (what NB assumes): independent <em>within</em> each class.
            </li>
            <li>
              <strong>Marginal</strong>: independent overall. Features can be associated overall while independent within each class — two words both common
              in spam and rare in ham become associated once the classes are mixed.
            </li>
            <li>
              <strong>Independent of the class</strong>: that would mean the feature carries no information about the class at all — the opposite of what we
              want.
            </li>
          </ul>
        </Callout>
        <Lab title="True joint versus the Naive Bayes product" purpose="Within one class: set the two marginals and how dependent the features are. Each cell shows the true probability and NB’s product.">
          <JointVsProductLab />
        </Lab>
        <TryThis
          items={[
            'At “independent”, NB is exact: every cell equals the product of its marginals.',
            'Push the dependence to maximal + with equal marginals: the features become identical copies, and NB badly misjudges how often both are 1.',
            'Note what NB still gets right: each feature’s own probability. What it loses is the interaction.',
          ]}
        />
      </Sec>

      <Sec title="The classifier, and how to train it">
        <p>Substitute the assumption into the MAP rule:</p>
        <MB t="\boxed{\;v_{\text{NB}} = \argmax_{v_j\in V}\; \hat P(v_j)\prod_{i} \hat P(x_i \mid v_j)\;}" />
        <p>For fully observed categorical data the estimates are counts:</p>
        <MB t="\hat P(c) = \frac{N_c}{N}, \qquad \hat P(X_j = v \mid c) = \frac{N_{j,v,c}}{N_c}," />
        <p>
          where <M t="N_{j,v,c}" /> counts class-<M t="c" /> examples with feature <M t="j" /> equal to <M t="v" />. Training is counting; prediction is
          multiplying the relevant factors and comparing the class scores.
        </p>
        <Callout kind="note" title="Where the savings come from">
          With <M t="d" /> binary features, a full table needs <M t="2^d - 1" /> free probabilities per class; Naive Bayes needs <M t="d" />. Fewer
          parameters mean less estimation noise — at the cost of discarding interactions.
        </Callout>
        <Callout kind="intuition" title="Why it often works anyway">
          The assumption is often violated, yet NB works surprisingly well. For classification you do not need the estimated posteriors to be right — only
          that the correct class gets the largest score. But NB posteriors are often unrealistically close to 0 or 1, and redundant (e.g. identical)
          attributes cause problems. Lesson 17 returns to this.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l9.q1"
          q={<p>“Naive Bayes assumes the features are independent of the class.” Evaluate.</p>}
          options={[
            { text: 'True.', why: 'Then the features would carry no information about the class.' },
            { text: 'False: it assumes the features are (mutually) independent of each other given the class.', correct: true, why: 'Conditional independence, not independence from Y.' },
          ]}
        />
        <Quiz
          id="w3.l9.q2"
          q={<p>Two identical, non-constant binary features. Do they satisfy the Naive Bayes assumption within a class?</p>}
          options={[
            { text: 'Yes, they have the same distribution.', why: 'Same distribution is not independence.' },
            { text: 'No: knowing one reveals the other exactly.', correct: true, why: 'P(x₂ | x₁, c) is 0 or 1, not P(x₂ | c).' },
          ]}
        />
        <Quiz
          id="w3.l9.q3"
          q={<p>With 10 binary features and 2 classes, how many free class-conditional probabilities does Naive Bayes estimate?</p>}
          options={[
            { text: '20', correct: true, why: 'd = 10 per class, two classes.' },
            { text: '2046', why: 'That is the full table: 2 × (2¹⁰ − 1).' },
            { text: '10', why: 'Each class needs its own set.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        The full likelihood <M t="P(x_1, \dots, x_d \mid c)" /> is unlearnable for many features. Naive Bayes assumes the features are mutually independent
        given the class, so the likelihood factorises: <M t="\hat v = \argmax_c \hat P(c)\prod_j \hat P(x_j \mid c)" />, estimated by counting within each
        class.
      </Callout>

      <Checklist id="w3-nb" items={CHECKS3['w3-nb']} />
    </>
  );
}
