import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, TryThis } from '../../components/ui';
import { ScalingLab } from '../../interactives/week2/ScalingLab';
import { CHECKS2 } from './checks';

export default function L15Scaling() {
  return (
    <>
      <Sec title="Raw units can choose the neighbour for you">
        <p>
          Euclidean distance adds squared coordinate differences. If one feature ranges over <M t="[0, 100]" /> and another over <M t="[-1, 1]" />, the first dominates every distance — regardless of which one actually predicts the class. Change the units (metres to millimetres) and you
          change the classifier without changing a single observation. So attributes have to be normalised. Why, exactly?
        </p>
        <Callout kind="example" title="Worked example">
          Query <M t="(0, 0)" />; candidates <M t="A = (1, 80)" /> and <M t="B = (3, 10)" />. In raw units
          <MB t="d(A, q) = \sqrt{1 + 6400} \approx 80.006, \qquad d(B, q) = \sqrt{9 + 100} \approx 10.440," />
          so B is nearer. Suppose the training ranges of the two features are 10 and 1,000. Dividing each coordinate difference by its range,
          <MB t="d_{\text{scaled}}(A, q) = \sqrt{0.1^2 + 0.08^2} \approx 0.128, \qquad d_{\text{scaled}}(B, q) = \sqrt{0.3^2 + 0.01^2} \approx 0.300," />
          and now A is nearer. Scaling changed the neighbourhood — it is a modelling choice, not a way to print smaller numbers.
        </Callout>
      </Sec>

      <Sec title="Two common normalisations">
        <p>
          For feature <M t="r" />, let <M t="a_r" /> and <M t="b_r" /> be its minimum and maximum <em>on the training data</em>.{' '}
          <strong>Min-max normalisation</strong>:
        </p>
        <MB t="x'_r = \frac{x_r - a_r}{b_r - a_r}." />
        <p>
          Training values land in <M t="[0, 1]" />. A future value outside the training range maps below 0 or above 1 — not an error, and not a reason to
          refit the scaler on the test data.
        </p>
        <p>
          With training mean <M t="\mu_r" /> and standard deviation <M t="s_r" />, <strong>z-score normalisation</strong> expresses a value in units of the
          feature’s spread:
        </p>
        <MB t="x'_r = \frac{x_r - \mu_r}{s_r}." />
        <p>
          It does not make the feature normally distributed. For both, a constant training feature gives a zero denominator: it carries no information,
          so drop it (or state another policy).
        </p>
        <p>
          <strong>Nominal attributes</strong> with no ordering use simple matching instead: distance 1 if the categories differ, 0 if they match.
          Mixing feature types needs care: decide deliberately how much a category mismatch should count relative to a numeric difference.
        </p>
        <Callout kind="warning" title="Fit the scaler on training data only">
          <M t="a_r, b_r, \mu_r, s_r" /> are fitted quantities. Compute them on the training portion and apply the same numbers to validation and test
          inputs; inside cross-validation, recompute them in every fold (lesson 6).
        </Callout>
      </Sec>

      <Sec title="See the neighbourhood change shape">
        <Lab
          title="Same data, three scalings"
          purpose="The shaded shape contains every point as close to the query as its k-th neighbour, under the chosen scaling. Age decides the class; income is irrelevant."
        >
          <ScalingLab />
        </Lab>
        <TryThis
          items={[
            'Raw units: the neighbourhood is a thin horizontal band — neighbours are chosen by income alone, even though income has nothing to do with the class. Compare the LOOCV accuracies.',
            'Switch to min-max or z-score: the neighbourhood becomes round, both features count, and accuracy jumps.',
            'Even scaled, income still contributes noise to every distance. Scaling fixes units, not relevance (lessons 18 and 16’s weighting fix relevance).',
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l15.q1"
          q={<p>Training values of a feature range from 20 to 70. A test value is 80. What is its min-max normalised value, and is that a problem?</p>}
          options={[
            { text: '1.2 — fine: test values may fall outside [0, 1].', correct: true, why: '(80 − 20)/(70 − 20) = 1.2. Refitting the scaler on test data would leak information.' },
            { text: '1 — clip it, the formula only allows [0, 1].', why: 'Nothing in the formula restricts new inputs; clipping is an optional extra choice.' },
            { text: 'Refit min and max including the test value.', why: 'That lets the test set shape the procedure.' },
          ]}
        />
        <Quiz
          id="w2.l15.q2"
          q={<p>“After z-score normalisation every feature is equally relevant to the class.” Evaluate.</p>}
          options={[
            { text: 'True — they now have equal spread.', why: 'Equal spread means equal influence on the distance, which is bad for irrelevant features.' },
            { text: 'False: scaling addresses units and magnitudes, not predictive relevance.', correct: true, why: 'Feature selection or weighting addresses relevance.' },
          ]}
        />
        <Quiz
          id="w2.l15.q3"
          q={<p>Converting a feature from kilometres to metres changes the predictions of unscaled k-NN. Why?</p>}
          options={[
            { text: 'It multiplies that feature’s differences by 1000, increasing its weight in the Euclidean distance.', correct: true, why: 'So different points become nearest.' },
            { text: 'It does not — distances are unit-free.', why: 'Raw Euclidean distance mixes units.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Unscaled Euclidean distance lets large-unit features dominate, so the units choose the neighbours. Min-max <M t="(x - a)/(b - a)" /> and z-score{' '}
        <M t="(x - \mu)/s" /> normalisation, fitted on training data only, put features on comparable scales; nominal features use matching distance.
        Scaling fixes magnitude, not relevance.
      </Callout>

      <Checklist id="w2-scaling" items={CHECKS2['w2-scaling']} />
    </>
  );
}
