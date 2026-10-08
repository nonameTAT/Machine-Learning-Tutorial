import { M, MB } from '../components/Math';
import { ProblemSet, problemIds, type Problem, type ProblemGroup } from '../components/ProblemSet';
import { Callout } from '../components/ui';

const A: Problem[] = [
  {
    id: 'A1',
    title: 'Loss scaling',
    lesson: 'loss',
    q: (
      <p>
        Let <M t="J(\theta) = \SSE(\theta)/m" /> with <M t="m > 1" />. Compare the minimisers, the minimum values and the gradients of <M t="J" /> and
        SSE. Explain why the same gradient-descent learning rate is not equivalent for both.
      </p>
    ),
    hint: 'Multiply the entire loss by a positive constant: what changes and what doesn’t?',
    sol: (
      <p>
        Since <M t="1/m > 0" />, the ordering of candidate θ’s is unchanged, so the minimiser sets are identical. The minimum of <M t="J" /> is{' '}
        <M t="1/m" /> times the minimum SSE (equal only if both are 0). Also <M t="\nabla J = \tfrac1m\nabla\SSE" />, so a GD step on SSE with rate{' '}
        <M t="\alpha" /> is <M t="m" /> times longer than on <M t="J" />. To match a step on MSE with rate α, use rate <M t="\alpha/m" /> on SSE.
      </p>
    ),
  },
  {
    id: 'A2',
    title: 'Derive, do not quote',
    lesson: 'ols1d',
    q: (
      <p>
        For <M t="J = \tfrac1m\sum_j (y_j - \theta_0 - \theta_1x_j)^2" />, derive the two normal equations and then the slope and intercept. State the
        condition that makes the solution unique, and explain why the fitted line contains the centroid.
      </p>
    ),
    hint: 'Solve the intercept equation first; then substitute and use Σ(xⱼ − x̄) = 0.',
    sol: (
      <>
        <MB t="\sum_j (y_j - \theta_0 - \theta_1x_j) = 0, \qquad \sum_j x_j(y_j - \theta_0 - \theta_1x_j) = 0." />
        <p>
          The first gives <M t="\theta_0 = \bar y - \theta_1\bar x" />. Substituting into the second gives <M t="\theta_1S_{xx} = S_{xy}" />, so{' '}
          <M t="\hat\theta_1 = S_{xy}/S_{xx}" />, <M t="\hat\theta_0 = \bar y - \hat\theta_1\bar x" />. Uniqueness requires <M t="S_{xx} > 0" /> (not all
          inputs equal). The prediction at <M t="\bar x" /> is <M t="\hat\theta_0 + \hat\theta_1\bar x = \bar y" />. Convexity makes the stationary point
          the minimum.
        </p>
      </>
    ),
  },
  {
    id: 'A3',
    title: 'A zero gradient is not the whole proof',
    lesson: 'matrix',
    q: (
      <p>
        Starting from <M t="J = \|\by - X\theta\|^2/m" />, obtain the matrix normal equations and show the stationary point is a global minimum. What
        extra condition makes it unique? What goes wrong with <M t="(X\T X)^{-1}" /> when two columns of <M t="X" /> are identical?
      </p>
    ),
    hint: (
      <>
        Examine <M t="\bv\T H\bv" /> for the Hessian <M t="H" />.
      </>
    ),
    sol: (
      <p>
        <M t="\nabla J = \tfrac2m X\T(X\theta - \by) = 0 \Rightarrow X\T X\hat\theta = X\T\by" />. The Hessian <M t="H = \tfrac2m X\T X" /> satisfies{' '}
        <M t="\bv\T H\bv = \tfrac2m\|X\bv\|^2 \ge 0" />, so <M t="J" /> is convex and every stationary point is a global minimiser. Full column rank gives{' '}
        <M t="X\bv \ne 0" /> for <M t="\bv \ne 0" />: strictly convex, unique minimiser. With duplicate columns, raising one coefficient and lowering the
        other by the same amount leaves <M t="X\theta" /> unchanged; <M t="X\T X" /> is singular and has no inverse.
      </p>
    ),
  },
  {
    id: 'A4',
    title: 'Likelihood',
    lesson: 'mle',
    q: (
      <p>
        With independent <M t="y_j\mid\bx_j \sim \N(\bx_j\T\theta, \sigma^2)" /> and fixed <M t="\sigma^2 > 0" />, derive the log-likelihood and explain
        why its maximiser is the OLS solution. Identify the exact step that uses independence.
      </p>
    ),
    hint: 'Take logs before differentiating.',
    sol: (
      <>
        <p>
          Independence gives <M t="\Lik = \prod_j p(y_j\mid\bx_j;\theta)" /> (this is the step). Taking logs of the Gaussian densities:
        </p>
        <MB t="\ell(\theta) = -\frac m2\log(2\pi\sigma^2) - \frac{\SSE(\theta)}{2\sigma^2}." />
        <p>The first term is constant in θ and the SSE coefficient is negative, so maximising ℓ is minimising SSE.</p>
      </>
    ),
  },
  {
    id: 'A5',
    title: 'Regularisation convention',
    lesson: 'regularisation',
    q: (
      <>
        <p>Derive the normal equations for the following objective, with the intercept unpenalised:</p>
        <MB t="J(\theta) = \frac1m\|\by - X\theta\|^2 + \lambda\sum_{i=1}^n\theta_i^2." />
        <p>State the penalty matrix and the coefficient multiplying it. What happens as λ → ∞?</p>
      </>
    ),
    hint: 'Multiply the gradient equation by m/2.',
    sol: (
      <>
        <p>
          With <M t="D = \diag(0, 1, \dots, 1)" />:
        </p>
        <MB t="0 = \frac2m X\T(X\theta - \by) + 2\lambda D\theta \;\Longrightarrow\; (X\T X + m\lambda D)\hat\theta = X\T\by." />
        <p>
          The coefficient is <M t="m\lambda" /> because the data term was averaged. As λ → ∞ all slopes → 0 and the unpenalised intercept → ȳ: a constant
          predictor.
        </p>
      </>
    ),
  },
  {
    id: 'A6',
    title: 'Expected squared error',
    lesson: 'biasvar',
    q: (
      <p>
        At fixed <M t="x" />, let <M t="y = f(x) + \varepsilon" /> and let <M t="\hat f_D(x)" /> depend on the training set. Derive the bias–variance
        decomposition. State the mean-zero and independence assumptions used, and explain why the noise term is absent from{' '}
        <M t="\E_D[(\hat f_D(x) - f(x))^2]" />.
      </p>
    ),
    hint: (
      <>
        Add and subtract <M t="\E_D[\hat f_D(x)]" /> before squaring.
      </>
    ),
    sol: (
      <p>
        Set <M t="a = \E_D[\hat f_D(x)]" /> and write <M t="y - \hat f_D = (f - a) + (a - \hat f_D) + \varepsilon" />. The first term is fixed, the second
        has mean zero over D, and ε has mean zero and is independent of D, so all cross terms have expectation zero. The squares give{' '}
        <M t="\Bias^2 + \Var_D(\hat f_D) + \sigma^2" />. Measuring against the fixed <M t="f(x)" /> instead of a noisy <M t="y" /> removes ε, leaving{' '}
        <M t="\Bias^2 + \Var" />.
      </p>
    ),
  },
];

