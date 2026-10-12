import { M, MB } from '../../components/Math';
import type { Problem } from '../../components/ProblemSet';
import { Callout } from '../../components/ui';
import type { PracticeDef } from '../../course/types';

// Week 4 practice problems and answers (Q1–Q12).

const A: Problem[] = [
  {
    id: 'Q1',
    title: 'Compare two categorical splits',
    lesson: 'gain',
    q: (
      <p>
        A parent has 6 positive and 4 negative labels. Test A produces children (4+, 0−) and (2+, 4−); test B produces (3+, 2−) and (3+, 2−). Compute the
        parent entropy, both gains, and A’s gain ratio. Explain why B has zero gain even though it makes two children.
      </p>
    ),
    hint: 'Show the child counts and weights before any entropy. B’s children have the same proportions as the parent.',
    sol: (
      <>
        <MB t="H(S) = H(0.6) = 0.970951, \qquad \operatorname{IG}(S, A) = 0.970951 - \Big(\tfrac{4}{10}\cdot 0 + \tfrac{6}{10}\cdot H\big(\tfrac13\big)\Big) = 0.970951 - 0.6 \times 0.918296 = 0.419973." />
        <p>
          A’s branch sizes are 0.4 and 0.6, so <M t="\operatorname{SplitH}(S, A) = H(0.4) = 0.970951" /> and <M t="\operatorname{GR}(S, A) = 0.419973 / 0.970951 = 0.432538" />.
          B’s children each have positive proportion 3/5, exactly the parent’s, so the expected entropy is unchanged and <M t="\operatorname{IG}(S, B) = 0" />. The
          number of branches is irrelevant: knowing B’s outcome tells you nothing about the label.
        </p>
      </>
    ),
  },
  {
    id: 'Q2',
    title: 'Diagnose a high-cardinality feature',
    lesson: 'gainratio',
    q: (
      <p>
        Ten examples have balanced binary labels. An ID feature puts each example in its own branch; another feature splits the labels into two pure groups of
        five. Compute the information gain and gain ratio of both. What can this comparison establish about predictions for new examples?
      </p>
    ),
    sol: (
      <p>
        Parent entropy 1, and both splits have pure children, so both gains are 1. The ID’s split entropy is <M t="\log_2 10 = 3.321928" />, giving gain ratio{' '}
        <M t="1/\log_2 10 = 0.301030" />; the binary split has split entropy 1 and gain ratio 1. Gain ratio prefers the binary partition here. Neither number
        proves generalisation: the ID makes no meaningful prediction for a new identifier, and a high ratio for the binary feature does not show that its
        relationship with the label will hold on new data — that needs validation.
      </p>
    ),
  },
  {
    id: 'Q3',
    title: 'Trees for Boolean functions',
    lesson: 'expressiveness',
    q: (
      <p>
        Draw decision trees for <M t="A \vee (B \wedge C)" /> and <M t="A \oplus B" />, testing variables in alphabetical order and stopping as soon as a branch
        is constant. How many leaves does each have? How many leaves does any tree for the parity of A, B, C need, and why?
      </p>
    ),
    hint: 'Substitute one variable at a time and simplify. For parity, ask what happens if a leaf is reached before some variable has been tested.',
    sol: (
      <p>
        <M t="A \vee (B \wedge C)" />: A = t → True; A = f → test B; B = f → False; B = t → test C (t → True, f → False). Four leaves, and C appears on one path
        only. <M t="A \oplus B" />: test A; both branches must test B (A = t → ¬B, A = f → B). Four leaves. Parity of three variables needs 8 leaves in any order:
        flipping any single input flips the output, so a leaf reached without testing some variable would be wrong for one of that variable’s values. Every
        leaf is at depth 3, one per input combination.
      </p>
    ),
  },
  {
    id: 'Q4',
    title: 'Explain an interaction',
    lesson: 'greedy',
    q: (
      <p>
        Use the four equally weighted XOR examples. Compute the gain of A at the root, then the gain of B within the A = t branch. Explain why “stop whenever the
        immediate gain is zero” can fail even though a tree can represent XOR.
      </p>
    ),
    sol: (
      <>
        <MB t="\operatorname{IG}(S, A) = 1 - \big(\tfrac12 \cdot 1 + \tfrac12 \cdot 1\big) = 0." />
        <p>
          Within A = t, B = f gives True and B = t gives False: local parent entropy 1, both children pure, so B’s gain there is 1. The first step brings no
          immediate improvement but enables a perfect second step. A rule that stops when every first-step gain is zero returns a single leaf with 2 errors out
          of 4, although a depth-2 tree is exact: the failure belongs to the stopping rule, not to the representation.
        </p>
      </>
    ),
  },
  {
    id: 'Q5',
    title: 'Choose an admissible numeric split',
    lesson: 'numeric',
    q: (
      <p>
        Values 10.2, 11.1, 11.8, 13.0, 13.6, 14.4, 15.5, 16.5, 18.0 with labels +, −, −, +, +, +, −, −, +. List the class-change midpoints. Which thresholds
        maximise gain with no leaf-size limit? Which, if every leaf must hold at least two examples?
      </p>
    ),
    sol: (
      <p>
        Class-change midpoints: 10.65, 12.4, 14.95 and 17.25. Without constraints, 10.65 and 17.25 tie at gain 0.102187, each isolating a single example. A
        minimum leaf size of 2 excludes both; among the admissible thresholds, 12.4 and 14.95 tie at 0.072780 (children of sizes 3 and 6), and the full table
        confirms no other admissible gap does better. State a tie-break, e.g. the smaller threshold. The constraint changes the candidate set, not the
        formula.
      </p>
    ),
  },
  {
    id: 'Q6',
    title: 'Finish the PlayTennis tree',
    lesson: 'playtennis',
    q: (
      <p>
        Inside the Rain branch (D4, D5, D6, D10, D14), compute the local entropy and the gains of Humidity and Wind. Which is chosen? Write the two resulting
        rules and use the finished tree to classify (Rain, High, Weak).
      </p>
    ),
    sol: (
      <>
        <p>
          Rain holds 3 Yes and 2 No: <M t="H = 0.970951" />. Humidity: High (D4 Yes, D14 No) = (1, 1), Normal (D5, D6, D10) = (2, 1):
        </p>
        <MB t="\operatorname{IG} = 0.970951 - \big(\tfrac25 \cdot 1 + \tfrac35 \cdot 0.918296\big) = 0.019973." />
        <p>
          Wind: Weak (3, 0), Strong (0, 2), both pure, so its gain is the full 0.970951. Choose Wind. Rules: Outlook = Rain ∧ Wind = Weak ⇒ Yes; Outlook =
          Rain ∧ Wind = Strong ⇒ No. (Rain, High, Weak) goes Rain → Wind → Weak → <strong>Yes</strong>; Humidity is never consulted.
        </p>
      </>
    ),
  },
];

