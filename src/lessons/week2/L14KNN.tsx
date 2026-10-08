import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { KNNClassLab } from '../../interactives/week2/KNNClassLab';
import { CHECKS2 } from './checks';

export default function L14KNN() {
  return (
    <>
      <Sec title="Keep the examples instead of a summary">
        <p>
          Nearest centroid compressed each class into one mean, and lost the class’s shape. Nearest-neighbour classification goes to the other extreme:
          keep <em>every</em> training example and compare the query with them directly.
        </p>
        <ul>
          <li>It is related to the simplest form of learning — rote learning, or memorisation. The instances themselves represent the knowledge.</li>
          <li>Names: instance-based, memory-based or case-based learning; often a form of local learning.</li>
          <li>
            It is <strong>lazy</strong>: “training” is storing the data; the work happens when a query arrives.
          </li>
          <li>
            The intuition: instances close by should be classified similarly. The similarity (distance) function is what takes the method beyond pure
            memorisation — it decides how to generalise to an unseen query.
          </li>
        </ul>
        <p>Week 1 used the same idea for regression (k-NN averaging). The ideas reappear in clustering.</p>
      </Sec>

      <Sec title="The rule">
        <p>Store all training examples <M t="(\bx_j, f(\bx_j))" />. Given a query <M t="\bx_q" />:</p>
        <ul>
          <li>
            <strong>1-NN</strong>: find the nearest training example <M t="\bx_n" /> and predict <M t="\hat f(\bx_q) = f(\bx_n)" />.
          </li>
          <li>
            <strong>k-NN classification</strong>: let <M t="N_k(\bx_q)" /> be the indices of the <M t="k" /> nearest training inputs and take a vote over
            the set <M t="V" /> of possible labels:
          </li>
        </ul>
        <MB t="\boxed{\;\hat y_q = \argmax_{v\in V}\sum_{j\in N_k(\bx_q)} \Ind[y_j = v]\;}" />
        <p>
          The indicator (also written <M t="\delta(v, f(\bx_j))" />) contributes 1 when neighbour <M t="j" /> has class <M t="v" />, else 0. For a
          real-valued target, take the mean of the neighbours’ values instead (Week 1). The query’s own unknown label plays no part in choosing its
          neighbours.
        </p>
        <Callout kind="example" title="A complete trace">
          Store <M t="(x, y) = (0, 0), (1, 0), (2, 1), (4, 0), (5, 1)" /> and query <M t="x_q = 2.8" />. Sort by distance:
          <Table
            head={['rank', 'x', 'y', 'distance from 2.8']}
            rows={[
              ['1', '2', '1', '0.8'],
              ['2', '4', '0', '1.2'],
              ['3', '1', '0', '1.8'],
              ['4', '5', '1', '2.2'],
              ['5', '0', '0', '2.8'],
            ]}
          />
          1-NN predicts 1. For 3-NN the labels are <M t="(1, 0, 0)" />: two votes for class 0, one for class 1, so the prediction becomes 0. The nearest
          single observation and the local majority need not agree.
        </Callout>
        <Lab title="Trace the vote" purpose="Drag the query. Ringed points are the k nearest; the readout counts their votes.">
          <KNNClassLab />
        </Lab>
        <TryThis
          items={[
            'In the 1-D trace, step k from 1 to 5 at x_q = 2.8: k = 1 gives 1; k = 2 and k = 4 are tied votes (broken towards the nearest point, so 1); k = 3 and k = 5 give 0. At k = 5 (= m) the answer is the overall majority whatever the query.',
            'Turn on distance weighting with k = 3. The near positive (weight 1.5625) now outweighs both negatives (0.6944 + 0.3086): the prediction flips back to 1 (lesson 16).',
            'Switch to 2-D data and shade the regions. Compare k = 1 (islands round single mislabelled points) with k = 9.',
            'With weighting on, drag the 1-D query exactly onto x = 2. The distance is 0 and 1/d² is undefined: an exact-match rule has to take over.',
          ]}
        />
      </Sec>

      <Sec title="Votes, averages and probability estimates">
        <p>
          Classification takes a vote over labels; regression takes the mean of numeric responses. Averaging 0/1 labels has a useful reading — the fraction
          of positive neighbours is a rough local estimate of the class probability:
        </p>
        <MB t="\hat P(Y = 1 \mid \bx_q) = \frac1k\sum_{j\in N_k(\bx_q)} \Ind[y_j = 1]." />
        <p>
          In the trace with <M t="k = 3" /> it is <M t="1/3" />. Such estimates have resolution <M t="1/k" /> — poor resolution —
          and are not automatically accurate population probabilities. A vote or a threshold still turns them into a label.
        </p>
      </Sec>

      <Sec title="Ties are part of the algorithm">
        <p>
          With two classes, an odd <M t="k" /> prevents a tied <em>vote</em> once exactly <M t="k" /> neighbours are selected. It does not prevent:
        </p>
        <ul>
          <li>ties in <em>distance</em> at the edge of the neighbourhood (which of two equidistant points is the k-th?);</li>
          <li>voting ties among three or more classes;</li>
          <li>duplicate inputs with conflicting labels.</li>
        </ul>
        <p>
          State a tie rule rather than silently picking the convenient answer. (This site breaks vote ties in favour of the nearest neighbour’s class, and
          equal distances by the order of the stored data.)
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l14.q1"
          q={<p>Stored (x, y): (1, 1), (3, 0), (4, 0), (6, 1), (7, 1). Query x = 3.6. What do 1-NN and 3-NN predict?</p>}
          options={[
            { text: '1-NN: 0; 3-NN: 0', correct: true, why: 'Distances 2.6, 0.6, 0.4, 2.4, 3.4. Nearest is x = 4 (label 0); the three nearest are 4, 3, 6 with labels 0, 0, 1.' },
            { text: '1-NN: 0; 3-NN: 1', why: 'The three nearest are x = 4, 3 and 6 (distance 2.4 < 2.6): two zeros.' },
            { text: '1-NN: 1; 3-NN: 0', why: 'x = 4 at distance 0.4 is nearest, not x = 1.' },
          ]}
        />
        <Quiz
          id="w2.l14.q2"
          q={<p>“Choosing an odd k removes every possible tie in k-NN.” Evaluate.</p>}
          options={[
            { text: 'True for any number of classes.', why: 'Three classes can split 1–1–1 with k = 3.' },
            { text: 'False: it prevents binary vote ties only, not equal-distance ties at the boundary or multi-class ties.', correct: true, why: 'A tie rule is still needed.' },
          ]}
        />
        <Quiz
          id="w2.l14.q3"
          q={<p>k-NN is “lazy”. What is actually learned?</p>}
          options={[
            { text: 'Nothing — there are no choices.', why: 'The representation, distance, k, voting rule and tie rule all shape the prediction function.' },
            { text: 'The stored data together with the representation, distance, k and voting rule define the prediction function.', correct: true, why: '“Lazy” means the computation happens at query time, not that there is no model.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        k-NN stores the training set and, for each query, takes a vote among the <M t="k" /> nearest examples:{' '}
        <M t="\hat y_q = \argmax_v\sum_{j\in N_k(\bx_q)}\Ind[y_j = v]" />. The nearest point and the local majority can disagree; the fraction of
        positive neighbours is a coarse probability estimate; and ties need an explicit rule.
      </Callout>

      <Checklist id="w2-knn" items={CHECKS2['w2-knn']} />
    </>
  );
}
