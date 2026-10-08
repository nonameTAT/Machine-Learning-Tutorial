import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { ROCLab } from '../../interactives/week2/ROCLab';
import { CHECKS2 } from './checks';

export default function L09ROC() {
  return (
    <>
      <Sec title="One scorer, many classifiers">
        <p>
          Logistic regression outputs a probability; turning it into a label needs a threshold τ (lesson 3). Every τ gives a different
          classifier and a different confusion matrix. For scores where larger means “more likely positive”, predict positive when the score is at least τ.
          Lowering τ can only add positive predictions, so on a fixed dataset:
        </p>
        <ul>
          <li>TP and FP can only increase (or stay); FN and TN can only decrease.</li>
          <li>Recall therefore never decreases. Precision may go up or down — it depends on which observations are added.</li>
        </ul>
        <p>Rather than pick one τ and report one matrix, we can look at the whole family at once.</p>
      </Sec>

      <Sec title="The ROC curve">
        <p>
          The <strong>receiver operating characteristic</strong> curve plots the true-positive rate against the false-positive rate as the
          threshold sweeps from “nothing is positive” to “everything is positive”:
        </p>
        <MB t="\TPR = \frac{\TP}{\TP + \FN}\;\;(\text{of actual positives}), \qquad \FPR = \frac{\FP}{\FP + \TN}\;\;(\text{of actual negatives})." />
        <Callout kind="warning">
          FPR is <em>not</em> <M t="1 - \Prec" />. They share the numerator FP, but <M t="1 - \Prec = \FP/(\TP + \FP)" /> divides by the predicted
          positives, while FPR divides by the actual negatives.
        </Callout>
        <Steps
          intro={
            <p>
              Six observations, scores already sorted: <M t="(0.95, 0.85, 0.75, 0.60, 0.40, 0.10)" /> with labels <M t="(1, 0, 1, 1, 0, 0)" /> — three
              positives, three negatives. Each step of the threshold crosses one observation.
            </p>
          }
          steps={[
            { title: 'Start above every score', body: <p>Nothing is predicted positive: <M t="(\FPR, \TPR) = (0, 0)" />.</p> },
            {
              title: 'Cross a positive ⇒ step up; cross a negative ⇒ step right',
              body: (
                <p>
                  Each positive crossed raises TPR by <M t="1/3" />; each negative raises FPR by <M t="1/3" />.
                </p>
              ),
            },
            {
              title: 'Trace the path',
              body: (
                <Table
                  head={['threshold', '> 0.95', '0.95', '0.85', '0.75', '0.60', '0.40', '0.10']}
                  rows={[
                    ['FPR', '0', '0', '1/3', '1/3', '1/3', '2/3', '1'],
                    ['TPR', '0', '1/3', '1/3', '2/3', '1', '1', '1'],
                  ]}
                />
              ),
            },
            {
              title: 'Area under the curve',
              body: (
                <>
                  <p>Only horizontal moves add area, each a strip of width 1/3 at the current height:</p>
                  <MB t="\AUC = \tfrac13\cdot\tfrac13 + \tfrac23\cdot 1 = \tfrac79 \approx 0.778." />
                </>
              ),
            },
          ]}
        />
        <Callout kind="note" title="Tied scores">
          Observations with equal scores must cross <em>together</em>, producing a diagonal segment. Do not give tied scores whichever order flatters the
          curve.
        </Callout>
        <Lab
          title="Sweep the threshold"
          purpose="Move the threshold: the red point is the current (FPR, TPR) on the ROC curve, and the readout is its confusion matrix."
        >
          <ROCLab />
        </Lab>
        <TryThis
          items={[
            'In the six-observation example, set the threshold to 0.5: TP = 3, FP = 1, TN = 2, FN = 0. Accuracy 5/6 and recall 1 describe one point on the curve.',
            'Switch to simulated scores and set the separation to 0: the curve hugs the diagonal and AUC ≈ 0.5. At 5 it approaches the top-left corner.',
            'Turn on “cube every score”. Every score changes and the threshold that gives each point changes, but the ROC curve and AUC do not move. Why?',
            'Drag the threshold slowly from 1 down to 0 and watch precision: it does not change monotonically.',
          ]}
        />
      </Sec>

      <Sec title="Reading an ROC curve and its AUC">
        <ul>
          <li>
            The top-left corner combines high detection with few false alarms. A good model has AUC close to 1.
          </li>
          <li>
            AUC = 0.5 means <em>random ranking</em> — the diagonal is the reference line of a scorer that orders positives and negatives at random. It
            does not prove the algorithm literally guesses, and not every weak classifier sits exactly on the diagonal.
          </li>
          <li>
            AUC depends only on the <strong>ordering</strong> of the scores, so any strictly increasing transformation leaves the curve unchanged.
          </li>
        </ul>
        <Callout kind="intuition" title="Going deeper: AUC as a ranking probability">
          AUC equals the probability that a randomly chosen positive is scored higher than a randomly chosen negative (ties counting ½). In the example the
          positive scores 0.95, 0.75, 0.60 beat 3, 2 and 2 of the negative scores 0.85, 0.40, 0.10: <M t="7" /> of <M t="3 \times 3 = 9" /> pairs, so AUC ={' '}
          <M t="7/9" /> again.
        </Callout>
        <p>
          AUC summarises performance <em>across</em> thresholds. It does not choose a threshold, guarantee well-calibrated probabilities, or tell you the
          accuracy at the operating point you will actually use. Choose τ for the task (on validation data), then report the metrics at that τ.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l9.q1"
          q={<p>Scores (0.8, 0.6, 0.5, 0.3, 0.1) with labels (1, 1, 0, 1, 0). What is the AUC?</p>}
          options={[
            { text: '5/6', correct: true, why: 'Path (0,0) → (0,⅓) → (0,⅔) → (½,⅔) → (½,1) → (1,1); area ½·⅔ + ½·1 = 5/6. Pairwise: 0.8 and 0.6 beat both negatives, 0.3 beats one: 5 of 6.' },
            { text: '1/2', why: 'That would be random ranking; here positives tend to score higher.' },
            { text: '1', why: 'The negative at 0.5 outranks the positive at 0.3, so the ranking is not perfect.' },
          ]}
        />
        <Quiz
          id="w2.l9.q2"
          q={<p>Lowering the threshold on a fixed dataset…</p>}
          options={[
            { text: 'can never decrease recall, but can decrease precision.', correct: true, why: 'TP can only grow, so TPR cannot fall; precision depends on whether the new positives are true or false.' },
            { text: 'always increases precision.', why: 'Adding mostly negatives lowers precision.' },
            { text: 'leaves FPR unchanged.', why: 'FP can grow, so FPR can rise.' },
          ]}
        />
        <Quiz
          id="w2.l9.q3"
          q={<p>Model A has AUC 0.90, model B 0.85. Which statement is justified?</p>}
          options={[
            { text: 'A has higher accuracy at threshold 0.5.', why: 'AUC summarises all thresholds; at a particular threshold B may be more accurate.' },
            { text: 'A ranks positives above negatives more often, averaged over thresholds.', correct: true, why: 'That is what AUC measures.' },
            { text: 'A’s probabilities are better calibrated.', why: 'AUC ignores the score values — only their order matters.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A scorer plus a threshold is a classifier; sweeping the threshold traces the ROC curve of <M t="(\FPR, \TPR)" /> pairs. Crossing a positive steps
        up, crossing a negative steps right; AUC is the area under the path (1 = perfect ranking, 0.5 = random ranking). AUC depends only on the order of
        the scores and does not choose an operating threshold.
      </Callout>

      <Checklist id="w2-roc" items={CHECKS2['w2-roc']} />
    </>
  );
}
