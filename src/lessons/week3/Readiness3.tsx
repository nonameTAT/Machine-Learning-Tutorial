import { ReadinessReport } from '../../components/ReadinessReport';
import { CHECKS3 } from './checks';
import { ALL_PROBLEMS_W3 } from './Practice3';

const QUIZ_PREFIX: Record<string, string> = {
  'w3-bias': 'w3.l1.',
  'w3-bayes': 'w3.l2.',
  'w3-map': 'w3.l3.',
  'w3-baserate': 'w3.l4.',
  'w3-risk': 'w3.l5.',
  'w3-gaussnoise': 'w3.l6.',
  'w3-bayesopt': 'w3.l7.',
  'w3-bayeserror': 'w3.l8.',
  'w3-nb': 'w3.l9.',
  'w3-playtennis': 'w3.l10.',
  'w3-smoothing': 'w3.l11.',
  'w3-gnb': 'w3.l12.',
  'w3-text': 'w3.l13.',
  'w3-bernoulli': 'w3.l14.',
  'w3-multinomial': 'w3.l15.',
  'w3-missing': 'w3.l16.',
  'w3-limits': 'w3.l17.',
};

export default function Readiness3() {
  return (
    <ReadinessReport
      week={3}
      checks={CHECKS3}
      quizPrefix={QUIZ_PREFIX}
      problems={ALL_PROBLEMS_W3}
      practiceKey="w3.practice"
      practiceRoute="w3-practice"
      weekCheckId="w3.week"
      weekItems={[
        'Derive Bayes’ theorem from the product rule and explain every term.',
        'Compute ML, MAP and minimum-risk decisions for the same observation.',
        'Explain why squared error follows from the stated Gaussian-noise model.',
        'Distinguish one MAP hypothesis, a posterior-weighted prediction and Gibbs.',
        'Derive the Naive Bayes product and state its conditional independence assumption.',
        'Train and compare categorical, Bernoulli, multinomial and Gaussian models.',
        'Handle zero counts and missing information without changing their meanings.',
        'Explain why a correct class label does not imply a reliable probability.',
      ]}
      weekNote={
        <p className="small muted">
          Closed-book mastery check. If a calculation fails, check the denominator first: within-class counts, smoothing pseudo-counts, and
          the evidence used for normalisation.
        </p>
      }
    />
  );
}
