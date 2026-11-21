import { LexiconModule } from '../types';

/**
 * Italian (Italiano) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / Wiktionary & FreeDict contributors.
 */
export const italianLexicon: LexiconModule = {
  languageCode: 'it',
  languageName: 'Italian',
  license: 'CC BY-SA 4.0 / Open Data',
  attribution: 'Derived from Wiktionary & FreeDict open linguistic resources under CC BY-SA 4.0',
  entries: [
    // Verbs
    { lemma: 'essere', pos: 'verb', translations: ['to be'], irregularForms: ['sono', 'sei', 'è', 'siamo', 'siete', 'stato', 'ero', 'fu'], level: 'A1', definition: 'Exist or represent identity/state.' },
    { lemma: 'avere', pos: 'verb', translations: ['to have'], irregularForms: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno', 'avuto', 'aveva'], level: 'A1', definition: 'Possess or auxiliary verb.' },
    { lemma: 'fare', pos: 'verb', translations: ['to do', 'to make'], irregularForms: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno', 'fatto', 'faceva', 'farà'], level: 'A1', definition: 'Perform an action or produce.' },
    { lemma: 'dire', pos: 'verb', translations: ['to say', 'to tell'], irregularForms: ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono', 'detto', 'diceva'], level: 'A1', definition: 'Communicate verbally.' },
    { lemma: 'potere', pos: 'verb', translations: ['can', 'to be able to'], irregularForms: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono', 'potuto'], level: 'A1', definition: 'Have ability or possibility.' },
    { lemma: 'volere', pos: 'verb', translations: ['to want'], irregularForms: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono', 'voluto'], level: 'A1', definition: 'Desire or intend.' },
    { lemma: 'sapere', pos: 'verb', translations: ['to know (facts/skills)'], irregularForms: ['so', 'sai', 'sa', 'sappiamo', 'sapete', 'sanno', 'saputo'], level: 'A1', definition: 'Possess factual knowledge or know-how.' },
    { lemma: 'stare', pos: 'verb', translations: ['to stay', 'to be (health/location)'], irregularForms: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno', 'stato'], level: 'A1', definition: 'Remain in place or express ongoing state.' },
    { lemma: 'dovere', pos: 'verb', translations: ['must', 'should', 'to owe'], irregularForms: ['devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono', 'dovuto'], level: 'A1', definition: 'Be obligated to.' },
    { lemma: 'vedere', pos: 'verb', translations: ['to see'], irregularForms: ['vedo', 'vedi', 'vede', 'vediamo', 'vedete', 'vedono', 'visto'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: 'andare', pos: 'verb', translations: ['to go'], irregularForms: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno', 'andato'], level: 'A1', definition: 'Move from one place to another.' },
    { lemma: 'venire', pos: 'verb', translations: ['to come'], irregularForms: ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono', 'venuto'], level: 'A1', definition: 'Move towards destination or speaker.' },
    { lemma: 'dare', pos: 'verb', translations: ['to give'], irregularForms: ['do', 'dai', 'dà', 'diamo', 'date', 'danno', 'dato'], level: 'A1', definition: 'Bestow or provide.' },
    { lemma: 'parlare', pos: 'verb', translations: ['to speak', 'to talk'], level: 'A1', definition: 'Express thoughts aloud.' },
    { lemma: 'mangiare', pos: 'verb', translations: ['to eat'], level: 'A1', definition: 'Consume nourishment.' },
    { lemma: 'bere', pos: 'verb', translations: ['to drink'], irregularForms: ['bevo', 'bevi', 'beve', 'bevuto'], level: 'A1', definition: 'Ingest liquids.' },
    { lemma: 'vivere', pos: 'verb', translations: ['to live'], irregularForms: ['vivo', 'vivi', 'vive', 'vissuto'], level: 'A1', definition: 'Be alive or inhabit a dwelling.' },
    { lemma: 'sviluppare', pos: 'verb', translations: ['to develop'], level: 'B1', definition: 'Evolve or elaborate.' },
    { lemma: 'proteggere', pos: 'verb', translations: ['to protect'], irregularForms: ['proteggo', 'protegge', 'protetto'], level: 'B1', definition: 'Guard or shield.' },

    // Nouns
    { lemma: 'casa', pos: 'noun', gender: 'f', translations: ['house', 'home'], irregularForms: ['case'], level: 'A1', definition: 'Dwelling place.' },
    { lemma: 'tempo', pos: 'noun', gender: 'm', translations: ['time', 'weather'], irregularForms: ['tempi'], level: 'A1', definition: 'Duration or meteorological weather.' },
    { lemma: 'anno', pos: 'noun', gender: 'm', translations: ['year'], irregularForms: ['anni'], level: 'A1', definition: 'Twelve months.' },
    { lemma: 'giorno', pos: 'noun', gender: 'm', translations: ['day'], irregularForms: ['giorni'], level: 'A1', definition: '24-hour cycle.' },
    { lemma: 'uomo', pos: 'noun', gender: 'm', translations: ['man'], irregularForms: ['uomini'], level: 'A1', definition: 'Adult human male.' },
    { lemma: 'donna', pos: 'noun', gender: 'f', translations: ['woman'], irregularForms: ['donne'], level: 'A1', definition: 'Adult human female.' },
    { lemma: 'bambino', pos: 'noun', gender: 'm', translations: ['child', 'boy'], irregularForms: ['bambini', 'bambina', 'bambine'], level: 'A1', definition: 'Young child.' },
    { lemma: 'città', pos: 'noun', gender: 'f', translations: ['city'], level: 'A1', definition: 'Urban municipality.' },
    { lemma: 'paese', pos: 'noun', gender: 'm', translations: ['country', 'village'], irregularForms: ['paesi'], level: 'A1', definition: 'Nation or rural locality.' },
    { lemma: 'acqua', pos: 'noun', gender: 'f', translations: ['water'], level: 'A1', definition: 'Essential drinkable liquid.' },
    { lemma: 'salute', pos: 'noun', gender: 'f', translations: ['health'], level: 'A2', definition: 'State of wellness.' },
    { lemma: 'cibo', pos: 'noun', gender: 'm', translations: ['food'], level: 'A1', definition: 'Edible substance.' },
    { lemma: 'ambiente', pos: 'noun', gender: 'm', translations: ['environment'], irregularForms: ['ambienti'], level: 'B1', definition: 'Natural surroundings and ecology.' },
    { lemma: 'natura', pos: 'noun', gender: 'f', translations: ['nature'], level: 'A1', definition: 'Physical world.' },
    { lemma: 'energia', pos: 'noun', gender: 'f', translations: ['energy'], level: 'A2', definition: 'Vitality or power.' },

    // Adjectives
    { lemma: 'buono', pos: 'adj', translations: ['good'], irregularForms: ['buona', 'buoni', 'buone', 'migliore', 'migliori'], level: 'A1', definition: 'High quality or kind.' },
    { lemma: 'grande', pos: 'adj', translations: ['large', 'great'], irregularForms: ['grandi', 'maggiore', 'maggiori'], level: 'A1', definition: 'Big in size.' },
    { lemma: 'piccolo', pos: 'adj', translations: ['small', 'little'], irregularForms: ['piccola', 'piccoli', 'piccole'], level: 'A1', definition: 'Modest in dimensions.' },
    { lemma: 'nuovo', pos: 'adj', translations: ['new'], irregularForms: ['nuova', 'nuovi', 'nuove'], level: 'A1', definition: 'Recently made.' },
    { lemma: 'vecchio', pos: 'adj', translations: ['old'], irregularForms: ['vecchia', 'vecchi', 'vecchie'], level: 'A1', definition: 'Advanced in age.' },
    { lemma: 'importante', pos: 'adj', translations: ['important'], irregularForms: ['importanti'], level: 'A1', definition: 'Significant.' },
    { lemma: 'sano', pos: 'adj', translations: ['healthy'], irregularForms: ['sana', 'sani', 'sane'], level: 'A2', definition: 'In good physical shape.' },
    { lemma: 'sostenibile', pos: 'adj', translations: ['sustainable'], irregularForms: ['sostenibili'], level: 'B1', definition: 'Ecologically viable.' },
    { lemma: 'fresco', pos: 'adj', translations: ['fresh'], irregularForms: ['fresca', 'freschi', 'fresche'], level: 'A1', definition: 'Recently harvested.' }
  ]
};

export default italianLexicon;
