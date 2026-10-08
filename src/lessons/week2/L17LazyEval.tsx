import { M } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { LazyEvalLab } from '../../interactives/week2/LazyEvalLab';
import { CHECKS2 } from './checks';

export default function L17LazyEval() {
  return (
    <>
      <Sec title="Strengths and weaknesses">
        <Table
          head={['Advantages', 'Disadvantages']}
          rows={[
            ['can be very accurate', 'slow at query time: the basic algorithm scans the entire training set'],
            ['no training time', 'the curse of dimensionality (lesson 18)'],
            ['can approximate complex target functions', 'treats all attributes as equally important — easily fooled by irrelevant ones (remedy: selection or weights)'],
            ['', 'noisy instances (remedy: more neighbours)'],
            ['', 'needs homogeneous feature types and scales (lesson 15); finding the best k requires search'],
          ]}
        />
        <p>
          When to consider nearest neighbour: instances map to points in <M t="\R^d" />, fewer than about 20 attributes (or they can be
          reduced), lots of training data, and no need for an explanatory model.
        </p>
      </Sec>

      <Sec title="Why training error is the wrong question">
        <p>
          Lazy learners build no explicit model, so how do we evaluate them? Not on the training set: with 1-NN, every training example is its own
          nearest neighbour at distance 0, so <strong>training error is always zero</strong> (for distinct inputs; conflicting duplicates are the
          exception). With larger k, overfitting is still hard to see.
        </p>
        <p>
          The remedy is to make sure the point being predicted is <em>not</em> in the reference set. <strong>Leave-one-out cross-validation</strong>{' '}
          predicts each example from all the others,
        </p>
        <p style={{ textAlign: 'center' }}>
          <M t="(\bx_1, y_1), \dots, (\bx_{i-1}, y_{i-1}), (\bx_{i+1}, y_{i+1}), \dots, (\bx_m, y_m)," />
        </p>
        <p>
          and averages the errors. For k-NN it is easy to define and “fast — no models to be built”: just remove one point from the stored set.
        </p>
        <Callout kind="example" title="Memorising is not predicting">
          <M t="(x, y) = (0, 0), (1, 1), (3, 1), (4, 0)" />. Each point retrieves itself, so 1-NN training error is 0. Leave-one-out:
          <Table
            head={['held out x', 'actual y', 'nearest remaining x', 'prediction', 'correct?']}
            rows={[
              ['0', '0', '1', '1', 'no'],
              ['1', '1', '0', '0', 'no'],
              ['3', '1', '4', '0', 'no'],
              ['4', '0', '3', '1', 'no'],
            ]}
          />
          LOOCV error is <M t="4/4 = 1" />. Memorising the labels and predicting held-out labels are different achievements.
        </Callout>
        <Lab title="Training error vs leave-one-out error" purpose="For every k on the 50-point dataset of lesson 16. The red dot marks the k with the lowest LOOCV error.">
          <LazyEvalLab />
        </Lab>
        <TryThis
          items={[
            'At k = 1 the training error is 0 while the LOOCV error is 0.40 — the worst of any k on this data. Which number would you report?',
            'Find the LOOCV minimum. Then look further right: very large k underfits and both curves rise towards the minority-class rate.',
            'Turn on distance weighting: the training error drops to 0 for every k (each point is an exact match with itself). The training curve has become useless for every k.',
          ]}
        />
        <Callout kind="warning">
          If LOOCV is used to <em>choose</em> k, its score is selection evidence, not a final estimate — keep a separate test set. Any learned preprocessing
          (scaling, imputation) must also exclude the held-out point. And k cannot exceed the <M t="m - 1" /> points left in each fit.
        </Callout>
      </Sec>

      <Sec title="Cheap to fit, expensive to query">
        <ul>
          <li>
            Storing the training set costs <M t="O(md)" /> memory. A brute-force query computes <M t="m" /> distances: <M t="O(m)" /> when
            treating <M t="d" /> as fixed, or <M t="O(md)" /> for coordinate-wise distances. Picking the <M t="k" /> smallest does not need a full sort.
          </li>
          <li>
            Brute-force LOOCV makes <M t="m(m-1)" /> query-to-reference comparisons: <M t="O(m^2d)" />. “No model to train” is not “free evaluation”.
          </li>
          <li>
            Tree-based search (e.g. k-d trees) can answer queries in about <M t="O(\log m)" />, but does not work well beyond roughly 10 dimensions;
            approximate nearest-neighbour methods can then speed things up by orders of magnitude. Above about 20 dimensions k-NN itself tends not to work
            well — the subject of lesson 18.
          </li>
        </ul>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l17.q1"
          q={<p>(x, y) = (0, 1), (1, 0), (5, 0), (6, 1). What are the 1-NN training error and LOOCV error?</p>}
          options={[
            { text: '0 and 1', correct: true, why: 'Held out 0 → nearest 1 (label 0) wrong; 1 → 0 (label 1) wrong; 5 → 6 (1) wrong; 6 → 5 (0) wrong.' },
            { text: '0 and 0', why: 'LOOCV removes the point itself, so it cannot retrieve its own label.' },
            { text: '1 and 1', why: 'With self-matches allowed every point predicts its own label.' },
          ]}
        />
        <Quiz
          id="w2.l17.q2"
          q={<p>With m = 5 training points, is k = 5 a valid choice inside LOOCV?</p>}
          options={[
            { text: 'Yes', why: 'Each fit has only 4 points left after holding one out.' },
            { text: 'No — each fit has only m − 1 = 4 reference points.', correct: true, why: 'k must not exceed the training size of each fit.' },
          ]}
        />
        <Quiz
          id="w2.l17.q3"
          q={<p>Why is k-NN called fast to train but slow to query?</p>}
          options={[
            { text: 'Training stores the data; each query scans all m stored points (O(md) brute force).', correct: true, why: 'The work is deferred to prediction time.' },
            { text: 'Training runs gradient descent, which is fast.', why: 'There is no optimisation at all.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        1-NN memorises: its training error is zero whatever the data, so training accuracy says nothing about generalisation. Leave-one-out CV predicts each
        point from the others — easy for k-NN because there is no model to refit — and it costs <M t="O(m^2d)" /> by brute force. k-NN shifts all the
        cost from training to querying.
      </Callout>

      <Checklist id="w2-lazyeval" items={CHECKS2['w2-lazyeval']} />
    </>
  );
}
