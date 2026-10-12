import { defineWeek } from '../../course/types';
import Overview from './Overview';
import Reference from './Reference';
import practice from './practice';
import Bias from './lessons/Bias';
import Bayes from './lessons/Bayes';
import MAP from './lessons/MAP';
import BaseRate from './lessons/BaseRate';
import Risk from './lessons/Risk';
import GaussNoise from './lessons/GaussNoise';
import BayesOpt from './lessons/BayesOpt';
import BayesError from './lessons/BayesError';
import NB from './lessons/NB';
import PlayTennis from './lessons/PlayTennis';
import Smoothing from './lessons/Smoothing';
import GNB from './lessons/GNB';
import Text from './lessons/Text';
import Bernoulli from './lessons/Bernoulli';
import Multinomial from './lessons/Multinomial';
import Missing from './lessons/Missing';
import Limits from './lessons/Limits';

export default defineWeek({
  n: 3,
  title: 'Bayesian classification',
  summary: 'From assumptions to probabilities to decisions — Bayes’ rule, MAP and ML, expected loss, Bayes optimal prediction, and Naive Bayes for categorical, numeric and text data.',
  overview: Overview,
  parts: [
    {
      title: 'I · Assumptions and Bayes’ rule',
      lessons: [
        {
          slug: 'bias',
          title: 'Why learning needs assumptions',
          question: 'Why can no learner generalise without assumptions, and what are they for each method?',
          page: Bias,
          checks: [
            'Give an example where two hypotheses fit the training data perfectly but predict differently on new inputs.',
            'Define inductive bias and state it for linear regression, k-NN and Naive Bayes.',
            'Distinguish inductive bias (assumptions) from statistical bias (systematic error).',
            'Explain what a generative model learns, compared with a discriminative one.',
          ],
        },
        {
          slug: 'bayes',
          title: 'Bayes’ theorem: reversing the question',
          question: 'How do we turn “how likely is this observation for each class” into “how likely is each class”?',
          page: Bayes,
          checks: [
            'Derive Bayes’ theorem from the product rule and expand the evidence by total probability.',
            'Name and interpret prior, likelihood, evidence and posterior.',
            'Compute posteriors from priors and class-conditionals (the 70 cm fish).',
            'Explain why the evidence can be dropped for an argmax but not when reporting a probability.',
          ],
        },
        {
          slug: 'map',
          title: 'MAP, ML and odds',
          question: 'When do the prior and the likelihood disagree, and who wins?',
          page: MAP,
          checks: [
            'Write h_MAP and h_ML and state when they coincide.',
            'Find an example where ML and MAP choose different hypotheses.',
            'Write posterior odds = likelihood ratio × prior odds and convert odds to a probability.',
            'Explain which threshold the likelihood ratio must exceed for a MAP decision with unequal priors.',
          ],
        },
        {
          slug: 'baserate',
          title: 'Base rates',
          question: 'Why can a 98%-accurate test leave a positive result probably wrong?',
          page: BaseRate,
          checks: [
            'Translate a worded diagnostic problem into P(C), P(+|C) and P(+|¬C).',
            'Compute P(C|+) and explain why it can be small even for an accurate test.',
            'Check the answer with a natural-frequency table.',
            'Explain why a positive result still changes the probability even if the MAP label does not change.',
          ],
        },
      ],
    },
    {
      title: 'II · From probabilities to decisions',
      lessons: [
        {
          slug: 'risk',
          title: 'Minimising expected loss',
          question: 'When should we predict the less probable class?',
          page: Risk,
          checks: [
            'Define conditional risk R(a|x) = Σ_c L(a, c) P(c|x) and compute it from a loss table.',
            'Derive the binary threshold p > C_FP/(C_FP + C_FN).',
            'Show that zero-one loss turns minimum risk into MAP.',
            'Explain why the decision can change while the posterior stays the same.',
          ],
        },
        {
          slug: 'gaussnoise',
          title: 'Gaussian noise and squared error',
          question: 'Which noise assumption makes least squares the maximum-likelihood choice?',
          page: GaussNoise,
          checks: [
            'Write the likelihood of regression data under independent Gaussian noise.',
            'Derive that maximising it minimises the sum of squared errors, justifying each dropped term.',
            'Explain which assumption (independence, zero mean, common variance, Gaussian shape) is used where.',
            'Explain why Laplace noise would lead to absolute error instead.',
          ],
        },
        {
          slug: 'bayesopt',
          title: 'Bayes optimal and Gibbs classifiers',
          question: 'Why can the most probable model make the less probable prediction?',
          page: BayesOpt,
          checks: [
            'Explain why the MAP hypothesis’s prediction need not be the most probable class.',
            'Compute the Bayes optimal prediction Σ_h P(y|x,h) P(h|D) for a small example.',
            'Describe the Gibbs classifier and its expected-error bound (with its assumptions).',
            'Compute the conditional error of MAP-model, Bayes optimal and Gibbs predictions.',
          ],
        },
        {
          slug: 'bayeserror',
          title: 'Bayes error',
          question: 'What is the best accuracy any classifier could achieve with these features?',
          page: BayesError,
          checks: [
            'Define the conditional Bayes error 1 − max_c P(c|x) and the Bayes error as its expectation.',
            'Compute the Bayes error for a small discrete example, weighting by P(x).',
            'Explain why more data cannot reduce Bayes error for a fixed feature set, but new features can.',
          ],
        },
      ],
    },
    {
      title: 'III · Naive Bayes',
      lessons: [
        {
          slug: 'nb',
          title: 'The Naive Bayes assumption',
          question: 'How does conditional independence make the likelihood learnable?',
          page: NB,
          checks: [
            'State the Naive Bayes assumption precisely (conditional, mutual independence given the class).',
            'Explain why the full joint table is unlearnable and count the parameters saved.',
            'Distinguish “independent given the class” from “independent of the class” and from marginal independence.',
            'Write the Naive Bayes decision rule and the count-based estimates.',
          ],
        },
        {
          slug: 'playtennis',
          title: 'Worked example: PlayTennis',
          question: 'How do we train Naive Bayes by counting and classify by multiplying?',
          page: PlayTennis,
          checks: [
            'Build the class-conditional count table from the PlayTennis data.',
            'Compute both class scores for a query with correct within-class denominators.',
            'Normalise the scores into posteriors and verify they sum to 1.',
            'Explain why every factor in the “no” product has denominator 5.',
          ],
        },
        {
          slug: 'smoothing',
          title: 'Zero counts, smoothing and logs',
          question: 'What goes wrong with unseen values and tiny products, and how do we fix it?',
          page: Smoothing,
          checks: [
            'Explain the zero-frequency problem and why one zero wipes out a class score.',
            'Apply add-α smoothing with the correct denominator N_c + αK_j for each feature.',
            'Explain why log-space computation avoids underflow but not zero counts.',
            'Trace the Naive Bayes training and prediction algorithm.',
          ],
        },
        {
          slug: 'gnb',
          title: 'Gaussian Naive Bayes',
          question: 'How does Naive Bayes handle numeric features?',
          page: GNB,
          checks: [
            'Write the Gaussian class-conditional density and evaluate it at a point.',
            'Estimate μ and σ within each class; distinguish the n − 1 and MLE (n) conventions.',
            'Explain why a density is not a probability and can exceed 1.',
            'Combine densities and priors into a posterior.',
          ],
        },
      ],
    },
    {
      title: 'IV · Text and practical issues',
      lessons: [
        {
          slug: 'text',
          title: 'Representing text',
          question: 'What exactly does a document “observe” — presence, or counts?',
          page: Text,
          checks: [
            'Convert a document into a presence vector and a count vector after removing stop words.',
            'State the bag-of-words assumption for each text model.',
            'Explain what training counts and smoothing denominators each model uses.',
          ],
        },
        {
          slug: 'bernoulli',
          title: 'The Bernoulli text model',
          question: 'How does a presence/absence model score a document?',
          page: Bernoulli,
          checks: [
            'Estimate θ_jc = (documents containing word j + 1)/(N_c + 2).',
            'Score a bit vector, including the factors for absent words.',
            'Compute the likelihood ratio and the effect of changing the prior.',
            'Explain why repeated words do not change the Bernoulli likelihood.',
          ],
        },
        {
          slug: 'multinomial',
          title: 'The multinomial text model',
          question: 'How does a word-count model score a document, and why can it disagree with Bernoulli?',
          page: Multinomial,
          checks: [
            'Estimate θ_jc = (T_jc + 1)/(T_c + m) and explain why these sum to 1.',
            'Compute the multinomial probability of a count vector, including the coefficient.',
            'Explain why the coefficient cancels in class comparisons and absent words contribute nothing.',
            'Explain why Bernoulli and multinomial can disagree on the same document.',
          ],
        },
        {
          slug: 'missing',
          title: 'Missing values in Naive Bayes',
          question: 'What should we do with a feature we did not observe?',
          page: Missing,
          checks: [
            'Distinguish a missing value from an observed zero or absence.',
            'Show why Naive Bayes can simply omit a missing feature at prediction time.',
            'Handle a missing value during training (adjusted per-feature counts).',
            'Marginalise over a missing feature in a general posterior table with the correct conditional weights.',
          ],
        },
        {
          slug: 'limits',
          title: 'When Naive Bayes works — and misleads',
          question: 'Why can Naive Bayes classify well yet report terrible probabilities?',
          page: Limits,
          checks: [
            'Explain why correct classification does not require correct posterior probabilities.',
            'Show how duplicated features double-count evidence and can reverse a decision.',
            'Compare Naive Bayes likelihood ratios with full-table posterior odds (the Viagra/lottery example).',
            'Give a balanced list of strengths and limitations.',
          ],
        },
      ],
    },
  ],
  practice,
  reference: Reference,
  readiness: {
    items: [
      'Derive Bayes’ theorem from the product rule and explain every term.',
      'Compute ML, MAP and minimum-risk decisions for the same observation.',
      'Explain why squared error follows from the stated Gaussian-noise model.',
      'Distinguish one MAP hypothesis, a posterior-weighted prediction and Gibbs.',
      'Derive the Naive Bayes product and state its conditional independence assumption.',
      'Train and compare categorical, Bernoulli, multinomial and Gaussian models.',
      'Handle zero counts and missing information without changing their meanings.',
      'Explain why a correct class label does not imply a reliable probability.',
    ],
    note: 'Closed-book mastery check. If a calculation fails, check the denominator first: within-class counts, smoothing pseudo-counts, and the evidence used for normalisation.',
  },
});
