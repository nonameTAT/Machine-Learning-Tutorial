import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../../components/ui';
import { ORGANS } from '../labs/data';
import { OrganGrowLab } from '../labs/GrowLab';
import { StumpLab } from '../labs/StumpLab';

export default function RegSplit() {
  return (
    <>
      <Sec title="Score a split by the error it leaves behind">
        <p>
          For classification we measured how mixed the labels are and how much a test reduces that. For a numeric target the natural measure is squared
          error. After a split, each child <M t="S_v" /> will predict its own mean <M t="\bar y_v" />, so the error that remains is
        </p>
        <MB t="Q(S, A) = \sum_v \frac{n_v}{n}\,\operatorname{MSE}(S_v) = \frac1n\sum_v \sum_{i \in S_v} (y_i - \bar y_v)^2, \qquad \operatorname{MSE}(S_v) = \frac{1}{n_v}\sum_{i \in S_v}(y_i - \bar y_v)^2." />
        <p>
          Choose the candidate with the <strong>smallest</strong> <M t="Q" />. The structure mirrors information gain exactly: a size-weighted average of the
          children’s impurity. Equivalently, maximise the reduction <M t="\operatorname{MSE}(S) - Q(S, A)" />; and since <M t="n" /> is the same for every
          candidate at one node, minimising the total child SSE gives the same ranking.
        </p>
        <Callout kind="warning" title="Each child gets its own mean">
          Do not keep the parent’s mean after splitting — that would leave the error unchanged by definition. A proposed split is scored by the error of
          the predictions it would actually make: each child’s optimal constant.
        </Callout>
      </Sec>

      <Sec title="A stump on six points">
        <p>
          Inputs <M t="x = 1, \dots, 6" /> with targets <M t="y = (1, 2, 2, 8, 9, 10)" />. The parent mean is <M t="16/3" />, its SSE <M t="250/3" />, so
          its MSE is <M t="125/9 \approx 13.889" />. Strategy before arithmetic: sort by <M t="x" />, try each gap, give both sides their own means, total
          the squared error. The jump between 2 and 8 suggests where to look first — but verify every candidate.
        </p>
        <Steps
          steps={[
            { title: 'Left of t = 3.5', body: <MB t="(1, 2, 2):\quad \bar y_L = \tfrac53,\quad \operatorname{SSE}_L = \big(\tfrac23\big)^2 + \big(\tfrac13\big)^2 + \big(\tfrac13\big)^2 = \tfrac23." /> },
            { title: 'Right of t = 3.5', body: <MB t="(8, 9, 10):\quad \bar y_R = 9,\quad \operatorname{SSE}_R = 1 + 0 + 1 = 2." /> },
            { title: 'Weighted MSE', body: <MB t="Q(3.5) = \frac{\operatorname{SSE}_L + \operatorname{SSE}_R}{6} = \frac{2/3 + 2}{6} = \frac49 \approx 0.444." /> },
          ]}
        />
        <Table
          className="num"
          head={['Threshold', 'Left mean', 'Right mean', 'Weighted MSE']}
          rows={[
            ['1.5', '1', '6.2', '10.133'],
            ['2.5', '1.5', '7.25', '6.542'],
            ['3.5', '1.667', '9', <strong>0.444</strong>],
            ['4.5', '3.25', '9.5', '5.208'],
            ['5.5', '4.4', '10', '9.533'],
          ]}
        />
        <p>
          The best split is at 3.5, reducing the MSE by <M t="125/9 - 4/9 = 121/9" />. As a one-split tree it predicts <M t="5/3" /> for{' '}
          <M t="x \le 3.5" /> and 9 for <M t="x > 3.5" />.
        </p>
        <Lab title="A regression stump" purpose="Drag the points up and down; try each threshold. The lower chart shows every threshold’s weighted MSE against the parent’s (dashed).">
          <StumpLab />
        </Lab>
        <TryThis
          items={[
            'Check the table: only t = 3.5 brings the error close to zero.',
            'Drag the point at x = 4 down to about 2. The jump moves, and so does the best threshold (to 4.5).',
            'Drag all six points to the same height: every bar drops to zero and the parent’s error is zero too — nothing to explain, so no reason to split.',
            'Notice that no “class-change” shortcut applies: a numeric target has no classes, so every gap must be scored.',
          ]}
        />
        <p>
          With several numeric features, search every gap of every feature and keep the overall best. A further split inside each child could lower the
          training error again; whether to make it is a question for depth limits, leaf sizes and pruning, not for the non-zero residuals alone.
        </p>
      </Sec>

      <Sec title="Categorical predictors: second-hand organs">
        <p>Nine Hammond organs, each with a model, a condition, whether a Leslie speaker is included, and a price:</p>
        <Table
          className="num"
          head={['Model', 'Condition', 'Leslie', 'Price']}
          rows={ORGANS.map((o) => [o.model, o.condition, o.leslie, o.price.toLocaleString('en-US')])}
        />
        <p>Every categorical attribute partitions the organs into groups; score each partition by its weighted MSE, using the prices themselves.</p>
        <Table
          className="num"
          head={['Split on', 'Groups (mean price)', 'Weighted MSE']}
          rows={[
            ['Model', 'A100 1573.7 · B3 4513 · E112 77 · M102 870 · T202 331.3', <strong>62,466.8</strong>],
            ['Condition', 'excellent 3141.5 · good 1022.75 · fair 267', '590,538.1'],
            ['Leslie', 'yes 1131.7 · no 1296.7', '1,724,527.8'],
          ]}
        />
        <p>
          Model wins by a wide margin. Its three singleton groups contribute zero error (one price, predicted exactly); for A100 the group (1051, 1770, 1900)
          has mean <M t="4721/3" /> and SSE 418,220.7; for T202, (99, 270, 625) has mean <M t="994/3" /> and SSE 143,980.7; so{' '}
          <M t="Q = (418{,}220.7 + 143{,}980.7)/9 = 62{,}466.8" />. Inside A100 and T202 the remaining candidates are Condition and Leslie, and both subsets
          prefer Leslie (A100: 86,160 vs 120,134; T202: 4,874 vs 46,113).
        </p>
        <Lab title="Grow the organ tree" purpose="The same grower as for PlayTennis, now scoring each candidate by weighted MSE. “Grow greedily” stops after two levels.">
          <OrganGrowLab />
        </Lab>
        <TryThis
          items={[
            'Grow two levels and read off the predictions: A100 with Leslie 1900, A100 without 1410.5, T202 with Leslie 625, T202 without 184.5.',
            'Split the two “without Leslie” nodes again on Condition. Training MSE drops to zero — with one organ per leaf. Is that learning or memorising?',
            'Select the root and compare the three rows with the table above.',
          ]}
        />
        <Callout kind="note" title="Empty categories">
          A category with no training examples at a node has weight zero, so it adds nothing to Q. Its mean cannot be estimated from zero examples: keep a
          fallback, such as the parent’s mean, for future inputs that land there. Some presentations also set an empty child’s variance equal to the
          parent’s, to keep every term defined; with weight zero that changes nothing. The fallback does not create training observations.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>What is the weighted MSE of the split at t = 3.5 for y = (1, 2, 2, 8, 9, 10)?</p>}
          options={[
            { text: '4/9', correct: true, why: 'SSE 2/3 on the left plus 2 on the right, divided by 6.' },
            { text: '8/3', why: 'That is the total SSE; divide by n = 6.' },
            { text: '125/9', why: 'That is the parent’s MSE, before splitting.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>Why do minimising weighted MSE, minimising total child SSE and maximising MSE reduction choose the same split at one node?</p>}
          options={[
            { text: 'They differ only by the constant n and the constant parent MSE, which are the same for every candidate', correct: true, why: 'Monotone transformations of the same score.' },
            { text: 'They don’t; MSE reduction prefers larger children', why: 'The parent MSE is fixed at a node, so the reduction ranks exactly as −Q.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>Splitting the organs on Model creates three single-organ groups. Why should that make you cautious?</p>}
          options={[
            { text: 'Singleton groups have zero training error automatically, so part of Model’s advantage is memorisation', correct: true, why: 'The same many-values trap as ID, now in regression.' },
            { text: 'It makes Q undefined', why: 'Singletons contribute 0, not an undefined term.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A regression split is scored by the error it leaves: the size-weighted average of the children’s MSE, each child predicting its own mean. Search every
        gap of a numeric feature (no class-change shortcut) and every partition of a categorical one; the smallest weighted MSE wins. Watch for singleton
        groups, which score perfectly for the wrong reason.
      </Callout>
    </>
  );
}
