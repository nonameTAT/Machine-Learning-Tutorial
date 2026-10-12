import { M } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../../components/ui';
import { OneSELab, PruneLab } from '../labs/PruneLab';

export default function Pruning() {
  return (
    <>
      <Sec title="Grow first, then simplify">
        <p>
          Post-pruning reverses the order of pre-pruning: grow a large tree, then look at each subtree and ask whether a single leaf in its place would do at
          least as well. Because the full tree is grown first, interactions that only pay off one level down (XOR) get a chance to appear before they are
          judged. The cost is extra computation, and the method is only as good as its estimate of “doing well” — which cannot be the training error, since
          that always favours the bigger tree.
        </p>
      </Sec>

      <Sec title="Reduced-error pruning">
        <p>
          Split the labelled data into a <strong>training set</strong>, used to grow the tree, and a <strong>validation set</strong>, used only to judge
          pruning. To consider pruning an internal node:
        </p>
        <ol>
          <li>Replace its whole subtree by a leaf labelled with the <em>training</em> majority at that node.</li>
          <li>
            Compare validation errors before and after, counting only the validation examples that reach the node — predictions everywhere else are
            unchanged.
          </li>
          <li>Among all internal nodes, make the replacement that removes the most validation errors (ties go to the larger subtree). Never make one that adds errors.</li>
          <li>Repeat until every remaining replacement would increase the validation error.</li>
        </ol>
        <Steps
          intro={<p>One decision, by hand. A node’s training examples are 6 Yes and 4 No; eight validation examples reach it, 5 Yes and 3 No.</p>}
          steps={[
            { title: 'Label the candidate leaf', body: <p>The training majority is Yes, so the replacement leaf predicts Yes.</p> },
            { title: 'Count its validation errors', body: <p>It misclassifies the 3 validation No examples: 3 errors.</p> },
            {
              title: 'Compare with the subtree',
              body: <p>If the subtree makes 4 errors on those eight examples, pruning removes one error — prune. If it makes 2, pruning would add one — keep it.</p>,
            },
          ]}
        />
        <Lab title="Reduced-error pruning, step by step" purpose="A full tree grown on 250 noisy training points; 150 validation points (hollow) decide the prunes; 2000 untouched test points check the result.">
          <PruneLab />
        </Lab>
        <TryThis
          items={[
            'Step through the prunes. Each one cuts a whole subtree that the validation points do not support; the regions get simpler and the test error mostly falls with them.',
            'Compare the two curves at the end. The validation error is what pruning optimised, so it flatters the final tree; the test error is the honest estimate.',
            'Try new samples. The number of leaves that survive changes — pruning decisions inherit the noise of a 150-point validation set.',
          ]}
        />
        <Callout kind="warning" title="What reduced-error pruning costs">
          The validation examples are taken away from growing the tree, which hurts most when data are scarce. And because many pruning choices are made by
          looking at the same validation set, its error becomes optimistic — keep a separate test set that plays no part in any of these decisions.
        </Callout>
      </Sec>

      <Sec title="Cross-validation and the one-standard-error rule">
        <p>
          Instead of a single validation split, estimate the error of several candidate tree sizes by cross-validation (Week 2), so every example is used
          both for growing and for validating — in different folds. Each estimate comes with a <strong>standard error</strong> (SE): its uncertainty as an
          estimate of a mean error.
        </p>
        <ul>
          <li>
            The <strong>minimum-error rule</strong> picks the size with the smallest estimated error.
          </li>
          <li>
            The <strong>one-SE rule</strong> picks the <em>smallest</em> tree whose estimated error is at most{' '}
            <M t="\text{(minimum estimated error)} + \text{(SE of that minimum)}" />. Differences smaller than the estimates’ own uncertainty are not
            treated as real, and the simpler tree gets the benefit of the doubt.
          </li>
        </ul>
        <Table
          className="num"
          head={['Leaves', 'CV error', 'SE']}
          rows={[
            ['4', '0.180', '0.020'],
            ['8', '0.137', '0.014'],
            ['16', <strong>0.130</strong>, '0.010'],
            ['32', '0.134', '0.012'],
          ]}
        />
        <p>
          The minimum-error rule picks 16 leaves. The one-SE threshold is <M t="0.130 + 0.010 = 0.140" />; the trees with 8, 16 and 32 leaves are within it,
          and the smallest of those has <strong>8 leaves</strong>.
        </p>
        <Lab title="Two selection rules" purpose="Drag any estimate up or down. The dashed line is the minimum plus its own SE; the two rings show what each rule picks.">
          <OneSELab />
        </Lab>
        <TryThis
          items={[
            'Raise the 8-leaf estimate to 0.145. It is now above the threshold, so the one-SE rule moves to 16 leaves.',
            'Lower the 4-leaf estimate to 0.139: the one-SE rule jumps to the smallest tree.',
            'Lower the 32-leaf estimate below 0.130. The minimum moves, the threshold is recomputed from the new minimum’s SE, and the choice may change.',
          ]}
        />
        <Callout kind="note" title="Standard error is not standard deviation">
          The SD describes how much individual fold errors vary; the SE describes uncertainty in their <em>mean</em> (roughly SD/√folds). The one-SE rule
          is a heuristic preference for simplicity among models whose estimated performance is indistinguishable — not a guarantee that their true errors
          are equal.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>In reduced-error pruning, the leaf that replaces a subtree predicts…</p>}
          options={[
            { text: 'the majority label of the training examples at that node', correct: true, why: 'The validation set judges the choice; it does not supply the label.' },
            { text: 'the majority label of the validation examples at that node', why: 'Then the validation set would both fit and judge the leaf, making its error doubly optimistic.' },
            { text: 'the label of the largest child', why: 'The leaf summarises all the node’s training examples.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>Using the table above, which tree does the one-SE rule choose, and why not 4 leaves?</p>}
          options={[
            { text: '8 leaves: the smallest with error ≤ 0.140; the 4-leaf tree’s 0.180 is above the threshold', correct: true, why: 'The threshold uses the SE of the minimum (0.010).' },
            { text: '4 leaves: its error minus its own SE, 0.160, is the most favourable', why: 'Each candidate’s own SE plays no part; only the minimum’s SE does.' },
            { text: '16 leaves: it has the minimum error', why: 'That is the minimum-error rule.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>Why should a final test set play no part in pruning decisions?</p>}
          options={[
            { text: 'Because any set used to make choices becomes optimistic about the model it chose', correct: true, why: 'An independent test set is the only unbiased check left.' },
            { text: 'Because test sets are too small to prune with', why: 'Size is not the issue; independence is.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Post-pruning grows the full tree, then replaces subtrees by leaves when a held-out estimate says the simpler tree is no worse. Reduced-error pruning
        uses a validation set and the training majority at each node; cross-validation compares tree sizes, and the one-SE rule picks the smallest tree within
        one standard error of the best. Every set used for choosing becomes optimistic, so keep a separate test set.
      </Callout>
    </>
  );
}
