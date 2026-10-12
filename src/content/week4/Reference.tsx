import type { ReactNode } from 'react';
import { MB } from '../../components/Math';
import { Callout, Sec, Table } from '../../components/ui';

function Row({ f, note }: { f: string; note?: ReactNode }) {
  return (
    <div className="ref-row">
      <MB t={f} />
      {note && <div className="ref-note">{note}</div>}
    </div>
  );
}

export default function Reference4() {
  return (
    <>
      <div className="btn-row">
        <button className="btn" onClick={() => window.print()}>
          Print / save as PDF
        </button>
        <span className="kbd-hint">S = examples at a node, n = |S|, S_v = examples taking branch v, n_v = |S_v|, p_j = proportion of class j at the node.</span>
      </div>

      <Sec title="Impurity and gain">
        <Row f="H(S) = -\sum_{j=1}^{k} p_j \log_2 p_j, \qquad 0\log_2 0 = 0, \qquad 0 \le H(S) \le \log_2 k" note="maximal at equal proportions; depends on proportions only" />
        <Row f="\operatorname{IG}(S, A) = H(S) - \sum_v \frac{n_v}{n}\,H(S_v) = H(Y) - H(Y \mid A), \qquad 0 \le \operatorname{IG} \le H(S)" note="0 ⇔ every non-empty child has the parent’s proportions; H(S) ⇔ every non-empty child is pure" />
        <Row f="\operatorname{SplitH}(S, A) = -\sum_v \frac{n_v}{n}\log_2\frac{n_v}{n}, \qquad \operatorname{GR}(S, A) = \frac{\operatorname{IG}(S, A)}{\operatorname{SplitH}(S, A)}" note="split entropy uses branch sizes only; GR undefined when SplitH = 0" />
        <Row f="\frac{\operatorname{IG}(S, A)^2}{\operatorname{Cost}(A)}" note="one heuristic for attributes that are expensive to measure (Cost > 0)" />
      </Sec>

      <Sec title="Numeric splits, search and errors">
        <Row f="x \le t, \quad t = \tfrac12(v_i + v_{i+1}) \text{ for neighbouring distinct values } v_i < v_{i+1}" note="m distinct values ⇒ at most m − 1 partitions; best entropy cut lies at a class change (no constraints)" />
        <Row f="E_{\min} = \sum_{\text{input tuples } g}\Big(n_g - \max_j n_{g,j}\Big), \qquad \text{training error} \le 1 - \frac1k" note="identical inputs share a leaf; the bound assumes majority leaves and equal costs" />
        <Row f="R(a) = \sum_c L(a, c)\,p_c, \qquad a^* = \argmin_a R(a)" note="cost-sensitive leaf; equal costs ⇒ majority vote" />
        <Row f="\text{one-SE: smallest tree with } \widehat{\text{err}} \le \widehat{\text{err}}_{\min} + \operatorname{SE}_{\min}" note="the SE of the minimum-error candidate, not each candidate’s own" />
      </Sec>

      <Sec title="Regression and model trees">
        <Row f="\argmin_c \sum_{i=1}^m (y_i - c)^2 = \bar y, \qquad \sum_i (y_i - c)^2 = \sum_i (y_i - \bar y)^2 + m(c - \bar y)^2" note="absolute error ⇒ the median" />
        <Row f="Q(S, A) = \sum_v \frac{n_v}{n}\operatorname{MSE}(S_v) = \frac1n\sum_v\sum_{i\in S_v}(y_i - \bar y_v)^2" note="minimise; each child uses its own mean; MSE divides by n_v, not n_v − 1" />
        <Row f="\hat f(x) = \sum_{\ell} \bar y_\ell\,\mathbb 1\{x \in R_\ell\}" note="piecewise constant; no extrapolation of trends" />
        <Row f="\operatorname{SDR} = \operatorname{sd}(S) - \sum_v \frac{n_v}{n}\operatorname{sd}(S_v), \qquad \hat f(x) = \beta_{\ell,0} + \sum_j\beta_{\ell,j}x_j \text{ in leaf } \ell" note="model tree (M5): grow by SDR, fit and prune linear leaf models" />
      </Sec>

      <Sec title="Kernel smoothing">
        <Row f="\hat f(x_0) = \sum_i w_i(x_0)\,Y_i, \qquad w_i = \frac{a_i}{\sum_j a_j}, \qquad a_i = K\Big(\frac{\lVert X_i - x_0\rVert_2}{h}\Big)" note="needs Σ a_j > 0; weights sum to 1" />
        <Row f="K_{\text{box}}(u) = \mathbb 1\{|u| \le \tfrac12\}, \qquad K_{\text{epan}}(u) = \tfrac34(1 - u^2)\,\mathbb 1\{|u| \le 1\}" note="same h: boxcar reaches h/2, Epanechnikov reaches h" />
        <Row f="\operatorname{Var}\big(\hat f(x_0)\big) = \sigma^2\sum_i w_i(x_0)^2" note="independent noise, fixed weights; linear in Y" />
      </Sec>

      <Sec title="Keep the prediction tasks apart">
        <Table
          head={['Method', 'Leaf / query prediction', 'Split or weighting principle']}
          rows={[
            ['Classification tree', 'majority label; minimum expected cost if costs differ', 'maximise information gain (or gain ratio)'],
            ['Regression tree', 'mean of the leaf’s targets', 'minimise weighted child MSE'],
            ['Model tree', 'a local linear formula', 'standard deviation reduction, then prune the linear models'],
            ['Kernel smoother', 'normalised weighted mean of responses', 'weights from distance to each query'],
          ]}
        />
      </Sec>

      <Sec title="Strengths and limitations of trees">
        <Table
          head={['Strengths', 'Limitations']}
          rows={[
            ['small trees are easy to read as rules', 'large trees lose that readability'],
            ['mixed numeric and categorical inputs; missing values can be routed', 'single-feature tests give axis-aligned boundaries only'],
            ['irrelevant attributes tend to be ignored (gain ≈ 0)', 'unpruned trees overfit; small data changes can change the whole tree'],
            ['prediction follows one path: very fast', 'greedy growth need not find the best or smallest tree'],
          ]}
        />
      </Sec>

      <Sec title="Five checks before trusting a number">
        <ol>
          <li>Do the children’s counts add up to the parent’s, class by class?</li>
          <li>Is every proportion computed from its own node’s total, and every weight a branch size over the parent size?</li>
          <li>Is the gain between 0 and H(S)? A negative gain is an arithmetic error.</li>
          <li>Are the scores computed on the examples at <em>this</em> node, not the root?</li>
          <li>Which question is being answered — best split, keep the split, or predict? They use different evidence.</li>
        </ol>
      </Sec>

      <Callout kind="key">
        Trees partition the input space with simple tests chosen greedily to reduce impurity — entropy for classes, squared error for numbers — and
        generalise only if their growth is controlled. Kernel smoothers average over a neighbourhood that moves with the query instead.
      </Callout>
    </>
  );
}
