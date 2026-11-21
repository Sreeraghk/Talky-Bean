import { LexiconModule } from '../types';

/**
 * Finnish (Suomi) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / Kotus & Wiktionary contributors.
 * Supports agglutinative base nominatives/infinitives, vowel harmony, and educational translations.
 */
export const finnishLexicon: LexiconModule = {
  languageCode: 'fi',
  languageName: 'Finnish',
  license: 'CC BY-SA 4.0 / Open Data',
  attribution: 'Derived from Kotus open wordlists and Wiktionary under CC BY-SA 4.0',
  entries: [
    // Verbs (Base infinitives ending in -da/-dä/-ta/-tä/-la/-lä/-na/-nä/-ra/-rä/-a/-ä)
    { lemma: 'olla', pos: 'verb', translations: ['to be'], irregularForms: ['on', 'ovat', 'oli', 'olivat', 'olen', 'olet', 'ollut'], level: 'A1', definition: 'Exist or possess qualities.' },
    { lemma: 'mennä', pos: 'verb', translations: ['to go'], irregularForms: ['menee', 'menivät', 'meni', 'mennyt', 'menemme'], level: 'A1', definition: 'Move towards a destination.' },
    { lemma: 'tulla', pos: 'verb', translations: ['to come', 'to become'], irregularForms: ['tulee', 'tuli', 'tullut', 'tulemme'], level: 'A1', definition: 'Move towards speaker or transition state.' },
    { lemma: 'tehdä', pos: 'verb', translations: ['to do', 'to make'], irregularForms: ['tekee', 'teki', 'tehnyt', 'teemme'], level: 'A1', definition: 'Perform an action or construct.' },
    { lemma: 'sanoa', pos: 'verb', translations: ['to say'], irregularForms: ['sanoo', 'sanoi', 'sanonut'], level: 'A1', definition: 'Utter spoken words.' },
    { lemma: 'nähdä', pos: 'verb', translations: ['to see'], irregularForms: ['näkee', 'näki', 'nähnyt', 'näemme'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: 'tietää', pos: 'verb', translations: ['to know (facts)'], irregularForms: ['tietää', 'tiesi', 'tiennyt', 'tiedämme'], level: 'A1', definition: 'Possess knowledge of facts.' },
    { lemma: 'antaa', pos: 'verb', translations: ['to give', 'to allow'], irregularForms: ['antaa', 'antoi', 'antanut', 'annamme'], level: 'A1', definition: 'Bestow or permit.' },
    { lemma: 'syödä', pos: 'verb', translations: ['to eat'], irregularForms: ['syö', 'söi', 'syönyt'], level: 'A1', definition: 'Consume nourishment.' },
    { lemma: 'juoda', pos: 'verb', translations: ['to drink'], irregularForms: ['juo', 'joi', 'juonut'], level: 'A1', definition: 'Ingest liquids.' },
    { lemma: 'nukkua', pos: 'verb', translations: ['to sleep'], irregularForms: ['nukkuu', 'nukkui', 'nukkunut'], level: 'A1', definition: 'Rest in sleep.' },
    { lemma: 'herätä', pos: 'verb', translations: ['to wake up'], irregularForms: ['herää', 'heräsi', 'herännyt'], level: 'A1', definition: 'Awaken from rest.' },
    { lemma: 'asua', pos: 'verb', translations: ['to live', 'to reside'], irregularForms: ['asuu', 'asui', 'asunut'], level: 'A1', definition: 'Inhabit a dwelling.' },
    { lemma: 'oppia', pos: 'verb', translations: ['to learn'], irregularForms: ['oppii', 'oppi', 'oppinut'], level: 'A1', definition: 'Acquire knowledge.' },
    { lemma: 'työskennellä', pos: 'verb', translations: ['to work'], irregularForms: ['työskentelee', 'työskenteli'], level: 'A1', definition: 'Perform employment.' },
    { lemma: 'suojella', pos: 'verb', translations: ['to protect'], irregularForms: ['suojelee', 'suojeli', 'suojellut'], level: 'B1', definition: 'Guard or preserve.' },
    { lemma: 'kehittää', pos: 'verb', translations: ['to develop'], irregularForms: ['kehittää', 'kehitti', 'kehittänyt'], level: 'B1', definition: 'Expand or innovate.' },

    // Nouns
    { lemma: 'talo', pos: 'noun', translations: ['house', 'building'], irregularForms: ['talot', 'talossa', 'talosta', 'taloon'], level: 'A1', definition: 'Dwelling place.' },
    { lemma: 'aika', pos: 'noun', translations: ['time'], irregularForms: ['ajat', 'ajassa'], level: 'A1', definition: 'Continuous progress of events.' },
    { lemma: 'vuosi', pos: 'noun', translations: ['year'], irregularForms: ['vuodet', 'vuotta', 'vuonna'], level: 'A1', definition: 'Twelve months.' },
    { lemma: 'päivä', pos: 'noun', translations: ['day'], irregularForms: ['päivät', 'päivänä'], level: 'A1', definition: 'Daylight or 24 hours.' },
    { lemma: 'ihminen', pos: 'noun', translations: ['human', 'person'], irregularForms: ['ihmiset', 'ihmisiä', 'ihmisen'], level: 'A1', definition: 'Human being.' },
    { lemma: 'mies', pos: 'noun', translations: ['man'], irregularForms: ['miehet', 'miestä'], level: 'A1', definition: 'Adult human male.' },
    { lemma: 'nainen', pos: 'noun', translations: ['woman'], irregularForms: ['naiset', 'naista'], level: 'A1', definition: 'Adult human female.' },
    { lemma: 'lapsi', pos: 'noun', translations: ['child'], irregularForms: ['lapset', 'lasta'], level: 'A1', definition: 'Young person.' },
    { lemma: 'kaupunki', pos: 'noun', translations: ['city', 'town'], irregularForms: ['kaupungit', 'kaupungissa'], level: 'A1', definition: 'Urban municipality.' },
    { lemma: 'maa', pos: 'noun', translations: ['country', 'land', 'earth'], irregularForms: ['maat', 'maassa'], level: 'A1', definition: 'Sovereign nation or soil.' },
    { lemma: 'vesi', pos: 'noun', translations: ['water'], irregularForms: ['vedet', 'vettä', 'vedessä'], level: 'A1', definition: 'Clear potable liquid.' },
    { lemma: 'terveys', pos: 'noun', translations: ['health'], irregularForms: ['terveyden', 'terveydessä'], level: 'A2', definition: 'Physical and mental well-being.' },
    { lemma: 'ravinto', pos: 'noun', translations: ['nutrition', 'food'], irregularForms: ['ravinnon'], level: 'A2', definition: 'Nutritive sustenance.' },
    { lemma: 'liikunta', pos: 'noun', translations: ['exercise', 'physical activity'], irregularForms: ['liikunnan'], level: 'A1', definition: 'Physical bodily movement.' },
    { lemma: 'uni', pos: 'noun', translations: ['sleep', 'dream'], irregularForms: ['unen', 'unet'], level: 'A2', definition: 'State of rest.' },
    { lemma: 'luonto', pos: 'noun', translations: ['nature'], irregularForms: ['luonnon', 'luonnossa'], level: 'A1', definition: 'Physical outdoors and wildlife.' },
    { lemma: 'ympäristö', pos: 'noun', translations: ['environment'], irregularForms: ['ympäristön'], level: 'B1', definition: 'Surroundings and ecology.' },
    { lemma: 'energia', pos: 'noun', translations: ['energy'], irregularForms: ['energian'], level: 'A2', definition: 'Power and vitality.' },
    { lemma: 'yhteiskunta', pos: 'noun', translations: ['society'], irregularForms: ['yhteiskunnan'], level: 'B1', definition: 'Organized human community.' },
    { lemma: 'tulevaisuus', pos: 'noun', translations: ['future'], irregularForms: ['tulevaisuuden'], level: 'A2', definition: 'Time to come.' },

    // Adjectives
    { lemma: 'hyvä', pos: 'adj', translations: ['good'], irregularForms: ['parempi', 'paras', 'parhaat'], level: 'A1', definition: 'Pleasant or skilled.' },
    { lemma: 'suuri', pos: 'adj', translations: ['big', 'large'], irregularForms: ['suuret', 'suurempi', 'suurin'], level: 'A1', definition: 'Of considerable magnitude.' },
    { lemma: 'pieni', pos: 'adj', translations: ['small', 'little'], irregularForms: ['pienet', 'pienempi', 'pienin'], level: 'A1', definition: 'Of minor size.' },
    { lemma: 'uusi', pos: 'adj', translations: ['new'], irregularForms: ['uudet', 'uudempi', 'uusin'], level: 'A1', definition: 'Recently created.' },
    { lemma: 'vanha', pos: 'adj', translations: ['old'], irregularForms: ['vanhat', 'vanhempi', 'vanhin'], level: 'A1', definition: 'Advanced in age.' },
    { lemma: 'tärkeä', pos: 'adj', translations: ['important'], irregularForms: ['tärkeät', 'tärkeämpi'], level: 'A1', definition: 'Significant.' },
    { lemma: 'terveellinen', pos: 'adj', translations: ['healthy'], irregularForms: ['terveelliset'], level: 'A2', definition: 'Beneficial to health.' },
    { lemma: 'kestävä', pos: 'adj', translations: ['sustainable', 'durable'], irregularForms: ['kestävät'], level: 'B1', definition: 'Ecologically sustainable.' },
    { lemma: 'tuore', pos: 'adj', translations: ['fresh'], irregularForms: ['tuoreet'], level: 'A1', definition: 'Crisp and recently made.' }
  ]
};

export default finnishLexicon;
