import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, TryThis } from '../../components/ui';
import { GaussNBLab } from '../../interactives/week3/GaussNBLab';
import { CHECKS3 } from './checks';

export default function L12GNB() {
  return (
    <>
      <Sec title="Replace the frequency table with a density">
        <p>
          A continuous measurement — a temperature of 66.3° — seldom repeats exactly, so a table of exact-value counts is useless. The usual assumption:
          <em>given the class</em>, each numeric attribute is Gaussian,
        </p>
        <MB t="X_j \mid Y = c \;\sim\; \N(\mu_{jc}, \sigma^2_{jc}), \qquad p(x_j \mid c) = \frac{1}{\sqrt{2\pi}\,\sigma_{jc}}\exp\Big(-\frac{(x_j - \mu_{jc})^2}{2\sigma_{jc}^2}\Big)." />
        <p>
          The mean locates the class’s typical value; the standard deviation describes its spread. As before, multiply the feature densities and the prior,
          then compare class scores. Conditional independence is still assumed — the Gaussian shape does not imply it.
        </p>
      </Sec>

      <Sec title="Estimate the parameters within each class">
        <p>
          For class <M t="c" /> with <M t="n_c" /> examples, we use the sample mean and the sample standard deviation (dividing by{' '}
          <M t="n - 1" />), separately for each class:
        </p>
        <MB t="\hat\mu_{jc} = \frac{1}{n_c}\sum_{i\in I_c} x_{ij}, \qquad s_{jc} = \sqrt{\frac{1}{n_c - 1}\sum_{i\in I_c}(x_{ij} - \hat\mu_{jc})^2}." />
        <p>
          The Gaussian <em>maximum-likelihood</em> variance divides by <M t="n_c" /> instead. These are different conventions — use the one requested. Missing
          values during training are simply left out of the mean and standard deviation for that feature and class.
        </p>
        <Callout kind="example" title="A density value">
          Temperature in class “yes” has <M t="\mu = 73" />, <M t="\sigma = 6.2" />. At 66:
          <MB t="p(66 \mid \text{yes}) = \frac{1}{\sqrt{2\pi}\times 6.2}\exp\Big(-\frac{(66 - 73)^2}{2\times 6.2^2}\Big) \approx 0.0340." />
          Multiply this by the other features’ factors and by <M t="P(\text{yes})" />; on its own it is not the posterior probability of “yes”.
        </Callout>
        <Callout kind="warning" title="A density is not a point probability">
          For a continuous variable <M t="P(X = 66 \mid c) = 0" />; <M t="p(66 \mid c)" /> is a density, and probabilities are areas over intervals.
          Densities can exceed 1 (a Gaussian with <M t="\sigma = 0.1" /> peaks near 4). After normalising the class scores at the observed{' '}
          <M t="x" />, the resulting posteriors are ordinary probabilities that sum to 1.
        </Callout>
        <p className="small muted">
          Careful: dividing the squared deviations by <M t="n - 1" /> gives a variance; the standard
          deviation needs the square root. The Gaussian prefactor is <M t="1/(\sqrt{2\pi}\,\sigma) = 1/\sqrt{2\pi\sigma^2}" />. A zero estimated variance makes
          the density degenerate and needs separate handling.
        </p>
        <Lab title="Gaussian class-conditionals for temperature" purpose="Each class’s temperatures are summarised by a mean and a standard deviation. Move the query and compare the densities and the posterior.">
          <GaussNBLab />
        </Lab>
        <TryThis
          items={[
            'At 66° the “yes” density is about 0.0340 because the “yes” data have mean 73 and s ≈ 6.16.',
            'Switch to the MLE convention: both spreads shrink slightly, the curves get taller and narrower, and posteriors far from the means change most.',
            'Move the query to 90°. The “no” class is more spread out, so it wins in both tails even though its mean (74.6) is close to “yes” (73).',
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l12.q1"
          q={<p>A class has values (1, 2, 6). What are its sample variance (n − 1) and its MLE variance?</p>}
          options={[
            { text: '7 and 14/3', correct: true, why: 'Mean 3; squared deviations 4 + 1 + 9 = 14; 14/2 = 7 and 14/3.' },
            { text: '14/3 and 7', why: 'The MLE divides by n = 3 and is the smaller one.' },
            { text: '√7 and √(14/3)', why: 'Those are standard deviations.' },
          ]}
        />
        <Quiz
          id="w3.l12.q2"
          q={<p>A Gaussian NB model reports p(x | c) = 1.8 at the query. What follows?</p>}
          options={[
            { text: 'Something is wrong — probabilities cannot exceed 1.', why: 'It is a density, which can exceed 1 when σ is small.' },
            { text: 'Nothing is wrong; it is a density value. Combine it with the prior and other factors, then normalise.', correct: true, why: 'Only the normalised posteriors must lie in [0, 1].' },
          ]}
        />
        <Quiz
          id="w3.l12.q3"
          q={<p>Which assumptions does Gaussian Naive Bayes make about two numeric features?</p>}
          options={[
            { text: 'Each is Gaussian within each class, and they are independent given the class.', correct: true, why: 'Both the distributional form and conditional independence.' },
            { text: 'Each is Gaussian overall.', why: 'The assumption is per class; the overall distribution is a mixture.' },
            { text: 'Gaussian features are automatically independent.', why: 'Independence is a separate assumption.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Gaussian Naive Bayes models each numeric feature, within each class, as <M t="\N(\mu_{jc}, \sigma^2_{jc})" /> with parameters estimated from that
        class’s data. Its densities replace count-based probabilities in the product <M t="P(c)\prod_j p(x_j \mid c)" />; they are not probabilities
        themselves, but the normalised posteriors are.
      </Callout>

      <Checklist id="w3-gnb" items={CHECKS3['w3-gnb']} />
    </>
  );
}
