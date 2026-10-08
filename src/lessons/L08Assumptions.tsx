import { M } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../components/ui';
import { AssumptionLab } from '../interactives/AssumptionLab';

export default function L08Assumptions() {
  return (
    <>
      <Sec title="What the model claims">
        <p>
          Lesson 7 derived least squares from a model of how data are generated. Here are the claims that model makes, often remembered as{' '}
          <strong>LINE</strong>: Linearity, Independence, Normality, Equal variance. Treat them as statements about the <em>data-generating
          process</em>, conditional on the inputs. A sample can only give evidence for or against them.
        </p>
        <Table
          head={['Assumption', 'Precise statement', 'Warning sign in a residual plot']}
          rows={[
            ['1. Linearity', <M t="\E[y\mid\bx] = \bx\T\theta" />, 'systematic curve, not a band around 0'],
            ['2. Homoscedasticity', <M t="\Var(y\mid\bx) = \sigma^2" />, 'spread grows (or shrinks) with the fitted value — a fan'],
            ['3. Independence', 'errors of different observations are independent (given the inputs)', 'runs of same-sign residuals in time / collection order'],
            ['4. Normality of residuals', <M t="y\mid\bx \sim \N(\bx\T\theta, \sigma^2)" />, 'strong skew or a few extreme values relative to a bell curve'],
          ]}
        />
        <p>
          These warning signs are qualitative diagnostics that follow from the statements; you do not need a formal testing procedure for this week.
        </p>
      </Sec>

      <Sec title="Diagnose by eye">
        <Lab
          title="Assumption gallery"
          purpose="Each scenario is simulated from a model that breaks exactly one assumption. The same three plots are shown every time: learn what each violation looks like."
        >
          <AssumptionLab />
        </Lab>
        <TryThis
          items={[
            'For each scenario, predict which of the three plots will look wrong before you click.',
            'In “Curved mean”, the histogram can look fine while the residual plot does not. Which plot is the better test of linearity?',
            'Resample “All assumptions hold” a few times. How much apparent structure appears purely by chance? (Calibrating your eye matters.)',
          ]}
        />
      </Sec>

      <Sec title="Three distinctions that prevent common errors">
        <h3>1. Errors are not residuals</h3>
        <p>
          The true error is <M t="\varepsilon_j = y_j - f(\bx_j)" /> with the unknown true mean <M t="f" />. The residual is{' '}
          <M t="e_j = y_j - \hat f(\bx_j)" />, computed from a model fitted to the whole sample. Residuals are our <em>estimate</em> of the errors, and
          they are constrained: with an intercept, <M t="\sum_j e_j = 0" /> exactly. So residuals are not independent even when the errors are — another
          reason the diagnostics are qualitative.
        </p>
        <h3>2. The claim is about y given x, not about y overall</h3>
        <p>
          House prices across a city are typically right-skewed. That does not violate normality: the assumption concerns the distribution of price{' '}
          <em>at a fixed set of features</em>. A mixture of many Gaussians with different means can look anything but Gaussian.
        </p>
        <Callout kind="warning">
          No assumption requires the <em>inputs</em> <M t="\bx" /> to be normally distributed, or even random. The features can be skewed, discrete,
          binary — anything.
        </Callout>
        <h3>3. Algebraic existence is not statistical adequacy</h3>
        <p>
          Full column rank guarantees a unique OLS solution (lesson 5). It does not show the mean is linear, the sample representative, or predictions
          accurate. Conversely, non-Gaussian noise does not stop you computing least squares; it weakens the maximum-likelihood justification.
        </p>
      </Sec>

      <Sec title="A short reasoning example">
        <p>
          Small and large houses both have residuals centred on zero, but large houses scatter far more. What should you conclude?
        </p>
        <p>
          The evidence is <em>compatible</em> with a reasonable mean model and <em>inconsistent</em> with constant variance. “Linear regression fails” is
          too imprecise: the OLS calculation is still possible and the line may still be useful; what is questionable is the equal-weighting,
          common-variance Gaussian interpretation. Precise diagnosis → precise remedy (e.g. model log-price, or weight observations).
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l8.q1"
          q={<p>A residuals-vs-fitted plot shows a clear U shape. Which assumption is most directly in doubt?</p>}
          options={[
            { text: 'Linearity of the conditional mean.', correct: true, why: 'Systematic curvature means the mean of y is not linear in the features used.' },
            { text: 'Normality of the residuals.', why: 'A U shape is about where the residuals are centred, not their distribution’s shape.' },
            { text: 'Homoscedasticity.', why: 'That is about spread changing, which shows as a fan rather than a curve.' },
          ]}
        />
        <Quiz
          id="l8.q2"
          q={<p>True or false: “linear regression requires the input x to be normally distributed.”</p>}
          options={[
            { text: 'True', why: 'None of the four assumptions concerns the distribution of x.' },
            { text: 'False', correct: true, why: 'Normality is about the noise around the mean at each fixed x. Inputs can have any distribution.' },
          ]}
        />
        <Quiz
          id="l8.q3"
          q={<p>Daily sales are regressed on advertising spend. Residuals plotted by date show long runs of positive then negative values. The issue is…</p>}
          options={[
            { text: 'heteroscedasticity', why: 'Runs over time point to dependence, not changing spread.' },
            { text: 'dependence between errors', correct: true, why: 'Successive days share unmodelled influences, so errors are correlated.' },
            { text: 'non-normality', why: 'Each residual could be perfectly Gaussian and still be correlated with its neighbours.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        The four assumptions — linear conditional mean, constant conditional variance, independent errors, Gaussian errors — are claims about{' '}
        <M t="y" /> <em>given</em> <M t="\bx" />. Residual plots give qualitative evidence about them. Violations do not stop least squares from computing;
        they change what the fit means and which remedy is appropriate.
      </Callout>

      <Checklist id="assumptions" items={CHECKS.assumptions} />
    </>
  );
}
