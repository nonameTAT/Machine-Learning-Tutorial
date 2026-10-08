import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../components/ui';
import { DesignMatrixDemo, HouseLab, Pipeline } from '../interactives/HouseLab';

export default function L01Learning() {
  return (
    <>
      <Sec title="Start with a prediction you actually want">
        <p>
          Suppose you want to estimate what a house will sell for <em>before</em> it is sold. You have records of past sales: each house is described by
          its size, number of bedrooms and bathrooms, and age, and — crucially — you know the price it actually sold for. Those known prices are what
          make learning possible: any proposed prediction rule can be checked against them.
        </p>
        <p>
          This is the shape of <strong>supervised learning</strong>: every training input comes with the answer (the <em>label</em> or <em>target</em>)
          we want to predict. When the target is a number, the task is <strong>regression</strong>; when it is a category (spam / not spam), it is{' '}
          <strong>classification</strong>.
        </p>
        <Table
          head={['', 'Supervised', 'Unsupervised']}
          rows={[
            ['Training data', 'inputs and their targets', 'inputs only'],
            ['Typical question', '“predict y for this new x”', '“what structure is in these x’s?”'],
            ['Examples', 'house prices (regression), spam filtering (classification)', 'clustering customers, dimensionality reduction'],
            ['How we judge it', 'compare predictions with known targets via a loss', 'harder — there is no answer key'],
          ]}
        />
        <p>
          Why does supervised learning dominate applications? The answer is about <em>measurability</em>: with targets
          available it is easy to define an error measure — a <strong>loss function</strong> — and use it to compare algorithms, parameter settings and
          data transformations. Without targets, even deciding what “good” means is a research problem. The catch is that high-quality labels
          are expensive, which motivates semi-supervised, self-supervised and transfer learning.
        </p>
        <Callout kind="warning">
          Coding a category as 0/1 does not turn classification into regression. “Spam = 1, not spam = 0” still has no meaningful in-between value, and
          the right loss and model are different. Regression is about targets where differences and averages make sense.
        </Callout>
      </Sec>

      <Sec title="Where the model sits in the pipeline">
        <p>
          The learning algorithm is only one stage. Before it, someone decided which data to retrieve, cleaned it, and chose a{' '}
          <em>representation</em> — the features. After it, the model is evaluated, tuned and eventually deployed and monitored. The arrows loop: poor
          evaluation sends you back to earlier stages.
        </p>
        <Pipeline />
        <Callout kind="intuition">
          Optimisation can only choose among the functions your representation allows. If the price really depends on location and you never provide a
          location feature, no amount of clever fitting will recover it. Feature preparation decides <em>what can be learned</em>; the algorithm
          decides <em>which</em> of those options is chosen.
        </Callout>
      </Sec>

      <Sec title="A model is a family of candidate rules">
        <p>
          Fit a linear regression equation to ten houses:
        </p>
        <MB t="\widehat{\text{Price}} = -8775.58 + 147.12\,\text{Size} + 9660.37\,\text{Beds} + 25691.99\,\text{Baths} - 1285.01\,\text{Age}" />
        <p>
          Read it as a recipe: start from a base amount (the <strong>intercept</strong>), then add a fixed amount per unit of each feature. Each
          coefficient is the change in the <em>prediction</em> for a one-unit increase in that feature <em>with the other features held fixed</em>. So the
          model says: one extra square foot adds about $147; one extra year of age subtracts about $1,285.
        </p>
        <Lab
          title="Build a prediction term by term"
          purpose="Move the sliders and watch each term's contribution. Click a training house to compare the fitted value with what it actually sold for."
        >
          <HouseLab />
        </Lab>
        <TryThis
          items={[
            <>
              Set size to 600 and bedrooms/bathrooms to 0. The prediction can go negative. What does that tell you about using the intercept (
              <M t="-8775.58" />) as “the price of a house with nothing”?
            </>,
            <>Click through the ten houses. Are the residuals all zero? Should they be?</>,
            <>Keep everything else fixed and add one bedroom. Does the prediction change by exactly the bedroom coefficient? Why must it?</>,
          ]}
        />
        <Callout kind="warning" title="Two interpretation traps">
          <p>
            <strong>Extrapolation.</strong> The intercept is the prediction at size 0, 0 bedrooms, 0 bathrooms, age 0 — a house that is not in the data and
            does not exist. Coefficients describe the fitted rule near the data, not a law valid everywhere.
          </p>
          <p>
            <strong>Causation.</strong> “+$9,660 per bedroom, holding size fixed” is a statement about the fitted predictor, not a promise that adding a
            bedroom wall would raise the sale price by that much.
          </p>
        </Callout>
      </Sec>

      <Sec title="Fix the notation before calculating">
        <p>
          With one input, the model is <M t="\hat y = \theta_0 + \theta_1 x" /> — also written <M t="\hat y = bx + c" />. The assumption behind
          it is that the <em>expected</em> output given the input, <M t="\E[y \mid x]" />, is linear in <M t="x" />. Individual observations
          scatter around that line; they are not required to lie on it.
        </p>
        <p>
          With <M t="n" /> features we write:
        </p>
        <MB t="\hat y = h_\theta(\bx) = \theta_0 + \theta_1 x_1 + \cdots + \theta_n x_n = \sum_{i=0}^{n} \theta_i x_i = \bx\T\theta, \qquad x_0 := 1." />
        <p>
          The trick <M t="x_0 = 1" /> absorbs the intercept into the dot product, so every formula later treats the intercept like any other coefficient.
          Throughout this guide <M t="m" /> is the number of observations and <M t="n" /> the number of features <em>excluding</em> the intercept.
        </p>
        <Table
          head={['Object', 'Shape', 'Meaning']}
          rows={[
            [<M t="\bx_j = (1, x_{j1}, \dots, x_{jn})\T" />, <M t="(n+1)\times 1" />, 'one augmented input (house j)'],
            [<M t="X" />, <M t="m \times (n+1)" />, <>
                design matrix; row <M t="j" /> is <M t="\bx_j\T" />; first column all ones
              </>],
            [<M t="\theta = (\theta_0,\dots,\theta_n)\T" />, <M t="(n+1)\times 1" />, 'intercept and feature coefficients'],
            [<M t="\by = (y_1,\dots,y_m)\T" />, <M t="m \times 1" />, 'observed targets'],
            [<M t="\hat\by = X\theta" />, <M t="m \times 1" />, 'all predictions at once'],
          ]}
        />
        <Lab title="ŷ = Xθ is just one dot product per row" purpose="Click a row of X to trace how its prediction is assembled.">
          <DesignMatrixDemo />
        </Lab>
        <Callout kind="note" title="Why the column of ones matters">
          Multiplying the ones column by <M t="\theta_0" /> adds the same constant to every prediction. Forget it and the fitted plane is forced through
          the origin — every prediction at <M t="\bx = \mathbf 0" /> becomes 0. Many hand-calculation errors start here.
        </Callout>
        <p>
          <strong>Univariate</strong> regression uses one feature; <strong>multiple</strong> (multivariable) regression uses several to predict one output.
          The algebra is identical once you use <M t="X" />; only the number of columns changes.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l1.q1"
          q={<p>A dataset has 200 houses and 4 features. What is the shape of the design matrix X (with the intercept column)?</p>}
          options={[
            { text: '4 × 200', why: 'Rows are observations, not features.' },
            { text: '200 × 4', why: 'This forgets the column of ones for the intercept.' },
            { text: '200 × 5', correct: true, why: 'm = 200 rows (one per house), n + 1 = 5 columns (ones column plus 4 features).' },
            { text: '5 × 5', why: 'That is the shape of XᵀX, not X.' },
          ]}
        />
        <Quiz
          id="l1.q2"
          q={<p>Predicting tomorrow’s maximum temperature (°C) from today’s readings is…</p>}
          options={[
            { text: 'Regression, because the target is a number where differences are meaningful.', correct: true, why: 'The target is numeric and continuous: being off by 1°C vs 5°C matters, and the loss should reflect that.' },
            { text: 'Classification, because temperatures are recorded to whole degrees.', why: 'Rounding the record does not make the target a category; 21°C and 22°C are still ordered and their difference is meaningful.' },
            { text: 'Unsupervised, because the future is unknown.', why: 'Historical data contain past “tomorrows”, so training targets exist. It is supervised.' },
          ]}
        />
        <Quiz
          id="l1.q3"
          q={<p>The assumption “<M t="\E[y\mid x]" /> is linear in x” means…</p>}
          options={[
            { text: 'every observed point lies exactly on a straight line', why: 'Observations scatter around the line; the claim is about their average at each x.' },
            { text: 'the average of y at each fixed x lies on a straight line', correct: true, why: 'It constrains the conditional mean. Individual y’s include noise around that mean.' },
            { text: 'x and y are both normally distributed', why: 'Linearity says nothing about the distribution of x; normality of errors is a separate assumption (lesson 8).' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A regression model is a family of rules <M t="h_\theta(\bx) = \bx\T\theta" /> indexed by parameters. Learning means choosing <M t="\theta" /> using
        examples with known targets. Before any calculation: put a 1 in front of every input, know the shapes of <M t="X" />, <M t="\theta" /> and{' '}
        <M t="\by" />, and remember that coefficients describe the fitted predictor near the data — not causes, and not behaviour far from the data.
      </Callout>

      <Checklist id="learning" items={CHECKS.learning} />
    </>
  );
}
