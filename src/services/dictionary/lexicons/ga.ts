import { LexiconModule } from '../types';

/**
 * Irish (Gaeilge) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / Teanglann & Wiktionary contributors.
 * Supports canonical base lemmas, initial mutations (séimhiú / urú), and translations.
 */
export const irishLexicon: LexiconModule = {
  languageCode: 'ga',
  languageName: 'Irish',
  license: 'CC BY-SA 4.0 / Open Data',
  attribution: 'Derived from Teanglann & Wiktionary open linguistic resources under CC BY-SA 4.0',
  entries: [
    // Verbs
    { lemma: 'bí', pos: 'verb', translations: ['to be'], irregularForms: ['tá', 'bhí', 'beidh', 'raibh', 'bheadh'], level: 'A1', definition: 'Exist or represent state.' },
    { lemma: 'déan', pos: 'verb', translations: ['to do', 'to make'], irregularForms: ['déanann', 'rinne', 'déanfaidh', 'déanta'], level: 'A1', definition: 'Perform an action or construct.' },
    { lemma: 'téigh', pos: 'verb', translations: ['to go'], irregularForms: ['téann', 'chuaigh', 'rachaidh', 'dulta'], level: 'A1', definition: 'Move towards destination.' },
    { lemma: 'tar', pos: 'verb', translations: ['to come'], irregularForms: ['tagann', 'tháinig', 'tiocfaidh', 'tagtha'], level: 'A1', definition: 'Move towards speaker.' },
    { lemma: 'feic', pos: 'verb', translations: ['to see'], irregularForms: ['feiceann', 'chonaic', 'feicfidh', 'feicthe'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: 'clois', pos: 'verb', translations: ['to hear'], irregularForms: ['cloiseann', 'chuala', 'cloisfidh', 'cloiste'], level: 'A1', definition: 'Perceive sound.' },
    { lemma: 'abair', pos: 'verb', translations: ['to say'], irregularForms: ['deir', 'dúirt', 'déarfaidh', 'ráite'], level: 'A1', definition: 'Communicate verbally.' },
    { lemma: 'faigh', pos: 'verb', translations: ['to get', 'to find'], irregularForms: ['faigheann', 'fuair', 'gheobhaidh', 'faighte'], level: 'A1', definition: 'Acquire or discover.' },
    { lemma: 'ith', pos: 'verb', translations: ['to eat'], irregularForms: ['itheann', 'd\'ith', 'íosfaidh', 'ite'], level: 'A1', definition: 'Consume nourishment.' },
    { lemma: 'ól', pos: 'verb', translations: ['to drink'], irregularForms: ['ólann', 'd\'ól', 'ólfaidh', 'ólta'], level: 'A1', definition: 'Ingest liquids.' },
    { lemma: 'léigh', pos: 'verb', translations: ['to read'], irregularForms: ['léann', 'léigh', 'léifidh', 'léite'], level: 'A1', definition: 'Comprehend written words.' },
    { lemma: 'scríobh', pos: 'verb', translations: ['to write'], irregularForms: ['scríobhann', 'scríobh', 'scríobhfaidh', 'scríofa'], level: 'A1', definition: 'Inscribe characters.' },
    { lemma: 'foghlaim', pos: 'verb', translations: ['to learn'], irregularForms: ['foghlaimíonn', 'd\'fhoghlaim', 'foghlamtha'], level: 'A1', definition: 'Acquire knowledge.' },
    { lemma: 'oibrigh', pos: 'verb', translations: ['to work'], irregularForms: ['oibríonn', 'd\'oibrigh', 'oibrithe'], level: 'A1', definition: 'Perform labor.' },
    { lemma: 'cónaigh', pos: 'verb', translations: ['to reside', 'to live'], irregularForms: ['cónaíonn', 'chónaigh'], level: 'A1', definition: 'Inhabit a home.' },
    { lemma: 'cosain', pos: 'verb', translations: ['to protect', 'to defend'], irregularForms: ['cosnaíonn', 'chosain', 'cosanta'], level: 'B1', definition: 'Guard against danger.' },

    // Nouns
    { lemma: 'teach', pos: 'noun', gender: 'm', translations: ['house', 'home'], irregularForms: ['tithe', 'tí'], level: 'A1', definition: 'Residential building.' },
    { lemma: 'am', pos: 'noun', gender: 'm', translations: ['time'], level: 'A1', definition: 'Continuous progress of events.' },
    { lemma: 'bliain', pos: 'noun', gender: 'f', translations: ['year'], irregularForms: ['blianta', 'bliana'], level: 'A1', definition: 'Twelve months.' },
    { lemma: 'lá', pos: 'noun', gender: 'm', translations: ['day'], irregularForms: ['laethanta'], level: 'A1', definition: 'Daylight or twenty-four hours.' },
    { lemma: 'fear', pos: 'noun', gender: 'm', translations: ['man'], irregularForms: ['fir'], level: 'A1', definition: 'Adult human male.' },
    { lemma: 'bean', pos: 'noun', gender: 'f', translations: ['woman', 'wife'], irregularForms: ['mná'], level: 'A1', definition: 'Adult human female.' },
    { lemma: 'páiste', pos: 'noun', gender: 'm', translations: ['child'], irregularForms: ['páistí'], level: 'A1', definition: 'Young person.' },
    { lemma: 'cathair', pos: 'noun', gender: 'f', translations: ['city'], irregularForms: ['cathracha', 'cathrach'], level: 'A1', definition: 'Urban municipality.' },
    { lemma: 'tír', pos: 'noun', gender: 'f', translations: ['country', 'land'], irregularForms: ['tíortha'], level: 'A1', definition: 'Sovereign nation.' },
    { lemma: 'uisce', pos: 'noun', gender: 'm', translations: ['water'], level: 'A1', definition: 'Potable liquid.' },
    { lemma: 'sláinte', pos: 'noun', gender: 'f', translations: ['health'], level: 'A2', definition: 'State of wellness.' },
    { lemma: 'bia', pos: 'noun', gender: 'm', translations: ['food'], level: 'A1', definition: 'Nutritive sustenance.' },
    { lemma: 'timpeallacht', pos: 'noun', gender: 'f', translations: ['environment'], level: 'B1', definition: 'Natural surroundings and ecology.' },
    { lemma: 'nádúr', pos: 'noun', gender: 'm', translations: ['nature'], level: 'A1', definition: 'Physical world.' },
    { lemma: 'fuinneamh', pos: 'noun', gender: 'm', translations: ['energy'], level: 'A2', definition: 'Power and vigor.' },
    { lemma: 'pobal', pos: 'noun', gender: 'm', translations: ['community', 'public'], level: 'A2', definition: 'Body of people.' },

    // Adjectives
    { lemma: 'maith', pos: 'adj', translations: ['good'], irregularForms: ['fearr'], level: 'A1', definition: 'Pleasing or skilled.' },
    { lemma: 'mór', pos: 'adj', translations: ['big', 'large'], irregularForms: ['móra', 'mó'], level: 'A1', definition: 'Of considerable size.' },
    { lemma: 'beag', pos: 'adj', translations: ['small', 'little'], irregularForms: ['beaga', 'lú'], level: 'A1', definition: 'Of minor size.' },
    { lemma: 'nua', pos: 'adj', translations: ['new'], level: 'A1', definition: 'Recently created.' },
    { lemma: 'sean', pos: 'adj', translations: ['old'], irregularForms: ['seana'], level: 'A1', definition: 'Advanced in age.' },
    { lemma: 'tábhachtach', pos: 'adj', translations: ['important'], irregularForms: ['tábhachtaí'], level: 'A1', definition: 'Significant.' },
    { lemma: 'sláintiúil', pos: 'adj', translations: ['healthy'], level: 'A2', definition: 'Beneficial to health.' },
    { lemma: 'inbhuanaithe', pos: 'adj', translations: ['sustainable'], level: 'B1', definition: 'Ecologically sustainable.' },
    { lemma: 'úr', pos: 'adj', translations: ['fresh'], level: 'A1', definition: 'Clean and newly harvested.' }
  ]
};

export default irishLexicon;
