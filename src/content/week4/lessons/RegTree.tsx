import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, TryThis } from '../../../components/ui';
import { MeanLeafLab } from '../labs/MeanLeafLab';
import { RegTreeLab } from '../labs/RegTreeLab';

export default function RegTree() {
  return (
    <>
      <Sec title="Keep the partition, change the output">
        <p>
          Nothing about partitioning the input space depends on the label being a class. If the target is a number — a price, a temperature — a tree can
          still split the inputs into regions; each leaf now predicts a <em>number</em>, the same for every input in its region. Two questions follow: which
          number should a leaf predict, and how should splits be chosen? This lesson answers the first.
        </p>
        <p>
          Why bother, when Week 1 already fits lines? Think of a drug that does almost nothing at low doses, works very well in a middle range and loses
          effect at high doses. No straight line follows that, but a few thresholds on dosage — each region predicting its own average effectiveness — do.
          With several inputs, some numeric and some categorical, the same recipe still applies unchanged.
        </p>
      </Sec>

      <Sec title="Under squared error, a leaf predicts the mean">
        <p>
          A leaf receives targets <M t="y_1, \dots, y_m" /> and must predict one constant <M t="c" /> for all of them. With squared error the total loss is
        </p>
        <MB t="L(c) = \sum_{i=1}^m (y_i - c)^2." />
        <Steps
          steps={[
            { title: 'Differentiate', body: <MB t="L'(c) = -2\sum_{i=1}^m (y_i - c) = 2m\,(c - \bar y), \qquad \bar y = \tfrac1m \textstyle\sum_i y_i." /> },
            { title: 'Set to zero', body: <p><M t="L'(c) = 0 \iff c = \bar y" />.</p> },
            { title: 'Check it is a minimum', body: <p><M t="L''(c) = 2m > 0" /> for a non-empty leaf, so <M t="\bar y" /> is the unique minimiser.</p> },
            {
              title: 'A second proof, without calculus',
              body: (
                <>
                  <p>Write <M t="y_i - c = (y_i - \bar y) + (\bar y - c)" />, square and sum. The cross term is <M t="2(\bar y - c)\sum_i (y_i - \bar y) = 0" />, leaving</p>
                  <MB t="\sum_i (y_i - c)^2 = \sum_i (y_i - \bar y)^2 + m\,(c - \bar y)^2." />
                  <p>The second term is never negative and vanishes only at <M t="c = \bar y" />: any other constant adds exactly <M t="m(c - \bar y)^2" />.</p>
                </>
              ),
            },
          ]}
        />
        <Lab title="The best constant for a leaf" purpose="Slide the constant prediction c. Left: the residuals; right: the total loss as a function of c, with its minimum.">
          <MeanLeafLab />
        </Lab>
        <TryThis
          items={[
            'Targets 1, 2, 2: the minimum is at 5/3. Check the decomposition line: the loss at any c is the loss at the mean plus 3(c − 5/3)².',
            'Add the outlier (1, 2, 2, 3, 14): the mean is dragged to 4.4, far from most of the targets.',
            'Switch to absolute error: the loss becomes piecewise linear and its minimum moves to the median, 2 — much less affected by the outlier (Week 1’s loss functions again).',
          ]}
        />
        <p>
          At its optimum, the leaf’s average squared error is <M t="\tfrac1m\sum_i (y_i - \bar y)^2" />: the variance of the leaf’s targets with
          denominator <M t="m" />. The unbiased sample variance divides by <M t="m - 1" />; that answers a different question (estimating a population
          variance) and is not the training objective here.
        </p>
      </Sec>

      <Sec title="The shape of a regression tree">
        <p>A regression tree with leaf regions <M t="R_1, \dots, R_L" /> and leaf means <M t="\bar y_\ell" /> computes</p>
        <MB t="\hat f(x) = \sum_{\ell=1}^{L} \bar y_\ell\;\mathbb{1}\{x \in R_\ell\}," />
        <p>
          a <strong>piecewise-constant</strong> function. The partition is adaptive — steps go where the data need them — but within a leaf the prediction is
          flat. That suits abrupt changes and produces staircases on smooth trends.
        </p>
        <Lab title="A regression tree on a smooth curve" purpose="100 noisy observations of y = 0.3 cos x + 0.4 ln(10x), all with 1 ≤ x ≤ 10. Grow the tree and compare training and test error; look at the shaded regions outside the data.">
          <RegTreeLab />
        </Lab>
        <TryThis
          items={[
            'Depth 0 is a single leaf: the overall mean. Each extra level can double the number of steps.',
            'Test MSE is lowest around depth 4 here. By depth 8 the tree has around 70 leaves, chases individual noisy points, and its training MSE falls far below the noise variance σ² = 0.04 — a sure sign of overfitting.',
            'Look beyond x = 10. The curve keeps rising, but the tree predicts the constant of its last leaf forever: a constant-leaf tree cannot extrapolate a trend.',
            'Raise the minimum leaf size to 10: deep trees can no longer isolate single points, and the test curve flattens.',
          ]}
        />
        <Callout kind="warning" title="Two limitations worth stating in an exam">
          Splitting on <M t="x" /> does not fit a slope inside a leaf — that needs a model tree (lesson 16). And a distant input still receives the constant
          of whichever terminal region it falls in, however far from the data it is.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>A leaf receives targets 1, 2 and 2. Under squared error, what should it predict?</p>}
          options={[
            { text: '5/3', correct: true, why: 'The mean minimises the sum of squared errors.' },
            { text: '2', why: 'The median (and mode) — the minimiser for absolute error, not squared error.' },
            { text: '1.5', why: 'The midrange minimises the largest error, not the sum of squares.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>A regression tree trained on inputs between 1 and 10 is asked for a prediction at x = 50. What does it return?</p>}
          options={[
            { text: 'The mean of the leaf whose region contains x = 50 — the rightmost leaf', correct: true, why: 'Leaf regions extend to infinity; predictions are constant there.' },
            { text: 'An extrapolation of the trend in the data', why: 'Constant leaves cannot extend a trend.' },
            { text: 'Nothing: it refuses to predict outside the data', why: 'Every input falls in some leaf.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>The training MSE of a leaf at its optimum equals…</p>}
          options={[
            { text: 'the variance of its targets with denominator m', correct: true, why: 'Average squared deviation from the mean.' },
            { text: 'the sample variance with denominator m − 1', why: 'That estimator answers a different question.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A regression tree keeps the partition and changes the output: each leaf predicts a constant, and under squared error the best constant is the mean of
        the leaf’s targets — by calculus or by the identity <M t="\sum(y - c)^2 = \sum(y - \bar y)^2 + m(c - \bar y)^2" />. The result is a piecewise-constant
        function: adaptive, step-shaped, and unable to extrapolate.
      </Callout>
    </>
  );
}
