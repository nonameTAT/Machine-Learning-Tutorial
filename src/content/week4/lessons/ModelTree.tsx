import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Table, TryThis } from '../../../components/ui';
import { ModelTreeLab } from '../labs/ModelTreeLab';

export default function ModelTree() {
  return (
    <>
      <Sec title="Why change what a leaf predicts?">
        <p>
          A regression tree predicts a constant in every region. If the target rises steadily inside a region, the constant throws that trend away, and the
          tree has to spend many extra leaves building a staircase. A <strong>model tree</strong> keeps the partition but fits a small model in each leaf —
          usually a linear regression:
        </p>
        <MB t="\hat f(x) = \beta_{\ell,0} + \sum_j \beta_{\ell,j}\,x_j \qquad \text{for } x \text{ in leaf } \ell." />
        <p>
          The same feature can do two jobs: decide which leaf an input reaches, and appear in that leaf’s equation. The tree handles changes of regime; the
          local lines handle trends within a regime.
        </p>
      </Sec>

      <Sec title="The cosine example">
        <p>
          Take <M t="y = \cos(\pi x)" /> on <M t="[-1, 1]" />: up from −1 to 1 and back down. With points spread symmetrically, the best single
          least-squares line is flat. The slope is zero because the data are symmetric about <M t="x = 0" /> (every rise on the left is mirrored by a fall on
          the right), and the intercept is the mean of <M t="y" />, which is essentially zero. One line explains nothing.
        </p>
        <p>
          Split at 0 and fit a line on each side, and the picture changes completely: two lines close to <M t="2x + 1" /> on the left and{' '}
          <M t="-2x + 1" /> on the right (the lines joining the ends to the peak; the exact least-squares lines differ slightly). One split, two leaves,
          almost all the shape captured.
        </p>
        <Lab title="One split: constants or lines in the leaves?" purpose="41 evenly spaced points from cos(πx). Move the split and switch the leaf model. The right chart scores every possible split point in two different ways.">
          <ModelTreeLab />
        </Lab>
        <TryThis
          items={[
            'Linear leaves, split near 0: the total squared error falls from about 21 (one flat line) to about 0.34.',
            'Constant leaves: the best single split still leaves about 15 — two constants cannot follow a rise and a fall.',
            'Look at the right chart. The standard-deviation reduction (amber) is nearly zero at s = 0 and peaks near ±0.63, while the error of linear leaves (teal) is best exactly at 0. The two criteria want different splits.',
            'Add noise: the curves get rougher, but the disagreement remains.',
          ]}
        />
      </Sec>

      <Sec title="Growing and pruning a model tree">
        <p>The classic model-tree learner (M5) chooses splits by <strong>standard deviation reduction</strong>:</p>
        <MB t="\operatorname{SDR} = \operatorname{sd}(S) - \sum_v \frac{|S_v|}{|S|}\,\operatorname{sd}(S_v)," />
        <p>
          the largest reduction wins. It uses standard deviations, not variances. Because a square root is not linear, SDR need not rank candidates the same
          way as the MSE reduction of a regression tree. Growth stops when a node has too few examples or its targets’ standard deviation is small relative
          to the whole training set’s (the exact thresholds are design choices). Afterwards a linear model is fitted at each node, terms that do not justify
          their complexity are dropped, and a subtree is replaced by its node’s linear model when that is estimated to predict at least as well.
        </p>
        <Callout kind="intuition" title="Why SDR misses the cosine split">
          SDR asks how much a split reduces the <em>spread of the targets</em>. Split the symmetric cosine at 0 and each half contains the same y values as
          the whole — the same spread — so SDR is almost exactly zero there. But linear leaves do not care about the spread of y; they care about the
          residuals around a fitted line, and those are tiny at s = 0. SDR is the right question for constant leaves and only a proxy for linear ones. It
          needs nothing but running sums, whereas scoring every candidate by fitted lines needs a regression per candidate; the pruning stage, which does fit
          the lines, partly repairs the mismatch.
        </Callout>
      </Sec>

      <Sec title="Categorical predictors inside a linear leaf">
        <p>A leaf’s linear model needs numbers, so categorical predictors must be encoded — and the encoding is an assumption.</p>
        <Table
          head={['Encoding', 'What it does', 'When it fits']}
          rows={[
            ['One-hot', 'one 0/1 indicator column per category', 'unordered categories; each gets its own shift'],
            ['Integer codes', 'categories mapped to 1, 2, 3, …', 'only if the order and the equal spacing mean something'],
            ['Binary encoding', 'the integer code written in bits, one column per bit', 'many categories, fewer columns than one-hot'],
            ['Hashing', 'categories hashed into a fixed number of columns', 'very many categories; different categories can collide'],
          ]}
        />
        <p>
          Integer-coding the organ models as A100 = 1, B3 = 2, … would tell a linear leaf that B3 lies “between” A100 and E112 and that the gaps are equal
          — structure that does not exist.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>For evenly spaced points of y = cos(πx) on [−1, 1], what is the least-squares line?</p>}
          options={[
            { text: 'Essentially y = 0: zero slope by symmetry and zero mean', correct: true, why: 'Every rise on the left is mirrored by a fall on the right.' },
            { text: 'y = 1 − 2|x|', why: 'That is not a line; it is what two linear leaves approximate.' },
            { text: 'A line through (−1, −1) and (1, −1)', why: 'Those points are on the curve, but the least-squares line must balance all the residuals.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>Why is the standard-deviation reduction almost zero for a split at x = 0 in the symmetric cosine data?</p>}
          options={[
            { text: 'Each half contains the same multiset of y values as the whole, so its spread is unchanged', correct: true, why: 'SDR only sees the spread of targets, not trends within a leaf.' },
            { text: 'Because the split is in the middle', why: 'A middle split of other data can have a large SDR.' },
            { text: 'Because linear leaves fit the halves badly', why: 'They fit them very well; SDR simply does not look at fitted lines.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>Why is integer-coding unordered categories risky inside a linear leaf?</p>}
          options={[
            { text: 'It imposes an order and equal spacing that the categories do not have', correct: true, why: 'The coefficient then treats category 3 as “one more” than category 2.' },
            { text: 'Linear models cannot use integers', why: 'They can; the problem is the meaning of the numbers.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A model tree keeps the adaptive partition and fits a linear model in each leaf, so trends inside a region cost no extra leaves — one split turns the
        useless flat line for cos(πx) into an almost perfect fit. M5 grows with standard-deviation reduction, which measures spread of the targets and can miss
        splits that linear leaves would love; pruning with fitted models partly corrects this. Encode categorical predictors deliberately.
      </Callout>
    </>
  );
}
