import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../components/ui';
import { ForwardSelectionLab, MetricsLab, ProtocolLab } from '../interactives/EvalLab';

export default function L11Evaluation() {
  return (
    <>
      <Sec title="A training optimum answers only a training question">
        <p>
          Every fitting method so far minimises an objective on the training sample. But that sample has already shaped the fit, so its error is an
          optimistic report card. What we actually want is <strong>generalisation</strong>: the ability to predict well on new, previously
          unseen data drawn from the same distribution. To measure that, we must hold data back.
        </p>
        <Table
          head={['Split', 'Used for', 'May influence']}
          rows={[
            ['Training', 'estimating the parameters θ (and data-dependent preprocessing like feature means/scales)', 'θ, scaling constants'],
            ['Validation', 'unbiased comparison of fitted models while tuning hyperparameters', 'degree, λ, k, which features'],
            ['Test', 'a final estimate of performance once every choice is fixed', 'nothing — it is only reported'],
          ]}
        />
        <Callout kind="warning" title="“Unseen” does not mean “unlabelled”">
          It is often said that in practice we don’t know the labels of test data — that describes real deployment inputs. To <em>compute</em> a test error,
          the evaluator needs the true targets. “Unseen” means withheld from fitting and tuning, not that the labels can never be known.
        </Callout>
      </Sec>

      <Sec title="Parameters versus hyperparameters">
        <p>
          The coefficients <M t="\theta" /> are <strong>parameters</strong>: estimated by fitting. Polynomial degree, ridge <M t="\lambda" />, the number
          of neighbours <M t="k" /> are <strong>hyperparameters</strong>: they control the model family or fitting procedure, and training error alone
          cannot choose them (it always prefers the most flexible option).
        </p>
        <p>
          <strong>Grid search</strong>: list candidate values, fit each on the training data, evaluate each on the validation data with the
          same metric, pick the best. Then — once — evaluate the chosen model on the test set.
        </p>
        <Table
          head={['Ridge λ', 'Training MSE', 'Validation MSE']}
          rows={[
            ['0', '1.0', '4.0'],
            [<strong>1</strong>, '1.4', <strong>2.3</strong>],
            ['10', '3.8', '4.2'],
          ]}
        />
        <p>
          Choose λ = 1. The λ = 0 model fits the training data best but generalises worst of the three; λ = 10 underfits.
        </p>
        <Lab
          title="Follow the protocol"
          purpose="Ten candidate models (polynomial degrees 0–9) were fitted on training data. Choose one using validation error only, then lock in to see its test error."
        >
          <ProtocolLab />
        </Lab>
        <TryThis
          items={[
            'Pick the degree with the lowest validation MSE and lock in. Is its test MSE close to its validation MSE?',
            'Reset, then “peek” at the test errors first. Notice the temptation — and why a number chosen that way is no longer an honest estimate.',
          ]}
        />
        <Callout kind="intuition" title="Going deeper: cross-validation">
          With little data, a single validation split is noisy. <strong>k-fold cross-validation</strong> splits the training data into k parts, validates on
          each in turn while training on the rest, and averages the k validation errors. It is the same idea — never score a model on data it was fitted
          to — used more efficiently.
        </Callout>
      </Sec>

      <Sec title="Evaluation metrics">
        <p>On an evaluation set of <M t="m" /> examples with residuals <M t="e_j = y_j - \hat y_j" />:</p>
        <MB t="\RMSE = \sqrt{\frac1m\sum_{j=1}^m (y_j - \hat y_j)^2}, \qquad \MAE = \frac1m\sum_{j=1}^m |y_j - \hat y_j|," />
        <MB t="R^2 = 1 - \frac{\sum_j (y_j - \hat y_j)^2}{\sum_j (y_j - \bar y)^2} = 1 - \frac{\SSE}{\SST} \in (-\infty, 1], \qquad R^2_{\text{adj}} = 1 - \frac{(1 - R^2)(m - 1)}{m - n - 1}," />
        <p>where <M t="n" /> is the number of predictors (excluding the intercept). How to read them:</p>
        <Table
          head={['Metric', 'Units', 'Reading']}
          rows={[
            ['RMSE', 'same as y', 'typical size of an error, emphasising large ones; default for most models; only meaningful relative to a baseline or another model'],
            ['MAE', 'same as y', 'average absolute error; less sensitive to a few big misses'],
            ['R²', 'none', 'fraction of the variance of y (around ȳ) explained by the model; 0 = no better than predicting ȳ; < 0 = worse'],
            ['Adjusted R²', 'none', 'R² penalised for the number of predictors; can fall when a useless feature is added'],
          ]}
        />
        <Lab title="Metrics calculator" purpose="Edit y and ŷ (preloaded with the running example’s fitted values) and read every metric at once.">
          <MetricsLab />
        </Lab>
        <p>
          For the running example the residuals are <M t="(1, -1, 3, -5, 2)" />: <M t="\SSE = 40" />, <M t="\SST = 74" />, so{' '}
          <M t="\MSE = 8" />, <M t="\RMSE = \sqrt8 \approx 2.83" />, <M t="\MAE = 2.4" />, <M t="R^2 = 1 - 40/74 = 17/37 \approx 0.459" />, and with{' '}
          <M t="m = 5, n = 1" />: <M t="R^2_{\text{adj}} = 1 - (20/37)(4/3) = 31/111 \approx 0.279" />. These are <em>training</em> numbers — no evidence
          about new data.
        </p>
        <Callout kind="warning" title="Reading the numbers responsibly">
          <ul>
            <li>
              RMSE and MSE always rank models the same way on one dataset (square root is increasing); MAE can rank them differently.
            </li>
            <li>
              The absolute value of RMSE does not say whether a model is “bad” — 5 is tiny for house prices in dollars and huge for exam marks
              out of 10. Compare against a baseline and the application’s tolerance.
            </li>
            <li>
              Training R² of OLS with an intercept is ≥ 0 (the constant model is a candidate). A <em>test</em> R² can be negative — it means the model
              is worse than predicting the test mean, not that you made an arithmetic error.
            </li>
            <li>If all targets are equal, SST = 0 and R² is undefined.</li>
          </ul>
        </Callout>
      </Sec>

      <Sec title="Model selection: reducing complexity">
        <p>With many candidate features (some of them products or powers), using all of them gives an overly complex model. Three strategies:</p>
        <ol>
          <li>
            <strong>Subset selection</strong> — search over subsets of features; each subset is a different model.
          </li>
          <li>
            <strong>Shrinkage</strong> — one model; regularisation pushes unimportant coefficients to (near) zero (lesson 10).
          </li>
          <li>
            <strong>Dimensionality reduction</strong> — project inputs into a lower-dimensional space (different from subset selection).
          </li>
        </ol>
        <p>
          Exhaustive subset search is exponential (<M t="2^n" /> subsets), so historically <strong>stepwise</strong> greedy searches are used:{' '}
          <em>forward selection</em> (start empty, add the feature that improves fit most), <em>backward elimination</em> (start full, remove the
          feature whose loss hurts least), or <em>bidirectional</em> (both, testing at each step). Fit quality is often judged by the change in R².
        </p>
        <Lab title="Forward selection, traced" purpose="Each step tries every remaining feature and greedily keeps the one with the largest R².">
          <ForwardSelectionLab />
        </Lab>
        <Callout kind="note" title="Greedy is not optimal">
          Forward selection makes the best <em>immediate</em> move. It can miss the best subset of a given size — e.g. when two features are only useful
          together. And because R² can never decrease when a feature is added (nested models), raw R² can’t tell you when to stop; use adjusted R² or,
          better, validation error.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l11.q1"
          q={<p>You try 30 values of λ and report the one with the lowest <em>test</em> MSE as your final performance. What is wrong?</p>}
          options={[
            { text: 'Nothing: no coefficients were fitted on the test set.', why: 'Selection is a form of fitting. The test data influenced which model you report.' },
            { text: 'The test set was used for model selection, so the reported error is optimistically biased.', correct: true, why: 'Choose λ on validation data; touch the test set once, at the end.' },
            { text: 'You should have used training MSE instead.', why: 'Training error always prefers λ = 0 and cannot choose λ.' },
          ]}
        />
        <Quiz
          id="l11.q2"
          q={<p>Residuals are (0, 0, 6). What are MAE and RMSE?</p>}
          options={[
            { text: 'MAE = 2, RMSE = √12 ≈ 3.46', correct: true, why: 'MAE = 6/3 = 2; MSE = 36/3 = 12. Squared loss emphasises the single big miss.' },
            { text: 'MAE = 2, RMSE = 2', why: 'RMSE ≥ MAE, with equality only when all |eⱼ| are equal.' },
            { text: 'MAE = 6, RMSE = 6', why: 'Both are averages over m = 3 examples.' },
          ]}
        />
        <Quiz
          id="l11.q3"
          q={<p>A model has test R² = −0.3. The most accurate interpretation is…</p>}
          options={[
            { text: 'There must be a bug: R² is a squared quantity.', why: 'Despite the name, R² = 1 − SSE/SST can be negative on data the model was not fitted to.' },
            { text: 'On the test set, predicting the test mean would have had lower squared error than the model.', correct: true, why: 'R² < 0 ⇔ SSE > SST.' },
            { text: 'The model explains 30% of the variance in the opposite direction.', why: 'There is no such interpretation.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Fit parameters on training data, choose hyperparameters on validation data, and report once on untouched test data. RMSE and MAE are in the
        units of y and need a baseline to interpret; R² compares against predicting the mean and can be negative on new data; adjusted R² penalises
        extra predictors. Greedy subset selection, shrinkage and dimensionality reduction are three ways to control complexity.
      </Callout>

      <Checklist id="evaluation" items={CHECKS.evaluation} />
    </>
  );
}
