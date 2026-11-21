import { LexiconModule } from '../types';

/**
 * Korean (한국어) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / National Institute of Korean Language & Wiktionary.
 * Supports canonical dictionary forms (-da), conjugated stems, and educational translations.
 */
export const koreanLexicon: LexiconModule = {
  languageCode: 'ko',
  languageName: 'Korean',
  license: 'CC BY-SA 4.0 / Open Data',
  attribution: 'Derived from Korean linguistic datasets and Wiktionary under CC BY-SA 4.0',
  entries: [
    // Verbs (Dictionary base forms ending in -다)
    { lemma: '하다', pos: 'verb', translations: ['to do'], irregularForms: ['하고', '해서', '했다', '한다', '해요'], level: 'A1', definition: 'Perform an action or carry out work.' },
    { lemma: '가다', pos: 'verb', translations: ['to go'], irregularForms: ['가고', '가서', '갔다', '간다', '가요'], level: 'A1', definition: 'Move towards a destination.' },
    { lemma: '오다', pos: 'verb', translations: ['to come'], irregularForms: ['오고', '와서', '왔다', '온다', '와요'], level: 'A1', definition: 'Move towards speaker.' },
    { lemma: '보다', pos: 'verb', translations: ['to see', 'to look', 'to watch'], irregularForms: ['보고', '봐서', '봤다', '본다', '봐요'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: '먹다', pos: 'verb', translations: ['to eat'], irregularForms: ['먹고', '먹어서', '먹었다', '먹는다', '먹어요'], level: 'A1', definition: 'Consume food.' },
    { lemma: '마시다', pos: 'verb', translations: ['to drink'], irregularForms: ['마시고', '마셔서', '마셨다', '마신다', '마셔요'], level: 'A1', definition: 'Ingest liquids.' },
    { lemma: '말하다', pos: 'verb', translations: ['to speak', 'to talk'], irregularForms: ['말하고', '말했다', '말해요'], level: 'A1', definition: 'Communicate verbally.' },
    { lemma: '듣다', pos: 'verb', translations: ['to hear', 'to listen'], irregularForms: ['듣고', '들어서', '들었다', '들어요'], level: 'A1', definition: 'Perceive sound.' },
    { lemma: '읽다', pos: 'verb', translations: ['to read'], irregularForms: ['읽고', '읽어서', '읽었다', '읽어요'], level: 'A1', definition: 'Comprehend written words.' },
    { lemma: '쓰다', pos: 'verb', translations: ['to write', 'to use'], irregularForms: ['쓰고', '써서', '썼다', '써요'], level: 'A1', definition: 'Inscribe characters or employ.' },
    { lemma: '자다', pos: 'verb', translations: ['to sleep'], irregularForms: ['자고', '자서', '잤다', '자요'], level: 'A1', definition: 'Rest in sleep.' },
    { lemma: '일어나다', pos: 'verb', translations: ['to wake up', 'to stand up'], irregularForms: ['일어나고', '일어났다', '일어나요'], level: 'A1', definition: 'Rise from rest.' },
    { lemma: '일하다', pos: 'verb', translations: ['to work'], irregularForms: ['일하고', '일했다', '일해요'], level: 'A1', definition: 'Perform employment.' },
    { lemma: '공부하다', pos: 'verb', translations: ['to study'], irregularForms: ['공부하고', '공부했다', '공부해요'], level: 'A1', definition: 'Engage in academic study.' },
    { lemma: '살다', pos: 'verb', translations: ['to live', 'to reside'], irregularForms: ['살고', '살아서', '살았다', '살아요'], level: 'A1', definition: 'Be alive or reside.' },
    { lemma: '발전하다', pos: 'verb', translations: ['to develop', 'to advance'], irregularForms: ['발전하고', '발전했다', '발전해요'], level: 'B1', definition: 'Grow or make progress.' },
    { lemma: '보호하다', pos: 'verb', translations: ['to protect'], irregularForms: ['보호하고', '보호했다', '보호해요'], level: 'B1', definition: 'Keep safe from harm.' },

    // Nouns
    { lemma: '건강', pos: 'noun', translations: ['health'], level: 'A2', definition: 'Physical and mental well-being.' },
    { lemma: '식사', pos: 'noun', translations: ['meal'], level: 'A1', definition: 'Eating food at a set time.' },
    { lemma: '운동', pos: 'noun', translations: ['exercise', 'sports'], level: 'A1', definition: 'Physical bodily activity.' },
    { lemma: '수면', pos: 'noun', translations: ['sleep'], level: 'A2', definition: 'Periodic state of bodily rest.' },
    { lemma: '물', pos: 'noun', translations: ['water'], level: 'A1', definition: 'Potable transparent liquid.' },
    { lemma: '사람', pos: 'noun', translations: ['person', 'people'], level: 'A1', definition: 'Human being.' },
    { lemma: '시간', pos: 'noun', translations: ['time', 'hours'], level: 'A1', definition: 'Duration or time interval.' },
    { lemma: '년', pos: 'noun', translations: ['year'], level: 'A1', definition: 'Twelve months.' },
    { lemma: '날', pos: 'noun', translations: ['day'], level: 'A1', definition: 'Day of week or daylight.' },
    { lemma: '친구', pos: 'noun', translations: ['friend'], level: 'A1', definition: 'Companion.' },
    { lemma: '집', pos: 'noun', translations: ['house', 'home'], level: 'A1', definition: 'Residential building.' },
    { lemma: '도시', pos: 'noun', translations: ['city'], level: 'A1', definition: 'Urban municipality.' },
    { lemma: '나라', pos: 'noun', translations: ['country', 'nation'], level: 'A1', definition: 'Sovereign nation.' },
    { lemma: '자연', pos: 'noun', translations: ['nature'], level: 'A2', definition: 'Physical world.' },
    { lemma: '환경', pos: 'noun', translations: ['environment'], level: 'B1', definition: 'Surroundings and ecology.' },
    { lemma: '에너지', pos: 'noun', translations: ['energy'], level: 'A2', definition: 'Power or vitality.' },
    { lemma: '사회', pos: 'noun', translations: ['society'], level: 'B1', definition: 'Organized human community.' },
    { lemma: '미래', pos: 'noun', translations: ['future'], level: 'A2', definition: 'Coming time.' },

    // Adjectives (Descriptive verbs ending in -다)
    { lemma: '좋다', pos: 'adj', translations: ['good', 'nice'], irregularForms: ['좋고', '좋아서', '좋았다', '좋아요'], level: 'A1', definition: 'Favorable or pleasant.' },
    { lemma: '크다', pos: 'adj', translations: ['big', 'large'], irregularForms: ['크고', '커서', '컸다', '커요'], level: 'A1', definition: 'Of considerable size.' },
    { lemma: '작다', pos: 'adj', translations: ['small', 'little'], irregularForms: ['작고', '작아서', '작았다', '작아요'], level: 'A1', definition: 'Of minor size.' },
    { lemma: '새롭다', pos: 'adj', translations: ['new'], irregularForms: ['새롭고', '새로워서', '새로웠다', '새로워요'], level: 'A1', definition: 'Recently created.' },
    { lemma: '중요하다', pos: 'adj', translations: ['important'], irregularForms: ['중요하고', '중요해서', '중요해요'], level: 'A1', definition: 'Of great significance.' },
    { lemma: '신선하다', pos: 'adj', translations: ['fresh'], irregularForms: ['신선하고', '신선해서', '신선해요'], level: 'A2', definition: 'Clean, crisp, or recently harvested.' },
    { lemma: '지속가능하다', pos: 'adj', translations: ['sustainable'], irregularForms: ['지속가능한'], level: 'B1', definition: 'Ecologically sustainable.' }
  ]
};

export default koreanLexicon;
