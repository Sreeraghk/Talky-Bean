import { GrammarModule, GrammarExercise, LanguageLevel } from '../../types';

export const FALLBACK_GRAMMAR_MODULES: Record<string, GrammarModule[]> = {
  // German A2: Dative Case (a2-dative)
  'de-A2-a2-dative': [
    {
      id: 'fallback-de-a2-dative-0',
      level: 'A2',
      topicId: 'a2-dative',
      title: 'Dative Case Essentials: Personal Helpers',
      scenario: 'Helping neighbors and friends in a German neighborhood',
      isCompleted: false,
      createdAt: Date.now(),
      unlockedAt: Date.now(),
      index: 0,
      exercises: [
        {
          id: 'fb-dat-0-ex-0',
          topicId: 'a2-dative',
          type: 'fill-in-the-blank',
          content: {
            sentence: 'Ich helfe [blank] Nachbarn bei der Gartenarbeit.',
            wordBank: ['dem', 'den', 'der', 'die', 'das', 'des'],
            correctAnswers: ['dem']
          },
          vocabularyHints: {
            'helfen': 'to help (takes dative)',
            'Nachbarn': 'neighbor (masculine singular in dative: dem)',
            'Gartenarbeit': 'gardening work'
          },
          explanation: 'The verb "helfen" always requires the dative case. Masculine singular "der Nachbar" becomes "dem Nachbarn".',
          isCompleted: false
        },
        {
          id: 'fb-dat-0-ex-1',
          topicId: 'a2-dative',
          type: 'mix-and-match',
          content: {
            pairs: [
              { id: 'p1', left: 'mit', right: 'dem Bus (by bus)' },
              { id: 'p2', left: 'zu', right: 'der Ärztin (to the doctor)' },
              { id: 'p3', left: 'aus', right: 'dem Haus (out of the house)' },
              { id: 'p4', left: 'nach', right: 'der Arbeit (after work)' }
            ]
          },
          vocabularyHints: {
            'mit': 'with / by (dative preposition)',
            'zu': 'to (dative preposition)',
            'aus': 'out of / from (dative preposition)',
            'nach': 'after / to (dative preposition)'
          },
          explanation: 'The prepositions "aus, bei, mit, nach, seit, von, zu" strictly govern the dative case.',
          isCompleted: false
        },
        {
          id: 'fb-dat-0-ex-2',
          topicId: 'a2-dative',
          type: 'choose-correct-sentence',
          content: {
            question: 'Which sentence correctly uses the dative pronoun for "her"?',
            options: [
              'Das neue Fahrrad gefällt ihr sehr gut.',
              'Das neue Fahrrad gefällt sie sehr gut.',
              'Das neue Fahrrad gefällt ihn sehr gut.'
            ],
            correctAnswerIndex: 0
          },
          vocabularyHints: {
            'gefallen': 'to appeal to / to please (takes dative)',
            'ihr': 'to her (dative personal pronoun)'
          },
          explanation: '"gefallen" takes a dative object: "ihr" (to her) is the dative of "sie".',
          isCompleted: false
        },
        {
          id: 'fb-dat-0-ex-3',
          topicId: 'a2-dative',
          type: 'word-order',
          content: {
            question: 'The book belongs to the teacher (female).',
            shuffledWords: ['Das', 'Buch', 'gehört', 'der', 'Lehrerin.'],
            correctAnswers: ['Das', 'Buch', 'gehört', 'der', 'Lehrerin.']
          },
          vocabularyHints: {
            'gehören': 'to belong to (dative verb)',
            'Lehrerin': 'female teacher (dative: der Lehrerin)'
          },
          explanation: '"gehören" requires dative. Feminine "die Lehrerin" changes to "der Lehrerin" in dative.',
          isCompleted: false
        },
        {
          id: 'fb-dat-0-ex-4',
          topicId: 'a2-dative',
          type: 'fill-in-the-blank',
          content: {
            sentence: 'Wir danken [blank] Großeltern für das schöne Geschenk.',
            wordBank: ['den', 'dem', 'der', 'die', 'ihren'],
            correctAnswers: ['den']
          },
          vocabularyHints: {
            'danken': 'to thank (takes dative)',
            'Großeltern': 'grandparents (plural dative takes "den")',
            'Geschenk': 'gift / present'
          },
          explanation: '"danken" requires dative. Plural definite article in dative is always "den".',
          isCompleted: false
        }
      ]
    },
    {
      id: 'fallback-de-a2-dative-1',
      level: 'A2',
      topicId: 'a2-dative',
      title: 'Dative Prepositions & Directions',
      scenario: 'Navigating through a historic German town with local friends',
      isCompleted: false,
      createdAt: Date.now(),
      unlockedAt: Date.now(),
      index: 1,
      exercises: [
        {
          id: 'fb-dat-1-ex-0',
          topicId: 'a2-dative',
          type: 'fill-in-the-blank',
          content: {
            sentence: 'Seit [blank] Monat wohne ich in Berlin.',
            wordBank: ['einem', 'einen', 'einer', 'ein', 'eines'],
            correctAnswers: ['einem']
          },
          vocabularyHints: {
            'seit': 'since / for (temporal dative preposition)',
            'Monat': 'month (der Monat -> dative: einem Monat)'
          },
          explanation: '"seit" is a dative-only preposition. Masculine indefinite article in dative is "einem".',
          isCompleted: false
        },
        {
          id: 'fb-dat-1-ex-1',
          topicId: 'a2-dative',
          type: 'mix-and-match',
          content: {
            pairs: [
              { id: 'p1', left: 'mir', right: 'to me (Dative ich)' },
              { id: 'p2', left: 'dir', right: 'to you (Dative du)' },
              { id: 'p3', left: 'ihm', right: 'to him (Dative er/es)' },
              { id: 'p4', left: 'uns', right: 'to us (Dative wir)' }
            ]
          },
          vocabularyHints: {
            'Personalpronomen': 'personal pronouns in dative case'
          },
          explanation: 'Dative personal pronouns replace noun objects when acting as indirect objects or with dative verbs.',
          isCompleted: false
        },
        {
          id: 'fb-dat-1-ex-2',
          topicId: 'a2-dative',
          type: 'choose-correct-sentence',
          content: {
            question: 'How do you ask "How are you?" in German using the dative case?',
            options: [
              'Wie geht es dir?',
              'Wie geht es dich?',
              'Wie geht es du?'
            ],
            correctAnswerIndex: 0
          },
          vocabularyHints: {
            'Wie geht es...?': 'How goes it for...? (idiom using dative pronoun)'
          },
          explanation: 'The German greeting "Wie geht es dir?" literally means "How goes it to you?", requiring dative "dir".',
          isCompleted: false
        },
        {
          id: 'fb-dat-1-ex-3',
          topicId: 'a2-dative',
          type: 'word-order',
          content: {
            question: 'She replies to the colleague (male).',
            shuffledWords: ['Sie', 'antwortet', 'dem', 'Kollegen.'],
            correctAnswers: ['Sie', 'antwortet', 'dem', 'Kollegen.']
          },
          vocabularyHints: {
            'antworten': 'to answer / reply to (takes dative)',
            'Kollege': 'colleague (n-noun masculine in dative: dem Kollegen)'
          },
          explanation: '"antworten" requires the dative case. Masculine dative is "dem".',
          isCompleted: false
        },
        {
          id: 'fb-dat-1-ex-4',
          topicId: 'a2-dative',
          type: 'fill-in-the-blank',
          content: {
            sentence: 'Ich fahre morgen mit [blank] Bahn nach München.',
            wordBank: ['der', 'die', 'dem', 'den', 'das'],
            correctAnswers: ['der']
          },
          vocabularyHints: {
            'mit': 'with / by means of (dative)',
            'Bahn': 'train (die Bahn -> dative: der Bahn)'
          },
          explanation: 'Feminine nouns with "mit" take the dative article "der": "mit der Bahn".',
          isCompleted: false
        }
      ]
    }
  ],

  // German A1: Articles & Nouns (a1-articles)
  'de-A1-a1-articles': [
    {
      id: 'fallback-de-a1-articles-0',
      level: 'A1',
      topicId: 'a1-articles',
      title: 'Definite & Indefinite Articles in Daily Life',
      scenario: 'Grocery shopping and describing everyday objects',
      isCompleted: false,
      createdAt: Date.now(),
      unlockedAt: Date.now(),
      index: 0,
      exercises: [
        {
          id: 'fb-art-0-ex-0',
          topicId: 'a1-articles',
          type: 'fill-in-the-blank',
          content: {
            sentence: 'Hier ist [blank] Tisch und da ist der Stuhl.',
            wordBank: ['ein', 'eine', 'einen', 'einem'],
            correctAnswers: ['ein']
          },
          vocabularyHints: {
            'Tisch': 'table (masculine: der Tisch -> ein Tisch)',
            'Stuhl': 'chair (masculine: der Stuhl)'
          },
          explanation: 'In the nominative case, masculine indefinite article is "ein".',
          isCompleted: false
        },
        {
          id: 'fb-art-0-ex-1',
          topicId: 'a1-articles',
          type: 'mix-and-match',
          content: {
            pairs: [
              { id: 'p1', left: 'der', right: 'Apfel (masculine apple)' },
              { id: 'p2', left: 'die', right: 'Banane (feminine banana)' },
              { id: 'p3', left: 'das', right: 'Brot (neuter bread)' },
              { id: 'p4', left: 'die (Pl.)', right: 'Tomaten (plural tomatoes)' }
            ]
          },
          vocabularyHints: {
            'der/die/das': 'definite articles in German'
          },
          explanation: 'Every German noun has a fixed grammatical gender: masculine (der), feminine (die), or neuter (das).',
          isCompleted: false
        },
        {
          id: 'fb-art-0-ex-2',
          topicId: 'a1-articles',
          type: 'choose-correct-sentence',
          content: {
            question: 'Which definite article matches the noun "Buch" (book)?',
            options: [
              'Das Buch ist sehr interessant.',
              'Der Buch ist sehr interessant.',
              'Die Buch ist sehr interessant.'
            ],
            correctAnswerIndex: 0
          },
          vocabularyHints: {
            'Buch': 'book (neuter noun: das Buch)'
          },
          explanation: '"Buch" is a neuter noun, so it takes the definite article "das".',
          isCompleted: false
        },
        {
          id: 'fb-art-0-ex-3',
          topicId: 'a1-articles',
          type: 'word-order',
          content: {
            question: 'The water is cold.',
            shuffledWords: ['Das', 'Wasser', 'ist', 'kalt.'],
            correctAnswers: ['Das', 'Wasser', 'ist', 'kalt.']
          },
          vocabularyHints: {
            'Wasser': 'water (das Wasser)',
            'kalt': 'cold'
          },
          explanation: '"Wasser" is neuter: "Das Wasser".',
          isCompleted: false
        },
        {
          id: 'fb-art-0-ex-4',
          topicId: 'a1-articles',
          type: 'fill-in-the-blank',
          content: {
            sentence: 'Das ist [blank] Lampe für das Wohnzimmer.',
            wordBank: ['eine', 'ein', 'einen', 'einer'],
            correctAnswers: ['eine']
          },
          vocabularyHints: {
            'Lampe': 'lamp (die Lampe -> eine Lampe)'
          },
          explanation: 'Feminine nouns in nominative take the indefinite article "eine".',
          isCompleted: false
        }
      ]
    }
  ]
};

/**
 * Returns a high-quality curated grammar module matching language, level, and topic,
 * or dynamically adapts an existing template.
 */
export function getCuratedGrammarModule(
  languageCode: string,
  level: LanguageLevel,
  topicId: string,
  index: number
): GrammarModule | null {
  const key = `${languageCode}-${level}-${topicId}`;
  const list = FALLBACK_GRAMMAR_MODULES[key];
  if (list && list.length > 0) {
    const template = list[index % list.length];
    const uniqueId = `curated-${topicId}-${index}-${Date.now()}`;
    return {
      ...template,
      id: uniqueId,
      index,
      createdAt: Date.now(),
      unlockedAt: Date.now(),
      exercises: template.exercises.map((ex, i) => ({
        ...ex,
        id: `${uniqueId}-ex-${i}`,
        isCompleted: false,
        userAnswers: undefined,
        isSubmitted: false
      }))
    };
  }

  // Cross-topic fallback template generator if specific topic list is exhausted
  return null;
}
