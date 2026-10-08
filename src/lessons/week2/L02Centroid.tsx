import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, TryThis } from '../../components/ui';
import { CentroidLab } from '../../interactives/week2/CentroidLab';
import { CHECKS2 } from './checks';

export default function L02Centroid() {
  return (
    <>
      <Sec title="A line splits the plane into two sides">
        <p>
          The simplest discriminative idea: draw a line between the two clouds of fish and classify by which side a new fish falls on. The line{' '}
          <M t="ax_1 + bx_2 + c = 0" /> can be oriented so that <M t="ax_1 + bx_2 + c > 0" /> above it and <M t="< 0" /> below it. Collect the
          coefficients into a <strong>weight vector</strong> <M t="\bw = (a, b)\T" /> and write <M t="t = -c" />:
        </p>
        <MB t="\text{boundary: } \bx\T\bw = t, \qquad \hat y = \begin{cases} 1 & \bx\T\bw > t \\ 0 & \bx\T\bw < t. \end{cases}" />
        <p>
          The quantity <M t="\bx\T\bw" /> is a <em>score</em> and <M t="t" /> is the <strong>decision threshold</strong>. Points exactly on the boundary
          need a stated tie rule (this site sends ties to the positive class). In <M t="d" /> dimensions the same equation describes a hyperplane, as long
          as <M t="\bw \neq \mathbf{0}" />.
        </p>
        <Callout kind="theorem" title="Why w is perpendicular to the boundary">
          Take any two points on the boundary: <M t="\bx_a\T\bw = t" /> and <M t="\bx_b\T\bw = t" />. Subtracting, <M t="(\bx_a - \bx_b)\T\bw = 0" />. Every
          direction <em>along</em> the boundary is orthogonal to <M t="\bw" />. Moving in the direction of <M t="\bw" /> increases the score, so{' '}
          <M t="\bw" /> points towards the positive side.
        </Callout>
      </Sec>

      <Sec title="The basic linear classifier">
        <p>
          Which line? The <strong>basic linear classifier</strong> makes the most naive choice that still uses the data: compute the
          centre of mass of each class — <M t="\bp" /> for the positives and <M t="\bn" /> for the negatives — and cut the segment between them in half
          with a perpendicular line.
        </p>
        <Steps
          intro={<p>Two facts pin the line down: it is perpendicular to the segment from n to p, and it passes through the midpoint.</p>}
          steps={[
            {
              title: 'Perpendicular to p − n',
              body: (
                <p>
                  The normal vector of the boundary is <M t="\bw" />, so take <M t="\bw = \bp - \bn" />. It points from the negative mean to the positive
                  mean, i.e. towards the positive side, as required.
                </p>
              ),
            },
            {
              title: 'The midpoint lies on the boundary',
              body: <MB t="\ba = \frac{\bp + \bn}{2}, \qquad t = \ba\T\bw = \frac{(\bp + \bn)\T(\bp - \bn)}{2}." />,
            },
            {
              title: 'Expand — the cross terms cancel',
              body: (
                <>
                  <MB t="(\bp + \bn)\T(\bp - \bn) = \bp\T\bp - \bp\T\bn + \bn\T\bp - \bn\T\bn = \|\bp\|^2 - \|\bn\|^2," />
                  <p>
                    because <M t="\bp\T\bn = \bn\T\bp" />. Hence
                  </p>
                  <MB t="\boxed{\;\bw = \bp - \bn, \qquad t = \frac{\|\bp\|^2 - \|\bn\|^2}{2}\;}" />
                </>
              ),
            },
          ]}
        />
        <Callout kind="note">
          “Training” is just computing two means. The construction does <em>not</em> search for the best separating line: it ignores the spread and
          shape of each class, and can misclassify training points even when a perfect separator exists.
        </Callout>
      </Sec>

      <Sec title="The same classifier, seen as nearest centroid">
        <p>
          Lesson 13 rediscovers this classifier from a distance-based angle: classify a query as positive if it is closer to <M t="\bp" /> than to{' '}
          <M t="\bn" />. Under Euclidean distance these are <em>the same rule</em>.
        </p>
        <Steps
          steps={[
            {
              title: 'Compare squared distances',
              body: (
                <>
                  <p>Distances are non-negative, so squaring preserves the comparison:</p>
                  <MB t="\|\bx - \bp\|^2 < \|\bx - \bn\|^2." />
                </>
              ),
            },
            {
              title: 'Expand both sides',
              body: <MB t="\bx\T\bx - 2\bx\T\bp + \|\bp\|^2 < \bx\T\bx - 2\bx\T\bn + \|\bn\|^2." />,
            },
            {
              title: 'Cancel xᵀx and rearrange',
              body: (
                <>
                  <MB t="2\bx\T(\bp - \bn) > \|\bp\|^2 - \|\bn\|^2 \iff \bx\T\bw > t." />
                  <p>
                    The quadratic terms cancel, which is why the boundary is linear. Exactly the basic linear classifier: the boundary is the set of points
                    equidistant from the two means.
                  </p>
                </>
              ),
            },
          ]}
        />
        <Callout kind="example" title="Worked example">
          Positives <M t="(3,3), (5,3)" /> give <M t="\bp = (4, 3)" />; negatives <M t="(1,0), (1,2)" /> give <M t="\bn = (1, 1)" />. Then{' '}
          <M t="\bw = (3, 2)" /> and <M t="t = (25 - 2)/2 = 11.5" />, so the boundary is <M t="3x_1 + 2x_2 = 11.5" />. The query <M t="(2, 3)" /> scores{' '}
          <M t="6 + 6 = 12 > 11.5" />: positive. Check: its squared distances are <M t="4 + 0 = 4" /> to <M t="\bp" /> and <M t="1 + 4 = 5" /> to{' '}
          <M t="\bn" />. The midpoint <M t="(2.5, 2)" /> scores exactly 11.5.
        </Callout>
        <Lab
          title="Means, midpoint and boundary"
          purpose="Drag any training point and watch both means, w, t and the boundary update. Click anywhere to move the query; compare its score with its distances to the two means."
        >
          <CentroidLab />
        </Lab>
        <TryThis
          items={[
            'Worked example: put the query on the midpoint (2.5, 2). The score equals t and the two squared distances are equal.',
            'Drag one positive point far away to the right. The positive mean follows, the boundary rotates and shifts — every training point influences the rule through the mean.',
            'Switch to “Two-clump class”. The negative class sits on both sides, so its mean lands in the middle near the positive mean: w is short and the rule gets only 6 of the 12 training points right.',
            'Drag points so the two means coincide. What happens to w, t and every prediction?',
          ]}
        />
      </Sec>

      <Sec title="When one mean per class is not enough">
        <ul>
          <li>
            <strong>Coinciding means.</strong> If <M t="\bp = \bn" />, then <M t="\bw = \mathbf{0}" /> and <M t="t = 0" />: every query ties. The classes
            may still be completely different — a ring around a disc, say — but a single mean cannot see it.
          </li>
          <li>
            <strong>Multimodal classes</strong>. A class made of several clumps is badly summarised by one point. One remedy is several
            exemplars per class (lesson 13).
          </li>
          <li>
            <strong>Outliers</strong> pull a mean, and therefore the whole boundary.
          </li>
        </ul>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l2.q1"
          q={<p>Centroids p = (3, 2) and n = (−1, 0). What are w and t, and how is (1, 2) classified?</p>}
          options={[
            { text: 'w = (4, 2), t = 6; score 8 > 6, positive', correct: true, why: 't = (‖p‖² − ‖n‖²)/2 = (13 − 1)/2 = 6; squared distances 4 (to p) and 8 (to n) agree.' },
            { text: 'w = (4, 2), t = 12; negative', why: '12 is ‖p‖² − ‖n‖² before halving.' },
            { text: 'w = (2, 1), t = 1; positive', why: '(2, 1) is the midpoint a, not w; t = aᵀw.' },
          ]}
        />
        <Quiz
          id="w2.l2.q2"
          q={<p>Why does the boundary turn out linear, even though it is defined by comparing two squared distances?</p>}
          options={[
            { text: 'Because squared distances are linear in x.', why: 'They are quadratic: ‖x − p‖² contains xᵀx.' },
            { text: 'Because the quadratic term xᵀx appears on both sides and cancels.', correct: true, why: 'What is left, 2xᵀ(p − n) vs ‖p‖² − ‖n‖², is linear in x.' },
            { text: 'Because the means are linear functions of the data.', why: 'True, but irrelevant to the shape of the boundary in x.' },
          ]}
        />
        <Quiz
          id="w2.l2.q3"
          q={<p>“The basic linear classifier finds the line that best separates the training data.” Evaluate.</p>}
          options={[
            { text: 'True: that is its definition.', why: 'It never searches over lines; it computes two means and bisects them.' },
            { text: 'False: it bisects the segment between the class means, which may misclassify training points even when a perfect separator exists.', correct: true, why: 'It ignores spread, shape and individual points beyond their contribution to the mean.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A linear classifier predicts by the sign of <M t="\bx\T\bw - t" />; <M t="\bw" /> is normal to the boundary and points to the positive side. The
        basic linear classifier takes <M t="\bw = \bp - \bn" /> and <M t="t = (\|\bp\|^2 - \|\bn\|^2)/2" />, which is exactly “nearest class mean” under
        Euclidean distance — simple and fast, but blind to anything a mean cannot capture.
      </Callout>

      <Checklist id="w2-centroid" items={CHECKS2['w2-centroid']} />
    </>
  );
}
