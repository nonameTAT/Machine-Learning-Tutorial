import type { ComponentType } from 'react';
import Home from './Home';
import L01Learning from './L01Learning';
import L02Loss from './L02Loss';
import L03Stats from './L03Stats';
import L04Ols1d from './L04Ols1d';
import L05Matrix from './L05Matrix';
import L06GD from './L06GD';
import L07MLE from './L07MLE';
import L08Assumptions from './L08Assumptions';
import L09Features from './L09Features';
import L10Regularisation from './L10Regularisation';
import L11Evaluation from './L11Evaluation';
import L12KNN from './L12KNN';
import L13BiasVariance from './L13BiasVariance';
import Practice from './Practice';
import Readiness from './Readiness';
import Reference from './Reference';
import Home2 from './week2/Home2';
import L01Classifier from './week2/L01Classifier';
import L02Centroid from './week2/L02Centroid';
import L03Sigmoid from './week2/L03Sigmoid';
import L04LogLoss from './week2/L04LogLoss';
import L05LogFit from './week2/L05LogFit';
import L06CV from './week2/L06CV';
import L07DataTypes from './week2/L07DataTypes';
import L08Metrics from './week2/L08Metrics';
import L09ROC from './week2/L09ROC';
import L10Missing from './week2/L10Missing';
import L11Distance from './week2/L11Distance';
import L12Metric from './week2/L12Metric';
import L13Exemplar from './week2/L13Exemplar';
import L14KNN from './week2/L14KNN';
import L15Scaling from './week2/L15Scaling';
import L16Weighted from './week2/L16Weighted';
import L17LazyEval from './week2/L17LazyEval';
import L18Curse from './week2/L18Curse';
import Practice2 from './week2/Practice2';
import Readiness2 from './week2/Readiness2';
import Reference2 from './week2/Reference2';
import Home3 from './week3/Home3';
import L01Bias from './week3/L01Bias';
import L02Bayes from './week3/L02Bayes';
import L03MAP from './week3/L03MAP';
import L04BaseRate from './week3/L04BaseRate';
import L05Risk from './week3/L05Risk';
import L06GaussNoise from './week3/L06GaussNoise';
import L07BayesOpt from './week3/L07BayesOpt';
import L08BayesError from './week3/L08BayesError';
import L09NB from './week3/L09NB';
import L10PlayTennis from './week3/L10PlayTennis';
import L11Smoothing from './week3/L11Smoothing';
import L12GNB from './week3/L12GNB';
import L13Text from './week3/L13Text';
import L14Bernoulli from './week3/L14Bernoulli';
import L15Multinomial from './week3/L15Multinomial';
import L16Missing from './week3/L16Missing';
import L17Limits from './week3/L17Limits';
import Practice3 from './week3/Practice3';
import Readiness3 from './week3/Readiness3';
import Reference3 from './week3/Reference3';

/** Route id (see registry.ts) → page component. */
export const PAGES: Record<string, ComponentType> = {
  home: Home,
  learning: L01Learning,
  loss: L02Loss,
  stats: L03Stats,
  ols1d: L04Ols1d,
  matrix: L05Matrix,
  gd: L06GD,
  mle: L07MLE,
  assumptions: L08Assumptions,
  features: L09Features,
  regularisation: L10Regularisation,
  evaluation: L11Evaluation,
  knn: L12KNN,
  biasvar: L13BiasVariance,
  practice: Practice,
  reference: Reference,
  readiness: Readiness,
  // week 2
  'w2-home': Home2,
  'w2-classifier': L01Classifier,
  'w2-centroid': L02Centroid,
  'w2-sigmoid': L03Sigmoid,
  'w2-logloss': L04LogLoss,
  'w2-logfit': L05LogFit,
  'w2-cv': L06CV,
  'w2-datatypes': L07DataTypes,
  'w2-metrics': L08Metrics,
  'w2-roc': L09ROC,
  'w2-missing': L10Missing,
  'w2-distance': L11Distance,
  'w2-metric': L12Metric,
  'w2-exemplar': L13Exemplar,
  'w2-knn': L14KNN,
  'w2-scaling': L15Scaling,
  'w2-weighted': L16Weighted,
  'w2-lazyeval': L17LazyEval,
  'w2-curse': L18Curse,
  'w2-practice': Practice2,
  'w2-reference': Reference2,
  'w2-readiness': Readiness2,
  // week 3
  'w3-home': Home3,
  'w3-bias': L01Bias,
  'w3-bayes': L02Bayes,
  'w3-map': L03MAP,
  'w3-baserate': L04BaseRate,
  'w3-risk': L05Risk,
  'w3-gaussnoise': L06GaussNoise,
  'w3-bayesopt': L07BayesOpt,
  'w3-bayeserror': L08BayesError,
  'w3-nb': L09NB,
  'w3-playtennis': L10PlayTennis,
  'w3-smoothing': L11Smoothing,
  'w3-gnb': L12GNB,
  'w3-text': L13Text,
  'w3-bernoulli': L14Bernoulli,
  'w3-multinomial': L15Multinomial,
  'w3-missing': L16Missing,
  'w3-limits': L17Limits,
  'w3-practice': Practice3,
  'w3-reference': Reference3,
  'w3-readiness': Readiness3,
};
