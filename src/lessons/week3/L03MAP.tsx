import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, TryThis } from '../../components/ui';
import { OddsLab } from '../../interactives/week3/OddsLab';
import { CHECKS3 } from './checks';

export default function L03MAP() {
  return (
    <>
      <Sec title="Choosing a hypothesis">
        <p>
          Apply Bayes’ theorem to <em>models</em>. A hypothesis <M t="h" /> from a hypothesis space <M t="H" /> is a candidate explanation of the training
          data <M t="D" />. We generally want the most probable hypothesis given the data — the <strong>maximum a posteriori</strong> (MAP) hypothesis:
        </p>
        <MB t="h_{\text{MAP}} = \argmax_{h\in H} P(h \mid D) = \argmax_{h\in H}\frac{P(D \mid h)P(h)}{P(D)} = \argmax_{h\in H} P(D \mid h)\,P(h)." />
        <p>
          <M t="P(D)" /> is the same for every hypothesis, so it drops out of the argmax. If every hypothesis is equally probable a priori,{' '}
          <M t="P(h)" /> drops out too and we get the <strong>maximum likelihood</strong> (ML) hypothesis:
        </p>
        <MB t="h_{\text{ML}} = \argmax_{h\in H} P(D \mid h)." />
        <p>
          With equal priors MAP and ML coincide; unequal priors <em>can</em> change the answer (though they need not). The same logic at the level of
          classes gives MAP classification <M t="\argmax_c P(x \mid c)P(c)" /> and ML classification <M t="\argmax_c P(x \mid c)" />. Selecting a model and
          selecting a class are different tasks — lesson 7 shows they can disagree.
        </p>
        <Callout kind="example" title="ML and MAP disagree">
          Priors <M t="P(h_1) = 0.9" />, <M t="P(h_2) = 0.1" />; likelihoods <M t="P(D \mid h_1) = 0.2" />, <M t="P(D \mid h_2) = 0.8" />. ML picks{' '}
          <M t="h_2" /> (0.8 &gt; 0.2). MAP compares <M t="0.2 \times 0.9 = 0.18" /> with <M t="0.8 \times 0.1 = 0.08" /> and picks <M t="h_1" />;
          normalising, <M t="P(h_1 \mid D) = 9/13" />. The data favour <M t="h_2" />, but not strongly enough to overcome its small prior.
        </Callout>
      </Sec>

      <Sec title="Odds make the update visible">
        <Steps
          intro={<p>For two classes, divide one Bayes formula by the other.</p>}
          steps={[
            {
              title: 'Write both posteriors',
              body: <MB t="P(c_1 \mid x) = \frac{P(x \mid c_1)P(c_1)}{P(x)}, \qquad P(c_2 \mid x) = \frac{P(x \mid c_2)P(c_2)}{P(x)}." />,
            },
            {
              title: 'Divide: the evidence cancels',
              body: (
                <MB t="\underbrace{\frac{P(c_1 \mid x)}{P(c_2 \mid x)}}_{\text{posterior odds}} = \underbrace{\frac{P(x \mid c_1)}{P(x \mid c_2)}}_{\text{likelihood ratio}} \times \underbrace{\frac{P(c_1)}{P(c_2)}}_{\text{prior odds}}." />
              ),
            },
            {
              title: 'Back to a probability',
              body: (
                <p>
                  Odds <M t="o" /> mean “<M t="o" /> times as probable”, not probability <M t="o" />. For two exhaustive classes,{' '}
                  <M t="P(c_1 \mid x) = o/(1 + o)" />.
                </p>
              ),
            },
          ]}
        />
        <p>
          It helps to think of likelihoods as thought experiments: if someone sent me a spam email, how likely would it be to contain exactly these
          words — and how likely if it were ham? What matters is their <em>ratio</em>. Use likelihoods alone when you want to ignore the prior (or assume
          it uniform), and posteriors otherwise.
        </p>
        <Callout kind="example" title="Text example">
          A Bernoulli model (lesson 14) gives likelihood ratio <M t="3/2" /> for spam versus ham. With equal priors, predict spam. With 1/3 spam and 2/3
          ham, the prior odds are <M t="1/2" /> and the posterior odds <M t="\tfrac32 \times \tfrac12 = \tfrac34 < 1" />: predict ham, with spam posterior{' '}
          <M t="(3/4)/(1 + 3/4) = 3/7" />. The likelihood ratio was not strong enough to push the decision away from the prior.
        </Callout>
        <Callout kind="note" title="When is the threshold 1?">
          Under equal error costs, posterior odds above 1 favour <M t="c_1" />. A likelihood ratio above 1 gives the ML decision; it gives the MAP decision
          only with equal priors. In general, compare the likelihood ratio with <M t="P(c_2)/P(c_1)" />.
        </Callout>
        <Lab title="Bayes’ rule as addition of log-odds" purpose="On a log scale, multiplying by the likelihood ratio is a shift. Start at the prior odds, shift by the evidence, and see which side you land on.">
          <OddsLab />
        </Lab>
        <TryThis
          items={[
            'Load “h₁ vs h₂”: the evidence arrow points left (LR = 1/4) but the prior arrow (odds 9) is longer: MAP stays with h₁. Lower the prior until they agree.',
            'Load the two text presets: the same likelihood-ratio arrow (3/2) ends on different sides of 1 depending on where the prior starts.',
            'Set P(x | c₁) = P(x | c₂). The observation carries no information: posterior odds equal prior odds.',
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l3.q1"
          q={<p>P(A) = 0.25, P(B) = 0.75; P(x | A) = 0.6, P(x | B) = 0.15. What are the ML and MAP classes?</p>}
          options={[
            { text: 'ML: A, MAP: A', correct: true, why: 'LR = 4 > 1; posterior odds 4 × (1/3) = 4/3 > 1, so the evidence overcomes the prior here.' },
            { text: 'ML: A, MAP: B', why: 'MAP scores are 0.15 for A and 0.1125 for B.' },
            { text: 'ML: B, MAP: B', why: 'The likelihood is larger for A.' },
          ]}
        />
        <Quiz
          id="w3.l3.q2"
          q={<p>Posterior odds for spam are 3/4. What is P(spam | x)?</p>}
          options={[
            { text: '0.75', why: 'That treats odds as a probability.' },
            { text: '3/7', correct: true, why: 'o/(1 + o) = (3/4)/(7/4).' },
            { text: '4/7', why: 'That is P(ham | x).' },
          ]}
        />
        <Quiz
          id="w3.l3.q3"
          q={<p>When are h_MAP and h_ML guaranteed to coincide?</p>}
          options={[
            { text: 'Always.', why: 'Unequal priors can separate them (see the worked example).' },
            { text: 'When all hypotheses have equal prior probability.', correct: true, why: 'Then P(h) is a common factor, like P(D).' },
            { text: 'When the data set is large.', why: 'Large data usually reduce the prior’s influence, but there is no guarantee.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        MAP maximises <M t="P(D \mid h)P(h)" />; ML maximises <M t="P(D \mid h)" /> and equals MAP under equal priors. For two classes, posterior odds =
        likelihood ratio × prior odds — evidence shifts the prior, and the decision depends on whether the shift crosses 1.
      </Callout>

      <Checklist id="w3-map" items={CHECKS3['w3-map']} />
    </>
  );
}
