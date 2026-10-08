import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, TryThis } from '../../components/ui';
import { LikelihoodLab } from '../../interactives/LikelihoodLab';
import { NoiseLossLab } from '../../interactives/week3/NoiseLossLab';
import { CHECKS3 } from './checks';

export default function L06GaussNoise() {
  return (
    <>
      <Sec title="Where do P(D | h) and P(h) come from?">
        <p>
          To use Bayes’ theorem we need the likelihood and the prior. There are two routes: estimate them <em>empirically</em> from counts in the data
          (Naive Bayes, lessons 9–11), or assume a <em>parametric model</em> and estimate its parameters from the data. This lesson takes the second route for
          regression — and recovers Week 1’s squared error.
        </p>
      </Sec>

      <Sec title="Learning a real-valued function">
        <p>Training examples <M t="(x_i, y_i)" /> are noisy values of a target function:</p>
        <MB t="y_i = f(x_i) + \varepsilon_i, \qquad \varepsilon_i \sim \N(0, \sigma^2) \text{ independently for each } i." />
        <p>
          Under a hypothesis <M t="h" />, each <M t="y_i" /> is Gaussian around <M t="h(x_i)" />, and its density decreases exponentially with the{' '}
          <em>squared</em> distance from that mean:
        </p>
        <MB t="p(y_i \mid x_i, h) = \frac{1}{\sqrt{2\pi\sigma^2}}\exp\Big(-\frac{(y_i - h(x_i))^2}{2\sigma^2}\Big)." />
        <Steps
          intro={<p>Treat the inputs and σ² as fixed. The ML hypothesis maximises the probability of the observed targets.</p>}
          steps={[
            {
              title: 'Multiply (independence across observations)',
              body: <MB t="h_{\text{ML}} = \argmax_{h\in H} P(D \mid h) = \argmax_{h\in H}\prod_{i=1}^n \frac{1}{\sqrt{2\pi\sigma^2}}e^{-\frac{(y_i - h(x_i))^2}{2\sigma^2}}." />,
            },
            {
              title: 'Take the log (strictly increasing, keeps the maximiser)',
              body: <MB t="\log P(D \mid h) = -\frac n2\log(2\pi\sigma^2) - \frac{1}{2\sigma^2}\sum_{i=1}^n (y_i - h(x_i))^2." />,
            },
            {
              title: 'Drop what cannot affect the comparison',
              body: (
                <p>
                  The first term does not involve <M t="h" />. The factor <M t="1/(2\sigma^2)" /> is positive and fixed. Maximising a negative multiple of the
                  squared error is minimising the squared error.
                </p>
              ),
            },
            {
              title: 'Result',
              body: (
                <>
                  <MB t="\boxed{\;h_{\text{ML}} = \argmin_{h\in H}\sum_{i=1}^n (y_i - h(x_i))^2\;}" />
                  <p>Dividing by <M t="n" /> gives the MSE — same minimiser. This is Week 1’s lesson 7, now as an instance of Bayesian learning.</p>
                </>
              ),
            },
          ]}
        />
        <Callout kind="note" title="What the result does — and does not — say">
          Independent, zero-mean Gaussian noise with a common variance makes least squares the maximum-likelihood procedure. It does not say every dataset
          has Gaussian noise, nor that a small training error guarantees generalisation.
        </Callout>
      </Sec>

      <Sec title="The noise model decides which mistakes matter">
        <Callout kind="example" title="Worked example">
          Two candidate models have residuals <M t="(1, 1)" /> and <M t="(0, 2)" />. Both have total absolute error 2, but squared errors 2 and 4. Under the
          same Gaussian noise the first model is more likely: Gaussian noise considers one large error much less plausible than two moderate ones.
        </Callout>
        <Lab title="Noise model → loss" purpose="The loss each residual pays is minus the log of its noise density. Compare the two candidate models under each noise assumption.">
          <NoiseLossLab />
        </Lab>
        <TryThis
          items={[
            'Gaussian noise: model A (1, 1) beats model B (0, 2). Switch to Laplace: they tie, since both have Σ|e| = 2.',
            'Under Laplace noise, set model B to (0, 1.8). Laplace now prefers B — a different noise assumption, a different answer.',
            'Compare the curves at |ε| = 3: the parabola charges 4.5, the V only 3. Heavier-tailed noise expects occasional big errors and punishes them less.',
          ]}
        />
        <Lab title="From Week 1: likelihood as a product of densities" purpose="Each point is scored by the height of its Gaussian at the observed y; the likelihood multiplies them.">
          <LikelihoodLab />
        </Lab>
        <Callout kind="warning" title="Two different independence assumptions">
          This derivation assumes independence <em>across training observations</em>. Naive Bayes (lesson 9) assumes independence <em>across features given
          the class</em>. They act on different parts of the model.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l6.q1"
          q={<p>In the derivation, which step uses the independence of the noise terms?</p>}
          options={[
            { text: 'Writing P(D | h) as a product over i.', correct: true, why: 'Only independent observations give a product of densities.' },
            { text: 'Taking the log.', why: 'The log needs no assumption.' },
            { text: 'Dropping −(n/2)log(2πσ²).', why: 'That uses only that the term does not depend on h.' },
          ]}
        />
        <Quiz
          id="w3.l6.q2"
          q={<p>If σ² doubles, how does h_ML change?</p>}
          options={[
            { text: 'It does not: σ² only rescales the squared-error term and shifts a constant.', correct: true, why: 'A positive rescaling keeps the same minimiser.' },
            { text: 'It moves towards zero.', why: 'Nothing in the objective penalises the size of h.' },
            { text: 'It becomes the least-absolute-error fit.', why: 'That needs Laplace noise, not a larger Gaussian variance.' },
          ]}
        />
        <Quiz
          id="w3.l6.q3"
          q={<p>Residuals (2, 0, 0) versus (1, 1, 1) under Gaussian noise. Which model is more likely?</p>}
          options={[
            { text: '(1, 1, 1): SSE 3 < 4', correct: true, why: 'Gaussian likelihood depends on the sum of squares.' },
            { text: '(2, 0, 0): two perfect predictions', why: 'One large residual costs 4, more than three residuals of 1.' },
            { text: 'They tie', why: 'They tie on absolute error (Laplace), not on squared error.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        If <M t="y_i = f(x_i) + \varepsilon_i" /> with independent <M t="\varepsilon_i \sim \N(0, \sigma^2)" />, the log-likelihood is a constant minus{' '}
        <M t="\tfrac{1}{2\sigma^2}\sum_i(y_i - h(x_i))^2" />, so the ML hypothesis minimises squared error. The loss is the negative log of the noise
        density: change the noise model and you change which mistakes matter.
      </Callout>

      <Checklist id="w3-gaussnoise" items={CHECKS3['w3-gaussnoise']} />
    </>
  );
}
