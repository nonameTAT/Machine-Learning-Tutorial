import { M, MB } from '../../components/Math';
import { ProblemSet, problemIds, type Problem, type ProblemGroup } from '../../components/ProblemSet';
import { Callout, Table } from '../../components/ui';

// Week 2 practice problems and solutions.

const A: Problem[] = [
  {
    id: 'A1',
    title: 'Generative classification',
    lesson: 'w2-classifier',
    q: (
      <p>
        For an input <M t="\bx" />, <M t="p(\bx \mid Y=1) = 0.4" />, <M t="p(\bx \mid Y=0) = 0.1" />, and the priors are <M t="P(Y=1) = 0.1" />,{' '}
        <M t="P(Y=0) = 0.9" />. Compute the posterior probability of class 1 and predict under the most-probable-class rule. Explain why the larger
        likelihood alone is not decisive.
      </p>
    ),
    hint: 'Compare likelihood × prior.',
    sol: (
      <p>
        Products: <M t="0.4 \times 0.1 = 0.04" /> and <M t="0.1 \times 0.9 = 0.09" />. So <M t="P(Y=1 \mid \bx) = 0.04/0.13 = 4/13 \approx 0.308" />: predict
        class 0. Its lower feature likelihood is outweighed by its much larger prior. The normalising denominator <M t="p(\bx) = 0.13" /> is shared by both
        classes, so comparing the numerators is enough.
      </p>
    ),
  },
  {
    id: 'A2',
    title: 'From means to a boundary',
    lesson: 'w2-centroid',
    q: (
      <p>
        The class centroids are <M t="\bp = (3, 2)" /> and <M t="\bn = (-1, 0)" />. Derive <M t="\bw" /> and <M t="t" /> for the basic linear classifier.
        Check that the midpoint lies on the boundary, classify <M t="(1, 2)" />, and verify by comparing squared distances. Then reconstruct the general
        argument that “equal Euclidean distance” gives a linear boundary.
      </p>
    ),
    hint: 'Use the midpoint and the vector between the centroids.',
    sol: (
      <>
        <p>
          <M t="\bw = \bp - \bn = (4, 2)" />, <M t="t = (\|\bp\|^2 - \|\bn\|^2)/2 = (13 - 1)/2 = 6" />. Boundary <M t="4x_1 + 2x_2 = 6" />, i.e.{' '}
          <M t="2x_1 + x_2 = 3" />. Midpoint <M t="(1, 1)" /> scores 6 — on the boundary. Query <M t="(1, 2)" /> scores 8 &gt; 6: positive; its squared
          distances are 4 (to p) and 8 (to n), agreeing.
        </p>
        <p>
          In general, expand <M t="\|\bx - \bp\|^2 = \|\bx - \bn\|^2" />, cancel <M t="\bx\T\bx" />, and divide by 2 to get{' '}
          <M t="\bx\T(\bp - \bn) = (\|\bp\|^2 - \|\bn\|^2)/2" />.
        </p>
      </>
    ),
  },
  {
    id: 'A3',
    title: 'A sigmoid is not a label',
    lesson: 'w2-sigmoid',
    q: (
      <p>
        A logistic model has score <M t="z = -\log 3 + x\log 3" />. Find its probabilities at <M t="x = 0, 1, 2" /> and the 0.5-threshold labels (ties →
        class 1). Derive the input boundary for probability threshold 0.75. Would doubling the coefficients preserve the probabilities as well as the 0.5
        boundary?
      </p>
    ),
    hint: 'exp(log 3) = 3.',
    sol: (
      <p>
        Scores <M t="-\log 3, 0, \log 3" /> give probabilities <M t="1/4, 1/2, 3/4" /> and labels 0, 1, 1. For τ = 0.75 we need{' '}
        <M t="z \ge \log(0.75/0.25) = \log 3" />, i.e. <M t="x \ge 2" />. Doubling the coefficients keeps the sign of the score, so the 0.5 boundary (x = 1)
        is unchanged, but the probabilities change away from z = 0: at x = 0 it becomes <M t="\sigma(-2\log 3) = 1/(1 + 9) = 1/10" /> instead of 1/4.
      </p>
    ),
  },
  {
    id: 'A4',
    title: 'Likelihood to gradient',
    lesson: 'w2-logfit',
    q: (
      <p>
        Starting with <M t="p_j = \sigma(\bxt_j\T\beta)" /> and binary labels <M t="y_j" />, derive the average negative log-likelihood and its gradient. State
        where independence enters. Explain why setting this gradient to zero does not give Week 1’s normal-equation solution.
      </p>
    ),
    hint: 'Differentiate one observation with respect to its score before summing.',
    sol: (
      <>
        <p>
          Independence gives <M t="\Lik = \prod_j p_j^{y_j}(1 - p_j)^{1 - y_j}" />; the negative average log is
        </p>
        <MB t="J = -\frac1m\sum_j\big[y_j\log p_j + (1 - y_j)\log(1 - p_j)\big]." />
        <p>
          With <M t="\sigma' = \sigma(1 - \sigma)" />, the factor <M t="p_j(1 - p_j)" /> cancels the denominators, leaving score derivative{' '}
          <M t="p_j - y_j" />. Hence <M t="\nabla J = \frac1m\sum_j(p_j - y_j)\bxt_j = \frac1m X\T(\bp - \by)" />. Because <M t="\bp = \sigma(X\beta)" /> entry
          by entry, the zero-gradient condition is nonlinear in β — it is not <M t="X\T X\beta = X\T\by" />.
        </p>
      </>
    ),
  },
  {
    id: 'A5',
    title: 'Metric or merely a formula?',
    lesson: 'w2-metric',
    q: (
      <>
        <p>
          State the metric axioms. Use <M t="(0,0), (1,0), (1,1)" /> to test the triangle inequality for <M t="p = \tfrac12" />. Then explain why
        </p>
        <MB t="d(\bx, \bz) = \sqrt{(x_1 - z_1)^2 + 0\cdot(x_2 - z_2)^2}" />
        <p>is a pseudometric on ℝ² but not a metric.</p>
      </>
    ),
    hint: 'One counterexample disproves an axiom.',
    sol: (
      <p>
        A metric is non-negative, zero only for identical points, symmetric, and satisfies the triangle inequality. For p = ½ the direct distance from{' '}
        <M t="(0,0)" /> to <M t="(1,1)" /> is <M t="(1 + 1)^2 = 4" /> while the legs via <M t="(1,0)" /> are 1 and 1: violated. The weighted expression is{' '}
        <M t="|x_1 - z_1|" />; distinct points such as <M t="(1, 0), (1, 8)" /> have distance 0, while symmetry and the triangle inequality still hold — a
        pseudometric.
      </p>
    ),
  },
  {
    id: 'A6',
    title: 'Mean versus medoid',
    lesson: 'w2-exemplar',
    q: (
      <p>
        For points 1, 4, 10 on the real line, calculate the mean and a medoid (absolute distance). Show why the mean minimises the sum of squared distances
        by expanding around it. Why can the mean and the medoid differ without either being wrong?
      </p>
    ),
    hint: 'The deviations from the mean sum to zero.',
    sol: (
      <>
        <p>Mean 5. Total distances at candidates 1, 4, 10 are 12, 9, 15, so the medoid is 4. Expanding about the mean,</p>
        <MB t="\sum_j(x_j - c)^2 = \sum_j(x_j - 5)^2 + 3(c - 5)^2," />
        <p>
          because <M t="\sum_j(x_j - 5) = 0" />; the sum is uniquely minimised at <M t="c = 5" />. The two questions differ in the objective (squared vs
          absolute distance) and in the allowed centres (any point vs an observed point).
        </p>
      </>
    ),
  },
];

