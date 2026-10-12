import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, TryThis } from '../../../components/ui';
import { GainLab } from '../labs/GainLab';

export default function Gain() {
  return (
    <>
      <Sec title="How uncertain will the label be after the test?">
        <p>
          Entropy scores one node. A test turns one node into several, so ask: <em>after I learn the outcome of this test, how uncertain will I be about the
          label?</em> A random example from <M t="S" /> lands in child <M t="S_v" /> with probability <M t="|S_v| / |S|" />, and there its remaining
          uncertainty is <M t="H(S_v)" />. The expected remaining uncertainty is therefore a <strong>size-weighted</strong> average, and the improvement is
        </p>
        <MB t="\operatorname{IG}(S, A) = H(S) - \sum_{v \in \mathcal V_A} \frac{|S_v|}{|S|}\,H(S_v)," />
        <p>
          where <M t="\mathcal V_A" /> is the set of outcomes of test <M t="A" />. This is the <strong>information gain</strong>; ID3 chooses the candidate
          with the largest gain.
        </p>
        <Callout kind="warning" title="Why an ordinary average is wrong">
          A split makes a pure child with 90 examples and a balanced child with 10. The expected remaining entropy is{' '}
          <M t="0.9 \times 0 + 0.1 \times 1 = 0.1" /> bits. An unweighted average gives 0.5 bits — treating a branch that ten examples reach as if it held
          half the population.
        </Callout>
        <Lab
          title="Gain as a picture"
          purpose="Each test is drawn as blocks: width = how many examples take the branch, height = that branch’s entropy. The total area divided by n is the expected entropy after the test, and the gain is the gap below the parent’s line."
        >
          <GainLab />
        </Lab>
        <TryThis
          items={[
            'Worked example: A₁ leaves less area than A₂ — gains 0.266 and 0.121. Check that each pair of branches adds up to the parent (29+, 35−).',
            'Drag A₂’s left branch to (29+, 0−). Both branches become pure and the gain reaches its maximum, H(S) = 0.994.',
            '“Unequal branch sizes”: T₁ has a tiny impure branch and a huge pure one. Turn on the unweighted average: it rises far above the parent line — the wrong formula would report negative gain.',
            'T₂ sends (48+, 2−) one way and (47+, 3−) the other — almost the parent’s proportions — so its gain is close to 0 even though it splits the examples in half.',
          ]}
        />
      </Sec>

      <Sec title="Worked example: 64 observations">
        <p>
          The parent has 29 positive and 35 negative examples. Test <M t="A_1" /> sends them to (21+, 5−) and (8+, 30−); test <M t="A_2" /> to (18+, 33−) and
          (11+, 2−).
        </p>
        <Steps
          steps={[
            { title: 'Parent entropy', body: <MB t="H(S) = -\tfrac{29}{64}\log_2\tfrac{29}{64} - \tfrac{35}{64}\log_2\tfrac{35}{64} = 0.993651." /> },
            {
              title: <>Children of <M t="A_1" />, each with its own proportions</>,
              body: <MB t="H(21{+}, 5{-}) = H\big(\tfrac{21}{26}\big) = 0.706274, \qquad H(8{+}, 30{-}) = H\big(\tfrac{8}{38}\big) = 0.742488." />,
            },
            { title: 'Weight by branch size and subtract', body: <MB t="\operatorname{IG}(S, A_1) = 0.993651 - \Big(\tfrac{26}{64}(0.706274) + \tfrac{38}{64}(0.742488)\Big) = 0.993651 - 0.727776 = 0.265875." /> },
            {
              title: <>Same for <M t="A_2" /></>,
              body: <MB t="H(18{+}, 33{-}) = 0.936667,\quad H(11{+}, 2{-}) = 0.619382,\quad \operatorname{IG}(S, A_2) = 0.993651 - \Big(\tfrac{51}{64}(0.936667) + \tfrac{13}{64}(0.619382)\Big) = 0.121432." />,
            },
            { title: 'Decide', body: <p><M t="A_1" /> reduces the uncertainty more: it is the better immediate split.</p> },
          ]}
        />
        <Callout kind="note" title="A routine that catches most slips">
          Check that the children’s counts add up to the parent’s and that the weights add up to 1. Compute each child’s proportions from that child’s own
          total. Keep full precision until the end. A negative gain is a certain sign of a counting or weighting error.
        </Callout>
      </Sec>

      <Sec title="What gain measures — and its bounds">
        <p>
          Writing <M t="Y" /> for the label and <M t="A" /> for the test outcome of a random example at the node,
        </p>
        <MB t="\operatorname{IG}(S, A) = H(Y) - H(Y \mid A)," />
        <p>
          the (empirical) <strong>mutual information</strong> between test and label: how much knowing the outcome tells you about the class. Two bounds
          follow, and both are worth being able to justify.
        </p>
        <ul>
          <li>
            <strong>
              <M t="\operatorname{IG} \ge 0" />.
            </strong>{' '}
            The parent’s class distribution is the size-weighted mixture of the children’s: <M t="p = \sum_v w_v\,p^{(v)}" />. Entropy is concave, so{' '}
            <M t="H\big(\sum_v w_v p^{(v)}\big) \ge \sum_v w_v H(p^{(v)})" /> (Jensen’s inequality). Equality — zero gain — holds exactly when every
            non-empty child has the parent’s proportions: the outcome is independent of the label in this sample.
          </li>
          <li>
            <strong>
              <M t="\operatorname{IG} \le H(S)" />
            </strong>
            , because the subtracted term is never negative. Equality holds exactly when every non-empty child is pure.
          </li>
        </ul>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>A test splits (6+, 4−) into (3+, 2−) and (3+, 2−). What is its gain?</p>}
          options={[
            { text: '0', correct: true, why: 'Both children have the parent’s proportions 3/5, so nothing has been learned about the label.' },
            { text: 'Positive, because the test made two children', why: 'Making branches is not the same as separating classes.' },
            { text: 'Negative', why: 'Gain is never negative for a genuine partition (concavity of entropy).' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>Your hand calculation gives a gain of −0.05. What is the most likely explanation?</p>}
          options={[
            { text: 'The test makes predictions worse', why: 'Gain cannot be negative; the arithmetic is wrong.' },
            { text: 'A counting or weighting slip: children not adding up to the parent, unweighted averaging, or a child’s proportions taken over the wrong total', correct: true, why: 'Run the verification routine.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>When does the gain of a test equal the parent entropy H(S)?</p>}
          options={[
            { text: 'When every non-empty child is pure', correct: true, why: 'Then the expected remaining entropy is 0.' },
            { text: 'When the children have equal sizes', why: 'Equal sizes say nothing about the labels inside them.' },
            { text: 'Never', why: 'It happens whenever the test separates the classes completely, e.g. Humidity inside the Sunny branch (lesson 6).' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Information gain is the parent’s entropy minus the size-weighted average entropy of the children: how much a test’s outcome reduces label uncertainty,
        on average over the examples. Weights matter because a branch matters in proportion to how many examples take it. Gain is 0 when the outcome tells
        nothing about the label and equals H(S) when every child is pure.
      </Callout>
    </>
  );
}
