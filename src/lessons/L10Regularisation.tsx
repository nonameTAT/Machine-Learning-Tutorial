import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../components/ui';
import { CoefPathLab, PenaltyGeometryLab, RegularisationLab } from '../interactives/RegLab';

export default function L10Regularisation() {
  return (
    <>
      <Sec title="The problem: a better fit can be a worse model">
        <p>
          Lesson 9 ended with a high-degree polynomial threading every training point and swinging wildly between them. Look at its coefficients and you
          find the mechanism: huge positive and negative weights that nearly cancel. Such a model is <em>extremely sensitive</em> — a small change in one
          data point produces a very different curve.
        </p>
        <p>
          <strong>Regularisation</strong> is a general method to avoid overfitting by adding constraints to the weight vector. The common
          approach — <strong>shrinkage</strong> — insists the weights be small on average. We trade a little training fit for a lot less sensitivity.
          Note what it does <em>not</em> do: it adds no data. It changes the objective.
        </p>
      </Sec>

      <Sec title="Ridge regression: pay for large coefficients">
        <p>Add a penalty to the least-squares cost:</p>
        <MB t="\begin{gathered} J_\lambda(\theta) = \underbrace{\sum_{j=1}^m (y_j - h_\theta(\bx_j))^2}_{\text{fit the data}} + \underbrace{\lambda\sum_{i=1}^n \theta_i^2}_{\text{keep weights small}}, \\[4pt] \theta^* = \argmin_\theta\,(\by - X\theta)\T(\by - X\theta) + \lambda\|\theta\|^2. \end{gathered}" />
        <p>
          <M t="\lambda \ge 0" /> sets the exchange rate between fit and size. <M t="\lambda = 0" /> is ordinary least squares; <M t="\lambda \to \infty" />{' '}
          drives the penalised coefficients to zero. Note the penalty sum starts at <M t="i = 1" />: the intercept is usually <em>not</em> penalised
          (shrinking it would just bias every prediction toward 0). Some texts write <M t="\|\theta\|^2" /> over all entries; both conventions appear, so
          always check which one a question uses.
        </p>
        <Steps
          intro={<p>The penalty is another quadratic, so the closed form survives. Let <M t="D = \diag(0, 1, \dots, 1)" /> so that <M t="\theta\T D\theta = \sum_{i\ge1}\theta_i^2" />.</p>}
          steps={[
            { title: 'Write the objective in matrix form', body: <MB t="J_\lambda(\theta) = (\by - X\theta)\T(\by - X\theta) + \lambda\,\theta\T D\theta." /> },
            { title: 'Differentiate (D is symmetric)', body: <MB t="\nabla J_\lambda = -2X\T(\by - X\theta) + 2\lambda D\theta." /> },
            { title: 'Set to zero and collect θ', body: <MB t="(X\T X + \lambda D)\,\hat\theta = X\T\by." /> },
            {
              title: 'Solve',
              body: (
                <>
                  <MB t="\boxed{\;\hat\theta_{\text{ridge}} = (X\T X + \lambda D)^{-1}X\T\by\;}" />
                  <p>Penalising all entries replaces <M t="D" /> with <M t="I" />: <M t="\hat\theta = (X\T X + \lambda I)^{-1}X\T\by" />.</p>
                  <p>
                    For <M t="\lambda > 0" /> this matrix is invertible even when <M t="X\T X" /> is not (duplicate columns, more features than rows): the
                    penalty makes the bowl strictly convex in every penalised direction. Adding <M t="\lambda" /> to the diagonal is a classic trick for
                    numerical stability.
                  </p>
                </>
              ),
            },
          ]}
        />
      </Sec>

      <Sec title="See shrinkage in one dimension">
        <p>With one feature and an unpenalised intercept, the ridge solution is</p>
        <MB t="\hat\theta_1 = \frac{S_{xy}}{S_{xx} + \lambda}, \qquad \hat\theta_0 = \bar y - \hat\theta_1\bar x." />
        <p>
          The penalty simply inflates the denominator, pulling the slope toward 0. For the running example (<M t="S_{xy} = -34, S_{xx} = 34" />) with{' '}
          <M t="\lambda = 34" />: slope <M t="-34/68 = -0.5" />, intercept <M t="8 - (-0.5)(7) = 11.5" />.
        </p>
        <Table
          head={['', 'OLS (λ = 0)', 'Ridge (λ = 34)']}
          rows={[
            ['Fitted line', <M t="15 - x" />, <M t="11.5 - 0.5x" />],
            ['Training SSE', '40', '48.5'],
            ['Penalised objective SSE + 34θ₁²', '40 + 34 = 74', '48.5 + 8.5 = 57'],
          ]}
        />
        <p>
          Training SSE got <em>worse</em> — and that is exactly what the new objective asked for: it is willing to fit worse in exchange for a smaller
          slope. Whether this improves prediction on new data is a separate empirical question (lesson 11).
        </p>
        <Callout kind="note" title="SSE vs MSE convention changes λ’s meaning">
          If the objective is <M t="\MSE + \lambda\sum_{i\ge1}\theta_i^2" /> instead, multiply through by <M t="m" /> and you get{' '}
          <M t="(X\T X + m\lambda D)\hat\theta = X\T\by" />. The same numerical λ is <M t="m" /> times stronger. (Above, λ = 34 under SSE equals λ = 6.8
          under MSE with m = 5.)
        </Callout>
      </Sec>

      <Sec title="Explore: taming a degree-9 polynomial">
        <Lab
          title="Regularisation strength"
          purpose="Same model family every time (degree 9). Only λ changes. Watch the curve, the coefficients, and the training and validation errors."
        >
          <RegularisationLab />
        </Lab>
        <TryThis
          items={[
            'Start at λ = 0. The coefficients are enormous (note the log scale) and validation error is high. This is the overfit model.',
            'Slowly increase λ. Training MSE rises monotonically; validation MSE first falls, then rises. Find the λ with the lowest validation error.',
            'Push λ to 100. Everything shrinks towards a flat line at ȳ — the model now underfits.',
            'Switch to LASSO at a moderate λ (around 10⁻² to 10⁻¹). Count the exact zeros. Ridge essentially never produces them.',
          ]}
        />
      </Sec>

      <Sec title="LASSO: absolute values buy sparsity">
        <p>
          LASSO (“Least Absolute Shrinkage and Selection Operator”) replaces the squared penalty with absolute values:
        </p>
        <MB t="J_\lambda(\theta) = \|\by - X\theta\|^2 + \lambda\sum_{i=1}^n |\theta_i|." />
        <p>
          This small change has a big effect: some weights are shrunk, but others are set <em>exactly</em> to zero, so LASSO favours{' '}
          <strong>sparse</strong> solutions and performs feature selection as part of fitting.
        </p>
        <Table
          head={['', 'Ridge (L2)', 'LASSO (L1)']}
          rows={[
            ['Penalty', <M t="\lambda\sum_i\theta_i^2" />, <M t="\lambda\sum_i|\theta_i|" />],
            ['Effect on weights', 'smooth shrinkage; weights rarely exactly 0', 'shrinkage plus exact zeros'],
            ['Closed form', <M t="(X\T X + \lambda D)^{-1}X\T\by" />, 'none in general (|θ| is not differentiable at 0); solved iteratively'],
            ['Use when', 'many small effects; correlated features; stability', 'you expect few relevant features; want interpretability'],
          ]}
        />
      </Sec>

      <Sec title="Why the L1 penalty produces exact zeros">
        <p>
          A penalised problem has an equivalent constrained form: minimise SSE subject to <M t="\sum\theta_i^2 \le t^2" /> (ridge) or{' '}
          <M t="\sum|\theta_i| \le t" /> (LASSO). In two coordinates the ridge region is a disk; the LASSO region is a diamond with corners on the
          axes. The SSE contours are ellipses centred on the OLS solution <M t="\hat\theta" />. Grow the ellipses until they first touch the region: that
          contact point is the constrained solution.
        </p>
        <Lab title="Constraint geometry" purpose="Drag θ̂ (the OLS solution) in either panel. The orange ellipse is the first contour that touches each region.">
          <PenaltyGeometryLab />
        </Lab>
        <TryThis
          items={[
            'Drag θ̂ around outside the regions. For the diamond, a whole range of positions makes contact at a corner — so a coordinate is exactly 0. For the disk, contact is almost always at a point with both coordinates non-zero.',
            'Shrink t: more positions land on a corner (sparser LASSO solutions).',
            'Change ρ to tilt the ellipses. Corners still attract contact, but which coefficient is zeroed can change.',
          ]}
        />
        <Callout kind="note">
          This explains a <em>tendency</em>: ridge can give a zero (if <M t="\hat\theta" /> lies on an axis), and LASSO need not (if the ellipse meets an
          edge). Also, the constraint size <M t="t" /> and the penalty <M t="\lambda" /> are related but not the same number.
        </Callout>
        <Lab title="Coefficient paths" purpose="Six standardised features, three of them truly irrelevant (true θ = 0). Follow every coefficient as λ grows.">
          <CoefPathLab />
        </Lab>
      </Sec>

      <Sec title="Practical points">
        <ul>
          <li>
            <strong>Feature scale matters.</strong> Changing a feature from metres to centimetres divides its coefficient by 100, so the same penalty
            treats it very differently. Standardise features before penalising — computing the means and scales on training data only.
          </li>
          <li>
            <strong>λ is a hyperparameter.</strong> Training error always prefers <M t="\lambda = 0" />, so choose λ with validation data or grid search
            (lesson 11).
          </li>
          <li>
            <strong>Large-λ limit.</strong> With an unpenalised intercept, every slope → 0 and the model predicts the training mean <M t="\bar y" />{' '}
            everywhere.
          </li>
          <li>
            <strong>Model selection by shrinkage</strong>: one model whose unimportant variables get near-zero (ridge) or exactly zero (LASSO)
            coefficients — an alternative to searching over subsets.
          </li>
        </ul>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l10.q1"
          q={<p>With an unpenalised intercept, what does ridge regression predict as λ → ∞?</p>}
          options={[
            { text: 'Zero everywhere.', why: 'That would require penalising the intercept too.' },
            { text: 'The training mean ȳ everywhere.', correct: true, why: 'All slopes are driven to 0; the free intercept then minimises SSE at ȳ.' },
            { text: 'The OLS fit.', why: 'That is the λ = 0 end.' },
          ]}
        />
        <Quiz
          id="l10.q2"
          q={<p>Why does ridge give a unique solution even when two columns of X are identical?</p>}
          options={[
            { text: 'Because XᵀX + λD is invertible for λ > 0 (with the intercept column unpenalised and present).', correct: true, why: 'vᵀ(XᵀX + λD)v = ‖Xv‖² + λΣᵢ≥₁vᵢ² is positive for any non-zero v once slopes are penalised and the ones column handles v₀.' },
            { text: 'Because ridge removes one of the duplicate columns.', why: 'Ridge keeps both; it splits the weight between them equally.' },
            { text: 'It doesn’t; ridge also fails.', why: 'Fixing exactly this is one of ridge’s main uses.' },
          ]}
        />
        <Quiz
          id="l10.q3"
          q={<p>You want a model that uses only a handful of 200 candidate features. Which penalty is the natural first choice?</p>}
          options={[
            { text: 'L2 (ridge)', why: 'Ridge shrinks but rarely zeroes coefficients, so it keeps all 200 features.' },
            { text: 'L1 (LASSO)', correct: true, why: 'L1’s corners produce exact zeros, selecting a sparse subset.' },
            { text: 'No penalty', why: 'Plain least squares uses all features (and may not even be unique if 200 > m).' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Regularisation changes the objective to prefer small weights: ridge adds <M t="\lambda\sum\theta_i^2" /> and keeps a closed form{' '}
        <M t="(X\T X + \lambda D)^{-1}X\T\by" />; LASSO adds <M t="\lambda\sum|\theta_i|" /> and yields exact zeros because its constraint region has
        corners. Training error always gets worse as λ grows; the point is better behaviour on new data, so λ must be chosen on held-out data with
        standardised features.
      </Callout>

      <Checklist id="regularisation" items={CHECKS.regularisation} />
    </>
  );
}
