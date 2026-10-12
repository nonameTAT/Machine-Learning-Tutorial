# Course content

What each week covers, and the interactive labs that go with it. Every week also has practice problems, a printable
reference sheet and a readiness check. Back to the [README](../README.md).

## Week 1 — Regression

**13 lessons:** what is learned, loss functions, statistics, the least-squares line, normal equations, gradient
descent, maximum likelihood, assumptions, polynomial/indicator features, ridge & LASSO, validation & metrics,
k-NN/local regression, bias–variance.

**Labs** (SVG; Plotly only for the 3-D views) include a residual playground, squared versus absolute error with a
draggable outlier, covariance as signed areas, an OLS calculator, gradient descent on loss contours, regularisation
paths, and a bias–variance simulation.

## Week 2 — Classification

**18 lessons:** classifier outputs and generative vs discriminative learning, the basic linear (nearest-centroid)
classifier, the sigmoid and thresholds, deriving log loss, fitting logistic regression by gradient descent,
generalisation and cross-validation, data types, confusion-matrix metrics, ROC/AUC, missing values, Minkowski
distances, metric axioms, exemplars (mean/median/medoid), the k-NN vote, feature scaling, choosing k and distance
weighting, evaluating lazy learners (LOOCV), and the curse of dimensionality.

**Labs:** every lesson has one — e.g. a Bayes-rule posterior explorer, draggable class means with the w-vector and
boundary, gradient descent on log-loss contours (including separable data), a least-squares line versus a logistic
curve on 0/1 labels, a fold diagram and k-selection by K-fold CV, feature-selection leakage in CV on pure-noise data,
an editable confusion matrix, a threshold sweep on the ROC curve, AUC as a count of correctly ordered pairs, min-max
versus z-score on one feature, p-balls and a triangle-inequality tester, k-NN decision regions, scaling
neighbourhoods, and distance-concentration simulations.

**Worked examples** are reproduced and checked by the labs (e.g. AUC = 7/9, the weighted 3-NN flip, one logistic
update to β = (0, 0.25)).

## Week 3 — Bayesian classification

**17 lessons:** inductive bias, Bayes’ theorem, MAP/ML and odds, base rates, minimum expected loss, Gaussian noise
and squared error, Bayes optimal and Gibbs classifiers, Bayes error, the Naive Bayes assumption, PlayTennis,
smoothing and log-space, Gaussian Naive Bayes, text representations, Bernoulli and multinomial text models, missing
values, and when Naive Bayes misleads.

**Labs** include an area diagram of Bayes’ rule, log-odds arithmetic, a 1,000-person base-rate icon array, risk lines
for unequal costs, a Bayes-error overlap plot, a PlayTennis classifier with exact fractions (any query, missing
values, Laplace smoothing), a spam/ham text lab that scores any typed email under both text models, and true versus
Naive Bayes posteriors when evidence is double-counted.

**Worked numbers** are reproduced exactly (e.g. 1/189 vs 18/875, 2/9 vs 4/27, 0.054 vs 0.1728).

## Week 4 — Tree learning

**17 lessons:** trees as adaptive partitions, what trees can represent (Boolean functions, completeness), top-down
induction, entropy, information gain, growing PlayTennis, gain ratio and identifiers, numeric thresholds, greedy
search and XOR, overfitting and pre-pruning, training error with conflicting labels, reduced-error pruning and the
one-SE rule, rules/costs/missing values, regression trees, regression splits (including the Hammond organs), model
trees, and kernel smoothing.

**Labs** include a point traced through a tree and its partition, a staircase approximating a diagonal, trees for any
Boolean function under any variable order, gain drawn as areas, a grow-it-yourself tree for PlayTennis (gain or gain
ratio, with or without the Day identifier) and for the organ prices, a threshold scanner, depth-versus-error and
reduced-error pruning on noisy 2-D data, fractional routing of missing values with exact fractions, a regression
stump with draggable points, constant versus linear leaves on cos(πx), and a kernel smoother drawn like the classic
two-panel figure.

**Worked numbers** are reproduced (e.g. gains 0.266 vs 0.121, Outlook 0.247, 2/12 unavoidable errors, Q = 4/9,
Epanechnikov 4/7).
