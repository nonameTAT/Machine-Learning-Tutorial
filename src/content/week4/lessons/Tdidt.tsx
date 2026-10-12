import { M } from '../../../components/Math';
import { Callout, Figure, Quiz, Sec, Steps, Table } from '../../../components/ui';
import { TreeView } from '../labs/TreeView';

const ID3 = `Learn(S, attributes, parent_majority):
    if S is empty:
        return Leaf(parent_majority)
    if every label in S is the same:
        return Leaf(that label)
    majority = most frequent label in S        (fixed tie-break rule)
    if no attribute in 'attributes' splits S:
        return Leaf(majority)
    A = attribute with the largest information gain on S
    node = test on A
    for each value v of A:
        S_v = examples in S with A = v
        node.child[v] = Learn(S_v, attributes − {A}, majority)
    return node`;

export default function Tdidt() {
  return (
    <>
      <Sec title="From a representation to an algorithm">
        <p>
          Lesson 2 showed that a tree <em>exists</em> for any labelling of categorical inputs. Learning has to find a good one from examples. The idea that
          makes this tractable is recursion: at the root we hold the whole training set <M t="S" />. If its labels all agree, we are done. Otherwise we pick
          one test, send each example down the branch matching its answer, and solve each branch as a smaller, independent problem of exactly the same kind.
        </p>
        <p>
          This is <strong>top-down induction of decision trees</strong> (TDIDT). <strong>ID3</strong> is the basic version for categorical attributes and
          labels, choosing tests by information gain (lessons 4–5). <strong>C4.5</strong> extends it with numeric thresholds, gain ratio, missing values and
          pruning; <strong>CART</strong> uses binary splits and handles both classification and regression.
        </p>
        <pre className="code">{ID3}</pre>
      </Sec>

      <Sec title="Each call sees only its own examples">
        <p>
          The crucial detail is <em>locality</em>. After the root splits on Outlook, the Sunny branch is a new problem whose data are the five Sunny days —
          nothing else. Its entropy, its candidate gains and its majority label are computed from those five examples, and the Rain branch may well choose a
          different attribute.
        </p>
        <Figure caption="The first step on PlayTennis. Each child receives only the examples whose answer matches its branch; the counts in the children add up to the parent’s.">
          <TreeView
            root={{
              key: 'r',
              label: 'Outlook',
              sub: '9 Y · 5 N',
              kids: [
                { edge: 'Sunny', node: { key: 's', label: 'Learn(…)', sub: '2 Y · 3 N', leaf: true, tone: 'plain' } },
                { edge: 'Overcast', node: { key: 'o', label: 'Yes', sub: '4 Y · 0 N', leaf: true, tone: 'pos' } },
                { edge: 'Rain', node: { key: 'n', label: 'Learn(…)', sub: '3 Y · 2 N', leaf: true, tone: 'plain' } },
              ],
            }}
            slotW={120}
            ariaLabel="PlayTennis split on Outlook, with the class counts at each child"
          />
        </Figure>
        <p>Three facts hold at every node, and checking them catches most arithmetic slips:</p>
        <ol>
          <li>
            <strong>Path invariant.</strong> Every example at a node satisfies every test on the path from the root to it.
          </li>
          <li>
            <strong>Partition invariant.</strong> The children’s example sets are disjoint and together make up the parent’s: their counts add up, class by
            class.
          </li>
          <li>
            <strong>Attribute use.</strong> A categorical attribute is constant inside each child of its test, so it is removed along that path. A numeric
            feature is not: a child still holds a range of values and can be split again at another threshold.
          </li>
        </ol>
        <p>
          The third fact also gives <strong>termination</strong>: with categorical tests each recursive call has one attribute fewer, so the depth is at most
          the number of attributes. With numeric thresholds, both children of a split are non-empty and strictly smaller than the parent, so the recursion
          still ends.
        </p>
      </Sec>

      <Sec title="Stopping and labelling leaves">
        <Table
          head={['Situation', 'What the procedure does', 'Why']}
          rows={[
            ['all labels in S agree', 'leaf with that label', 'nothing left to explain'],
            ['no attribute left, or none separates S', 'leaf with the majority label', 'a majority label makes the fewest mistakes when all mistakes cost the same'],
            ['S is empty (no training example has this value)', 'leaf with the parent’s majority', 'there is no evidence at this node, so fall back on the nearest node that has some'],
          ]}
        />
        <Callout kind="warning" title="Zero gain is not the same as “no usable split”">
          A test can divide the examples and yet have zero immediate gain. Continuing below it can still reveal structure — XOR is the standard example
          (lesson 9). Stopping whenever the best gain is zero is an additional early-stopping rule, not part of the basic procedure.
        </Callout>
        <p>
          Fix a tie-breaking rule (for example, the first attribute in a fixed order) so the procedure is reproducible: two runs on the same data must give the
          same tree.
        </p>
      </Sec>

      <Sec title="A trace, and what it costs">
        <Steps
          intro={<p>The whole of ID3 on PlayTennis, at the level of recursive calls (the numbers are computed in lesson 6).</p>}
          steps={[
            { title: 'Learn(all 14 days, {Outlook, Humidity, Wind})', body: <p>Labels are mixed (9 Yes, 5 No). Outlook has the largest gain: split three ways.</p> },
            { title: 'Learn(5 Sunny days, {Humidity, Wind})', body: <p>Mixed (2 Yes, 3 No). Within these five days Humidity separates perfectly: two pure leaves.</p> },
            { title: 'Learn(4 Overcast days, {Humidity, Wind})', body: <p>All Yes: return a leaf immediately.</p> },
            { title: 'Learn(5 Rain days, {Humidity, Wind})', body: <p>Mixed (3 Yes, 2 No). Here Wind separates perfectly — a different choice from the Sunny branch.</p> },
            { title: 'Return', body: <p>Three tests, five leaves, every training day classified correctly.</p> },
          ]}
        />
        <p>
          <strong>Cost.</strong> At a node with <M t="n_S" /> examples and <M t="d" /> categorical attributes, counting the class of every value of every
          attribute takes about <M t="O(d\,n_S)" />. The nodes at one depth partition the data, so one whole level costs <M t="O(d\,n)" /> and the tree costs
          about <M t="O(d\,n \cdot \text{depth})" />. Numeric features add sorting (lesson 8). Predicting follows one path, so it costs{' '}
          <M t="O(\text{depth})" />.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>When scoring candidate tests inside the Sunny branch, which entropy is the “parent” entropy?</p>}
          options={[
            { text: 'The entropy of the five Sunny days (2 Yes, 3 No): 0.971 bits', correct: true, why: 'Every quantity at a node uses only the examples at that node.' },
            { text: 'The root entropy, 0.940 bits', why: 'That belongs to the root’s problem, not the Sunny subproblem.' },
            { text: 'Zero, because Outlook has already been used', why: 'Using Outlook removes it as a candidate; the labels at the node are still mixed.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>A test on a three-valued attribute leaves one branch with no training examples. What should that leaf predict?</p>}
          options={[
            { text: 'The majority label of the parent node', correct: true, why: 'With no evidence at the node, fall back on the closest node that has some.' },
            { text: 'Nothing — delete the branch', why: 'A future example can still take that value and must receive a prediction.' },
            { text: 'The majority label of the whole training set', why: 'The parent is more specific, since it reflects the tests already answered.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>Can the same feature be tested twice on one root-to-leaf path?</p>}
          options={[
            { text: 'Never', why: 'True for a categorical equality test, false for numeric thresholds.' },
            { text: 'Yes, if it is numeric: e.g. x ≤ 5 and then x ≤ 2 below it', correct: true, why: 'A child of a threshold split still holds a range of values.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Top-down induction solves one problem by splitting it into smaller problems of the same kind: if the labels agree, make a leaf; otherwise choose a
        test, partition the examples and recurse. Every score is computed locally, on the examples at the node; the children partition the parent; and
        majority leaves, parent-majority fallbacks and a fixed tie-break make the procedure well defined and reproducible.
      </Callout>
    </>
  );
}
