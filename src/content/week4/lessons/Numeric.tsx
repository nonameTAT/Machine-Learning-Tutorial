import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Table, TryThis } from '../../../components/ui';
import { ThresholdLab } from '../labs/ThresholdLab';

export default function Numeric() {
  return (
    <>
      <Sec title="Turn a number into a question">
        <p>
          ID3’s tests have one branch per value. A numeric feature such as temperature has too many values for that to make sense, so we ask a yes/no
          question instead: <M t="x \le t" /> or <M t="x > t" />. The learner has to choose the threshold <M t="t" />.
        </p>
        <p>
          Only finitely many thresholds are worth considering. Sort the <strong>distinct</strong> observed values{' '}
          <M t="v_1 < v_2 < \dots < v_m" />. Any <M t="t" /> strictly between <M t="v_i" /> and <M t="v_{i+1}" /> sends exactly the same training examples
          left, so there are at most <M t="m - 1" /> different partitions, one per gap. The usual convention is the midpoint{' '}
          <M t="t = (v_i + v_{i+1})/2" />.
        </p>
        <Callout kind="warning" title="Same training split, different future predictions">
          Every threshold in a gap gives the same training partition and the same gain — but not the same predictions for future inputs that fall inside
          the gap. The midpoint is a convention, not something the data determine. And equal values can never be separated: they fall on the same side of
          every threshold.
        </Callout>
      </Sec>

      <Sec title="Worked example">
        <p>
          Nine examples with values 10.2, 11.1, 11.8, 13.0, 13.6, 14.4, 15.5, 16.5, 18.0 and labels +, −, −, +, +, +, −, −, + respectively. The parent
          holds 5 positives and 4 negatives:
        </p>
        <MB t="H(S) = H\big(\tfrac59\big) = 0.991076." />
        <Table
          className="num"
          head={['Midpoint t', 'Left (+, −)', 'Right (+, −)', 'Gain']}
          rows={[
            ['10.65', '(1, 0)', '(4, 4)', <strong>0.102187</strong>],
            ['11.45', '(1, 1)', '(4, 3)', '0.002565'],
            ['12.40', '(1, 2)', '(4, 2)', '0.072780'],
            ['13.30', '(2, 2)', '(3, 2)', '0.007215'],
            ['14.00', '(3, 2)', '(2, 2)', '0.007215'],
            ['14.95', '(4, 2)', '(1, 2)', '0.072780'],
            ['16.00', '(4, 3)', '(1, 1)', '0.002565'],
            ['17.25', '(4, 4)', '(1, 0)', <strong>0.102187</strong>],
          ]}
        />
        <p>
          The best gain is a tie between 10.65 and 17.25 — each cuts off a single example. Break the tie with a stated rule (for instance, the smaller
          threshold). The value 12.4, often used to illustrate a split, is a valid candidate but not the maximum-gain one for these data.
        </p>
        <Lab title="Scan the thresholds" purpose="Slide the threshold across the gaps (or click a bar). Triangles mark class-change boundaries. Click a point to flip its label and see how the best threshold moves.">
          <ThresholdLab />
        </Lab>
        <TryThis
          items={[
            'Confirm the table: the two tallest bars are at the ends, each isolating a single example.',
            'Set the minimum leaf size to 2. The two singleton splits are no longer allowed; 12.4 and 14.95 tie at 0.0728.',
            'Back at minimum leaf size 1, flip labels at random. However you set them, at least one best bar sits on a triangle (a class-change boundary).',
            'Switch to “with a repeated value”: the two examples at 13.0 have different labels and can never be separated — there is one gap fewer.',
          ]}
        />
      </Sec>

      <Sec title="Why look only at class changes?">
        <p>
          Between two neighbouring values with the <em>same</em> label, moving the threshold transfers examples of a single class from one side to the
          other. One can show that the weighted entropy cannot reach its minimum strictly inside such a run, so with distinct values and no extra
          constraints, a best entropy threshold always lies at a <strong>boundary</strong> where the class changes (a result of Fayyad and Irani). Here the
          boundaries are 10.65, 12.4, 14.95 and 17.25, and the full table confirms the best one is among them.
        </p>
        <p>
          Use the shortcut with care. With repeated values, first group equal values and count their classes; a gap next to a mixed group is a boundary
          too. With constraints such as a minimum leaf size, check all admissible gaps. And never apply a class-change shortcut to a numeric target in
          regression — there is no “class” to change (lesson 15).
        </p>
        <p>
          <strong>Cost.</strong> Sorting a feature costs <M t="O(n \log n)" />; sweeping the gaps from left to right while updating the left and right class
          counts costs <M t="O(n k)" /> for <M t="k" /> classes. A numeric feature can be tested again further down the tree at a different threshold,
          because each child still contains a range of values.
        </p>
        <Callout kind="note" title="Finding a split is not deciding to keep it">
          The best split here isolates one example. That is a correct answer to “which threshold has the largest gain?” and possibly a poor answer to
          “which split will generalise?”. Split selection and complexity control are separate questions (lessons 10–12).
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>A feature has nine distinct values in the training set. How many different training partitions can a threshold test produce?</p>}
          options={[
            { text: '8', correct: true, why: 'One per gap between neighbouring distinct values.' },
            { text: '9', why: 'A threshold below the smallest value or above the largest puts everything on one side: no split.' },
            { text: 'Infinitely many — t is a real number', why: 'Infinitely many thresholds, but only 8 different partitions of the training examples.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>Thresholds 12.0 and 12.4 both lie between 11.8 and 13.0. Which statement is true?</p>}
          options={[
            { text: 'They give the same training split and gain, but can classify a new value such as 12.2 differently', correct: true, why: 'The training data say nothing about where inside the gap the cut belongs.' },
            { text: 'They are completely equivalent', why: 'Not for future inputs that fall inside the gap.' },
            { text: '12.4 has a higher gain because it is the midpoint', why: 'The gain depends only on the partition, which is identical.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>With a minimum of two examples per leaf, which thresholds maximise the gain in the worked example?</p>}
          options={[
            { text: '10.65 and 17.25', why: 'Each leaves a single example on one side, which the constraint forbids.' },
            { text: '12.4 and 14.95 (gain 0.0728)', correct: true, why: 'The constraint changes the candidate set, not the formula.' },
            { text: '13.3 and 14.0', why: 'Admissible, but their gain is only 0.0072.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A numeric feature becomes a binary test <M t="x \le t" />. Only the gaps between neighbouring distinct values matter — at most m − 1 partitions —
        and, without constraints, the best entropy threshold lies where the class changes. Thresholds in the same gap agree on the training data but not on
        new inputs; constraints such as a minimum leaf size change which thresholds are allowed, not how they are scored.
      </Callout>
    </>
  );
}
