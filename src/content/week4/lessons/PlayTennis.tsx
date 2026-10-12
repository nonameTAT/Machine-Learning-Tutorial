import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../../components/ui';
import { TENNIS } from '../labs/data';
import { TennisGrowLab } from '../labs/GrowLab';

export default function PlayTennis() {
  return (
    <>
      <Sec title="The data">
        <p>
          Fourteen days, three weather attributes and a label: did we play tennis? (The same days as Week 3’s Naive Bayes example, without Temperature.) Day
          only names the row; it is not a predictor — lesson 7 shows what goes wrong if you treat it as one.
        </p>
        <Table
          className="num"
          head={['Day', 'Outlook', 'Humidity', 'Wind', 'Play']}
          rows={TENNIS.map((r) => [r.day, r.outlook, r.humidity, r.wind, <strong className={r.play === 'Yes' ? 'k-pos' : 'k-neg'}>{r.play}</strong>])}
        />
        <p>
          Nine Yes and five No, so <M t="H(S) = H\big(\tfrac{9}{14}\big) = 0.940286" /> bits.
        </p>
      </Sec>

      <Sec title="Choose the root">
        <p>Score every candidate with the same criterion, on the same 14 examples. Children are listed as (Yes, No).</p>
        <Table
          className="num"
          head={['Attribute', 'Children (Yes, No)', 'Expected H after', 'Gain']}
          rows={[
            ['Outlook', 'Sunny (2, 3) · Overcast (4, 0) · Rain (3, 2)', '0.693536', <strong>0.246750</strong>],
            ['Humidity', 'High (3, 4) · Normal (6, 1)', '0.788450', '0.151836'],
            ['Wind', 'Weak (6, 2) · Strong (3, 3)', '0.892159', '0.048127'],
          ]}
        />
        <Steps
          steps={[
            { title: 'Child entropies for Outlook', body: <MB t="H(2, 3) = H(3, 2) = 0.970951, \qquad H(4, 0) = 0." /> },
            { title: 'Weight by branch size', body: <MB t="\tfrac{5}{14}(0.970951) + \tfrac{4}{14}(0) + \tfrac{5}{14}(0.970951) = 0.693536." /> },
            { title: 'Subtract from the parent', body: <MB t="\operatorname{IG}(S, \text{Outlook}) = 0.940286 - 0.693536 = 0.246750." /> },
            { title: 'Compare and choose', body: <p>Outlook’s gain is the largest of the three: it becomes the root.</p> },
          ]}
        />
        <Callout kind="intuition" title="Why Outlook, in words">
          Outlook helps because its answers change what we know about the label: Overcast becomes certain, and Sunny and Rain become smaller problems. It is
          not chosen because it has three branches, nor because every child is pure — two of them are not.
        </Callout>
      </Sec>

      <Sec title="Recurse inside each branch">
        <p>Now each branch is its own problem, with its own counts.</p>
        <ul>
          <li>
            <strong>Overcast</strong> (D3, D7, D12, D13): four Yes. Pure — a leaf.
          </li>
          <li>
            <strong>Sunny</strong> (D1, D2, D8, D9, D11): 2 Yes, 3 No, <M t="H = 0.970951" />. Humidity gives High (0, 3) and Normal (2, 0) — both pure, so
            its gain is the full 0.970951. Wind gives (1, 2) and (1, 1): gain 0.019973. Choose Humidity.
          </li>
          <li>
            <strong>Rain</strong> (D4, D5, D6, D10, D14): 3 Yes, 2 No. Here it is the other way round: Wind gives Weak (3, 0) and Strong (0, 2), gain
            0.970951; Humidity only 0.019973. Choose Wind.
          </li>
        </ul>
        <Lab title="Grow PlayTennis yourself" purpose="Click a node to see every candidate test scored on that node’s examples, then split it — on the greedy choice or on anything else. “Grow greedily” runs ID3.">
          <TennisGrowLab />
        </Lab>
        <TryThis
          items={[
            'Grow greedily and check the tree against the reasoning above: Outlook, then Humidity under Sunny and Wind under Rain — five leaves, no training errors.',
            'Select the Sunny node. Its table uses only D1, D2, D8, D9 and D11, and its parent entropy is 0.971, not 0.940.',
            'Reset, split the root on Wind instead (not the greedy choice), then keep splitting each impure node on its highlighted test. You end with 8 leaves instead of 5: a poor early test makes the whole tree bigger.',
            'Split the root on Humidity and stop there. How many training days are misclassified? Each leaf predicts its majority.',
          ]}
        />
      </Sec>

      <Sec title="Read the tree as rules, and trace a prediction">
        <Table
          head={['IF', 'THEN Play =']}
          rows={[
            ['Outlook = Overcast', 'Yes'],
            ['Outlook = Sunny ∧ Humidity = High', 'No'],
            ['Outlook = Sunny ∧ Humidity = Normal', 'Yes'],
            ['Outlook = Rain ∧ Wind = Weak', 'Yes'],
            ['Outlook = Rain ∧ Wind = Strong', 'No'],
          ]}
        />
        <p>
          The rules read off an unmodified tree are <em>mutually exclusive</em> (each input satisfies at most one) and <em>exhaustive</em> (each input
          satisfies at least one). To classify (Rain, High, Weak): the root sends it to Rain; the Rain node tests Wind, not Humidity; Weak leads to{' '}
          <strong>Yes</strong>. The humidity value was supplied but never consulted — the path decides which features matter.
        </p>
        <Callout kind="warning" title="Zero training error is a claim about 14 days">
          The tree classifies all 14 training days correctly. That verifies the construction; it is not evidence of zero error on future days. Fitting the
          training data and generalising beyond it are different claims (lessons 10–12).
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>Why does the Sunny branch choose Humidity while the Rain branch chooses Wind?</p>}
          options={[
            { text: 'Each branch scores the candidates on its own examples, and in each subset a different attribute separates the classes', correct: true, why: 'Locality: the gains are recomputed inside every node.' },
            { text: 'Because Humidity was used up in the Sunny branch', why: 'Using an attribute on one path does not remove it from other paths.' },
            { text: 'By the tie-break rule', why: 'There is no tie: 0.971 against 0.020 in both branches.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>The tree never tests Humidity on Rain days. What does that show?</p>}
          options={[
            { text: 'Humidity has no effect on whether we play when it rains', why: 'Five training days cannot establish that; the tree only found that Wind separated these five.' },
            { text: 'Among the five Rain training days, Wind already separated the labels, so Humidity was not needed there', correct: true, why: 'A modest statement about the sample, not a law of weather.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>How many attribute values does the tree look at to classify (Overcast, High, Strong)?</p>}
          options={[
            { text: 'One — Outlook = Overcast leads straight to a leaf', correct: true, why: 'Prediction follows a single path.' },
            { text: 'Three — every attribute is used in every prediction', why: 'That is Naive Bayes (Week 3), not a tree.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        ID3 on PlayTennis: score every attribute on the current examples, split on the largest gain, recurse with local counts. Outlook (0.247) becomes the
        root; Humidity separates the Sunny days and Wind the Rain days. The result is five mutually exclusive rules that fit the 14 days exactly — a
        statement about the training data, not yet about the future.
      </Callout>
    </>
  );
}