const B: Problem[] = [
  {
    id: 'B1',
    title: 'One logistic update',
    lesson: 'w2-logfit',
    q: (
      <p>
        Data <M t="(x, y) = (0, 1), (2, 0)" />, start at <M t="\beta = (0, 0)\T" />, learning rate 0.2, average log loss. Compute the gradient, the
        simultaneous update, and the two new probabilities.
      </p>
    ),
    sol: (
      <>
        <MB t="X = \begin{pmatrix}1 & 0\\ 1 & 2\end{pmatrix}, \quad \bp - \by = \begin{pmatrix}-0.5\\ 0.5\end{pmatrix}, \quad \nabla J = \tfrac12X\T(\bp - \by) = \begin{pmatrix}0\\ 0.5\end{pmatrix}." />
        <p>
          <M t="\beta_{\text{new}} = (0, 0) - 0.2(0, 0.5) = (0, -0.1)" />. Probabilities: <M t="\sigma(0) = 0.5" /> and <M t="\sigma(-0.2) \approx 0.4502" />{' '}
          — the negative observation’s estimated positive probability fell. The average loss drops from 0.6931 to about 0.6456.
        </p>
      </>
    ),
  },
  {
    id: 'B2',
    title: 'A confusion matrix',
    lesson: 'w2-metrics',
    q: (
      <p>
        On 100 cases, <M t="\TP = 18" />, <M t="\FN = 12" />, <M t="\FP = 6" />, <M t="\TN = 64" />. Compute accuracy, precision, recall, F1 and FPR, and name
        the population each denominator counts.
      </p>
    ),
    sol: (
      <>
        <p>30 actual positives, 70 actual negatives, 24 predicted positives.</p>
        <MB t="\Acc = 0.82, \quad \Prec = \tfrac{18}{24} = 0.75, \quad \Rec = \tfrac{18}{30} = 0.60, \quad \Fone = \tfrac{36}{54} = \tfrac23, \quad \FPR = \tfrac{6}{70} \approx 0.0857." />
        <p>Accuracy: all cases; precision: predicted positives; recall: actual positives; FPR: actual negatives. F1 combines TP, FP, FN.</p>
      </>
    ),
  },
  {
    id: 'B3',
    title: 'Construct an ROC curve',
    lesson: 'w2-roc',
    q: (
      <p>
        Scores <M t="(0.9, 0.7, 0.6, 0.2)" /> with labels <M t="(1, 0, 1, 0)" />. Sweep the threshold from above 0.9 to below 0.2 (positive at or above it).
        List the ROC points and compute AUC. What are accuracy and recall at threshold 0.65?
      </p>
    ),
    sol: (
      <p>
        Points <M t="(0,0), (0,\tfrac12), (\tfrac12,\tfrac12), (\tfrac12,1), (1,1)" />; AUC <M t="= \tfrac12\cdot\tfrac12 + \tfrac12\cdot1 = \tfrac34" />. At
        0.65 the first two are predicted positive: TP = FP = FN = TN = 1, so accuracy ½ and recall ½. AUC and the accuracy at one threshold answer different
        questions.
      </p>
    ),
  },
  {
    id: 'B4',
    title: 'Uniform and weighted neighbours',
    lesson: 'w2-weighted',
    q: (
      <p>
        Query <M t="x = 0" /> against <M t="(0.5, 1), (1, 0), (2, 0), (4, 1), (6, 0)" />. Compute the 1-NN, unweighted 3-NN and inverse-square weighted 3-NN
        predictions. Why does using all observations with uniform votes give a constant predictor, while query-dependent weights need not?
      </p>
    ),
    sol: (
      <p>
        1-NN: nearest is 0.5 → 1. Uniform 3-NN: labels 1, 0, 0 → 0. Weights <M t="4, 1, \tfrac14" />: class 1 gets 4, class 0 gets 1.25 → 1. With{' '}
        <M t="k = m" /> uniform counts are identical for every query; distance weights change with the query and can change the winner.
      </p>
    ),
  },
  {
    id: 'B5',
    title: 'Distances',
    lesson: 'w2-distance',
    q: (
      <p>
        For <M t="\bx = (1, 2, 3, 4)" />, <M t="\bz = (3, 5, 9, 4)" />, compute the Manhattan, Euclidean, Chebyshev and mismatch distances. Can squared
        Euclidean distance replace Euclidean distance both for ranking neighbours and in the inverse-square weight without adjustment?
      </p>
    ),
    sol: (
      <p>
        Differences <M t="(2, 3, 6, 0)" />: <M t="d_1 = 11" />, <M t="d_2 = \sqrt{49} = 7" />, <M t="d_\infty = 6" />, <M t="d_0 = 3" />. For ranking, yes —
        the order is preserved. For weighting, if <M t="s = d_2^2" /> then the inverse-square weight is <M t="1/s" />, not <M t="1/s^2" /> (which would be
        inverse fourth power).
      </p>
    ),
  },
  {
    id: 'B6',
    title: 'Leave one out',
    lesson: 'w2-lazyeval',
    q: (
      <p>
        For <M t="(x, y) = (0,0), (2,0), (3,1), (7,1), (8,1)" />, compute the 1-NN training error with self-matches and the 1-NN LOOCV error. Is{' '}
        <M t="k = 5" /> a valid candidate inside this LOOCV?
      </p>
    ),
    sol: (
      <p>
        Training error 0. Leaving each out, the nearest remaining inputs are 2, 3, 2, 8, 7, predicting 0, 1, 0, 1, 1 for true 0, 0, 1, 1, 1: two errors,
        LOOCV error <M t="2/5" />. Each fit has only 4 reference points, so <M t="k = 5" /> is not valid.
      </p>
    ),
  },
];

