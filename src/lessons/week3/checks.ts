// Week 3 “Can you do these without looking?” items, one list per lesson (shared with the readiness page).
export const CHECKS3: Record<string, string[]> = {
  'w3-bias': [
    'Give an example where two hypotheses fit the training data perfectly but predict differently on new inputs.',
    'Define inductive bias and state it for linear regression, k-NN and Naive Bayes.',
    'Distinguish inductive bias (assumptions) from statistical bias (systematic error).',
    'Explain what a generative model learns, compared with a discriminative one.',
  ],
  'w3-bayes': [
    'Derive Bayes’ theorem from the product rule and expand the evidence by total probability.',
    'Name and interpret prior, likelihood, evidence and posterior.',
    'Compute posteriors from priors and class-conditionals (the 70 cm fish).',
    'Explain why the evidence can be dropped for an argmax but not when reporting a probability.',
  ],
  'w3-map': [
    'Write h_MAP and h_ML and state when they coincide.',
    'Find an example where ML and MAP choose different hypotheses.',
    'Write posterior odds = likelihood ratio × prior odds and convert odds to a probability.',
    'Explain which threshold the likelihood ratio must exceed for a MAP decision with unequal priors.',
  ],
  'w3-baserate': [
    'Translate a worded diagnostic problem into P(C), P(+|C) and P(+|¬C).',
    'Compute P(C|+) and explain why it can be small even for an accurate test.',
    'Check the answer with a natural-frequency table.',
    'Explain why a positive result still changes the probability even if the MAP label does not change.',
  ],
  'w3-risk': [
    'Define conditional risk R(a|x) = Σ_c L(a, c) P(c|x) and compute it from a loss table.',
    'Derive the binary threshold p > C_FP/(C_FP + C_FN).',
    'Show that zero-one loss turns minimum risk into MAP.',
    'Explain why the decision can change while the posterior stays the same.',
  ],
  'w3-gaussnoise': [
    'Write the likelihood of regression data under independent Gaussian noise.',
    'Derive that maximising it minimises the sum of squared errors, justifying each dropped term.',
    'Explain which assumption (independence, zero mean, common variance, Gaussian shape) is used where.',
    'Explain why Laplace noise would lead to absolute error instead.',
  ],
  'w3-bayesopt': [
    'Explain why the MAP hypothesis’s prediction need not be the most probable class.',
    'Compute the Bayes optimal prediction Σ_h P(y|x,h) P(h|D) for a small example.',
    'Describe the Gibbs classifier and its expected-error bound (with its assumptions).',
    'Compute the conditional error of MAP-model, Bayes optimal and Gibbs predictions.',
  ],
  'w3-bayeserror': [
    'Define the conditional Bayes error 1 − max_c P(c|x) and the Bayes error as its expectation.',
    'Compute the Bayes error for a small discrete example, weighting by P(x).',
    'Explain why more data cannot reduce Bayes error for a fixed feature set, but new features can.',
  ],
  'w3-nb': [
    'State the Naive Bayes assumption precisely (conditional, mutual independence given the class).',
    'Explain why the full joint table is unlearnable and count the parameters saved.',
    'Distinguish “independent given the class” from “independent of the class” and from marginal independence.',
    'Write the Naive Bayes decision rule and the count-based estimates.',
  ],
  'w3-playtennis': [
    'Build the class-conditional count table from the PlayTennis data.',
    'Compute both class scores for a query with correct within-class denominators.',
    'Normalise the scores into posteriors and verify they sum to 1.',
    'Explain why every factor in the “no” product has denominator 5.',
  ],
  'w3-smoothing': [
    'Explain the zero-frequency problem and why one zero wipes out a class score.',
    'Apply add-α smoothing with the correct denominator N_c + αK_j for each feature.',
    'Explain why log-space computation avoids underflow but not zero counts.',
    'Trace the Naive Bayes training and prediction algorithm.',
  ],
  'w3-gnb': [
    'Write the Gaussian class-conditional density and evaluate it at a point.',
    'Estimate μ and σ within each class; distinguish the n − 1 and MLE (n) conventions.',
    'Explain why a density is not a probability and can exceed 1.',
    'Combine densities and priors into a posterior.',
  ],
  'w3-text': [
    'Convert a document into a presence vector and a count vector after removing stop words.',
    'State the bag-of-words assumption for each text model.',
    'Explain what training counts and smoothing denominators each model uses.',
  ],
  'w3-bernoulli': [
    'Estimate θ_jc = (documents containing word j + 1)/(N_c + 2).',
    'Score a bit vector, including the factors for absent words.',
    'Compute the likelihood ratio and the effect of changing the prior.',
    'Explain why repeated words do not change the Bernoulli likelihood.',
  ],
  'w3-multinomial': [
    'Estimate θ_jc = (T_jc + 1)/(T_c + m) and explain why these sum to 1.',
    'Compute the multinomial probability of a count vector, including the coefficient.',
    'Explain why the coefficient cancels in class comparisons and absent words contribute nothing.',
    'Explain why Bernoulli and multinomial can disagree on the same document.',
  ],
  'w3-missing': [
    'Distinguish a missing value from an observed zero or absence.',
    'Show why Naive Bayes can simply omit a missing feature at prediction time.',
    'Handle a missing value during training (adjusted per-feature counts).',
    'Marginalise over a missing feature in a general posterior table with the correct conditional weights.',
  ],
  'w3-limits': [
    'Explain why correct classification does not require correct posterior probabilities.',
    'Show how duplicated features double-count evidence and can reverse a decision.',
    'Compare Naive Bayes likelihood ratios with full-table posterior odds (the Viagra/lottery example).',
    'Give a balanced list of strengths and limitations.',
  ],
};
