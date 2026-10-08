import { ReadinessReport } from '../components/ReadinessReport';
import { CHECKS } from './checks';
import { ALL_PROBLEMS } from './Practice';

const QUIZ_PREFIX: Record<string, string> = {
  learning: 'l1.',
  loss: 'l2.',
  stats: 'l3.',
  ols1d: 'l4.',
  matrix: 'l5.',
  gd: 'l6.',
  mle: 'l7.',
  assumptions: 'l8.',
  features: 'l9.',
  regularisation: 'l10.',
  evaluation: 'l11.',
  knn: 'l12.',
  biasvar: 'l13.',
};

export default function Readiness() {
  return (
    <ReadinessReport
      week={1}
      checks={CHECKS}
      quizPrefix={QUIZ_PREFIX}
      problems={ALL_PROBLEMS}
      practiceKey="practice"
      practiceRoute="practice"
      weekCheckId="week"
      weekItems={[
        'Start from an objective and derive both the scalar and matrix least-squares solutions.',
        'Explain why the solution is a minimum, and distinguish existence, uniqueness and generalisation.',
        'Trace one batch and one SGD update, with consistent old parameters and the correct loss scaling.',
        'Derive OLS from a Gaussian likelihood and identify every assumption used.',
        'Build polynomial and interaction features and explain “linear in the parameters”.',
        'Derive ridge under a stated intercept and SSE/MSE convention; explain why LASSO favours sparsity.',
        'Choose model settings using validation data and interpret RMSE, MAE, R² and adjusted R².',
        'Compute k-NN and local-linear predictions, and explain the role of scale and neighbourhood size.',
        'Derive and interpret the bias–variance decomposition at a fixed query input.',
      ]}
      weekNote={
        <p className="small muted">
          If you can calculate but not explain the conditions, revisit the derivations. If you can explain but not reproduce the calculation, practise the
          numerical problems. Both are needed.
        </p>
      }
    />
  );
}
