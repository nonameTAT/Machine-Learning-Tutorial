import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { TriangleLab } from '../../interactives/week2/TriangleLab';
import { CHECKS2 } from './checks';

export default function L12Metric() {
  return (
    <>
      <Sec title="Why ask for more than “a number that is small for similar things”?">
        <p>
          Any formula can produce numbers. A <strong>metric</strong> formalises the properties we silently assume when we say “distance”: no separation from
          yourself, symmetry, and no shortcuts. Algorithms that search for neighbours efficiently, and arguments about neighbourhoods, rely on these
          properties.
        </p>
        <p>
          Given an instance space <M t="\mathcal X" />, a <strong>distance metric</strong> is a function{' '}
          <M t="\mathrm{Dis}: \mathcal X \times \mathcal X \to [0, \infty)" /> such that for all <M t="x, y, z" />:
        </p>
        <Table
          head={['Property', 'Statement', 'Meaning']}
          rows={[
            ['1. Zero at the same point', <M t="\mathrm{Dis}(x, x) = 0" />, 'no separation from yourself'],
            ['2. Positive otherwise', <M t="x \ne y \Rightarrow \mathrm{Dis}(x, y) > 0" />, 'distinct points are distinguishable'],
            ['3. Symmetry', <M t="\mathrm{Dis}(x, y) = \mathrm{Dis}(y, x)" />, 'order does not matter'],
            ['4. Triangle inequality', <M t="\mathrm{Dis}(x, z) \le \mathrm{Dis}(x, y) + \mathrm{Dis}(y, z)" />, 'a detour cannot be shorter'],
          ]}
        />
        <p>
          If property 2 is weakened so that <M t="\mathrm{Dis}(x, y) = 0" /> is allowed for <M t="x \ne y" />, the function is a{' '}
          <strong>pseudometric</strong>.
        </p>
      </Sec>

      <Sec title="One counterexample disproves a property">
        <p>
          The triangle inequality fails for Minkowski distances with <M t="p < 1" />. To see it, you do not need a general proof —
          just three points:
        </p>
        <Callout kind="example" title="p = ½">
          <M t="a = (0, 0)" />, <M t="b = (1, 0)" />, <M t="c = (1, 1)" />. Directly,
          <MB t="d_{1/2}(a, c) = \big(\sqrt1 + \sqrt1\big)^2 = 4," />
          but each leg via <M t="b" /> differs in one coordinate only, so <M t="d_{1/2}(a, b) = d_{1/2}(b, c) = 1" />. Since <M t="4 > 1 + 1" />, the
          triangle inequality fails. The formula is symmetric and zero only at identical points — those properties alone do not make it a metric.
        </Callout>
        <Callout kind="example" title="Squared Euclidean distance is not a metric either">
          On the real line take 0, 1, 2. The direct squared distance is <M t="4" />; the two legs total <M t="1 + 1 = 2" />. Violated. Yet squared
          Euclidean distance orders neighbours exactly as Euclidean distance does (lesson 11) — a function can be useful for ranking without being a
          metric.
        </Callout>
        <Lab title="Test the triangle inequality" purpose="Drag the three points, change p, or switch to squared Euclidean distance. Green = holds for these points; red = a counterexample.">
          <TriangleLab />
        </Lab>
        <TryThis
          items={[
            'Start from the p = ½ counterexample and slide p up. At which p does the inequality start to hold for these three points?',
            'At p = 1, 2 or ∞, try hard to make it fail. You cannot: for p ≥ 1, d_p comes from a norm, and norms satisfy the triangle inequality.',
            'Squared Euclidean on a line: move b off the line. Does it still fail? Find where it starts to hold (hint: a right angle at b).',
          ]}
        />
      </Sec>

      <Sec title="Pseudometrics: deliberately ignoring a difference">
        <p>A pseudometric keeps symmetry and the triangle inequality but lets distinct points be at distance zero. For example,</p>
        <MB t="d(\bx, \bz) = |x_1 - z_1|" />
        <p>
          ignores the second coordinate: <M t="(1, 0)" /> and <M t="(1, 9)" /> are different points at distance 0. This is exactly what happens when a
          feature’s weight is set to zero in a weighted distance — setting <M t="z_j" /> to zero eliminates that dimension altogether. If all
          weights are positive, weighted Euclidean distance is a metric again.
        </p>
        <Callout kind="note" title="“Not a norm” is not “not a metric”">
          The mismatch count <M t="d_0" /> (lesson 11) is not a norm, but it <em>is</em> a metric on fixed-length vectors: for each coordinate, if{' '}
          <M t="x_r \ne z_r" />, then <M t="y_r" /> must differ from at least one of them, so every mismatch on the direct route is paid for on the
          detour.
        </Callout>
      </Sec>

      <Callout kind="note" title="How to answer a metric question">
        State the required property. To <strong>prove</strong> it, argue for arbitrary inputs — checking three convenient pairs is not a proof. To{' '}
        <strong>disprove</strong> it, give explicit points that violate it: one valid counterexample is enough.
      </Callout>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l12.q1"
          q={<p>d(x, z) = √((x₁ − z₁)² + 0·(x₂ − z₂)²) on ℝ². What is it?</p>}
          options={[
            { text: 'A metric', why: 'Distinct points (1, 0) and (1, 8) are at distance 0, violating property 2.' },
            { text: 'A pseudometric', correct: true, why: 'It equals |x₁ − z₁|: symmetric, triangle inequality holds, but zero for some distinct points.' },
            { text: 'Neither', why: 'Symmetry and the triangle inequality do hold.' },
          ]}
        />
        <Quiz
          id="w2.l12.q2"
          q={<p>You checked the triangle inequality for a new distance on 50 random triples and it always held. What can you conclude?</p>}
          options={[
            { text: 'It is a metric.', why: 'Examples cannot prove a property for all inputs; a counterexample may exist elsewhere.' },
            { text: 'Nothing conclusive — a proof for arbitrary points is needed (one counterexample would settle it the other way).', correct: true, why: 'Proving needs generality; disproving needs a single case.' },
          ]}
        />
        <Quiz
          id="w2.l12.q3"
          q={<p>For which Minkowski orders is d_p a metric?</p>}
          options={[
            { text: 'all p > 0', why: 'p = ½ fails the triangle inequality (4 > 1 + 1).' },
            { text: 'p ≥ 1 (including p = ∞)', correct: true, why: 'Then ‖·‖_p is a norm, and every norm satisfies the triangle inequality.' },
            { text: 'only p = 2', why: 'p = 1 and p = ∞ are metrics too; p = 2 is only special for rotation invariance.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A metric is zero only between identical points, symmetric, and obeys the triangle inequality. Minkowski <M t="d_p" /> is a metric for{' '}
        <M t="p \ge 1" /> but not for <M t="p < 1" />; squared Euclidean distance is not a metric (yet ranks neighbours correctly); allowing zero distance
        between distinct points gives a pseudometric, as when a feature’s weight is zero.
      </Callout>

      <Checklist id="w2-metric" items={CHECKS2['w2-metric']} />
    </>
  );
}
