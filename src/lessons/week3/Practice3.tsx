import { M, MB } from '../../components/Math';
import { ProblemSet, problemIds, type Problem, type ProblemGroup } from '../../components/ProblemSet';
import { Callout } from '../../components/ui';

// Week 3 practice problems and answers (Q1–Q12, A1–A12).

const A: Problem[] = [
  {
    id: 'Q1',
    title: 'Identify the assumption',
    lesson: 'w3-bias',
    q: (
      <>
        <p>For each statement, explain what is right or wrong.</p>
        <ol>
          <li>“Nearest neighbours has no inductive bias because it does not fit a formula.”</li>
          <li>“A strong inductive bias must create a large statistical bias.”</li>
          <li>“Naive Bayes assumes that the features are independent of the class.”</li>
        </ol>
      </>
    ),
    sol: (
      <p>
        (1) k-NN assumes locality under its representation and distance: nearby examples have similar outputs. (2) Strong assumptions need not cause systematic
        error when they are correct. (3) Naive Bayes assumes mutual independence of the features <em>conditional on the class</em>, not independence from the
        class — useful feature distributions differ between classes.
      </p>
    ),
  },
  {
    id: 'Q2',
    title: 'ML, MAP and normalisation',
    lesson: 'w3-map',
    q: (
      <p>
        Priors <M t="P(A) = 0.2" />, <M t="P(B) = 0.8" />; likelihoods <M t="P(x \mid A) = 0.6" />, <M t="P(x \mid B) = 0.2" />. Give the ML and MAP classes,
        both posteriors, and the likelihood ratio, prior odds and posterior odds for A versus B.
      </p>
    ),
    sol: (
      <p>
        ML chooses A (0.6 &gt; 0.2). MAP scores <M t="s_A = 0.12" />, <M t="s_B = 0.16" />: MAP chooses B. Evidence 0.28, so <M t="P(A \mid x) = 3/7" />,{' '}
        <M t="P(B \mid x) = 4/7" />. Likelihood ratio 3, prior odds 1/4, posterior odds 3/4 — which equals <M t="(3/7)/(4/7)" />.
      </p>
    ),
  },
  {
    id: 'Q3',
    title: 'Unequal costs',
    lesson: 'w3-risk',
    q: (
      <p>
        Use Q2’s posterior. Correct predictions cost 0; predicting A when B is true costs 1; predicting B when A is true costs 4. Write the loss matrix (actions as
        rows), compute both conditional risks, choose the minimum-risk action, and derive the posterior threshold for predicting A.
      </p>
    ),
    hint: 'Each row: weight its entries by the posterior of their column.',
    sol: (
      <>
        <p>With columns (true A, true B): predict A → (0, 1); predict B → (4, 0).</p>
        <MB t="R(A \mid x) = 1 \times \tfrac47 = \tfrac47, \qquad R(B \mid x) = 4 \times \tfrac37 = \tfrac{12}{7}." />
        <p>
          Choose A. Threshold <M t="1/(1 + 4) = 1/5" />, and <M t="3/7 > 1/5" />. This differs from MAP because missing A is costlier.
        </p>
      </>
    ),
  },
  {
    id: 'Q4',
    title: 'Reconstruct the squared-error argument',
    lesson: 'w3-gaussnoise',
    q: (
      <p>
        Assume independent Gaussian errors with common fixed variance <M t="\sigma^2" />. Write the likelihood and log-likelihood for observations{' '}
        <M t="(x_i, y_i)" />, identify which terms can be removed when maximising over <M t="h" />, and explain why the result minimises squared error.
      </p>
    ),
    sol: (
      <>
        <MB t="L(h) = \prod_i \frac{1}{\sqrt{2\pi\sigma^2}}\exp\Big(-\frac{(y_i - h(x_i))^2}{2\sigma^2}\Big), \quad \log L(h) = -\frac n2\log(2\pi\sigma^2) - \frac{1}{2\sigma^2}\sum_i(y_i - h(x_i))^2." />
        <p>
          Log preserves the maximiser. The first term is constant in <M t="h" />; the remaining term is a negative constant times the squared error, so
          maximising it minimises <M t="\sum_i(y_i - h(x_i))^2" />.
        </p>
      </>
    ),
  },
  {
    id: 'Q5',
    title: 'MAP model, Bayes prediction and Gibbs',
    lesson: 'w3-bayesopt',
    q: (
      <p>
        Three deterministic hypotheses have posterior weights (0.45, 0.35, 0.20) and predict (+, −, −) at a new <M t="x" />. What does the MAP hypothesis
        predict? The Bayes optimal classifier? With what probability does Gibbs predict each class? Under the posterior predictive distribution, compute the
        conditional errors of always +, always −, and Gibbs.
      </p>
    ),
    sol: (
      <>
        <p>
          MAP hypothesis: +. Posterior predictive <M t="P(+ \mid x, D) = 0.45" />, <M t="P(- \mid x, D) = 0.55" />, so Bayes predicts −. Gibbs predicts + with
          probability 0.45 and − with 0.55. Always + errs with 0.55, always − with 0.45, and
        </p>
        <MB t="R_{\text{Gibbs}}(x) = 0.45 \times 0.55 + 0.55 \times 0.45 = 0.495." />
      </>
    ),
  },
  {
    id: 'Q6',
    title: 'Bayes error',
    lesson: 'w3-bayeserror',
    q: (
      <p>
        Inputs <M t="u, v" /> occur with <M t="P(u) = 0.25" />, <M t="P(v) = 0.75" />; <M t="P(A \mid u) = 0.9" />, <M t="P(A \mid v) = 0.4" />. Give the optimal
        prediction at each input, the Bayes error, and the best expected accuracy.
      </p>
    ),
    sol: (
      <p>
        Predict A at u (error 0.1), B at v (error 0.4). <M t="R^* = 0.25 \times 0.1 + 0.75 \times 0.4 = 0.325" />; best expected accuracy 0.675. Weight the
        errors by how often each input occurs.
      </p>
    ),
  },
];

