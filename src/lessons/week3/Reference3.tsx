import type { ReactNode } from 'react';
import { M, MB } from '../../components/Math';
import { Callout, Sec, Table } from '../../components/ui';

function Row({ f, note }: { f: string; note?: ReactNode }) {
  return (
    <div className="ref-row">
      <MB t={f} />
      {note && <div className="ref-note">{note}</div>}
    </div>
  );
}

export default function Reference3() {
  return (
    <>
      <div className="btn-row">
        <button className="btn" onClick={() => window.print()}>
          Print / save as PDF
        </button>
        <span className="kbd-hint">
          D = training data, h ∈ H hypotheses, c a class, x = (x₁, …, x_d), N_c = examples in class c, K_j = possible values of feature j.
        </span>
      </div>

      <Sec title="Bayes’ rule, MAP and ML">
        <Row f="P(A \wedge B) = P(A \mid B)P(B) = P(B \mid A)P(A), \qquad P(A \vee B) = P(A) + P(B) - P(A \wedge B)" note="product and sum rules" />
        <Row f="P(c \mid x) = \frac{P(x \mid c)P(c)}{\sum_{c'}P(x \mid c')P(c')} = \frac{s_c}{\sum_{c'}s_{c'}}, \qquad s_c = P(x \mid c)P(c)" note="drop the evidence for an argmax, never for a reported probability" />
        <Row f="h_{\text{MAP}} = \argmax_h P(D \mid h)P(h), \qquad h_{\text{ML}} = \argmax_h P(D \mid h)" note="equal priors ⇒ same maximisers" />
        <Row f="\frac{P(c_1 \mid x)}{P(c_2 \mid x)} = \frac{P(x \mid c_1)}{P(x \mid c_2)}\times\frac{P(c_1)}{P(c_2)}, \qquad P(c_1 \mid x) = \frac{o}{1 + o}" note="posterior odds = likelihood ratio × prior odds; MAP compares LR with P(c₂)/P(c₁)" />
      </Sec>

      <Sec title="Decisions">
        <Row f="R(a \mid x) = \sum_c L(a, c)P(c \mid x), \qquad a^* = \argmin_a R(a \mid x)" note="zero-one loss ⇒ R = 1 − P(a|x) ⇒ MAP" />
        <Row f="\text{predict } c_1 \iff P(c_1 \mid x) > \frac{C_{\text{FP}}}{C_{\text{FP}} + C_{\text{FN}}}" note="two classes, zero loss when correct" />
        <Row f="y_i = h(x_i) + \varepsilon_i,\; \varepsilon_i \overset{\text{iid}}{\sim}\N(0, \sigma^2) \;\Rightarrow\; h_{\text{ML}} = \argmin_h\sum_i(y_i - h(x_i))^2" />
        <Row f="\hat y_{\text{Bayes}} = \argmax_y\sum_h P(y \mid x, h)P(h \mid D)" note="Gibbs: sample h ~ P(h|D) and use it; E[error_Gibbs] ≤ 2 E[error_Bayes] under the stated assumptions" />
        <Row f="R^*(x) = 1 - \max_c P(c \mid x), \qquad R^* = \E_X\big[1 - \max_c P(c \mid X)\big]" note="Bayes error: weight by P(x); more data cannot remove it, new features can" />
      </Sec>

      <Sec title="Naive Bayes">
        <Row f="P(x_1, \dots, x_d \mid c) = \prod_j P(x_j \mid c), \qquad \hat y = \argmax_c \hat P(c)\prod_j\hat P(x_j \mid c)" note="mutual independence of features given the class" />
        <Row f="\hat P(c) = \frac{N_c}{N}, \qquad \hat P(X_j = v \mid c) = \frac{N_{j,v,c} + \alpha}{N_c + \alpha K_j}" note="α = 0 unsmoothed, α = 1 Laplace; with missing values use N_jc^obs" />
        <Row f="\ell_c = \log\hat P(c) + \sum_j\log\hat P(x_j \mid c)" note="same decision, no underflow; log 0 is still −∞" />
        <Row f="p(x_j \mid c) = \frac{1}{\sqrt{2\pi}\,\sigma_{jc}}\exp\Big(-\frac{(x_j - \mu_{jc})^2}{2\sigma_{jc}^2}\Big), \qquad s^2_{jc} = \frac{\sum_{i\in I_c}(x_{ij} - \hat\mu_{jc})^2}{n_c - 1}" note="Gaussian NB; MLE variance divides by n_c; densities can exceed 1" />
        <Row f="P(o \mid c) = \sum_m P(o, m \mid c) = P(o \mid c)" note="missing feature m: omit its factor; general table: weight by P(m | o)" />
      </Sec>

      <Sec title="Text models">
        <Table
          head={['', 'Bernoulli (presence)', 'Multinomial (counts)']}
          rows={[
            [
              'parameter',
              <M t="\hat\theta_{jc} = \frac{\#\text{docs in } c \text{ with } j + 1}{N_c + 2}" />,
              <M t="\hat\theta_{jc} = \frac{T_{jc} + 1}{T_c + m}" />,
            ],
            ['sums to 1 over words?', 'no — separate binary variables', 'yes — a distribution over the vocabulary'],
            [
              'likelihood',
              <M t="\prod_j\theta_{jc}^{z_j}(1 - \theta_{jc})^{1 - z_j}" />,
              <M t="\frac{L!}{\prod_j n_j!}\prod_j\theta_{jc}^{n_j}" />,
            ],
            ['absent word', <M t="\text{factor } 1 - \theta_{jc}" />, 'factor 1 (no effect)'],
            ['repeated word', 'no effect', 'one factor per occurrence'],
          ]}
        />
      </Sec>

      <Sec title="Five decisions before doing arithmetic">
        <ol>
          <li>What is random or unknown — a class, a model, a feature value, a parameter?</li>
          <li>What has been observed — a measurement, a category, a bit vector, a count vector?</li>
          <li>Which assumptions are allowed — conditional independence, Gaussian noise, equal priors, specified smoothing?</li>
          <li>What output is requested — score, probability, class, expected loss or derivation? Only some need normalising.</li>
          <li>What is the decision objective — equal-cost accuracy or an explicit loss matrix?</li>
        </ol>
      </Sec>

      <Callout kind="key">
        Choose assumptions, estimate probabilities, update beliefs with evidence, then choose the prediction with the relevant loss. Naive Bayes makes the
        likelihood learnable by assuming features are independent given the class — good for decisions, often poor for probabilities.
      </Callout>
    </>
  );
}
