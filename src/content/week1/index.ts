import { defineWeek } from '../../course/types';
import Overview from './Overview';
import Reference from './Reference';
import practice from './practice';
import Learning from './lessons/Learning';
import Loss from './lessons/Loss';
import Stats from './lessons/Stats';
import Ols1d from './lessons/Ols1d';
import Matrix from './lessons/Matrix';
import GD from './lessons/GD';
import MLE from './lessons/MLE';
import Assumptions from './lessons/Assumptions';
import Features from './lessons/Features';
import Regularisation from './lessons/Regularisation';
import Evaluation from './lessons/Evaluation';
import KNN from './lessons/KNN';
import BiasVariance from './lessons/BiasVariance';

export default defineWeek({
  n: 1,
  title: 'Regression',
  summary: 'From fitting a line to reasoning about generalisation — an interactive study guide to linear regression and its foundations.',
  // Week 1 predates route prefixes: its pages live at #/learning, #/loss, … and saved progress uses those ids.
  prefix: '',
  overview: Overview,
  parts: [
    {
      title: 'I · The prediction problem',
      lessons: [
        {
          slug: 'learning',
          title: 'What is being learned?',
          question: 'What does a regression model actually learn, and how do we write it down?',
          page: Learning,
          checks: [
            'Explain the difference between regression and classification, and supervised and unsupervised learning, with an example of each.',
            'Explain why having labels makes it easier to define and compare learning methods.',
            'Write the design matrix for a small dataset, including the ones column, and state the shapes of X, θ, y.',
            'Interpret a fitted coefficient correctly (holding other features fixed) and say why the intercept may be meaningless.',
          ],
        },
        {
          slug: 'loss',
          title: 'What makes a fit good?',
          question: 'How do we turn “this line looks right” into something we can optimise?',
          page: Loss,
          checks: [
            'Define a residual and say which sign means under-prediction.',
            'Explain why the plain sum of residuals is a useless objective.',
            'Write SSE in summation and matrix form; relate SSE, RSS and MSE.',
            'Explain why argmin SSE = argmin MSE but the minimum values differ.',
            'Explain the mechanism by which a single outlier moves the least-squares line.',
          ],
        },
        {
          slug: 'stats',
          title: 'The statistics you need',
          question: 'What do samples, estimators, covariance and correlation tell us — and not tell us?',
          page: Stats,
          checks: [
            'Contrast probability and statistics, and explain why larger samples do not fix systematic bias.',
            'Define an unbiased estimator and classify the sample mean, variance, std. deviation, median and range.',
            'Derive E[s²] = σ² and explain the N − 1.',
            'Compute covariance and correlation for a small dataset and interpret their signs.',
            'Give a counterexample showing r = 0 does not mean “no relationship”.',
          ],
        },
      ],
    },
    {
      title: 'II · Fitting exactly',
      lessons: [
        {
          slug: 'ols1d',
          title: 'Deriving the least-squares line',
          question: 'Where do the slope and intercept formulas come from?',
          page: Ols1d,
          checks: [
            'Derive both normal equations for ŷ = θ₀ + θ₁x without notes.',
            'Explain each step that turns the slope equation into S_xy/S_xx.',
            'Fit a line to 3–5 points by hand using deviations and verify it with Σe = 0 and Σxe = 0.',
            'Explain what translating or centring x does to the slope and intercept.',
            'State when the solution fails to be unique.',
          ],
        },
        {
          slug: 'matrix',
          title: 'Many features: the normal equations',
          question: 'How does one matrix argument fit any number of features?',
          page: Matrix,
          checks: [
            'Expand (y − Xθ)ᵀ(y − Xθ) and justify combining the cross terms.',
            'Derive the gradient and the normal equations; state the full-rank condition.',
            'Prove the stationary point is a global minimum using vᵀHv = 2‖Xv‖².',
            'Explain the projection picture and connect Xᵀe = 0 to the residual identities.',
            'Recognise rank-deficient designs (duplicate, constant, or too many columns).',
          ],
        },
      ],
    },
    {
      title: 'III · Why least squares',
      lessons: [
        {
          slug: 'gd',
          title: 'Gradient descent',
          question: 'How do we minimise the loss by repeated small improvements?',
          page: GD,
          checks: [
            'Derive the single-example gradient and the LMS update rule.',
            'Write batch GD in summation and matrix form, with the correct factor 2/m.',
            'Perform one batch and one SGD update by hand, using the old θ for every component.',
            'Explain what too-small and too-large learning rates do, and why centring helps.',
            'Compare batch GD and SGD: cost per update, behaviour near the minimum.',
          ],
        },
        {
          slug: 'mle',
          title: 'Least squares as maximum likelihood',
          question: 'Why squared error, and not some other loss?',
          page: MLE,
          checks: [
            'State the probabilistic model and the conditional distribution of yⱼ given 𝐱ⱼ.',
            'Write the likelihood and explain why it is a product.',
            'Derive the log-likelihood and show its maximiser is the OLS solution.',
            'Explain why σ² does not affect θ̂, and why the likelihood is not a distribution over θ.',
            'Say which assumption is used at each step of the derivation.',
          ],
        },
        {
          slug: 'assumptions',
          title: 'Model assumptions',
          question: 'What exactly does the linear regression model claim about the data?',
          page: Assumptions,
          checks: [
            'State each of the four assumptions precisely, conditional on x.',
            'Recognise each violation from a residual plot.',
            'Explain the difference between errors and residuals.',
            'Explain why skewed y overall, or non-normal x, does not by itself violate the assumptions.',
          ],
        },
      ],
    },
    {
      title: 'IV · Flexibility',
      lessons: [
        {
          slug: 'features',
          title: 'Curves and categories',
          question: 'How can a “linear” model fit curves and groups?',
          page: Features,
          checks: [
            'Explain “linear in the parameters” and give one linear and one nonlinear-regression example.',
            'Write the design matrix for a polynomial model of degree d.',
            'Explain why training SSE cannot increase as nested features are added.',
            'Interpret an indicator coefficient and an interaction term, including the gap at a given input.',
          ],
        },
        {
          slug: 'regularisation',
          title: 'Regularisation: ridge & LASSO',
          question: 'How do we stop a flexible model from chasing noise?',
          page: Regularisation,
          checks: [
            'Write the ridge objective and derive its closed-form solution, stating the intercept convention.',
            'Compute a one-feature ridge slope S_xy/(S_xx + λ) and explain why training SSE rises.',
            'Convert λ between the SSE and MSE conventions.',
            'Explain geometrically why LASSO gives sparse solutions and ridge does not.',
            'Explain why features must be scaled before penalising and how λ should be chosen.',
          ],
        },
      ],
    },
    {
      title: 'V · Generalisation',
      lessons: [
        {
          slug: 'evaluation',
          title: 'Selecting and evaluating models',
          question: 'How do we choose a model and report its quality honestly?',
          page: Evaluation,
          checks: [
            'State what training, validation and test data are each allowed to influence.',
            'Distinguish parameters from hyperparameters and describe grid search.',
            'Compute RMSE, MAE, R² and adjusted R² from residuals, and interpret each.',
            'Explain why test R² can be negative and why training R² cannot (OLS with intercept).',
            'Describe forward selection and backward elimination, and why greedy search can fail.',
          ],
        },
        {
          slug: 'knn',
          title: 'Local (nearest-neighbour) regression',
          question: 'What if we predict from nearby examples instead of one global line?',
          page: KNN,
          checks: [
            'Compute 1-NN, k-NN and local-linear predictions for a small 1-D dataset by hand.',
            'Explain how k affects the prediction curve, training error and bias/variance.',
            'Explain why feature scaling changes k-NN predictions.',
            'Contrast parametric and non-parametric models, including prediction cost.',
          ],
        },
        {
          slug: 'biasvar',
          title: 'The bias–variance tradeoff',
          question: 'Why can fitting the training data better make predictions worse?',
          page: BiasVariance,
          checks: [
            'Define bias and variance at a fixed input, over repeated training sets.',
            'Derive the three-term decomposition and say where each assumption is used.',
            'Explain why the noise term is absent when error is measured against f(x).',
            'Compute bias, variance and expected error for simple discrete prediction distributions.',
            'Relate degree, λ and k to bias and variance, and explain how to find the balance in practice.',
          ],
        },
      ],
    },
  ],
  practice,
  reference: Reference,
  readiness: {
    items: [
      'Start from an objective and derive both the scalar and matrix least-squares solutions.',
      'Explain why the solution is a minimum, and distinguish existence, uniqueness and generalisation.',
      'Trace one batch and one SGD update, with consistent old parameters and the correct loss scaling.',
      'Derive OLS from a Gaussian likelihood and identify every assumption used.',
      'Build polynomial and interaction features and explain “linear in the parameters”.',
      'Derive ridge under a stated intercept and SSE/MSE convention; explain why LASSO favours sparsity.',
      'Choose model settings using validation data and interpret RMSE, MAE, R² and adjusted R².',
      'Compute k-NN and local-linear predictions, and explain the role of scale and neighbourhood size.',
      'Derive and interpret the bias–variance decomposition at a fixed query input.',
    ],
    note: 'If you can calculate but not explain the conditions, revisit the derivations. If you can explain but not reproduce the calculation, practise the numerical problems. Both are needed.',
  },
});
