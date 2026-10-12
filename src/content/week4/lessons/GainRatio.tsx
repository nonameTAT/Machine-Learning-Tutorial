import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Table, TryThis } from '../../../components/ui';
import { GainRatioLab } from '../labs/GainRatioLab';
import { TennisGrowLab } from '../labs/GrowLab';

export default function GainRatio() {
  return (
    <>
      <Sec title="The memorisation trap">
        <p>
          Give every example a unique identifier and offer it as an attribute. Splitting on the ID puts each example in its own branch; every branch is pure;
          so the gain equals the whole parent entropy — the largest gain possible. Yet the test is useless: a new example has a new ID, which no branch has
          seen, and the tree has learned no relationship between inputs and labels.
        </p>
        <p>
          The ID is the extreme case of a general tendency. The more values an attribute has, the smaller its branches, and small branches are often pure by
          chance. Information gain rewards that fine division even when it reflects nothing stable. So we want to account for <em>how finely</em> a test
          divides the examples, separately from how well it separates the labels.
        </p>
      </Sec>

      <Sec title="Split entropy and gain ratio">
        <p>
          Let <M t="q_v = |S_v| / |S|" /> be the probability of taking branch <M t="v" />. The <strong>split entropy</strong> (also called split
          information) is the entropy of <em>which branch</em> an example takes:
        </p>
        <MB t="\operatorname{SplitH}(S, A) = -\sum_{v \in \mathcal V_A} q_v \log_2 q_v, \qquad \operatorname{GR}(S, A) = \frac{\operatorname{IG}(S, A)}{\operatorname{SplitH}(S, A)}." />
        <p>
          Both are entropies, but of different distributions: the gain concerns <em>labels</em>, the denominator only <em>branch membership</em>. A test with{' '}
          <M t="b" /> equally sized branches has split entropy <M t="\log_2 b" />, so gain ratio divides by a penalty that grows with the number of branches.
        </p>
        <Table
          head={['8 examples, 4+ / 4−', 'Gain', 'Split entropy', 'Gain ratio']}
          rows={[
            ['unique ID (8 singletons)', '1', <M t="\log_2 8 = 3" />, '1/3'],
            ['useful binary test (4+ | 4−)', '1', '1', '1'],
          ]}
        />
        <p>Raw gain ties the two. Gain ratio prefers the binary test: the same label information from a much coarser partition.</p>
        <Lab title="Design a test" purpose="Eight examples: circles positive, squares negative. Click an example to move it to another branch, or pick a candidate. Gain looks inside the branches; split entropy only counts them.">
          <GainRatioLab />
        </Lab>
        <TryThis
          items={[
            'Unique ID versus useful binary: equal gain, gain ratio 1/3 against 1.',
            'Compare “one tiny pure branch” with “balanced, impure”. Gain prefers the balanced split (0.189 vs 0.138); gain ratio prefers the tiny one (0.254 vs 0.189), because its split entropy is only 0.544. A small denominator inflates the ratio.',
            '“No split” puts everything in one branch: gain 0, split entropy 0, gain ratio 0/0 — undefined, not zero. Such a test is simply not a candidate.',
            'Build your own test with three branches that still separates the classes perfectly. How does its gain ratio compare with the binary test’s?',
          ]}
        />
      </Sec>

      <Sec title="A surprise on PlayTennis">
        <p>
          Now let the row identifier Day compete at the root of PlayTennis. Its gain is the full <M t="0.940" />; its split entropy is{' '}
          <M t="\log_2 14 = 3.807" />; so its gain ratio is <M t="0.247" />. Outlook’s gain ratio is only <M t="0.2467 / 1.5774 = 0.156" />.
        </p>
        <Lab title="PlayTennis with Day as a candidate" purpose="The same grower as lesson 6, now with the identifier among the candidates and both criteria shown.">
          <TennisGrowLab withDay initialCriterion="ratio" />
        </Lab>
        <TryThis
          items={[
            'At the root, compare the gain and gain-ratio columns. Day wins under both.',
            'A common safeguard (used by C4.5) considers only tests whose gain is at least the average gain of all candidates. The average here is 0.347, and only Day reaches it — so Day still wins.',
            'Turn Day off: gain ratio now picks Outlook, as gain did. The fix for identifiers is to remove them, not to hope a score will reject them.',
          ]}
        />
        <Callout kind="warning" title="No training-set score can see that an ID won’t generalise">
          Every criterion computed from training counts sees fourteen perfectly pure branches. Gain ratio weakens the preference for many values; it does not
          eliminate it. Identifiers, timestamps used as categories and similar fields must be excluded by the analyst, and validation (lesson 12) remains the
          real test.
        </Callout>
      </Sec>

      <Sec title="Boundaries and limits">
        <ul>
          <li>If all examples take one branch, split entropy and gain are both 0: the ratio is undefined. Treat such a test as unavailable.</li>
          <li>A very unbalanced split has a tiny split entropy, which can make a weak test look attractive (the “tiny pure branch” above).</li>
          <li>Gain ratio corrects the preference for many branches; it does not guarantee good generalisation or a globally optimal tree.</li>
        </ul>
        <Callout kind="note" title="Three quantities to keep apart">
          <strong>Parent entropy</strong>: how mixed the labels are. <strong>Information gain</strong>: how much the test reduces that mixing.{' '}
          <strong>Split entropy</strong>: how finely the test divides the examples, regardless of their labels.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>Split entropy depends on…</p>}
          options={[
            { text: 'only the sizes of the branches', correct: true, why: 'It is the entropy of branch membership; labels play no part.' },
            { text: 'the class proportions inside each branch', why: 'That is what the gain measures.' },
            { text: 'both', why: 'Gain ratio combines both; split entropy alone uses sizes.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>A test splits 16 examples into four branches of 4. What is its split entropy?</p>}
          options={[
            { text: '2 bits', correct: true, why: 'Four equal branches: log₂ 4 = 2.' },
            { text: '4 bits', why: 'The number of branches is 4, but the entropy of four equal outcomes is log₂ 4.' },
            { text: 'It depends on the labels', why: 'Split entropy ignores labels.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>On PlayTennis with Day included, which attribute does gain ratio choose at the root?</p>}
          options={[
            { text: 'Outlook — gain ratio exists to block identifiers', why: 'It weakens the preference, but here 0.247 still beats 0.156.' },
            { text: 'Day, with gain ratio 0.247', correct: true, why: 'The identifier must be removed by hand.' },
            { text: 'Humidity', why: 'Its ratio is 0.152, below both.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Information gain favours tests with many small branches, which can be pure by accident. Gain ratio divides the gain by the split entropy — the
        entropy of branch sizes — to penalise fine partitions. It reduces the bias but cannot remove it (Day still wins on PlayTennis), can be inflated by
        very unbalanced splits, and is undefined when a test does not split at all.
      </Callout>
    </>
  );
}
