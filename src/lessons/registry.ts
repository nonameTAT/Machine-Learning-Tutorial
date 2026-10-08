import type { ComponentType } from 'react';

export interface LessonMeta {
  id: string;
  /** shown in the sidebar, e.g. "4" */
  num: string;
  title: string;
  part: string;
  /** the one question this lesson answers */
  question: string;
  /** whether it counts towards "lessons completed" */
  lesson: boolean;
  /** which week's material this page belongs to */
  week: number;
}

export interface WeekMeta {
  n: number;
  title: string;
  /** route id of the week's overview page */
  home: string;
  parts: readonly string[];
}

export const PARTS1 = [
  'Start here',
  'I · The prediction problem',
  'II · Fitting exactly',
  'III · Why least squares',
  'IV · Flexibility',
  'V · Generalisation',
  'Consolidate',
] as const;

const W1: Omit<LessonMeta, 'week'>[] = [
  { id: 'home', num: '', title: 'Overview & study route', part: PARTS1[0], question: 'How should I study this week?', lesson: false },
  { id: 'learning', num: '1', title: 'What is being learned?', part: PARTS1[1], question: 'What does a regression model actually learn, and how do we write it down?', lesson: true },
  { id: 'loss', num: '2', title: 'What makes a fit good?', part: PARTS1[1], question: 'How do we turn “this line looks right” into something we can optimise?', lesson: true },
  { id: 'stats', num: '3', title: 'The statistics you need', part: PARTS1[1], question: 'What do samples, estimators, covariance and correlation tell us — and not tell us?', lesson: true },
  { id: 'ols1d', num: '4', title: 'Deriving the least-squares line', part: PARTS1[2], question: 'Where do the slope and intercept formulas come from?', lesson: true },
  { id: 'matrix', num: '5', title: 'Many features: the normal equations', part: PARTS1[2], question: 'How does one matrix argument fit any number of features?', lesson: true },
  { id: 'gd', num: '6', title: 'Gradient descent', part: PARTS1[3], question: 'How do we minimise the loss by repeated small improvements?', lesson: true },
  { id: 'mle', num: '7', title: 'Least squares as maximum likelihood', part: PARTS1[3], question: 'Why squared error, and not some other loss?', lesson: true },
  { id: 'assumptions', num: '8', title: 'Model assumptions', part: PARTS1[3], question: 'What exactly does the linear regression model claim about the data?', lesson: true },
  { id: 'features', num: '9', title: 'Curves and categories', part: PARTS1[4], question: 'How can a “linear” model fit curves and groups?', lesson: true },
  { id: 'regularisation', num: '10', title: 'Regularisation: ridge & LASSO', part: PARTS1[4], question: 'How do we stop a flexible model from chasing noise?', lesson: true },
  { id: 'evaluation', num: '11', title: 'Selecting and evaluating models', part: PARTS1[5], question: 'How do we choose a model and report its quality honestly?', lesson: true },
  { id: 'knn', num: '12', title: 'Local (nearest-neighbour) regression', part: PARTS1[5], question: 'What if we predict from nearby examples instead of one global line?', lesson: true },
  { id: 'biasvar', num: '13', title: 'The bias–variance tradeoff', part: PARTS1[5], question: 'Why can fitting the training data better make predictions worse?', lesson: true },
  { id: 'practice', num: 'P', title: 'Practice problems', part: PARTS1[6], question: 'Can I reproduce the reasoning on my own?', lesson: false },
  { id: 'reference', num: 'R', title: 'Reference sheet', part: PARTS1[6], question: 'Every formula on one page, with its conditions.', lesson: false },
  { id: 'readiness', num: '✓', title: 'Readiness check', part: PARTS1[6], question: 'Where are my gaps?', lesson: false },
];

export const PARTS2 = [
  'Start here',
  'I · From features to a decision',
  'II · Logistic regression',
  'III · Evaluating classifiers',
  'IV · Distance and exemplars',
  'V · Nearest-neighbour classification',
  'Consolidate',
] as const;

