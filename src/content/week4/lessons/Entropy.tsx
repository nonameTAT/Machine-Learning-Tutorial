import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../../components/ui';
import { EntropyLab } from '../labs/EntropyLab';

export default function Entropy() {
  return (
    <>
      <Sec title="What should “mixed” mean?">
        <p>
          To choose a test, we need to say how much it helps. Start with a single node. Imagine drawing one training example from it at random: you know which
          node it reached, but not its label. If every label at the node is Yes, there is nothing to guess. If half are Yes and half No, you are as unsure as
          you can be. We want a number that is 0 for a pure node, largest when the classes are balanced, and that treats the classes symmetrically.
        </p>
        <p>
          A natural way to build it: measure how <em>surprising</em> each outcome is, then average. Seeing a class that makes up 90% of the node is barely
          surprising; seeing one that makes up 1% is very surprising. The quantity
        </p>
        <MB t="\text{surprise}(j) = -\log_2 p_j" />
        <p>
          is 0 when <M t="p_j = 1" /> and grows as <M t="p_j" /> shrinks. The logarithm is what makes surprises of independent events add up:{' '}
          <M t="-\log_2(pq) = -\log_2 p - \log_2 q" />. Base 2 measures it in <strong>bits</strong>: one bit is the surprise of a fair coin flip.
        </p>
      </Sec>

      <Sec title="Entropy is expected surprise">
        <p>
          Let the node hold <M t="n" /> examples, <M t="n_j" /> of them in class <M t="j" />, and write <M t="p_j = n_j / n" /> (a fraction between 0 and 1,
          not a percentage). Averaging the surprise over the class distribution gives the <strong>entropy</strong>
        </p>
        <MB t="H(S) = \sum_{j=1}^{k} p_j\,(-\log_2 p_j) = -\sum_{j=1}^{k} p_j \log_2 p_j," />
        <p>
          with the convention <M t="0 \log_2 0 = 0" /> (the limit of <M t="p \log p" /> as <M t="p \to 0" />: a class that never appears contributes
          nothing). With two classes and positive proportion <M t="p" />, this is <M t="H(p) = -p\log_2 p - (1 - p)\log_2(1 - p)" />.
        </p>
        <Callout kind="intuition" title="Entropy as a guessing game">
          Suppose the classes have probabilities ½, ¼, ¼. Ask “is it class 1?” — half the time you are done after one question; otherwise ask “is it class
          2?”. On average you need <M t="\tfrac12 \cdot 1 + \tfrac14 \cdot 2 + \tfrac14 \cdot 2 = 1.5" /> yes/no questions, and{' '}
          <M t="H = 1.5" /> bits. With four equally likely classes, two questions are always needed: <M t="H = \log_2 4 = 2" />. Entropy is the average
          length of an ideal code for the label — an average over many labels, not a claim that one label uses a fractional number of bits.
        </Callout>
        <Lab title="Counts → proportions → entropy" purpose="Set the class counts at a node. Each class’s bar shows its proportion and its contribution −p log₂ p; the contributions add up to H.">
          <EntropyLab />
        </Lab>
        <TryThis
          items={[
            'Two classes, counts (9, 5): H = 0.940 bits — the PlayTennis root. Then (3, 3) gives 1, and (6, 0) gives 0.',
            'Double both counts to (18, 10). Nothing changes: entropy depends on proportions, not on how many examples there are.',
            'Watch the contribution of a rare class: its surprise is large but its weight p is small, so the product −p log₂ p is small too.',
            'Three classes with equal counts: H = log₂ 3 ≈ 1.585, the maximum for three classes.',
          ]}
        />
        <Table
          head={['Class counts', 'Entropy', 'Reading']}
          rows={[
            ['(6, 0)', '0', 'no uncertainty'],
            ['(3, 3)', '1 bit', 'maximal for two classes'],
            ['(9, 5)', '0.9403 bits', 'mixed, mild majority'],
            ['(29, 35)', '0.9937 bits', 'nearly balanced'],
          ]}
        />
      </Sec>

      <Sec title="Verify the shape">
        <Steps
          intro={<p>Why is <M t="H(p)" /> largest at <M t="p = \tfrac12" />, and only there? Differentiate on <M t="0 < p < 1" />.</p>}
          steps={[
            {
              title: 'First derivative',
              body: (
                <MB t="H'(p) = -\log_2 p - \tfrac{1}{\ln 2} + \log_2(1 - p) + \tfrac{1}{\ln 2} = \log_2\frac{1 - p}{p}." />
              ),
            },
            { title: 'Stationary point', body: <p><M t="H'(p) = 0 \iff \frac{1 - p}{p} = 1 \iff p = \tfrac12" />, where <M t="H = 1" />.</p> },
            {
              title: 'Second derivative',
              body: <MB t="H''(p) = \frac{1}{\ln 2}\Big(-\frac{1}{1 - p} - \frac{1}{p}\Big) = -\frac{1}{\ln 2\; p(1 - p)} < 0." />,
            },
            {
              title: 'Conclude',
              body: (
                <p>
                  <M t="H" /> is strictly concave, so the stationary point is the unique maximum; at the ends <M t="H(0) = H(1) = 0" />. Binary entropy lies in{' '}
                  <M t="[0, 1]" />. With <M t="k" /> classes the range is <M t="[0, \log_2 k]" />, the maximum reached only at equal proportions.
                </p>
              ),
            },
          ]}
        />
        <Callout kind="note" title="A connection to Week 2">
          <M t="H(p)" /> is the average log loss (in bits) of predicting probability <M t="p" /> for labels that really occur with proportion{' '}
          <M t="p" />. A pure node lets you predict with certainty at no loss; a balanced node costs one bit per label even with the best constant prediction.
        </Callout>
        <Callout kind="warning" title="Two kinds of “variability”">
          High entropy means the <em>labels</em> are evenly spread over classes. It says nothing about how spread out the <em>feature values</em> are: a node
          can be perfectly pure while its examples have wildly different inputs. And entropy ignores sample size: (1, 1) and (50, 50) both have entropy 1,
          though we trust the second far more. That matters later, when tiny leaves look pure by chance.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>A three-class node has counts (4, 4, 0). What is its entropy?</p>}
          options={[
            { text: '1 bit', correct: true, why: 'Two equally likely classes; the empty class contributes 0 log 0 = 0.' },
            { text: 'log₂ 3 ≈ 1.585 bits', why: 'That needs all three classes equally likely.' },
            { text: 'Undefined, because of log 0', why: 'By the convention 0 log 0 = 0, the empty class simply contributes nothing.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>Which node is more uncertain: counts (9, 1) or (1, 9)?</p>}
          options={[
            { text: 'They are equally uncertain', correct: true, why: 'Entropy is symmetric in the classes: both are H(0.1) ≈ 0.469.' },
            { text: '(9, 1), because most labels are positive', why: 'Which class is the majority does not matter, only how lopsided the split is.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>Nodes with counts (2, 2) and (200, 200) have…</p>}
          options={[
            { text: 'the same entropy, 1 bit', correct: true, why: 'Entropy depends only on proportions.' },
            { text: 'different entropies: more data means less uncertainty', why: 'More data makes us more confident in the proportion, but the proportion — and so H — is the same.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Entropy <M t="H(S) = -\sum_j p_j \log_2 p_j" /> is the expected surprise of the label of an example drawn from a node: 0 for a pure node, maximal
        (<M t="\log_2 k" />) when the classes are equally frequent, concave in between. It depends only on the class proportions at the node.
      </Callout>
    </>
  );
}
