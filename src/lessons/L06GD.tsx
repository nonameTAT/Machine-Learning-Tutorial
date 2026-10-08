import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../components/ui';
import { GDLab } from '../interactives/GDLab';

export default function L06GD() {
  return (
    <>
      <Sec title="Why iterate when there is a formula?">
        <p>
          Lesson 5 solved least squares exactly. So why learn an iterative method? Three reasons. Solving the normal equations costs roughly{' '}
          <M t="O(mn^2 + n^3)" />, which becomes expensive with very many features. Most other losses you will meet (logistic regression, neural
          networks) have <em>no</em> closed-form minimiser. And data may arrive in a stream, too large to hold at once. Gradient descent needs only one
          thing: the ability to compute the slope of the loss at the current point.
        </p>
        <Callout kind="intuition">
          You are on a foggy hillside and want the valley floor. You cannot see the valley, but you can feel which way the ground slopes under your feet.
          Take a step downhill; feel again; repeat. The gradient is “which way is up, and how steeply”; the learning rate is your stride length.
        </Callout>
      </Sec>

      <Sec title="The update rule">
        <p>Starting from some <M t="\theta^{(0)}" />, repeat:</p>
        <MB t="\theta_i^{(t+1)} := \theta_i^{(t)} - \alpha\,\frac{\partial}{\partial\theta_i}J(\theta^{(t)}) \qquad\text{for every } i, \qquad\text{i.e.}\qquad \theta^{(t+1)} = \theta^{(t)} - \alpha\nabla J(\theta^{(t)})." />
        <p>
          <M t="\alpha > 0" /> is the <strong>learning rate</strong> (step size). Why the minus sign? The gradient points in the direction of steepest{' '}
          <em>increase</em>; for a small enough step, moving against it decreases <M t="J" /> (to first order,{' '}
          <M t="J(\theta - \alpha\nabla J) \approx J(\theta) - \alpha\|\nabla J\|^2" />).
        </p>
        <Callout kind="warning" title="Update all coordinates simultaneously">
          Compute the whole gradient from the <em>old</em> <M t="\theta^{(t)}" />, then update every component. Overwriting <M t="\theta_0" /> and then
          using the new value to compute <M t="\theta_1" />’s update is a different (and here unintended) algorithm.
        </Callout>
      </Sec>

      <Sec title="Working out the gradient">
        <Steps
          intro={
            <p>
              Start with a single example <M t="j" />. Its loss is <M t="(y_j - h_\theta(\bx_j))^2" /> with{' '}
              <M t="h_\theta(\bx_j) = \sum_{i=0}^{n}x_{ji}\theta_i = \bx_j\T\theta" /> and <M t="x_{j0} = 1" />.
            </p>
          }
          steps={[
            {
              title: 'Chain rule on one squared residual',
              body: <MB t="\frac{\partial}{\partial\theta_i}\big(y_j - h_\theta(\bx_j)\big)^2 = 2\big(y_j - h_\theta(\bx_j)\big)\cdot\big(-x_{ji}\big) = -2\big(y_j - h_\theta(\bx_j)\big)x_{ji}." />,
            },
            {
              title: 'Plug into the update: the LMS rule',
              body: (
                <>
                  <MB t="\theta_i := \theta_i + 2\alpha\big(y_j - h_\theta(\bx_j)\big)x_{ji} \qquad (\text{every } i)." />
                  <p>
                    This is the <strong>least mean squares</strong> (LMS) rule. Read it: nudge each weight in proportion to the error times the input that
                    weight multiplies. Positive error (under-prediction) with positive <M t="x_{ji}" /> → increase <M t="\theta_i" />.
                  </p>
                </>
              ),
            },
            {
              title: 'Average over all m examples: batch gradient descent',
              body: (
                <>
                  <MB t="J(\theta) = \frac1m\sum_{j=1}^m (y_j - \bx_j\T\theta)^2 \;\Rightarrow\; \theta_i^{(t+1)} = \theta_i^{(t)} + \alpha\,\frac2m\sum_{j=1}^m\big(y_j - h_{\theta^{(t)}}(\bx_j)\big)x_{ji}." />
                  <MB t="\text{Matrix form:}\qquad \theta^{(t+1)} = \theta^{(t)} + \frac{2\alpha}{m}X\T\big(\by - X\theta^{(t)}\big)." />
                  <p>
                    For the intercept (<M t="x_{j0} = 1" />) the update is proportional to the <em>mean residual</em> — the same quantity the intercept’s
                    normal equation sets to zero.
                  </p>
                </>
              ),
            },
            {
              title: 'Or update after every example: stochastic gradient descent',
              body: (
                <>
                  <MB t="\text{for } j = 1 \text{ to } m:\quad \theta_i := \theta_i + 2\alpha\big(y_j - h_\theta(\bx_j)\big)x_{ji} \quad(\text{every } i)" />
                  <p>Repeat the loop over the data until convergence. Each update uses one example’s gradient as a cheap, noisy stand-in for the full gradient. Later examples see the updated θ.</p>
                </>
              ),
            },
          ]}
        />
      </Sec>

      <Sec title="Worked example: one step of each">
        <p>
          Data <M t="(x, y) = (0, 1), (2, 3)" />, start at <M t="\theta = (0, 0)\T" />, <M t="\alpha = 0.1" />, loss = MSE.
        </p>
        <MB t="X = \begin{bmatrix}1 & 0\\ 1 & 2\end{bmatrix},\quad \be = \by - X\theta = \begin{bmatrix}1\\ 3\end{bmatrix},\quad \nabla J = -\frac{2}{2}X\T\be = -\begin{bmatrix}1 + 3\\ 0 + 6\end{bmatrix} = \begin{bmatrix}-4\\ -6\end{bmatrix}." />
        <MB t="\text{Batch step: } \theta^{(1)} = \begin{bmatrix}0\\0\end{bmatrix} - 0.1\begin{bmatrix}-4\\-6\end{bmatrix} = \begin{bmatrix}0.4\\ 0.6\end{bmatrix}." />
        <p>
          New predictions <M t="(0.4, 1.6)" />, so the MSE falls from <M t="(1^2 + 3^2)/2 = 5" /> to <M t="(0.6^2 + 1.4^2)/2 = 1.16" />. Better, not yet
          optimal (the optimum fits both points exactly: <M t="\hat y = 1 + x" />).
        </p>
        <p>
          <strong>SGD step on the first example only</strong>: <M t="\theta + 2(0.1)(1 - 0)(1, 0)\T = (0.2, 0)\T" />. Different, because it used one
          example instead of the average of both.
        </p>
      </Sec>

      <Sec title="Explore: learning rate, conditioning, and noise">
        <Lab
          title="Gradient descent on the running example"
          purpose="The left panel is the loss surface seen from above: each ellipse is a set of (θ₀, θ₁) with equal MSE. Watch the path, the fitted line, and the loss gap together."
        >
          <GDLab />
        </Lab>
        <TryThis
          items={[
            <>
              Batch, α = 0.01: press Run. The path drops quickly into the long narrow valley, then crawls along it. This is an <em>ill-conditioned</em>{' '}
              bowl: eigenvalue ratio ≈ 470.
            </>,
            <>
              Raise α just past the displayed limit (≈ 0.0176). The iterates zig-zag across the valley with growing amplitude and diverge — even though the
              loss is a perfectly nice convex bowl.
            </>,
            <>
              Tick “Centre x first”. The contours become axis-aligned and much rounder (ratio 6.8); the stable α limit jumps to ≈ 0.147 and convergence
              takes a handful of steps. Same model, same predictions — only the parametrisation changed.
            </>,
            <>
              Switch to stochastic GD. The path jitters, because each update follows one example. With a fixed α it never settles exactly: at the minimum
              the <em>average</em> gradient is zero, but each example’s own gradient is not.
            </>,
            <>Click anywhere on the contour plot to restart from there. Does the start point matter for where you end up? (Convex loss: no.)</>,
          ]}
        />
      </Sec>

      <Sec title="Choosing the learning rate">
        <ul>
          <li>
            <strong>Initialisation:</strong> start anywhere (e.g. random). For least squares the loss is convex, so every convergent run reaches the
            same minimum.
          </li>
          <li>
            <strong>Too small</strong> an <M t="\alpha" />: correct direction but painfully slow. <strong>Too large</strong>: overshoot, oscillate, possibly
            diverge.
          </li>
        </ul>
        <p>
          For the quadratic MSE loss we can say exactly where the boundary is. Write <M t="A = X\T X/m" />. Then{' '}
          <M t="\theta^{(t+1)} - \hat\theta = (I - 2\alpha A)(\theta^{(t)} - \hat\theta)" />, so the error shrinks along each eigen-direction of{' '}
          <M t="A" /> by a factor <M t="|1 - 2\alpha\lambda_k|" />. Convergence needs every factor below 1:
        </p>
        <MB t="0 < \alpha < \frac{1}{\lambda_{\max}(A)}, \qquad \text{and the slowest direction shrinks by } |1 - 2\alpha\lambda_{\min}| \text{ per step.}" />
        <p>
          A large ratio <M t="\lambda_{\max}/\lambda_{\min}" /> (the condition number) forces a small <M t="\alpha" /> for stability <em>and</em> makes
          the slow direction slow. Centring and scaling features reduce that ratio — a practical reason the pipeline includes feature scaling.
        </p>
      </Sec>

      <Sec title="Batch versus stochastic">
        <Table
          head={['', 'Batch GD', 'Stochastic GD (LMS)']}
          rows={[
            ['One update uses', 'all m examples', 'one example'],
            ['Cost per update', <M t="O(m(n+1))" />, <M t="O(n+1)" />],
            ['Updates per pass over data', '1', 'm'],
            ['Path', 'smooth, deterministic', 'noisy, depends on example order'],
            ['Near the minimum (fixed α)', 'converges', 'keeps fluctuating around it'],
          ]}
        />
        <p>
          In short: SGD is much less costly than batch gradient descent, but it may never converge exactly to the minimum. Be
          precise about “less costly”: it is cheaper <em>per update</em>, and often makes useful progress before batch GD has finished its first full
          pass. In practice the learning rate is decreased over time (or mini-batches are used) so that SGD settles down.
        </p>
        <Callout kind="note" title="Watch the loss scaling">
          If the loss is <M t="\SSE" /> instead of <M t="\MSE" />, the gradient is <M t="m" /> times larger, so the same numerical <M t="\alpha" /> takes{' '}
          <M t="m" />-times bigger steps. Some texts use <M t="\tfrac{1}{2m}\SSE" /> to remove the 2. Always differentiate the loss actually written down.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l6.q1"
          q={<p>The objective is changed from MSE to MSE/2, with the same α. What changes?</p>}
          options={[
            { text: 'The minimiser moves.', why: 'Scaling by a positive constant does not move the minimiser.' },
            { text: 'The gradient halves, so each step is half as long; the minimiser is the same.', correct: true, why: '∇(J/2) = ∇J/2. Equivalent to halving α on the original loss.' },
            { text: 'Nothing changes at all.', why: 'The step sizes change, because the gradient is scaled.' },
          ]}
        />
        <Quiz
          id="l6.q2"
          q={<p>Batch GD on a least-squares problem oscillates with growing amplitude. The most likely fix is…</p>}
          options={[
            { text: 'Increase α so it escapes faster.', why: 'Larger steps make overshoot worse.' },
            { text: 'Decrease α (and/or rescale the features).', correct: true, why: 'Divergence on a convex quadratic means α ≥ 1/λmax; reduce α or improve conditioning.' },
            { text: 'Change the initialisation.', why: 'For a convex quadratic the start point does not affect whether a fixed α converges.' },
          ]}
        />
        <Quiz
          id="l6.q3"
          q={<p>In the SGD rule <M t="\theta_i := \theta_i + 2\alpha(y_j - h_\theta(\bx_j))x_{ji}" />, an example has a large positive residual and <M t="x_{j1} < 0" />. What happens to <M t="\theta_1" />?</p>}
          options={[
            { text: 'It increases.', why: 'The update is 2α · (positive) · (negative) < 0.' },
            { text: 'It decreases.', correct: true, why: 'Lowering θ₁ raises θ₁xⱼ₁ when xⱼ₁ < 0, which raises the prediction — exactly what an under-prediction needs.' },
            { text: 'It is unchanged.', why: 'Only xⱼ₁ = 0 or a zero residual would leave θ₁ unchanged.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Gradient descent repeatedly steps against the gradient: <M t="\theta \leftarrow \theta - \alpha\nabla J" />. For MSE,{' '}
        <M t="\nabla J = -\tfrac2m X\T(\by - X\theta)" />. Batch GD averages all examples per update; SGD (LMS) uses one at a time — cheaper and noisier.
        The learning rate trades speed against stability, and for least squares the stability limit is set by the largest eigenvalue of{' '}
        <M t="X\T X/m" />, which feature scaling improves.
      </Callout>

      <Checklist id="gd" items={CHECKS.gd} />
    </>
  );
}
