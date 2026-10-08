import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { CVSelectLab, FoldLab } from '../../interactives/week2/CVLab';
import { CHECKS2 } from './checks';

export default function L06CV() {
  return (
    <>
      <Sec title="The target is performance beyond the sample">
        <p>
          Generalisation is how well a trained model classifies or forecasts <em>unseen</em> data. For example, a dog-vs-cat
          classifier trained on only two breeds of dog may score well in training and badly on other breeds. Nothing in the training error warns you.
        </p>
        <p>To learn anything general from a sample, we make three assumptions:</p>
        <ol>
          <li>
            examples are drawn <strong>independently and identically distributed</strong> (i.i.d.) from a distribution;
          </li>
          <li>
            the distribution is <strong>stationary</strong> — it does not change within the data;
          </li>
          <li>
            training, validation and test samples all come from the <strong>same distribution</strong>.
          </li>
        </ol>
        <p>
          In practice these are sometimes violated. A random split cannot repair an unrepresentative source dataset, and it cannot promise success after
          the world changes.
        </p>
      </Sec>

      <Sec title="Three roles, three kinds of data">
        <Table
          head={['Data', 'Allowed to influence', 'Examples']}
          rows={[
            ['Training', 'the fitted quantities', 'logistic coefficients β; the class means; the stored examples of k-NN'],
            ['Validation (development)', 'choices made before the final fit — hyperparameters and model selection', 'k, the threshold τ, the feature set, regularisation strength'],
            ['Test', 'nothing — it measures the final chosen procedure once', 'the number you report'],
          ]}
        />
        <Callout kind="warning">
          Coefficients and hyperparameters are different kinds of “parameter”. If you try thirty values of k and report the best <em>test</em> error, the
          test set has been used for selection and the reported number is optimistic (Week 1, lesson 11).
        </Callout>
      </Sec>

      <Sec title="Ways to split the available data">
        <Table
          head={['Method', 'What happens', 'Trade-off']}
          rows={[
            ['Holdout', 'fit on one subset, evaluate on a separate one', 'simple and cheap; the estimate depends on that one split'],
            [<><M t="K" />-fold CV</>, <>partition into <M t="K" /> folds; each fold is held out once while the others train</>, <><M t="K" /> fits; every observation is validated exactly once</>],
            ['Leave-one-out (LOOCV)', <>hold out one observation at a time: <M t="K = m" /></>, <>nearly all data trains each fit; <M t="m" /> fits can be costly</>],
          ]}
        />
        <p>With equal folds, each <M t="K" />-fold fit trains on and validates on</p>
        <MB t="\frac{m(K - 1)}{K} \text{ observations} \quad\text{and}\quad \frac mK \text{ observations.}" />
        <p>
          The key property: an observation is only ever predicted by a model that <em>did not train on it</em>. When CV is used for tuning, its held-out
          folds play the role of <strong>validation</strong>, even if a diagram labels them “test”.
        </p>
        <Lab title="Who trains, who validates" purpose="Each row is one fit. The reserved test set (grey) never takes part.">
          <FoldLab />
        </Lab>
      </Sec>

      <Sec title="Choosing a hyperparameter with cross-validation">
        <Callout kind="example" title="Three folds by hand">
          Twelve development observations in three folds of four. Validation mistakes:
          <Table
            head={['candidate', 'fold 1', 'fold 2', 'fold 3', 'overall']}
            rows={[
              ['k = 1', '1', '2', '1', '4/12 = 1/3'],
              ['k = 3', '1', '0', '2', '3/12 = 1/4'],
            ]}
          />
          Choose <M t="k = 3" />. With equal fold sizes the mean of the fold error rates equals total mistakes / total held out. With unequal folds,
          weight by fold size if the target is the error over all held-out observations.
        </Callout>
        <Lab
          title="Choose k for k-NN by K-fold cross-validation"
          purpose="The CV error picks k. The last column (error on fresh data from the same distribution) is what CV is trying to estimate."
        >
          <CVSelectLab />
        </Lab>
        <TryThis
          items={[
            'Compare the CV error column with the fresh-data column. CV is an estimate: close, but not equal.',
            'Press “Reshuffle the folds” several times. The CV errors — and sometimes the chosen k — change. This is the variability of a CV estimate.',
            'Set K = 2: each fit trains on only 15 points. Set K = 10: each trains on 27. Which better resembles training on all 30?',
            'Is k = 1 ever chosen? Look at its fresh-data error.',
          ]}
        />
      </Sec>

      <Sec title="Apply the split to the whole procedure">
        <div className="pipeline">
          <div className="pipe-step">
            <div className="pipe-t">1. Reserve a test set</div>
            <div className="pipe-s">untouched until the end</div>
          </div>
          <div className="pipe-step prep">
            <div className="pipe-t">2. Inside each CV split</div>
            <div className="pipe-s">fit imputation, scaling and the classifier on that split’s training part only; apply to its validation fold</div>
          </div>
          <div className="pipe-step">
            <div className="pipe-t">3. Choose the setting</div>
            <div className="pipe-s">from validation results</div>
          </div>
          <div className="pipe-step">
            <div className="pipe-t">4. Refit, then test once</div>
            <div className="pipe-s">refit the chosen procedure on all development data; evaluate on the test set</div>
          </div>
        </div>
        <Callout kind="warning" title="Leakage without labels is still leakage">
          Fitting a scaler or an imputer on <em>all</em> observations before cross-validation lets the validation folds influence the fitted procedure —
          even though no labels were used. Cross-validation does not fix that, nor does it fix repeatedly peeking at the test set to choose k.
        </Callout>
        <p>
          Finally, the best CV score among many candidates is itself a result of selection, so it tends to be optimistic. That is why the separate test set
          answers the final evaluation question.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l6.q1"
          q={<p>With m = 100 and 5-fold CV, how many observations train each fit, and how many fits are run?</p>}
          options={[
            { text: '80 per fit, 5 fits', correct: true, why: 'm(K − 1)/K = 80; one fit per fold.' },
            { text: '20 per fit, 5 fits', why: '20 is the validation fold size.' },
            { text: '99 per fit, 100 fits', why: 'That is LOOCV (K = m).' },
          ]}
        />
        <Quiz
          id="w2.l6.q2"
          q={<p>“I standardised all features using the whole dataset, then ran 10-fold CV. No labels were used, so there is no leakage.” Evaluate.</p>}
          options={[
            { text: 'Correct: leakage needs labels.', why: 'The held-out inputs still shaped the fitted means and standard deviations.' },
            { text: 'Wrong: the scaling statistics must be fitted on each fold’s training part and then applied to its validation fold.', correct: true, why: 'Every fitted step of the procedure belongs inside the fold.' },
          ]}
        />
        <Quiz
          id="w2.l6.q3"
          q={<p>Which data should choose the decision threshold τ for a logistic model?</p>}
          options={[
            { text: 'The training data, together with β.', why: 'Tuning τ on the data that fitted β tends to overfit the choice.' },
            { text: 'Validation data (or CV folds).', correct: true, why: 'τ is a modelling choice, like k: choose it on validation data, then test once.' },
            { text: 'The test data, since τ is not a coefficient.', why: 'Anything chosen on the test set makes the test result optimistic.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Generalisation is performance on new data from the same distribution. Training fits coefficients, validation (holdout or <M t="K" />-fold CV, with
        LOOCV as <M t="K = m" />) chooses settings, and an untouched test set measures the final procedure once. Every fitted step — including
        preprocessing — must be fitted on the training portion only.
      </Callout>

      <Checklist id="w2-cv" items={CHECKS2['w2-cv']} />
    </>
  );
}
