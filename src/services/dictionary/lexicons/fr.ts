import { LexiconModule } from '../types';

/**
 * French (Français) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / Wiktionary & FreeDict contributors.
 */
export const frenchLexicon: LexiconModule = {
  languageCode: 'fr',
  languageName: 'French',
  license: 'CC BY-SA 4.0 / Open Data',
  attribution: 'Derived from Wiktionary & FreeDict open linguistic resources under CC BY-SA 4.0',
  entries: [
    // Verbs
    { lemma: 'être', pos: 'verb', translations: ['to be'], irregularForms: ['suis', 'es', 'est', 'sommes', 'êtes', 'sont', 'été', 'étais', 'fut'], level: 'A1', definition: 'Exist or represent a condition.' },
    { lemma: 'avoir', pos: 'verb', translations: ['to have'], irregularForms: ['ai', 'as', 'a', 'avons', 'avez', 'ont', 'eu', 'avais', 'aura'], level: 'A1', definition: 'Possess or auxiliary verb.' },
    { lemma: 'faire', pos: 'verb', translations: ['to do', 'to make'], irregularForms: ['fais', 'fait', 'faisons', 'faites', 'font', 'faisais', 'fera'], level: 'A1', definition: 'Perform an action or construct.' },
    { lemma: 'dire', pos: 'verb', translations: ['to say', 'to tell'], irregularForms: ['dis', 'dit', 'disons', 'dites', 'disent', 'dira'], level: 'A1', definition: 'Express verbally.' },
    { lemma: 'aller', pos: 'verb', translations: ['to go'], irregularForms: ['vais', 'vas', 'va', 'allons', 'allez', 'vont', 'allé', 'ira'], level: 'A1', definition: 'Move towards a place.' },
    { lemma: 'voir', pos: 'verb', translations: ['to see'], irregularForms: ['vois', 'voit', 'voyons', 'voyez', 'voient', 'vu', 'verra'], level: 'A1', definition: 'Perceive by sight.' },
    { lemma: 'savoir', pos: 'verb', translations: ['to know (facts/how to)'], irregularForms: ['sais', 'sait', 'savons', 'savez', 'savent', 'su', 'saura'], level: 'A1', definition: 'Possess knowledge of facts or skills.' },
    { lemma: 'pouvoir', pos: 'verb', translations: ['can', 'to be able to'], irregularForms: ['peux', 'peut', 'pouvons', 'pouvez', 'peuvent', 'pu', 'pourra'], level: 'A1', definition: 'Be able or capable.' },
    { lemma: 'vouloir', pos: 'verb', translations: ['to want'], irregularForms: ['veux', 'veut', 'voulons', 'voulez', 'veulent', 'voulu', 'voudra'], level: 'A1', definition: 'Wish or desire.' },
    { lemma: 'devoir', pos: 'verb', translations: ['must', 'should', 'to owe'], irregularForms: ['dois', 'doit', 'devons', 'devez', 'doivent', 'dû', 'devra'], level: 'A1', definition: 'Be obligated to.' },
    { lemma: 'venir', pos: 'verb', translations: ['to come'], irregularForms: ['viens', 'vient', 'venons', 'venez', 'viennent', 'venu', 'viendra'], level: 'A1', definition: 'Move towards the speaker.' },
    { lemma: 'prendre', pos: 'verb', translations: ['to take'], irregularForms: ['prends', 'prend', 'prenons', 'prenez', 'prennent', 'pris', 'prendra'], level: 'A1', definition: 'Lay hold of or consume.' },
    { lemma: 'parler', pos: 'verb', translations: ['to speak', 'to talk'], level: 'A1', definition: 'Converse verbally.' },
    { lemma: 'manger', pos: 'verb', translations: ['to eat'], irregularForms: ['mange', 'mangeons', 'mangé', 'mangeait'], level: 'A1', definition: 'Consume food.' },
    { lemma: 'boire', pos: 'verb', translations: ['to drink'], irregularForms: ['bois', 'boit', 'buvons', 'buvez', 'boivent', 'bu'], level: 'A1', definition: 'Ingest liquids.' },
    { lemma: 'dormir', pos: 'verb', translations: ['to sleep'], irregularForms: ['dors', 'dort', 'dormons', 'dormez', 'dorment', 'dormi'], level: 'A1', definition: 'Rest in sleep.' },
    { lemma: 'vivre', pos: 'verb', translations: ['to live'], irregularForms: ['vis', 'vit', 'vivons', 'vivez', 'vivent', 'vécu'], level: 'A1', definition: 'Be alive or reside.' },
    { lemma: 'développer', pos: 'verb', translations: ['to develop'], level: 'B1', definition: 'Expand or innovate.' },
    { lemma: 'protéger', pos: 'verb', translations: ['to protect'], irregularForms: ['protège', 'protégeons', 'protégé'], level: 'B1', definition: 'Keep safe.' },

    // Nouns
    { lemma: 'maison', pos: 'noun', gender: 'f', translations: ['house', 'home'], irregularForms: ['maisons'], level: 'A1', definition: 'Residential building.' },
    { lemma: 'temps', pos: 'noun', gender: 'm', translations: ['time', 'weather'], level: 'A1', definition: 'Duration or atmospheric condition.' },
    { lemma: 'année', pos: 'noun', gender: 'f', translations: ['year'], irregularForms: ['années'], level: 'A1', definition: 'Twelve-month cycle.' },
    { lemma: 'jour', pos: 'noun', gender: 'm', translations: ['day'], irregularForms: ['jours'], level: 'A1', definition: 'Daylight or 24-hour cycle.' },
    { lemma: 'homme', pos: 'noun', gender: 'm', translations: ['man'], irregularForms: ['hommes'], level: 'A1', definition: 'Adult human male.' },
    { lemma: 'femme', pos: 'noun', gender: 'f', translations: ['woman', 'wife'], irregularForms: ['femmes'], level: 'A1', definition: 'Adult human female.' },
    { lemma: 'enfant', pos: 'noun', gender: 'm', translations: ['child'], irregularForms: ['enfants'], level: 'A1', definition: 'Young person.' },
    { lemma: 'ville', pos: 'noun', gender: 'f', translations: ['city', 'town'], irregularForms: ['villes'], level: 'A1', definition: 'Urban municipality.' },
    { lemma: 'pays', pos: 'noun', gender: 'm', translations: ['country', 'land'], level: 'A1', definition: 'National territory.' },
    { lemma: 'eau', pos: 'noun', gender: 'f', translations: ['water'], irregularForms: ['eaux'], level: 'A1', definition: 'Life-sustaining liquid.' },
    { lemma: 'santé', pos: 'noun', gender: 'f', translations: ['health'], level: 'A2', definition: 'State of well-being.' },
    { lemma: 'sommeil', pos: 'noun', gender: 'm', translations: ['sleep'], level: 'A2', definition: 'State of rest.' },
    { lemma: 'nourriture', pos: 'noun', gender: 'f', translations: ['food', 'nourishment'], level: 'A2', definition: 'Nutritive substance.' },
    { lemma: 'environnement', pos: 'noun', gender: 'm', translations: ['environment'], level: 'B1', definition: 'Natural world and ecology.' },
    { lemma: 'nature', pos: 'noun', gender: 'f', translations: ['nature'], level: 'A1', definition: 'Physical world.' },
    { lemma: 'énergie', pos: 'noun', gender: 'f', translations: ['energy'], level: 'A2', definition: 'Power or capacity for work.' },

    // Adjectives
    { lemma: 'bon', pos: 'adj', translations: ['good'], irregularForms: ['bonne', 'bons', 'bonnes', 'meilleur', 'meilleurs'], level: 'A1', definition: 'Favorable or pleasant.' },
    { lemma: 'grand', pos: 'adj', translations: ['big', 'tall', 'great'], irregularForms: ['grande', 'grands', 'grandes'], level: 'A1', definition: 'Of large size or stature.' },
    { lemma: 'petit', pos: 'adj', translations: ['small', 'little'], irregularForms: ['petite', 'petits', 'petites'], level: 'A1', definition: 'Of minor size.' },
    { lemma: 'nouveau', pos: 'adj', translations: ['new'], irregularForms: ['nouvel', 'nouvelle', 'nouveaux', 'nouvelles'], level: 'A1', definition: 'Recently appeared or produced.' },
    { lemma: 'vieux', pos: 'adj', translations: ['old'], irregularForms: ['vieil', 'vieille', 'vieilles'], level: 'A1', definition: 'Advanced in age.' },
    { lemma: 'important', pos: 'adj', translations: ['important'], irregularForms: ['importante', 'importants', 'importantes'], level: 'A1', definition: 'Significant.' },
    { lemma: 'sain', pos: 'adj', translations: ['healthy', 'sound'], irregularForms: ['saine', 'sains', 'saines'], level: 'A2', definition: 'Conducive to good health.' },
    { lemma: 'durable', pos: 'adj', translations: ['sustainable', 'durable'], irregularForms: ['durables'], level: 'B1', definition: 'Able to endure ecologically.' },
    { lemma: 'frais', pos: 'adj', translations: ['fresh', 'cool'], irregularForms: ['fraîche', 'fraîches'], level: 'A1', definition: 'Recent, crisp, or cool.' }
  ]
};

export default frenchLexicon;
