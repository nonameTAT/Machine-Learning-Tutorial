import { M, MB } from '../../components/Math';
import { Callout, Checklist, Lab, Quiz, Sec, Table, TryThis } from '../../components/ui';
import { RepresentLab } from '../../interactives/week3/RepresentLab';
import { CHECKS3 } from './checks';

export default function L13Text() {
  return (
    <>
      <Sec title="The classic application: classifying text">
        <p>
          Naive Bayes’ best-known use is classifying documents: which news articles are interesting, which web pages belong to which topic, which
          emails are spam. The first question is representation — what attributes describe a document?
        </p>
        <p>
          One answer: one attribute per word position. Learning then estimates <M t="P(+), P(-)" /> and <M t="P(\text{doc} \mid +), P(\text{doc} \mid -)" />.
          With the Naive Bayes assumption,
        </p>
        <MB t="P(\text{doc} \mid v_j) = \prod_{i=1}^{\text{length(doc)}} P(x_i = w_k \mid v_j), \qquad P(x_i = w_k \mid v_j) = P(x_m = w_k \mid v_j)\;\;\forall i, m," />
        <p>
          where the second assumption says the word distribution is the same at every position. Together they give the{' '}
          <strong>bag-of-words</strong> model: word order is ignored, and “a a b” and “b a a” are the same document. On the 20 Newsgroups task
          this simple model reaches about 89% accuracy — an illustration, not a guarantee for other data.
        </p>
      </Sec>

      <Sec title="Two models, two kinds of evidence">
        <p>
          There are two common ways to treat words as categorical random variables. Both assume word occurrences are independent given the class
          — often untrue (“Viagra” makes “pill” likely), which harms the probability estimates but may still allow good classification.
        </p>
        <Table
          head={['', 'Multivariate Bernoulli', 'Multinomial']}
          rows={[
            ['feature value', 'each word absent or present: 0 or 1', 'number of occurrences of each word'],
            ['a repeated word', 'still one presence', 'contributes once per occurrence'],
            ['an absent word', <>contributes <M t="1 - \theta_{jc}" /></>, 'exponent 0: factor 1, no effect'],
            ['training counts', 'documents containing the word', 'total occurrences of the word'],
            ['Laplace denominator', 'documents in the class + 2', 'tokens in the class + vocabulary size'],
          ]}
        />
        <p>
          The document “a a a b” is <em>a present, b present, c absent</em> to the Bernoulli model, and <em>three a’s, one b, no c</em> to the multinomial
          model. The same text produces different evidence under two valid models.
        </p>
        <Lab title="One document, two representations" purpose="Type two documents and compare how each model sees them.">
          <RepresentLab />
        </Lab>
        <TryThis
          items={[
            'Reorder the letters of a document: neither representation changes (bag of words).',
            'Type “a b” and “a a a b”: same presence vector, different count vectors.',
            'Add d’s and e’s: stop words are removed before either model sees the document.',
          ]}
        />
      </Sec>

      <Sec title="The training set">
        <p>Eight emails over five words; d and e are stop words, so the vocabulary is <M t="V = \{a, b, c\}" />:</p>
        <Table
          head={['email', 'words', 'class', 'presence (a, b, c)', 'counts (a, b, c)']}
          rows={[
            ['e1', 'b d e b b d e', 'spam', '(0, 1, 0)', '(0, 3, 0)'],
            ['e2', 'b c e b b d d e c c', 'spam', '(0, 1, 1)', '(0, 3, 3)'],
            ['e3', 'a d a d e a e e', 'spam', '(1, 0, 0)', '(3, 0, 0)'],
            ['e4', 'b a d b e d a b', 'spam', '(1, 1, 0)', '(2, 3, 0)'],
            ['e5', 'a b a b a b a e d', 'ham', '(1, 1, 0)', '(4, 3, 0)'],
            ['e6', 'a c a c a c a e d', 'ham', '(1, 0, 1)', '(4, 0, 3)'],
            ['e7', 'e a e d a e a', 'ham', '(1, 0, 0)', '(3, 0, 0)'],
            ['e8', 'd e d e d', 'ham', '(0, 0, 0)', '(0, 0, 0)'],
          ]}
        />
        <p>
          Class priors are <M t="4/8 = 1/2" /> each. Removing every vocabulary token from e8 does not remove it as a ham training document — it still counts
          for the prior and for the Bernoulli document counts.
        </p>
        <Callout kind="note" title="Practice">
          Make up new test emails over this training set and score them by hand first; the labs in lessons 14–15 accept any email over a–e if you want
          to check your answer.
        </Callout>
      </Sec>

      <Sec title="Check your understanding">
        <Quiz
          id="w3.l13.q1"
          q={<p>What are the presence and count vectors of “c a d c c e” over V = (a, b, c)?</p>}
          options={[
            { text: 'presence (1, 0, 1); counts (1, 0, 3)', correct: true, why: 'd and e are stop words; c occurs three times, a once.' },
            { text: 'presence (1, 0, 3); counts (1, 0, 3)', why: 'Presence is 0 or 1 only.' },
            { text: 'presence (1, 0, 1, 1, 1); counts (1, 0, 3, 1, 1)', why: 'Stop words are removed from the vocabulary.' },
          ]}
        />
        <Quiz
          id="w3.l13.q2"
          q={<p>Which statement about the bag-of-words assumption is correct?</p>}
          options={[
            { text: 'It keeps word order but ignores counts.', why: 'It is the other way round for the multinomial model.' },
            { text: 'Word positions are independent given the class and share one word distribution, so order is irrelevant.', correct: true, why: 'These are the model’s two assumptions.' },
          ]}
        />
      </Sec>

      <Callout kind="key">
        Text Naive Bayes needs a representation first. The multivariate Bernoulli model observes which vocabulary words are present or absent; the
        multinomial model observes how often each occurs. Both ignore order (bag of words) and assume conditional independence — so the same email can
        provide different evidence to the two models.
      </Callout>

      <Checklist id="w3-text" items={CHECKS3['w3-text']} />
    </>
  );
}
