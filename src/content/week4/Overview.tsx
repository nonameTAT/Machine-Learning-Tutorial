import { Sec, Table } from '../../components/ui';
import { StudyRoute } from '../../course/overview';

// Week 4 overview body; the shell adds the heading above and “Your data” below.
export default function Overview() {
  return (
    <>
      <Sec title="The thread of the week">
        <p>
          Trees learn by asking a sequence of questions. Each question narrows the set of training examples an input resembles; each leaf predicts for the
          examples that remain. The week is about three things: <em>choosing</em> the questions (entropy, information gain and its variants), understanding
          what the resulting tree <em>can represent</em> and what greedy search will actually find, and <em>controlling</em> the temptation to memorise the
          training set. The last part changes the target from a class to a number — regression trees, model trees — and ends with kernel smoothing, which
          averages over a neighbourhood that moves with the query instead of a fixed leaf.
        </p>
        <p>
          The standard to aim for: calculate a split, explain why that calculation is the right one, trace the algorithm that uses it, and say when its
          assumptions fail. A correct formula without the mechanism is not yet understanding. If time is short, the spine is lessons 1, 3–6, 8, 10, 12 and
          14–15; lessons 9, 11 and 17 are the ones most often examined as reasoning rather than arithmetic.
        </p>
      </Sec>

      <StudyRoute />

      <Sec title="What carries over">
        <Table
          head={['Earlier idea', 'Where it returns this week']}
          rows={[
            ['Week 1: the mean minimises squared error, the median absolute error', 'what a regression leaf predicts (lesson 14)'],
            ['Week 1: bias–variance', 'deep versus shallow trees (lesson 10) and the smoothing bandwidth (lesson 17)'],
            ['Week 1: k-NN regression', 'kernel smoothing: a weighted, moving neighbourhood (lesson 17)'],
            ['Week 2: decision regions and boundaries', 'trees as axis-parallel partitions (lesson 1)'],
            ['Week 2: log loss', 'entropy is the average log loss of predicting a node’s own proportions (lesson 4)'],
            ['Week 2: cross-validation', 'choosing a tree size and the one-SE rule (lesson 12)'],
            ['Week 3: inductive bias', 'restriction and preference bias of a tree learner (lesson 9)'],
            ['Week 3: PlayTennis, minimum expected loss, missing values', 'ID3 on the same days (lesson 6); cost-sensitive leaves and routing missing values (lesson 13)'],
          ]}
        />
      </Sec>

      <Sec title="Subtleties worth remembering">
        <ul>
          <li>
            <strong>Weights:</strong> expected entropy after a test weights each child by its size; an unweighted average is wrong (lesson 5).
          </li>
          <li>
            <strong>Locality:</strong> inside a branch, every count, entropy and gain uses only that branch’s examples (lessons 3, 6).
          </li>
          <li>
            <strong>Identifiers:</strong> gain ratio weakens the preference for many-valued attributes but still picks Day on PlayTennis — remove IDs by hand
            (lesson 7).
          </li>
          <li>
            <strong>Thresholds:</strong> every threshold in one gap gives the same training split but different predictions on new values (lesson 8).
          </li>
          <li>
            <strong>XOR:</strong> zero immediate gain is not “no useful split” (lesson 9).
          </li>
          <li>
            <strong>Perfect fit:</strong> identical inputs with different labels make zero training error impossible; with k classes the worst case is 1 − 1/k
            (lesson 11).
          </li>
          <li>
            <strong>One-SE rule:</strong> the threshold uses the SE of the minimum-error candidate, not each candidate’s own SE (lesson 12).
          </li>
          <li>
            <strong>Regression:</strong> each child of a proposed split gets its own mean; leaf MSE divides by m, not m − 1 (lessons 14–15).
          </li>
          <li>
            <strong>Bandwidth convention:</strong> with the same h, the boxcar reaches h/2 and Epanechnikov h (lesson 17).
          </li>
        </ul>
      </Sec>

      <Sec title="Reading the diagrams">
        <p className="small">
          In tree diagrams, rectangles are tests and rounded boxes are leaves. Blue leaves and regions predict Yes / True / class 1; orange ones No / False /
          class 0. A thick teal line is the path an input follows; a blue outline marks the node you have selected. The kernel-smoothing lab uses the colours
          of the figure it reproduces: blue truth, red neighbourhood, yellow kernel, green fit.
        </p>
      </Sec>
    </>
  );
}
