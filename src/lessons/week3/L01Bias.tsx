import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { BiasLab } from '../../interactives/week3/BiasLab';
import { CHECKS3 } from './checks';

export default function L01Bias() {
  return (
    <>
      <Sec title="The observations do not determine the unseen cases">
        <p>
          “All models are wrong, but some models are useful” (Box &amp; Draper). Here is why a learner cannot avoid being “wrong” in some
          respect. Suppose the only observations are <M t="(0, 0)" /> and <M t="(1, 1)" />. Both
        </p>
        <MB t="f(x) = x \qquad\text{and}\qquad g(x) = x + 10x(x - 1)" />
        <p>
          fit them perfectly, yet at <M t="x = 2" /> they predict 2 and 22. Training agreement alone cannot tell us which extrapolation is sensible. To say
          anything about unseen inputs a learner must prefer some patterns over others.
        </p>
        <Lab title="Perfect fits that disagree" purpose="Three hypotheses, all with zero training error. Move the new input and compare their predictions.">
          <BiasLab />
        </Lab>
        <TryThis
          items={[
            'At x = 2 with a = 10 the three hypotheses predict 2, 22 and 1. Which is “right”? Nothing in the two observations can say.',
            'Observe (2, 2) as well. Only a = 0 survives in the g-family — but 1-NN and many other curves still fit. More data narrows the candidates without ever fixing them completely.',
          ]}
        />
      </Sec>

      <Sec title="Inductive bias">
        <p>
          <strong>Inductive bias</strong> is the set of assumptions a model or learning algorithm uses to generalise from the training data to new, unseen
          data. It includes the hypothesis family, what counts as “similar”, and preferences among competing fits. A good inductive bias — one
          that matches the real structure of the problem — can dramatically reduce how much data is needed. For complex models it is often hard to state.
        </p>
        <Table
          head={['Method', 'Central inductive bias']}
          rows={[
            ['Linear regression', 'the target is well approximated by a linear function of the chosen features; squared errors decide the fit'],
            ['k-nearest neighbours', 'nearby points (under the chosen distance and scaling) tend to have similar labels — local similarity'],
            ['Naive Bayes (this week)', 'features are mutually independent once the class is known, each with a chosen distribution'],
          ]}
        />
        <p className="small muted">
          k-NN’s bias is sometimes described as “the target is a complex non-linear function”. k-NN can produce non-linear boundaries, but its central
          assumption is local similarity.
        </p>
        <Callout kind="warning" title="Two meanings of “bias”">
          <em>Inductive</em> bias means assumptions. <em>Statistical</em> bias (Week 1’s bias–variance decomposition) means systematic error in an
          estimator. They are related — strong assumptions such as linearity tend to give high bias and low variance — but a strong
          inductive bias that <em>matches</em> the problem need not create large statistical bias. “Stronger assumptions always mean higher error” is
          false.
        </Callout>
      </Sec>

      <Sec title="A probabilistic framework">
        <p>
          We want a framework that represents the inductive bias explicitly and declaratively, and quantifies uncertainty. Probability does this.
          For example, with two Boolean features of an email and the class <M t="Y \in \{\text{spam}, \text{ham}\}" />:
        </p>
        <Table
          head={['Viagra', 'lottery', 'P(spam | x)', 'P(ham | x)']}
          rows={[
            ['0', '0', '0.31', <strong>0.69</strong>],
            ['0', '1', <strong>0.65</strong>, '0.35'],
            ['1', '0', <strong>0.80</strong>, '0.20'],
            ['1', '1', '0.40', <strong>0.60</strong>],
          ]}
        />
        <p>
          A <strong>decision rule</strong> turns this posterior into a prediction — e.g. predict spam when <M t="P(\text{spam} \mid x) > 0.5" />.
          Bayesian methods play two roles: practical algorithms (Naive Bayes, Bayesian networks) that combine prior knowledge with data, and a
          conceptual “gold standard” for judging other learners. This table returns in lessons 16 and 17.
        </p>
      </Sec>

      <Sec title="Discriminative and generative models">
        <p>
          A <strong>discriminative</strong> probabilistic model learns <M t="P(y \mid x)" /> directly — logistic regression from Week 2. A{' '}
          <strong>generative</strong> model learns <M t="P(y)" /> and <M t="P(x \mid y)" />, hence the joint <M t="P(x, y) = P(x \mid y)P(y)" />, and obtains the posterior from it:
        </p>
        <MB t="P(y \mid x) = \frac{P(x, y)}{\sum_{c} P(x, Y = c)}." />
        <p>
          It is called generative because you could <em>generate</em> labelled data: sample a class from <M t="P(y)" />, then features from{' '}
          <M t="P(x \mid y)" />. Naive Bayes is generative. The distinction concerns <em>what is modelled</em>, not whether the boundary looks straight.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l1.q1"
          q={<p>“k-NN has no inductive bias because it does not fit a formula.” Evaluate.</p>}
          options={[
            { text: 'True: it just stores the data.', why: 'Storing data does not generalise; the assumption that nearby points share labels does.' },
            { text: 'False: it assumes local similarity under the chosen distance and feature scaling.', correct: true, why: 'Change the distance and you change what it believes about unseen points.' },
          ]}
        />
        <Quiz
          id="w3.l1.q2"
          q={<p>Which statement about inductive and statistical bias is correct?</p>}
          options={[
            { text: 'They are the same thing.', why: 'Inductive bias is not the bias of the bias–variance decomposition.' },
            { text: 'Strong inductive bias always causes large statistical bias.', why: 'Not if the assumptions match the true problem.' },
            { text: 'Inductive bias is a set of assumptions; it influences, but does not equal, the systematic error.', correct: true, why: 'Correct assumptions can give low variance without high bias.' },
          ]}
        />
        <Quiz
          id="w3.l1.q3"
          q={<p>What does a generative classifier model?</p>}
          options={[
            { text: 'P(y | x) only', why: 'That is a discriminative model.' },
            { text: 'P(x | y) and P(y), i.e. the joint P(x, y)', correct: true, why: 'Bayes’ rule then gives P(y | x).' },
            { text: 'Only the decision boundary', why: 'A boundary-only rule is discriminative.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Finite data are consistent with many hypotheses, so every learner needs an inductive bias — assumptions that pick out plausible generalisations.
        Linear regression assumes linearity, k-NN assumes local similarity, Naive Bayes assumes conditional independence. The probabilistic framework
        makes such assumptions explicit and quantifies uncertainty; generative models learn <M t="P(x \mid y)P(y)" /> and use Bayes’ rule.
      </Callout>

      <Checklist id="w3-bias" items={CHECKS3['w3-bias']} />
    </>
  );
}
