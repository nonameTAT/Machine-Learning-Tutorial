import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { LogisticGDLab } from '../../interactives/week2/LogisticGDLab';
import { CHECKS2 } from './checks';

export default function L05LogFit() {
  return (
    <>
      <Sec title="No closed form, so descend">
        <p>
          In Week 1, setting the gradient of the squared loss to zero gave linear equations, <M t="X\T X\theta = X\T\by" />, which we could solve
          directly. The logistic loss is convex but has <strong>no closed-form solution</strong>, so we use gradient descent. The reason
          will be visible once we have the gradient: the probabilities inside it depend nonlinearly on β.
        </p>
      </Sec>

      <Sec title="The gradient, one observation at a time">
        <Steps
          intro={<p>Differentiate one observation’s loss first, then sum. Each step is short; predict it before you click.</p>}
          steps={[
            {
              title: 'The sigmoid’s derivative',
              body: (
                <>
                  <MB t="\sigma(z) = (1 + e^{-z})^{-1} \;\Rightarrow\; \sigma'(z) = \frac{e^{-z}}{(1 + e^{-z})^2} = \sigma(z)\big(1 - \sigma(z)\big)." />
                  <p>
                    (Write <M t="\frac{e^{-z}}{1 + e^{-z}} = 1 - \sigma(z)" />.)
                  </p>
                </>
              ),
            },
            {
              title: 'One observation, differentiated with respect to its score',
              body: (
                <>
                  <MB t="L = -y\log p - (1 - y)\log(1 - p), \qquad p = \sigma(z)." />
                  <MB t="\frac{\partial L}{\partial z} = \Big(-\frac yp + \frac{1 - y}{1 - p}\Big)\,p(1 - p) = -y(1 - p) + (1 - y)p = p - y." />
                  <p>The sigmoid’s derivative cancels the denominators: what remains is just “predicted minus actual”.</p>
                </>
              ),
            },
            {
              title: 'Chain rule to the coefficients',
              body: (
                <p>
                  Since <M t="z = \bxt\T\beta" />, <M t="\partial z/\partial\beta = \bxt" />, so <M t="\nabla_\beta L = (p - y)\,\bxt" />. The intercept uses the
                  augmented coordinate 1.
                </p>
              ),
            },
            {
              title: 'Average over the data',
              body: (
                <>
                  <MB t="\nabla J(\beta) = \frac1m\sum_{j=1}^m (p_j - y_j)\,\bxt_j = \frac1m X\T(\bp - \by)." />
                  <MB t="\boxed{\;\beta_{\text{new}} = \beta_{\text{old}} - \frac\alpha m X\T(\bp - \by)\;}" />
                  <p>
                    Here <M t="\bp" /> holds the probabilities computed with the <em>old</em> β, and all components update simultaneously. Unlike Week 1’s MSE
                    convention there is no factor 2.
                  </p>
                </>
              ),
            },
          ]}
        />
        <Callout kind="note" title="Why no closed form">
          Setting the gradient to zero gives <M t="X\T\big(\sigma(X\beta) - \by\big) = \mathbf 0" /> with σ applied entry by entry. The unknown β sits
          inside a nonlinear function, so this is not <M t="X\T X\beta = X\T\by" /> and cannot be solved by one matrix inverse.
        </Callout>
        <Callout kind="example" title="One update by hand">
          Data <M t="(x, y) = (0, 0), (1, 1)" />, start at <M t="\beta = (0, 0)\T" />, so both probabilities are 0.5:
          <MB t="X = \begin{pmatrix}1 & 0\\ 1 & 1\end{pmatrix}, \quad \bp - \by = \begin{pmatrix}0.5\\ -0.5\end{pmatrix}, \quad \nabla J = \frac12 X\T(\bp - \by) = \begin{pmatrix}0\\ -0.25\end{pmatrix}." />
          With <M t="\alpha = 1" />, <M t="\beta_{\text{new}} = (0, 0.25)\T" />. The probabilities become 0.5 and <M t="\sigma(0.25) \approx 0.5622" />, and
          the average loss falls from <M t="\log 2 \approx 0.6931" /> to about 0.6345. One improving step — not convergence.
        </Callout>
        <Lab
          title="Gradient descent on the log loss"
          purpose="Left: contours of J over (β₀, β₁) with the descent path. Right: the probability curve for the current β. Start with the worked example and press “1 step”."
        >
          <LogisticGDLab />
        </Lab>
        <TryThis
          items={[
            'Worked example: one step with α = 1 lands on (0, 0.25), exactly as computed above. Keep stepping: does it ever stop?',
            '“Overlapping classes”: press Run. The path converges to a finite point where ‖∇J‖ → 0. Click elsewhere to restart — it reaches the same point (convexity).',
            'Raise α to 10. On this convex loss, too large a step makes the path overshoot and zig-zag; small α is slow but steady.',
            '“Separable classes”: press Run and watch β₁. The loss keeps decreasing towards 0, but there is no finite minimiser.',
          ]}
        />
      </Sec>

      <Sec title="What convexity does — and does not — guarantee">
        <p>
          For one observation, <M t="\partial^2 L/\partial z^2 = p(1 - p) \ge 0" />, so the loss is convex in its score; the score is linear in β, and a
          convex function of a linear map is convex; averages of convex functions are convex. Hence <M t="J" /> is convex in β, and{' '}
          <strong>any stationary point is a global minimiser</strong> — gradient descent cannot be trapped in a bad local minimum: there is a single
          global minimum value.
        </p>
        <Callout kind="warning" title="Convex ≠ exactly one finite minimiser">
          <ul>
            <li>
              <strong>Duplicate feature columns</strong> let you shift weight between them without changing any score: many β give the same minimum.
            </li>
            <li>
              <strong>Perfectly separable data</strong> has no finite minimiser. For <M t="(x, y) = (-1, 0), (1, 1)" /> with score <M t="bx" />, the
              average loss is <M t="\log(1 + e^{-b})" />, which decreases towards 0 as <M t="b \to \infty" /> but never reaches it. Regularisation (Week
              1) restores a finite optimum.
            </li>
          </ul>
        </Callout>
      </Sec>

      <Sec title="Strengths and weaknesses">
        <Table
          head={['Pros', 'Cons']}
          rows={[
            ['relatively easy to implement', 'binary classifier as stated (multiclass needs an extension)'],
            ['easy to interpret: coefficients act on the log-odds', 'linear boundary — curved boundaries need feature transformations'],
            ['fast to train, very fast to predict (a dot product and a sigmoid)', 'can overfit with many features (remedy: regularisation)'],
            ['gives probabilistic predictions', 'correlated inputs make coefficients unstable; sensitive to outliers'],
          ]}
        />
        <p className="small muted">
          A probabilistic output is not automatically a <em>well-calibrated</em> probability, and cheap fitting does not guarantee generalisation —
          that is what evaluation (lessons 6–9) is for.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l5.q1"
          q={<p>A positive example (y = 1) currently has p = 0.2. What is ∂L/∂z and which way does gradient descent push its score?</p>}
          options={[
            { text: '−0.8; the score increases', correct: true, why: 'p − y = −0.8. Descent moves against the gradient, raising z and therefore p.' },
            { text: '0.8; the score decreases', why: 'The sign is p − y, which is negative here.' },
            { text: '0.16; the score increases', why: '0.16 = p(1 − p) is σ′(z), not the loss derivative.' },
          ]}
        />
        <Quiz
          id="w2.l5.q2"
          q={<p>Data (0, 1), (2, 0), β = (0, 0), α = 0.2, average log loss. What is β after one update?</p>}
          options={[
            { text: '(0, −0.1)', correct: true, why: 'p − y = (−0.5, 0.5); ∇J = ½Xᵀ(p − y) = (0, 0.5); β = (0, 0) − 0.2(0, 0.5).' },
            { text: '(0, 0.1)', why: 'Sign error: gradient descent subtracts the gradient.' },
            { text: '(−0.1, −0.1)', why: 'The intercept component of the gradient is ½(−0.5 + 0.5) = 0.' },
          ]}
        />
        <Quiz
          id="w2.l5.q3"
          q={<p>“The logistic loss is convex, so it always has exactly one finite minimiser.” Evaluate.</p>}
          options={[
            { text: 'True.', why: 'Convexity makes stationary points global minimisers; it does not guarantee one exists or is unique.' },
            { text: 'False: separable data has no finite minimiser, and redundant columns make minimisers non-unique.', correct: true, why: 'See the log(1 + e^(−b)) example.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Per observation the score derivative is just <M t="p - y" />, so <M t="\nabla J = \frac1m X\T(\bp - \by)" /> and gradient descent updates{' '}
        <M t="\beta \leftarrow \beta - \frac\alpha m X\T(\bp - \by)" /> with the old probabilities. The loss is convex, so any stationary point is
        global — but there is no closed form, and separable or redundant data can leave no unique finite optimum.
      </Callout>

      <Checklist id="w2-logfit" items={CHECKS2['w2-logfit']} />
    </>
  );
}
