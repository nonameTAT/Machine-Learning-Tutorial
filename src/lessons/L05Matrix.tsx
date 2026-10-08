import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Figure, Lab, Quiz, Sec, Steps, Table, TryThis } from '../components/ui';
import { PlaneFit3D, ProjectionDiagram } from '../interactives/MatrixLab';

export default function L05Matrix() {
  return (
    <>
      <Sec title="Why switch to matrices?">
        <p>
          With <M t="n" /> features the scalar approach needs <M t="n+1" /> partial derivatives that all look alike. Matrix notation does the same
          reasoning once for every coefficient: all predictions are <M t="X\theta" />, all residuals are <M t="\be = \by - X\theta" />, and the loss is
          a single squared length:
        </p>
        <MB t="\begin{gathered} J(\theta) = (\by - X\theta)\T(\by - X\theta) = \|\by - X\theta\|^2, \\[6pt] X = \begin{bmatrix}1 & x_{11} & \cdots & x_{1n}\\ 1 & x_{21} & \cdots & x_{2n}\\ \vdots & & \ddots & \vdots\\ 1 & x_{m1} & \cdots & x_{mn}\end{bmatrix},\qquad \by = \begin{bmatrix}y_1\\ y_2\\ \vdots\\ y_m\end{bmatrix}. \end{gathered}" />
        <p>
          Two derivative rules are all you need: for a constant vector <M t="\mathbf a" /> and matrix <M t="A" />,
        </p>
        <MB t="\nabla_\theta(\mathbf a\T\theta) = \mathbf a, \qquad \nabla_\theta(\theta\T A\theta) = (A + A\T)\theta \;=\; 2A\theta \text{ if } A \text{ is symmetric}." />
      </Sec>

      <Sec title="Deriving the normal equations">
        <Steps
          steps={[
            {
              title: 'Expand the quadratic',
              body: (
                <>
                  <MB t="\begin{aligned} J(\theta) &= \by\T\by - \by\T X\theta - \theta\T X\T\by + \theta\T X\T X\theta \\ &= \by\T\by - 2\,\by\T X\theta + \theta\T X\T X\theta. \end{aligned}" />
                  <p>
                    The two middle terms are equal because each is a <M t="1\times1" /> scalar, and a scalar equals its own transpose.
                  </p>
                </>
              ),
            },
            {
              title: 'Differentiate term by term',
              body: (
                <>
                  <MB t="\nabla J(\theta) = -2X\T\by + 2X\T X\theta = -2X\T(\by - X\theta)." />
                  <p>
                    <M t="X\T X" /> is symmetric, so the quadratic rule gives <M t="2X\T X\theta" />.
                  </p>
                </>
              ),
            },
            {
              title: 'Set the gradient to zero: the normal equations',
              body: <MB t="X\T(\by - X\hat\theta) = \mathbf 0 \quad\Longleftrightarrow\quad X\T X\,\hat\theta = X\T\by." />,
            },
            {
              title: 'Solve, if X has full column rank',
              body: (
                <>
                  <MB t="\boxed{\;\hat\theta = (X\T X)^{-1}X\T\by\;}" />
                  <p>
                    Full column rank (no column is a linear combination of the others) is exactly what makes <M t="X\T X" /> invertible.
                  </p>
                </>
              ),
            },
          ]}
        />
        <p>
          With the MSE <M t="\tfrac1m\|\by - X\theta\|^2" /> instead, every gradient gains a factor <M t="1/m" />, giving{' '}
          <M t="\nabla J = \tfrac2m X\T(X\theta - \by)" /> — but the solution is identical, as lesson 2 predicted.
        </p>
      </Sec>

      <Sec title="Why the stationary point is the global minimum">
        <p>
          A zero gradient alone could be a saddle. The second-derivative matrix (Hessian) settles it:
        </p>
        <MB t="H = \nabla^2 J(\theta) = 2X\T X, \qquad \bv\T H\bv = 2\,\bv\T X\T X\bv = 2\,\|X\bv\|^2 \;\ge\; 0 \quad\text{for every } \bv." />
        <p>
          So <M t="H" /> is positive semi-definite and <M t="J" /> is <strong>convex</strong>: every stationary point is a global minimum. If{' '}
          <M t="X" /> has full column rank, <M t="X\bv \ne \mathbf 0" /> whenever <M t="\bv \ne \mathbf 0" />, so <M t="\bv\T H\bv > 0" />: strictly
          convex, and the minimiser is unique.
        </p>
        <Callout kind="theorem" title="What this proves — and what it doesn’t">
          Existence and uniqueness of the least-squares coefficients are <em>algebraic</em> facts about <M t="X" />. They say nothing about whether a
          linear model is appropriate, whether the sample is representative, or whether predictions will be accurate on new data. Those are the
          questions of lessons 8, 11 and 13.
        </Callout>
      </Sec>

      <Sec title="Geometry: least squares is a projection">
        <Figure caption="Every vector Xθ lies in the column space of X. The best one is the foot of the perpendicular from y: the residual is orthogonal to every column.">
          <ProjectionDiagram />
        </Figure>
        <p>
          The normal equations <M t="X\T\be = \mathbf 0" /> say: the residual vector is <strong>orthogonal to every column</strong> of <M t="X" />. Read
          row by row, that is <M t="\sum_j e_j = 0" /> (ones column) and <M t="\sum_j x_{ji}e_j = 0" /> for every feature — the identities from lesson 4,
          now for any <M t="n" />. Intuitively: if the residual had any component along a feature direction, moving <M t="\theta" /> in that direction
          would shrink it, so we were not at the best fit.
        </p>
        <Callout kind="warning">
          This orthogonality lives in <M t="\R^m" /> — the space with one axis per <em>observation</em>. It is not perpendicular distance on the x–y scatter
          plot. Least squares still minimises vertical distances there.
        </Callout>
      </Sec>

      <Sec title="Check: the one-feature case is a special case">
        <p>For one feature,</p>
        <MB t="\begin{gathered} X\T X = \begin{bmatrix} m & \sum_j x_j\\ \sum_j x_j & \sum_j x_j^2\end{bmatrix}, \qquad X\T\by = \begin{bmatrix}\sum_j y_j\\ \sum_j x_jy_j\end{bmatrix}, \\[6pt] \det(X\T X) = m\sum_j x_j^2 - \Big(\sum_j x_j\Big)^2 = m\,S_{xx}. \end{gathered}" />
        <p>
          So “<M t="X\T X" /> invertible” is exactly “<M t="S_{xx} > 0" />” from lesson 4. For the running example <M t="x=(3,6,7,8,11)" />,{' '}
          <M t="y=(13,8,11,2,6)" />:
        </p>
        <MB t="X\T X = \begin{bmatrix}5 & 35\\ 35 & 279\end{bmatrix},\qquad X\T\by = \begin{bmatrix}40\\ 246\end{bmatrix},\qquad \begin{bmatrix}5 & 35\\ 35 & 279\end{bmatrix}\begin{bmatrix}15\\ -1\end{bmatrix} = \begin{bmatrix}40\\ 246\end{bmatrix}. \;\checkmark" />
      </Sec>

      <Sec title="Multiple regression in 3-D">
        <p>
          Now predict weight from height and body-frame size: <M t="\hat w = \theta_0 + \theta_1 h + \theta_2 b" />, minimising{' '}
          <M t="\sum_j \big(w_j - (\theta_0 + \theta_1h_j + \theta_2b_j)\big)^2" />. The fitted object is now a plane, and the residuals are vertical
          distances to it.
        </p>
        <Lab title="Plane of best fit" purpose="Synthetic data generated from a known plane plus noise. Fit, rotate, and resample.">
          <PlaneFit3D />
        </Lab>
        <TryThis
          items={[
            'Set noise to 0. The estimates should equal the true coefficients exactly (up to rounding). Why?',
            'Set noise to 12 and resample several times. Which coefficient is least stable? (Hint: height and frame are correlated in this data, and frame has a much smaller spread.)',
          ]}
        />
      </Sec>

      <Sec title="When the inverse does not exist">
        <p>
          You need <strong>full column rank</strong>, not merely “lots of rows”. Each of these breaks it, regardless of <M t="m" />:
        </p>
        <Table
          head={['Situation', 'Why columns are dependent', 'Consequence']}
          rows={[
            ['Two identical (or proportional) columns', 'col₂ = c · col₁', 'raise one coefficient, lower the other: same predictions'],
            ['A feature that is constant across all rows', 'it is a multiple of the ones column', 'cannot separate its effect from the intercept'],
            ['Height in cm and height in inches', 'proportional columns', 'coefficients not identifiable'],
            ['More coefficients than rows (n + 1 > m)', 'rank ≤ m < n + 1', 'infinitely many exact fits'],
          ]}
        />
        <p>
          A least-squares minimiser still exists in each case (the loss is still a convex bowl, now with a flat valley along the null-space direction),
          but it is not unique and <M t="(X\T X)^{-1}" /> is invalid. Ridge regression (lesson 10) restores uniqueness by adding <M t="\lambda I" />.
        </p>
      </Sec>

      <Sec title="A computing note">
        <p>
          Forming <M t="X\T X" /> costs about <M t="O(mn^2)" /> and solving the <M t="(n+1)\times(n+1)" /> system <M t="O(n^3)" />. That is cheap for
          tens or hundreds of features and expensive for very many — one reason iterative methods like gradient descent (next lesson) exist. In practice,
          libraries solve the linear system (or use a QR decomposition) rather than computing an explicit inverse, which is slower and less accurate.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l5.q1"
          q={<p>Why are the terms <M t="\by\T X\theta" /> and <M t="\theta\T X\T\by" /> equal?</p>}
          options={[
            { text: 'Because X is symmetric.', why: 'X is m × (n+1); it is generally not even square.' },
            { text: 'Because each is a 1×1 scalar, and a scalar equals its transpose.', correct: true, why: '(𝐲ᵀXθ)ᵀ = θᵀXᵀ𝐲, and a 1×1 matrix is its own transpose.' },
            { text: 'Because matrix multiplication is commutative.', why: 'It is not; the equality here is a transpose identity.' },
          ]}
        />
        <Quiz
          id="l5.q2"
          q={<p>Your design matrix has an intercept column and two features that are exact copies. With 10,000 rows, the OLS coefficients are…</p>}
          options={[
            { text: 'unique, because m is large', why: 'Rank depends on column dependence, not row count.' },
            { text: 'not unique: only the sum of the two copies’ coefficients is determined', correct: true, why: 'Increase one and decrease the other by the same amount and every prediction is unchanged.' },
            { text: 'all zero', why: 'Nothing forces zeros; the fit still uses the information in the feature.' },
          ]}
        />
        <Quiz
          id="l5.q3"
          q={<p>What does <M t="X\T\be = \mathbf 0" /> mean geometrically?</p>}
          options={[
            { text: 'The fitted line is perpendicular to the data points.', why: 'The orthogonality is in ℝᵐ (one axis per observation), not on the scatter plot.' },
            { text: 'The residual vector is orthogonal to every column of X.', correct: true, why: 'Each row of Xᵀ is a column of X, so each entry of Xᵀe is a dot product of a column with e.' },
            { text: 'All residuals are zero.', why: 'Only their dot products with the columns vanish.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        <M t="\nabla\|\by - X\theta\|^2 = -2X\T(\by - X\theta)" />. Setting it to zero gives <M t="X\T X\hat\theta = X\T\by" />: the residual is orthogonal to
        every column of <M t="X" />. The Hessian <M t="2X\T X" /> is positive semi-definite, so this is a global minimum; full column rank makes it unique
        and gives <M t="\hat\theta = (X\T X)^{-1}X\T\by" />.
      </Callout>

      <Checklist id="matrix" items={CHECKS.matrix} />
    </>
  );
}
