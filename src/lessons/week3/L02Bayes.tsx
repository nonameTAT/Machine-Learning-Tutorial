import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { FishBayesLab } from '../../interactives/week3/FishBayesLab';
import { CHECKS3 } from './checks';

export default function L02Bayes() {
  return (
    <>
      <Sec title="Deciding from the prior alone">
        <p>
          Back to the fish. From past catches, 30% are salmon and 70% sea bass. With no measurement at all, the best guess is always “sea bass”.
          This <em>decision rule based on the prior</em> is right 70% of the time — and never predicts salmon. Measurements should let us do better.
        </p>
        <p>Suppose we also know how lengths are distributed <em>within</em> each species — the class-conditional probabilities:</p>
        <Table
          head={['P(x | c)', 'salmon', 'sea bass']}
          rows={[
            ['length > 100 cm', '0.5', '0.3'],
            ['50 cm < length < 100 cm', '0.4', '0.5'],
            ['length < 50 cm', '0.1', '0.2'],
          ]}
        />
        <p>
          Each column sums to 1: it is a distribution over lengths <em>for one class</em>. What we want is the reverse, <M t="P(c \mid x)" />: given this
          length, which species?
        </p>
      </Sec>

      <Sec title="Bayes’ theorem">
        <Steps
          intro={<p>Bayes’ theorem is not a new axiom — it falls out of describing one joint event in two orders.</p>}
          steps={[
            {
              title: 'Conditioning restricts attention',
              body: <MB t="P(A \mid B) = \frac{P(A \wedge B)}{P(B)}, \qquad P(B) > 0 \quad\text{}." />,
            },
            {
              title: 'The product rule, both ways round',
              body: <MB t="P(A \wedge B) = P(A \mid B)P(B) = P(B \mid A)P(A)." />,
            },
            {
              title: 'Equate and divide',
              body: <MB t="\boxed{\;P(c \mid x) = \frac{P(x \mid c)\,P(c)}{P(x)}\;}" />,
            },
            {
              title: 'Total probability gives the denominator',
              body: (
                <>
                  <MB t="P(x) = \sum_{c'} P(x \mid c')\,P(c')" />
                  <p>
                    valid because the classes are mutually exclusive and exhaustive. It is exactly what makes the posteriors sum to 1.
                  </p>
                </>
              ),
            },
          ]}
        />
        <Table
          head={['Quantity', 'Name', 'Question it answers']}
          rows={[
            [<M t="P(c)" />, 'prior', 'how common is the class before seeing x?'],
            [<M t="P(x \mid c)" />, 'likelihood (class-conditional)', 'if the class were c, how plausible is x?'],
            [<M t="P(x)" />, 'evidence (marginal)', 'how plausible is x across all classes?'],
            [<M t="P(c \mid x)" />, 'posterior', 'after seeing x, how plausible is c?'],
          ]}
        />
        <p>
          The same formula is often written with a hypothesis <M t="h" /> and training data <M t="D" /> in place of a class and an observation:{' '}
          <M t="P(h \mid D) = P(D \mid h)P(h)/P(D)" /> — lesson 3 uses that form.
        </p>
        <Callout kind="warning">
          <M t="P(x \mid c)" /> and <M t="P(c \mid x)" /> answer different questions; never swap them by intuition. And the sum rule is{' '}
          <M t="P(A \vee B) = P(A) + P(B) - P(A \wedge B)" /> — plain addition only works for disjoint events.
        </Callout>
      </Sec>

      <Sec title="Worked example: a 70 cm fish">
        <Callout kind="example">
          70 cm falls in the 50–100 cm bin. Multiply likelihood by prior:
          <Table
            head={['class', 'prior', 'likelihood', 'product', 'posterior']}
            rows={[
              ['salmon', '0.3', '0.4', '0.12', <M t="0.12/0.47 \approx 0.2553" />],
              ['sea bass', '0.7', '0.5', '0.35', <M t="0.35/0.47 \approx 0.7447" />],
            ]}
          />
          The evidence is <M t="0.12 + 0.35 = 0.47" />; predict sea bass. To <em>choose</em> a class you can compare 0.12 with 0.35 directly — dividing
          both by the same positive number cannot change their order. Note we are modelling a length <em>bin</em>, not one exact continuous length.
        </Callout>
        <Lab title="Bayes’ rule as areas" purpose="Pick a length bin and change the prior. The highlighted blocks are the two ways to observe that length.">
          <FishBayesLab />
        </Lab>
        <TryThis
          items={[
            'For “> 100 cm” with the default prior, salmon’s block (0.5 × 0.3 = 0.15) is smaller than sea bass’s (0.3 × 0.7 = 0.21): sea bass still wins, although long fish are more typical of salmon.',
            'Raise P(salmon) until a fish over 100 cm is classified as salmon. At what prior does it switch? (Solve 0.5π = 0.3(1 − π).)',
            'Choose “< 50 cm”: the likelihoods favour sea bass and so does the prior. Evidence and prior agree.',
          ]}
        />
        <Callout kind="note" title="Scores versus probabilities">
          <M t="s_c = P(x \mid c)P(c)" /> is an unnormalised score (for discrete <M t="x" /> it is the joint probability <M t="P(x, c)" />). The posterior
          is <M t="s_c / \sum_{c'} s_{c'}" />. Drop the denominator for an argmax, never when a probability is asked for.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l2.q1"
          q={<p>With the priors (0.3, 0.7), what is P(salmon | length &gt; 100 cm)?</p>}
          options={[
            { text: '0.5', why: 'That is P(length > 100 | salmon), the likelihood.' },
            { text: '0.15/0.36 ≈ 0.417', correct: true, why: 'Scores 0.5 × 0.3 = 0.15 and 0.3 × 0.7 = 0.21; evidence 0.36.' },
            { text: '0.15', why: '0.15 is the unnormalised score; divide by the evidence.' },
          ]}
        />
        <Quiz
          id="w3.l2.q2"
          q={<p>Why is it safe to ignore P(x) when choosing the most probable class?</p>}
          options={[
            { text: 'Because P(x) = 1.', why: 'P(x) is usually far below 1.' },
            { text: 'Because it is the same positive number for every class at this x, so it cannot change the order.', correct: true, why: 'It matters only when you report probabilities.' },
            { text: 'Because the classes are independent.', why: 'Independence plays no role here.' },
          ]}
        />
        <Quiz
          id="w3.l2.q3"
          q={<p>P(A) = 0.5, P(B) = 0.4, P(A ∧ B) = 0.2. What is P(A ∨ B)?</p>}
          options={[
            { text: '0.9', why: 'Plain addition double-counts the overlap.' },
            { text: '0.7', correct: true, why: 'Sum rule: 0.5 + 0.4 − 0.2.' },
            { text: '0.2', why: 'That is the intersection.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Bayes’ theorem <M t="P(c \mid x) = P(x \mid c)P(c)/\sum_{c'}P(x \mid c')P(c')" /> reverses a conditional: it combines how plausible the
        observation is under each class with how common each class is. The evidence normalises; for a decision, compare the scores{' '}
        <M t="P(x \mid c)P(c)" />.
      </Callout>

      <Checklist id="w3-bayes" items={CHECKS3['w3-bayes']} />
    </>
  );
}
