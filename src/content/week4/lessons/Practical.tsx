import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, TryThis } from '../../../components/ui';
import { CostLab } from '../labs/CostLab';
import { MissingLab } from '../labs/MissingLab';

export default function Practical() {
  return (
    <>
      <Sec title="From a tree to rules, and pruning the rules">
        <p>
          Every root-to-leaf path is a rule: IF (conjunction of tests) THEN (label). Turning the tree into rules gives a different handle for simplification.
          In <strong>rule post-pruning</strong>, each rule is shortened separately: drop any condition whose removal does not hurt estimated accuracy. That
          can remove a test near the root from one rule while keeping it in the others — something subtree pruning cannot do, since a node is shared by
          every path below it.
        </p>
        <p>
          The price: a shortened rule covers more inputs, so the rules may now overlap (and some inputs may be covered by none). A rule set therefore needs an
          explicit way to resolve conflicts — for example, order the rules and use the first that fires, with a default class at the end.
        </p>
      </Sec>

      <Sec title="Attributes that are expensive to measure">
        <p>
          Some attributes cost money, time or risk to observe — a blood test compared with a temperature reading. When building the tree we may prefer an
          informative test that is also cheap. One heuristic replaces the gain by
        </p>
        <MB t="\frac{\operatorname{IG}(S, A)^2}{\operatorname{Cost}(A)}, \qquad \operatorname{Cost}(A) > 0," />
        <p>
          which trades information against cost. This is a preference built into the search, not a new definition of information gain, and other trade-offs
          are possible.
        </p>
      </Sec>

      <Sec title="Mistakes that cost different amounts">
        <p>
          Measurement cost concerns <em>obtaining</em> an input. Misclassification cost concerns the <em>consequence of a prediction</em> — a missed disease
          versus an unnecessary follow-up. Week 3’s decision rule applies at every leaf: with estimated class probabilities <M t="p_c" /> at the leaf and loss{' '}
          <M t="L(a, c)" /> for action <M t="a" /> when the truth is <M t="c" />, choose the action with the least expected loss
        </p>
        <MB t="R(a) = \sum_c L(a, c)\,p_c." />
        <p>
          With false-positive cost 1, false-negative cost 10 and <M t="p(\text{positive}) = 0.2" /> at a leaf: predicting positive costs{' '}
          <M t="1 \times 0.8 = 0.8" /> in expectation, predicting negative costs <M t="10 \times 0.2 = 2" />. The leaf should predict <strong>positive</strong>,
          although positives are the minority there. Majority voting is the special case of equal costs.
        </p>
        <Lab title="Expected cost at a leaf" purpose="Set the leaf’s positive probability and the two error costs. The cheaper line is the decision.">
          <CostLab />
        </Lab>
        <TryThis
          items={[
            'Start at p = 0.2 with costs 1 and 10: the minimum-cost action is positive while the majority vote says negative.',
            'Make the costs equal: the threshold moves to 0.5 and agrees with the majority vote.',
            'Find the p where the two lines cross and check it equals C_FP/(C_FP + C_FN).',
          ]}
        />
        <p>
          A common design grows the tree with an impurity criterion and brings costs in at the leaves and during pruning. The split with the lowest
          immediate cost need not be the one that exposes the most useful structure below it.
        </p>
      </Sec>

      <Sec title="Missing values: say how they are routed">
        <p>
          An example reaches a node that tests an attribute it does not have. Three policies are common:
        </p>
        <ol>
          <li>Fill in the most common value among the training examples at that node.</li>
          <li>During training only, fill in the most common value among examples <em>of the same class</em> at that node.</li>
          <li>
            Send the example down <em>every</em> branch, with weights <M t="q_v" /> equal to the fraction of training examples at the node that took branch{' '}
            <M t="v" /> (so <M t="\sum_v q_v = 1" />). During training, the example then contributes fractional counts to each child, and gains are computed
            from weighted counts. At prediction time, combine the leaves’ class distributions with the weights that reach them.
          </li>
        </ol>
        <Lab title="Routing a missing value" purpose="The finished PlayTennis tree. Mark any attribute as missing (?) and compare fractional routing with filling in the most common value.">
          <MissingLab />
        </Lab>
        <TryThis
          items={[
            'Sunny, Humidity ?, Weak: the Sunny node splits the weight 3/5 to High (No) and 2/5 to Normal (Yes), so P(Yes) = 2/5 — predict No.',
            'Outlook ?, High, Weak: weights 5/14, 4/14, 5/14 go down the three branches; P(Yes) = 9/14. Filling in the most common Outlook (Sunny, tied with Rain and taken first) predicts No instead.',
            'Overcast with everything else missing: the path never tests the missing attributes, so they do not matter.',
          ]}
        />
        <Callout kind="warning" title="Training information that does not exist at prediction time">
          Class-conditional filling (policy 2) uses the example’s label. A new example’s label is exactly what we are trying to predict, so that policy cannot
          be used at prediction time. Specify a policy that is feasible there — node-level filling or fractional routing — rather than quietly using the
          answer to fill in the input.
        </Callout>
      </Sec>

      <Sec title="Windowing: learning from a manageable subset">
        <p>
          A historical technique for training sets too large to process at once: pick a random subset (the <em>window</em>), grow a tree on it, classify the
          rest of the training set, add some misclassified examples to the window, and repeat. It concentrates effort on the hard cases. Note what its stopping
          check means: classifying the remaining <em>training</em> examples correctly is not evidence of generalisation, and if identical inputs carry
          conflicting labels the loop needs an error-tolerant stopping rule or it never ends.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>A leaf has P(positive) = 0.2, false-positive cost 1 and false-negative cost 10. What should it predict?</p>}
          options={[
            { text: 'Positive: expected cost 0.8, against 2 for negative', correct: true, why: 'The rarer class wins because missing it is ten times worse.' },
            { text: 'Negative: it is the majority', why: 'Majority vote assumes equal costs.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>With fractional routing, a Sunny day with Humidity missing has P(No) equal to…</p>}
          options={[
            { text: '3/5', correct: true, why: 'Three of the five Sunny training days took the High branch, whose leaf is No.' },
            { text: '1/2', why: 'The weights come from training counts at the node, not from the number of branches.' },
            { text: '5/14', why: 'That is the proportion of Sunny days overall, not the routing weight at the Sunny node.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>Why can’t “fill in the most common value among examples of the same class” be used for a new example?</p>}
          options={[
            { text: 'Its class is unknown — that is what we are predicting', correct: true, why: 'The policy is available only during training.' },
            { text: 'It is too slow', why: 'Speed is not the problem; the required information does not exist.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Practical trees need explicit policies. Rules can be pruned one at a time but then need conflict resolution. Measurement cost can shape the search;
        misclassification cost decides what each leaf predicts, by minimum expected loss. A missing value must be routed by a rule that is feasible at
        prediction time — fractional routing sends weight down every branch and averages the leaves.
      </Callout>
    </>
  );
}
