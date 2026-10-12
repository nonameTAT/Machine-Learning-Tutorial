import { PREFIX } from './storage';

// Quiz answers used to be stored under the lesson's number ("quiz.w3.l12.q1"), which would point at the
// wrong lesson as soon as one was inserted. They are now stored under the lesson's route id
// ("quiz.w3-gnb.q1"). This moves answers saved before that change, once per browser.

/** Old "<week.>l<number>" quiz prefix → lesson route id, frozen as it was when the scheme changed. */
const OLD_QUIZ_PREFIX: Record<string, string> = {
  'l1': 'learning', 'l2': 'loss', 'l3': 'stats', 'l4': 'ols1d', 'l5': 'matrix', 'l6': 'gd', 'l7': 'mle', 'l8': 'assumptions',
  'l9': 'features', 'l10': 'regularisation', 'l11': 'evaluation', 'l12': 'knn', 'l13': 'biasvar',
  'w2.l1': 'w2-classifier', 'w2.l2': 'w2-centroid', 'w2.l3': 'w2-sigmoid', 'w2.l4': 'w2-logloss', 'w2.l5': 'w2-logfit', 'w2.l6': 'w2-cv',
  'w2.l7': 'w2-datatypes', 'w2.l8': 'w2-metrics', 'w2.l9': 'w2-roc', 'w2.l10': 'w2-missing', 'w2.l11': 'w2-distance', 'w2.l12': 'w2-metric',
  'w2.l13': 'w2-exemplar', 'w2.l14': 'w2-knn', 'w2.l15': 'w2-scaling', 'w2.l16': 'w2-weighted', 'w2.l17': 'w2-lazyeval',
  'w2.l18': 'w2-curse',
  'w3.l1': 'w3-bias', 'w3.l2': 'w3-bayes', 'w3.l3': 'w3-map', 'w3.l4': 'w3-baserate', 'w3.l5': 'w3-risk', 'w3.l6': 'w3-gaussnoise',
  'w3.l7': 'w3-bayesopt', 'w3.l8': 'w3-bayeserror', 'w3.l9': 'w3-nb', 'w3.l10': 'w3-playtennis', 'w3.l11': 'w3-smoothing',
  'w3.l12': 'w3-gnb', 'w3.l13': 'w3-text', 'w3.l14': 'w3-bernoulli', 'w3.l15': 'w3-multinomial', 'w3.l16': 'w3-missing',
  'w3.l17': 'w3-limits',
};

const VERSION_KEY = PREFIX + 'storageVersion';
const VERSION = 2;

export function migrateStorage() {
  try {
    if (Number(localStorage.getItem(VERSION_KEY)) >= VERSION) return;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i) ?? '');
    for (const k of keys) {
      const m = /^(quiz|quizres)\.((?:w\d+\.)?l\d+)\.(\w+)$/.exec(k.slice(PREFIX.length));
      const lesson = m && k.startsWith(PREFIX) ? OLD_QUIZ_PREFIX[m[2]] : undefined;
      if (!m || !lesson) continue;
      const next = `${PREFIX}${m[1]}.${lesson}.${m[3]}`;
      const value = localStorage.getItem(k);
      if (localStorage.getItem(next) === null && value !== null) localStorage.setItem(next, value);
      localStorage.removeItem(k);
    }
    localStorage.setItem(VERSION_KEY, String(VERSION));
  } catch {
    /* storage unavailable: nothing to migrate */
  }
}
