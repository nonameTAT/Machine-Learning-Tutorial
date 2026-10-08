import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Figure, Lab, Quiz, Sec, TryThis } from '../components/ui';
import { LossShapes, ResidualLab } from '../interactives/ResidualLab';

export default function L02Loss() {
  return (
    <>
      <Sec title="Infinitely many lines — we need a referee">
        <p>
          Draw a scatter plot and you can put infinitely many lines through it. Your eye prefers some of them, but “looks right” cannot be
          optimised. We need a single number that says how badly a candidate line fits, so that “best fit” becomes “smallest number”.
        </p>
        <p>
          The natural building block is the <strong>residual</strong> — the error of the prediction at each training point:
        </p>
        <MB t="\cres{e_j} = y_j - \hat y_j = y_j - \bx_j\T\theta." />
        <p>
          A positive residual means the model <em>under</em>-predicts. Notice the direction we measure in: <em>vertically</em>, along the <M t="y" /> axis.
          That is deliberate. We are given <M t="\bx_j" /> and asked to predict <M t="y_j" />, so the error that matters is in <M t="y" /> at that
          fixed input. Ordinary least squares does <strong>not</strong> minimise perpendicular distances to the line.
        </p>
      </Sec>

      <Sec title="Why square the residuals?">
        <p>
          The first idea — add up the residuals — fails immediately: positive and negative errors cancel. A terrible line with residuals{' '}
          <M t="(-10, +10)" /> has total 0. We need a penalty that is always non-negative. Two obvious candidates are <M t="|e|" /> and{' '}
          <M t="e^2" />.
        </p>
        <Figure caption="Squared error is gentler than absolute error for small residuals and much harsher for large ones.">
          <LossShapes />
        </Figure>
        <p>Least squares chooses the square, for three reasons that will each get a lesson of their own:</p>
        <ul>
          <li>
            <strong>It is smooth.</strong> <M t="e^2" /> is differentiable everywhere, so we can set derivatives to zero (lessons 4–5) or follow the
            gradient (lesson 6). <M t="|e|" /> has a kink at 0.
          </li>
          <li>
            <strong>It gives a closed-form answer.</strong> The total squared error is a quadratic bowl in <M t="\theta" /> with a single bottom we can
            solve for exactly.
          </li>
          <li>
            <strong>It has a probabilistic meaning.</strong> With Gaussian noise, minimising squared error is the same as maximum likelihood (lesson 7).
          </li>
        </ul>
        <p>The cost — or loss — function for <M t="m" /> observations is then the sum of squared errors:</p>
        <MB t="J(\theta) = \sum_{j=1}^{m}\Big(y_j - \sum_{i=0}^{n}\theta_i x_{ji}\Big)^2 = \sum_{j=1}^{m}(y_j - \bx_j\T\theta)^2 = (\by - X\theta)\T(\by - X\theta)." />
        <p>
          In the OLS setting this is also called the <strong>residual sum of squares</strong> (RSS) or SSE. Dividing by <M t="m" /> gives the{' '}
          <strong>mean squared error</strong>:
        </p>
        <MB t="\MSE(\theta) = \frac{1}{m}\sum_{j=1}^m (y_j - \bx_j\T\theta)^2 = \frac{1}{m}\SSE(\theta)." />
      </Sec>

      <Sec title="Explore: find the best line yourself">
        <Lab
          title="Residual playground"
          purpose="The orange segments are residuals; the shaded squares have area eⱼ², so SSE is literally the total shaded area. Adjust the line to make that area as small as you can, then compare with least squares."
        >
          <ResidualLab />
        </Lab>
        <TryThis
          items={[
            <>
              Set <M t="\theta_1 = 1" /> and <M t="\theta_0 = 1" />. This line passes through the centroid <M t="(7, 8)" />: check that{' '}
              <M t="\sum_j e_j = 0" />, yet SSE is huge. <em>Zero total residual is not a good fit.</em>
            </>,
            <>
              Minimise the shaded area by hand, then press <em>Snap to least squares</em>. The best line is <M t="\hat y = 15 - x" /> with SSE = 40, MSE = 8.
            </>,
            <>
              Press <em>Add +10 error at x = 11</em> (a transcription error). The dashed line is the old fit; snap again to see how far one
              point drags the whole line.
            </>,
            <>Drag the point at x = 11 far up or down, then drag the point at x = 7 by the same amount. Which one moves the fitted slope more, and why?</>,
          ]}
        />
      </Sec>

      <Sec title="Same minimiser, different minimum">
        <p>
          Multiplying a function by a positive constant does not change <em>where</em> its minimum is, only <em>how deep</em> it is. So
        </p>
        <MB t="\argmin_\theta \SSE(\theta) = \argmin_\theta \MSE(\theta), \qquad \text{but}\qquad \min_\theta \MSE = \tfrac{1}{m}\min_\theta \SSE." />
        <p>
          This is the precise sense in which averaging leads to the same <M t="\theta" />. Keep the distinction between{' '}
          <M t="\argmin" /> (a parameter value) and <M t="\min" /> (an objective value) sharp: it matters for gradient descent, where scaling the loss
          scales the gradient and therefore the step size (lesson 6), and for regularisation, where it changes how strong a given <M t="\lambda" /> is
          (lesson 10).
        </p>
      </Sec>

      <Sec title="Beyond one feature: a plane of best fit">
        <p>
          With two real-valued features <M t="x_1, x_2" />, the same criterion picks the “plane of best fit”: minimise the average squared{' '}
          <em>vertical</em> distance from each point to the plane. With more features it is a hyperplane. Nothing about the criterion changes — only the
          geometry of what is being fitted. Lesson 5 has a 3-D plane you can rotate.
        </p>
      </Sec>

      <Sec title="Why outliers matter">
        <p>
          A residual of 10 contributes 100 to SSE; a residual of 1 contributes 1. Squared error therefore puts enormous weight on the few largest errors,
          and the fitted line bends towards an extreme point to reduce its square, even at the cost of slightly worse fits everywhere else.
        </p>
        <p>
          This connects to a second property: at the least-squares fit (with an intercept), the residuals sum to zero,
        </p>
        <MB t="\sum_{j=1}^m (y_j - \bx_j\T\hat\theta) = 0." />
        <p>
          The line must “balance” the signed errors, so a single big positive residual must be offset by pulling the line upward. We will derive
          this identity in lesson 4 — it is the intercept’s normal equation.
        </p>
        <Callout kind="warning" title="Mechanism vs. symptom">
          The <em>cause</em> of outlier sensitivity is the squared penalty: large errors dominate the objective. The zero-sum identity holds for any
          least-squares fit with a free intercept, outlier or not; it describes how the balance is struck, not why one point gets so much say. A loss
          like <M t="|e|" /> also balances errors but grows only linearly, so it is far less sensitive.
        </Callout>
        <p>
          Points far from the centre of the <M t="x" /> range have extra leverage: moving them tilts the line around the centroid like a lever. You can
          feel this in the playground by dragging the end points versus the middle point.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l2.q1"
          q={<p>A line has residuals (−10, 10) on two points. Which statement is true?</p>}
          options={[
            { text: 'It must be the least-squares line because the residuals sum to zero.', why: 'Zero sum is necessary (with an intercept) but far from sufficient: many lines through the centroid have zero total residual.' },
            { text: 'Its SSE is 200 and its MSE is 100.', correct: true, why: '(−10)² + 10² = 200 and 200 / 2 = 100. Cancellation in the plain sum hides large errors.' },
            { text: 'Its SSE is 0.', why: 'Squares are non-negative, so SSE is zero only when every residual is zero.' },
          ]}
        />
        <Quiz
          id="l2.q2"
          q={<p>You switch the objective from SSE to MSE on a dataset with m = 50. What happens?</p>}
          options={[
            { text: 'The fitted θ changes, because the objective changed.', why: 'Dividing by a positive constant preserves the location of the minimum.' },
            { text: 'The fitted θ is the same, and the minimum objective value is 50 times smaller.', correct: true, why: 'argmin is unchanged; min MSE = (1/m) min SSE.' },
            { text: 'Both the fitted θ and the minimum value are unchanged.', why: 'The value is scaled by 1/m — only the minimiser stays the same.' },
          ]}
        />
        <Quiz
          id="l2.q3"
          q={<p>Why does least squares measure errors vertically rather than perpendicular to the line?</p>}
          options={[
            { text: 'Because vertical distances are easier to compute.', why: 'Convenience is not the reason; perpendicular distances are also computable.' },
            { text: 'Because we predict y from a given x, so the error that matters is in y at that x.', correct: true, why: 'The task treats x as given. Perpendicular distance would mix errors in x and y, which is a different problem (total least squares).' },
            { text: 'Because squared vertical distances are always smaller.', why: 'There is no such general ordering that justifies the choice.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        “Best fit” needs a referee. Least squares uses the sum (or mean) of squared vertical residuals: non-negative, smooth, and solvable. SSE and MSE
        share a minimiser but not a minimum value. The square that makes the problem tractable is also what makes the fit sensitive to outliers.
      </Callout>

      <Checklist id="loss" items={CHECKS.loss} />
    </>
  );
}
