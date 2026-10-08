import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Steps, Table, TryThis } from '../../components/ui';
import { CentroidLab } from '../../interactives/week2/CentroidLab';
import { ExemplarLab } from '../../interactives/week2/ExemplarLab';
import { CHECKS2 } from './checks';

export default function L13Exemplar() {
  return (
    <>
      <Sec title="An exemplar summarises a group">
        <p>
          An <strong>exemplar</strong> is a point used to represent a larger group of data. In distance-based learning, a natural way to choose
          one is to make it close to every member — but “close” depends on the distance, and on whether the exemplar must be one of the data points. The
          mean, the geometric median and the medoid answer three different questions.
        </p>
      </Sec>

      <Sec title="The mean minimises the sum of squared distances">
        <p>
          The arithmetic mean is the <em>unique</em> point minimising the sum of squared Euclidean distances to the data. Here is why, for points{' '}
          <M t="\bx_1, \dots, \bx_m" /> with mean <M t="\bmu = \frac1m\sum_j\bx_j" /> and any candidate centre <M t="\mathbf c" />.
        </p>
        <Steps
          steps={[
            {
              title: 'Insert the mean',
              body: <MB t="\bx_j - \mathbf c = (\bx_j - \bmu) + (\bmu - \mathbf c)." />,
            },
            {
              title: 'Expand the squared norm and sum',
              body: (
                <MB t="\sum_j\|\bx_j - \mathbf c\|^2 = \sum_j\|\bx_j - \bmu\|^2 + 2(\bmu - \mathbf c)\T\sum_j(\bx_j - \bmu) + m\|\bmu - \mathbf c\|^2." />
              ),
            },
            {
              title: 'The cross term vanishes',
              body: (
                <>
                  <p>
                    Deviations from the mean sum to zero: <M t="\sum_j(\bx_j - \bmu) = \mathbf 0" />. So
                  </p>
                  <MB t="\boxed{\;\sum_j\|\bx_j - \mathbf c\|^2 = \sum_j\|\bx_j - \bmu\|^2 + m\|\mathbf c - \bmu\|^2\;}" />
                  <p>
                    The first term does not depend on <M t="\mathbf c" />; the second is ≥ 0 and zero only at <M t="\mathbf c = \bmu" />. The mean is the
                    unique minimiser. (This is the vector version of Week 1’s result that the best constant predictor under squared error is <M t="\bar y" />.)
                  </p>
                </>
              ),
            },
          ]}
        />
      </Sec>

      <Sec title="Change the objective, or the allowed centres">
        <Table
          head={['Exemplar', 'Minimises', 'Must it be a data point?']}
          rows={[
            ['Mean (centroid)', 'sum of squared Euclidean distances', 'no'],
            ['Geometric median', 'sum of (unsquared) Euclidean distances', 'no'],
            ['Medoid', 'total distance to the others, under the chosen distance', 'yes — and there may be more than one'],
          ]}
        />
        <Callout kind="example" title="Points 0, 2, 10">
          The mean is 4 — not an observed point. Candidate medoids under absolute distance:
          <Table
            head={['candidate', 'total distance', 'value']}
            rows={[
              ['0', '0 + 2 + 10', '12'],
              ['2', '2 + 0 + 8', '10'],
              ['10', '10 + 8 + 0', '18'],
            ]}
          />
          The medoid is 2 (and here the geometric median is also 2).
        </Callout>
        <p>
          Finding a medoid means computing, for each data point, its total distance to all others — <M t="O(n^2)" /> distance evaluations for{' '}
          <M t="n" /> points whatever the metric, so there is no <em>computational</em> reason to prefer one metric for medoids. (Each distance
          evaluation still costs time proportional to the number of features.)
        </p>
        <Lab title="Mean, median, medoid" purpose="Drag the points. The mean minimises the squared-distance curve; the median minimises the absolute-distance curve; the medoid is the lowest dot — the best observed point.">
          <ExemplarLab />
        </Lab>
        <TryThis
          items={[
            '“with an outlier”: drag the 13 further right. The mean chases it; the median and medoid stay put. Squared distance gives far points huge influence.',
            '“four points”: with an even count every point between the two middle values minimises the absolute distance — the median is not unique.',
            'Make two points coincide, or arrange a symmetric layout (1, 3, 5, 7): can there be two medoids?',
          ]}
        />
      </Sec>

      <Sec title="The nearest-centroid classifier">
        <p>Use one exemplar per class — its centroid — and classify by the minimum-distance principle:</p>
        <MB t="\bmu_c = \frac{1}{|C_c|}\sum_{j\in C_c}\bx_j, \qquad \hat y = \argmin_c\, d(\bx, \bmu_c), \qquad C_c = \{j : y_j = c\}." />
        <p>
          With two classes and Euclidean distance this is exactly the basic linear classifier from lesson 2: it constructs exemplars that minimise squared
          Euclidean distance within each class, then applies a nearest-exemplar rule.
        </p>
        <Table
          head={['Advantages', 'Disadvantages']}
          rows={[
            ['simple', 'poor for complex classes: multimodal or non-spherical'],
            ['fast — one distance per class at prediction time', 'cannot handle outliers and noisy data well (they move the mean)'],
            ['works well when classes are compact and far apart', 'cannot handle missing data'],
          ]}
        />
        <p>
          <strong>What if a class has more than one mode?</strong>. One centroid per class lands between the modes and performs poorly. If we can
          find the modes, one centroid per mode helps — finding such groups is clustering, a later topic.
        </p>
        <Lab title="One centroid for a two-clump class" purpose="The negative class sits in two clumps on either side; its single mean lands in the middle.">
          <CentroidLab initial="multimodal" />
        </Lab>
        <Callout kind="example" title="An extreme multimodal case">
          Class 0 at <M t="(-3, 0), (3, 0)" />; class 1 at <M t="(0, -1), (0, 1)" />. Both centroids are <M t="(0, 0)" />, so the rule ties everywhere —
          though the training points are perfectly distinct.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l13.q1"
          q={<p>Points 2, 3, 13 on the real line. What are the mean and the medoid (absolute distance)?</p>}
          options={[
            { text: 'mean 6, medoid 3', correct: true, why: 'Totals at 2, 3, 13 are 12, 11, 21; the mean 18/3 = 6 is not a data point.' },
            { text: 'mean 6, medoid 6', why: 'A medoid must be one of the observed points.' },
            { text: 'mean 3, medoid 3', why: '(2 + 3 + 13)/3 = 6: the far point pulls the mean.' },
          ]}
        />
        <Quiz
          id="w2.l13.q2"
          q={<p>In the proof that the mean minimises Σ‖xⱼ − c‖², why does the cross term vanish?</p>}
          options={[
            { text: 'Because Σⱼ (xⱼ − μ) = 0.', correct: true, why: 'Deviations from the mean sum to zero.' },
            { text: 'Because c = μ.', why: 'The identity holds for every c; that is what makes it a proof.' },
            { text: 'Because squared norms are non-negative.', why: 'That is used for the last term, not the cross term.' },
          ]}
        />
        <Quiz
          id="w2.l13.q3"
          q={<p>When does the nearest-centroid classifier work well?</p>}
          options={[
            { text: 'When classes are compact and well separated.', correct: true, why: 'Then the mean is a faithful summary.' },
            { text: 'When a class has several separate modes.', why: 'One mean lands between the modes.' },
            { text: 'When there are many outliers.', why: 'Outliers drag the mean.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        An exemplar should match its objective: the mean uniquely minimises squared Euclidean distance (the cross term vanishes), the geometric median
        minimises unsquared distance, and the medoid is the best <em>observed</em> point (an <M t="O(n^2)" /> search). Nearest centroid classifies by the
        closest class mean — the basic linear classifier again — and fails when a mean cannot represent its class.
      </Callout>

      <Checklist id="w2-exemplar" items={CHECKS2['w2-exemplar']} />
    </>
  );
}
