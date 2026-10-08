import { M, MB } from '../components/Math';
import { CHECKS } from './checks';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../components/ui';
import { LikelihoodLab } from '../interactives/LikelihoodLab';

export default function L07MLE() {
  return (
    <>
      <Sec title="The question: why squares?">
        <p>
          So far squared error has been justified by convenience: smooth, solvable, non-negative. That leaves an uncomfortable question — is it just a
          convenient choice, or is there a principled reason? The answer comes from telling a <em>story about how the data were generated</em>, and then
          asking which parameters make the observed data most plausible under that story. Squared error falls out.
        </p>
      </Sec>

      <Sec title="A story about how observations arise">
        <p>
          A fitted rule cannot explain every measurement exactly: some influences are unmodelled or simply random. So write each observation as a
          predictable part plus an error:
        </p>
        <MB t="y = f(\bx) + \varepsilon, \qquad y_j = \bx_j\T\theta + \varepsilon_j." />
        <p>
          Now make an assumption about the errors: they are <strong>independent and identically distributed</strong> (i.i.d.) Gaussian with mean 0 and
          a common variance <M t="\sigma^2" />:
        </p>
        <MB t="\varepsilon_j \sim \N(0, \sigma^2), \qquad p(\varepsilon_j) = \frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big(-\frac{\varepsilon_j^2}{2\sigma^2}\Big)." />
        <p>
          Since <M t="\varepsilon_j = y_j - \bx_j\T\theta" />, this is the same as saying that, given the input, the output is Gaussian around the line:
        </p>
        <MB t="p(y_j\mid\bx_j;\theta) = \frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big(-\frac{(y_j - \bx_j\T\theta)^2}{2\sigma^2}\Big), \qquad\text{i.e.}\qquad y_j\mid\bx_j \sim \N(\bx_j\T\theta, \sigma^2)." />
        <Callout kind="note">
          The mean of the Gaussian moves with the input; the spread does not. Also, this is a probability <em>density</em>: for a continuous{' '}
          <M t="y" />, the probability of any exact value is 0. Densities can exceed 1; what matters is comparing them.
        </Callout>
      </Sec>

      <Sec title="Choose the parameters that make the data most plausible">
        <p>
          Hold the observed data fixed and view the joint density as a function of <M t="\theta" />. That is the <strong>likelihood</strong>:{' '}
          <M t="\Lik(\theta) = p(\by\mid X;\theta)" />. Independence lets us multiply:
        </p>
        <MB t="\Lik(\theta) = \prod_{j=1}^m p(y_j\mid\bx_j;\theta) = \prod_{j=1}^m \frac{1}{\sqrt{2\pi\sigma^2}}\exp\!\Big(-\frac{(y_j - \bx_j\T\theta)^2}{2\sigma^2}\Big)." />
        <p>
          <strong>Maximum likelihood</strong> picks the <M t="\theta" /> that maximises this. Note that <M t="\Lik(\theta)" /> is <em>not</em> a
          probability distribution over <M t="\theta" /> — it need not integrate to 1 over θ. It scores each candidate θ by how well it explains the
          observations.
        </p>
        <Steps
          intro={<p>Products of exponentials are awkward; logs turn them into sums. Because log is strictly increasing, it does not move the maximiser.</p>}
          steps={[
            {
              title: 'Take the log of the product',
              body: <MB t="\ell(\theta) = \log\Lik(\theta) = \sum_{j=1}^m \Big[\log\frac{1}{\sqrt{2\pi\sigma^2}} - \frac{(y_j - \bx_j\T\theta)^2}{2\sigma^2}\Big]." />,
            },
            {
              title: 'Separate what depends on θ',
              body: <MB t="\ell(\theta) = \underbrace{-\frac m2\log(2\pi\sigma^2)}_{\text{constant in }\theta} \;-\; \frac{1}{2\sigma^2}\underbrace{\sum_{j=1}^m (y_j - \bx_j\T\theta)^2}_{\SSE(\theta)}." />,
            },
            {
              title: 'Maximising ℓ = minimising SSE',
              body: (
                <>
                  <MB t="\boxed{\;\argmax_\theta\,\ell(\theta) = \argmin_\theta\,\SSE(\theta)\;}" />
                  <p>
                    The first term does not involve θ, and the second is a <em>negative</em> constant times SSE. So the least-squares solution is the
                    maximum-likelihood estimate. And Σ(yⱼ − xⱼᵀθ)² is just the SSE (RSS) from lesson 2.
                  </p>
                </>
              ),
            },
            {
              title: 'σ² does not matter for θ',
              body: (
                <p>
                  Changing <M t="\sigma^2" /> rescales the SSE term and shifts the constant, but every positive rescaling has the same minimiser. So you
                  get the same <M t="\hat\theta" /> without knowing the noise level.
                </p>
              ),
            },
          ]}
        />
      </Sec>

      <Sec title="See it">
        <Lab
          title="Likelihood as a product of densities"
          purpose="Each data point is scored by the height of its Gaussian at the observed y (orange bar). The likelihood multiplies those heights; maximising it puts the line where the points sit near the peaks."
        >
          <LikelihoodLab />
        </Lab>
        <TryThis
          items={[
            'Move the slope away from −1 and watch the orange bars: points far from the line sit in the thin tails, so their densities — and the product — collapse.',
            'Change σ. The whole ℓ curve moves and changes shape, but its peak stays at θ₁ = −1, exactly where SSE is smallest.',
            'Make σ very small (0.5). The likelihood becomes extremely sensitive to the worst point — a probabilistic view of outlier sensitivity.',
            'Press “Set σ = √(SSE/m)” at θ₁ = −1. That is the maximum-likelihood estimate of σ (here √8 ≈ 2.83).',
          ]}
        />
      </Sec>

      <Sec title="Where each assumption was used">
        <Table
          head={['Assumption', 'Where it entered']}
          rows={[
            ['Linear mean 𝐱ⱼᵀθ', 'it is the centre of each Gaussian'],
            ['Errors have mean 0', 'centres the Gaussian on the line rather than above or below it'],
            ['Common variance σ²', 'every squared residual gets the same weight 1/(2σ²); unequal variances would give weighted least squares'],
            ['Independence', 'lets the joint density factor into a product, so the log becomes a sum'],
            ['Gaussian shape', 'its log is −(error)²/(2σ²): this is literally where the square comes from'],
          ]}
        />
        <Callout kind="warning" title="Keep the implication pointing the right way">
          Gaussian i.i.d. errors <em>justify</em> squared loss through maximum likelihood. The converse is false: you can define and solve least squares
          without assuming anything about the noise. The optimisation problem and its probabilistic interpretation are separate claims.
        </Callout>
        <Callout kind="intuition" title="Different noise, different loss (going deeper)">
          Swap the Gaussian for a Laplace distribution, <M t="p(\varepsilon) \propto \exp(-|\varepsilon|/b)" />. The same steps give{' '}
          <M t="\ell(\theta) = \text{const} - \tfrac1b\sum_j|y_j - \bx_j\T\theta|" />, so maximum likelihood now minimises the sum of{' '}
          <em>absolute</em> errors. Heavier-tailed noise expects occasional large errors and therefore punishes them less — which is why absolute loss is
          more robust to outliers. The choice of loss is a hidden assumption about the noise.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="l7.q1"
          q={<p>Which step of the derivation uses the independence assumption?</p>}
          options={[
            { text: 'Writing the joint density as a product over j.', correct: true, why: 'Only for independent observations does p(𝐲|X;θ) factor into Πⱼ p(yⱼ|𝐱ⱼ;θ).' },
            { text: 'Taking the logarithm.', why: 'The log is valid for any positive function; it needs no assumption.' },
            { text: 'Dropping −(m/2)log(2πσ²).', why: 'That uses only that the term does not depend on θ.' },
          ]}
        />
        <Quiz
          id="l7.q2"
          q={<p>Doubling σ (keeping everything else fixed) changes the maximum-likelihood θ̂ how?</p>}
          options={[
            { text: 'θ̂ doubles.', why: 'σ² multiplies the SSE term by a positive constant; the minimiser of SSE is unaffected.' },
            { text: 'θ̂ is unchanged.', correct: true, why: 'σ² does not affect the choice of θ.' },
            { text: 'θ̂ becomes zero.', why: 'Nothing in the derivation pushes θ towards zero.' },
          ]}
        />
        <Quiz
          id="l7.q3"
          q={<p>Your residuals clearly have a heavy-tailed, non-Gaussian distribution. Which statement is correct?</p>}
          options={[
            { text: 'Least squares can no longer be computed.', why: 'The normal equations do not depend on the noise distribution at all.' },
            { text: 'Least squares still computes, but its maximum-likelihood justification no longer applies; a more robust loss may be better.', correct: true, why: 'The optimisation is fine; the probabilistic interpretation is what weakens.' },
            { text: 'Taking logs of y fixes it automatically.', why: 'Transformations can help in some cases but there is no automatic fix.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        If <M t="y_j = \bx_j\T\theta + \varepsilon_j" /> with i.i.d. <M t="\varepsilon_j\sim\N(0,\sigma^2)" />, then{' '}
        <M t="\ell(\theta) = -\tfrac m2\log(2\pi\sigma^2) - \SSE(\theta)/(2\sigma^2)" />, so maximum likelihood is exactly least squares, and σ² does not
        affect <M t="\hat\theta" />. The square in the loss is the log of the Gaussian.
      </Callout>

      <Checklist id="mle" items={CHECKS.mle} />
    </>
  );
}
