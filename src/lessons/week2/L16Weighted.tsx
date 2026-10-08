import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { KRegionsLab } from '../../interactives/week2/KRegionsLab';
import { CHECKS2 } from './checks';

export default function L16Weighted() {
  return (
    <>
      <Sec title="k controls how local the rule is">
        <p>k connects directly to the bias–variance trade-off from Week 1:</p>
        <ul>
          <li>
            <strong>1-NN</strong> perfectly separates the training data (each point retrieves itself): low bias, high variance. A single mislabelled point
            carves out its own island.
          </li>
          <li>
            Increasing <M t="k" /> averages over more labels: higher bias, lower variance. The boundary smooths out — and may wash out genuine detail.
          </li>
          <li>
            At <M t="k = m" />, unweighted k-NN predicts the training-majority class for every query (subject to ties). The neighbourhood is no longer local.
          </li>
        </ul>
        <p>
          This is also the first remedy for noisy instances: a larger <M t="k" /> lets a few wrong labels be outvoted. But how to find the right{' '}
          <M t="k" />? Not by training accuracy — use validation or cross-validation (lessons 6 and 17). The trend is a guide, not a theorem: error need
          not change monotonically with k on every dataset.
        </p>
        <Lab
          title="Decision regions as k grows"
          purpose="50 points whose labels follow a wavy boundary, with 9 of them flipped. Slide k from 1 to m and compare training and leave-one-out error."
        >
          <KRegionsLab />
        </Lab>
        <TryThis
          items={[
            'k = 1: training error is 0, yet the regions are full of islands around flipped labels. LOOCV error tells the honest story.',
            'Increase k until the islands disappear. Show the true boundary: where does k-NN follow it, and where does it cut corners?',
            'Slide to k = m without weighting: the whole plane takes the majority class.',
            'Now turn weighting on at k = m: the regions come back. Every point votes, but near ones dominate.',
          ]}
        />
      </Sec>

      <Sec title="Distance-weighted k-NN">
        <p>
          Why should the k-th neighbour count as much as the first? A common answer weights each neighbour by its inverse squared distance and replaces the vote by
        </p>
        <MB t="\hat y_q = \argmax_{v\in V}\sum_{j\in N_k(\bx_q)} w_j\,\Ind[y_j = v], \qquad w_j = \frac{1}{d(\bx_q, \bx_j)^2}." />
        <p>These weights depend on the query — they are not the fixed coefficients of a linear classifier.</p>
        <Callout kind="example" title="The lesson 14 trace, weighted">
          Query 2.8; the three nearest are at distances 0.8 (class 1), 1.2 (class 0), 1.8 (class 0). Weights:
          <Table
            head={['neighbour', 'distance', 'weight 1/d²', 'class']}
            rows={[
              ['x = 2', '0.8', '1.5625', '1'],
              ['x = 4', '1.2', '0.6944', '0'],
              ['x = 1', '1.8', '0.3086', '0'],
            ]}
          />
          Class 1 gets 1.5625, class 0 gets 1.0031: weighted 3-NN predicts 1, whereas the unweighted 3-NN vote predicted 0.
        </Callout>
        <p>For a real-valued target, use a weighted average; the denominator normalises the weights:</p>
        <MB t="\hat f(\bx_q) = \frac{\sum_{j\in N_k(\bx_q)} w_j\,f(\bx_j)}{\sum_{j\in N_k(\bx_q)} w_j}." />
        <p>
          With weights, nothing stops us using <em>all</em> training examples. Using every example (<M t="k = m" />) with this rule is{' '}
          <strong>Shepard’s method</strong>. Unlike the unweighted <M t="k = m" /> case, the prediction still varies with the query.
        </p>
      </Sec>

      <Sec title="Two arithmetic traps">
        <ul>
          <li>
            <strong>Zero distance.</strong> If the query coincides with a training point, <M t="1/0^2" /> is undefined. State an exact-match rule, e.g.
            decide among the zero-distance points first (they may still disagree, which needs a tie rule).
          </li>
          <li>
            <strong>Already-squared distances.</strong> If you skipped the square root and stored <M t="s_j = d_j^2" />, the inverse-square weight is{' '}
            <M t="1/s_j" />, not <M t="1/s_j^2" /> — that would silently become inverse-fourth-power weighting.
          </li>
        </ul>
        <Callout kind="warning">
          Distance weighting does not cure label noise: a single very close mislabelled point receives an enormous weight. Evaluate the complete rule
          rather than trusting its intuitive appeal.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l16.q1"
          q={<p>Three nearest neighbours at distances 0.4 (class 1), 0.8 (class 0) and 1 (class 0). What does the 1/d²-weighted vote predict?</p>}
          options={[
            { text: 'class 1: weight 6.25 vs 2.5625', correct: true, why: '1/0.16 = 6.25; 1/0.64 + 1/1 = 1.5625 + 1 = 2.5625.' },
            { text: 'class 0: two votes to one', why: 'That is the unweighted vote.' },
            { text: 'class 1: weight 2.5 vs 2.25', why: 'Those are 1/d weights; this rule uses 1/d².' },
          ]}
        />
        <Quiz
          id="w2.l16.q2"
          q={<p>What does unweighted k-NN predict when k = m?</p>}
          options={[
            { text: 'The training-majority class, for every query.', correct: true, why: 'Every query’s neighbourhood is the whole training set.' },
            { text: 'The label of the nearest point.', why: 'That is k = 1.' },
            { text: 'It depends on the query.', why: 'Only if the votes are weighted by distance.' },
          ]}
        />
        <Quiz
          id="w2.l16.q3"
          q={<p>You stored squared Euclidean distances sⱼ to save time. What is the correct inverse-square weight?</p>}
          options={[
            { text: '1/sⱼ', correct: true, why: 'sⱼ already equals dⱼ².' },
            { text: '1/sⱼ²', why: 'That is 1/dⱼ⁴ — a different weighting rule.' },
            { text: '1/√sⱼ', why: 'That is 1/dⱼ.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Small <M t="k" /> follows individual (possibly noisy) labels — low bias, high variance; large <M t="k" /> smooths, and at <M t="k = m" /> the
        unweighted rule predicts the majority everywhere. Distance weighting <M t="w_j = 1/d^2" /> lets nearer neighbours count more (Shepard’s method uses
        all <M t="m" />). Choose <M t="k" /> by validation, and handle zero distances explicitly.
      </Callout>

      <Checklist id="w2-weighted" items={CHECKS2['w2-weighted']} />
    </>
  );
}
