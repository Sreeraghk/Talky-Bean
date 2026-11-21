import { LexiconModule } from '../types';

/**
 * Spanish (Español) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / Wiktionary & FreeDict contributors.
 */
export const spanishLexicon: LexiconModule = {
  languageCode: 'es',
  languageName: 'Spanish',
  license: 'CC BY-SA 4.0 / Open Data',
  attribution: 'Derived from Wiktionary & FreeDict open linguistic resources under CC BY-SA 4.0',
  entries: [
    // Verbs
    { lemma: 'ser', pos: 'verb', translations: ['to be (essential)'], irregularForms: ['soy', 'eres', 'es', 'somos', 'son', 'fui', 'fue', 'era', 'sido'], level: 'A1', definition: 'To be inherently or permanently.' },
    { lemma: 'estar', pos: 'verb', translations: ['to be (state/location)'], irregularForms: ['estoy', 'estás', 'está', 'estamos', 'están', 'estuve', 'estuvo', 'estado'], level: 'A1', definition: 'To exist in a condition or place.' },
    { lemma: 'haber', pos: 'verb', translations: ['to have (auxiliary)', 'there is/are'], irregularForms: ['he', 'has', 'ha', 'hemos', 'han', 'hay', 'hubo', 'había', 'habido'], level: 'A1', definition: 'Auxiliary for perfect tenses or existential (hay).' },
    { lemma: 'tener', pos: 'verb', translations: ['to have', 'to possess'], irregularForms: ['tengo', 'tienes', 'tiene', 'tenemos', 'tienen', 'tuve', 'tuvo', 'tenido'], level: 'A1', definition: 'Hold in possession or experience a condition.' },
    { lemma: 'hacer', pos: 'verb', translations: ['to do', 'to make'], irregularForms: ['hago', 'haces', 'hace', 'hacemos', 'hacen', 'hice', 'hizo', 'hecho'], level: 'A1', definition: 'Perform an action or construct.' },
    { lemma: 'ir', pos: 'verb', translations: ['to go'], irregularForms: ['voy', 'vas', 'va', 'vamos', 'van', 'fui', 'fue', 'iba', 'ido'], level: 'A1', definition: 'Move from one place to another.' },
    { lemma: 'poder', pos: 'verb', translations: ['can', 'to be able to'], irregularForms: ['puedo', 'puedes', 'puede', 'podemos', 'pueden', 'pude', 'pudo', 'podido'], level: 'A1', definition: 'Have ability or permission.' },
    { lemma: 'saber', pos: 'verb', translations: ['to know (facts/how to)'], irregularForms: ['sé', 'sabes', 'sabe', 'sabemos', 'saben', 'supe', 'supo', 'sabido'], level: 'A1', definition: 'Possess knowledge of a fact or skill.' },
    { lemma: 'poner', pos: 'verb', translations: ['to put', 'to place'], irregularForms: ['pongo', 'pones', 'pone', 'puso', 'puesto'], level: 'A1', definition: 'Place or set in a spot.' },
    { lemma: 'decir', pos: 'verb', translations: ['to say', 'to tell'], irregularForms: ['digo', 'dices', 'dice', 'decimos', 'dicen', 'dije', 'dijo', 'dicho'], level: 'A1', definition: 'Utter or communicate verbally.' },
    { lemma: 'ver', pos: 'verb', translations: ['to see', 'to watch'], irregularForms: ['veo', 'ves', 've', 'vemos', 'ven', 'vi', 'vio', 'visto'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: 'dar', pos: 'verb', translations: ['to give'], irregularForms: ['doy', 'das', 'da', 'damos', 'dan', 'di', 'dio', 'dado'], level: 'A1', definition: 'Hand over or grant.' },
    { lemma: 'querer', pos: 'verb', translations: ['to want', 'to love'], irregularForms: ['quiero', 'quieres', 'quiere', 'quisiera', 'quiso', 'querido'], level: 'A1', definition: 'Desire or feel affection for.' },
    { lemma: 'llegar', pos: 'verb', translations: ['to arrive', 'to reach'], irregularForms: ['llego', 'llegas', 'llega', 'llegó', 'llegado'], level: 'A1', definition: 'Reach a destination.' },
    { lemma: 'pasar', pos: 'verb', translations: ['to pass', 'to happen', 'to spend (time)'], level: 'A1', definition: 'Go by or occur.' },
    { lemma: 'deber', pos: 'verb', translations: ['should', 'to owe', 'must'], level: 'A1', definition: 'Be obliged to or owe.' },
    { lemma: 'creer', pos: 'verb', translations: ['to believe', 'to think'], level: 'A1', definition: 'Accept as true.' },
    { lemma: 'hablar', pos: 'verb', translations: ['to speak', 'to talk'], level: 'A1', definition: 'Communicate with spoken words.' },
    { lemma: 'llevar', pos: 'verb', translations: ['to take', 'to carry', 'to wear'], level: 'A1', definition: 'Transport or wear clothing.' },
    { lemma: 'dejar', pos: 'verb', translations: ['to leave', 'to let', 'to allow'], level: 'A1', definition: 'Allow or abandon behind.' },
    { lemma: 'seguir', pos: 'verb', translations: ['to follow', 'to continue'], irregularForms: ['sigo', 'sigues', 'sigue', 'siguió', 'seguido'], level: 'A2', definition: 'Pursue or persist in doing.' },
    { lemma: 'encontrar', pos: 'verb', translations: ['to find', 'to meet'], irregularForms: ['encuentro', 'encuentra', 'encontró', 'encontrado'], level: 'A1', definition: 'Discover or come across.' },
    { lemma: 'llamar', pos: 'verb', translations: ['to call', 'to name'], level: 'A1', definition: 'Summon or name someone.' },
    { lemma: 'venir', pos: 'verb', translations: ['to come'], irregularForms: ['vengo', 'vienes', 'viene', 'vino', 'venido'], level: 'A1', definition: 'Move towards speaker.' },
    { lemma: 'pensar', pos: 'verb', translations: ['to think'], irregularForms: ['pienso', 'piensas', 'piensa', 'pensó'], level: 'A1', definition: 'Formulate mental concepts.' },
    { lemma: 'comer', pos: 'verb', translations: ['to eat'], irregularForms: ['como', 'comes', 'come', 'comió', 'comido'], level: 'A1', definition: 'Ingest sustenance.' },
    { lemma: 'vivir', pos: 'verb', translations: ['to live'], level: 'A1', definition: 'Reside or be alive.' },
    { lemma: 'desarrollar', pos: 'verb', translations: ['to develop'], level: 'B1', definition: 'Grow or expand.' },
    { lemma: 'proteger', pos: 'verb', translations: ['to protect'], level: 'B1', definition: 'Keep safe from injury or harm.' },

    // Nouns
    { lemma: 'casa', pos: 'noun', gender: 'f', translations: ['house', 'home'], irregularForms: ['casas'], level: 'A1', definition: 'Dwelling place.' },
    { lemma: 'tiempo', pos: 'noun', gender: 'm', translations: ['time', 'weather'], level: 'A1', definition: 'Continuous progression or meteorological state.' },
    { lemma: 'año', pos: 'noun', gender: 'm', translations: ['year'], irregularForms: ['años'], level: 'A1', definition: 'Period of twelve months.' },
    { lemma: 'día', pos: 'noun', gender: 'm', translations: ['day'], irregularForms: ['días'], level: 'A1', definition: 'Twenty-four hour duration.' },
    { lemma: 'hombre', pos: 'noun', gender: 'm', translations: ['man'], irregularForms: ['hombres'], level: 'A1', definition: 'Adult human male.' },
    { lemma: 'mujer', pos: 'noun', gender: 'f', translations: ['woman'], irregularForms: ['mujeres'], level: 'A1', definition: 'Adult human female.' },
    { lemma: 'niño', pos: 'noun', gender: 'm', translations: ['child', 'boy'], irregularForms: ['niños', 'niña', 'niñas'], level: 'A1', definition: 'Young human being.' },
    { lemma: 'vida', pos: 'noun', gender: 'f', translations: ['life'], level: 'A1', definition: 'State of existence.' },
    { lemma: 'mundo', pos: 'noun', gender: 'm', translations: ['world'], level: 'A1', definition: 'The earth and its inhabitants.' },
    { lemma: 'amigo', pos: 'noun', gender: 'm', translations: ['friend'], irregularForms: ['amigos', 'amiga', 'amigas'], level: 'A1', definition: 'Close companion.' },
    { lemma: 'ciudad', pos: 'noun', gender: 'f', translations: ['city'], irregularForms: ['ciudades'], level: 'A1', definition: 'Large inhabited town.' },
    { lemma: 'país', pos: 'noun', gender: 'm', translations: ['country', 'nation'], irregularForms: ['países'], level: 'A1', definition: 'Sovereign political state.' },
    { lemma: 'salud', pos: 'noun', gender: 'f', translations: ['health'], level: 'A2', definition: 'Well-being and absence of illness.' },
    { lemma: 'agua', pos: 'noun', gender: 'f', translations: ['water'], level: 'A1', definition: 'Essential liquid substance.' },
    { lemma: 'alimentación', pos: 'noun', gender: 'f', translations: ['nutrition', 'diet'], level: 'A2', definition: 'Nourishment or food intake.' },
    { lemma: 'ejercicio', pos: 'noun', gender: 'm', translations: ['exercise'], level: 'A2', definition: 'Physical bodily activity.' },
    { lemma: 'medioambiente', pos: 'noun', gender: 'm', translations: ['environment'], level: 'B1', definition: 'Natural surroundings.' },
    { lemma: 'naturaleza', pos: 'noun', gender: 'f', translations: ['nature'], level: 'A1', definition: 'Physical world.' },
    { lemma: 'sociedad', pos: 'noun', gender: 'f', translations: ['society'], level: 'B1', definition: 'Organized community of people.' },
    { lemma: 'energía', pos: 'noun', gender: 'f', translations: ['energy'], level: 'A2', definition: 'Power or vitality.' },

    // Adjectives
    { lemma: 'bueno', pos: 'adj', translations: ['good'], irregularForms: ['buen', 'buena', 'buenos', 'buenas', 'mejor', 'mejores'], level: 'A1', definition: 'Pleasing or beneficial.' },
    { lemma: 'grande', pos: 'adj', translations: ['large', 'great'], irregularForms: ['gran', 'grandes', 'mayor', 'mayores'], level: 'A1', definition: 'Of considerable magnitude.' },
    { lemma: 'pequeño', pos: 'adj', translations: ['small', 'little'], irregularForms: ['pequeña', 'pequeños', 'pequeñas', 'menor'], level: 'A1', definition: 'Not large.' },
    { lemma: 'nuevo', pos: 'adj', translations: ['new'], irregularForms: ['nueva', 'nuevos', 'nuevas'], level: 'A1', definition: 'Recently created or acquired.' },
    { lemma: 'viejo', pos: 'adj', translations: ['old'], irregularForms: ['vieja', 'viejos', 'viejas'], level: 'A1', definition: 'Having lived long.' },
    { lemma: 'importante', pos: 'adj', translations: ['important'], irregularForms: ['importantes'], level: 'A1', definition: 'Having great significance.' },
    { lemma: 'saludable', pos: 'adj', translations: ['healthy'], irregularForms: ['saludables'], level: 'A2', definition: 'Promoting good health.' },
    { lemma: 'sostenible', pos: 'adj', translations: ['sustainable'], irregularForms: ['sostenibles'], level: 'B1', definition: 'Ecologically balanced.' },
    { lemma: 'fresco', pos: 'adj', translations: ['fresh', 'cool'], irregularForms: ['fresca', 'frescos', 'frescas'], level: 'A1', definition: 'Newly harvested or made.' },
    { lemma: 'posible', pos: 'adj', translations: ['possible'], irregularForms: ['posibles'], level: 'A1', definition: 'Capable of occurring.' }
  ]
};

export default spanishLexicon;
