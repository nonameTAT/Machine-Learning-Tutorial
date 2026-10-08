import { ReadinessReport } from '../../components/ReadinessReport';
import { CHECKS2 } from './checks';
import { ALL_PROBLEMS_W2 } from './Practice2';

const QUIZ_PREFIX: Record<string, string> = {
  'w2-classifier': 'w2.l1.',
  'w2-centroid': 'w2.l2.',
  'w2-sigmoid': 'w2.l3.',
  'w2-logloss': 'w2.l4.',
  'w2-logfit': 'w2.l5.',
  'w2-cv': 'w2.l6.',
  'w2-datatypes': 'w2.l7.',
  'w2-metrics': 'w2.l8.',
  'w2-roc': 'w2.l9.',
  'w2-missing': 'w2.l10.',
  'w2-distance': 'w2.l11.',
  'w2-metric': 'w2.l12.',
  'w2-exemplar': 'w2.l13.',
  'w2-knn': 'w2.l14.',
  'w2-scaling': 'w2.l15.',
  'w2-weighted': 'w2.l16.',
  'w2-lazyeval': 'w2.l17.',
  'w2-curse': 'w2.l18.',
};

export default function Readiness2() {
  return (
    <ReadinessReport
      week={2}
      checks={CHECKS2}
      quizPrefix={QUIZ_PREFIX}
      problems={ALL_PROBLEMS_W2}
      practiceKey="w2.practice"
      practiceRoute="w2-practice"
      weekCheckId="w2.week"
      weekItems={[
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
      ]}
      weekNote={
        <p className="small muted">
          Revisit by symptom: wrong scores or derivatives → lessons 2–5; confused metrics or leakage → 6 and 8–10; wrong neighbours or
          votes → 11–12 and 14–17; misleading performance claims → 13 and 18.
        </p>
      }
    />
  );
}