const B: Problem[] = [
  {
    id: 'Q7',
    title: 'Categorical Naive Bayes with smoothing',
    lesson: 'w3-smoothing',
    q: (
      <p>
        Six class-A and four class-B examples. Colour (red, blue, green) has counts (3, 2, 1) in A and (0, 1, 3) in B; Shape (round, square) has (4, 2) in A and
        (1, 3) in B. Using unsmoothed class priors and Laplace-smoothed feature probabilities, classify (red, round) and compute <M t="P(A \mid x)" />. Why do the
        two features have different smoothing denominators?
      </p>
    ),
    sol: (
      <>
        <MB t="s_A = \tfrac35 \times \tfrac{3 + 1}{6 + 3} \times \tfrac{4 + 1}{6 + 2} = \tfrac16, \qquad s_B = \tfrac25 \times \tfrac{0 + 1}{4 + 3} \times \tfrac{1 + 1}{4 + 2} = \tfrac{2}{105}." />
        <p>
          <M t="P(A \mid x) = \frac{1/6}{1/6 + 2/105} = \frac{35}{39} \approx 0.897" />: predict A. Colour has three possible values, Shape two; the
          denominator counts one pseudo-observation per possible value.
        </p>
      </>
    ),
  },
  {
    id: 'Q8',
    title: 'PlayTennis without wind information',
    lesson: 'w3-missing',
    q: (
      <p>
        Using the unsmoothed counts of lesson 10, classify (sunny, cool, high, wind missing). Compute both scores and the “yes” posterior, and explain why neither
        the true nor the false wind factor should be used.
      </p>
    ),
    sol: (
      <>
        <MB t="s_{\text{yes}} = \tfrac{9}{14}\cdot\tfrac29\cdot\tfrac39\cdot\tfrac39 = \tfrac{1}{63}, \qquad s_{\text{no}} = \tfrac{5}{14}\cdot\tfrac35\cdot\tfrac15\cdot\tfrac45 = \tfrac{6}{175}." />
        <p>
          <M t="P(\text{yes} \mid x) = 25/79 \approx 0.3165" />: predict no. Marginalising over the unknown wind sums its two conditional probabilities to 1,
          so its factor disappears.
        </p>
      </>
    ),
  },
  {
    id: 'Q9',
    title: 'Bernoulli versus multinomial',
    lesson: 'w3-multinomial',
    q: (
      <p>
        With the smoothed text parameters of lessons 14–15 and equal priors, take the document “a a a b”. Write both representations; compute each model’s
        likelihood ratio and spam posterior; explain the disagreement without calling either calculation wrong. For the empty count vector, what does the
        multinomial decision depend on, and would Bernoulli treat absence the same way?
      </p>
    ),
    sol: (
      <p>
        Bernoulli uses (1, 1, 0): ratio 3/2, spam posterior 3/5, predict spam. Multinomial uses (3, 1, 0): ratio 5/16, spam posterior 5/21, predict ham —
        repeated a’s favour ham only in the count model. For the empty count vector (L = 0) the coefficient and products are 1, so the multinomial decision uses
        only the priors. Bernoulli multiplies all absence factors <M t="\prod_j(1 - \theta_{jc})" />, which may favour a class.
      </p>
    ),
  },
  {
    id: 'Q10',
    title: 'Gaussian quantities',
    lesson: 'w3-gnb',
    q: (
      <p>
        A Gaussian class-conditional feature has <M t="\mu = 10" />, <M t="\sigma = 2" />. Evaluate its density at <M t="x = 12" />. Is this <M t="P(X = 12)" />?
        For observed values (8, 10, 12), compute the sample variance, sample standard deviation and MLE variance.
      </p>
    ),
    sol: (
      <p>
        <M t="p(12) = \frac{1}{2\sqrt{2\pi}}e^{-1/2} \approx 0.121" /> — a density; the point probability is 0. Mean 10, squared deviations sum to 8: sample
        variance <M t="8/2 = 4" />, sample standard deviation 2, MLE variance <M t="8/3" />.
      </p>
    ),
  },
  {
    id: 'Q11',
    title: 'Missing-value weights',
    lesson: 'w3-missing',
    q: (
      <p>
        <M t="P(\text{spam} \mid A = 0, B = 1) = 0.65" />, <M t="P(\text{spam} \mid A = 1, B = 1) = 0.40" />, and <M t="P(A = 1 \mid B = 1) = 0.20" />. Compute{' '}
        <M t="P(\text{spam} \mid B = 1)" />. Would knowing only <M t="P(A = 1) = 0.20" /> be sufficient?
      </p>
    ),
    sol: (
      <p>
        <M t="0.65 \times 0.80 + 0.40 \times 0.20 = 0.60" />. The marginal <M t="P(A = 1)" /> is not sufficient without an extra assumption relating A and B;
        the required weight is <M t="P(A = 1 \mid B = 1)" />.
      </p>
    ),
  },
  {
    id: 'Q12',
    title: 'Duplicate evidence can change the class',
    lesson: 'w3-limits',
    q: (
      <p>
        Prior odds for A versus B are 1/5. One binary feature has likelihood ratio 3; a second feature is an exact duplicate. Find the correct posterior odds
        (true joint distribution) and the odds from multiplying both marginal ratios. Which class does each choose under equal costs?
      </p>
    ),
    sol: (
      <p>
        The duplicate carries no new evidence: correct odds <M t="\tfrac15 \times 3 = \tfrac35" />, favouring B. The naive product gives{' '}
        <M t="\tfrac15 \times 3^2 = \tfrac95" />, favouring A. Dependence can reverse a decision, not merely exaggerate confidence.
      </p>
    ),
  },
];

