import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, TryThis } from '../../../components/ui';
import { ConflictLab, WorstCaseLab } from '../labs/ConflictLab';

export default function Conflicts() {
  return (
    <>
      <Sec title="Identical inputs share a leaf">
        <p>
          “An unpruned tree fits its training data perfectly” sounds like a law. It is not. A tree that tests only the attributes A, B and C sends every
          example with the same values of (A, B, C) to the same leaf, and a leaf makes one prediction. If two such examples carry different labels, at least
          one of them is misclassified — by <em>every</em> tree on these attributes, however deep.
        </p>
        <p>
          Consider twelve training examples with binary attributes A, B, C and label Y, grouped by input tuple:
        </p>
        <Lab title="Unavoidable errors" purpose="Each row is one input tuple with its count of Y = 0 and Y = 1. Change the counts and watch the minimum possible training error.">
          <ConflictLab />
        </Lab>
        <p>
          The tuples (0, 1, 1) and (1, 1, 1) each hold one example of each label. Whatever their leaves predict, one example in each is wrong, so at least
          two errors are unavoidable. A tree that tests A, then B, then C gives every tuple its own leaf; labelling each leaf by majority makes exactly those
          two errors. So the fully grown, unpruned tree has training error <strong>2 out of 12</strong>, or <M t="1/6" /> — there is no attribute left to
          separate the conflicting pairs.
        </p>
        <p>In general, if input tuple <M t="g" /> has <M t="n_g" /> examples with class counts <M t="n_{g,1}, \dots, n_{g,k}" />, the fewest errors any tree on these attributes can make is</p>
        <MB t="E_{\min} = \sum_g \big(n_g - \max_j n_{g,j}\big)." />
        <TryThis
          items={[
            'Add one more Y = 0 example to (0, 1, 1). The tuple still contributes one error: the majority is now 0, and the single 1 is wrong.',
            'Make (1, 1, 1) hold two of each label: it alone now forces two errors.',
            'Remove the conflicts and E_min drops to 0 — only then can an unpruned tree be perfect.',
          ]}
        />
        <Callout kind="warning" title="E_min is a floor, not a forecast">
          The formula counts disagreement <em>within identical inputs</em>. A tree that stops early, or merges tuples into the same leaf, can make more errors
          than <M t="E_{\min}" />. And conflicting labels are information: they show that A, B and C do not determine Y — there is noise, or a missing
          feature.
        </Callout>
      </Sec>

      <Sec title="The worst case with k classes">
        <p>
          How bad can a tree’s training error be, for <em>any</em> dataset with <M t="k" /> classes? Look at one leaf at a time.
        </p>
        <Steps
          steps={[
            { title: 'One leaf', body: <p>A leaf with <M t="m" /> examples spread over <M t="k" /> classes has a largest class with at least <M t="m/k" /> examples (they cannot all be below the average).</p> },
            { title: 'Errors at that leaf', body: <p>The leaf predicts that majority class, so it misclassifies at most <M t="m - m/k = m(1 - 1/k)" /> examples.</p> },
            { title: 'Add up the leaves', body: <MB t="\text{training errors} \le \sum_{\text{leaves}} m_\ell\Big(1 - \frac1k\Big) = n\Big(1 - \frac1k\Big) \;\Rightarrow\; \text{error fraction} \le 1 - \frac1k." /> },
            {
              title: 'The bound is attained',
              body: (
                <p>
                  Give all examples exactly the same input values and spread the labels evenly over the <M t="k" /> classes. No test can separate them; the
                  single leaf gets <M t="1/k" /> of them right. For <M t="k = 3" /> the error is <M t="2/3" />; for <M t="k = 2" />, <M t="1/2" />.
                </p>
              ),
            },
          ]}
        />
        <Lab title="All inputs identical" purpose="Every example has the same attribute values, so all share one leaf. The leaf predicts the largest class.">
          <WorstCaseLab />
        </Lab>
        <p>
          For a fixed number of examples <M t="n" />, the exact worst case is <M t="(n - \lceil n/k\rceil)/n" />, reached by making the class counts as equal
          as integers allow; it equals <M t="1 - 1/k" /> when <M t="k" /> divides <M t="n" />.
        </p>
        <Callout kind="note" title="State the assumption">
          The bound assumes every leaf predicts its majority class, with all errors costing the same. It is not a bound on a deliberately perverse classifier,
          and the word “unpruned” does nothing to remove conflicting labels.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>One input tuple appears five times, with labels 0, 0, 1, 1, 1. How many of these five must any tree misclassify?</p>}
          options={[
            { text: '2', correct: true, why: 'The best single prediction for the tuple is 1, which gets three right.' },
            { text: '3', why: 'Predicting 0 would cost 3, but the majority prediction costs only 2.' },
            { text: '0, if the tree is deep enough', why: 'No test can separate identical inputs.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>With k = 4 classes, what is the largest training error fraction a majority-leaf tree can have on any dataset?</p>}
          options={[
            { text: '3/4', correct: true, why: '1 − 1/k, reached when every example has the same inputs and the labels are spread evenly.' },
            { text: '1/2', why: 'That is the two-class bound.' },
            { text: '1', why: 'The majority class is always right on at least 1/k of a leaf.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>When does growing a tree without limit guarantee zero training error?</p>}
          options={[
            { text: 'Always', why: 'Conflicting labels on identical inputs make it impossible.' },
            { text: 'Exactly when no two training examples with identical inputs have different labels', correct: true, why: 'Then each distinct input can get its own correct leaf.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A tree can only separate examples whose inputs differ. Identical inputs with different labels force <M t="E_{\min} = \sum_g (n_g - \max_j n_{g,j})" />{' '}
        errors on any tree — 2 of 12 in the classic table. With k classes and majority leaves, training error can never exceed <M t="1 - 1/k" />, and that
        bound is reached when all inputs coincide and the labels are spread evenly.
      </Callout>
    </>
  );
}
