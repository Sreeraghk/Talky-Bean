import { GrammarTopic, RolePlayScenario, ListeningModule, LanguageLevel } from '../types';
import { GERMAN_GRAMMAR_TOPICS } from './de/grammarTopics';
import { GERMAN_ROLE_PLAY_SCENARIOS } from './de/rolePlayScenarios';
import { GERMAN_STARTER_LISTENING } from './de/starterListening';
import { COMMON_ROLE_PLAY_SCENARIOS } from './commonScenarios';

export interface LanguageContent {
  grammarTopics: GrammarTopic[];
  rolePlayScenarios: RolePlayScenario[];
  starterListening: { [level in LanguageLevel]?: ListeningModule };
}

const createTopics = (lang: string, topicsByLevel: { [level: string]: string[] }): GrammarTopic[] => {
  const topics: GrammarTopic[] = [];
  Object.entries(topicsByLevel).forEach(([level, names]) => {
    names.forEach((name, index) => {
      topics.push({
        id: `${lang}-${level.toLowerCase()}-${index}`,
        level,
        name,
        isCompleted: false,
        category: 'Major'
      });
    });
  });
  return topics;
};

const LANGUAGE_DATA: Record<string, LanguageContent> = {
  de: {
    grammarTopics: GERMAN_GRAMMAR_TOPICS,
    rolePlayScenarios: GERMAN_ROLE_PLAY_SCENARIOS,
    starterListening: GERMAN_STARTER_LISTENING,
  },
  fr: {
    grammarTopics: createTopics('fr', {
      'A1': [
        'Definite, Indefinite, and Partitive Articles',
        'Noun Gender and Pluralization',
        'Subject Pronouns',
        'Present Tense: Être, Avoir, Aller, Faire',
        'Regular -ER, -IR, -RE Verbs',
        'Basic Negation (ne...pas)',
        'Interrogative Structures (Intonation, Est-ce que, Inversion)',
        'Possessive and Demonstrative Adjectives',
        'Prepositions of Place and Time'
      ],
      'A2': [
        'Passé Composé with Avoir and Être',
        'Imparfait (Formation and Usage)',
        'Direct and Indirect Object Pronouns (COD/COI)',
        'Reflexive Verbs in Present and Past Tenses',
        'Future Proche vs. Future Simple',
        'Relative Pronouns (qui, que, où)',
        'Adverbs of Quantity and Intensity',
        'Comparative and Superlative Adjectives'
      ],
      'B1': [
        'Plus-que-parfait',
        'Present Subjunctive (Necessity, Will, Emotion)',
        'Conditional Mood (Present)',
        'Passive Voice (Basics)',
        'Le Gérondif',
        'Pronouns Y and EN',
        'Double Object Pronoun Placement',
        'Hypothetical "Si" Clauses (Type 1 & 2)'
      ],
      'B2': [
        'Past Subjunctive',
        'Future Perfect (Futur Antérieur)',
        'Conditional Past',
        'Reported Speech in the Past',
        'Complex Relative Pronouns (lequel, auquel, dont)',
        'Nominalization',
        'Logical Connectors (Opposition, Concession, Cause, Consequence)',
        'Subjunctive vs. Indicative after specific conjunctions'
      ],
      'C1': [
        'Passé Simple (Literary recognition)',
        'Subjunctive Imperfect and Pluperfect',
        'Advanced Passive Voice and Pronominal Passive',
        'Stylistic Inversion',
        'Nuanced Concessive Clauses',
        'Identifying and Using Register-Specific Syntax',
        'Advanced Hypothetical Structures (Type 3 and Mixed)'
      ]
    }),
    rolePlayScenarios: [
      { id: 'fr-rs-1', title: 'À la Boulangerie', description: 'Order a baguette and some pastries.', context: 'You are at a local bakery in Paris. The baker is friendly but busy. Order a tradition and two croissants.' },
      { id: 'fr-rs-2', title: 'Visite au Musée', description: 'Ask about tickets and information at a museum.', context: 'You are at the Louvre. Ask the staff about the closing time and where to find the Mona Lisa.' }
    ],
    starterListening: {},
  },
  es: {
    grammarTopics: createTopics('es', {
      'A1': [
        'Gender and Number of Nouns/Adjectives',
        'Personal Subject Pronouns',
        'Present Indicative (Regular and Irregular)',
        'Ser vs. Estar',
        'Definite and Indefinite Articles',
        'Possessive Adjectives (Short forms)',
        'Hay vs. Está',
        'The verb Gustar (Basics)',
        'Numbers and Telling Time'
      ],
      'A2': [
        'Pretérito Indefinito (Regular and Irregular)',
        'Pretérito Imperfecto',
        'Pretérito Perfecto',
        'Direct and Indirect Object Pronouns',
        'Reflexive Verbs and Daily Routines',
        'Verbal Periphrases (Ir a + Infinitive, Estar + Gerund)',
        'Comparatives and Superlatives',
        'Affirmative Imperative (Tú/Usted)'
      ],
      'B1': [
        'Pretérito Pluscuamperfecto',
        'Present Subjunctive (Wishes, Doubts, Emotions)',
        'Negative Imperative',
        'Future Simple and Conditional Simple',
        'Relative Pronouns (que, quien, el que)',
        'Passive Voice with Se',
        'Adverbs of Manner and Frequency',
        'Prepositions Por and Para'
      ],
      'B2': [
        'Imperfect Subjunctive',
        'Future Perfect and Conditional Perfect',
        'Conditional Clauses (Si + Subjunctive)',
        'Reported Speech',
        'Verbs of Change (Ponerse, Quedarse, Volverse)',
        'Compound Subjunctive Tenses',
        'Cohesive Connectors for Argumentation',
        'Advanced uses of the Particle Se (Accidental, Impersonal)'
      ],
      'C1': [
        'Subjunctive in Complex Subordinate Clauses',
        'Use of Cuyo and El cual',
        'Stylistic Passive Voice with Ser',
        'Nominalization of Clauses',
        'Nuanced Concessive and Consecutive Connectors',
        'Advanced Gerund and Participle Constructions',
        'Regional Syntactic Variations and Registers'
      ]
    }),
    rolePlayScenarios: [
      { id: 'es-rs-1', title: 'En el Mercado', description: 'Buy fresh fruits and vegetables.', context: 'You are at a local market in Madrid. Ask for the price of tomatoes and buy half a kilo of oranges.' },
      { id: 'es-rs-2', title: 'Check-in en el Hotel', description: 'Check into your hotel room.', context: 'You have a reservation at a hotel in Barcelona. Talk to the receptionist and ask for the WiFi password.' }
    ],
    starterListening: {},
  },
  it: {
    grammarTopics: createTopics('it', {
      'A1': [
        'Nouns and Adjective Agreement',
        'Definite and Indefinite Articles',
        'Present Indicative (Essere, Avere, Regular Verbs)',
        'Interrogatives (Chi, Cosa, Dove, Quando)',
        'Simple Prepositions (Di, A, Da, In, Con, Su)',
        'Numbers and Dates',
        'Possessive Adjectives',
        'Basic Negation'
      ],
      'A2': [
        'Passato Prossimo (Choice of Auxiliary)',
        'L’Imperfetto',
        'Combined Prepositions',
        'Direct Object Pronouns (Lo, La, Li, Le)',
        'Reflexive and Pronominal Verbs',
        'Future Semplice',
        'Comparison (Equality and Superiority)',
        'Imperative (Informal)'
      ],
      'B1': [
        'Passato Prossimo vs. Imperfetto',
        'Indirect Object Pronouns',
        'Double Pronouns (Me lo, Te la)',
        'Present Subjunctive',
        'Conditional Present',
        'Particle Ci and Ne',
        'Relative Pronouns (Che, Cui, Il quale)',
        'Passato Remoto (Basics)'
      ],
      'B2': [
        'Trapassato Prossimo',
        'Past and Imperfect Subjunctive',
        'Conditional Past',
        'Passive Voice (Venire vs. Essere)',
        'Si Impersonal and Passive',
        'Hypothetical Sentences (Type 1, 2, and 3)',
        'Nominalization and Suffixes',
        'Connectors for Discourse Cohesion'
      ],
      'C1': [
        'Subjunctive Pluperfect',
        'Historical Past (Passato Remoto) in literature',
        'Subjunctive in Relative and Concessive Clauses',
        'Gerunds and Infinitives in Complex Sentences',
        'Advanced Pronominal Verbs (Cavarsela, Farcela)',
        'Stylistic Inversion and Rhetorical Figures',
        'Nuanced Use of Moods in Dependent Clauses'
      ]
    }),
    rolePlayScenarios: [
      { id: 'it-rs-1', title: 'Al Ristorante', description: 'Order food and drinks in an Italian restaurant.', context: 'You are at a "Trattoria" in Rome. You want to order a pasta dish and a glass of wine.' },
      { id: 'it-rs-2', title: 'Per Strada', description: 'Ask for directions in the city.', context: 'You are lost in Florence and need to find the Duomo. Ask a passerby for help.' }
    ],
    starterListening: {},
  },
  pt: {
    grammarTopics: createTopics('pt', {
      'A1': [
        'Gender and Number of Nouns',
        'Definite and Indefinite Articles',
        'Personal Pronouns',
        'Present Indicative (Ser, Estar, Ter, Ir)',
        'Regular Verb Conjugation (-AR, -ER, -IR)',
        'Basic Prepositions and Contractions (do, da, no, na)',
        'Possessives and Demonstratives',
        'Interrogative Pronouns'
      ],
      'A2': [
        'Pretérito Perfeito (Simple and Compound)',
        'Pretérito Imperfeito',
        'Future Próximo (Ir + Infinitive)',
        'Object Pronouns (Placement)',
        'Reflexive Verbs',
        'Degrees of Adjectives (Comparative/Superlative)',
        'Present Continuous (Estar a + Infinitive or Gerund)',
        'Affirmative Imperative'
      ],
      'B1': [
        'Pretérito Mais-que-perfeito',
        'Present Subjunctive',
        'Personal Infinitive (Infinitivo Pessoal)',
        'Future Simple Indicative',
        'Conditional Simple',
        'Relative Clauses (que, quem, cujo)',
        'Passive Voice (Basics)',
        'Connectors of Contrast and Reason'
      ],
      'B2': [
        'Imperfect and Future Subjunctive',
        'Compound Subjunctive Tenses',
        'Compound Conditional',
        'Passive Voice with Ser vs. Se',
        'Reported Speech',
        'Diminutives and Augmentatives (Semantics)',
        'Advanced Pronominal Placement (Mesóclise)',
        'Complex Conjunctions (Embora, Caso, Contanto que)'
      ],
      'C1': [
        'Subjunctive in Formal and Academic Contexts',
        'Advanced Nominalization',
        'Subtle Aspectual Differences in Verbs',
        'Archaic and Literary Syntactic Structures',
        'Cohesion Markers in Complex Texts',
        'Nuances of Modal Verbs',
        'Stylistic Inversion and Ellipsis'
      ]
    }),
    rolePlayScenarios: [
      { id: 'pt-rs-1', title: 'No Café', description: 'Order a coffee and a pastry in Portugal.', context: 'You are at a "Pastelaria" in Lisbon. Order a "café" and a "pastel de nata".' },
      { id: 'pt-rs-2', title: 'O Encontro', description: 'Introduce yourself to a new friend.', context: 'You are meeting a language partner in Porto. Introduce yourself and talk about your hobbies.' }
    ],
    starterListening: {},
  },
  zh: {
    grammarTopics: createTopics('zh', {
      'L1': [
        'Basic Word Order (S-V-O)',
        'Personal Pronouns',
        'Numbers and Basic Measure Words',
        'Yes/No Questions with Ma (吗)',
        'Negation with Bu (不) and Mei (没)',
        'The Possessive Particle De (的)',
        'Adverbs of Degree (Hen 很)',
        'Modal Verbs (Hui 会, Neng 能)'
      ],
      'L2': [
        'Aspect Particle Le (了) for Completed Actions',
        'Complement of State (De 得)',
        'Comparisons with Bi (比)',
        'Progress Aspect (Zai 在)',
        'Specific Question Words',
        'Reduplication of Verbs',
        'Preposition Xiang (向) and Cong (从)',
        'Durative Aspect Zhe (着)'
      ],
      'L3': [
        'Resultative Complements',
        'Potential Complements',
        'Passive Sentences with Bei (被)',
        'Disposal Sentences with Ba (把)',
        'Conditional Structures (Ruguo... jiu)',
        'Co-verbs and Directional Complements',
        'Emphatic Shi... de (是...的) Structure',
        'Conjunctions (Suiran... danshi)'
      ],
      'L4': [
        'Complex Directional Complements',
        'Rhetorical Questions',
        'Approximate Numbers',
        'Advanced Conjunctions (Bujin... erqie)',
        'Flexible use of Interrogative Pronouns',
        'Passive Structures without Bei',
        'Double Negation for Emphasis',
        'Idiomatic Patterns (Lian... dou)'
      ],
      'L5': [
        'Classic Particles in Modern Contexts',
        'Formal vs. Informal Syntax',
        'Nuanced Adverb Placement',
        'Complex Extended Sentences',
        'Stylistic Balance in Four-Character Idioms (Chengyu)',
        'Advanced Clause Linking without Conjunctions',
        'Inversion and Emphasis in Written Prose'
      ]
    }),
    rolePlayScenarios: [
      { id: 'zh-rs-1', title: 'Eating Out', description: 'Order Chinese food at a local restaurant.', context: 'You are at a restaurant in Beijing. Order some dumplings and tea.' },
      { id: 'zh-rs-2', title: 'Taking a Taxi', description: 'Tell the driver where you want to go.', context: 'You are in Shanghai and need to get to the airport. Talk to the driver about the destination and the traffic.' }
    ],
    starterListening: {},
  },
  ko: {
    grammarTopics: createTopics('ko', {
      'L1': [
        'Subject, Object, and Topic Particles (-i/ga, -eul/reul, -eun/neun)',
        'Present Tense (Formal and Informal Polite)',
        'Copula Ida/Anida',
        'Basic Negation (An, -ji anta)',
        'Sino-Korean and Native Korean Numbers',
        'Time and Place Particles (-e, -eseo)',
        'Desire (-go sipda)',
        'Conjunctions -go and -aseo/eoseo'
      ],
      'L2': [
        'Past and Future Tense',
        'Honorifics (Subject and Object)',
        'Ability (-reul su itda/eoptda)',
        'Intent (-(eu)ryeogo)',
        'Experiences (-n 적이 있다)',
        'Comparative (-boda)',
        'Progressive (-go itda)',
        'Cause and Reason (-(eu)nikka)'
      ],
      'L3': [
        'Passive and Causative Verbs',
        'Reported Speech (Quotative Particles)',
        'Supposition and Conjecture (-neun geot gatda)',
        'Conditional (-(eu)myeon)',
        'Nominalization (-neun geot)',
        'Intermediate Connectors (-neunde, -jiman)',
        'Formal Written Style (Plain Form)',
        'Modifiers (Adjectival forms of verbs)'
      ],
      'L4': [
        'Advanced Causative/Passive Nuances',
        'Retrospective Suffixes (-deora, -deon)',
        'Complex Cause and Effect (-neun barame, -euromanxe)',
        'Intent and Determination (-getda)',
        'Hypothetical Conditionals (-at/eotdamyeon)',
        'Expressing Purpose (-dorok)',
        'Double Negation and Strong Affirmation',
        'Emphatic Modifiers'
      ],
      'L5': [
        'Literary and Academic Sentence Structures',
        'Archaic Grammar in Formal Speeches',
        'Nuanced Modal Expressions of Probability',
        'High-level Connectors for Argumentation',
        'Advanced Honorific Variations',
        'Idiomatic Grammatical Clusters',
        'Precise Use of Formal Ending Variations'
      ]
    }),
    rolePlayScenarios: [
      { id: 'ko-rs-1', title: 'At the Market', description: 'Buy fruits at a Korean traditional market.', context: 'You are at Gwangjang Market. Buy some apples and ask for the price.' }
    ],
    starterListening: {},
  },
  ja: {
    grammarTopics: createTopics('ja', {
      'N5': [
        'Particles (Wa, Ga, O, Ni, De, He, No)',
        'Verb Conjugation (Masu-form)',
        'Adjective Conjugation (I and Na adjectives)',
        'Basic Negation and Past Tense',
        'Te-form (Request and Succession)',
        'Existence Verbs (Arimasu, Imasu)',
        'Question Formations',
        'Counters and Numbers'
      ],
      'N4': [
        'Plain Form (Dictionary, Nai, Ta forms)',
        'Potential Form (Can do)',
        'Conditional (-tara, -ba)',
        'Volitional Form (Let’s do)',
        'Passive Voice (Basics)',
        'Relative Clauses',
        'Quotations (~to iu, ~to omou)',
        'Giving and Receiving (Ageru, Morau, Kureru)'
      ],
      'N3': [
        'Honorifics (Sonkeigo and Kenjougo basics)',
        'Causative Form',
        'Complex Conditionals (~nara)',
        'Transitive and Intransitive Verbs',
        'Expressing Regret (~te shimau)',
        'Conjectures (~hazu, ~rashii, ~youdesu)',
        'Nominalizers (Koto, No)',
        'Intermediate Connectors (~tame, ~youni)'
      ],
      'N2': [
        'Advanced Passive and Causative Combinations',
        'Formal and Literary Connectors',
        'Subjunctive-like Conjectures (~kanemashou, ~mai)',
        'Time-related Markers (~tsutsu, ~to tomo ni)',
        'Emphasis and Limitation (~nomi, ~sae)',
        'Verbs of Emotion and Sensation',
        'Complex Sentence Endings',
        'Nominalization for Abstract Ideas'
      ],
      'N1': [
        'Classical/Literary Grammar in Modern Usage',
        'Highly Formal Honorifics',
        'Subtle Nuances of Modal Verbs',
        'Rhetorical Structures for Logic and Persuasion',
        'Extremely Formal Conjunctions',
        'Rare Particles and Archaic Sentence Endings',
        'Advanced Logical Connectors (~yue ni, ~ita itte)'
      ]
    }),
    rolePlayScenarios: [
      { id: 'ja-rs-1', title: 'Introduction', description: 'Introduce yourself in Japanese.', context: 'You are at a language exchange meetup in Tokyo. High school student introduce yourself.' },
      { id: 'ja-rs-2', title: 'At the Izakaya', description: 'Order drinks and snacks at a pub.', context: 'You are at an Izakaya in Osaka. Order a beer and some yakitori.' }
    ],
    starterListening: {},
  },
  ru: {
    grammarTopics: createTopics('ru', {
      'TEU': [
        'Cyrillic Alphabet and Phonetics',
        'Gender and Number of Nouns',
        'Personal and Possessive Pronouns',
        'Nominative Case',
        'Prepositional Case (Location)',
        'Present Tense Conjugation (Group 1 & 2)',
        'Past Tense (Gender-based)',
        'Basic Negative Sentences (Net, Ne)'
      ],
      'TBU': [
        'Accusative Case (Direct Objects)',
        'Genitive Case (Possession, Negation, Quantity)',
        'Dative Case (Indirect Objects)',
        'Future Tense (Simple and Compound)',
        'Verbs of Motion (Unprefixed)',
        'Reflexive Verbs (-sya)',
        'Comparatives of Adjectives',
        'Imperative Mood'
      ],
      'TRKI-1': [
        'Instrumental Case',
        'Verbal Aspect (Imperfective vs. Perfective)',
        'Prefixed Verbs of Motion',
        'Conditional Mood (By)',
        'Relative Pronoun Kotory',
        'Adjectival Declension (All Cases)',
        'Indefinite Pronouns (-to, -nibud)',
        'Cardinal and Ordinal Numbers (Declension)'
      ],
      'TRKI-2': [
        'Active and Passive Participles',
        'Verbal Adverbs (Gerunds)',
        'Passive Voice and Short Forms of Adjectives',
        'Complex Sentence Structure with Chtoby',
        'Nuanced Use of Verbs of Motion with Prefixes',
        'Declension of Surnames and Geographical Names',
        'Subjunctive Mood in Complex Sentences',
        'Particles (Zhe, Ved, Li)'
      ],
      'TRKI-3': [
        'Archaic and Literary Grammar Structures',
        'Stylistic Variations in Case Usage',
        'Advanced Participle Clauses',
        'Nuances of Modality and Probability',
        'Scientific and Legal Syntactic Patterns',
        'Semantic Nuances of Prefixes and Suffixes',
        'Rhetorical Inversion and Ellipsis'
      ]
    }),
    rolePlayScenarios: [
      { id: 'ru-rs-1', title: 'Meeting Someone', description: 'Basic greetings and introductions.', context: 'You are meeting a new coworker in Moscow. Exchange names and greetings.' }
    ],
    starterListening: {},
  },
  ga: {
    grammarTopics: createTopics('ga', {
      'A1': [
        'VSO Word Order',
        'Initial Mutations (Lenition and Eclipsis)',
        'Present Tense (Regular Verbs)',
        'Definite Article and Noun Gender',
        'Copula Is vs. Substantive Verb Bí',
        'Prepositional Pronouns (Basics)',
        'Numbers (Personal and Non-personal)',
        'Adjective Agreement'
      ],
      'A2': [
        'Past Tense and Future Tense',
        'Verbal Nouns (Continuous Actions)',
        'Possessive Adjectives and Mutations',
        'Interrogatives and Negative Particles',
        'Compound Prepositions',
        'Comparative and Superlative Adjectives',
        'Plural Noun Formations',
        'Basic Imperatives'
      ],
      'B1': [
        'The Habitual Past (An t-Imperfect)',
        'Conditional Mood',
        'The Genitive Case (Basics)',
        'Direct and Indirect Relative Clauses',
        'Inflected Prepositions (Advanced)',
        'Copula in Past and Conditional',
        'Irregular Verbs (Complete Conjugation)',
        'Numbers with Nouns and Mutations'
      ],
      'B2': [
        'Advanced Genitive Case',
        'The Subjunctive Mood',
        'Passive Voice (An Saorbhriathar)',
        'Complex Relative Clauses',
        'Verbal Noun Clauses and Word Order',
        'Prepositional Phrases and Idioms',
        'Dialectal Variations in Syntax',
        'Cleft Sentences (Focus)'
      ],
      'C1': [
        'Literary Forms and Archaic Conjugations',
        'Advanced Syntax of the Copula',
        'Nuanced Use of the Subjunctive',
        'Syntactic Differences in Official Standard',
        'Stylistic Use of Mutations',
        'Advanced Rhetorical Structures',
        'Participles in Formal Prose'
      ]
    }),
    rolePlayScenarios: [
      { id: 'ga-rs-1', title: 'At the Pub', description: 'Order a drink in the Gaeltacht.', context: 'You are in a pub in Galway. Order a drink and chat briefly about the weather.' }
    ],
    starterListening: {},
  },
  fi: {
    grammarTopics: createTopics('fi', {
      '1': [
        'Vowel Harmony',
        'Consonant Gradation (KPT)',
        'Personal Pronouns and Present Conjugation',
        'The Partitive Case (Basics)',
        'Genitive Case',
        'Location Cases (Inessive, Elative, Illative)',
        'Verb Types (1-6)',
        'Negation Verb'
      ],
      '2': [
        'The Imperfect (Past Tense)',
        'Adessive, Ablative, and Allative Cases',
        'Existential Sentences (Minulla on)',
        'Object Rules (Accusative vs. Partitive)',
        'Imperative Mood (Positive and Negative)',
        'Numbers and Case Agreement',
        'Comparative of Adjectives',
        'Rections (Verb + Case)'
      ],
      '3': [
        'Perfect and Pluperfect Tenses',
        'The Conditional Mood',
        'The Passive Voice (Present and Past)',
        'The Infinitive Forms (MA, MINEN)',
        'Participles as Adjectives',
        'Essive and Translative Cases',
        'Pronouns (Joka, Mikä)',
        'Word Formation and Suffixes'
      ],
      '4': [
        'Advanced Participles (Agent, Negative)',
        'Potential Mood',
        'Rare Cases (Abessive, Comitative, Instructive)',
        'Passive Conditional and Passive Potential',
        'Temporal and Modal Participle Clauses',
        'Advanced Rections and Idiomatic Syntax',
        'Discourse Particles (-han, -pa, -kin)',
        'Sentence Adverbs'
      ],
      '5': [
        'Archaic and Dialectal Grammar',
        'Advanced Nominalization',
        'Complex Clause Embedding',
        'Stylistic Inversion',
        'Subtle Aspectual Differences',
        'Academic Writing Syntax',
        'Nuances of Suffix Combinations'
      ]
    }),
    rolePlayScenarios: [
      { id: 'fi-rs-1', title: 'At the Sauna', description: 'Small talk in a Finnish sauna.', context: 'You are at a public sauna in Helsinki. Make brief small talk about the heat and the water.' }
    ],
    starterListening: {},
  }
};

export function getLanguageContent(lang: string): LanguageContent {
  const data = LANGUAGE_DATA[lang] || LANGUAGE_DATA['de'];
  // Merge common scenarios with language-specific ones
  const langScenarios = data.rolePlayScenarios || [];
  
  // Create a unique set of scenarios, prioritizing language-specific ones if IDs collide
  const combinedScenarios = [...COMMON_ROLE_PLAY_SCENARIOS];
  
  langScenarios.forEach(ls => {
    const exists = combinedScenarios.findIndex(cs => cs.id === ls.id);
    if (exists > -1) {
      combinedScenarios[exists] = {
        ...combinedScenarios[exists],
        ...ls,
        imageUrl: ls.imageUrl || combinedScenarios[exists].imageUrl,
        category: ls.category || combinedScenarios[exists].category
      };
    } else {
      combinedScenarios.push(ls);
    }
  });

  return {
    ...data,
    rolePlayScenarios: combinedScenarios
  };
}

