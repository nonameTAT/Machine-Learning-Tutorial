import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, TryThis } from '../components/ui';
import { InteractionLab, PolyFeatureLab } from '../interactives/FeatureLab';

export default function L09Features() {
  return (
    <>
      <Sec title="“Linear” in which quantities?">
        <p>
          It is tempting to think linear regression can only draw straight lines and planes. That is not quite right. Look at what the
          least-squares machinery actually needed: predictions of the form <M t="X\theta" />, i.e. <em>linear in the unknown parameters</em>. The columns
          of <M t="X" /> can be any fixed functions of the raw inputs that we compute before fitting.
        </p>
        <p>So create new features from old ones:</p>
        <MB t="\hat y = \theta_0 + \theta_1x_1 + \theta_2x_1^2, \qquad x_2 := x_1^2 \;\;\Longrightarrow\;\; \hat y = \theta_0 + \theta_1x_1 + \theta_2x_2." />
        <MB t="\begin{gathered} \hat y = \theta_0 + \theta_1x_1 + \theta_2x_1^2 + \theta_3x_1^3, \qquad x_2 := x_1^2,\; x_3 := x_1^3 \\ \Longrightarrow\;\; \hat y = \theta_0 + \theta_1x_1 + \theta_2x_2 + \theta_3x_3 \;\;\text{(ordinary multiple regression)}. \end{gathered}" />
        <p>
          In general, choose a feature map <M t="\phi(x) = (1, x, x^2, \dots, x^d)\T" /> and fit <M t="\hat y = \theta\T\phi(x)" />. Each row of the
          design matrix becomes <M t="(1, x_j, x_j^2, \dots, x_j^d)" />, and every formula from lessons 4–6 applies unchanged.
        </p>
        <Callout kind="definition" title="Linear vs nonlinear regression">
          A model is <strong>linear regression</strong> if the prediction is a linear combination of fixed features with the unknown parameters as
          weights — however curved it is in <M t="x" />. <strong>Nonlinear regression</strong> has parameters entering nonlinearly, such as{' '}
          <M t="\hat y = \dfrac{\theta_1 x}{\theta_2 + x}" />: no fixed column can carry <M t="\theta_2" /> in the denominator, so the normal
          equations no longer apply.
        </Callout>
      </Sec>

      <Sec title="Explore: polynomial features">
        <Lab
          title="Polynomial regression is linear regression"
          purpose="Increase the degree and watch the fitted curve, the training error, and (optionally) the error on data the fit never saw."
        >
          <PolyFeatureLab />
        </Lab>
        <TryThis
          items={[
            'Degree 0 predicts a constant (the mean); degree 1 is a line. Both underfit this curved data — the residuals would show a U (lesson 8).',
            'Step through degrees 1→9 with only training data shown. Training MSE never goes up. Why must that be true?',
            'Now show held-out data. Which degree predicts the unseen points best? Compare with the true curve.',
            'At degree 9 the curve has 10 coefficients for 15 points. Look at its behaviour near the ends of the x-range.',
          ]}
        />
        <Callout kind="theorem" title="Why training error cannot increase with degree">
          The degree-<M t="(d+1)" /> family contains the degree-<M t="d" /> family: set <M t="\theta_{d+1} = 0" />. Least squares picks the best member of
          its family, so the bigger family’s best training SSE is at most the smaller one’s. This guarantee is about <em>training</em> error only — it
          says nothing about new data.
        </Callout>
        <p>
          That gap between training and held-out behaviour is the central question: <em>how do we control the complexity of the model to avoid
          overfitting?</em> Lessons 10 (regularisation), 11 (validation) and 13 (bias–variance) answer it from three directions.
        </p>
      </Sec>

      <Sec title="Categorical inputs: indicator variables">
        <p>
          Regression needs numbers, but many inputs are categories. An <strong>indicator</strong> (binary, dummy) variable takes the value 1 if a
          condition holds and 0 otherwise. Let <M t="D = 1" /> if a patient takes a drug. To model blood pressure while holding age fixed:
        </p>
        <MB t="\hat y = 70 + 5D + 0.44\,\text{Age}." />
        <p>
          Substituting the two values: <M t="D=0" /> gives <M t="70 + 0.44\,\text{Age}" />; <M t="D=1" /> gives <M t="75 + 0.44\,\text{Age}" />. So
          “taking the drug” corresponds to a predicted difference of 5 units <em>at any fixed age</em> — two parallel lines.
        </p>
        <p>
          What if the drug’s effect depends on age? Add an <strong>interaction</strong> feature <M t="z = D\times\text{Age}" />:
        </p>
        <MB t="\begin{gathered} \hat y = 70 + 5D + 0.44\,\text{Age} + 0.21\,z \\ \Longrightarrow\quad D=0:\; \hat y = 70 + 0.44A, \qquad D=1:\; \hat y = 75 + 0.65A. \end{gathered}" />
        <p>
          Now the gap is <M t="5 + 0.21A" />: at age 40 it is 13.4. The model is still linear in its four parameters — <M t="z" /> is just another
          column computed before fitting.
        </p>
        <Lab title="Indicators and interactions" purpose="Toggle the interaction term and move the age marker to read the predicted gap between groups.">
          <InteractionLab />
        </Lab>
        <Callout kind="warning" title="Two interpretation traps">
          <p>
            With the interaction, the coefficient 5 is the predicted difference <em>at age 0</em>, not “the drug effect”. Report the gap at the ages you
            care about.
          </p>
          <p>
            The regression describes a conditional association in the data. Calling it a <em>causal</em> effect of the drug needs more than the equation —
            e.g. a randomised experiment.
          </p>
        </Callout>
        <Callout kind="intuition" title="More than two categories (going deeper)">
          A category with <M t="k" /> levels (e.g. suburb A, B, C) needs <M t="k-1" /> indicators, with the omitted level as the baseline absorbed by the
          intercept. Using all <M t="k" /> indicators <em>and</em> an intercept makes the indicators sum to the ones column — a rank-deficient design
          (lesson 5), sometimes called the dummy-variable trap.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l9.q1"
          q={<p>Which model is <em>not</em> linear regression?</p>}
          options={[
            { text: <M t="\hat y = \theta_0 + \theta_1 x + \theta_2 x^2" />, why: 'Linear in θ with fixed features 1, x, x².' },
            { text: <M t="\hat y = \theta_0 + \theta_1\log x + \theta_2\sin x" />, why: 'Still linear in θ: log x and sin x are fixed computed columns.' },
            { text: <M t="\hat y = \theta_0 e^{\theta_1 x}" />, correct: true, why: 'θ₁ appears inside the exponential; no fixed column can represent it, so the model is nonlinear in its parameters.' },
          ]}
        />
        <Quiz
          id="l9.q2"
          q={<p>For <M t="\hat y = 10 + 2D + 3x - 0.5Dx" />, at what x do the two groups have the same prediction?</p>}
          options={[
            { text: 'x = 4', correct: true, why: 'The gap is 2 − 0.5x, which is zero at x = 4.' },
            { text: 'x = −4', why: 'Check the sign: 2 − 0.5x = 0 ⇒ x = 4.' },
            { text: 'They never coincide.', why: 'With an interaction the slopes differ, so the lines cross somewhere.' },
          ]}
        />
        <Quiz
          id="l9.q3"
          q={<p>Adding the feature x⁴ to a cubic model, refit by least squares on the same training data. The training SSE…</p>}
          options={[
            { text: 'cannot increase', correct: true, why: 'The quartic family contains every cubic (θ₄ = 0), so its best training fit is at least as good.' },
            { text: 'must strictly decrease', why: 'It can stay the same if the extra column does not help (e.g. it is already in the span of the others).' },
            { text: 'may increase because of overfitting', why: 'Overfitting hurts new-data error, not training error.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Linear regression is linear in the <em>parameters</em>, not in the inputs. Transformed features (powers, logs, indicators, products) are just
        extra columns of <M t="X" />, so curves, group shifts and interactions all use the same least-squares machinery. Bigger feature sets always fit
        training data at least as well — which is exactly why we need a way to control complexity.
      </Callout>

      <Checklist id="features" items={CHECKS.features} />
    </>
  );
}