const B: Problem[] = [
  {
    id: 'Q7',
    title: 'Separate noise from model limitation',
    lesson: 'conflicts',
    q: (
      <p>
        For the 12-example table of lesson 11, identify the input tuples that force errors and give the minimum number of training mistakes. Then construct a
        12-example, three-class dataset on which even a fully grown tree has training error 2/3.
      </p>
    ),
    sol: (
      <p>
        The tuples (0, 1, 1) and (1, 1, 1) each occur once with Y = 0 and once with Y = 1, so each forces one mistake; every other tuple is pure. Minimum: 2
        errors out of 12. For three classes, give all 12 examples identical attribute values with four labels in each class: any prediction gets 4 right and 8
        wrong, an error of 8/12 = 2/3, and no split can separate identical inputs.
      </p>
    ),
  },
  {
    id: 'Q8',
    title: 'Make pruning decisions',
    lesson: 'pruning',
    q: (
      <>
        <p>
          Cross-validated errors (with SE) for trees of 4, 8, 16 and 32 leaves are 0.180 (0.020), 0.137 (0.014), 0.130 (0.010) and 0.134 (0.012). Which size
          does the minimum-error rule choose, and which the one-SE rule?
        </p>
        <p>
          Separately, a node has training counts 6 Yes / 4 No and validation counts 5 Yes / 3 No. Would replacing its subtree by a leaf improve validation
          accuracy if the subtree makes 2 validation errors? If it makes 4?
        </p>
      </>
    ),
    sol: (
      <p>
        Minimum error: 16 leaves. One-SE threshold: <M t="0.130 + 0.010 = 0.140" />; the smallest tree at or below it has <strong>8 leaves</strong>. For the
        node: the replacement leaf predicts the training majority, Yes, and so makes 3 validation errors (the 3 No). Replacing a subtree with 2 errors is
        harmful; replacing one with 4 removes an error. The validation labels judge the choice; they do not supply the leaf’s label.
      </p>
    ),
  },
  {
    id: 'Q9',
    title: 'A missing value, then a costly decision',
    lesson: 'practical',
    q: (
      <p>
        Classify (Outlook ?, High, Weak) with the finished PlayTennis tree, (a) by fractional routing and (b) by filling in the most common Outlook at the root.
        Then suppose predicting Yes on a No day costs 3 and predicting No on a Yes day costs 1. Using the fractional-routing probability, what should be
        predicted?
      </p>
    ),
    hint: 'The root sends weights 5/14, 4/14 and 5/14 down Sunny, Overcast and Rain.',
    sol: (
      <>
        <p>
          (a) Sunny (5/14) → Humidity High → No; Overcast (4/14) → Yes; Rain (5/14) → Wind Weak → Yes. So <M t="P(\text{Yes}) = 9/14" /> and the prediction is
          Yes. (b) Sunny and Rain tie at 5 days each, so the answer depends on the tie-break: Sunny leads to No, Rain to Yes — a reason to state the policy
          precisely.
        </p>
        <MB t="R(\text{Yes}) = 3 \times \tfrac{5}{14} = \tfrac{15}{14}, \qquad R(\text{No}) = 1 \times \tfrac{9}{14} = \tfrac{9}{14}." />
        <p>The minimum-cost prediction is <strong>No</strong>, even though Yes is more probable.</p>
      </>
    ),
  },
  {
    id: 'Q10',
    title: 'Build a regression stump',
    lesson: 'regsplit',
    q: (
      <p>
        With <M t="x = (1, 2, 3, 4, 5, 6)" /> and <M t="y = (1, 2, 2, 8, 9, 10)" />, compare all midpoint splits. Give the chosen threshold, both leaf
        predictions, the weighted MSE and the reduction from the parent’s MSE. Why would variance with denominator <M t="m - 1" /> be the wrong objective?
      </p>
    ),
    sol: (
      <p>
        Weighted MSEs at 1.5, 2.5, 3.5, 4.5, 5.5: 10.133, 6.542, 0.444, 5.208, 9.533. Choose 3.5. Leaf predictions <M t="5/3" /> and 9; total child SSE{' '}
        <M t="2/3 + 2 = 8/3" />, weighted MSE <M t="4/9" />. Parent MSE <M t="125/9" />, so the reduction is <M t="121/9 \approx 13.44" />. The denominator{' '}
        <M t="m" /> appears because we minimise the average squared prediction error over the observed examples; <M t="m - 1" /> belongs to unbiased variance
        estimation, a different question, and would change how child groups of different sizes compare.
      </p>
    ),
  },
  {
    id: 'Q11',
    title: 'Standard deviation reduction and linear leaves',
    lesson: 'modeltree',
    q: (
      <p>
        Targets are <M t="y = x" /> at <M t="x = 1, \dots, 6" />. Compute the standard deviation reduction (population standard deviations, denominator{' '}
        <M t="n" />) of the split at 3.5. How many leaves does a model tree with linear leaves actually need here, and what does that say about SDR as a
        criterion for model trees?
      </p>
    ),
    sol: (
      <>
        <MB t="\operatorname{sd}(S) = \sqrt{35/12} = 1.7078, \qquad \operatorname{sd}(1, 2, 3) = \operatorname{sd}(4, 5, 6) = \sqrt{2/3} = 0.8165, \qquad \operatorname{SDR} = 1.7078 - 0.8165 = 0.8913." />
        <p>
          SDR rewards the split strongly. Yet one linear leaf fits <M t="y = x" /> exactly (zero error), so a model tree needs no split at all. SDR measures
          how much a split reduces the spread of the targets — the right question for constant leaves, only a proxy for linear ones. Pruning with fitted
          linear models is what removes such unnecessary splits.
        </p>
      </>
    ),
  },
  {
    id: 'Q12',
    title: 'Explain a local smoother',
    lesson: 'kernel',
    q: (
      <p>
        Query <M t="x_0 = 0" />; observations at distances 0, 0.15 and 0.30 with responses 1, 0, 1. Compute the boxcar and Epanechnikov predictions over a
        common radius of 0.30, explain why their normalised weights differ, why the method is linear in <M t="Y" />, and why the same <M t="h" /> in the given
        definitions does not give the same window.
      </p>
    ),
    sol: (
      <p>
        Radius 0.30 means <M t="h_{\text{box}} = 0.60" /> and <M t="h_{\text{epan}} = 0.30" />. Boxcar: weights (1/3, 1/3, 1/3), prediction 2/3. Epanechnikov:
        scaled distances 0, 0.5, 1; raw weights (3/4, 9/16, 0); normalised (4/7, 3/7, 0); prediction 4/7. The boxcar is flat over its support, Epanechnikov
        decreases with distance and reaches zero at the edge. For fixed <M t="X" />, kernel and <M t="h" /> the weights do not depend on <M t="Y" />, so the
        prediction is a fixed linear combination of the responses — though the fitted curve need not be a straight line in <M t="x" />. With a shared{' '}
        <M t="h" />, the boxcar reaches <M t="h/2" /> and Epanechnikov <M t="h" />.
      </p>
    ),
  },
];

