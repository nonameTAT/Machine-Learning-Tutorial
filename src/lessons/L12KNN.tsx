import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../components/ui';
import { KNNLab, ScaleLab } from '../interactives/KNNLab';

export default function L12KNN() {
  return (
    <>
      <Sec title="A different hypothesis about the data">
        <p>
          Everything so far has been <em>global</em>: one coefficient vector <M t="\theta" /> describes the whole input space. Local learning starts from
          a different intuition: <strong>inputs that are close should have similar outputs</strong>. So instead of summarising the data in a formula,
          keep the data, and when a query arrives, look at the training examples near it.
        </p>
        <ul>
          <li>It is the simplest form of learning — rote learning, or memorisation — made useful by a notion of similarity.</li>
          <li>The instances themselves represent the knowledge. Names: nearest-neighbour, instance-based, memory-based, case-based learning.</li>
          <li>
            It is <strong>lazy</strong>: there is no training phase that builds a model; the work happens at prediction time.
          </li>
          <li>
            The <strong>distance function defines what is learned</strong> — it is what lets the method go beyond pure memorisation.
          </li>
        </ul>
      </Sec>

      <Sec title="Nearest neighbour and k-nearest-neighbour regression">
        <p>Store all training examples <M t="(\bx_i, f(\bx_i))" />. Given a query <M t="\bx_q" />:</p>
        <ul>
          <li>
            <strong>1-NN:</strong> find the nearest training input <M t="\bx_n" /> and predict <M t="\hat y_q = f(\bx_n)" />.
          </li>
          <li>
            <strong>k-NN:</strong> average the targets of the <M t="k" /> nearest neighbours:
          </li>
        </ul>
        <MB t="\hat y_q = \frac{1}{k}\sum_{i=1}^{k} f(\bx_i), \qquad \bx_1,\dots,\bx_k \text{ the } k \text{ training inputs closest to } \bx_q." />
        <p>
          This averages <em>numeric targets</em> — it is not the majority vote used for classification.
        </p>
        <p>The usual distance is Euclidean over the <M t="n" /> features:</p>
        <MB t="d(\bx_i, \bx_j) = \sqrt{\sum_{k=1}^n (x_{ik} - x_{jk})^2}." />
        <Callout kind="example" title="By hand">
          Store <M t="(x, y) = (0,0), (2,2), (5,5), (9,9)" /> and query <M t="x_q = 3" />. Distances: 3, 1, 2, 6. The nearest point is <M t="x = 2" />, so
          1-NN predicts 2. The two nearest are <M t="x = 2, 5" />, so 2-NN predicts <M t="(2 + 5)/2 = 3.5" />.
        </Callout>
        <Lab title="k-NN and local regression" purpose="Drag across the plot to move the query. The shaded band is the neighbourhood; orange points are the neighbours used.">
          <KNNLab />
        </Lab>
        <TryThis
          items={[
            'With k = 1 and the full curve shown, the prediction is a step function that jumps at midpoints between training inputs and passes through every training point. Training error is 0 — is that good?',
            'Increase k slowly. The curve smooths out; at k = 24 (= m) it is a flat line at ȳ, whatever the query.',
            'Switch to the local linear fit with k ≈ 5. Compare with k-NN averaging near the edges (x near 0 or 10), where all neighbours lie on one side.',
            'Show the true mean and find the k that tracks it best by eye. Small k is noisy (variance); large k flattens the curve (bias).',
          ]}
        />
      </Sec>

      <Sec title="Local regression">
        <p>
          Averaging assumes the target is roughly <em>constant</em> within the neighbourhood. A natural refinement: fit a small linear model{' '}
          <M t="\hat f(\bx) = \theta_0 + \theta_1x_1 + \dots + \theta_nx_n" /> to the <M t="k" /> nearest neighbours of <M t="\bx_q" />, then evaluate it at{' '}
          <M t="\bx_q" />. A fresh fit is made for each query.
        </p>
        <ul>
          <li>Linear, quadratic or higher-order local models can be used.</li>
          <li>The result is a piecewise approximation, useful for nonlinear functions or data whose behaviour changes across the input space.</li>
        </ul>
        <p>
          In the by-hand example, the two nearest points <M t="(2,2), (5,5)" /> lie on <M t="y = x" />, so the local line predicts 3 at{' '}
          <M t="x_q = 3" /> — different from the 2-NN average 3.5. Averaging and fitting a local trend make different assumptions about the same
          neighbourhood.
        </p>
        <Callout kind="warning">
          A unique unregularised local linear fit with <M t="n" /> features needs at least <M t="n + 1" /> neighbours with a full-rank local design
          matrix. In higher dimensions or with small neighbourhoods, local fits can be unstable.
        </Callout>
      </Sec>

      <Sec title="What controls the behaviour">
        <Table
          head={['Choice', 'Effect']}
          rows={[
            ['small k', 'follows individual points (and their noise): low bias, high variance; k = 1 has zero training error'],
            ['large k', 'averages over more points: lower variance, but washes out local structure (higher bias); k = m predicts ȳ everywhere'],
            ['distance & feature scale', 'decide who counts as a neighbour — part of the model, not a detail'],
            ['local model (mean vs line)', 'what is assumed constant inside the neighbourhood'],
          ]}
        />
        <p>k is a hyperparameter: choose it with validation data, just like λ or the polynomial degree.</p>
        <Lab title="Feature scale changes who the neighbours are" purpose="Predict a house price with 2-NN. Toggle standardisation and watch the neighbours change.">
          <ScaleLab />
        </Lab>
        <Callout kind="note">
          A constant column of ones contributes nothing to a distance, so the intercept trick is irrelevant here. As with the penalty in lesson 10, scaling
          constants must be computed from the training data only.
        </Callout>
      </Sec>

      <Sec title="Parametric vs non-parametric; costs">
        <Table
          head={['', 'Linear regression (parametric)', 'k-NN (non-parametric)']}
          rows={[
            ['What is stored', 'n + 1 coefficients', 'the whole training set'],
            ['Training cost', 'solve normal equations / run GD', 'essentially none (lazy)'],
            ['Cost per prediction', <M t="O(n)" />, <M t="O(mn)" />, ],
            ['Shape of the fit', 'fixed by the features you chose', 'adapts to the data; grows with m'],
          ]}
        />
        <Callout kind="intuition" title="Going deeper: the curse of dimensionality">
          In many dimensions, almost all points are far from each other and distances become similar, so “nearest” neighbours are not very near. Local
          methods need far more data as <M t="n" /> grows. This is one reason feature selection and dimensionality reduction matter.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l12.q1"
          q={<p>Store (0, 1), (2, 3), (5, 7), (8, 9). For x_q = 3, what are the 1-NN and 2-NN regression predictions?</p>}
          options={[
            { text: '3 and 5', correct: true, why: 'Distances 3, 1, 2, 5. Nearest is (2, 3) → 3; the two nearest are (2, 3) and (5, 7) → (3 + 7)/2 = 5.' },
            { text: '3 and 4', why: '4 = (1 + 7)/2 averages (0, 1) and (5, 7), but the nearest point is (2, 3) at distance 1, so it must be one of the two.' },
            { text: '7 and 5', why: 'The nearest point is at distance 1, i.e. x = 2.' },
          ]}
        />
        <Quiz
          id="l12.q2"
          q={<p>What does k-NN regression predict when k equals the number of training examples?</p>}
          options={[
            { text: 'The training mean ȳ, for every query.', correct: true, why: 'Every query’s neighbourhood is the whole training set.' },
            { text: 'The nearest training target.', why: 'That is k = 1.' },
            { text: 'The OLS line.', why: 'k-NN averaging never fits a line.' },
          ]}
        />
        <Quiz
          id="l12.q3"
          q={<p>“k-NN is lazy, so there is no model to choose.” Evaluate.</p>}
          options={[
            { text: 'True: the data are the model.', why: 'The data are stored, but k, the distance, the feature scaling and the local rule are all modelling choices.' },
            { text: 'False: k, the distance function, feature scaling and the local averaging/fitting rule determine the predictions.', correct: true, why: '“Lazy” means the computation happens at query time, not that there are no choices.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Local methods predict from training examples near the query: k-NN averages their targets; local regression fits a small model to them. The
        distance (and therefore feature scaling) defines similarity; k trades variance (small k) against bias (large k, down to the constant ȳ at k = m).
        No global parameters are learned, but there are just as many modelling choices.
      </Callout>

      <Checklist id="knn" items={CHECKS.knn} />
    </>
  );
}