const B: Problem[] = [
  {
    id: 'B1',
    title: 'A complete fit',
    lesson: 'ols1d',
    q: (
      <p>
        Use <M t="(x, y) = (0, 1), (1, 2), (2, 2)" />. (a) Find the OLS slope, intercept, predictions and residuals. (b) Calculate SSE, MSE, RMSE, MAE
        and <M t="R^2" />. (c) Check both normal equations and predict at <M t="x = 3" />.
      </p>
    ),
    hint: 'Means first: x̄ = 1, ȳ = 5/3. Keep fractions.',
    sol: (
      <>
        <p>
          <M t="S_{xx} = 2" />, <M t="S_{xy} = 1" />, so <M t="\hat\theta_1 = 1/2" />, <M t="\hat\theta_0 = 5/3 - 1/2 = 7/6" />. Predictions{' '}
          <M t="(7/6, 5/3, 13/6)" />, residuals <M t="(-1/6, 1/3, -1/6)" />.
        </p>
        <MB t="\begin{gathered} \SSE = \tfrac16,\quad \MSE = \tfrac1{18},\quad \RMSE = \tfrac{1}{\sqrt{18}} \approx 0.236, \\ \MAE = \tfrac29,\quad \SST = \tfrac23,\quad R^2 = 1 - \tfrac{1/6}{2/3} = \tfrac34. \end{gathered}" />
        <p>
          <M t="\sum_j e_j = -\tfrac16 + \tfrac13 - \tfrac16 = 0" /> and <M t="\sum_j x_je_j = 0(-\tfrac16) + 1(\tfrac13) + 2(-\tfrac16) = 0" />. At{' '}
          <M t="x = 3" />: <M t="7/6 + 3/2 = 8/3" />, an extrapolation beyond the observed inputs. Check it with the{' '}
          <a href="#/ols1d">OLS calculator</a>.
        </p>
      </>
    ),
  },
  {
    id: 'B2',
    title: 'One gradient step',
    lesson: 'gd',
    q: (
      <p>
        For B1’s data, start at <M t="\theta = (0, 0)\T" /> with <M t="\alpha = 0.1" />. Using MSE, perform one simultaneous batch update. Separately,
        perform one single-example LMS update using only <M t="(0, 1)" />. Why are the results different?
      </p>
    ),
    sol: (
      <>
        <MB t="\begin{gathered} \be = (1, 2, 2)\T,\quad X\T\be = (5, 6)\T,\quad \nabla J = -\tfrac23(5, 6)\T = (-\tfrac{10}3, -4)\T \\ \Rightarrow\; \theta^{(1)} = (0, 0)\T - 0.1\,(-\tfrac{10}3, -4)\T = (\tfrac13, \tfrac25)\T. \end{gathered}" />
        <p>
          LMS on (0, 1): <M t="\theta + 2(0.1)(1)(1, 0)\T = (0.2, 0)\T" />. Batch averages all three examples’ gradients; LMS uses only the first. Both use
          the original θ for every component.
        </p>
      </>
    ),
  },
  {
    id: 'B3',
    title: 'Ridge by hand',
    lesson: 'regularisation',
    q: (
      <p>
        For B1, minimise <M t="\SSE + 2\theta_1^2" /> with an unpenalised intercept. Find the coefficients. What penalty in{' '}
        <M t="\MSE + \lambda\theta_1^2" /> gives the same solution?
      </p>
    ),
    sol: (
      <p>
        Slope <M t="S_{xy}/(S_{xx} + 2) = 1/4" />, intercept <M t="5/3 - 1/4 = 17/12" />. With <M t="m = 3" />, <M t="\MSE + \lambda\theta_1^2" /> times 3 is{' '}
        <M t="\SSE + 3\lambda\theta_1^2" />, so <M t="\lambda = 2/3" />. Residuals <M t="(-5/12, 1/3, 1/12)" /> still sum to zero (free intercept); their
        SSE is <M t="7/24 > 1/6" />, an increase the penalised objective accepts.
      </p>
    ),
  },
  {
    id: 'B4',
    title: 'Interactions',
    lesson: 'features',
    q: (
      <p>
        Consider <M t="\hat y = 10 + 2D + 3x - 0.5Dx" />, <M t="D \in \{0, 1\}" />. Write the rule for each group and the predicted group difference at{' '}
        <M t="x" />. Where do the predictions coincide? Is the model linear in its parameters?
      </p>
    ),
    sol: (
      <p>
        <M t="D=0: 10 + 3x" />; <M t="D=1: 12 + 2.5x" />. Difference <M t="2 - 0.5x" />, zero at <M t="x = 4" />. Yes: the features <M t="(1, D, x, Dx)" />{' '}
        are fixed columns and the prediction is a linear combination of them.
      </p>
    ),
  },
  {
    id: 'B5',
    title: 'Local predictions',
    lesson: 'knn',
    q: (
      <p>
        Store <M t="(0,1), (2,3), (5,7), (8,9)" /> and query <M t="x_q = 3" />. Find the 1-NN and 2-NN regression predictions. Then fit a local line
        through the two nearest observations and predict at 3.
      </p>
    ),
    sol: (
      <p>
        Distances 3, 1, 2, 5. 1-NN: (2, 3) → 3. 2-NN: (2, 3) and (5, 7) → 5. The local line through them has slope 4/3 and intercept 1/3, predicting{' '}
        <M t="1/3 + 4 = 13/3 \approx 4.33" />. Averaging assumes a flat neighbourhood; the local line follows its trend.
      </p>
    ),
  },
  {
    id: 'B6',
    title: 'Correlation, slope and R²',
    lesson: 'stats',
    q: (
      <p>
        For B1’s data compute <M t="s_x, s_y, \Cov(x, y)" /> and Pearson <M t="r" />. Verify that <M t="\hat\theta_1 = r\,s_y/s_x" /> and that{' '}
        <M t="R^2 = r^2" />.
      </p>
    ),
    hint: 'Use the N − 1 denominators: s²ₓ = S_xx/2, s²_y = SST/2, Cov = S_xy/2.',
    sol: (
      <p>
        <M t="s_x^2 = 1" />, <M t="s_y^2 = (2/3)/2 = 1/3" />, <M t="\Cov = 1/2" />, so <M t="r = \frac{1/2}{1\cdot\sqrt{1/3}} = \frac{\sqrt3}{2} \approx 0.866" />.
        Then <M t="r s_y/s_x = (\sqrt3/2)(1/\sqrt3) = 1/2 = \hat\theta_1" /> ✓ and <M t="r^2 = 3/4 = R^2" /> ✓. (For one-feature OLS with an intercept,
        training R² always equals r².)
      </p>
    ),
  },
  {
    id: 'B7',
    title: 'Adjusted R²',
    lesson: 'evaluation',
    q: (
      <p>
        On <M t="m = 20" /> training examples, model P has 3 predictors and <M t="R^2 = 0.80" />; model Q has 8 predictors and <M t="R^2 = 0.82" />.
        Compare their adjusted R². What else would you want before choosing?
      </p>
    ),
    sol: (
      <p>
        P: <M t="1 - 0.20\cdot\tfrac{19}{16} = 0.7625" />. Q: <M t="1 - 0.18\cdot\tfrac{19}{11} \approx 0.689" />. Adjusted R² prefers P: Q’s small gain
        in fit does not justify five extra predictors. Better still, compare validation error — adjusted R² is still a training-data quantity.
      </p>
    ),
  },
];

