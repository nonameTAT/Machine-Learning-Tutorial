import type { ReactNode } from 'react';
import { M, MB } from '../components/Math';
import { Callout, Sec } from '../components/ui';

function Row({ f, note }: { f: string; note?: ReactNode }) {
  return (
    <div className="ref-row">
      <MB t={f} />
      {note && <div className="ref-note">{note}</div>}
    </div>
  );
}

export default function Reference() {
  return (
    <>
      <div className="btn-row">
        <button className="btn" onClick={() => window.print()}>
          Print / save as PDF
        </button>
        <span className="kbd-hint">
          m = observations, n = predictors excluding the intercept, <M t="\bx_j = (1, x_{j1}, \dots, x_{jn})\T" />.
        </span>
      </div>

      <Sec title="Model and least squares">
        <Row f="\hat y = h_\theta(\bx) = \bx\T\theta,\qquad \hat\by = X\theta,\qquad X \in \R^{m\times(n+1)}" note="first column of X is all ones" />
        <Row f="\SSE(\theta) = \RSS = \|\by - X\theta\|^2 = \sum_j (y_j - \bx_j\T\theta)^2,\qquad \MSE = \SSE/m" note="same minimiser, minimum differs by 1/m" />
        <Row f="\nabla\SSE = -2X\T(\by - X\theta),\qquad X\T X\hat\theta = X\T\by" note="normal equations ⇔ residual orthogonal to every column: Xᵀe = 0" />
        <Row f="\hat\theta = (X\T X)^{-1}X\T\by" note="only if X has full column rank; Hessian 2XᵀX ⪰ 0 ⇒ global minimum" />
      </Sec>

      <Sec title="One feature, free intercept">
        <Row
          f="\hat\theta_1 = \frac{S_{xy}}{S_{xx}} = \frac{\Cov(x,y)}{\Var(x)} = r\frac{s_y}{s_x},\qquad \hat\theta_0 = \bar y - \hat\theta_1\bar x"
          note="needs S_xx > 0; line passes through (x̄, ȳ)"
        />
        <Row f="\sum_j e_j = 0,\qquad \sum_j x_je_j = 0" note="training residuals of a fit with an intercept" />
        <Row f="x' = x + a:\quad \theta_0 + \theta_1x = (\theta_0 - \theta_1a) + \theta_1x'" note="translation changes only the intercept" />
      </Sec>

      <Sec title="Statistics">
        <Row f="\bar x = \frac1N\sum_i x_i,\qquad s^2 = \frac{1}{N-1}\sum_i (x_i - \bar x)^2,\qquad \E[s^2] = \sigma^2" note="s itself is biased; sample range is biased low" />
        <Row f="\Cov(x,y) = \frac{\sum_i(x_i - \bar x)(y_i - \bar y)}{N-1} = \frac{\sum_i x_iy_i - N\bar x\bar y}{N-1},\qquad r = \frac{\Cov(x,y)}{s_xs_y}\in[-1,1]" note="r measures linear association only; not causation" />
      </Sec>

      <Sec title="Gradient descent">
        <Row f="\theta^{(t+1)} = \theta^{(t)} - \alpha\nabla J(\theta^{(t)})" note="update all components from the old θ" />
        <Row f="\text{Batch (MSE):}\quad \theta^{(t+1)} = \theta^{(t)} + \frac{2\alpha}{m}X\T(\by - X\theta^{(t)})" />
        <Row f="\text{SGD / LMS (one example):}\quad \theta_i \leftarrow \theta_i + 2\alpha\,(y_j - \bx_j\T\theta)\,x_{ji}" />
        <Row f="\text{MSE converges iff } 0 < \alpha < 1/\lambda_{\max}(X\T X/m)" note="ill-conditioning (large eigenvalue ratio) ⇒ slow; centring/scaling helps" />
      </Sec>

      <Sec title="Probabilistic view">
        <Row f="y_j = \bx_j\T\theta + \varepsilon_j,\quad \varepsilon_j \overset{\text{iid}}{\sim} \N(0,\sigma^2)\;\Longrightarrow\; \ell(\theta) = -\frac m2\log(2\pi\sigma^2) - \frac{\SSE(\theta)}{2\sigma^2}" note="MLE = OLS; σ² does not affect θ̂" />
        <div className="ref-note" style={{ marginBottom: 12 }}>
          Assumptions: linear conditional mean · constant variance · independent errors · Gaussian errors — all about y <em>given</em> x.
        </div>
      </Sec>

      <Sec title="Regularisation">
        <Row f="\text{Ridge: } \|\by - X\theta\|^2 + \lambda\theta\T D\theta \;\Rightarrow\; \hat\theta = (X\T X + \lambda D)^{-1}X\T\by" note="D = diag(0,1,…,1) (unpenalised intercept); D → I if all entries penalised" />
        <Row f="\text{with } \MSE \text{ instead of } \SSE:\quad (X\T X + m\lambda D)\hat\theta = X\T\by" />
        <Row f="\text{1 feature: } \hat\theta_1 = \frac{S_{xy}}{S_{xx} + \lambda}" />
        <Row f="\text{LASSO: } \|\by - X\theta\|^2 + \lambda\sum_{i\ge1}|\theta_i|" note="no closed form; exact zeros ⇒ sparse. Standardise features first; choose λ on validation data" />
      </Sec>

      <Sec title="Evaluation">
        <Row f="\RMSE = \sqrt{\MSE},\qquad \MAE = \frac1m\sum_j|e_j|" note="same units as y; RMSE emphasises large errors" />
        <Row f="R^2 = 1 - \frac{\SSE}{\SST},\qquad \SST = \sum_j(y_j - \bar y)^2" note="R² ∈ (−∞, 1]; test R² < 0 ⇔ worse than predicting the mean" />
        <Row f="R^2_{\text{adj}} = 1 - \frac{(1 - R^2)(m - 1)}{m - n - 1}" note="requires m > n + 1" />
        <div className="ref-note" style={{ marginBottom: 12 }}>
          Train → fit θ · Validation → choose degree / λ / k / features · Test → report once.
        </div>
      </Sec>

      <Sec title="Local regression and bias–variance">
        <Row f="\hat y_q = \frac1k\sum_{i\in N_k(\bx_q)} y_i,\qquad d(\bx_i,\bx_j) = \sqrt{\textstyle\sum_k (x_{ik} - x_{jk})^2}" note="k = 1: zero training error; k = m: predicts ȳ; scale features first" />
        <Row
          f="\E\big[(y - \hat f_D(x))^2\big] = \underbrace{(f(x) - \E_D[\hat f_D(x)])^2}_{\Bias^2} + \underbrace{\Var_D(\hat f_D(x))}_{\text{variance}} + \underbrace{\sigma^2}_{\text{irreducible}}"
          note="fixed x; expectation over training sets D and test noise; against f(x) instead of y, drop σ²"
        />
      </Sec>

      <Callout kind="key">
        Choose a representation and an objective, fit on training data, and evaluate on data that did not drive any choice. Least squares makes the
        fitting step explicit; regularisation and local methods change the allowed behaviour; bias–variance explains why fitting the training sample more
        closely need not improve future predictions.
      </Callout>
    </>
  );
}
