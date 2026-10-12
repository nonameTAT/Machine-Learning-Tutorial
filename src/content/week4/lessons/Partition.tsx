import { M } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Table, TryThis } from '../../../components/ui';
import { PartitionLab } from '../labs/PartitionLab';
import { StaircaseLab } from '../labs/StaircaseLab';

export default function Partition() {
  return (
    <>
      <Sec title="Why ask several simple questions?">
        <p>
          Week 2’s linear classifier draws one boundary through the whole input space, and k-NN keeps every training example and consults its neighbours.
          A <strong>decision tree</strong> does something in between. It asks a short sequence of simple questions — “is <M t="x_1 \le 2" />?” — and each
          answer narrows down which examples the current one resembles. The questions can differ from branch to branch: once one region is settled, the tree
          stops asking about it and refines only the regions that are still mixed.
        </p>
        <p>
          The vocabulary: an <strong>internal node</strong> tests one feature, each <strong>branch</strong> leaving it is one outcome of the test, and a{' '}
          <strong>leaf</strong> holds a prediction. To predict, start at the root and follow exactly one branch at every test until a leaf is reached. A
          categorical test can have several outcomes (one per value); a numeric threshold test has two.
        </p>
      </Sec>

      <Sec title="One object, three languages">
        <p>The same tree can be read as a procedure, as a picture of the input space, or as logic. Each view answers different questions.</p>
        <Table
          head={['View', 'What the tree is', 'For the tree below']}
          rows={[
            ['Procedure', 'a sequence of tests ending in a label', <>ask <M t="x_1 \le 2" />; if not, ask <M t="x_2 \le 1" />; return a label</>],
            ['Geometry', 'a partition of the input space into regions, one per leaf', 'the first test cuts the plane vertically; the second cuts only the right half horizontally'],
            ['Logic', 'one rule per leaf; each rule is a conjunction (AND) of tests', <>the lower-right leaf is <M t="(x_1 > 2) \wedge (x_2 \le 1) \Rightarrow B" /></>],
          ]}
        />
        <Lab title="Trace a point through a tree" purpose="Drag the query point. The tree highlights the path it takes, the plane highlights its leaf’s region, and the rule for that leaf is printed.">
          <PartitionLab />
        </Lab>
        <TryThis
          items={[
            <>Put the query at (3, 0.5): two tests, prediction B. Now at (1, 3.5): one test, prediction A — the tree never asks about <M t="x_2" />.</>,
            'Move the second threshold. Only the right half of the plane changes: that test lives below the “no” branch, so it is local to that region.',
            'Read the two A leaves as rules and join them with OR. A class region is a disjunction of the conjunctions on its paths.',
          ]}
        />
        <p>
          That last point is why trees can represent boundaries no single line could. Each path is an AND of simple conditions; the region predicted as a class
          is the OR of its paths — a <em>disjunction of conjunctions</em>. Simple tests, combined this way, carve out complicated shapes.
        </p>
      </Sec>

      <Sec title="Single-feature tests make axis-parallel cuts">
        <p>
          A test such as <M t="x_1 \le t" /> cuts the space with a line (in general, a hyperplane) perpendicular to the <M t="x_1" /> axis. So with
          single-feature numeric tests, every leaf region is an <strong>axis-parallel rectangle</strong> in two dimensions — possibly unbounded — and a
          hyperrectangle in more. A diagonal boundary is therefore something a tree can only approximate, with a staircase of small rectangles.
        </p>
        <Lab title="Approximating a diagonal" purpose="The true classes are separated by the line x₂ = x₁. Grow the tree one level at a time and watch the staircase form.">
          <StaircaseLab />
        </Lab>
        <TryThis
          items={[
            'At depth 1 the best a single cut can do is split the square in half. Count the leaves as you deepen the tree: they roughly double per level at first.',
            'From depth 6 nothing changes: every leaf is pure on the training data, yet about 6% of new points are still misclassified. The steps can only sit where training points showed the class change.',
            'Switch to “one oblique test”. A test of the form a·x₁ + b·x₂ ≤ c expresses the diagonal with a single split — more expressive per test, but much harder to search for.',
          ]}
        />
      </Sec>

      <Sec title="Costs and stability">
        <p>
          Prediction is cheap: the time is proportional to the number of tests on one path, not to the size of the training set (contrast k-NN). Small trees
          are easy to inspect and explain. Large trees lose that advantage, and they are <strong>unstable</strong>: a small change in the training sample can
          change an early split, and everything below that split changes with it. Lesson 10 connects this to high variance.
        </p>
        <Callout kind="warning" title="A leaf describes a region, not an example">
          A leaf predicts the same label for every input that reaches it, including inputs unlike any training example. The rectangle is what the tree has
          learned; the training points inside it are only the evidence.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>For the lab’s tree (root x₁ ≤ 2, then x₂ ≤ 1 on the right), how is the query (1, 3.5) classified?</p>}
          options={[
            { text: 'A, after one test; x₂ is never examined', correct: true, why: 'x₁ = 1 ≤ 2 sends it straight to a leaf. A feature can matter in one region and be irrelevant in another.' },
            { text: 'A, after testing both x₁ and x₂', why: 'The x₂ test lives only under the “no” branch of the root.' },
            { text: 'B, because x₂ = 3.5 > 1', why: 'The x₂ test is never reached for this input.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>With tests of the form x_j ≤ t only, what shape is every leaf region in two dimensions?</p>}
          options={[
            { text: 'An axis-parallel rectangle, possibly unbounded', correct: true, why: 'Each test bounds one coordinate; a path intersects such bounds.' },
            { text: 'Any convex polygon', why: 'Only edges parallel to the axes can arise from single-feature thresholds.' },
            { text: 'A half-plane at any angle', why: 'That needs a test on a combination of features, an oblique test.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>In logical terms, the set of inputs a tree assigns to one class is…</p>}
          options={[
            { text: 'a conjunction of tests', why: 'One path is a conjunction; a class usually has several paths.' },
            { text: 'a disjunction (OR) of conjunctions (ANDs), one conjunction per leaf of that class', correct: true, why: 'Each leaf is an AND of the tests on its path; the class is the OR of its leaves.' },
            { text: 'a single threshold on the most important feature', why: 'That is a tree of depth 1, a special case.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A decision tree is a partition of the input space built from simple tests: a procedure (follow the answers), a picture (one region per leaf) and a set
        of rules (one conjunction per leaf). Single-feature tests give axis-parallel regions, so diagonal boundaries need staircases — and because each
        question is asked only where it matters, a tree adapts its complexity to the region.
      </Callout>
    </>
  );
}