const C: Problem[] = [
  { id: 'C1', title: 'Diagnose the claim', lesson: 'loss', q: <p>“The training residuals sum to zero, so the predictions are accurate.”</p>, sol: <p><strong>False.</strong> Signed residuals can cancel even when errors are large: (−10, 10) sums to 0 with MSE 100. Σe = 0 is the intercept’s normal equation, not an accuracy certificate.</p> },
  { id: 'C2', title: 'Diagnose the claim', lesson: 'matrix', q: <p>“An intercept plus two identical feature columns must produce a unique OLS coefficient vector as long as there are 1,000 observations.”</p>, sol: <p><strong>False.</strong> Identical columns are linearly dependent whatever the number of rows. Shifting weight between them leaves predictions unchanged, so the coefficients are not unique and <M t="(X\T X)^{-1}" /> does not exist.</p> },
  { id: 'C3', title: 'Diagnose the claim', lesson: 'evaluation', q: <p>“A model with negative test R² was necessarily calculated incorrectly.”</p>, sol: <p><strong>False.</strong> Test R² &lt; 0 means the model’s test SSE exceeds that of predicting the test mean. It happens when a model generalises poorly.</p> },
  { id: 'C4', title: 'Diagnose the claim', lesson: 'evaluation', q: <p>“I selected λ by trying 30 values and reporting whichever had the lowest test MSE. Because no coefficients were fitted on the test set, the reported score is a fair final evaluation.”</p>, sol: <p><strong>False.</strong> The test set influenced the choice of λ, so it was used for model selection. Tune on validation data and keep an untouched test set for the single final evaluation; the reported score here is optimistic.</p> },
  { id: 'C5', title: 'Diagnose the claim', lesson: 'stats', q: <p>“Pearson correlation is zero, so the input cannot predict the output.”</p>, sol: <p><strong>False.</strong> <M t="y = x^2" /> on <M t="x = (-1, 0, 1)" /> has r = 0 and is perfectly predictable. r only measures linear association.</p> },
  { id: 'C6', title: 'Diagnose the claim', lesson: 'biasvar', q: <p>“The mean of a model’s predictions over inputs is correct, so the model has zero bias in the bias–variance decomposition.”</p>, sol: <p><strong>False.</strong> Bias compares the expected prediction <em>across training sets at a fixed input</em> with f(x). Averaging over different inputs is a different operation, and errors of opposite sign at different x can cancel.</p> },
  { id: 'C7', title: 'Diagnose the claim', lesson: 'gd', q: <p>“Gradient descent diverged on my least-squares problem, so the loss must not be convex.”</p>, sol: <p><strong>False.</strong> The MSE is always convex. Divergence with a fixed step means α exceeded the stability limit <M t="1/\lambda_{\max}(X\T X/m)" />; reduce α or rescale the features.</p> },
  { id: 'C8', title: 'Diagnose the claim', lesson: 'assumptions', q: <p>“House prices are right-skewed, so the normality assumption of linear regression is violated.”</p>, sol: <p><strong>Not necessarily.</strong> The assumption concerns y <em>given</em> x (the noise around the mean), not the overall distribution of y. A skewed marginal can arise from a skewed distribution of features.</p> },
];

