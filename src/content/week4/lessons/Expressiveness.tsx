import { M, MB } from '../../../components/Math';
import { Callout, Lab, Quiz, Sec, Steps, TryThis } from '../../../components/ui';
import { BooleanTreeLab } from '../labs/BooleanTreeLab';

export default function Expressiveness() {
  return (
    <>
      <Sec title="Build the tree by fixing one variable at a time">
        <p>
          Before asking how a tree is <em>learned</em>, ask what it can <em>express</em>. Boolean functions are the cleanest test case: inputs A, B, C, D take
          the values t or f, and the label is True or False. How would you draw a tree for <M t="A \wedge \neg B" /> without guessing its shape?
        </p>
        <p>
          Pick a variable and substitute both of its values. Each substitution leaves a simpler formula. If a formula has become a constant, that branch is a
          leaf; otherwise repeat with the next variable. This is exactly what a tree does: each test fixes one variable, and each subtree computes what is
          left of the function.
        </p>
        <Steps
          steps={[
            {
              title: <>Test A in <M t="A \wedge \neg B" /></>,
              body: <p>A = f makes the whole conjunction False — a leaf. A = t leaves <M t="\neg B" />, which still depends on B.</p>,
            },
            {
              title: <>Test B under A = t</>,
              body: <p>B = t gives False, B = f gives True. Done: two tests, three leaves.</p>,
            },
            {
              title: <>Now <M t="A \vee (B \wedge C)" /></>,
              body: <p>A = t already makes it True — stop on that branch. A = f leaves <M t="B \wedge C" />: test B (f → False), then C under B = t.</p>,
            },
            {
              title: <>Now <M t="A \oplus B" /> (XOR)</>,
              body: <p>Fixing A settles nothing: A = t leaves <M t="\neg B" />, A = f leaves <M t="B" />. Both branches must test B — four leaves.</p>,
            },
            {
              title: <>Finally <M t="(A \wedge B) \vee (C \wedge D)" /></>,
              body: (
                <p>
                  A = t, B = t gives True. But A = f, and also A = t with B = f, both leave <M t="C \wedge D" />. A tree cannot share a subtree between
                  branches, so the C–D subtree is drawn twice.
                </p>
              ),
            },
          ]}
        />
        <Lab title="Trees for Boolean functions" purpose="Choose a function. The tree is built by fixing variables in the order shown; reorder them and compare the size.">
          <BooleanTreeLab />
        </Lab>
        <TryThis
          items={[
            'A ∨ (B ∧ C): C is tested on only one path. Short-circuiting functions (AND, OR) can stop as soon as the answer is settled.',
            'A XOR B: every order gives four leaves, and both variables appear on every path.',
            '(A ∧ B) ∨ (C ∧ D): find the order with the fewest leaves and one with more. Variable order changes the size, not the function.',
            'Parity of 3 and of 4 variables: 8 and 16 leaves, whatever the order. Each extra variable doubles the tree.',
          ]}
        />
      </Sec>

      <Sec title="What makes a tree large?">
        <p>
          The size of a tree reflects the <em>structure</em> of the function, not the length of its formula. For AND and OR, many inputs are decided by a
          single variable, so paths end early. For XOR and parity, no proper subset of the variables decides anything: flip any one input and the output
          flips. So every path must test every variable, and parity of <M t="n" /> inputs needs <M t="2^n" /> leaves.
        </p>
        <p>
          Two further costs come from the tree form itself. Subtrees cannot be shared, so a formula like <M t="(A \wedge B) \vee (C \wedge D)" /> repeats
          a piece. And different variable orders give different sizes; finding the smallest tree for a given function or dataset is computationally hard in
          general (NP-hard), which is one reason learners build trees greedily rather than searching for the optimum.
        </p>
      </Sec>

      <Sec title="Every Boolean function has a tree">
        <Callout kind="theorem" title="Representational completeness">
          Every Boolean function of <M t="n" /> variables is computed by some decision tree of depth at most <M t="n" />.
        </Callout>
        <p>
          <strong>Proof by induction on n.</strong> For <M t="n = 0" /> the function is a constant: a single leaf. For <M t="n \ge 1" />, test{' '}
          <M t="x_1" />. The restrictions
        </p>
        <MB t="f_t(x_2, \dots, x_n) = f(\text{t}, x_2, \dots, x_n), \qquad f_f(x_2, \dots, x_n) = f(\text{f}, x_2, \dots, x_n)" />
        <p>
          are functions of <M t="n - 1" /> variables, so by the induction hypothesis each has a tree of depth at most <M t="n - 1" />. Hang them under the
          two branches of the <M t="x_1" /> test: the result computes <M t="f" /> and has depth at most <M t="n" />. ∎
        </p>
        <p>
          The same argument works for any finite number of categorical attributes with finitely many values each: test every attribute in turn, and every
          complete path identifies one input combination, whose leaf can hold any label.
        </p>
        <Callout kind="warning" title="Can represent ≠ will learn">
          Completeness says a suitable tree <em>exists</em>. It does not say a greedy learner will find it (lesson 9), that the data determine it (only the
          observed input combinations constrain the leaves), or that contradictory examples — identical inputs with different labels — can all be classified
          correctly (lesson 11).
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="q1"
          q={<p>In the tree for A ∨ (B ∧ C) built in the order A, B, C, on how many root-to-leaf paths is C tested?</p>}
          options={[
            { text: 'One: only when A = f and B = t', correct: true, why: 'A = t ends at True; A = f with B = f ends at False.' },
            { text: 'Two', why: 'B = f already makes B ∧ C False.' },
            { text: 'Four — every variable appears on every path', why: 'That holds for XOR and parity, not for OR/AND.' },
          ]}
        />
        <Quiz
          id="q2"
          q={<p>Why does parity of four variables need 16 leaves in every variable order?</p>}
          options={[
            { text: 'Because 4 variables always give 16 leaves', why: 'A ∧ B ∧ C ∧ D needs only 5 leaves.' },
            {
              text: 'A leaf reached without testing some variable would be wrong for one of its values, since flipping any input flips the output — so every leaf sits at depth 4',
              correct: true,
              why: 'All 2⁴ paths are complete, one per input combination.',
            },
            { text: 'Because the greedy learner picks a bad order', why: 'No order helps; this is about representation, not learning.' },
          ]}
        />
        <Quiz
          id="q3"
          q={<p>“Trees can represent every Boolean function, so a tree learner always reaches zero training error.” Evaluate.</p>}
          options={[
            { text: 'True', why: 'Representation does not remove contradictory training labels, and a learner that stops early may not find the tree.' },
            { text: 'False: identical inputs with different labels cannot both be predicted correctly, and the search may stop early', correct: true, why: 'Lessons 9 and 11 make both failures concrete.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A tree for a Boolean function is built by fixing one variable at a time until what remains is constant. Every Boolean function has such a tree, of
        depth at most n — but size depends on structure: AND and OR stop early, XOR and parity need every variable on every path, and repeated subformulas
        are duplicated because branches cannot share subtrees.
      </Callout>
    </>
  );
}
