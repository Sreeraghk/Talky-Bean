import { LexiconModule } from '../types';

/**
 * Portuguese (Português) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / Wiktionary & FreeDict contributors.
 */
export const portugueseLexicon: LexiconModule = {
  languageCode: 'pt',
  languageName: 'Portuguese',
  license: 'CC BY-SA 4.0 / Open Data',
  attribution: 'Derived from Wiktionary & FreeDict open linguistic resources under CC BY-SA 4.0',
  entries: [
    // Verbs
    { lemma: 'ser', pos: 'verb', translations: ['to be (essential)'], irregularForms: ['sou', 'és', 'é', 'somos', 'são', 'fui', 'foi', 'era', 'sido'], level: 'A1', definition: 'To be inherently or permanently.' },
    { lemma: 'estar', pos: 'verb', translations: ['to be (state/location)'], irregularForms: ['estou', 'estás', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estado'], level: 'A1', definition: 'To exist in a condition or place.' },
    { lemma: 'ter', pos: 'verb', translations: ['to have', 'to possess'], irregularForms: ['tenho', 'tens', 'tem', 'temos', 'têm', 'tive', 'teve', 'tido'], level: 'A1', definition: 'Possess or experience.' },
    { lemma: 'haver', pos: 'verb', translations: ['there to be', 'to have'], irregularForms: ['há', 'houve', 'havia', 'havido'], level: 'A1', definition: 'Existential verb (há).' },
    { lemma: 'fazer', pos: 'verb', translations: ['to do', 'to make'], irregularForms: ['faço', 'fazes', 'faz', 'fazemos', 'fazem', 'fiz', 'fez', 'feito'], level: 'A1', definition: 'Perform an action or construct.' },
    { lemma: 'ir', pos: 'verb', translations: ['to go'], irregularForms: ['vou', 'vais', 'vai', 'vamos', 'vão', 'fui', 'foi', 'ia', 'ido'], level: 'A1', definition: 'Move towards a place.' },
    { lemma: 'poder', pos: 'verb', translations: ['can', 'to be able to'], irregularForms: ['posso', 'podes', 'pode', 'podemos', 'podem', 'pude', 'pôde', 'podido'], level: 'A1', definition: 'Have capability or permission.' },
    { lemma: 'saber', pos: 'verb', translations: ['to know (facts/how to)'], irregularForms: ['sei', 'sabes', 'sabe', 'sabemos', 'sabem', 'soube', 'sabido'], level: 'A1', definition: 'Possess knowledge or skill.' },
    { lemma: 'dizer', pos: 'verb', translations: ['to say', 'to tell'], irregularForms: ['digo', 'dizes', 'diz', 'dizemos', 'dizem', 'disse', 'dito'], level: 'A1', definition: 'Communicate verbally.' },
    { lemma: 'ver', pos: 'verb', translations: ['to see'], irregularForms: ['vejo', 'vês', 'vê', 'vemos', 'vêem', 'vi', 'viu', 'visto'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: 'dar', pos: 'verb', translations: ['to give'], irregularForms: ['dou', 'dás', 'dá', 'damos', 'dão', 'dei', 'deu', 'dado'], level: 'A1', definition: 'Bestow or impart.' },
    { lemma: 'querer', pos: 'verb', translations: ['to want', 'to love'], irregularForms: ['quero', 'queres', 'quer', 'quis', 'quisemos', 'querido'], level: 'A1', definition: 'Desire or intend.' },
    { lemma: 'chegar', pos: 'verb', translations: ['to arrive'], irregularForms: ['chego', 'chega', 'chegou', 'chegado'], level: 'A1', definition: 'Reach a destination.' },
    { lemma: 'falar', pos: 'verb', translations: ['to speak', 'to talk'], level: 'A1', definition: 'Utter spoken words.' },
    { lemma: 'comer', pos: 'verb', translations: ['to eat'], irregularForms: ['como', 'come', 'comeu', 'comido'], level: 'A1', definition: 'Consume nourishment.' },
    { lemma: 'beber', pos: 'verb', translations: ['to drink'], irregularForms: ['bebo', 'bebe', 'bebeu', 'bebido'], level: 'A1', definition: 'Ingest liquid.' },
    { lemma: 'viver', pos: 'verb', translations: ['to live'], level: 'A1', definition: 'Be alive or reside.' },
    { lemma: 'desenvolver', pos: 'verb', translations: ['to develop'], level: 'B1', definition: 'Grow or expand.' },
    { lemma: 'proteger', pos: 'verb', translations: ['to protect'], irregularForms: ['protejo', 'protege', 'protegido'], level: 'B1', definition: 'Guard or shield.' },

    // Nouns
    { lemma: 'casa', pos: 'noun', gender: 'f', translations: ['house', 'home'], irregularForms: ['casas'], level: 'A1', definition: 'Residential building.' },
    { lemma: 'tempo', pos: 'noun', gender: 'm', translations: ['time', 'weather'], level: 'A1', definition: 'Duration or climate.' },
    { lemma: 'ano', pos: 'noun', gender: 'm', translations: ['year'], irregularForms: ['anos'], level: 'A1', definition: 'Twelve months.' },
    { lemma: 'dia', pos: 'noun', gender: 'm', translations: ['day'], irregularForms: ['dias'], level: 'A1', definition: 'Twenty-four hours.' },
    { lemma: 'homem', pos: 'noun', gender: 'm', translations: ['man'], irregularForms: ['homens'], level: 'A1', definition: 'Adult human male.' },
    { lemma: 'mulher', pos: 'noun', gender: 'f', translations: ['woman'], irregularForms: ['mulheres'], level: 'A1', definition: 'Adult human female.' },
    { lemma: 'criança', pos: 'noun', gender: 'f', translations: ['child'], irregularForms: ['crianças'], level: 'A1', definition: 'Young person.' },
    { lemma: 'cidade', pos: 'noun', gender: 'f', translations: ['city'], irregularForms: ['cidades'], level: 'A1', definition: 'Urban municipality.' },
    { lemma: 'país', pos: 'noun', gender: 'm', translations: ['country'], irregularForms: ['países'], level: 'A1', definition: 'Nation or territory.' },
    { lemma: 'água', pos: 'noun', gender: 'f', translations: ['water'], level: 'A1', definition: 'Essential liquid.' },
    { lemma: 'saúde', pos: 'noun', gender: 'f', translations: ['health'], level: 'A2', definition: 'State of wellness.' },
    { lemma: 'comida', pos: 'noun', gender: 'f', translations: ['food'], level: 'A1', definition: 'Nourishing substance.' },
    { lemma: 'ambiente', pos: 'noun', gender: 'm', translations: ['environment'], irregularForms: ['ambientes'], level: 'B1', definition: 'Natural world and surroundings.' },
    { lemma: 'natureza', pos: 'noun', gender: 'f', translations: ['nature'], level: 'A1', definition: 'Physical ecosystem.' },
    { lemma: 'energia', pos: 'noun', gender: 'f', translations: ['energy'], level: 'A2', definition: 'Power and vigor.' },

    // Adjectives
    { lemma: 'bom', pos: 'adj', translations: ['good'], irregularForms: ['boa', 'bons', 'boas', 'melhor', 'melhores'], level: 'A1', definition: 'Pleasant or skilled.' },
    { lemma: 'grande', pos: 'adj', translations: ['large', 'great'], irregularForms: ['grandes', 'maior', 'maiores'], level: 'A1', definition: 'Of extensive size.' },
    { lemma: 'pequeno', pos: 'adj', translations: ['small', 'little'], irregularForms: ['pequena', 'pequenos', 'pequenas', 'menor'], level: 'A1', definition: 'Of small dimensions.' },
    { lemma: 'novo', pos: 'adj', translations: ['new'], irregularForms: ['nova', 'novos', 'novas'], level: 'A1', definition: 'Recently created.' },
    { lemma: 'velho', pos: 'adj', translations: ['old'], irregularForms: ['velha', 'velhos', 'velhas'], level: 'A1', definition: 'Advanced in age.' },
    { lemma: 'importante', pos: 'adj', translations: ['important'], irregularForms: ['importantes'], level: 'A1', definition: 'Significant.' },
    { lemma: 'saudável', pos: 'adj', translations: ['healthy'], irregularForms: ['saudáveis'], level: 'A2', definition: 'Good for health.' },
    { lemma: 'sustentável', pos: 'adj', translations: ['sustainable'], irregularForms: ['sustentáveis'], level: 'B1', definition: 'Ecologically balanced.' },
    { lemma: 'fresco', pos: 'adj', translations: ['fresh'], irregularForms: ['fresca', 'frescos', 'frescas'], level: 'A1', definition: 'Newly harvested or cool.' }
  ]
};

export default portugueseLexicon;