const D: Problem[] = [
  {
    id: 'D1',
    title: 'Choose and explain',
    lesson: 'biasvar',
    q: (
      <p>
        At a fixed input, procedure A predicts 4 or 8 with equal probability over training sets; procedure B always predicts 5. The true mean response is
        6 and independent test-noise variance is 2. Compute each procedure’s bias, variance and expected squared prediction error. Which is preferable,
        and what does this show about unbiasedness?
      </p>
    ),
    sol: (
      <p>
        A: mean 6, bias 0, variance <M t="((4-6)^2 + (8-6)^2)/2 = 4" />, error <M t="0 + 4 + 2 = 6" />. B: bias −1, variance 0, error{' '}
        <M t="1 + 0 + 2 = 3" />. B is preferable under squared loss: lower variance can more than compensate for some bias. Both face the same
        irreducible noise.
      </p>
    ),
  },
  {
    id: 'D2',
    title: 'Choose and explain',
    lesson: 'regularisation',
    q: (
      <p>
        You have 60 examples and 200 candidate features, and you believe only a few matter. Explain why plain least squares is problematic, and which of
        ridge or LASSO you would try first, and how you would choose λ.
      </p>
    ),
    sol: (
      <p>
        With <M t="n + 1 = 201 > m = 60" />, <M t="X" /> cannot have full column rank: OLS has infinitely many exact-fit solutions and will overfit. Both
        penalties restore a unique, stable solution; LASSO is the natural first choice because its L1 penalty yields exact zeros, selecting a sparse
        subset. Standardise the features using training statistics, choose λ by validation or cross-validation error, and report test error once.
      </p>
    ),
  },
];

const GROUPS: ProblemGroup[] = [
  { key: 'A', title: 'A · Derivations', intro: 'Write the objective, show the main steps, state the condition under which the result holds.', items: A },
  { key: 'B', title: 'B · Calculations', intro: 'Exact fractions make verification easier. Check against the calculators in lessons 4 and 11.', items: B },
  { key: 'C', title: 'C · Diagnose the claim', intro: 'True or false — and give the mechanism or a counterexample, not just a verdict.', items: C },
  { key: 'D', title: 'D · Choose and explain', intro: 'Combine ideas from several lessons.', items: D },
];

export const ALL_PROBLEMS = problemIds(GROUPS);

export default function Practice() {
  return (
    <ProblemSet groups={GROUPS} storeKey="practice">
      <Callout kind="warning" title="If your answer differs">
        First check the intercept column, the sign convention for residuals, and whether the objective is SSE or MSE. For ridge, check whether the
        intercept is penalised. For metrics, use residuals and the response mean from the same evaluation set.
      </Callout>
    </ProblemSet>
  );
}
