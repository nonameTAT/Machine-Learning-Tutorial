import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { MinkowskiLab } from '../../interactives/week2/MinkowskiLab';
import { CHECKS2 } from './checks';

export default function L11Distance() {
  return (
    <>
      <Sec title="“Nearest” needs a definition">
        <p>
          Nearest-neighbour methods predict whatever the output of the closest stored data point is. Before “closest” means anything we must
          decide how to measure distance between feature vectors — and different rules can pick different neighbours, and so different labels. The
          distance is not a technicality; it is part of the model.
        </p>
      </Sec>

      <Sec title="The Minkowski family">
        <p>For <M t="\bx, \bz \in \R^d" /> and an order <M t="p > 0" />, the Minkowski distance is</p>
        <MB t="d_p(\bx, \bz) = \Big(\sum_{r=1}^d |x_r - z_r|^p\Big)^{1/p} = \|\bx - \bz\|_p," />
        <p>
          where <M t="\|\cdot\|_p" /> is the <M t="p" />-norm (<M t="L_p" /> norm). Three members matter most:
        </p>
        <Table
          head={['Choice', 'Formula', 'Intuition']}
          rows={[
            [<>p = 1: Manhattan (city block)</>, <M t="\sum_r |x_r - z_r|" />, 'walk along the grid: add the coordinate differences'],
            [<>p = 2: Euclidean</>, <M t="\sqrt{\sum_r (x_r - z_r)^2} = \sqrt{(\bx - \bz)\T(\bx - \bz)}" />, 'straight-line distance'],
            [<>p → ∞: Chebyshev</>, <M t="\max_r |x_r - z_r|" />, 'only the largest coordinate difference counts'],
          ]}
        />
        <Callout kind="example" title="Same pair, different distances">
          <M t="\bx = (1, 2, 3)" />, <M t="\bz = (4, 6, 3)" />: absolute differences <M t="(3, 4, 0)" />. So <M t="d_1 = 7" />,{' '}
          <M t="d_2 = \sqrt{9 + 16} = 5" />, <M t="d_\infty = 4" />. These are different <em>measurements</em> of the same pair, not competing answers
          to one formula.
        </Callout>
        <Steps
          intro={<p>Why does p → ∞ give the maximum? Factor out the largest difference.</p>}
          steps={[
            {
              title: 'Pull out the largest term',
              body: (
                <>
                  <p>
                    Let <M t="a_r = |x_r - z_r|" /> and <M t="A = \max_r a_r > 0" />. Then
                  </p>
                  <MB t="d_p = \Big(\sum_r a_r^p\Big)^{1/p} = A\Big(\sum_r (a_r/A)^p\Big)^{1/p}." />
                </>
              ),
            },
            {
              title: 'Squeeze',
              body: (
                <>
                  <p>
                    Each ratio <M t="a_r/A \le 1" /> and at least one equals 1, so the inner sum lies between 1 and <M t="d" />:
                  </p>
                  <MB t="A \le d_p \le A\,d^{1/p}." />
                </>
              ),
            },
            {
              title: 'Take the limit',
              body: (
                <p>
                  <M t="d^{1/p} \to 1" /> as <M t="p \to \infty" />, so <M t="d_p \to A = \max_r |x_r - z_r|" />. As p grows, the largest coordinate
                  difference dominates.
                </p>
              ),
            },
          ]}
        />
      </Sec>

      <Sec title="Counting mismatches: the so-called L₀">
        <p>
          There is also the so-called “0-norm”, which counts non-zero entries. Applied to a difference vector it counts the positions where two vectors
          differ:
        </p>
        <MB t="d_0(\bx, \bz) = \sum_{r=1}^d \Ind[x_r \ne z_r]." />
        <p>
          For the example above, <M t="d_0 = 2" />. This is not a Minkowski distance — you cannot get it by putting p = 0 into the formula (the exponent
          1/p blows up). The indicator form avoids the ambiguous <M t="0^0" />. It is the natural distance for vectors of categories, and it is the
          simple-matching distance from lesson 7 summed over features.
        </p>
      </Sec>

      <Sec title="Unit circles show the preference">
        <p>
          Draw every point at distance 1 from the origin: a diamond for p = 1, a circle for p = 2, a square for p = ∞. For <M t="p < 1" /> the
          shape caves inwards — a warning sign we will make precise in lesson 12. Two observations:
        </p>
        <ul>
          <li>
            On the coordinate axes all the shapes touch: if only one coordinate differs, every <M t="d_p" /> equals <M t="|x_r - z_r|" />.
          </li>
          <li>
            Only the circle is unchanged by rotating the axes. Among these unweighted Minkowski distances, Euclidean is the only rotation-invariant one;
            calling it the “only choice” is true only within this family.
          </li>
        </ul>
        <Lab title="Which candidate is nearest?" purpose="The shaded p-ball grows from the query until it touches the nearest candidate. Change p and watch the winner change.">
          <MinkowskiLab />
        </Lab>
        <TryThis
          items={[
            'With the starting positions, A is nearest for p = 1 but B is nearest for p = 2 and p = ∞. A is far along one axis; B spreads its displacement over both.',
            'Small p rewards concentrating the difference in few coordinates; large p rewards spreading it. Predict the winner at p = ½ before moving the slider.',
            'Drag a candidate onto the horizontal line through the query (same x₂). The mismatch count drops to 1, and every d_p agrees.',
          ]}
        />
      </Sec>

      <Sec title="Squared Euclidean: same ranking">
        <p>
          The square root is increasing, so <M t="d_2(\bx, \bz_1) < d_2(\bx, \bz_2) \iff d_2^2(\bx, \bz_1) < d_2^2(\bx, \bz_2)" />. To <em>rank</em>{' '}
          neighbours you can skip the square root and save computation. But the squared value is a different number: if a later formula uses the distance
          itself (distance weighting, lesson 16), you must use the right one.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l11.q1"
          q={<p>For x = (2, 0, 5) and z = (5, 4, 5), what are d₁, d₂, d∞ and the mismatch count?</p>}
          options={[
            { text: '7, 5, 4, 2', correct: true, why: 'Differences (3, 4, 0): sum 7, √25 = 5, max 4, two non-zero.' },
            { text: '7, 25, 4, 2', why: '25 is the squared Euclidean distance.' },
            { text: '7, 5, 4, 3', why: 'The third coordinates are equal, so only two positions differ.' },
          ]}
        />
        <Quiz
          id="w2.l11.q2"
          q={<p>Two points differ only in their first coordinate, by 3. What is d_p for any p &gt; 0?</p>}
          options={[
            { text: '3', correct: true, why: '(3^p)^(1/p) = 3: on the axes all Minkowski distances agree.' },
            { text: '3^p', why: 'The outer power 1/p undoes it.' },
            { text: 'It depends on p.', why: 'Only when two or more coordinates differ.' },
          ]}
        />
        <Quiz
          id="w2.l11.q3"
          q={<p>Which distance is guaranteed to pick the same nearest neighbour as squared Euclidean distance?</p>}
          options={[
            { text: 'Manhattan', why: 'Manhattan can rank differently (see the lab).' },
            { text: 'Euclidean', correct: true, why: 'Square root is increasing, so the ordering is identical.' },
            { text: 'Chebyshev', why: 'It ignores all but the largest coordinate difference.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        The Minkowski distance <M t="d_p = (\sum_r |x_r - z_r|^p)^{1/p}" /> gives Manhattan (p = 1), Euclidean (p = 2) and Chebyshev (p → ∞, the
        largest coordinate difference); the mismatch count <M t="\sum_r\Ind[x_r \ne z_r]" /> is a separate idea. Different p can choose different nearest
        neighbours, so the distance is a modelling decision.
      </Callout>

      <Checklist id="w2-distance" items={CHECKS2['w2-distance']} />
    </>
  );
}
