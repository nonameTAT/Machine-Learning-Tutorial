import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../../components/ui';
import { DepthLab } from '../labs/DepthLab';
import { XorGainLab } from '../labs/XorGainLab';

export default function Greedy() {
  return (
    <>
      <Sec title="Many trees fit; the learner must prefer one">
        <p>
          Week 3 opened with a fact that applies here with full force: the training data never determine the predictions for unseen inputs. Many different
          trees classify the 14 PlayTennis days perfectly and disagree about other days. Whatever makes a learner pick one of them is its{' '}
          <strong>inductive bias</strong>. For trees it helps to separate two kinds.
        </p>
        <Table
          head={['', 'Restriction bias', 'Preference bias']}
          rows={[
            ['What it is', 'limits on which hypotheses can be expressed at all', 'an ordering of the hypotheses that can be expressed'],
            ['ID3 on categorical attributes', 'trees over the given attributes — a complete class, so no function of the attributes is ruled out (lesson 2)', 'shorter trees, with high-gain tests near the root'],
            ['Trees with numeric thresholds', 'axis-parallel regions only (lesson 1)', 'the same greedy preference, plus any pruning rule'],
          ]}
        />
        <p>
          ID3’s preference is a version of Occam’s razor — prefer simple explanations — implemented by a search procedure rather than stated as a score. It
          tends to produce short trees; it does not guarantee the shortest one.
        </p>
      </Sec>

      <Sec title="What “greedy” means">
        <p>
          At each node ID3 takes the test with the largest <em>immediate</em> gain, commits to it, and never revisits the decision. It is hill-climbing
          through the space of trees, from simple to complex, with no backtracking. That is fast — and since finding a smallest consistent tree is NP-hard
          in general, some such compromise is unavoidable. The price is that a locally best test need not begin the best tree. Lesson 6 showed a mild
          version (a poor root on PlayTennis costs three extra leaves); XOR shows the extreme.
        </p>
        <p>
          Two further properties of this search are worth knowing. ID3 outputs a <em>single</em> tree: it cannot say how many other trees fit the data
          equally well. And every decision uses all the training examples at the node, as counts, so one mislabelled example shifts a gain only a little —
          the search is less sensitive to individual errors than a method that reacts to one example at a time.
        </p>
      </Sec>

      <Sec title="XOR: zero gain, then a perfect split">
        <p>Four equally weighted examples, <M t="Y = A \oplus B" />:</p>
        <Table
          head={['A', 'B', 'Y']}
          rows={[
            ['f', 'f', 'False'],
            ['f', 't', 'True'],
            ['t', 'f', 'True'],
            ['t', 't', 'False'],
          ]}
        />
        <Steps
          steps={[
            { title: 'Root entropy', body: <p>Two True, two False: <M t="H(S) = 1" />.</p> },
            {
              title: 'Gain of A at the root',
              body: <MB t="\text{A = t: (1 True, 1 False)},\quad \text{A = f: (1 True, 1 False)} \;\Rightarrow\; \operatorname{IG}(S, A) = 1 - \big(\tfrac12 \cdot 1 + \tfrac12 \cdot 1\big) = 0." />,
            },
            { title: 'Gain of B at the root', body: <p>By symmetry, also 0. On its own, neither input says anything about the label.</p> },
            {
              title: 'Gain of B inside A = t',
              body: <p>Now B = f gives True and B = t gives False: both children pure, local entropy 1, so the gain of B here is 1.</p>,
            },
          ]}
        />
        <p>
          The information is in the <strong>interaction</strong>: B’s relationship with Y depends on A. A first step with no immediate benefit makes a perfect
          second step possible.
        </p>
        <Lab title="Gains at the root and one level down" purpose="Each cell of the truth table is one example; click a cell to flip its label. Compare the root gains with the gains inside a branch, with and without early stopping.">
          <XorGainLab />
        </Lab>
        <TryThis
          items={[
            'XOR without early stopping: depth 2, no training errors. Turn on “stop when the best gain is 0”: a single leaf and 2 errors out of 4.',
            'AND: the root gains are positive (0.311 each), so early stopping is harmless here.',
            'Y = A: A has gain 1 and B gain 0 at the root, and the tree never tests B.',
            'Make your own function by clicking cells. Which ones have zero gain for both inputs at the root?',
          ]}
        />
        <Callout kind="warning" title="Representation succeeded; the stopping rule failed">
          A depth-2 tree represents XOR exactly. A procedure that stops whenever every immediate gain is zero cannot discover it. That failure belongs to the
          extra stopping rule, not to the tree representation — one reason to grow first and prune afterwards (lesson 12).
        </Callout>
      </Sec>

      <Sec title="XOR in the plane">
        <p>
          With numeric features the same interaction appears as a checkerboard: class 1 in two opposite quadrants. Now the root gains are not exactly zero —
          sampling noise makes some threshold slightly better than the others — so the greedy root split is chosen by noise.
        </p>
        <Lab title="A greedy tree on quadrant data" purpose="250 noisy training points; class 1 in the top-left and bottom-right quadrants. Watch where the root split lands.">
          <DepthLab initialShape="xor" />
        </Lab>
        <TryThis
          items={[
            'Depth 1 and 2: the held-out error stays near 50%. The root cut sits near the edge of the square (about x₁ = 0.04), where a sliver of points happens to be slightly purer.',
            'Increase the depth: the tree eventually recovers the quadrants, but only after spending many extra leaves around its bad first cut.',
            'Draw new training samples. Sometimes the root lands near 0.5 and depth 2 is already good — the greedy choice is at the mercy of the sample.',
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>For the four XOR examples, what is the information gain of A at the root?</p>}
          options={[
            { text: '0', correct: true, why: 'Each branch of A still holds one True and one False.' },
            { text: '1', why: 'That is B’s gain inside a branch of A, not A’s gain at the root.' },
            { text: '0.5', why: 'Both children have entropy 1, so the expected entropy after the test is still 1.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>Which best describes ID3’s inductive bias on categorical data?</p>}
          options={[
            { text: 'A restriction bias: it can only represent some functions', why: 'Trees on categorical attributes can represent every function of them.' },
            { text: 'A preference bias: shorter trees, with informative tests near the root, found by greedy search', correct: true, why: 'The bias lies in which representable tree it picks.' },
            { text: 'No bias: it fits the data exactly', why: 'Many trees fit exactly; choosing among them is the bias.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>“Greedy” in ID3 means…</p>}
          options={[
            { text: 'it always finds the smallest consistent tree', why: 'It does not; finding that tree is NP-hard in general.' },
            { text: 'it picks the best immediate test at each node and never revisits earlier choices', correct: true, why: 'Locally best, committed, no backtracking.' },
            { text: 'it uses as many attributes as possible', why: 'It uses whichever tests score best, as few as needed.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A learner needs a preference among the many trees that fit the data. ID3’s is a preference bias for short trees with high-gain tests near the root,
        implemented greedily: best immediate test, no backtracking. XOR shows the cost — every single test has zero gain, yet two tests together are perfect —
        so “stop when gain is zero” is an extra rule that can fail, and interactions are better found by growing first and pruning later.
      </Callout>
    </>
  );
}
