import { defineWeek } from '../../course/types';
import Overview from './Overview';
import Reference from './Reference';
import practice from './practice';
import Classifier from './lessons/Classifier';
import Centroid from './lessons/Centroid';
import Sigmoid from './lessons/Sigmoid';
import LogLoss from './lessons/LogLoss';
import LogFit from './lessons/LogFit';
import CV from './lessons/CV';
import DataTypes from './lessons/DataTypes';
import Metrics from './lessons/Metrics';
import ROC from './lessons/ROC';
import Missing from './lessons/Missing';
import Distance from './lessons/Distance';
import Metric from './lessons/Metric';
import Exemplar from './lessons/Exemplar';
import KNN from './lessons/KNN';
import Scaling from './lessons/Scaling';
import Weighted from './lessons/Weighted';
import LazyEval from './lessons/LazyEval';
import Curse from './lessons/Curse';

export default defineWeek({
  n: 2,
  title: 'Classification',
  summary: 'From a decision boundary to a defensible evaluation — linear classifiers, logistic regression, evaluation, distances and k-nearest neighbours.',
  overview: Overview,
  parts: [
    {
      title: 'I · From features to a decision',
      lessons: [
        {
          slug: 'classifier',
          title: 'What does a classifier learn?',
          question: 'What exactly does a classifier output, and what are the two ways to build one?',
          page: Classifier,
          checks: [
            'Distinguish a score, a class probability and a predicted label, and say what turns one into the next.',
            'Explain the difference between discriminative and generative learning, naming what each one models.',
            'Use Bayes’ rule to turn class-conditional likelihoods and priors into a posterior, and explain why p(x) can be ignored when comparing classes.',
            'Give an example where comparing likelihoods alone (ignoring priors) predicts the wrong class.',
          ],
        },
        {
          slug: 'centroid',
          title: 'A linear boundary from class means',
          question: 'How do two class means define a linear decision boundary?',
          page: Centroid,
          checks: [
            'Explain why the weight vector w is perpendicular to the boundary xᵀw = t.',
            'Derive w = p − n and t = (‖p‖² − ‖n‖²)/2 for the basic linear classifier.',
            'Prove the boundary is the set of points equidistant (Euclidean) from the two class means.',
            'Classify a query with the score and verify the answer with squared distances.',
            'Explain what goes wrong when the class means coincide or a class is multimodal.',
          ],
        },
      ],
    },
    {
      title: 'II · Logistic regression',
      lessons: [
        {
          slug: 'sigmoid',
          title: 'From score to probability',
          question: 'How does a linear score become a class probability — and why is the boundary still linear?',
          page: Sigmoid,
          checks: [
            'Explain why linear regression on 0/1 labels does not give valid probabilities.',
            'Write the logistic model, compute σ(z) for a few scores, and interpret h_β(x) as P(Y = 1 | x).',
            'Show that σ(z) ≥ 0.5 ⇔ z ≥ 0, so the decision boundary is linear in the features.',
            'Convert a probability threshold τ into a score threshold log(τ/(1 − τ)) and the boundary in x.',
            'Explain what scaling all coefficients does to the probabilities and to the 0.5 boundary.',
          ],
        },
        {
          slug: 'logloss',
          title: 'Deriving the log loss',
          question: 'Which loss does maximum likelihood give for binary labels?',
          page: LogLoss,
          checks: [
            'Write the Bernoulli probability p^y (1 − p)^(1−y) and check both cases.',
            'Derive the log-likelihood and the average negative log-likelihood (log loss) from it.',
            'State exactly where independence and the binary labels are used.',
            'Compute the loss of a single observation and explain why confident mistakes cost so much.',
            'Explain why the squared loss of a sigmoid output is not the objective used here.',
          ],
        },
        {
          slug: 'logfit',
          title: 'Fitting the coefficients',
          question: 'How does gradient descent fit logistic regression, and what does convexity guarantee?',
          page: LogFit,
          checks: [
            'Derive σ′(z) = σ(z)(1 − σ(z)) and the per-example score derivative p − y.',
            'Write the gradient (1/m) Xᵀ(p − y) and perform one simultaneous gradient-descent update by hand.',
            'Explain why there is no OLS-style closed form for logistic regression.',
            'Explain what convexity guarantees and give a case (separable data, duplicate columns) where a unique finite minimiser fails to exist.',
          ],
        },
      ],
    },
    {
      title: 'III · Evaluating classifiers',
      lessons: [
        {
          slug: 'cv',
          title: 'Generalisation and cross-validation',
          question: 'How do we estimate performance on unseen data without fooling ourselves?',
          page: CV,
          checks: [
            'State the three assumptions behind generalisation from a sample.',
            'Distinguish what training, validation and test data are each allowed to influence.',
            'Describe holdout, K-fold CV and LOOCV, with training size per fit and number of fits.',
            'Select a hyperparameter from fold error counts, weighting by fold size when folds differ.',
            'Explain why preprocessing must be fitted inside each training fold, and why a best CV score is optimistic.',
          ],
        },
        {
          slug: 'datatypes',
          title: 'Representation and data types',
          question: 'When does a stored number actually behave like a number?',
          page: DataTypes,
          checks: [
            'Classify features as nominal, binary, ordinal, count, time, interval or irrelevant.',
            'Explain why arbitrary integer codes invent distances between categories.',
            'Explain why order does not imply equal gaps, and why cyclic time needs special treatment.',
            'Describe a simple matching distance for nominal features.',
          ],
        },
        {
          slug: 'metrics',
          title: 'Confusion matrix and metrics',
          question: 'Which mistakes did the classifier make, and which metric answers which question?',
          page: Metrics,
          checks: [
            'Draw a labelled confusion matrix (rows actual, columns predicted) and define TP, FP, FN, TN.',
            'Compute accuracy, error, precision, recall and F1, and name the population each denominator counts.',
            'Explain why high accuracy can hide a useless classifier when positives are rare.',
            'Derive F1 = 2TP/(2TP + FP + FN) from the harmonic mean and say why it ignores TN.',
            'Recognise when precision or recall is undefined.',
          ],
        },
        {
          slug: 'roc',
          title: 'Thresholds, ROC and AUC',
          question: 'How do we evaluate a scoring classifier across every threshold at once?',
          page: ROC,
          checks: [
            'Explain how lowering the threshold changes TP, FP, recall and precision.',
            'Define TPR and FPR, and explain why FPR is not 1 − precision.',
            'Construct an ROC curve from a small list of scores and labels, handling ties, and compute its AUC.',
            'Interpret AUC = 1 and AUC = 0.5, and explain what AUC does not tell you.',
          ],
        },
        {
          slug: 'missing',
          title: 'Missing values',
          question: 'What should we do when some feature values are absent?',
          page: Missing,
          checks: [
            'Explain why a missing value is not a zero, and list common causes of missingness.',
            'Compare deletion, mean/median/mode imputation, a missing category, predictive imputation and model support.',
            'Show with numbers why mean imputation shrinks the variance of a column.',
            'Explain how deleting rows can bias a sample, and why imputation must be fitted on training data only.',
          ],
        },
      ],
    },
    {
      title: 'IV · Distance and exemplars',
      lessons: [
        {
          slug: 'distance',
          title: 'Distance is part of the model',
          question: 'How do different distance formulas change what counts as “near”?',
          page: Distance,
          checks: [
            'Write the Minkowski distance and specialise it to Manhattan, Euclidean and Chebyshev distance.',
            'Compute d₁, d₂, d∞ and the mismatch count for a pair of vectors.',
            'Sketch the unit “circles” for p = 1, 2, ∞ and explain what each prefers.',
            'Explain why squared Euclidean distance ranks neighbours exactly as Euclidean distance does.',
          ],
        },
        {
          slug: 'metric',
          title: 'What makes a distance a metric?',
          question: 'Which properties must a distance satisfy, and how do you disprove one?',
          page: Metric,
          checks: [
            'State the four metric properties (zero at self, positive otherwise, symmetry, triangle inequality).',
            'Use a counterexample to show Minkowski p = ½ violates the triangle inequality.',
            'Show squared Euclidean distance is not a metric.',
            'Define a pseudometric and give the zero-weight example.',
          ],
        },
        {
          slug: 'exemplar',
          title: 'Exemplars and nearest centroids',
          question: 'What single point best represents a class — and when is one point not enough?',
          page: Exemplar,
          checks: [
            'Prove the mean uniquely minimises the sum of squared Euclidean distances.',
            'Distinguish centroid, geometric median and medoid by their objective and allowed centres.',
            'Find a medoid by evaluating every candidate, and state the cost.',
            'Describe the nearest-centroid classifier and give a multimodal counterexample.',
          ],
        },
      ],
    },
    {
      title: 'V · Nearest-neighbour classification',
      lessons: [
        {
          slug: 'knn',
          title: 'The k-NN classification rule',
          question: 'How does k-NN turn stored examples into a vote?',
          page: KNN,
          checks: [
            'Write the k-NN vote with the indicator function and trace it on a small dataset.',
            'Explain why 1-NN and 3-NN can disagree on the same query.',
            'Contrast k-NN classification (vote) with k-NN regression (mean) and interpret the fraction of positive neighbours.',
            'Explain which ties odd k removes and which it does not.',
          ],
        },
        {
          slug: 'scaling',
          title: 'Scale features before trusting distance',
          question: 'Why can changing the units of a feature change the prediction?',
          page: Scaling,
          checks: [
            'Explain how a feature measured in large units can dominate Euclidean distance.',
            'Apply min-max and z-score normalisation using training statistics.',
            'Explain why a test value outside [0, 1] after min-max scaling is not an error.',
            'Explain why scaling fixes units but not relevance.',
          ],
        },
        {
          slug: 'weighted',
          title: 'Choosing k and weighting votes',
          question: 'How does k control flexibility, and what changes when closer neighbours count more?',
          page: Weighted,
          checks: [
            'Explain how k affects bias, variance and the shape of the decision regions.',
            'Say what unweighted k-NN predicts at k = m, and why distance-weighted k-NN does not become constant.',
            'Compute an inverse-square-weighted vote and a weighted-average regression prediction.',
            'Handle zero distances and avoid squaring an already-squared distance.',
          ],
        },
        {
          slug: 'lazyeval',
          title: 'Evaluating a lazy learner',
          question: 'Why is 1-NN training accuracy meaningless, and what should we measure instead?',
          page: LazyEval,
          checks: [
            'Explain why 1-NN self-match training error is zero and what that does (not) tell you.',
            'Compute 1-NN leave-one-out error for a small dataset.',
            'State the storage and brute-force query cost of k-NN, and the cost of LOOCV.',
            'Explain why k cannot exceed the training size inside each LOOCV fit.',
          ],
        },
        {
          slug: 'curse',
          title: 'The curse of dimensionality',
          question: 'Why does “nearby” stop being informative in high dimensions?',
          page: Curse,
          checks: [
            'Explain the exponential growth of grid cells with dimension.',
            'Explain how irrelevant features swamp relevant ones in a distance.',
            'Describe distance concentration: nearest and farthest become relatively similar.',
            'Describe remedies: feature selection, attribute weights chosen by validation, larger k, editing instances (IB3).',
          ],
        },
      ],
    },
  ],
  practice,
  reference: Reference,
  readiness: {
    items: [
      'Explain the difference between a feature likelihood, a class posterior, a score and a label.',
      'Derive the midpoint boundary from two class means and prove its nearest-centroid equivalence.',
      'Turn a linear score into a sigmoid probability, then invert a probability threshold.',
      'Derive the Bernoulli log loss and perform a simultaneous gradient-descent update.',
      'Explain what convexity establishes and which claims need additional conditions.',
      'Design a holdout or CV evaluation that keeps fitting, tuning and final testing separate.',
      'Read a confusion matrix, calculate the taught metrics, and construct a small ROC curve.',
      'Explain how missing values, category encodings and feature scales affect a prediction procedure.',
      'Compute the taught distances and use a counterexample to test a metric claim.',
      'Distinguish a mean, a geometric median and a medoid by their objectives and allowed centres.',
      'Trace ordinary and weighted k-NN, including ties, exact matches and the k = m case.',
      'Explain why self-match training accuracy, irrelevant features and high-dimensional sparsity can mislead.',
    ],
    note: 'Revisit by symptom: wrong scores or derivatives → lessons 2–5; confused metrics or leakage → 6 and 8–10; wrong neighbours or votes → 11–12 and 14–17; misleading performance claims → 13 and 18.',
  },
});
