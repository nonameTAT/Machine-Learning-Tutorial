import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { ImputeLab } from '../../interactives/week2/ImputeLab';
import { CHECKS2 } from './checks';

export default function L10Missing() {
  return (
    <>
      <Sec title="Missing is not the same as zero">
        <p>
          Real data are rarely complete and homogeneous. Values go missing through human error, sensor faults, software bugs and faulty
          preprocessing. A blank temperature reading does not mean 0 °C, and an unrecorded category is not automatically one of the recorded ones.
        </p>
        <p>
          Missingness can also be <em>related to the values</em>: a sensor that fails when it overheats loses exactly the high readings; a survey question
          about income is skipped more often by some groups. The question is therefore not just “how do I make the table numeric?” but{' '}
          <strong>which replacement or model behaviour is defensible</strong>, what information it loses, and how the same rule will treat incomplete
          inputs in the future.
        </p>
      </Sec>

      <Sec title="Common approaches and their trade-offs">
        <Table
          head={['Approach', 'Why use it', 'Main limitation']}
          rows={[
            ['Delete examples (rows)', 'simple; fine if little data is lost and the rest is representative', 'dangerous when values are not missing completely at random; no rule for missing values in test data; poor when much is missing'],
            ['Delete attributes (columns)', 'removes an unreliable attribute', 'only fine if it does not hurt performance — check on validation data'],
            ['Replace with mean / median / mode', 'easy; keeps every row; gives a rule for missing test values', 'a proxy for the unknown value; shrinks the variance and distorts relationships (“adds bias”)'],
            ['A unique “missing” category', 'easy; no data loss; distinguishes “unknown” from known categories', 'categorical features only; an extra category can add variance'],
            ['Predict the missing value', 'uses relationships with other features; the same model serves training and test', 'another model with its own errors; still a proxy; also reduces variance'],
            ['Algorithms that support missing values', 'no imputation model needed; each model handles it in its own way', 'few algorithms do (decision trees and Naive Bayes are examples), and only in particular implementations'],
          ]}
        />
      </Sec>

      <Sec title="Why imputation shrinks the spread">
        <Callout kind="example" title="Worked example">
          Observed values 2, 4, 6 have mean 4 and average squared deviation <M t="(4 + 0 + 4)/3 = 8/3" />. Fill a fourth, missing value with the mean, 4.
          It adds no deviation but increases the count:
          <MB t="\frac{4 + 0 + 4 + 0}{4} = 2 < \frac83." />
          The completed column looks less variable than the data we actually saw, even though the true missing value is still unknown.
        </Callout>
        <Lab
          title="Delete or impute?"
          purpose="Top row: the true values (orange ones went missing). Middle: what was observed. Bottom: the data after your chosen treatment. Compare the means and spreads."
        >
          <ImputeLab />
        </Lab>
        <TryThis
          items={[
            'Missing at random, mean imputation, 10 missing: the completed mean stays close to the truth, but the standard deviation shrinks below the true one — the 10 filled values are identical.',
            'Switch to “Large values go missing”. Now deleting rows and mean imputation both underestimate the mean: the observed values are no longer representative. Imputation cannot recover information that is not there.',
            'With missing at random and deletion, the kept rows estimate the mean and spread reasonably — but you have lost rows, and you have no rule for a test case with the value missing.',
          ]}
        />
        <Callout kind="warning">
          A completed dataset should not be treated as if every filled value had been observed. A more elaborate predictive imputer is not automatically
          better: its assumptions and errors matter too.
        </Callout>
      </Sec>

      <Sec title="Respect the validation boundary">
        <p>
          The imputation value (a mean, a median, an imputation model) is <em>fitted</em>, just like a coefficient. Fit it on the training portion only, then
          apply that same fitted rule to validation and test inputs; inside cross-validation, refit it within each fold’s training portion (lesson 6).
          The same discipline applies to scaling after imputation (lesson 15).
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l10.q1"
          q={<p>Why can deleting incomplete rows bias the result even when plenty of rows remain?</p>}
          options={[
            { text: 'It cannot — fewer rows only increases variance.', why: 'If missingness depends on the values, the rows that remain are a skewed sample.' },
            { text: 'If some kinds of cases are more likely to be missing, the remaining sample no longer represents the population.', correct: true, why: 'A large but unrepresentative sample is still unrepresentative.' },
          ]}
        />
        <Quiz
          id="w2.l10.q2"
          q={<p>Values 3, 5, 7 are observed and one value is missing. After mean imputation, what is the average squared deviation of the four values?</p>}
          options={[
            { text: '8/3', why: 'That is for the three observed values.' },
            { text: '2', correct: true, why: 'The filled value is 5, adding 0 deviation: (4 + 0 + 4 + 0)/4 = 2.' },
            { text: '4', why: 'Divide by the number of values, 4.' },
          ]}
        />
        <Quiz
          id="w2.l10.q3"
          q={<p>You compute the median of a feature on the full dataset and use it to fill gaps before 5-fold CV. What is wrong?</p>}
          options={[
            { text: 'Nothing: the median is robust.', why: 'Robustness is not the issue; the validation folds influenced the fitted imputation value.' },
            { text: 'The median should be fitted on each fold’s training portion and then applied to its validation fold.', correct: true, why: 'Imputation is part of the fitted procedure.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Missing values are a modelling decision. Deletion can bias the sample and gives no rule for future gaps; mean/median/mode imputation keeps rows but
        shrinks variance and distorts relationships; a “missing” category or a predictive imputer trades other costs. Whatever you choose, fit it on
        training data only.
      </Callout>

      <Checklist id="w2-missing" items={CHECKS2['w2-missing']} />
    </>
  );
}