const practice: PracticeDef = {
  blurb: 'Twelve problems on splits, search, pruning, regression trees and smoothing, with full answers.',
  groups: [
    { key: 'A', title: 'Choosing splits and growing trees', intro: 'Q1–Q6: gain, gain ratio, Boolean trees, XOR, numeric thresholds and PlayTennis.', items: A },
    { key: 'B', title: 'Generalisation, regression and smoothing', intro: 'Q7–Q12: conflicting labels, pruning, missing values and costs, regression and model trees, kernel smoothing.', items: B },
  ],
  footer: (
    <Callout kind="warning" title="Errors to catch in your own solution">
      <ul>
        <li>Averaging child entropies without weighting by branch size, or using the parent’s total for a child’s proportions.</li>
        <li>Reusing the root’s counts inside a branch instead of the branch’s own examples.</li>
        <li>Treating zero immediate gain as proof that no useful split exists.</li>
        <li>Letting a row identifier compete as an attribute, and trusting gain ratio to reject it.</li>
        <li>Labelling a pruned leaf with the validation majority, or using each candidate’s own SE in the one-SE rule.</li>
        <li>Keeping the parent mean after a regression split, or dividing a leaf’s squared error by m − 1.</li>
        <li>Mixing up the boxcar’s h/2 window with Epanechnikov’s h, or forgetting to normalise the kernel weights.</li>
      </ul>
    </Callout>
  ),
};

export default practice;
