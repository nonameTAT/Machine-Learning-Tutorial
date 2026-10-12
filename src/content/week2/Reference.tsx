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

export default function Reference2() {
  return (
    <>
      <div className="btn-row">
        <button className="btn" onClick={() => window.print()}>
          Print / save as PDF
        </button>
        <span className="kbd-hint">
          m = observations, d = features, k = neighbours, K = CV folds, <M t="\bxt = (1, x_1, \dots, x_d)\T" />.
        </span>
      </div>

      <Sec title="Boundaries and probabilities">
        <Row f="P(Y = c \mid \bx) = \frac{p(\bx \mid Y = c)\,P(Y = c)}{p(\bx)} \;\propto\; p(\bx \mid Y = c)\,P(Y = c)" note="generative: compare likelihood × prior; p(x) is shared" />
        <Row f="\bw = \bp - \bn, \qquad t = \frac{\|\bp\|^2 - \|\bn\|^2}{2}, \qquad \text{positive if } \bx\T\bw > t" note="basic linear classifier = nearest class mean under Euclidean distance; state a tie rule" />
        <Row f="z = \bxt\T\beta, \qquad h_\beta(\bx) = \sigma(z) = \frac{1}{1 + e^{-z}}, \qquad P(Y = 0 \mid \bx) = 1 - h_\beta(\bx)" />
        <Row f="\sigma(z) \ge \tau \iff z \ge \log\frac{\tau}{1 - \tau} \quad (0 < \tau < 1)" note="τ = 0.5 gives the linear boundary z = 0; changing τ needs no refit" />
      </Sec>

      <Sec title="Logistic fitting (average-loss convention)">
        <Row f="P(y \mid \bx) = p^{\,y}(1 - p)^{1 - y}, \qquad J(\beta) = -\frac1m\sum_{j=1}^m\big[y_j\log p_j + (1 - y_j)\log(1 - p_j)\big]" note="independence ⇒ product likelihood; log loss = binary cross-entropy" />
        <Row f="\sigma'(z) = \sigma(z)\big(1 - \sigma(z)\big), \qquad \frac{\partial L}{\partial z} = p - y, \qquad \nabla J = \frac1m X\T(\bp - \by)" />
        <Row f="\beta_{\text{new}} = \beta_{\text{old}} - \frac\alpha m X\T(\bp - \by)" note="probabilities from the old β; no closed form; convex, but separable or redundant data give no unique finite optimum" />
      </Sec>

      <Sec title="Evaluation">
        <div className="ref-note" style={{ margin: '8px 0' }}>
          Train → fit · Validation / K-fold CV → choose (k, τ, features) · Test → report once. K-fold: each fit trains on m(K − 1)/K; LOOCV is K = m. Fit
          preprocessing inside each training fold.
        </div>
        <Table
          head={['actual ↓ / predicted →', 'positive', 'negative']}
          rows={[
            ['positive', 'TP', 'FN'],
            ['negative', 'FP', 'TN'],
          ]}
        />
        <Row f="\Acc = \frac{\TP + \TN}{m}, \qquad \text{error} = 1 - \Acc" />
        <Row f="\Prec = \frac{\TP}{\TP + \FP}, \qquad \Rec = \TPR = \frac{\TP}{\TP + \FN}, \qquad \FPR = \frac{\FP}{\FP + \TN}" note="denominators: predicted positives · actual positives · actual negatives; FPR ≠ 1 − precision" />
        <Row f="\Fone = \frac{2\,\Prec\cdot\Rec}{\Prec + \Rec} = \frac{2\TP}{2\TP + \FP + \FN}" note="ignores TN; a 0/0 metric is undefined, not 0" />
        <div className="ref-note" style={{ marginBottom: 12 }}>
          ROC: plot (FPR, TPR) as the threshold falls; a positive steps up, a negative steps right, ties cross together. AUC = area = P(random positive
          outranks random negative); 1 perfect, 0.5 random ranking; invariant to increasing transforms of the scores.
        </div>
      </Sec>

      <Sec title="Data">
        <div className="ref-note" style={{ marginBottom: 8 }}>
          Types: irrelevant · nominal · binary · ordinal · count · time (cyclic) · interval. Codes for categories are not distances. Missing values: delete
          rows / columns, mean–median–mode, “missing” category, predict, or a model that supports them — imputation shrinks variance; fit it on training data.
        </div>
        <Row f="x'_r = \frac{x_r - a_r}{b_r - a_r} \;\;(\text{min-max}), \qquad x'_r = \frac{x_r - \mu_r}{s_r} \;\;(\text{z-score})" note="a, b, μ, s from training data only; constant features need a policy; nominal → matching distance" />
      </Sec>

      <Sec title="Distances and exemplars">
        <Row f="d_p(\bx, \bz) = \Big(\sum_{r=1}^d|x_r - z_r|^p\Big)^{1/p}, \qquad d_\infty = \max_r|x_r - z_r|, \qquad d_0 = \sum_r\Ind[x_r \ne z_r]" note="p = 1 Manhattan, 2 Euclidean; metric for p ≥ 1 only; d₀ is a metric but not a norm" />
        <div className="ref-note" style={{ marginBottom: 8 }}>
          Metric: Dis(x, x) = 0 · x ≠ y ⇒ Dis &gt; 0 · symmetric · Dis(x, z) ≤ Dis(x, y) + Dis(y, z). Allow 0 for distinct points ⇒ pseudometric. Squared
          Euclidean is not a metric but ranks like Euclidean.
        </div>
        <Row f="\sum_j\|\bx_j - \mathbf c\|^2 = \sum_j\|\bx_j - \bmu\|^2 + m\|\mathbf c - \bmu\|^2" note="mean = unique minimiser of squared distance; geometric median: unsquared; medoid: best observed point, O(n²)" />
      </Sec>

      <Sec title="k-nearest neighbours">
        <Row f="\hat y_q = \argmax_{v\in V}\sum_{j\in N_k(\bx_q)}\Ind[y_j = v], \qquad \hat P(Y = 1 \mid \bx_q) = \frac1k\sum_{j\in N_k(\bx_q)}\Ind[y_j = 1]" note="regression: mean of neighbours; state tie rules" />
        <Row f="\hat y_q = \argmax_{v\in V}\sum_{j\in N_k(\bx_q)} w_j\,\Ind[y_j = v], \qquad w_j = \frac{1}{d(\bx_q, \bx_j)^2}" note="regression: Σwⱼyⱼ / Σwⱼ; k = m is Shepard’s method; resolve d = 0 first; with stored s = d², w = 1/s" />
        <Row f="d_z(\bx_q, \bx_i) = \sqrt{\sum_r z_r(x_{qr} - x_{ir})^2}, \qquad z_r \ge 0" note="attribute weights by CV; z_r = 0 removes a feature" />
        <div className="ref-note" style={{ marginBottom: 12 }}>
          1-NN training error = 0 (self-match) ⇒ use LOOCV. Query O(md) brute force; LOOCV O(m²d). Small k: low bias, high variance; k = m (unweighted):
          majority class. High d: b<sup>d</sup> cells, distance concentration, irrelevant features swamp relevant ones.
        </div>
      </Sec>

      <Sec title="What each model keeps">
        <Table
          head={['Model', 'Retains', 'Predicts by', 'Typical limitation']}
          rows={[
            ['Basic linear / nearest centroid', 'one mean per class', 'nearest class mean', 'misses multimodal or irregular classes'],
            ['Logistic regression', 'coefficient vector β', 'σ(score) and a threshold', 'linear boundary in the chosen features; unstable with collinearity'],
            ['k-NN', 'all training examples + distance, k, vote rule', 'vote of the k nearest', 'query cost, scaling, irrelevant features, high dimension'],
          ]}
        />
      </Sec>

      <Callout kind="key">
        A classifier is a complete chain: representation, fitted rule or stored examples, decision policy, and evaluation. The same probabilities give
        different labels at different thresholds; the same data give different neighbours under different distances. Test the whole procedure on data that
        did not shape its choices.
      </Callout>
    </>
  );
}
