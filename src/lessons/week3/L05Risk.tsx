import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { RiskLab } from '../../interactives/week3/RiskLab';
import { CHECKS3 } from './checks';

export default function L05Risk() {
  return (
    <>
      <Sec title="Probabilities describe uncertainty; losses describe consequences">
        <p>
          So far: decide <M t="h_1" /> if <M t="P(h_1 \mid D) > P(h_2 \mid D)" />. But a posterior does not by itself say which <em>action</em> is
          best. What if misclassifying a patient who has cancer as “not cancer” costs ten times as much as the reverse mistake?
        </p>
        <p>
          Let <M t="L(a, c)" /> be the loss of taking action <M t="a" /> when the truth is <M t="c" />. The <strong>conditional risk</strong> — the
          posterior expected loss — of an action is
        </p>
        <MB t="R(a \mid x) = \sum_c L(a, c)\,P(c \mid x), \qquad a^*(x) = \argmin_a R(a \mid x)." />
        <p>The optimal Bayesian decision minimises expected loss. When every mistake costs the same, this reduces to MAP (proved below).</p>
      </Sec>

      <Sec title="Worked example: the positive test again">
        <Table
          head={['action ↓ / truth →', 'cancer', 'not cancer']}
          rows={[
            ['predict cancer', '0', '1'],
            ['predict not cancer', '10', '0'],
          ]}
        />
        <p>
          Rows are actions, columns the unknown truth. For each row, weight each entry by the posterior of its column (from lesson 4, 0.2085 and 0.7915) and
          sum:
        </p>
        <MB t="R(\text{cancer} \mid +) = 0 \times 0.2085 + 1 \times 0.7915 = 0.7915, \qquad R(\text{not cancer} \mid +) = 10 \times 0.2085 + 0 = 2.085." />
        <p>
          The minimum-risk action is now <strong>predict cancer</strong>, although its posterior is the smaller one. The posterior did not change; the
          objective did.
        </p>
        <Callout kind="note" title="A shortcut">
          You can compare <M t="0.02976" /> with <M t="0.0784" /> — the risks computed with <em>unnormalised</em> scores. That is valid because both
          actions share the same evidence denominator; the true expected losses are 0.7915 and 2.085.
        </Callout>
      </Sec>

      <Sec title="Derive the threshold instead of memorising it">
        <Steps
          intro={
            <p>
              Two classes, <M t="p = P(c_1 \mid x)" />, zero loss for correct predictions, cost <M t="C_{\text{FP}}" /> for predicting <M t="c_1" /> wrongly
              and <M t="C_{\text{FN}}" /> for missing <M t="c_1" />.
            </p>
          }
          steps={[
            { title: 'Risk of each action', body: <MB t="R(c_1 \mid x) = C_{\text{FP}}(1 - p), \qquad R(c_2 \mid x) = C_{\text{FN}}\,p." /> },
            {
              title: 'Choose c₁ when its risk is smaller',
              body: <MB t="C_{\text{FP}}(1 - p) < C_{\text{FN}}\,p \iff \boxed{\;p > \frac{C_{\text{FP}}}{C_{\text{FP}} + C_{\text{FN}}}\;}" />,
            },
            {
              title: 'Apply it',
              body: (
                <p>
                  Here the threshold is <M t="1/(1 + 10) \approx 0.0909" />, so a posterior of 0.2085 is enough to act. At equality both actions have the same
                  risk. With equal costs the threshold is ½: MAP.
                </p>
              ),
            },
          ]}
        />
        <Steps
          intro={<p>More generally, with any number of classes, zero-one loss gives MAP.</p>}
          steps={[
            { title: 'Zero-one loss', body: <MB t="L(a, c) = \begin{cases} 0 & a = c \\ 1 & a \ne c \end{cases} \;\Rightarrow\; R(a \mid x) = \sum_{c \ne a} P(c \mid x) = 1 - P(a \mid x)." /> },
            { title: 'Minimise', body: <p>Minimising <M t="1 - P(a \mid x)" /> is maximising <M t="P(a \mid x)" />: the MAP rule is the special case of equal costs.</p> },
          ]}
        />
        <Lab title="Two actions, two risk lines" purpose="Each line is the expected loss of one action as the posterior varies. The cheaper action is the lower line; they cross at the threshold.">
          <RiskLab />
        </Lab>
        <TryThis
          items={[
            'Default: the posterior 0.2085 lies right of the threshold 1/11, inside the “predict present” region, though MAP says absent.',
            'Set both costs equal: the lines cross at ½ and minimum risk agrees with MAP everywhere.',
            'Make false positives expensive (C_FP = 10, C_FN = 1). Now the posterior must exceed 10/11 before you act.',
          ]}
        />
        <p>
          In summary, the Bayesian framework lets losses enter the decision rule: minimise the posterior expected loss. Week 2’s choice of an
          ROC operating threshold is the same idea in practice.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l5.q1"
          q={<p>P(A | x) = 2/5. Predicting A when B is true costs 1; predicting B when A is true costs 3. Which action minimises risk?</p>}
          options={[
            { text: 'Predict A: R(A) = 3/5 < R(B) = 6/5', correct: true, why: 'R(A) = 1 × P(B|x) = 3/5; R(B) = 3 × P(A|x) = 6/5. Threshold 1/(1 + 3) = 1/4 < 2/5.' },
            { text: 'Predict B, because P(B | x) > ½', why: 'That is the MAP rule; it ignores the unequal costs.' },
            { text: 'Predict B: R(B) = 3/5', why: 'R(B) weights the cost 3 by P(A | x) = 2/5.' },
          ]}
        />
        <Quiz
          id="w3.l5.q2"
          q={<p>With C_FP = 1 and C_FN = 3, above what posterior should you predict the positive class?</p>}
          options={[
            { text: '0.25', correct: true, why: 'C_FP/(C_FP + C_FN) = 1/4.' },
            { text: '0.75', why: 'That would be the threshold if false positives were the costly mistake.' },
            { text: '0.5', why: 'Only for equal costs.' },
          ]}
        />
        <Quiz
          id="w3.l5.q3"
          q={<p>Changing the loss table changes…</p>}
          options={[
            { text: 'the posterior probabilities.', why: 'Posteriors depend on the data, priors and likelihoods, not on costs.' },
            { text: 'which action is optimal, but not the posterior.', correct: true, why: 'Uncertainty and consequences are separate ingredients.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A decision needs both a posterior and a loss. Minimise the conditional risk <M t="R(a \mid x) = \sum_c L(a, c)P(c \mid x)" />. For two classes,
        act on <M t="c_1" /> when <M t="p > C_{\text{FP}}/(C_{\text{FP}} + C_{\text{FN}})" />; with zero-one loss this is the MAP rule.
      </Callout>

      <Checklist id="w3-risk" items={CHECKS3['w3-risk']} />
    </>
  );
}