const C: Problem[] = [
  { id: 'C1', title: 'Diagnose the claim', lesson: 'w2-logfit', q: <p>“A convex logistic loss always has exactly one finite coefficient vector that minimises it.”</p>, sol: <p><strong>False.</strong> Convexity makes any stationary point a global minimiser but guarantees neither existence nor uniqueness. Redundant columns give non-unique minimisers; separable data drive the unregularised optimum to unbounded coefficients (e.g. <M t="\log(1 + e^{-b}) \to 0" /> as <M t="b \to \infty" />).</p> },
  { id: 'C2', title: 'Diagnose the claim', lesson: 'w2-roc', q: <p>“FPR is one minus precision, because both concern incorrect positive predictions.”</p>, sol: <p><strong>False.</strong> <M t="\FPR = \FP/(\FP + \TN)" /> divides by actual negatives; <M t="1 - \Prec = \FP/(\TP + \FP)" /> divides by predicted positives. Same numerator, different conditional questions.</p> },
  { id: 'C3', title: 'Diagnose the claim', lesson: 'w2-cv', q: <p>“Before cross-validation I computed all scaling and imputation values on the complete dataset. No labels were used, so this cannot leak information.”</p>, sol: <p><strong>False.</strong> Fitted preprocessing can carry information from held-out inputs without labels. Fit scaling and imputation inside each training fold, then apply them to its validation fold.</p> },
  { id: 'C4', title: 'Diagnose the claim', lesson: 'w2-knn', q: <p>“Choosing an odd k removes every possible tie in k-NN.”</p>, sol: <p><strong>False.</strong> It prevents a tied two-class vote once exactly k neighbours are chosen. It does not resolve equal distances at the neighbourhood boundary, multi-class voting ties, or duplicate inputs with conflicting labels.</p> },
  { id: 'C5', title: 'Diagnose the claim', lesson: 'w2-datatypes', q: <p>“The labels red = 1, green = 2, blue = 3 establish meaningful Euclidean distances between colours.”</p>, sol: <p><strong>False.</strong> The codes are arbitrary: relabelling the colours would change the distances without changing the categories. Use matching distance or indicator features.</p> },
  { id: 'C6', title: 'Diagnose the claim', lesson: 'w2-curse', q: <p>“More than 20 features necessarily makes k-NN unusable, whereas normalising any smaller number guarantees meaningful neighbours.”</p>, sol: <p><strong>False.</strong> The dimension counts are practical warnings, not thresholds. Relevance, structure, sample size and the distance matter; normalisation fixes units, not irrelevance, noise or lack of representative data.</p> },
];

