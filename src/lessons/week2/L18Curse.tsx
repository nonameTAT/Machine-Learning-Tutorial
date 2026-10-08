import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { ConcentrationLab, IrrelevantLab } from '../../interactives/week2/CurseLab';
import { CHECKS2 } from './checks';

export default function L18Curse() {
  return (
    <>
      <Sec title="When is “nearest” meaningful?">
        <p>
          k-NN rests on one assumption: the nearest stored examples are <em>relevantly</em> similar to the query. In high-dimensional
          spaces “everything is far away from everything”, pairwise distances become uninformative, and proximity may stop being qualitatively meaningful
          as all points look roughly equidistant. Bellman (1960) named this the <strong>curse of dimensionality</strong>. Other symptoms:
          many parameters (such as covariances) become harder to estimate, the data are hard to visualise, and an exponential amount of data is
          needed.
        </p>
        <p>There are two separate mechanisms worth understanding.</p>
      </Sec>

      <Sec title="Mechanism 1: space becomes sparsely populated">
        <p>
          Divide each of <M t="d" /> feature axes into <M t="b" /> intervals. The grid has <M t="b^d" /> cells. With 10 intervals per axis:
        </p>
        <Table
          head={['dimensions d', 'cells', 'meaning']}
          rows={[
            ['2', <M t="10^2 = 100" />, 'a modest dataset can populate the grid'],
            ['5', <M t="10^5" />, 'already far more cells than typical datasets have points'],
            ['10', <M t="10^{10}" />, 'uniformly fine coverage is impractical'],
            ['20', <M t="10^{20}" />, 'growth is exponential in d'],
          ]}
        />
        <p>
          To make nearest-neighbour predictions reliable, each cell would need enough points — exponentially many. This illustrates a coverage problem for
          unrestricted high-dimensional data; real data often have structure (and fewer effective dimensions), which is why k-NN can still work.
        </p>
        <Lab
          title="Distance concentration"
          purpose="300 random points in the unit cube [0, 1]^d and one random query. As d grows, the nearest and farthest points end up at nearly the same distance."
        >
          <ConcentrationLab />
        </Lab>
        <TryThis
          items={[
            'At d = 2 the nearest point is very close relative to the farthest (ratio near 0). At d = 500 the ratio climbs towards 1: the histogram piles up next to the maximum.',
            'Read the right-hand chart: the relative contrast falls by orders of magnitude. When every point is about equally far, “the k nearest” is close to an arbitrary subset.',
          ]}
        />
      </Sec>

      <Sec title="Mechanism 2: irrelevant differences swamp relevant ones">
        <p>
          Imagine instances described by 20 attributes, only 2 of which are relevant to the target. Euclidean distance still adds up all 20
          squared differences. Two cases that match well on the 2 useful features can look far apart, while an unhelpful match can look close — “similar”
          examples appear “distant”. All attributes are treated as equally important, so k-NN is easily fooled.
        </p>
        <Lab title="Adding irrelevant features" purpose="Two features decide the class; add pure-noise features and watch leave-one-out accuracy of 5-NN.">
          <IrrelevantLab />
        </Lab>
        <TryThis
          items={[
            'With no noise features accuracy is high. Add 8, then 64: accuracy heads towards chance — though every feature is perfectly scaled.',
            'Turn on zero weights for the noise features: accuracy returns to the 2-feature level. Removing (or down-weighting) irrelevant features is the cure, not scaling.',
          ]}
        />
        <Callout kind="warning">
          Rules of thumb such as “10 or 20 dimensions” are practical warnings, not universal cut-offs. Adding meaningful features can help; adding many irrelevant
          ones hurts. High dimension alone does not prove k-NN must fail — feature relevance, structure, sample size and the distance all matter.
        </Callout>
      </Sec>

      <Sec title="Remedies">
        <p>
          <strong>Weight the attributes.</strong> Stretch the <M t="r" />-th axis by a weight <M t="z_r \ge 0" />:
        </p>
        <MB t="d_z(\bx_q, \bx_i) = \sqrt{\sum_{r=1}^d z_r\,(x_{qr} - x_{ir})^2}." />
        <p>
          Choose <M t="z_1, \dots, z_d" /> to minimise prediction error, e.g. by cross-validation (Moore &amp; Lee, 1994), or update them from
          nearest-neighbour errors — increase a weight when it helps classify correctly, decrease it when it hurts. Setting <M t="z_r = 0" />{' '}
          eliminates that dimension altogether (a pseudometric, lesson 12); feature selection is the special case of 0/1 weights. Choose weights on
          validation evidence, never on the test set.
        </p>
        <Table
          head={['Practical problem', 'Remedy']}
          rows={[
            ['slow queries', 'remove irrelevant data or features; tree-based or approximate search'],
            ['noise (k-NN copes fairly well)', 'remove noisy instances; use a larger k, chosen by cross-validation'],
            ['all attributes deemed equally important', 'attribute weighting, or simply selection'],
          ]}
        />
        <p>
          <strong>Editing the stored instances.</strong> IB3 (Instance-Based Learning 3) keeps a record of how well each stored instance does at prediction,
          and only uses instances whose success record is above a threshold. It is presented at this high level; its detailed update rules are
          beyond this guide.
        </p>
      </Sec>

      <Sec title="An application: MS-lesion segmentation">
        <p>
          Anbeek et al. (2008) segmented multiple-sclerosis lesions in brain MRI with k-NN. Manually labelled images were the training set, and each voxel
          was described by four features: its intensity and its <M t="(x, y, z)" /> location. Classifying a voxel means finding labelled voxels that are
          close in <em>both</em> appearance and position — so how intensity is scaled against millimetres decides what “close” means. The example
          illustrates the method; it is not a guarantee for other imaging data.
        </p>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w2.l18.q1"
          q={<p>“Normalising 100 irrelevant features makes them harmless for k-NN.” Evaluate.</p>}
          options={[
            { text: 'True — they no longer dominate the distance.', why: 'They now each contribute as much as a relevant feature: collectively they swamp it.' },
            { text: 'False: scaling fixes units, not relevance. Remove or down-weight them.', correct: true, why: 'See the irrelevant-features lab: perfectly scaled noise still drives accuracy towards chance.' },
          ]}
        />
        <Quiz
          id="w2.l18.q2"
          q={<p>In weighted Euclidean distance, what does setting z_r = 0 do?</p>}
          options={[
            { text: 'Removes feature r from the comparison entirely.', correct: true, why: 'The result is a pseudometric on the original space.' },
            { text: 'Makes feature r count infinitely.', why: 'A zero weight multiplies its squared difference by 0.' },
            { text: 'Nothing — weights only matter for regression.', why: 'They change which points are nearest, hence the vote.' },
          ]}
        />
        <Quiz
          id="w2.l18.q3"
          q={<p>With 10 intervals per axis, how many grid cells are there in 6 dimensions?</p>}
          options={[
            { text: '60', why: 'That is 10 × 6; the count multiplies across axes.' },
            { text: '10⁶ = 1,000,000', correct: true, why: 'b^d with b = 10, d = 6.' },
            { text: '6¹⁰', why: 'Intervals per axis to the power of dimensions: 10⁶.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        In high dimensions data become sparse (cells grow like <M t="b^d" />), distances concentrate, and irrelevant features swamp relevant ones, so the
        nearest neighbours stop being informative. Remedies change the comparison or the evidence: select or weight features (weights chosen by
        validation), use larger k against noise, and edit noisy instances (IB3).
      </Callout>

      <Checklist id="w2-curse" items={CHECKS2['w2-curse']} />
    </>
  );
}
