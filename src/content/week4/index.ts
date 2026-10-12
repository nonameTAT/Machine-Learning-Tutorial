import { defineWeek } from '../../course/types';
import Overview from './Overview';
import Reference from './Reference';
import practice from './practice';
import Partition from './lessons/Partition';
import Expressiveness from './lessons/Expressiveness';
import Tdidt from './lessons/Tdidt';
import Entropy from './lessons/Entropy';
import Gain from './lessons/Gain';
import PlayTennis from './lessons/PlayTennis';
import GainRatio from './lessons/GainRatio';
import Numeric from './lessons/Numeric';
import Greedy from './lessons/Greedy';
import Overfitting from './lessons/Overfitting';
import Conflicts from './lessons/Conflicts';
import Pruning from './lessons/Pruning';
import Practical from './lessons/Practical';
import RegTree from './lessons/RegTree';
import RegSplit from './lessons/RegSplit';
import ModelTree from './lessons/ModelTree';
import Kernel from './lessons/Kernel';

export default defineWeek({
  n: 4,
  title: 'Tree learning',
  summary:
    'Learning by asking questions — trees as partitions, entropy and information gain, gain ratio and numeric thresholds, greedy search, overfitting and pruning, regression and model trees, and kernel smoothing as local averaging.',
  overview: Overview,
  parts: [
    {
      title: 'I · Trees as models',
      lessons: [
        {
          slug: 'partition',
          title: 'Trees as adaptive partitions',
          question: 'How can a sequence of simple questions represent a complicated boundary?',
          page: Partition,
          checks: [
            'Trace an input through a tree and write its leaf as a conjunction of tests.',
            'Draw the partition of the plane produced by a small threshold tree.',
            'Explain why single-feature tests give axis-parallel regions and how a diagonal boundary is approximated.',
            'Explain how a tree can use a feature in one region and ignore it in another.',
          ],
        },
        {
          slug: 'expressiveness',
          title: 'What trees can represent',
          question: 'Which functions can a tree express, and why do some need so many leaves?',
          page: Expressiveness,
          checks: [
            'Build a tree for a Boolean formula by fixing one variable at a time.',
            'Explain why XOR and parity need every variable on every path, while AND and OR can stop early.',
            'Prove that every Boolean function of n variables has a tree of depth at most n.',
            'Explain why a tree for (A ∧ B) ∨ (C ∧ D) repeats a subtree, and why representable does not mean learnable.',
          ],
        },
        {
          slug: 'tdidt',
          title: 'Growing a tree top-down',
          question: 'How does a learner build a tree one local decision at a time?',
          page: Tdidt,
          checks: [
            'Write the recursive top-down procedure, including all its stopping cases.',
            'Explain why every split score is computed only from the examples at the current node.',
            'State the partition invariant and use it to check child counts.',
            'Say what a majority leaf minimises and what an empty branch should predict.',
          ],
        },
      ],
    },
    {
      title: 'II · Choosing a split',
      lessons: [
        {
          slug: 'entropy',
          title: 'Entropy: measuring label uncertainty',
          question: 'How uncertain is the label of an example drawn from this node?',
          page: Entropy,
          checks: [
            'Compute the entropy of a node from its class counts, using 0 log 0 = 0.',
            'Explain entropy as expected surprise, or as the average number of yes/no questions.',
            'Show that binary entropy is maximised at p = 1/2, and state the range for k classes.',
            'Explain why entropy depends on proportions, not on the number of examples.',
          ],
        },
        {
          slug: 'gain',
          title: 'Information gain',
          question: 'How much does a test reduce label uncertainty, and why weight by branch size?',
          page: Gain,
          checks: [
            'Compute information gain with size-weighted child entropies.',
            'Explain why an unweighted average of child entropies is wrong.',
            'Reproduce the 64-example comparison: gains 0.266 and 0.121.',
            'Explain when gain is 0, when it equals H(S), and why it is never negative.',
          ],
        },
        {
          slug: 'playtennis',
          title: 'Worked example: growing PlayTennis',
          question: 'How does ID3 choose every test of a real tree?',
          page: PlayTennis,
          checks: [
            'Compute the gains of Outlook, Humidity and Wind at the root of PlayTennis.',
            'Recompute the gains inside the Sunny and Rain branches using local counts.',
            'Translate the finished tree into IF–THEN rules and trace a prediction.',
            'Explain why zero training error does not establish zero future error.',
          ],
        },
        {
          slug: 'gainratio',
          title: 'Gain ratio and many-valued attributes',
          question: 'Why does gain favour tests with many branches, and what does gain ratio fix — and not fix?',
          page: GainRatio,
          checks: [
            'Explain why information gain favours attributes with many values.',
            'Compute split entropy and gain ratio for a candidate test.',
            'Show with a small example that gain ratio can prefer a very unbalanced split.',
            'Explain why identifiers must be removed rather than left to the split criterion (Day on PlayTennis).',
          ],
        },
        {
          slug: 'numeric',
          title: 'Numeric features and thresholds',
          question: 'How do we turn a number into a yes/no question, and which thresholds are worth checking?',
          page: Numeric,
          checks: [
            'List the candidate thresholds for a numeric feature and compute each gain.',
            'Explain why thresholds in the same gap give identical training splits but can differ on new data.',
            'Use class-change boundaries to shorten the search, and say when that shortcut is not enough.',
            'Apply a minimum-leaf-size constraint to the set of candidates.',
          ],
        },
      ],
    },
    {
      title: 'III · Search, overfitting and pruning',
      lessons: [
        {
          slug: 'greedy',
          title: 'Greedy search, inductive bias and XOR',
          question: 'Why can a split with zero gain still be the right first step?',
          page: Greedy,
          checks: [
            'Distinguish restriction bias from preference bias and state each for ID3.',
            'Explain what “greedy” means and why it need not find the smallest tree.',
            'Show that XOR has zero gain for each input at the root but gain 1 one level down.',
            'Explain why “stop when the best gain is zero” is an extra rule, and how it fails.',
          ],
        },
        {
          slug: 'overfitting',
          title: 'Overfitting and pre-pruning',
          question: 'Why does a deeper tree fit the training data better and new data worse?',
          page: Overfitting,
          checks: [
            'Explain why training error cannot increase as a tree grows, while held-out error can.',
            'Connect deep trees to high variance and shallow trees to high bias.',
            'Name four pre-pruning constraints and what each controls.',
            'Distinguish minimum samples to split from minimum samples per leaf.',
          ],
        },
        {
          slug: 'conflicts',
          title: 'Training error with conflicting labels',
          question: 'Can an unpruned tree always reach zero training error — and what is the worst it can do?',
          page: Conflicts,
          checks: [
            'Explain why examples with identical inputs must share a leaf, and compute E_min.',
            'Find the training error of a fully grown tree on the 12-example table (2 of 12).',
            'Prove that a majority-leaf tree has training error at most 1 − 1/k, and show the bound is attained.',
            'State the assumptions behind that bound.',
          ],
        },
        {
          slug: 'pruning',
          title: 'Pruning: reduced error and one standard error',
          question: 'How do we decide which parts of a grown tree to keep?',
          page: Pruning,
          checks: [
            'Carry out one reduced-error pruning decision from training and validation counts.',
            'Explain why the replacement leaf uses the training majority, not the validation majority.',
            'Apply the minimum-error and one-SE rules to a table of cross-validated estimates.',
            'Explain why a final test set must stay out of every pruning decision.',
          ],
        },
        {
          slug: 'practical',
          title: 'Rules, costs and missing values',
          question: 'How do trees handle expensive tests, unequal mistakes and missing attributes?',
          page: Practical,
          checks: [
            'Convert a tree into rules and explain how rule pruning differs from subtree pruning.',
            'Distinguish the cost of measuring an attribute from the cost of a wrong prediction.',
            'Choose a leaf’s prediction by minimum expected cost.',
            'Route an example with a missing value fractionally and combine the leaf distributions.',
          ],
        },
      ],
    },
    {
      title: 'IV · Numeric targets and local averaging',
      lessons: [
        {
          slug: 'regtree',
          title: 'Regression trees: a mean in every leaf',
          question: 'What should a leaf predict when the target is a number?',
          page: RegTree,
          checks: [
            'Derive that the mean minimises squared error in a leaf, by calculus and by the decomposition identity.',
            'Explain why absolute error would lead to the median instead.',
            'Describe a regression tree as a piecewise-constant function and explain why it cannot extrapolate a trend.',
            'Distinguish a leaf’s residual MSE (denominator m) from the sample variance (m − 1).',
          ],
        },
        {
          slug: 'regsplit',
          title: 'Choosing regression splits',
          question: 'How do we score a split when the leaves predict means?',
          page: RegSplit,
          checks: [
            'Compute the weighted MSE of a candidate split and choose the best threshold.',
            'Explain why weighted MSE, total child SSE and MSE reduction rank splits identically at one node.',
            'Reproduce the organ example: Model at the root, Leslie below A100 and T202.',
            'Explain how an empty category is handled at prediction time.',
          ],
        },
        {
          slug: 'modeltree',
          title: 'Model trees: a line in every leaf',
          question: 'What do we gain by fitting a local linear model in each leaf?',
          page: ModelTree,
          checks: [
            'Explain how a model tree differs from a regression tree, and when it helps.',
            'Explain why the best single line for cos(πx) on [−1, 1] is flat.',
            'Compute a standard deviation reduction and explain why it can disagree with the error of linear leaves.',
            'Choose an encoding for a categorical predictor inside a local linear model.',
          ],
        },
        {
          slug: 'kernel',
          title: 'Kernel smoothing: a moving local average',
          question: 'How does a neighbourhood that follows the query differ from a fixed leaf?',
          page: Kernel,
          checks: [
            'Write the kernel smoother as a normalised weighted average and explain every symbol.',
            'Explain each element of the two-panel smoothing figure: blue, black, red, yellow, the red line and point, green.',
            'Compute boxcar and Epanechnikov predictions by hand, keeping the bandwidth convention straight.',
            'Explain why the method is linear in Y and how the bandwidth trades bias against variance.',
          ],
        },
      ],
    },
  ],
  practice,
  reference: Reference,
  readiness: {
    items: [
      'Explain a tree as a partition, a prediction procedure and a set of logical rules.',
      'Compute entropy, information gain, split entropy and gain ratio, and justify the size weights.',
      'Grow PlayTennis by hand, with local counts at every node.',
      'Explain why representational completeness implies neither complete search nor zero error on contradictory inputs.',
      'Explain why XOR has zero gain at the root but a perfect split one level down.',
      'Explain why a larger tree can fit the training data better and generalise worse, and how pruning responds.',
      'Apply the one-SE rule using the SE of the minimum-error candidate.',
      'Derive the mean as a regression leaf’s prediction and choose a regression split by weighted MSE.',
      'Distinguish a regression tree’s constant leaves from a model tree’s local lines.',
      'Explain a kernel smoother: its weights, its bandwidth convention, why it is linear in Y.',
    ],
    note: 'Closed-book check. If a calculation fails, check the counts first: children must add up to the parent, every proportion uses its own node’s total, and every weight is a branch size divided by the parent size.',
  },
});