const D: Problem[] = [
  {
    id: 'D1',
    title: 'Design an evaluation',
    lesson: 'w2-roc',
    q: (
      <p>
        A screening test must flag a condition present in about 2% of 5,000 patients. You will fit a logistic model and must choose a threshold. Describe
        the data split, which metrics you would report and why, how you would choose the threshold, and what accuracy alone would hide.
      </p>
    ),
    sol: (
      <p>
        Reserve a stratified test set first. On the development data, use (stratified) K-fold CV: fit any scaling/imputation and the logistic model inside each
        training fold. Report recall (missed cases are costly), precision (how many alarms are real), and the ROC curve / AUC to compare models across
        thresholds. Choose τ on validation predictions to meet a recall target or a cost trade-off — not 0.5 by default, and not on the test set. Then refit
        and report the confusion matrix at the chosen τ on the test set once. Accuracy alone would be about 0.98 for “everyone is healthy”, hiding a recall
        of 0.
      </p>
    ),
  },
  {
    id: 'D2',
    title: 'Choose a classifier',
    lesson: 'w2-exemplar',
    q: (
      <p>
        You have 2,000 labelled examples with 6 numeric features on very different scales. One class forms two separate clusters. Compare nearest centroid,
        logistic regression on the raw features, and k-NN as first choices. What preprocessing and evaluation would each need?
      </p>
    ),
    sol: (
      <>
        <Table
          head={['Model', 'Verdict']}
          rows={[
            ['Nearest centroid', 'poor: one mean for the two-cluster class lands between the clusters'],
            ['Logistic regression', 'linear boundary in the raw features cannot separate a class with clusters on both sides; feature transformations would be needed'],
            ['k-NN', 'natural first choice: local rule handles multimodal classes; d = 6 and m = 2,000 are comfortable'],
          ]}
        />
        <p>
          k-NN needs feature scaling (fitted on training folds only), a check for irrelevant features, and k chosen by cross-validation; report the chosen
          procedure once on a held-out test set.
        </p>
      </>
    ),
  },
];

const GROUPS: ProblemGroup[] = [
  { key: 'A', title: 'A · Central arguments', intro: 'Derive, then explain the condition under which the result holds.', items: A },
  { key: 'B', title: 'B · Numerical problems', intro: 'Show intermediate values: scores, distances, counts. The labs reproduce most of these.', items: B },
  { key: 'C', title: 'C · Diagnose each statement', intro: 'True or false — and give the mechanism or a counterexample, not just a verdict.', items: C },
  { key: 'D', title: 'D · Choose and explain', intro: 'Combine ideas from several lessons.', items: D },
];

export const ALL_PROBLEMS_W2 = problemIds(GROUPS);

export default function Practice2() {
  return (
    <ProblemSet groups={GROUPS} storeKey="w2.practice">
      <Callout kind="warning" title="If your arithmetic disagrees">
        Check whether the loss is summed or averaged; whether the intercept coordinate is included; whether confusion-matrix rows are actual or predicted
        classes; whether distances have already been squared; and whether a held-out observation accidentally retrieved itself.
      </Callout>
    </ProblemSet>
  );
}
