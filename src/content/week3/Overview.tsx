import { Sec, Table } from '../../components/ui';
import { StudyRoute } from '../../course/overview';

// Week 3 overview body; the shell adds the heading above and “Your data” below.
export default function Overview() {
  return (
    <>
      <Sec title="The thread of the week">
        <p>
          Week 2 separated classes with a boundary or with nearby examples. Week 3 asks a different question: <em>which class could plausibly have generated
          this observation, and how should uncertainty affect the decision?</em> Choose assumptions, estimate probabilities, update beliefs with evidence, then
          choose a prediction using the relevant loss. Naive Bayes makes this practical by simplifying how features interact.
        </p>
        <p>
          If time is short, the spine is lessons 2–5 (Bayes’ rule, odds, base rates, costs), 9–11 (Naive Bayes, PlayTennis, smoothing) and 13–15 (text
          models). Lessons 6–8 connect the framework to regression and to the limits of any classifier.
        </p>
      </Sec>

      <StudyRoute />

      <Sec title="What carries over">
        <Table
          head={['Earlier idea', 'Where it returns this week']}
          rows={[
            ['Week 1: least squares from Gaussian maximum likelihood', 'the same derivation as an instance of Bayesian learning (lesson 6)'],
            ['Week 1: bias–variance', 'inductive bias versus statistical bias (lesson 1)'],
            ['Week 2: generative vs discriminative, Bayes’ rule', 'developed fully: MAP, ML, odds (lessons 2–3)'],
            ['Week 2: confusion matrix, thresholds, costs of errors', 'minimum expected loss and the cost threshold (lesson 5)'],
            ['Week 2: missing values, feature types', 'missing features and categorical tables in Naive Bayes (lessons 10, 16)'],
          ]}
        />
      </Sec>

      <Sec title="Subtleties worth remembering">
        <ul>
          <li>
            <strong>Inductive vs statistical bias:</strong> stronger inductive assumptions do not necessarily create greater statistical bias; it depends on whether they match the
            problem (lesson 1).
          </li>
          <li>
            <strong>PlayTennis:</strong> the “no” PlayTennis product needs 4/5 and 3/5, not denominators of 9 (lesson 10).
          </li>
          <li>
            <strong>Gaussian Naive Bayes:</strong> distinguish variance from standard deviation; the Gaussian prefactor is 1/(√(2π)σ) (lesson 12).
          </li>
          <li>
            <strong>Missing features:</strong> marginalising a missing feature in a general posterior table needs weights conditional on the observed features
            (lesson 16).
          </li>
          <li>
            <strong>Odds:</strong> likelihood ratios and posterior odds differ by the prior odds; comparing each with 1 is a different rule unless the
            priors are equal (lessons 3, 17).
          </li>
          <li>
            <strong>Zero counts:</strong> a zero factor eliminates one class score, not necessarily every prediction (lesson 11).
          </li>
        </ul>
      </Sec>
    </>
  );
}