// Later weeks prefix their route ids ("w2-", "w3-") so they never collide with week 1 ids (or their stored progress).
const W2: Omit<LessonMeta, 'week'>[] = [
  { id: 'w2-home', num: '', title: 'Overview & study route', part: PARTS2[0], question: 'How should I study this week?', lesson: false },
  { id: 'w2-classifier', num: '1', title: 'What does a classifier learn?', part: PARTS2[1], question: 'What exactly does a classifier output, and what are the two ways to build one?', lesson: true },
  { id: 'w2-centroid', num: '2', title: 'A linear boundary from class means', part: PARTS2[1], question: 'How do two class means define a linear decision boundary?', lesson: true },
  { id: 'w2-sigmoid', num: '3', title: 'From score to probability', part: PARTS2[2], question: 'How does a linear score become a class probability — and why is the boundary still linear?', lesson: true },
  { id: 'w2-logloss', num: '4', title: 'Deriving the log loss', part: PARTS2[2], question: 'Which loss does maximum likelihood give for binary labels?', lesson: true },
  { id: 'w2-logfit', num: '5', title: 'Fitting the coefficients', part: PARTS2[2], question: 'How does gradient descent fit logistic regression, and what does convexity guarantee?', lesson: true },
  { id: 'w2-cv', num: '6', title: 'Generalisation and cross-validation', part: PARTS2[3], question: 'How do we estimate performance on unseen data without fooling ourselves?', lesson: true },
  { id: 'w2-datatypes', num: '7', title: 'Representation and data types', part: PARTS2[3], question: 'When does a stored number actually behave like a number?', lesson: true },
  { id: 'w2-metrics', num: '8', title: 'Confusion matrix and metrics', part: PARTS2[3], question: 'Which mistakes did the classifier make, and which metric answers which question?', lesson: true },
  { id: 'w2-roc', num: '9', title: 'Thresholds, ROC and AUC', part: PARTS2[3], question: 'How do we evaluate a scoring classifier across every threshold at once?', lesson: true },
  { id: 'w2-missing', num: '10', title: 'Missing values', part: PARTS2[3], question: 'What should we do when some feature values are absent?', lesson: true },
  { id: 'w2-distance', num: '11', title: 'Distance is part of the model', part: PARTS2[4], question: 'How do different distance formulas change what counts as “near”?', lesson: true },
  { id: 'w2-metric', num: '12', title: 'What makes a distance a metric?', part: PARTS2[4], question: 'Which properties must a distance satisfy, and how do you disprove one?', lesson: true },
  { id: 'w2-exemplar', num: '13', title: 'Exemplars and nearest centroids', part: PARTS2[4], question: 'What single point best represents a class — and when is one point not enough?', lesson: true },
  { id: 'w2-knn', num: '14', title: 'The k-NN classification rule', part: PARTS2[5], question: 'How does k-NN turn stored examples into a vote?', lesson: true },
  { id: 'w2-scaling', num: '15', title: 'Scale features before trusting distance', part: PARTS2[5], question: 'Why can changing the units of a feature change the prediction?', lesson: true },
  { id: 'w2-weighted', num: '16', title: 'Choosing k and weighting votes', part: PARTS2[5], question: 'How does k control flexibility, and what changes when closer neighbours count more?', lesson: true },
  { id: 'w2-lazyeval', num: '17', title: 'Evaluating a lazy learner', part: PARTS2[5], question: 'Why is 1-NN training accuracy meaningless, and what should we measure instead?', lesson: true },
  { id: 'w2-curse', num: '18', title: 'The curse of dimensionality', part: PARTS2[5], question: 'Why does “nearby” stop being informative in high dimensions?', lesson: true },
  { id: 'w2-practice', num: 'P', title: 'Practice problems', part: PARTS2[6], question: 'Can I reproduce the reasoning on my own?', lesson: false },
  { id: 'w2-reference', num: 'R', title: 'Reference sheet', part: PARTS2[6], question: 'Every formula on one page, with its conditions.', lesson: false },
  { id: 'w2-readiness', num: '✓', title: 'Readiness check', part: PARTS2[6], question: 'Where are my gaps?', lesson: false },
];

export const PARTS3 = [
  'Start here',
  'I · Assumptions and Bayes’ rule',
  'II · From probabilities to decisions',
  'III · Naive Bayes',
  'IV · Text and practical issues',
  'Consolidate',
] as const;

