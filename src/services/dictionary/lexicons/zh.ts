import { LexiconModule } from '../types';

/**
 * Chinese (中文) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / CC-CEDICT & Wiktionary contributors.
 * Supports character compounds, canonical base lemmas, and educational translations.
 */
export const chineseLexicon: LexiconModule = {
  languageCode: 'zh',
  languageName: 'Chinese (Simplified)',
  license: 'CC BY-SA 4.0 / CC-CEDICT Open Data',
  attribution: 'Derived from CC-CEDICT & Wiktionary open linguistic resources under CC BY-SA 4.0',
  entries: [
    // Verbs
    { lemma: '是', pos: 'verb', translations: ['to be'], level: 'A1', definition: 'Express identity or equivalence.' },
    { lemma: '有', pos: 'verb', translations: ['to have', 'there is'], level: 'A1', definition: 'Possess or exist.' },
    { lemma: '看', pos: 'verb', translations: ['to see', 'to look', 'to read'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: '吃', pos: 'verb', translations: ['to eat'], level: 'A1', definition: 'Ingest food.' },
    { lemma: '喝', pos: 'verb', translations: ['to drink'], level: 'A1', definition: 'Ingest liquids.' },
    { lemma: '去', pos: 'verb', translations: ['to go'], level: 'A1', definition: 'Move towards destination.' },
    { lemma: '来', pos: 'verb', translations: ['to come'], level: 'A1', definition: 'Move towards speaker.' },
    { lemma: '说', pos: 'verb', translations: ['to speak', 'to say'], level: 'A1', definition: 'Communicate verbally.' },
    { lemma: '听', pos: 'verb', translations: ['to listen', 'to hear'], level: 'A1', definition: 'Perceive acoustically.' },
    { lemma: '读', pos: 'verb', translations: ['to read'], level: 'A1', definition: 'Read aloud or comprehend text.' },
    { lemma: '写', pos: 'verb', translations: ['to write'], level: 'A1', definition: 'Inscribe characters.' },
    { lemma: '做', pos: 'verb', translations: ['to do', 'to make'], level: 'A1', definition: 'Perform an action or manufacture.' },
    { lemma: '买', pos: 'verb', translations: ['to buy'], level: 'A1', definition: 'Purchase merchandise.' },
    { lemma: '卖', pos: 'verb', translations: ['to sell'], level: 'A1', definition: 'Trade goods for money.' },
    { lemma: '学习', pos: 'verb', translations: ['to study', 'to learn'], level: 'A1', definition: 'Acquire knowledge.' },
    { lemma: '工作', pos: 'verb', translations: ['to work'], level: 'A1', definition: 'Perform employment.' },
    { lemma: '生活', pos: 'verb', translations: ['to live', 'life'], level: 'A1', definition: 'Reside or conduct life.' },
    { lemma: '发展', pos: 'verb', translations: ['to develop', 'development'], level: 'B1', definition: 'Expand or innovate.' },
    { lemma: '保护', pos: 'verb', translations: ['to protect'], level: 'B1', definition: 'Guard or preserve.' },
    { lemma: '提高', pos: 'verb', translations: ['to improve', 'to raise'], level: 'A2', definition: 'Elevate quality or standard.' },

    // Nouns
    { lemma: '健康', pos: 'noun', translations: ['health'], level: 'A2', definition: 'Physical and mental well-being.' },
    { lemma: '饮食', pos: 'noun', translations: ['diet', 'food and drink'], level: 'A2', definition: 'Daily nutrition.' },
    { lemma: '运动', pos: 'noun', translations: ['exercise', 'sports'], level: 'A1', definition: 'Physical bodily activity.' },
    { lemma: '睡眠', pos: 'noun', translations: ['sleep'], level: 'A2', definition: 'Natural state of bodily rest.' },
    { lemma: '水', pos: 'noun', translations: ['water'], level: 'A1', definition: 'Clear potable liquid.' },
    { lemma: '人', pos: 'noun', translations: ['person', 'people'], level: 'A1', definition: 'Human being.' },
    { lemma: '时间', pos: 'noun', translations: ['time'], level: 'A1', definition: 'Continuous progression of events.' },
    { lemma: '年', pos: 'noun', translations: ['year'], level: 'A1', definition: 'Twelve months.' },
    { lemma: '天', pos: 'noun', translations: ['day', 'sky'], level: 'A1', definition: 'Daylight or twenty-four hours.' },
    { lemma: '朋友', pos: 'noun', translations: ['friend'], level: 'A1', definition: 'Close companion.' },
    { lemma: '家庭', pos: 'noun', translations: ['family'], level: 'A1', definition: 'Domestic household.' },
    { lemma: '城市', pos: 'noun', translations: ['city'], level: 'A1', definition: 'Urban municipality.' },
    { lemma: '国家', pos: 'noun', translations: ['country', 'nation'], level: 'A1', definition: 'Sovereign nation.' },
    { lemma: '自然', pos: 'noun', translations: ['nature'], level: 'A2', definition: 'Physical world.' },
    { lemma: '环境', pos: 'noun', translations: ['environment'], level: 'B1', definition: 'Surrounding ecosystem.' },
    { lemma: '科技', pos: 'noun', translations: ['science and technology'], level: 'B1', definition: 'Scientific and technological fields.' },
    { lemma: '社会', pos: 'noun', translations: ['society'], level: 'B1', definition: 'Organized human community.' },
    { lemma: '未来', pos: 'noun', translations: ['future'], level: 'A2', definition: 'Coming time.' },

    // Adjectives
    { lemma: '好', pos: 'adj', translations: ['good'], level: 'A1', definition: 'Pleasing or beneficial.' },
    { lemma: '大', pos: 'adj', translations: ['big', 'large'], level: 'A1', definition: 'Of considerable magnitude.' },
    { lemma: '小', pos: 'adj', translations: ['small', 'little'], level: 'A1', definition: 'Of minor size.' },
    { lemma: '新', pos: 'adj', translations: ['new'], level: 'A1', definition: 'Recently created.' },
    { lemma: '老', pos: 'adj', translations: ['old'], level: 'A1', definition: 'Advanced in age.' },
    { lemma: '重要', pos: 'adj', translations: ['important'], level: 'A1', definition: 'Having great significance.' },
    { lemma: '新鲜', pos: 'adj', translations: ['fresh'], level: 'A2', definition: 'Clean, recent, or crisp.' },
    { lemma: '可持续', pos: 'adj', translations: ['sustainable'], level: 'B1', definition: 'Ecologically viable.' }
  ]
};

export default chineseLexicon;
