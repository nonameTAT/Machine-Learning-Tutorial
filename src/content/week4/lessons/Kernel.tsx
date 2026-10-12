import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../../components/ui';
import { KernelLab } from '../labs/KernelLab';

export default function Kernel() {
  return (
    <>
      <Sec title="From fixed leaves to a moving neighbourhood">
        <p>
          A regression tree predicts at <M t="x_0" /> by averaging the targets in <M t="x_0" />’s leaf. The leaves are fixed in advance, so two nearby queries
          on either side of a boundary get unrelated predictions, and the fitted function jumps. A <strong>kernel smoother</strong> keeps the idea “predict by
          averaging nearby targets” but lets the neighbourhood <em>follow the query</em>: centre a window on <M t="x_0" />, average the targets inside it,
          possibly giving closer points more say. Week 1’s k-NN regression is a relative: it averages the k nearest targets equally.
        </p>
        <p>For a query <M t="x_0" />, give each observation a raw weight from a kernel function <M t="K" />, then normalise:</p>
        <MB t="a_i(x_0) = K\Big(\frac{\lVert X_i - x_0\rVert_2}{h}\Big), \qquad w_i(x_0) = \frac{a_i(x_0)}{\sum_{j=1}^n a_j(x_0)}, \qquad \hat f(x_0) = \sum_{i=1}^n w_i(x_0)\,Y_i." />
        <p>
          Here <M t="h > 0" /> is the <strong>bandwidth</strong>, <M t="\lVert\cdot\rVert_2" /> is Euclidean distance (absolute distance in one dimension —
          the subscript 2 names the norm; nothing is squared or doubled), and <M t="K \ge 0" /> turns a scaled distance into a weight. When the denominator is
          positive the weights sum to 1, so <M t="\hat f(x_0)" /> is a weighted average of the contributing <M t="Y_i" /> and lies between the smallest and
          largest of them. If every weight is zero the formula is undefined, and an implementation needs a fallback, such as a wider window.
        </p>
      </Sec>

      <Sec title="Two kernels, and a bandwidth convention to watch">
        <Table
          head={['Kernel', 'K(u)', 'Points with positive weight']}
          rows={[
            ['Boxcar', <M t="\mathbb 1\{|u| \le \tfrac12\}" />, <M t="|X_i - x_0| \le h/2" />],
            ['Epanechnikov', <M t="\tfrac34(1 - u^2)\,\mathbb 1\{|u| \le 1\}" />, <M t="|X_i - x_0| < h" />],
          ]}
        />
        <p>
          The boxcar gives every point inside the window the same weight. Epanechnikov gives nearby points more weight and fades to zero at the edge. With
          these definitions, <strong>the same h means different windows</strong>: the boxcar reaches <M t="h/2" />, Epanechnikov reaches <M t="h" />. To
          compare shapes over the same radius <M t="r" />, use <M t="h_{\text{box}} = 2r" /> and <M t="h_{\text{epan}} = r" />. The constant ¾ cancels when
          the weights are normalised; the factor <M t="1 - u^2" /> does not. Forgetting to normalise turns the weighted average into an unscaled sum.
        </p>
      </Sec>

      <Sec title="Reading the classic figure">
        <p>
          A well-known two-panel figure (from <em>The Elements of Statistical Learning</em> by Hastie, Tibshirani and Friedman) shows this smoother at work on
          100 points simulated from <M t="Y = \sin(4X) + \varepsilon" />, <M t="\varepsilon \sim \mathcal N(0, 1/3)" />: a nearest-neighbour (boxcar-style)
          window on the left and an Epanechnikov kernel on the right. The lab redraws it with the same colours, so you can read each element as it moves.
        </p>
        <Lab title="The kernel smoother at work" purpose="Drag across the chart to move the query x₀, switch kernels, and change the bandwidth. The colours match the figure.">
          <KernelLab />
        </Lab>
        <Table
          head={['Element', 'What it is']}
          rows={[
            ['Blue curve', <>the true, noiseless mean function <M t="f(x) = \sin(4x)" /> — unknown in practice</>],
            ['Black / grey scatter', <>the observed pairs <M t="(X_i, Y_i)" />: noisy samples around the blue curve; grey ones currently have zero weight</>],
            ['Red scatter', <>the observations in the kernel’s neighbourhood of the current <M t="x_0" />, the ones whose <M t="Y_i" /> enter the average</>],
            ['Yellow region', <>the kernel’s location, support and weight shape — rectangular for boxcar, a dome for Epanechnikov. It is <em>not</em> a confidence band</>],
            ['Horizontal red line', <>the height of the local weighted average <M t="\hat f(x_0)" />, drawn across the neighbourhood for reference</>],
            ['Red point on that line', <>the single fitted value <M t="(x_0, \hat f(x_0))" />; the vertical red line marks <M t="x_0" /></>],
            ['Green curve', <>the whole estimate <M t="\hat f" />: what you get by sliding <M t="x_0" /> across the range and recomputing the red point everywhere</>],
          ]}
        />
        <p>
          Keep the two kinds of red apart: the red <em>scatter</em> marks observations; the red <em>point</em> is their weighted summary at one query.
        </p>
        <TryThis
          items={[
            'Boxcar, x₀ = 0.5: the red points all have equal weight, and the red line sits at their plain average.',
            'Switch to Epanechnikov without touching h: the window doubles (radius h instead of h/2). Set h = 0.2 to compare the two kernels over the same radius of 0.2.',
            'Drag x₀ slowly. The boxcar’s green curve is jagged — points enter and leave the window with full weight. Epanechnikov’s is smooth, because weights fade to zero at the edge.',
            'Bandwidth: very small h gives a wiggly curve (with gaps where no point is in reach); very large h flattens the sine away. The small chart shows the distance from the truth is U-shaped in h.',
            'Move x₀ to 0 or 1. The window is one-sided there, so the average is pulled toward interior values — bias at the boundary.',
          ]}
        />
      </Sec>

      <Sec title="A three-point calculation">
        <Steps
          intro={<p>Query <M t="x_0 = 0" />; three observations at distances 0, 0.15, 0.30 with responses 1, 0, 1. Compare the kernels over the same radius 0.30.</p>}
          steps={[
            { title: 'Boxcar with h = 0.60 (radius 0.30)', body: <p>All three distances are at most 0.30, so all get weight 1: <M t="\hat f_{\text{box}} = (1 + 0 + 1)/3 = 2/3" />.</p> },
            { title: 'Epanechnikov with h = 0.30: scaled distances', body: <p><M t="u = 0,\ 0.5,\ 1" />.</p> },
            { title: 'Raw weights', body: <MB t="\tfrac34(1 - 0) = \tfrac34,\qquad \tfrac34(1 - 0.25) = \tfrac{9}{16},\qquad \tfrac34(1 - 1) = 0." /> },
            { title: 'Normalise', body: <MB t="w = \Big(\tfrac{3/4}{3/4 + 9/16},\ \tfrac{9/16}{3/4 + 9/16},\ 0\Big) = \big(\tfrac47,\ \tfrac37,\ 0\big)." /> },
            { title: 'Average', body: <MB t="\hat f_{\text{epan}} = \tfrac47 \cdot 1 + \tfrac37 \cdot 0 + 0 \cdot 1 = \tfrac47." /> },
          ]}
        />
        <p>
          Same radius, different answers: Epanechnikov gives the middle point less weight than the centre one and the far point none at all — it sits
          exactly on the boundary — while the boxcar treats all three alike.
        </p>
      </Sec>

      <Sec title="Why “linear” smoother, and how to choose h">
        <p>
          Fix the inputs, the kernel and <M t="h" />. The weights <M t="w_i(x_0)" /> then depend on the <M t="X" />’s and the query, never on the responses.
          So the prediction is <em>linear in the response vector</em>: replacing every <M t="Y_i" /> by <M t="aY_i + bZ_i" /> gives{' '}
          <M t="a\hat f_Y(x_0) + b\hat f_Z(x_0)" />. In matrix form the fitted values are <M t="\hat{\mathbf y} = W\mathbf y" /> for a smoother matrix{' '}
          <M t="W" />. The fitted <em>curve</em> need not be a straight line in <M t="x" /> at all. (A learned regression tree is not a linear smoother in this
          sense: which leaf a point shares with which others depends on the responses, through the choice of splits.)
        </p>
        <p>
          Linearity makes the noise easy to track. With independent noise of variance <M t="\sigma^2" /> and fixed weights,
        </p>
        <MB t="\operatorname{Var}\big(\hat f(x_0)\big) = \sigma^2\sum_i w_i(x_0)^2," />
        <p>
          which is <M t="\sigma^2/m" /> for a boxcar holding <M t="m" /> points. A wider window averages more points and lowers this variance, but averages
          across genuinely different values of the true function, which adds bias — Week 1’s trade-off once more, now controlled by <M t="h" />. Neither the
          smoothest curve nor the one that passes closest to every point is automatically the best predictor; choose <M t="h" /> by validation.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>With the boxcar definition above and h = 0.4, which observations get positive weight at x₀?</p>}
          options={[
            { text: 'Those within 0.2 of x₀', correct: true, why: 'K(u) = 1 for |u| ≤ ½, so |Xᵢ − x₀| ≤ h/2.' },
            { text: 'Those within 0.4 of x₀', why: 'That would be the Epanechnikov window for the same h.' },
            { text: 'Those within 0.8 of x₀', why: 'h is not a diameter to be doubled.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>In the figure, what does the yellow region represent?</p>}
          options={[
            { text: 'The kernel: where it is centred, how far it reaches and how it weights points', correct: true, why: 'Rectangle for boxcar, dome for Epanechnikov.' },
            { text: 'A confidence band for the regression function', why: 'Nothing in the figure quantifies uncertainty.' },
            { text: 'The region where the estimate is accurate', why: 'It shows which points are averaged, not how good the average is.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>Why is a kernel smoother called a linear smoother?</p>}
          options={[
            { text: 'For fixed inputs, kernel and h, the prediction is a fixed linear combination of the responses', correct: true, why: 'The weights do not depend on Y.' },
            { text: 'Its fitted curve is a straight line', why: 'The curve can be as wiggly as the data; the linearity is in Y.' },
            { text: 'It uses linear regression inside each window', why: 'That would be local linear regression, a different (though related) method.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A kernel smoother predicts at <M t="x_0" /> with a normalised weighted average of nearby responses, the neighbourhood moving with the query. The kernel
        sets the weight shape and, with the bandwidth convention, the window size: boxcar reaches h/2, Epanechnikov h. For fixed weights the estimate is
        linear in the responses, its noise variance is <M t="\sigma^2\sum_i w_i^2" />, and h trades variance (small windows) against bias (large ones).
      </Callout>
    </>
  );
}
