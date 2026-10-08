import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../components/ui';
import { CenteringLab, OLSCalculator } from '../interactives/OLSCalc';

export default function L04Ols1d() {
  return (
    <>
      <Sec title="Strategy: first place the line, then tilt it">
        <p>
          With one feature we want <M t="\hat y = \theta_0 + \theta_1 x" /> minimising
        </p>
        <MB t="J(\theta_0,\theta_1) = \frac1m\sum_{j=1}^m \big(y_j - \theta_0 - \theta_1 x_j\big)^2." />
        <p>
          <M t="J" /> is a smooth bowl in two unknowns, so at the bottom both partial derivatives are zero. Before calculating, think about what each
          derivative will say. If the residuals are positive on average, the whole line is too low — raising the intercept helps. So the{' '}
          <M t="\theta_0" /> equation should be about the <em>average</em> residual. The <M t="\theta_1" /> equation should be about whether residuals
          are systematically positive at large <M t="x" /> and negative at small <M t="x" /> — a sign the line needs tilting.
        </p>
      </Sec>

      <Sec title="The derivation, one step at a time">
        <Steps
          intro={
            <p>
              The chain rule gives <M t="\frac{\partial}{\partial\theta}(\text{residual})^2 = 2\cdot\text{residual}\cdot\frac{\partial\,\text{residual}}{\partial\theta}" />. The
              residual <M t="y_j - \theta_0 - \theta_1x_j" /> has derivative <M t="-1" /> with respect to <M t="\theta_0" /> and <M t="-x_j" /> with
              respect to <M t="\theta_1" />.
            </p>
          }
          steps={[
            {
              title: 'Differentiate with respect to the intercept and set to zero',
              body: <MB t="\frac{\partial J}{\partial\theta_0} = -\frac2m\sum_j\big(y_j - \theta_0 - \theta_1x_j\big) = 0 \;\Longleftrightarrow\; \sum_j e_j = 0." />,
            },
            {
              title: 'Divide by m: the intercept puts the line through the centroid',
              body: (
                <>
                  <MB t="\bar y - \theta_0 - \theta_1\bar x = 0 \quad\Longrightarrow\quad \hat\theta_0 = \bar y - \hat\theta_1\bar x." />
                  <p>
                    The fitted line passes through <M t="(\bar x, \bar y)" />. Not solved yet — <M t="\theta_0" /> still depends on the unknown slope.
                  </p>
                </>
              ),
            },
            {
              title: 'Differentiate with respect to the slope and set to zero',
              body: <MB t="\frac{\partial J}{\partial\theta_1} = -\frac2m\sum_j x_j\big(y_j - \theta_0 - \theta_1x_j\big) = 0 \;\Longleftrightarrow\; \sum_j x_j e_j = 0." />,
            },
            {
              title: 'Substitute the intercept; each residual becomes a deviation',
              body: (
                <>
                  <MB t="y_j - (\bar y - \theta_1\bar x) - \theta_1 x_j = (y_j - \bar y) - \theta_1(x_j - \bar x)" />
                  <MB t="\Longrightarrow\quad \sum_j x_j\big[(y_j-\bar y) - \theta_1(x_j-\bar x)\big] = 0." />
                </>
              ),
            },
            {
              title: 'Replace xⱼ by (xⱼ − x̄) — allowed because deviations sum to zero',
              body: (
                <>
                  <p>
                    Since <M t="\sum_j (y_j-\bar y) = 0" /> and <M t="\sum_j(x_j - \bar x) = 0" />, subtracting <M t="\bar x" /> times either sum changes
                    nothing:
                  </p>
                  <MB t="\sum_j (x_j-\bar x)(y_j-\bar y) = \theta_1\sum_j (x_j-\bar x)^2." />
                </>
              ),
            },
            {
              title: 'Solve',
              body: (
                <>
                  <p>
                    Write <M t="S_{xx} = \sum_j (x_j-\bar x)^2" /> and <M t="S_{xy} = \sum_j (x_j-\bar x)(y_j-\bar y)" />. If <M t="S_{xx} > 0" />:
                  </p>
                  <MB t="\boxed{\;\hat\theta_1 = \frac{S_{xy}}{S_{xx}}, \qquad \hat\theta_0 = \bar y - \hat\theta_1\bar x\;}" />
                </>
              ),
            },
          ]}
        />
        <Callout kind="note" title="Is this really the minimum?">
          A zero derivative could be a maximum or saddle. Here it is not: <M t="J" /> is a sum of squares of functions that are linear in the
          parameters, so it is a convex quadratic (an upward bowl). Every stationary point of a convex function is a global minimum, and{' '}
          <M t="S_{xx} > 0" /> makes it unique. Lesson 5 proves this in general with the Hessian.
        </Callout>
        <Callout kind="warning" title="When the formula breaks">
          If every <M t="x_j" /> is the same, <M t="S_{xx} = 0" /> and the slope is undefined. Geometrically: with all points stacked at one{' '}
          <M t="x" />, every line through <M t="(\bar x, \bar y)" /> fits equally well. You cannot learn how <M t="y" /> changes with <M t="x" /> if{' '}
          <M t="x" /> never changes. This is the one-feature version of a rank-deficient design matrix.
        </Callout>
      </Sec>

      <Sec title="Connect the algebra to the statistics">
        <p>Divide top and bottom by m − 1 and the slope becomes a ratio of familiar statistics:</p>
        <MB t="\hat\theta_1 = \frac{\Cov(x,y)}{\Var(x)} = r\,\frac{s_y}{s_x}, \qquad \hat\theta_0 = \bar y - \hat\theta_1\bar x." />
        <p>
          Read it as: “how much x and y move together, per unit of x’s own spread”. The slope has the sign of the correlation, but its size carries
          units (units of y per unit of x) while r is dimensionless. A height–weight example is exactly this: choose{' '}
          <M t="\theta_0, \theta_1" /> in <M t="\hat w = \theta_0 + \theta_1 h" /> to minimise <M t="\sum_j (w_j - (\theta_0 + \theta_1 h_j))^2" />.
        </p>
      </Sec>

      <Sec title="Worked example — and a calculator to check your own">
        <p>
          Take <M t="x = (3, 6, 7, 8, 11)" /> and <M t="y = (13, 8, 11, 2, 6)" />. The strategy is: means first, then deviations, then the two sums.
          Working with deviations keeps the numbers small and makes the role of covariance visible.
        </p>
        <Table
          className="num"
          head={['x', 'y', 'x − 7', 'y − 8', '(x − 7)²', '(x − 7)(y − 8)']}
          rows={[
            [3, 13, -4, 5, 16, -20],
            [6, 8, -1, 0, 1, 0],
            [7, 11, 0, 3, 0, 0],
            [8, 2, 1, -6, 1, -6],
            [11, 6, 4, -2, 16, -8],
            [<strong>x̄ = 7</strong>, <strong>ȳ = 8</strong>, '', '', <strong>S_xx = 34</strong>, <strong>S_xy = −34</strong>],
          ]}
        />
        <MB t="\hat\theta_1 = \frac{-34}{34} = -1, \qquad \hat\theta_0 = 8 - (-1)(7) = 15, \qquad \hat y = 15 - x." />
        <p>
          <strong>Verify with a different route.</strong> Fitted values <M t="(12, 9, 8, 7, 4)" />, residuals <M t="(1, -1, 3, -5, 2)" />. Both normal
          equations hold: <M t="\sum e_j = 0" /> and <M t="\sum x_j e_j = 3 - 6 + 21 - 40 + 22 = 0" />. SSE = 40, MSE = 8. A short independent check
          like this catches sign errors that re-doing the same arithmetic would miss.
        </p>
        <Lab title="OLS calculator" purpose="Type any small dataset to get the full deviation table, coefficients (with exact fractions when they exist) and the normal-equation checks. Use it to mark your hand calculations.">
          <OLSCalculator />
        </Lab>
      </Sec>

      <Sec title="Intuitions: translating the data">
        <ul>
          <li>
            Adding a constant to every <M t="x" /> changes only the intercept, because the slope is built from deviations <M t="x_j - \bar x" />, which a
            translation leaves unchanged. Concretely, with <M t="x' = x + a" />:{' '}
            <M t="\theta_0 + \theta_1x = (\theta_0 - \theta_1a) + \theta_1x'" />.
          </li>
          <li>
            Centring <M t="x" /> (subtract <M t="\bar x" />) makes the intercept equal to <M t="\bar y" />: the prediction at the average input is the
            average output.
          </li>
          <li>
            Centring <M t="y" /> as well gives a zero intercept, without changing the problem in any essential way — predictions on the original scale are
            recovered by adding the means back.
          </li>
        </ul>
        <Lab title="Shift the inputs" purpose="Slide the data horizontally. Only the intercept moves.">
          <CenteringLab />
        </Lab>
        <Callout kind="warning">
          Subtracting <M t="\bar y" /> from <M t="y" /> <em>alone</em> does not generally give a zero intercept: the intercept becomes{' '}
          <M t="-\hat\theta_1\bar x" />, which is zero only if <M t="x" /> is also centred (or the slope is 0). The common claim that centring removes the{' '}
          intercept assumes <M t="x" /> has been centred too.
        </Callout>
      </Sec>

      <Sec title="The residual identities">
        <p>The two normal equations are worth remembering as facts about the fitted residuals:</p>
        <MB t="\sum_{j=1}^m e_j = 0 \qquad\text{and}\qquad \sum_{j=1}^m x_j e_j = 0." />
        <p>
          The first comes from the free intercept; the second from the slope. They hold for the <em>training</em> residuals of a least-squares fit with an
          intercept. They need not hold on new data, nor for a line forced through the origin (which has no intercept equation).
        </p>
      </Sec>

      <TryThis
        items={[
          <>In the calculator, load “Practice B1 data” (0,1),(1,2),(2,2). Predict the slope and intercept by hand first, then check.</>,
          <>Make all x values equal (e.g. 5, 5, 5). Read the message and explain it in terms of S_xx.</>,
          <>Add 100 to every x. Which numbers in the table change? Which do not?</>,
        ]}
      />

      <Sec title="Check your understanding">
        <Quiz
          id="l4.q1"
          q={<p>Which normal equation tells you the least-squares line passes through (x̄, ȳ)?</p>}
          options={[
            { text: 'The intercept equation Σⱼ eⱼ = 0.', correct: true, why: 'Dividing Σ(yⱼ − θ₀ − θ₁xⱼ) = 0 by m gives ȳ = θ₀ + θ₁x̄.' },
            { text: 'The slope equation Σⱼ xⱼeⱼ = 0.', why: 'That one fixes the tilt; on its own it does not give the centroid.' },
            { text: 'Neither; it follows from convexity.', why: 'Convexity tells you the stationary point is a minimum, not where the line passes.' },
          ]}
        />
        <Quiz
          id="l4.q2"
          q={<p>For data with x̄ = 2, ȳ = 5, S_xx = 8, S_xy = −4, the least-squares line is…</p>}
          options={[
            { text: 'ŷ = 6 − 0.5x', correct: true, why: 'θ̂₁ = −4/8 = −0.5 and θ̂₀ = 5 − (−0.5)(2) = 6.' },
            { text: 'ŷ = 4 − 0.5x', why: 'Check the sign: θ̂₀ = ȳ − θ̂₁x̄ = 5 + 1 = 6.' },
            { text: 'ŷ = 5 − 2x', why: 'The slope is S_xy/S_xx, not S_xx/S_xy.' },
          ]}
        />
        <Quiz
          id="l4.q3"
          q={<p>You fit a line through the origin (no intercept). Must the residuals still sum to zero?</p>}
          options={[
            { text: 'Yes, always.', why: 'The identity Σe = 0 is the intercept’s normal equation; without an intercept there is no such equation.' },
            { text: 'No — only Σ xⱼeⱼ = 0 is guaranteed.', correct: true, why: 'With only θ₁, the single normal equation is Σ xⱼ(yⱼ − θ₁xⱼ) = 0.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Set both partial derivatives to zero. The intercept equation balances residuals and puts the line through the centroid; the slope equation
        balances input-weighted residuals and gives <M t="\hat\theta_1 = S_{xy}/S_{xx} = \Cov(x,y)/\Var(x)" />. Convexity makes it a global minimum;{' '}
        <M t="S_{xx} > 0" /> makes it unique. Always verify with the two residual identities.
      </Callout>

      <Checklist id="ols1d" items={CHECKS.ols1d} />
    </>
  );
}
