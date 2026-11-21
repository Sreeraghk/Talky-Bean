import { LexiconModule } from '../types';

/**
 * Japanese (日本語) Core Lexicon
 * Open linguistic dataset derived under CC BY-SA 4.0 / JMdict & Wiktionary contributors.
 * Supports kanji, hiragana, canonical unconjugated dictionary forms, and conjugations.
 */
export const japaneseLexicon: LexiconModule = {
  languageCode: 'ja',
  languageName: 'Japanese',
  license: 'CC BY-SA 4.0 / JMdict Open Data',
  attribution: 'Derived from JMdict & Wiktionary open linguistic resources under CC BY-SA 4.0',
  entries: [
    // Verbs (Dictionary base forms)
    { lemma: 'する', pos: 'verb', translations: ['to do'], irregularForms: ['して', 'した', 'します', 'しない'], level: 'A1', definition: 'Perform an action.' },
    { lemma: '行く', pos: 'verb', translations: ['to go'], irregularForms: ['行きます', '行って', '行った', '行かない', 'いく'], level: 'A1', definition: 'Move towards a destination.' },
    { lemma: '来る', pos: 'verb', translations: ['to come'], irregularForms: ['来ます', '来て', '来た', '来ない', 'くる'], level: 'A1', definition: 'Move towards speaker.' },
    { lemma: '見る', pos: 'verb', translations: ['to see', 'to watch'], irregularForms: ['見ます', '見て', '見た', '見ない', 'みる'], level: 'A1', definition: 'Perceive visually.' },
    { lemma: '食べる', pos: 'verb', translations: ['to eat'], irregularForms: ['食べます', '食べて', '食べた', '食べない', 'たべる'], level: 'A1', definition: 'Consume food.' },
    { lemma: '飲む', pos: 'verb', translations: ['to drink'], irregularForms: ['飲みます', '飲んで', '飲んだ', '飲まない', 'のむ'], level: 'A1', definition: 'Ingest liquids.' },
    { lemma: '話す', pos: 'verb', translations: ['to speak', 'to talk'], irregularForms: ['話します', '話して', '話した', 'はなす'], level: 'A1', definition: 'Communicate verbally.' },
    { lemma: '聞く', pos: 'verb', translations: ['to hear', 'to listen', 'to ask'], irregularForms: ['聞きます', '聞いて', '聞いた', 'きく'], level: 'A1', definition: 'Perceive sound or inquire.' },
    { lemma: '読む', pos: 'verb', translations: ['to read'], irregularForms: ['読みます', '読んで', '読んだ', 'よむ'], level: 'A1', definition: 'Comprehend written characters.' },
    { lemma: '書く', pos: 'verb', translations: ['to write'], irregularForms: ['書きます', '書いて', '書いた', 'かく'], level: 'A1', definition: 'Inscribe characters.' },
    { lemma: '買う', pos: 'verb', translations: ['to buy'], irregularForms: ['買います', '買って', '買った', 'かう'], level: 'A1', definition: 'Purchase goods.' },
    { lemma: '待つ', pos: 'verb', translations: ['to wait'], irregularForms: ['待ちます', '待って', '待った', 'まつ'], level: 'A1', definition: 'Await someone or something.' },
    { lemma: '知る', pos: 'verb', translations: ['to know'], irregularForms: ['知ります', '知って', '知った', 'しる'], level: 'A1', definition: 'Be aware of facts.' },
    { lemma: '持つ', pos: 'verb', translations: ['to hold', 'to have'], irregularForms: ['持ちます', '持って', '持った', 'もつ'], level: 'A1', definition: 'Hold in possession.' },
    { lemma: '歩く', pos: 'verb', translations: ['to walk'], irregularForms: ['歩きます', '歩いて', 'あるく'], level: 'A1', definition: 'Travel on foot.' },
    { lemma: '走る', pos: 'verb', translations: ['to run'], irregularForms: ['走ります', '走って', 'はしる'], level: 'A1', definition: 'Move rapidly on foot.' },
    { lemma: '寝る', pos: 'verb', translations: ['to sleep', 'to go to bed'], irregularForms: ['寝ます', '寝て', 'ねる'], level: 'A1', definition: 'Rest in sleep.' },
    { lemma: '起きる', pos: 'verb', translations: ['to wake up', 'to rise'], irregularForms: ['起きます', '起きて', 'おきる'], level: 'A1', definition: 'Awaken from sleep.' },
    { lemma: '働く', pos: 'verb', translations: ['to work'], irregularForms: ['働きます', '働いて', 'はたらく'], level: 'A1', definition: 'Perform employment.' },
    { lemma: '学ぶ', pos: 'verb', translations: ['to learn', 'to study'], irregularForms: ['学びます', '学んで', 'まなぶ'], level: 'A2', definition: 'Acquire knowledge.' },

    // Nouns
    { lemma: '健康', pos: 'noun', translations: ['health'], irregularForms: ['けんこう'], level: 'A2', definition: 'Physical and mental well-being.' },
    { lemma: '食事', pos: 'noun', translations: ['meal', 'diet'], irregularForms: ['しょくじ'], level: 'A1', definition: 'Nourishment or eating event.' },
    { lemma: '運動', pos: 'noun', translations: ['exercise', 'movement'], irregularForms: ['うんどう'], level: 'A1', definition: 'Physical activity.' },
    { lemma: '睡眠', pos: 'noun', translations: ['sleep'], irregularForms: ['すいみん'], level: 'A2', definition: 'Rest of mind and body.' },
    { lemma: '水', pos: 'noun', translations: ['water'], irregularForms: ['みず'], level: 'A1', definition: 'Drinkable fluid.' },
    { lemma: '人', pos: 'noun', translations: ['person', 'people'], irregularForms: ['ひと'], level: 'A1', definition: 'Human being.' },
    { lemma: '時間', pos: 'noun', translations: ['time', 'hours'], irregularForms: ['じかん'], level: 'A1', definition: 'Time duration.' },
    { lemma: '年', pos: 'noun', translations: ['year'], irregularForms: ['とし', 'ねん'], level: 'A1', definition: 'Twelve months.' },
    { lemma: '日', pos: 'noun', translations: ['day', 'sun'], irregularForms: ['ひ', 'にち'], level: 'A1', definition: 'Day of week or daylight.' },
    { lemma: '本', pos: 'noun', translations: ['book'], irregularForms: ['ほん'], level: 'A1', definition: 'Bound printed volume.' },
    { lemma: '家', pos: 'noun', translations: ['house', 'home'], irregularForms: ['いえ', 'うち'], level: 'A1', definition: 'Residence.' },
    { lemma: '街', pos: 'noun', translations: ['town', 'city street'], irregularForms: ['まち'], level: 'A1', definition: 'Town or urban street.' },
    { lemma: '国', pos: 'noun', translations: ['country', 'nation'], irregularForms: ['くに'], level: 'A1', definition: 'Sovereign nation.' },
    { lemma: '友達', pos: 'noun', translations: ['friend'], irregularForms: ['ともだち'], level: 'A1', definition: 'Companion.' },
    { lemma: '自然', pos: 'noun', translations: ['nature'], irregularForms: ['しぜん'], level: 'A2', definition: 'Physical outdoors and wildlife.' },
    { lemma: '環境', pos: 'noun', translations: ['environment'], irregularForms: ['かんきょう'], level: 'B1', definition: 'Ecology and surroundings.' },
    { lemma: 'エネルギー', pos: 'noun', translations: ['energy'], level: 'A2', definition: 'Power or vitality.' },
    { lemma: '社会', pos: 'noun', translations: ['society'], irregularForms: ['しゃかい'], level: 'B1', definition: 'Human community.' },
    { lemma: '未来', pos: 'noun', translations: ['future'], irregularForms: ['みらい'], level: 'A2', definition: 'Time yet to come.' },

    // Adjectives
    { lemma: '良い', pos: 'adj', translations: ['good'], irregularForms: ['いい', 'よく', 'よかった'], level: 'A1', definition: 'Pleasing or beneficial.' },
    { lemma: '大きい', pos: 'adj', translations: ['big', 'large'], irregularForms: ['大きく', 'おおきい'], level: 'A1', definition: 'Of considerable size.' },
    { lemma: '小さい', pos: 'adj', translations: ['small', 'little'], irregularForms: ['小さく', 'ちいさい'], level: 'A1', definition: 'Of modest size.' },
    { lemma: '新しい', pos: 'adj', translations: ['new'], irregularForms: ['新しく', 'あたらしい'], level: 'A1', definition: 'Recently made.' },
    { lemma: '古い', pos: 'adj', translations: ['old'], irregularForms: ['古く', 'ふるい'], level: 'A1', definition: 'Aged.' },
    { lemma: '重要', pos: 'adj', translations: ['important'], irregularForms: ['じゅうよう'], level: 'A2', definition: 'Of high significance.' },
    { lemma: '大切', pos: 'adj', translations: ['precious', 'important'], irregularForms: ['たいせつ'], level: 'A1', definition: 'Valuable or cherished.' },
    { lemma: '新鮮', pos: 'adj', translations: ['fresh'], irregularForms: ['しんせん'], level: 'A2', definition: 'Recently picked or clean.' },
    { lemma: '持続可能', pos: 'adj', translations: ['sustainable'], irregularForms: ['じぞくかのう'], level: 'B1', definition: 'Ecologically sustainable.' }
  ]
};

export default japaneseLexicon;
