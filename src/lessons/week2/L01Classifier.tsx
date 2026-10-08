import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { BayesLab } from '../../interactives/week2/BayesLab';
import { CHECKS2 } from './checks';

export default function L01Classifier() {
  return (
    <>
      <Sec title="From predicting a number to choosing a class">
        <p>
          Week 1 asked how to predict a number. Week 2 asks how to choose a <strong>class</strong> — sometimes by first estimating how probable each class
          is. The running example is a fish-packing plant that wants to sort sea bass from salmon automatically. Sensors measure{' '}
          <em>features</em> such as lightness and width; the species is the <em>target</em>.
        </p>
        <p>
          A <strong>classifier</strong> is a function from an input to one of a finite set of classes. With two classes we write the labels as{' '}
          <M t="y \in \{0, 1\}" />, but these are <em>names</em>: coding salmon as 0 and sea bass as 1 does not make species a continuous quantity, and
          nothing is “halfway between” them.
        </p>
        <Callout kind="note" title="Same structure as Week 1">
          Choose a representation (features), learn from labelled training data, and judge the predictions on genuinely held-out observations. What
          changes is the kind of output — and therefore the losses and the evaluation measures.
        </Callout>
      </Sec>

      <Sec title="Score, probability, label: three different outputs">
        <p>Much confusion later (logistic regression, ROC curves) disappears if you keep three quantities apart:</p>
        <div className="pipeline">
          <div className="pipe-step">
            <div className="pipe-t">Score</div>
            <div className="pipe-s">any real number, e.g. <M t="z = \bx\T\bw" />; larger ⇒ “more positive”</div>
          </div>
          <div className="pipe-step">
            <div className="pipe-t">Class probability</div>
            <div className="pipe-s">a number in [0, 1], an estimate of <M t="P(Y = 1 \mid \bx)" /></div>
          </div>
          <div className="pipe-step prep">
            <div className="pipe-t">Decision rule</div>
            <div className="pipe-s">threshold, argmax or vote</div>
          </div>
          <div className="pipe-step">
            <div className="pipe-t">Predicted label</div>
            <div className="pipe-s">
              <M t="\hat y \in \{0, 1\}" />
            </div>
          </div>
        </div>
        <p>
          Not every classifier produces all three. The basic linear classifier (lesson 2) has a score and a label but no probability; k-NN (lesson 14) has
          votes and a label. Logistic regression (lesson 3) produces all three.
        </p>
      </Sec>

      <Sec title="Two ways to build a classifier">
        <p>Looking at the fish scatter plot suggests two quite different ideas.</p>
        <Table
          head={['', 'Discriminative', 'Generative']}
          rows={[
            ['Idea', 'Find a boundary that separates the classes.', 'Describe what each class looks like, one class at a time.'],
            ['What it learns', <M t="P(y \mid \bx)" />, <M t="p(\bx \mid y)" />, ],
            ['', 'or just a decision rule', <>and the class prior <M t="P(y)" /></>],
            ['How it predicts', 'which side of the boundary / which class is more probable', 'which class model the query is more similar to, via Bayes’ rule'],
            ['This week', 'linear classifier, logistic regression, k-NN', 'idea only (Naive Bayes comes later)'],
          ]}
        />
        <p>
          A generative model learns <M t="p(\bx \mid y)" /> and <M t="P(y)" />, so it effectively knows the joint distribution{' '}
          <M t="p(\bx, y) = p(\bx \mid y)P(y)" /> — “the mechanism by which the data has been generated”. To classify it must turn this around
          with <strong>Bayes’ rule</strong>:
        </p>
        <MB t="P(y = c \mid \bx) = \frac{p(\bx \mid y = c)\,P(y = c)}{p(\bx)}, \qquad p(\bx) = \sum_{c'} p(\bx \mid y = c')\,P(y = c')." />
        <p>
          Then predict <M t="y = 0" /> if <M t="P(y = 0 \mid \bx) > P(y = 1 \mid \bx)" /> and <M t="y = 1" /> otherwise. The denominator <M t="p(\bx)" />{' '}
          is the same for both classes at a given query, so <em>to find the most probable class it is enough to compare the numerators</em>{' '}
          <M t="p(\bx \mid y = c)P(y = c)" />. A discriminative model like logistic regression estimates <M t="P(y \mid \bx)" /> directly and applies the
          same comparison.
        </p>
        <Callout kind="example" title="Prior versus likelihood">
          For one observation, the feature likelihood is 0.6 under class 1 and 0.3 under class 0; the priors are <M t="P(y=1) = 0.2" />,{' '}
          <M t="P(y=0) = 0.8" />. The products are <M t="0.6 \times 0.2 = 0.12" /> and <M t="0.3 \times 0.8 = 0.24" />, so
          <MB t="P(y = 1 \mid \bx) = \frac{0.12}{0.12 + 0.24} = \frac13," />
          and the most-probable-class rule predicts class 0. Comparing likelihoods alone (0.6 &gt; 0.3) would predict class 1 — it ignores how rare class
          1 is.
        </Callout>
        <Callout kind="warning">
          A discriminative classifier need not output probabilities at all — a direct boundary rule is also discriminative. And “generative” does not
          mean it learns <M t="P(y \mid \bx)" /> first: it models the features within each class and obtains the posterior afterwards. For continuous
          features the likelihoods are <em>density</em> values, which can exceed 1.
        </Callout>
        <Lab
          title="A generative classifier in one dimension"
          purpose="Each class has its own density for the feature. Weighting by the prior and normalising gives the posterior; the predicted class is wherever the posterior is above ½."
        >
          <BayesLab />
        </Lab>
        <TryThis
          items={[
            'With equal priors and equal spreads, the boundary sits exactly halfway between the class means (x = 5). Why?',
            'Lower P(y = 1) to about 0.1. The positive region shrinks towards class 1’s mean: a rarer class needs stronger evidence. Find a query where the status turns red.',
            'Widen class 1 (σ₁ ≥ 2.3) with equal priors and look at the far left edge: class 1 wins there too, because its wider density decays more slowly. A generative boundary need not be a single threshold.',
            'Move the query far to the left or right: the posterior goes to 0 or 1 even though both densities are tiny. Only their ratio matters.',
          ]}
        />
      </Sec>

      <Sec title="Where learning fits">
        <p>
          The big picture separates a <strong>task</strong> — which needs a mapping (a model) from data described by features to outputs —
          from the <strong>learning problem</strong> of obtaining that mapping from training data. This week fills in each piece for classification:
        </p>
        <ul>
          <li>
            <strong>Models</strong>: a linear boundary from class means (lesson 2), logistic regression (lessons 3–5), and distance-based classifiers —
            nearest centroid and k-NN (lessons 11–18).
          </li>
          <li>
            <strong>Evaluation</strong>: cross-validation, confusion matrices, precision/recall/F1 and ROC curves (lessons 6–9).
          </li>
          <li>
            <strong>Data issues</strong>: feature types, missing values and scaling (lessons 7, 10, 15).
          </li>
        </ul>
      </Sec>

      <Sec title="Notation for the week">
        <Table
          head={['Symbol', 'Meaning']}
          rows={[
            [<><M t="m" />, <M t="d" /></>, 'number of observations; number of input features'],
            [<><M t="\bx_j" />, <M t="y_j" /></>, <>feature vector in <M t="\R^d" />; binary label in <M t="\{0, 1\}" /></>],
            [<M t="\bxt_j" />, <>augmented input <M t="(1, x_{j1}, \dots, x_{jd})\T" /> (leading 1 for the intercept)</>],
            [<><M t="\beta" />, <M t="X" /></>, <>logistic coefficients in <M t="\R^{d+1}" />; design matrix with rows <M t="\bxt_j\T" /></>],
            [<><M t="k" />, <M t="K" /></>, 'number of neighbours; number of cross-validation folds — different choices'],
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l1.q1"
          q={<p>Does a generative classifier learn P(y | x) first?</p>}
          options={[
            { text: 'Yes — that is what makes it a classifier.', why: 'That describes a discriminative probabilistic model such as logistic regression.' },
            { text: 'No — it models p(x | y) and P(y), then obtains P(y | x) with Bayes’ rule.', correct: true, why: 'The posterior is derived, not modelled directly.' },
            { text: 'No — it never needs P(y | x).', why: 'To predict the most probable class it does compare posteriors, through the numerators p(x | y)P(y).' },
          ]}
        />
        <Quiz
          id="w2.l1.q2"
          q={<p>p(x | y=1) = 0.4, p(x | y=0) = 0.1, P(y=1) = 0.1. What is P(y=1 | x), and which class is predicted?</p>}
          options={[
            { text: '0.8; class 1', why: '0.4/(0.4 + 0.1) ignores the priors.' },
            { text: '4/13 ≈ 0.308; class 0', correct: true, why: 'Products 0.4 × 0.1 = 0.04 and 0.1 × 0.9 = 0.09; 0.04/0.13 = 4/13 < ½.' },
            { text: '0.04; class 0', why: '0.04 is the numerator only; divide by p(x) = 0.04 + 0.09.' },
          ]}
        />
        <Quiz
          id="w2.l1.q3"
          q={<p>Species is coded salmon = 0, sea bass = 1. Which statement is right?</p>}
          options={[
            { text: 'A prediction of 0.5 means a fish halfway between the species.', why: 'The labels are names; a probability of 0.5 means uncertainty, not an intermediate species.' },
            { text: 'The codes are labels; a model may output a probability in [0, 1], but the predicted label is 0 or 1.', correct: true, why: 'Score, probability and label are separate outputs joined by a decision rule.' },
            { text: 'We must use linear regression because the labels are numbers.', why: 'Numeric storage does not make a quantity continuous; lesson 3 shows why plain regression is a poor fit.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        A classifier maps features to one of a finite set of classes; scores, probabilities and labels are different outputs joined by a decision rule.
        Discriminative methods learn the boundary or <M t="P(y \mid \bx)" /> directly; generative methods model <M t="p(\bx \mid y)" /> and{' '}
        <M t="P(y)" /> and use Bayes’ rule — compare <M t="p(\bx \mid y)P(y)" />, not the likelihoods alone.
      </Callout>

      <Checklist id="w2-classifier" items={CHECKS2['w2-classifier']} />
    </>
  );
}
