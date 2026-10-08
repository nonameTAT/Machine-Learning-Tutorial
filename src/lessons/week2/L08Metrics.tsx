import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { ConfusionLab } from '../../interactives/week2/ConfusionLab';
import { CHECKS2 } from './checks';

export default function L08Metrics() {
  return (
    <>
      <Sec title="Decide what “positive” means">
        <p>
          In a binary task one class is designated <strong>positive</strong> (<M t="y = 1" />) and the other <strong>negative</strong>.
          “Positive” is a label, not a judgement — in a cancer screen, “positive” is the bad news. Sometimes both classes matter equally (dog vs cat);
          sometimes one mistake is much costlier than the other: telling a patient they are healthy when they have cancer is worse than a false alarm.
          A single count of “mistakes” hides that difference.
        </p>
      </Sec>

      <Sec title="Four counts: the confusion matrix">
        <p>Every prediction falls into one of four cells:</p>
        <ul>
          <li>
            <strong>True positive (TP)</strong>: actually positive, predicted positive.
          </li>
          <li>
            <strong>False negative (FN)</strong>: actually positive, predicted negative — a <em>missed</em> case.
          </li>
          <li>
            <strong>False positive (FP)</strong>: actually negative, predicted positive — a <em>false alarm</em>.
          </li>
          <li>
            <strong>True negative (TN)</strong>: actually negative, predicted negative.
          </li>
        </ul>
        <Table
          head={['actual ↓ / predicted →', 'positive', 'negative']}
          rows={[
            ['positive', 'TP', 'FN'],
            ['negative', 'FP', 'TN'],
          ]}
        />
        <p>
          This contingency table is the <strong>confusion matrix</strong>. Here rows are the actual classes and columns the predictions.
        </p>
        <Callout kind="warning">Other books and software transpose it. Always read the axis labels before reading off FP and FN.</Callout>
      </Sec>

      <Sec title="Each metric divides by a different population">
        <p>
          <strong>Accuracy</strong> on a test set is the fraction of correct labels; classification <strong>error</strong> is{' '}
          <M t="1 - \Acc" />:
        </p>
        <MB t="\Acc = \frac{1}{|\text{Test}|}\sum_{x\in\text{Test}} \Ind[\hat c(x) = c(x)] = \frac{\TP + \TN}{\TP + \TN + \FP + \FN}." />
        <p>Precision and recall zoom in on the positive class, but condition on different sets:</p>
        <MB t="\Prec = \frac{\TP}{\TP + \FP}\;\;\text{(predicted positives)}, \qquad \Rec = \TPR = \frac{\TP}{\TP + \FN}\;\;\text{(actual positives)}." />
        <Table
          head={['Metric', 'Denominator counts…', 'Question answered']}
          rows={[
            ['Accuracy', 'all cases', 'how many labels were right?'],
            ['Precision', 'the predicted-positive column', 'when it says “positive”, how often is it right?'],
            ['Recall / sensitivity / TPR', 'the actual-positive row', 'how many of the real positives did it find?'],
          ]}
        />
        <p>
          The <strong>F1 score</strong> combines precision and recall with a harmonic mean, which is dragged down by whichever is smaller.
        </p>
        <Steps
          steps={[
            { title: 'Harmonic mean', body: <MB t="\Fone = \frac{2}{1/\Prec + 1/\Rec} = \frac{2\,\Prec\cdot\Rec}{\Prec + \Rec}\qquad(\Prec, \Rec > 0)." /> },
            {
              title: 'Substitute the counts',
              body: <MB t="\frac1\Prec + \frac1\Rec = \frac{\TP + \FP}{\TP} + \frac{\TP + \FN}{\TP} = \frac{2\TP + \FP + \FN}{\TP}." />,
            },
            {
              title: 'Count form',
              body: (
                <>
                  <MB t="\boxed{\;\Fone = \frac{2\TP}{2\TP + \FP + \FN}\;}" />
                  <p>
                    TN does not appear: F1 ignores correctly rejected negatives. It weights precision and recall equally, which is sometimes not what the task
                    needs.
                  </p>
                </>
              ),
            },
          ]}
        />
      </Sec>

      <Sec title="Worked evaluation">
        <Callout kind="example" title="Worked example">
          Of 100 observations, <M t="\TP = 12" />, <M t="\FN = 8" />, <M t="\FP = 6" />, <M t="\TN = 74" />: 20 actual positives, 80 actual negatives.
          <MB t="\Acc = \tfrac{86}{100} = 0.86, \quad \Prec = \tfrac{12}{18} = \tfrac23, \quad \Rec = \tfrac{12}{20} = 0.60, \quad \Fone = \tfrac{24}{38} \approx 0.632." />
          Predicting <em>every</em> observation negative would still score accuracy 0.80 — but recall 0. It misses every positive case.
        </Callout>
        <Lab title="Confusion-matrix calculator" purpose="Edit the four counts. Click a metric to highlight its numerator and denominator cells.">
          <ConfusionLab />
        </Lab>
        <TryThis
          items={[
            'Load “Rare positives”: accuracy is 0.992 though only 2 of 5 positives were found and 5 of 7 alarms were false. Which metric exposes each problem?',
            'Load “Flag everything”: recall is 1. What is precision? So recall alone is just as easy to game as accuracy.',
            'Set TP = FP = 0. Precision becomes undefined (0/0) — not 0 and not 1.',
            'Click precision, then FPR. Both have FP in the numerator, but the denominators are a column and a row: FPR is not 1 − precision.',
          ]}
        />
      </Sec>

      <Sec title="Undefined is an answer, not a bug">
        <p>
          If no positive predictions are made, precision has denominator 0. If the test set has no positives, recall has denominator 0. Software may
          substitute a value (often 0, with a warning), but the fraction itself is undefined; report the convention you used. F1’s count form is defined
          as long as <M t="2\TP + \FP + \FN > 0" />.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l8.q1"
          q={<p>TP = 30, FN = 10, FP = 20, TN = 140. What are precision and recall?</p>}
          options={[
            { text: 'precision 0.60, recall 0.75', correct: true, why: '30/(30 + 20) = 0.60; 30/(30 + 10) = 0.75.' },
            { text: 'precision 0.75, recall 0.60', why: 'Swapped: precision divides by predicted positives (50), recall by actual positives (40).' },
            { text: 'precision 0.85, recall 0.75', why: '0.85 is the accuracy (170/200).' },
          ]}
        />
        <Quiz
          id="w2.l8.q2"
          q={<p>You produce more positive predictions (lower the bar). Which metric’s denominator changes?</p>}
          options={[
            { text: 'Recall', why: 'Recall conditions on the actual positives, which do not change.' },
            { text: 'Precision', correct: true, why: 'Precision conditions on the predicted-positive set, which grows.' },
            { text: 'Neither', why: 'The predicted-positive column grows.' },
          ]}
        />
        <Quiz
          id="w2.l8.q3"
          q={<p>“My classifier has 95% accuracy, so it is useful.” Positives are 5% of the data. Evaluate.</p>}
          options={[
            { text: 'True — 95% is high.', why: 'Predicting every case negative also achieves 95%.' },
            { text: 'Not established: compare with the all-negative baseline and look at recall and precision.', correct: true, why: 'With imbalance, accuracy is dominated by the majority class.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Read a confusion matrix by its axes, then ask what each metric divides by: accuracy — everything; precision — predicted positives; recall (TPR)
        — actual positives; FPR — actual negatives. F1 = <M t="2\TP/(2\TP + \FP + \FN)" /> balances precision and recall and ignores TN. Which metric
        matters depends on which mistakes matter.
      </Callout>

      <Checklist id="w2-metrics" items={CHECKS2['w2-metrics']} />
    </>
  );
}
