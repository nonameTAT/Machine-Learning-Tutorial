import { M, MB } from '../../../components/Math';
import { Callout, Lab, Picture, Quiz, Sec, Steps, TryThis } from '../../../components/ui';
import pipeline from '../images/pipeline.svg';
import { ExampleLab } from '../labs/ExampleLab';

// A lesson is the page body only: the shell adds the title and question above it, and the
// checklist (from index.ts), notes, “mark as understood” and pager below it.
// Each <Sec> becomes an entry in the “On this page” outline.

export default function ExampleLesson() {
  return (
    <>
      <Sec title="Text and maths">
        <p>
          Paragraphs are plain JSX. Inline maths uses <M t="\hat y = \theta x" />; display maths uses <code>MB</code>:
        </p>
        <MB t="\SSE(\theta) = \sum_{j=1}^{m} (y_j - \theta x_j)^2." />
        <Callout kind="intuition" title="Callout kinds">
          intuition, definition, warning, note, example, key and theorem each get their own colour and icon.
        </Callout>
      </Sec>

      <Sec title="A picture">
        <Picture src={pipeline} alt="Data flows into a model, which outputs a prediction" caption="Put image files in images/ and import them." width={480} invert />
      </Sec>

      <Sec title="An interactive lab">
        <Lab title="Fit a line by eye" purpose="Move the slope and watch the residuals and the squared error.">
          <ExampleLab />
        </Lab>
        <TryThis items={['Find the slope that makes the error smallest.', 'Which point has the largest residual at θ = 1?']} />
      </Sec>

      <Sec title="A step-by-step derivation">
        <Steps
          steps={[
            { title: 'Differentiate', body: <MB t="\frac{d}{d\theta}\SSE = -2\sum_j x_j (y_j - \theta x_j)" /> },
            { title: 'Set to zero and solve', body: <MB t="\hat\theta = \frac{\sum_j x_j y_j}{\sum_j x_j^2}" /> },
          ]}
        />
      </Sec>

      <Sec title="Check your understanding">
        {/* ids only need to be unique within this lesson; answers are saved per lesson */}
        <Quiz
          id="q1"
          q={<p>Why is the sum of squared errors never negative?</p>}
          options={[
            { text: 'Each term is a square.', correct: true, why: 'A sum of squares of real numbers is at least 0.' },
            { text: 'Because the residuals sum to zero.', why: 'That holds for least squares with an intercept, and says nothing about the sign of the squares.' },
          ]}
        />
      </Sec>

      <Callout kind="key">End with the central idea in two or three sentences.</Callout>
    </>
  );
}