const GROUPS: ProblemGroup[] = [
  { key: 'A', title: 'Probability and decision rules', intro: 'Q1–Q6: assumptions, Bayes’ rule, costs, Gaussian noise, Bayesian prediction, Bayes error.', items: A },
  { key: 'B', title: 'Train, compare and diagnose', intro: 'Q7–Q12: Naive Bayes in its categorical, Gaussian and text forms, missing values and dependent features.', items: B },
];

export const ALL_PROBLEMS_W3 = problemIds(GROUPS);

export default function Practice3() {
  return (
    <ProblemSet groups={GROUPS} storeKey="w3.practice">
      <Callout kind="warning" title="Errors to catch in your own solution">
        <ul>
          <li>Reversing P(x | c) and P(c | x), or forgetting the class priors.</li>
          <li>Using all training examples as the denominator of a within-class frequency.</li>
          <li>Adding 1 to a smoothing numerator without adding all the pseudo-counts below.</li>
          <li>Omitting absent-word factors in Bernoulli, or inserting them in multinomial.</li>
          <li>Treating a density, a joint score or a likelihood ratio as a posterior probability.</li>
          <li>Replacing a missing feature with zero, or averaging with the wrong weights.</li>
          <li>Calling the MAP model’s prediction Bayes optimal without averaging over hypotheses.</li>
        </ul>
      </Callout>
    </ProblemSet>
  );
}
