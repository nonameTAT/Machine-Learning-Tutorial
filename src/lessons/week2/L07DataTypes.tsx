import { M } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { CategoryCodeLab, ClockLab } from '../../interactives/week2/EncodingLab';
import { CHECKS2 } from './checks';

export default function L07DataTypes() {
  return (
    <>
      <Sec title="A model sees a representation, not the world">
        <p>
          Machine-learning algorithms generally need inputs in numeric form. The first split is <strong>numerical</strong> (anything
          represented by numbers) versus <strong>categorical</strong> (discrete labelled groups). But storing a category as a number does not give it
          numeric meaning: a model that subtracts, averages or measures distances will treat the codes as if order and gaps were real.
        </p>
        <p>
          This matters for both families this week. Logistic regression adds <M t="\beta_rx_r" /> into a score, so it uses differences and order. A
          distance-based classifier adds up coordinate differences. In both, the representation decides which decision rules are even possible —
          good optimisation cannot rescue a misleading one.
        </p>
      </Sec>

      <Sec title="A finer taxonomy">
        <Table
          head={['Kind', 'What the values mean', 'Consequence for modelling']}
          rows={[
            ['Irrelevant', 'may be strings or numbers but has no relationship with the outcome (participant name or ID)', 'adds noise to distances and chances to overfit; remove it'],
            ['Nominal', 'categories with no numerical relationship (animal type, colour, nationality)', 'use a representation or matching rule that invents no order'],
            ['Binary', 'exactly two possibilities (cancerous / non-cancerous)', 'an indicator is natural; keep predictor indicators distinct from the target label'],
            ['Ordinal', 'can be ranked, but distances between ranks are not defined (students ranked by GPA)', 'order is real; equal gaps are an extra assumption'],
            ['Count', 'whole numbers ≥ 0', 'differences are meaningful (“two more events”)'],
            ['Time', 'cyclical, repeating (time of day, day of week)', 'raw subtraction ignores the wrap-around'],
            ['Interval', 'differences are measurable on a scale (temperature, income)', 'differences can be used; ratios need not mean anything (20 °C is not “twice” 10 °C)'],
          ]}
        />
        <p className="small muted">
          “Irrelevant” describes usefulness for a task rather than a measurement scale, so the categories can overlap: a binary attribute may also be
          irrelevant.
        </p>
      </Sec>

      <Sec title="Three short examples">
        <p>
          <strong>Nominal codes.</strong> Red = 1, green = 2, blue = 3 does not make red closer to green than to blue. For simple nominal matching, the
          distance contribution is 0 for a match and 1 for a mismatch. Week 1’s indicator (one-hot) features are another honest
          representation.
        </p>
        <Lab title="Codes invent distances" purpose="Pick a different, equally arbitrary coding of the same three colours and see which colour is “nearest” to red.">
          <CategoryCodeLab />
        </Lab>
        <p>
          <strong>Ordinal values.</strong> Rankings first, second, third tell you the order but not whether the performance gaps between them are equal.
          Feeding ranks in as equally spaced numbers is an additional modelling assumption.
        </p>
        <p>
          <strong>Cyclic time.</strong> At midnight, 23:00 and 01:00 are two hours apart, but subtracting the raw hour codes gives 22. The meaning of
          “nearby” has to come before the distance formula.
        </p>
        <Lab title="Time goes round" purpose="Two times on a 24-hour clock: compare raw subtraction with the distance round the clock.">
          <ClockLab />
        </Lab>
        <TryThis
          items={[
            'Set a = 23, b = 1: raw 22, round the clock 2. Which one should a nearest-neighbour method use?',
            'Set a = 6, b = 18. Both measures say 12: the farthest two times can be.',
            'A postcode is stored as an integer. Does |postcode₁ − postcode₂| measure geographic distance?',
          ]}
        />
      </Sec>

      <Callout kind="warning">
        Numeric storage is a fact about the file, not about the quantity. Before using any feature in a sum, a score or a distance, ask what subtraction
        and ordering mean for it.
      </Callout>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l7.q1"
          q={<p>Which data type is “day of the week”?</p>}
          options={[
            { text: 'Interval', why: 'Differences along a line ignore the wrap from Sunday to Monday.' },
            { text: 'Time (cyclic)', correct: true, why: 'Time is a cyclical, repeating form of data.' },
            { text: 'Count', why: 'It is not a count of events.' },
          ]}
        />
        <Quiz
          id="w2.l7.q2"
          q={<p>“The labels red = 1, green = 2, blue = 3 establish meaningful Euclidean distances between colours.” Evaluate.</p>}
          options={[
            { text: 'True: the numbers define the distances.', why: 'They define some distances — arbitrary ones. A different coding gives different “facts”.' },
            { text: 'False: the coding is arbitrary; use matching distance or indicator features for a nominal attribute.', correct: true, why: 'Relabelling the categories would change the distances without changing the colours.' },
          ]}
        />
        <Quiz
          id="w2.l7.q3"
          q={<p>A dataset includes each participant’s ID number. What type is it, and what should you do?</p>}
          options={[
            { text: 'Count — keep it as a numeric feature.', why: 'An ID counts nothing.' },
            { text: 'Irrelevant — remove it before learning.', correct: true, why: 'It can only add noise (or leak information about how the data were collected).' },
            { text: 'Ordinal — it ranks the participants.', why: 'The order of IDs has no relationship with the outcome.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A model operates on a representation. Nominal, ordinal, count, cyclic-time and interval features support different operations, and storing any of
        them as numbers does not make subtraction meaningful. Choose encodings and distances that respect what the values mean, and drop irrelevant
        attributes.
      </Callout>

      <Checklist id="w2-datatypes" items={CHECKS2['w2-datatypes']} />
    </>
  );
}
