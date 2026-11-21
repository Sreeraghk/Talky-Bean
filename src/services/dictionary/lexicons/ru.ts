import { LexiconModule } from '../types';

/**
 * Russian (Русский) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / Wiktionary & FreeDict contributors.
 * Supports Cyrillic base lemmas, grammatical genders, irregular forms, and translations.
 */
export const russianLexicon: LexiconModule = {
  languageCode: 'ru',
  languageName: 'Russian',
  license: 'CC BY-SA 4.0 / Open Data',
  attribution: 'Derived from Wiktionary & FreeDict open linguistic resources under CC BY-SA 4.0',
  entries: [
    // Verbs
    { lemma: 'быть', pos: 'verb', translations: ['to be'], irregularForms: ['был', 'была', 'было', 'были', 'будет', 'будут'], level: 'A1', definition: 'Exist or possess identity.' },
    { lemma: 'сказать', pos: 'verb', translations: ['to say', 'to tell'], irregularForms: ['скажет', 'сказал', 'сказала', 'скажи'], level: 'A1', definition: 'Utter spoken words (perfective).' },
    { lemma: 'говорить', pos: 'verb', translations: ['to speak', 'to talk'], irregularForms: ['говорю', 'говорит', 'говорил'], level: 'A1', definition: 'Converse verbally (imperfective).' },
    { lemma: 'идти', pos: 'verb', translations: ['to go (on foot)'], irregularForms: ['иду', 'идёт', 'шёл', 'шла', 'шли'], level: 'A1', definition: 'Move on foot in one direction.' },
    { lemma: 'ходить', pos: 'verb', translations: ['to go', 'to walk (regularly)'], irregularForms: ['хожу', 'ходит', 'ходил'], level: 'A1', definition: 'Walk repeatedly or multidirectionally.' },
    { lemma: 'видеть', pos: 'verb', translations: ['to see'], irregularForms: ['вижу', 'видит', 'видел'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: 'знать', pos: 'verb', translations: ['to know'], irregularForms: ['знаю', 'знает', 'знал'], level: 'A1', definition: 'Possess knowledge.' },
    { lemma: 'думать', pos: 'verb', translations: ['to think'], irregularForms: ['думаю', 'думает', 'думал'], level: 'A1', definition: 'Engage in mental reflection.' },
    { lemma: 'делать', pos: 'verb', translations: ['to do', 'to make'], irregularForms: ['делаю', 'делает', 'делал'], level: 'A1', definition: 'Perform an action or construct.' },
    { lemma: 'жить', pos: 'verb', translations: ['to live'], irregularForms: ['живу', 'живёт', 'жил', 'жила'], level: 'A1', definition: 'Be alive or reside.' },
    { lemma: 'есть', pos: 'verb', translations: ['to eat'], irregularForms: ['ем', 'ест', 'едят', 'ел', 'ела'], level: 'A1', definition: 'Consume nourishment.' },
    { lemma: 'пить', pos: 'verb', translations: ['to drink'], irregularForms: ['пью', 'пьёт', 'пил', 'пила'], level: 'A1', definition: 'Ingest liquids.' },
    { lemma: 'спать', pos: 'verb', translations: ['to sleep'], irregularForms: ['сплю', 'спит', 'спал', 'спала'], level: 'A1', definition: 'Rest in sleep.' },
    { lemma: 'читать', pos: 'verb', translations: ['to read'], irregularForms: ['читаю', 'читает', 'читал'], level: 'A1', definition: 'Comprehend written text.' },
    { lemma: 'писать', pos: 'verb', translations: ['to write'], irregularForms: ['пишу', 'пишет', 'писал'], level: 'A1', definition: 'Inscribe characters.' },
    { lemma: 'работать', pos: 'verb', translations: ['to work'], irregularForms: ['работаю', 'работает', 'работал'], level: 'A1', definition: 'Perform employment.' },
    { lemma: 'развивать', pos: 'verb', translations: ['to develop'], irregularForms: ['развивает', 'развивал'], level: 'B1', definition: 'Expand or innovate.' },
    { lemma: 'защищать', pos: 'verb', translations: ['to protect'], irregularForms: ['защищает', 'защищал'], level: 'B1', definition: 'Defend or guard.' },

    // Nouns
    { lemma: 'человек', pos: 'noun', gender: 'm', translations: ['person', 'human'], irregularForms: ['люди', 'людей', 'человека'], level: 'A1', definition: 'Human being.' },
    { lemma: 'время', pos: 'noun', gender: 'n', translations: ['time'], irregularForms: ['времени', 'времена'], level: 'A1', definition: 'Continuous progression of existence.' },
    { lemma: 'год', pos: 'noun', gender: 'm', translations: ['year'], irregularForms: ['года', 'лет', 'годы'], level: 'A1', definition: 'Twelve months.' },
    { lemma: 'день', pos: 'noun', gender: 'm', translations: ['day'], irregularForms: ['дня', 'дни', 'дней'], level: 'A1', definition: 'Daylight or 24-hour cycle.' },
    { lemma: 'дом', pos: 'noun', gender: 'm', translations: ['house', 'home'], irregularForms: ['дома', 'домов'], level: 'A1', definition: 'Dwelling place.' },
    { lemma: 'город', pos: 'noun', gender: 'm', translations: ['city', 'town'], irregularForms: ['города', 'городов'], level: 'A1', definition: 'Urban municipality.' },
    { lemma: 'страна', pos: 'noun', gender: 'f', translations: ['country', 'nation'], irregularForms: ['страны', 'стран'], level: 'A1', definition: 'Sovereign nation.' },
    { lemma: 'вода', pos: 'noun', gender: 'f', translations: ['water'], irregularForms: ['воды'], level: 'A1', definition: 'Essential liquid.' },
    { lemma: 'здоровье', pos: 'noun', gender: 'n', translations: ['health'], level: 'A2', definition: 'Physical and mental well-being.' },
    { lemma: 'питание', pos: 'noun', gender: 'n', translations: ['nutrition', 'diet'], level: 'A2', definition: 'Process of nourishment.' },
    { lemma: 'сон', pos: 'noun', gender: 'm', translations: ['sleep', 'dream'], irregularForms: ['сна', 'сны'], level: 'A2', definition: 'Natural state of rest.' },
    { lemma: 'природа', pos: 'noun', gender: 'f', translations: ['nature'], level: 'A1', definition: 'Physical outdoors and wildlife.' },
    { lemma: 'окружающая среда', pos: 'noun', gender: 'f', translations: ['environment'], level: 'B1', definition: 'Ecological surroundings.' },
    { lemma: 'общество', pos: 'noun', gender: 'n', translations: ['society'], level: 'B1', definition: 'Organized human community.' },
    { lemma: 'будущее', pos: 'noun', gender: 'n', translations: ['future'], level: 'A2', definition: 'Time to come.' },

    // Adjectives
    { lemma: 'хороший', pos: 'adj', translations: ['good'], irregularForms: ['хорошая', 'хорошее', 'хорошие', 'лучше', 'лучший'], level: 'A1', definition: 'Pleasant or high quality.' },
    { lemma: 'большой', pos: 'adj', translations: ['big', 'large'], irregularForms: ['большая', 'большое', 'большие', 'больше'], level: 'A1', definition: 'Of considerable magnitude.' },
    { lemma: 'маленький', pos: 'adj', translations: ['small', 'little'], irregularForms: ['маленькая', 'маленькое', 'маленькие', 'меньше'], level: 'A1', definition: 'Of minor size.' },
    { lemma: 'новый', pos: 'adj', translations: ['new'], irregularForms: ['новая', 'новое', 'новые'], level: 'A1', definition: 'Recently created.' },
    { lemma: 'старый', pos: 'adj', translations: ['old'], irregularForms: ['старая', 'старое', 'старые'], level: 'A1', definition: 'Advanced in age.' },
    { lemma: 'важный', pos: 'adj', translations: ['important'], irregularForms: ['важная', 'важное', 'важные'], level: 'A1', definition: 'Significant.' },
    { lemma: 'здоровый', pos: 'adj', translations: ['healthy'], irregularForms: ['здоровая', 'здоровое', 'здоровые'], level: 'A2', definition: 'In good physical shape.' },
    { lemma: 'свежий', pos: 'adj', translations: ['fresh'], irregularForms: ['свежая', 'свежее', 'свежие'], level: 'A1', definition: 'Clean or newly harvested.' }
  ]
};

export default russianLexicon;
