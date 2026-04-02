import { GrammarExercise } from '../../types';

export const GERMAN_STARTER_GRAMMAR: { [topicId: string]: GrammarExercise[] } = {
  'a1-articles': [
    {
      id: 'a1-articles-1',
      topicId: 'a1-articles',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Das ist [blank] Tisch und das ist [blank] Lampe.',
        wordBank: ['ein', 'eine', 'einen', 'einer'],
        correctAnswers: ['ein', 'eine']
      },
      explanation: 'In German, "Tisch" is masculine (der Tisch), so we use "ein". "Lampe" is feminine (die Lampe), so we use "eine".',
      isCompleted: false
    },
    {
      id: 'a1-articles-2',
      topicId: 'a1-articles',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Der', right: 'Apfel' },
          { id: '2', left: 'Die', right: 'Banane' },
          { id: '3', left: 'Das', right: 'Brot' },
          { id: '4', left: 'Die', right: 'Eier' }
        ]
      },
      explanation: 'Matching nouns with their correct definite articles: der (masculine), die (feminine), das (neuter), die (plural).',
      isCompleted: false
    },
    {
      id: 'a1-articles-3',
      topicId: 'a1-articles',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Ich habe [blank] Hund und [blank] Katze.',
        wordBank: ['einen', 'eine', 'ein', 'einer'],
        correctAnswers: ['einen', 'eine']
      },
      explanation: 'In the accusative case (direct object), masculine "ein" becomes "einen". Feminine "eine" stays "eine".',
      isCompleted: false
    },
    {
      id: 'a1-articles-4',
      topicId: 'a1-articles',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Wo ist [blank] Buch? [blank] Buch liegt auf dem Tisch.',
        wordBank: ['das', 'Das', 'der', 'die'],
        correctAnswers: ['das', 'Das']
      },
      explanation: '"Buch" is neuter (das Buch). Definite articles are used when referring to a specific object.',
      isCompleted: false
    },
    {
      id: 'a1-articles-5',
      topicId: 'a1-articles',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Ein Mann', right: 'A man' },
          { id: '2', left: 'Eine Frau', right: 'A woman' },
          { id: '3', left: 'Ein Kind', right: 'A child' },
          { id: '4', left: 'Keine Kinder', right: 'No children' }
        ]
      },
      explanation: 'Indefinite articles (ein/eine) and negation (keine) for singular and plural nouns.',
      isCompleted: false
    }
  ],
  'a1-verb': [
    {
      id: 'a1-verb-1',
      topicId: 'a1-verb',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Ich [blank] aus Berlin und du [blank] aus München.',
        wordBank: ['komme', 'kommst', 'kommt', 'kommen'],
        correctAnswers: ['komme', 'kommst']
      },
      explanation: 'Regular verb conjugation for "kommen": ich komme, du kommst.',
      isCompleted: false
    },
    {
      id: 'a1-verb-2',
      topicId: 'a1-verb',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Ich', right: 'bin' },
          { id: '2', left: 'Du', right: 'bist' },
          { id: '3', left: 'Er/Sie/Es', right: 'ist' },
          { id: '4', left: 'Wir', right: 'sind' }
        ]
      },
      explanation: 'Conjugation of the irregular verb "sein" (to be).',
      isCompleted: false
    },
    {
      id: 'a1-verb-3',
      topicId: 'a1-verb',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Wir [blank] Deutsch und ihr [blank] Englisch.',
        wordBank: ['lernen', 'lernt', 'lernst', 'lerne'],
        correctAnswers: ['lernen', 'lernt']
      },
      explanation: 'Regular verb conjugation for "lernen": wir lernen, ihr lernt.',
      isCompleted: false
    },
    {
      id: 'a1-verb-4',
      topicId: 'a1-verb',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Was [blank] du von Beruf? Ich [blank] Lehrer.',
        wordBank: ['bist', 'bin', 'ist', 'sind'],
        correctAnswers: ['bist', 'bin']
      },
      explanation: 'Using "sein" to talk about professions.',
      isCompleted: false
    },
    {
      id: 'a1-verb-5',
      topicId: 'a1-verb',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Trinken', right: 'To drink' },
          { id: '2', left: 'Essen', right: 'To eat' },
          { id: '3', left: 'Schlafen', right: 'To sleep' },
          { id: '4', left: 'Gehen', right: 'To go' }
        ]
      },
      explanation: 'Basic German infinitives and their English meanings.',
      isCompleted: false
    }
  ],
  'a1-sentence': [
    {
      id: 'a1-sentence-1',
      topicId: 'a1-sentence',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Heute [blank] ich nach Hause.',
        wordBank: ['gehe', 'gehst', 'geht', 'gehen'],
        correctAnswers: ['gehe']
      },
      explanation: 'The V2 rule: The verb always stays in the second position, even if the sentence starts with a time expression like "Heute".',
      isCompleted: false
    },
    {
      id: 'a1-sentence-2',
      topicId: 'a1-sentence',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Wer', right: 'Who' },
          { id: '2', left: 'Was', right: 'What' },
          { id: '3', left: 'Wo', right: 'Where' },
          { id: '4', left: 'Wie', right: 'How' }
        ]
      },
      explanation: 'Common German question words (W-Fragen).',
      isCompleted: false
    },
    {
      id: 'a1-sentence-3',
      topicId: 'a1-sentence',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Ich [blank] Pizza, aber ich [blank] keinen Fisch.',
        wordBank: ['esse', 'mag', 'trinke', 'komme'],
        correctAnswers: ['esse', 'mag']
      },
      explanation: 'Basic sentence construction with "aber" (but).',
      isCompleted: false
    },
    {
      id: 'a1-sentence-4',
      topicId: 'a1-sentence',
      type: 'fill-in-the-blank',
      content: {
        sentence: '[blank] du heute Zeit?',
        wordBank: ['Hast', 'Habe', 'Hat', 'Haben'],
        correctAnswers: ['Hast']
      },
      explanation: 'In Yes/No questions, the verb moves to the first position.',
      isCompleted: false
    },
    {
      id: 'a1-sentence-5',
      topicId: 'a1-sentence',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Ich gehe', right: 'ins Kino.' },
          { id: '2', left: 'Wir spielen', right: 'Fußball.' },
          { id: '3', left: 'Du trinkst', right: 'Wasser.' },
          { id: '4', left: 'Sie lernt', right: 'Deutsch.' }
        ]
      },
      explanation: 'Matching subjects and verbs with appropriate objects.',
      isCompleted: false
    }
  ],
  'a2-past': [
    {
      id: 'a2-past-1',
      topicId: 'a2-past',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Gestern [blank] ich im Kino [blank].',
        wordBank: ['bin', 'habe', 'gewesen', 'war'],
        correctAnswers: ['war']
      },
      explanation: 'The simple past (Präteritum) of "sein" is often used even in spoken German.',
      isCompleted: false
    },
    {
      id: 'a2-past-2',
      topicId: 'a2-past',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Ich habe', right: 'gegessen.' },
          { id: '2', left: 'Ich bin', right: 'gegangen.' },
          { id: '3', left: 'Ich habe', right: 'gelernt.' },
          { id: '4', left: 'Ich bin', right: 'gefahren.' }
        ]
      },
      explanation: 'Perfekt tense: Verbs of movement use "sein", most others use "haben".',
      isCompleted: false
    },
    {
      id: 'a2-past-3',
      topicId: 'a2-past',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Wir [blank] am Wochenende nach Berlin [blank].',
        wordBank: ['sind', 'haben', 'gefahren', 'gefahrst'],
        correctAnswers: ['sind', 'gefahren']
      },
      explanation: 'Forming the Perfekt tense with "fahren" (to drive/travel).',
      isCompleted: false
    },
    {
      id: 'a2-past-4',
      topicId: 'a2-past',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Früher [blank] ich viel Sport [blank].',
        wordBank: ['habe', 'gemacht', 'mache', 'bin'],
        correctAnswers: ['habe', 'gemacht']
      },
      explanation: 'Using Perfekt to talk about past habits.',
      isCompleted: false
    },
    {
      id: 'a2-past-5',
      topicId: 'a2-past',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Machen', right: 'gemacht' },
          { id: '2', left: 'Sagen', right: 'gesagt' },
          { id: '3', left: 'Hören', right: 'gehört' },
          { id: '4', left: 'Kaufen', right: 'gekauft' }
        ]
      },
      explanation: 'Regular past participles (ge + stem + t).',
      isCompleted: false
    }
  ],
  'b1-passive': [
    {
      id: 'b1-passive-1',
      topicId: 'b1-passive',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Das Haus [blank] gerade [blank].',
        wordBank: ['wird', 'wurde', 'gebaut', 'bauen'],
        correctAnswers: ['wird', 'gebaut']
      },
      explanation: 'The passive voice is formed with "werden" + past participle.',
      isCompleted: false
    },
    {
      id: 'b1-passive-2',
      topicId: 'b1-passive',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Der Brief', right: 'wird geschrieben.' },
          { id: '2', left: 'Die Tür', right: 'wird geschlossen.' },
          { id: '3', left: 'Das Auto', right: 'wird repariert.' },
          { id: '4', left: 'Die Blumen', right: 'werden gegossen.' }
        ]
      },
      explanation: 'Passive voice in the present tense for different subjects.',
      isCompleted: false
    },
    {
      id: 'b1-passive-3',
      topicId: 'b1-passive',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Gestern [blank] das Fenster [blank].',
        wordBank: ['wurde', 'wird', 'geputzt', 'putzen'],
        correctAnswers: ['wurde', 'geputzt']
      },
      explanation: 'Passive voice in the simple past (Präteritum): "wurde" + past participle.',
      isCompleted: false
    },
    {
      id: 'b1-passive-4',
      topicId: 'b1-passive',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Hier [blank] nicht [blank] werden.',
        wordBank: ['darf', 'muss', 'geraucht', 'rauchen'],
        correctAnswers: ['darf', 'geraucht']
      },
      explanation: 'Passive voice with modal verbs: modal verb + past participle + "werden".',
      isCompleted: false
    },
    {
      id: 'b1-passive-5',
      topicId: 'b1-passive',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Aktiv:', right: 'Ich lese das Buch.' },
          { id: '2', left: 'Passiv:', right: 'Das Buch wird gelesen.' },
          { id: '3', left: 'Aktiv:', right: 'Er kocht die Suppe.' },
          { id: '4', left: 'Passiv:', right: 'Die Suppe wird gekocht.' }
        ]
      },
      explanation: 'Comparing active and passive sentence structures.',
      isCompleted: false
    }
  ],
  'b2-nominalization': [
    {
      id: 'b2-nominalization-1',
      topicId: 'b2-nominalization',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Wegen [blank] [blank] Wetters bleiben wir zu Hause.',
        wordBank: ['des', 'schlechten', 'dem', 'schlecht'],
        correctAnswers: ['des', 'schlechten']
      },
      explanation: 'Nominalization often uses prepositions with the genitive case (e.g., "wegen").',
      isCompleted: false
    },
    {
      id: 'b2-nominalization-2',
      topicId: 'b2-nominalization',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Verb:', right: 'ankommen' },
          { id: '2', left: 'Nomen:', right: 'die Ankunft' },
          { id: '3', left: 'Verb:', right: 'entscheiden' },
          { id: '4', left: 'Nomen:', right: 'die Entscheidung' }
        ]
      },
      explanation: 'Converting verbs into their corresponding nouns.',
      isCompleted: false
    },
    {
      id: 'b2-nominalization-3',
      topicId: 'b2-nominalization',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Nach [blank] [blank] der Prüfung feiern wir.',
        wordBank: ['dem', 'Bestehen', 'das', 'Bestanden'],
        correctAnswers: ['dem', 'Bestehen']
      },
      explanation: 'Nominalization with "nach" (after) using the dative case.',
      isCompleted: false
    },
    {
      id: 'b2-nominalization-4',
      topicId: 'b2-nominalization',
      type: 'fill-in-the-blank',
      content: {
        sentence: 'Trotz [blank] [blank] hat er gewonnen.',
        wordBank: ['der', 'Verletzung', 'die', 'Verletzt'],
        correctAnswers: ['der', 'Verletzung']
      },
      explanation: 'Nominalization with "trotz" (despite) using the genitive case.',
      isCompleted: false
    },
    {
      id: 'b2-nominalization-5',
      topicId: 'b2-nominalization',
      type: 'mix-and-match',
      content: {
        pairs: [
          { id: '1', left: 'Satz:', right: 'Wenn es regnet...' },
          { id: '2', left: 'Nominal:', right: 'Bei Regen...' },
          { id: '3', left: 'Satz:', right: 'Weil er krank ist...' },
          { id: '4', left: 'Nominal:', right: 'Wegen seiner Krankheit...' }
        ]
      },
      explanation: 'Comparing verbal clauses with nominal expressions.',
      isCompleted: false
    }
  ]
};
