import { Callout, Lab, Quiz, Sec, Table, TryThis } from '../../../components/ui';
import { DepthLab } from '../labs/DepthLab';

export default function Overfitting() {
  return (
    <>
      <Sec title="A split can capture a pattern — or an accident">
        <p>
          Every split a tree makes is justified by the training examples at one node. Some splits capture a stable pattern; others separate a few examples
          whose labels happen to be noisy in this particular sample. Both lower the training error, and the training data alone cannot tell them apart.
        </p>
        <p>
          In fact training error can never go up as the tree grows: splitting a leaf and labelling each child by <em>its</em> majority is at least as accurate
          on those examples as the parent’s single label. So the training error falls steadily — eventually to zero, if no two identical inputs disagree
          (lesson 11) — whether or not the splits mean anything.
        </p>
        <p>
          Week 1’s bias–variance picture explains what happens on new data. A deep tree has many small leaves, each estimating its label from a handful of
          examples; change the sample slightly and many of those leaves change. That is <strong>high variance</strong>. A shallow tree averages over large
          regions and changes little between samples, but may miss real structure: <strong>high bias</strong>.
        </p>
      </Sec>

      <Sec title="Watch it happen">
        <Lab title="Depth against error" purpose="250 training points from a wavy boundary, with a fraction of labels flipped at random. The right-hand chart tracks training error and error on 2000 fresh points as the depth limit grows.">
          <DepthLab />
        </Lab>
        <TryThis
          items={[
            'Sweep the depth from 1 to 12. Training error falls all the way; held-out error falls to a minimum (around depth 4 for the first sample) and then climbs as the tree carves out pockets around flipped labels.',
            'Set the noise to 0. Now deeper trees keep helping: with no accidents to memorise, extra splits only refine the staircase.',
            'At depth 10, press “New training sample” a few times: the regions change dramatically. At depth 2 they barely move. That is variance you can see.',
            'Set the minimum examples per leaf to 10: deep trees can no longer isolate single noisy points, and the held-out curve stops climbing.',
            'The dashed line is the noise rate. No classifier can beat it on these data on average (Week 3’s Bayes error); a training error below it is a warning sign.',
          ]}
        />
      </Sec>

      <Sec title="Pre-pruning: constrain growth">
        <p>The first remedy is to stop growing before the tree memorises the sample. Each common constraint controls something different:</p>
        <Table
          head={['Constraint', 'What it limits', 'scikit-learn parameter']}
          rows={[
            ['Maximum depth', 'the number of tests on any path', <code>max_depth</code>],
            ['Maximum number of leaves', 'the number of regions', <code>max_leaf_nodes</code>],
            ['Minimum samples to split', 'whether a node has enough examples to attempt a split at all', <code>min_samples_split</code>],
            ['Minimum samples per leaf', 'whether every child of a proposed split is large enough', <code>min_samples_leaf</code>],
            ['Minimum impurity decrease', 'whether the best split improves the criterion enough to be worth making', <code>min_impurity_decrease</code>],
            ['Significance test (e.g. χ²)', 'whether the association between test outcome and label is unlikely to be chance', '—'],
          ]}
        />
        <Callout kind="warning" title="“Minimum samples to split” is not “minimum samples per leaf”">
          With minimum samples to split = 20, a node of 20 examples may be split. With minimum samples per leaf = 5, a proposed 19/1 split of that same node
          is still rejected, because one child would hold a single example.
        </Callout>
        <p>
          Pre-pruning is cheap and fast, but it judges each split in isolation. A split whose value only appears one level deeper — XOR in lesson 9 — is cut off before
          its usefulness can show. <strong>Post-pruning</strong> grows the full tree and then removes parts that do not earn their keep (lesson 12).
        </p>
        <Callout kind="note" title="Perfect training fit has a precondition">
          “An unpruned tree reaches zero training error” holds only when examples with identical inputs have identical labels. Otherwise some errors survive
          any amount of splitting — lesson 11.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>As the maximum depth of a greedily grown tree increases, its training error…</p>}
          options={[
            { text: 'never increases', correct: true, why: 'Each child’s majority label is at least as accurate on the child’s examples as the parent’s label.' },
            { text: 'first falls, then rises', why: 'That shape belongs to held-out error, not training error.' },
            { text: 'always reaches zero', why: 'Not if identical inputs carry different labels.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>The minimum samples per leaf is 5. A node holds 20 examples and the best split is 19 / 1. What happens?</p>}
          options={[
            { text: 'The split is rejected, because one child would have 1 example', correct: true, why: 'Leaf-size limits apply to every child of a proposed split.' },
            { text: 'The split is made, because the node has at least 5 examples', why: 'That would be a rule about the parent, not the leaves.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>What does “deep trees have high variance” mean?</p>}
          options={[
            { text: 'Their predictions vary a lot across the input space', why: 'Any non-trivial model’s predictions vary with x; variance here is across training samples.' },
            { text: 'Trees learned from different training samples, at the same input, give very different predictions', correct: true, why: 'As in Week 1: variance is measured over training sets at a fixed input.' },
            { text: 'Their training error is large', why: 'Deep trees have small training error.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Training error can only fall as a tree grows, so it cannot tell a real pattern from a memorised accident. Deep trees have small, unstable leaves —
        high variance; shallow trees may miss structure — high bias. Pre-pruning limits growth with depth, leaf-size, impurity-decrease or significance
        rules; it is cheap but can stop just before a useful interaction appears.
      </Callout>
    </>
  );
}