const W3: Omit<LessonMeta, 'week'>[] = [
  { id: 'w3-home', num: '', title: 'Overview & study route', part: PARTS3[0], question: 'How should I study this week?', lesson: false },
  { id: 'w3-bias', num: '1', title: 'Why learning needs assumptions', part: PARTS3[1], question: 'Why can no learner generalise without assumptions, and what are they for each method?', lesson: true },
  { id: 'w3-bayes', num: '2', title: 'Bayes’ theorem: reversing the question', part: PARTS3[1], question: 'How do we turn “how likely is this observation for each class” into “how likely is each class”?', lesson: true },
  { id: 'w3-map', num: '3', title: 'MAP, ML and odds', part: PARTS3[1], question: 'When do the prior and the likelihood disagree, and who wins?', lesson: true },
  { id: 'w3-baserate', num: '4', title: 'Base rates', part: PARTS3[1], question: 'Why can a 98%-accurate test leave a positive result probably wrong?', lesson: true },
  { id: 'w3-risk', num: '5', title: 'Minimising expected loss', part: PARTS3[2], question: 'When should we predict the less probable class?', lesson: true },
  { id: 'w3-gaussnoise', num: '6', title: 'Gaussian noise and squared error', part: PARTS3[2], question: 'Which noise assumption makes least squares the maximum-likelihood choice?', lesson: true },
  { id: 'w3-bayesopt', num: '7', title: 'Bayes optimal and Gibbs classifiers', part: PARTS3[2], question: 'Why can the most probable model make the less probable prediction?', lesson: true },
  { id: 'w3-bayeserror', num: '8', title: 'Bayes error', part: PARTS3[2], question: 'What is the best accuracy any classifier could achieve with these features?', lesson: true },
  { id: 'w3-nb', num: '9', title: 'The Naive Bayes assumption', part: PARTS3[3], question: 'How does conditional independence make the likelihood learnable?', lesson: true },
  { id: 'w3-playtennis', num: '10', title: 'Worked example: PlayTennis', part: PARTS3[3], question: 'How do we train Naive Bayes by counting and classify by multiplying?', lesson: true },
  { id: 'w3-smoothing', num: '11', title: 'Zero counts, smoothing and logs', part: PARTS3[3], question: 'What goes wrong with unseen values and tiny products, and how do we fix it?', lesson: true },
  { id: 'w3-gnb', num: '12', title: 'Gaussian Naive Bayes', part: PARTS3[3], question: 'How does Naive Bayes handle numeric features?', lesson: true },
  { id: 'w3-text', num: '13', title: 'Representing text', part: PARTS3[4], question: 'What exactly does a document “observe” — presence, or counts?', lesson: true },
  { id: 'w3-bernoulli', num: '14', title: 'The Bernoulli text model', part: PARTS3[4], question: 'How does a presence/absence model score a document?', lesson: true },
  { id: 'w3-multinomial', num: '15', title: 'The multinomial text model', part: PARTS3[4], question: 'How does a word-count model score a document, and why can it disagree with Bernoulli?', lesson: true },
  { id: 'w3-missing', num: '16', title: 'Missing values in Naive Bayes', part: PARTS3[4], question: 'What should we do with a feature we did not observe?', lesson: true },
  { id: 'w3-limits', num: '17', title: 'When Naive Bayes works — and misleads', part: PARTS3[4], question: 'Why can Naive Bayes classify well yet report terrible probabilities?', lesson: true },
  { id: 'w3-practice', num: 'P', title: 'Practice problems', part: PARTS3[5], question: 'Can I reproduce the reasoning on my own?', lesson: false },
  { id: 'w3-reference', num: 'R', title: 'Reference sheet', part: PARTS3[5], question: 'Every formula on one page, with its conditions.', lesson: false },
  { id: 'w3-readiness', num: '✓', title: 'Readiness check', part: PARTS3[5], question: 'Where are my gaps?', lesson: false },
];

export const WEEKS: WeekMeta[] = [
  { n: 1, title: 'Regression', home: 'home', parts: PARTS1 },
  { n: 2, title: 'Classification', home: 'w2-home', parts: PARTS2 },
  { n: 3, title: 'Bayesian classification', home: 'w3-home', parts: PARTS3 },
];

export const LESSONS: LessonMeta[] = [...W1.map((l) => ({ ...l, week: 1 })), ...W2.map((l) => ({ ...l, week: 2 })), ...W3.map((l) => ({ ...l, week: 3 }))];

export const lessonIndex = (id: string) => LESSONS.findIndex((l) => l.id === id);

export const weekMeta = (n: number) => WEEKS.find((w) => w.n === n) ?? WEEKS[0];

/** All pages of one week, in study order. */
export const weekPages = (n: number) => LESSONS.filter((l) => l.week === n);

/** The pages of one week that count as lessons. */
export const weekLessons = (n: number) => LESSONS.filter((l) => l.week === n && l.lesson);

export type LessonComponent = ComponentType;
