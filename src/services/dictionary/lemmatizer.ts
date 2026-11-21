/**
 * Multilingual Morphological Lemmatizer Engine
 * Covers all 11 supported languages:
 * German (de), Spanish (es), French (fr), Italian (it), Portuguese (pt),
 * Japanese (ja), Mandarin Chinese (zh), Korean (ko), Russian (ru), Irish (ga), Finnish (fi).
 */

// Irregular forms mapping to canonical lemmas per language
const IRREGULAR_LEMMAS: Record<string, Record<string, string>> = {
  de: {
    // Verbs
    "ging": "gehen", "gegangen": "gehen", "geht": "gehen",
    "kam": "kommen", "gekommen": "kommen", "kömmt": "kommen",
    "sah": "sehen", "gesehen": "sehen", "sieht": "sehen",
    "nahm": "nehmen", "genommen": "nehmen", "nimmt": "nehmen",
    "gab": "geben", "gegeben": "geben", "gibt": "geben",
    "sprach": "sprechen", "gesprochen": "sprechen", "spricht": "sprechen",
    "fand": "finden", "gefunden": "finden",
    "aß": "essen", "gegessen": "essen", "isst": "essen",
    "trank": "trinken", "getrunken": "trinken",
    "schlief": "schlafen", "geschlafen": "schlafen", "schläft": "schlafen",
    "schrieb": "schreiben", "geschrieben": "schreiben",
    "las": "lesen", "gelesen": "lesen", "liest": "lesen",
    "fuhr": "fahren", "gefahren": "fahren", "fährt": "fahren",
    "flog": "fliegen", "geflogen": "fliegen",
    "stand": "stehen", "gestanden": "stehen",
    "saß": "sitzen", "gesessen": "sitzen",
    "lag": "liegen", "gelegen": "liegen",
    "half": "helfen", "geholfen": "helfen", "hilft": "helfen",
    "wusste": "wissen", "gewusst": "wissen", "weiß": "wissen",
    "kannte": "kennen", "gekannt": "kennen",
    "dachte": "denken", "gedacht": "denken",
    "brachte": "bringen", "gebracht": "bringen",
    "stand auf": "aufstehen", "aufgestanden": "aufstehen",
    "war": "sein", "gewesen": "sein", "ist": "sein", "sind": "sein", "bin": "sein", "bist": "sein",
    "hatte": "haben", "gehabt": "haben", "hat": "haben",
    "wurde": "werden", "geworden": "werden", "wird": "werden",
    "konnte": "können", "gekonnt": "können", "kann": "können",
    "musste": "müssen", "gemusst": "müssen", "muss": "müssen",
    "durfte": "dürfen", "gedurft": "dürfen", "darf": "dürfen",
    "wollte": "wollen", "gewollt": "wollen", "will": "wollen",
    "sollte": "sollen", "gesollt": "sollen", "soll": "sollen",
    "mochte": "mögen", "gemocht": "mögen", "mag": "mögen",
    // Noun plurals / inflections
    "häuser": "haus", "häusern": "haus",
    "bücher": "buch", "büchern": "buch",
    "männer": "mann", "männern": "mann",
    "frauen": "frau",
    "kinder": "kind", "kindern": "kind",
    "städte": "stadt", "städten": "stadt",
    "länder": "land", "ländern": "land",
    "freunde": "freund", "freunden": "freund",
    "tage": "tag", "tagen": "tag",
    "jahre": "jahr", "jahren": "jahr",
    "augen": "auge", "auges": "auge",
    "hände": "hand", "händen": "hand",
    "mütter": "mutter",
    "väter": "vater",
    "brüder": "bruder",
    "schwestern": "schwester",
    // Adjectives
    "besseren": "gut", "bessere": "gut", "besser": "gut", "besten": "gut", "beste": "gut",
    "größeren": "groß", "größer": "groß", "größte": "groß", "größten": "groß",
    "höheren": "hoch", "höher": "hoch", "höchste": "hoch", "höchsten": "hoch"
  },
  es: {
    "fui": "ir", "fue": "ir", "fuiste": "ir", "fuimos": "ir", "fueron": "ir", "iba": "ir", "ibas": "ir", "vamos": "ir", "voy": "ir", "va": "ir", "van": "ir",
    "estuve": "estar", "estuvo": "estar", "estuviste": "estar", "estuvimos": "estar", "estuvieron": "estar", "estoy": "estar", "está": "estar", "están": "estar",
    "hice": "hacer", "hizo": "hacer", "hiciste": "hacer", "hicimos": "hacer", "hicieron": "hacer", "hecho": "hacer", "hago": "hacer", "hace": "hacer", "hacen": "hacer",
    "tuve": "tener", "tuvo": "tener", "tuviste": "tener", "tuvimos": "tener", "tuvieron": "tener", "tengo": "tener", "tiene": "tener", "tienen": "tener",
    "pude": "poder", "pudo": "poder", "pudiste": "poder", "pudimos": "poder", "pudieron": "poder", "puedo": "poder", "puede": "poder", "pueden": "poder",
    "dije": "decir", "dijo": "decir", "dijiste": "decir", "dijimos": "decir", "dijeron": "decir", "dicho": "decir", "digo": "decir", "dice": "decir", "dicen": "decir",
    "puse": "poner", "puso": "poner", "pusiste": "poner", "pusimos": "poner", "pusieron": "poner", "puesto": "poner", "pongo": "poner", "pone": "poner",
    "vi": "ver", "vio": "ver", "viste": "ver", "vimos": "ver", "vieron": "ver", "visto": "ver", "veo": "ver", "ve": "ver", "ven": "ver",
    "supe": "saber", "supo": "saber", "supiste": "saber", "supimos": "saber", "supieron": "saber", "sé": "saber", "sabe": "saber", "saben": "saber",
    "quise": "querer", "quiso": "querer", "quisiste": "querer", "quisimos": "querer", "quisieron": "querer", "quiero": "querer", "quiere": "querer", "quieren": "querer",
    "vine": "venir", "vino": "venir", "viniste": "venir", "vinimos": "venir", "vinieron": "venir", "vengo": "venir", "viene": "venir", "vienen": "venir",
    "ciudades": "ciudad", "luces": "luz", "mujeres": "mujer", "hombres": "hombre", "padres": "padre", "mejores": "bueno", "peores": "malo"
  },
  fr: {
    "suis": "être", "es": "être", "est": "être", "sommes": "être", "êtes": "être", "sont": "être", "été": "être", "étais": "être", "était": "être", "étions": "être", "étaient": "être", "fus": "être", "fut": "être", "serai": "être", "sera": "être",
    "ai": "avoir", "as": "avoir", "a": "avoir", "avons": "avoir", "avez": "avoir", "ont": "avoir", "eu": "avoir", "avais": "avoir", "avait": "avoir", "aurai": "avoir", "aura": "avoir",
    "vais": "aller", "vas": "aller", "va": "aller", "allons": "aller", "allez": "aller", "vont": "aller", "allé": "aller", "allée": "aller", "allés": "aller", "irai": "aller", "ira": "aller",
    "fais": "faire", "fait": "faire", "faisons": "faire", "faites": "faire", "font": "faire", "ferai": "faire", "fera": "faire",
    "dis": "dire", "dit": "dire", "disons": "dire", "dites": "dire", "disent": "dire",
    "sais": "savoir", "sait": "savoir", "savons": "savoir", "savez": "savoir", "savent": "savoir", "savions": "savoir", "su": "savoir",
    "peux": "pouvoir", "peut": "pouvoir", "pouvons": "pouvoir", "pouvez": "pouvoir", "peuvent": "pouvoir", "pu": "pouvoir",
    "veux": "vouloir", "veut": "vouloir", "voulons": "vouloir", "voulez": "vouloir", "veulent": "vouloir", "voulu": "vouloir",
    "viens": "venir", "vient": "venir", "venons": "venir", "venez": "venir", "viennent": "venir", "venu": "venir",
    "prends": "prendre", "prend": "prendre", "pris": "prendre", "prenons": "prendre", "prennent": "prendre",
    "yeux": "œil", "eaux": "eau", "travaux": "travail", "journaux": "journal", "meilleurs": "bon", "meilleur": "bon"
  },
  it: {
    "sono": "essere", "sei": "essere", "è": "essere", "siamo": "essere", "siete": "essere", "stato": "essere", "stata": "essere", "stati": "essere", "ero": "essere", "era": "essere",
    "ho": "avere", "hai": "avere", "ha": "avere", "abbiamo": "avere", "avete": "avere", "hanno": "avere", "avuto": "avere", "aveva": "avere",
    "vado": "andare", "vai": "andare", "va": "andare", "andiamo": "andare", "andate": "andare", "vanno": "andare", "andato": "andare",
    "faccio": "fare", "fa": "fare", "facciamo": "fare", "fanno": "fare", "fatto": "fare", "faceva": "fare",
    "dico": "dire", "dice": "dire", "diciamo": "dire", "dicono": "dire", "detto": "dire",
    "posso": "potere", "può": "potere", "possiamo": "potere", "possono": "potere", "potuto": "potere",
    "voglio": "volere", "vuole": "volere", "vogliamo": "volere", "vogliono": "volere", "voluto": "volere",
    "so": "sapere", "sa": "sapere", "sappiamo": "sapere", "sanno": "sapere", "saputo": "sapere",
    "uomini": "uomo", "donne": "donna", "città": "città", "migliori": "buono"
  },
  pt: {
    "sou": "ser", "é": "ser", "somos": "ser", "são": "ser", "foi": "ser", "era": "ser", "sido": "ser",
    "estou": "estar", "está": "estar", "estamos": "estar", "estão": "estar", "esteve": "estar", "estado": "estar",
    "tenho": "ter", "tem": "ter", "temos": "ter", "têm": "ter", "teve": "ter", "tinha": "ter", "tido": "ter",
    "faço": "fazer", "faz": "fazer", "fazemos": "fazer", "fazem": "fazer", "fez": "fazer", "feito": "fazer",
    "vou": "ir", "vai": "ir", "vamos": "ir", "vão": "ir", "ia": "ir", "ido": "ir",
    "digo": "dizer", "diz": "dizer", "dizemos": "dizer", "dizem": "dizer", "disse": "dizer", "dito": "dizer",
    "posso": "poder", "pode": "poder", "podemos": "poder", "podem": "poder", "pôde": "poder", "podido": "poder",
    "corações": "coração", "estações": "estação", "homens": "homem", "mulheres": "mulher", "melhores": "bom"
  },
  ja: {
    "行った": "行く", "行きます": "行く", "行って": "行く", "行かない": "行く",
    "食べた": "食べる", "食べます": "食べる", "食べて": "食べる", "食べない": "食べる",
    "見た": "見る", "見ます": "見る", "見て": "見る", "見ない": "見る",
    "読んだ": "読む", "読みます": "読む", "読んで": "読む",
    "書いた": "書く", "書きます": "書く", "書いて": "書く",
    "話した": "話す", "話します": "話す", "話して": "話す",
    "聞いた": "聞く", "聞きます": "聞く", "聞いて": "聞く",
    "買った": "買う", "買います": "買う", "買って": "買う",
    "した": "する", "します": "する", "して": "する", "しない": "する",
    "来た": "来る", "来ます": "来る", "来て": "来る", "来ない": "来る",
    "いい": "よい", "よかった": "よい"
  },
  zh: {
    // Chinese characters are largely invariable morphologically; lemmas are base words
    "做了": "做", "看了": "看", "去了": "去", "来了": "来", "吃了": "吃"
  },
  ko: {
    "갔다": "가다", "갑니다": "가다", "가요": "가다", "가서": "가다",
    "왔다": "오다", "옵니다": "오다", "와요": "오다", "와서": "오다",
    "했다": "하다", "합니다": "하다", "해요": "하다", "해서": "하다",
    "먹었다": "먹다", "먹습니다": "먹다", "먹어요": "먹다",
    "마셨다": "마시다", "마십니다": "마시다", "마셔요": "마시다",
    "보았다": "보다", "봤다": "보다", "봅니다": "보다", "봐요": "보다",
    "읽었다": "읽다", "읽습니다": "읽다", "읽어요": "읽다",
    "살았다": "살다", "삽니다": "살다", "살아요": "살다"
  },
  ru: {
    "шел": "идти", "пошел": "идти", "иду": "идти", "идет": "идти", "идут": "идти",
    "был": "быть", "была": "быть", "было": "быть", "были": "быть", "будет": "быть", "будут": "быть",
    "дал": "дать", "дала": "дать", "даст": "дать", "дадут": "дать",
    "взял": "взять", "взяла": "взять", "возьмет": "взять",
    "сказал": "сказать", "сказала": "сказать", "скажет": "сказать",
    "видел": "видеть", "видела": "видеть", "видит": "видеть", "видят": "видеть",
    "знал": "знать", "знала": "знать", "знает": "знать", "знают": "знать",
    "лучший": "хороший", "лучше": "хороший", "худший": "плохой",
    "домов": "дом", "домами": "дом", "домах": "дом", "дома": "дом",
    "городов": "город", "городами": "город", "городах": "город", "города": "город",
    "людей": "человек", "людьми": "человек", "людям": "человек"
  },
  ga: {
    // Lenition (séimhiú) and eclipsis (urú)
    "chonaic": "feic", "bhfaca": "feic", "feiceann": "feic",
    "chuaigh": "téigh", "ndeachaigh": "téigh", "téann": "téigh",
    "dúirt": "abair", "ndúirt": "abair", "deir": "abair",
    "thug": "tabhair", "dtugann": "tabhair", "tugann": "tabhair",
    "tháinig": "tar", "dtáinig": "tar", "tagann": "tar",
    "bhí": "bí", "raibh": "bí", "tá": "bí", "bheidh": "bí",
    "rinne": "déan", "ndearna": "déan", "déanann": "déan",
    "fuair": "faigh", "bhfuair": "faigh", "faigheann": "faigh",
    "d'ith": "ith", "itheann": "ith",
    "chóirigh": "cóirigh"
  },
  fi: {
    "meni": "mennä", "mennyt": "mennä", "menee": "mennä", "menemme": "mennä",
    "tuli": "tulla", "tullut": "tulla", "tulee": "tulla", "tulemme": "tulla",
    "oli": "olla", "ollut": "olla", "on": "olla", "ovat": "olla", "olen": "olla",
    "teki": "tehdä", "tehnyt": "tehdä", "tekee": "tehdä",
    "sanoi": "sanoa", "sanonut": "sanoa", "sanoo": "sanoa",
    "näki": "nähdä", "nähnyt": "nähdä", "näkee": "nähdä",
    "tiesi": "tietää", "tiennyt": "tietää", "tietää": "tietää",
    "antoi": "antaa", "antanut": "antaa", "antaa": "antaa",
    "parempi": "hyvä", "paras": "hyvä", "parhaat": "hyvä"
  }
};

// Common trivial stopwords that should not clutter vocabulary hints
export const COMMON_STOPWORDS: Record<string, Set<string>> = {
  de: new Set(["der", "die", "das", "ein", "eine", "einen", "einem", "einer", "eines", "und", "oder", "aber", "in", "an", "auf", "mit", "von", "zu", "bei", "nach", "aus", "für", "um", "durch", "über", "unter", "ich", "du", "er", "sie", "es", "wir", "ihr", "sie", "mir", "dir", "ihm", "ihr", "uns", "euch", "ihnen", "mich", "dich", "ihn", "sich", "nicht", "kein", "keine", "auch", "sehr", "nur", "so", "wie", "als"]),
  es: new Set(["el", "la", "los", "las", "un", "una", "unos", "unas", "y", "e", "o", "u", "pero", "en", "de", "a", "con", "por", "para", "sin", "sobre", "yo", "tú", "él", "ella", "usted", "nosotros", "ellos", "me", "te", "se", "nos", "lo", "la", "los", "las", "le", "les", "no", "sí", "muy", "más", "como"]),
  fr: new Set(["le", "la", "les", "l'", "un", "une", "des", "du", "de", "d'", "et", "ou", "mais", "dans", "en", "à", "au", "aux", "avec", "pour", "par", "sans", "sur", "sous", "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "me", "te", "se", "lui", "leur", "ne", "pas", "très", "plus", "comme"]),
  it: new Set(["il", "lo", "la", "i", "gli", "le", "l'", "un", "uno", "una", "un'", "e", "o", "ma", "in", "a", "da", "di", "con", "su", "per", "tra", "fra", "io", "tu", "lui", "lei", "noi", "voi", "loro", "mi", "ti", "si", "ci", "vi", "non", "molto", "più", "come"]),
  pt: new Set(["o", "a", "os", "as", "um", "uma", "uns", "umas", "e", "ou", "mas", "em", "de", "a", "com", "por", "para", "sem", "sobre", "eu", "tu", "ele", "ela", "nós", "eles", "me", "te", "se", "nos", "lhe", "não", "muito", "mais", "como"]),
  ja: new Set(["の", "に", "は", "を", "た", "が", "で", "て", "と", "し", "れ", "さ", "ある", "いる", "も", "する", "から", "な", "こと", "として", "い", "や", "れる", "など", "なっ", "ない", "この", "ため", "その", "あっ", "よう", "また", "もの", "という", "あり", "まで", "られ", "なる", "へ", "か"]),
  zh: new Set(["的", "了", "和", "是", "就", "都", "而", "及", "與", "着", "或", "一个", "没有", "我们", "你们", "他们", "在", "上", "下", "中", "这", "那", "有", "不", "很", "也", "要", "到", "自", "把", "从"]),
  ko: new Set(["이", "그", "저", "것", "수", "등", "들", "및", "제", "더", "때", "년", "월", "일", "을", "를", "에", "의", "가", "이", "은", "는", "로", "으로", "과", "와", "도", "에서", "만"]),
  ru: new Set(["и", "в", "не", "на", "я", "быть", "он", "с", "что", "а", "по", "это", "она", "этот", "к", "но", "они", "мы", "как", "из", "у", "который", "то", "за", "свой", "что", "ее", "их", "о", "же", "от", "сказать", "только", "до"]),
  ga: new Set(["an", "na", "agus", "ach", "i", "in", "ar", "le", "ag", "do", "ó", "faoi", "roimh", "idir", "mé", "tú", "sé", "sí", "muid", "sibh", "siad", "mo", "do", "a", "ár", "bhur", "ní", "níor", "nach"]),
  fi: new Set(["ja", "tai", "vai", "mutta", "että", "koska", "kun", "jos", "kuin", "niin", "se", "hän", "ne", "he", "minä", "sinä", "me", "te", "ei", "on", "ovat", "oli", "jo", "vain", "myös", "koko", "joka"])
};

/**
 * Intelligent Language-Specific Lemmatizer
 */
export class MultilingualLemmatizer {
  /**
   * Normalizes a language identifier (ISO code or English/native name) to one of the 11 supported ISO codes.
   */
  static normalizeLanguageCode(langCode: string): string {
    const raw = (langCode || '').toLowerCase().trim();
    const map: Record<string, string> = {
      de: 'de', german: 'de', deutsch: 'de',
      es: 'es', spanish: 'es', español: 'es', espanol: 'es',
      fr: 'fr', french: 'fr', français: 'fr', francais: 'fr',
      it: 'it', italian: 'it', italiano: 'it',
      pt: 'pt', portuguese: 'pt', português: 'pt', portugues: 'pt',
      ja: 'ja', japanese: 'ja',
      zh: 'zh', chinese: 'zh', mandarin: 'zh',
      ko: 'ko', korean: 'ko',
      ru: 'ru', russian: 'ru',
      ga: 'ga', irish: 'ga', gaeilge: 'ga',
      fi: 'fi', finnish: 'fi', suomi: 'fi'
    };
    return map[raw] || raw;
  }

  /**
   * Identifies the canonical base form (lemma) of an inflected token.
   * Returns { lemma, posGuess, ruleApplied, original }
   */
  static lemmatize(word: string, langCode: string): { lemma: string; posGuess?: string; ruleApplied?: string; original: string } {
    if (!word || typeof word !== 'string') {
      return { lemma: '', original: word };
    }

    const code = this.normalizeLanguageCode(langCode);
    const cleanWord = word.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');
    const original = cleanWord;

    if (!cleanWord || cleanWord.length === 0) {
      return { lemma: '', original };
    }

    // 1. Direct Irregular Table Lookup
    const langIrregulars = IRREGULAR_LEMMAS[code];
    if (langIrregulars && langIrregulars[cleanWord]) {
      return {
        lemma: langIrregulars[cleanWord],
        posGuess: 'irregular',
        ruleApplied: 'irregular_table_match',
        original
      };
    }

    // 2. Language-Specific Morphological Rules
    switch (code) {
      case 'de':
        return this.lemmatizeGerman(cleanWord);
      case 'es':
        return this.lemmatizeSpanish(cleanWord);
      case 'fr':
        return this.lemmatizeFrench(cleanWord);
      case 'it':
        return this.lemmatizeItalian(cleanWord);
      case 'pt':
        return this.lemmatizePortuguese(cleanWord);
      case 'ja':
        return this.lemmatizeJapanese(cleanWord);
      case 'zh':
        return { lemma: cleanWord, original };
      case 'ko':
        return this.lemmatizeKorean(cleanWord);
      case 'ru':
        return this.lemmatizeRussian(cleanWord);
      case 'ga':
        return this.lemmatizeIrish(cleanWord);
      case 'fi':
        return this.lemmatizeFinnish(cleanWord);
      default:
        return { lemma: cleanWord, original };
    }
  }

  // --- GERMAN ---
  private static lemmatizeGerman(word: string) {
    // Past participle ge-...-t -> ...en / ...eln
    if (word.startsWith("ge") && (word.endsWith("t") || word.endsWith("te")) && word.length >= 6) {
      const stem = word.slice(2, word.endsWith("te") ? -2 : -1);
      return { lemma: `${stem}en`, posGuess: 'verb', ruleApplied: 'de_participle_ge_t', original: word };
    }
    // Adjective endings (-em, -en, -er, -es, -e)
    if (word.length >= 6) {
      const adjEndings = ["ende", "enden", "ender", "endes", "etem", "eten", "eter", "etes", "stem", "sten", "ster", "stes", "ere", "erer", "eres", "eren", "erem", "en", "er", "es", "em", "e"];
      for (const end of adjEndings) {
        if (word.endsWith(end) && word.length > end.length + 3) {
          const stem = word.slice(0, -end.length);
          return { lemma: stem, posGuess: 'adj', ruleApplied: `de_adj_${end}`, original: word };
        }
      }
    }
    // Noun plurals with umlaut undoing: Häuser -> Haus, Bücher -> Buch
    if (word.endsWith("er") && word.length >= 5) {
      let stem = word.slice(0, -2);
      stem = stem.replace(/äu/g, "au").replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u");
      return { lemma: stem, posGuess: 'noun', ruleApplied: 'de_noun_plural_er', original: word };
    }
    // Plurals ending in -en / -n
    if (word.endsWith("en") && word.length >= 6) {
      return { lemma: word.slice(0, -2), posGuess: 'noun_or_verb', ruleApplied: 'de_plural_en', original: word };
    }
    // Verb endings (-te, -test, -tet, -ten)
    if (word.endsWith("ten") && word.length >= 6) {
      return { lemma: `${word.slice(0, -3)}en`, posGuess: 'verb', ruleApplied: 'de_past_ten', original: word };
    }
    if (word.endsWith("te") && word.length >= 5) {
      return { lemma: `${word.slice(0, -2)}en`, posGuess: 'verb', ruleApplied: 'de_past_te', original: word };
    }
    return { lemma: word, original: word };
  }

  // --- SPANISH ---
  private static lemmatizeSpanish(word: string) {
    // Verb participles (-ado, -ada, -ados, -adas -> -ar; -ido, -ida, -idos, -idas -> -er/-ir)
    if (word.endsWith("ado") || word.endsWith("ada") || word.endsWith("ados") || word.endsWith("adas")) {
      const base = word.replace(/ad[ao]s?$/, "ar");
      return { lemma: base, posGuess: 'verb', ruleApplied: 'es_participle_ado', original: word };
    }
    if (word.endsWith("ido") || word.endsWith("ida") || word.endsWith("idos") || word.endsWith("idas")) {
      const base = word.replace(/id[ao]s?$/, "er");
      return { lemma: base, posGuess: 'verb', ruleApplied: 'es_participle_ido', original: word };
    }
    // Plurals (-ces -> -z, -es -> root, -s -> root)
    if (word.endsWith("ces") && word.length >= 5) {
      return { lemma: `${word.slice(0, -3)}z`, posGuess: 'noun', ruleApplied: 'es_plural_ces', original: word };
    }
    if (word.endsWith("es") && word.length >= 5 && !/[aeiou]es$/.test(word)) {
      return { lemma: word.slice(0, -2), posGuess: 'noun_or_adj', ruleApplied: 'es_plural_es', original: word };
    }
    if (word.endsWith("s") && word.length >= 4 && /[aeiou]s$/.test(word)) {
      return { lemma: word.slice(0, -1), posGuess: 'noun_or_adj', ruleApplied: 'es_plural_s', original: word };
    }
    return { lemma: word, original: word };
  }

  // --- FRENCH ---
  private static lemmatizeFrench(word: string) {
    // Strip apostrophe elision prefix: l'eau -> eau, d'art -> art, qu'il -> il
    let clean = word;
    if (/^[cldjnstmq]'[a-zàâéèêëîïôùûç]/i.test(word)) {
      clean = word.replace(/^[cldjnstmq]'/i, '');
    }
    // Participles and adjectives (-ées, -ée, -és -> -er)
    if (clean.endsWith("ées") || clean.endsWith("ée") || clean.endsWith("és")) {
      return { lemma: clean.replace(/é[es]?s?$/, "er"), posGuess: 'verb', ruleApplied: 'fr_participle_er', original: word };
    }
    // Plural (-aux -> -al, -eaux -> -eau, -s -> stem)
    if (clean.endsWith("aux") && clean.length >= 5) {
      return { lemma: `${clean.slice(0, -3)}al`, posGuess: 'noun_or_adj', ruleApplied: 'fr_plural_aux', original: word };
    }
    if (clean.endsWith("s") && clean.length >= 4) {
      return { lemma: clean.slice(0, -1), posGuess: 'noun_or_adj', ruleApplied: 'fr_plural_s', original: word };
    }
    return { lemma: clean, original: word };
  }

  // --- ITALIAN ---
  private static lemmatizeItalian(word: string) {
    // Participles (-ato, -ata, -ati, -ate -> -are; -ito, -ita, -iti, -ite -> -ire)
    if (word.endsWith("ato") || word.endsWith("ata") || word.endsWith("ati") || word.endsWith("ate")) {
      return { lemma: word.replace(/at[oaei]$/, "are"), posGuess: 'verb', ruleApplied: 'it_participle_are', original: word };
    }
    if (word.endsWith("ito") || word.endsWith("ita") || word.endsWith("iti") || word.endsWith("ite")) {
      return { lemma: word.replace(/it[oaei]$/, "ire"), posGuess: 'verb', ruleApplied: 'it_participle_ire', original: word };
    }
    // Plurals ending in -i (from -o or -e)
    if (word.endsWith("i") && word.length >= 4) {
      return { lemma: `${word.slice(0, -1)}o`, posGuess: 'noun_or_adj', ruleApplied: 'it_plural_i', original: word };
    }
    if (word.endsWith("e") && word.length >= 4) {
      return { lemma: `${word.slice(0, -1)}a`, posGuess: 'noun_or_adj', ruleApplied: 'it_plural_e', original: word };
    }
    return { lemma: word, original: word };
  }

  // --- PORTUGUESE ---
  private static lemmatizePortuguese(word: string) {
    // Plurals in -ões / -ães / -ãos -> -ão
    if (word.endsWith("ões") || word.endsWith("ães") || word.endsWith("ãos")) {
      return { lemma: word.replace(/(ões|ães|ãos)$/, "ão"), posGuess: 'noun', ruleApplied: 'pt_plural_ao', original: word };
    }
    // Participles (-ado, -ada, -ados, -adas -> -ar)
    if (word.endsWith("ado") || word.endsWith("ada") || word.endsWith("ados") || word.endsWith("adas")) {
      return { lemma: word.replace(/ad[ao]s?$/, "ar"), posGuess: 'verb', ruleApplied: 'pt_participle_ar', original: word };
    }
    if (word.endsWith("ido") || word.endsWith("ida") || word.endsWith("idos") || word.endsWith("idas")) {
      return { lemma: word.replace(/id[ao]s?$/, "er"), posGuess: 'verb', ruleApplied: 'pt_participle_er', original: word };
    }
    return { lemma: word, original: word };
  }

  // --- JAPANESE ---
  private static lemmatizeJapanese(word: string) {
    // Remove politeness and past conjugation endings
    let stem = word;
    if (stem.endsWith("ました")) stem = `${stem.slice(0, -4)}る`;
    else if (stem.endsWith("ません")) stem = `${stem.slice(0, -4)}る`;
    else if (stem.endsWith("ます")) stem = `${stem.slice(0, -2)}る`;
    else if (stem.endsWith("ない")) stem = `${stem.slice(0, -2)}る`;
    else if (stem.endsWith("た") && stem.length >= 3) stem = `${stem.slice(0, -1)}る`;
    else if (stem.endsWith("て") && stem.length >= 3) stem = `${stem.slice(0, -1)}る`;
    return { lemma: stem, original: word };
  }

  // --- KOREAN ---
  private static lemmatizeKorean(word: string) {
    // Strip common grammatical postpositions (particles): -eun, -neun, -i, -ga, -eul, -reul, -eseo
    let stem = word;
    const particles = ["에서는", "에서", "으로", "로", "에게", "부터", "까지", "은", "는", "이", "가", "을", "를", "의", "와", "과", "도", "만"];
    for (const p of particles) {
      if (stem.endsWith(p) && stem.length > p.length + 1) {
        stem = stem.slice(0, -p.length);
        break;
      }
    }
    // Verbal stem conversion: -haessda -> -hada
    if (stem.endsWith("했다")) stem = `${stem.slice(0, -2)}하다`;
    else if (stem.endsWith("한다")) stem = `${stem.slice(0, -2)}하다`;
    else if (stem.endsWith("해요")) stem = `${stem.slice(0, -2)}하다`;
    return { lemma: stem, original: word };
  }

  // --- RUSSIAN ---
  private static lemmatizeRussian(word: string) {
    // Strip case endings (-ами, -ями, -ов, -ев, -ей, -ам, -ям, -ах, -ях, -ом, -ем, -ы, -и, -а, -я, -у, -ю, -е)
    const endings = ["ами", "ями", "ого", "его", "ому", "ему", "ыми", "ими", "ов", "ев", "ей", "ам", "ям", "ах", "ях", "ом", "ем", "ой", "ей", "ую", "юю", "ая", "яя", "ое", "ее", "ые", "ие", "ы", "и", "а", "я", "у", "ю", "е", "о"];
    for (const end of endings) {
      if (word.endsWith(end) && word.length > end.length + 3) {
        return { lemma: word.slice(0, -end.length), posGuess: 'noun_or_adj', ruleApplied: `ru_ending_${end}`, original: word };
      }
    }
    return { lemma: word, original: word };
  }

  // --- IRISH ---
  private static lemmatizeIrish(word: string) {
    let clean = word;
    // Eclipsis (urú): mb- -> b-, gc- -> c-, nd- -> d-, bhf- -> f-, ng- -> g-, bp- -> p-, dt- -> t-
    if (/^mb[aeiouáéíóú]/i.test(clean)) clean = clean.slice(1);
    else if (/^gc[aeiouáéíóú]/i.test(clean)) clean = clean.slice(1);
    else if (/^nd[aeiouáéíóú]/i.test(clean)) clean = clean.slice(1);
    else if (/^bhf[aeiouáéíóú]/i.test(clean)) clean = `f${clean.slice(3)}`;
    else if (/^ng[aeiouáéíóú]/i.test(clean)) clean = clean.slice(1);
    else if (/^bp[aeiouáéíóú]/i.test(clean)) clean = clean.slice(1);
    else if (/^dt[aeiouáéíóú]/i.test(clean)) clean = clean.slice(1);
    // Lenition (séimhiú): bh- -> b-, ch- -> c-, dh- -> d-, fh- -> f-, gh- -> g-, mh- -> m-, ph- -> p-, sh- -> s-, th- -> t-
    else if (/^[bcdfgmpst]h[aeiouáéíóú]/i.test(clean)) {
      clean = `${clean[0]}${clean.slice(2)}`;
    }
    return { lemma: clean, original: word };
  }

  // --- FINNISH ---
  private static lemmatizeFinnish(word: string) {
    // Strip agglutinative locative / grammatical case endings:
    // -ssa/-ssä (inessive), -sta/-stä (elative), -lle (allative), -lla/-llä (adessive), -lta/-ltä (ablative), -ksi (translative), -in (instructive)
    const caseEndings = ["ssamme", "ssänne", "stamme", "stänne", "llamme", "llänne", "ssa", "ssä", "sta", "stä", "lle", "lla", "llä", "lta", "ltä", "ksi", "tta", "ttä", "ina", "inä", "in", "en", "an", "en", "in", "on", "un"];
    for (const end of caseEndings) {
      if (word.endsWith(end) && word.length > end.length + 3) {
        return { lemma: word.slice(0, -end.length), posGuess: 'noun_or_adj', ruleApplied: `fi_case_${end}`, original: word };
      }
    }
    return { lemma: word, original: word };
  }

  /**
   * Generates a prioritized list of all plausible morphological base-form candidates
   * for a given surface token so dictionary lookups can resolve conjugated verbs,
   * plural/declined nouns, inflected adjectives, umlaut shifts, and adverbs.
   */
  static getCandidateLemmas(word: string, langCode: string): string[] {
    if (!word || typeof word !== 'string') return [];
    const code = this.normalizeLanguageCode(langCode);
    const cleanWord = word.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');
    if (!cleanWord) return [];

    const candidates = new Set<string>();
    const add = (w?: string) => {
      if (w && w.length >= (code === 'zh' || code === 'ja' ? 1 : 2)) {
        candidates.add(w.toLowerCase().trim());
      }
    };

    add(cleanWord);
    const primary = this.lemmatize(cleanWord, code);
    add(primary.lemma);

    const langIrregulars = IRREGULAR_LEMMAS[code];
    if (langIrregulars && langIrregulars[cleanWord]) {
      add(langIrregulars[cleanWord]);
    }

    const deUmlaut = (s: string) =>
      s.replace(/äu/g, 'au').replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u');

    if (code === 'de') {
      // Past participles with ge- prefix or separable verb -ge- infix
      if (cleanWord.startsWith('ge') && cleanWord.length >= 6) {
        if (cleanWord.endsWith('t') || cleanWord.endsWith('te') || cleanWord.endsWith('ten')) {
          const stem = cleanWord.replace(/^ge/, '').replace(/(ten|te|t)$/, '');
          add(`${stem}en`);
          add(`${stem}n`);
          add(stem);
        } else if (cleanWord.endsWith('en')) {
          const stem = cleanWord.slice(2);
          add(stem);
          add(deUmlaut(stem));
        }
      }
      const geInfixMatch = cleanWord.match(/^([a-zäöüß]{2,6})ge([a-zäöüß]{3,})(t|en)$/);
      if (geInfixMatch) {
        const prefix = geInfixMatch[1];
        const verbRoot = geInfixMatch[2];
        add(`${prefix}${verbRoot}en`);
        add(`${verbRoot}en`);
        add(verbRoot);
      }

      // Common German inflectional endings (adjective, noun plural/case, verb conjugation)
      const endings = ['innen', 'ungen', 'keiten', 'heiten', 'schaften', 'end', 'ende', 'enden', 'ender', 'endes', 'sten', 'ster', 'stes', 'stem', 'eren', 'erer', 'eres', 'erem', 'ere', 'test', 'tet', 'ten', 'te', 'est', 'st', 'ern', 'en', 'er', 'es', 'em', 'e', 'n', 's', 't'];
      for (const end of endings) {
        if (cleanWord.endsWith(end) && cleanWord.length - end.length >= 3) {
          const stem = cleanWord.slice(0, -end.length);
          add(stem);
          add(`${stem}e`);
          add(`${stem}en`);
          add(`${stem}n`);
          const unumlauted = deUmlaut(stem);
          if (unumlauted !== stem) {
            add(unumlauted);
            add(`${unumlauted}e`);
            add(`${unumlauted}en`);
          }
        }
      }
      // Feminine agent/plural -in -> base
      if (cleanWord.endsWith('in') && cleanWord.length >= 5) {
        add(cleanWord.slice(0, -2));
      }
    } else if (code === 'es' || code === 'pt' || code === 'it' || code === 'fr') {
      let base = cleanWord;
      if (code === 'fr' && /^[cldjnstmq]'/i.test(base)) {
        base = base.replace(/^[cldjnstmq]'/i, '');
        add(base);
      }

      // Adverbs in -mente / -ment
      if (base.endsWith('mente') && base.length >= 8) {
        const adjStem = base.slice(0, -5);
        add(adjStem);
        add(`${adjStem}o`);
        add(`${adjStem}e`);
      } else if (code === 'fr' && base.endsWith('ment') && base.length >= 7) {
        const adjStem = base.slice(0, -4);
        add(adjStem);
        if (adjStem.endsWith('euse')) add(`${adjStem.slice(0, -4)}eux`);
      }

      // Plural & gender variations
      if (base.endsWith('ciones') && base.length >= 8) add(`${base.slice(0, -6)}ción`);
      if (base.endsWith('siones') && base.length >= 8) add(`${base.slice(0, -6)}sión`);
      if (base.endsWith('ções') && base.length >= 6) add(`${base.slice(0, -4)}ção`);
      if (base.endsWith('sões') && base.length >= 6) add(`${base.slice(0, -4)}são`);
      if (base.endsWith('ces') && base.length >= 5) add(`${base.slice(0, -3)}z`);
      if (base.endsWith('aux') && base.length >= 5) add(`${base.slice(0, -3)}al`);
      if (base.endsWith('eaux') && base.length >= 5) add(base.slice(0, -1));

      const romanceEndings = [
        'ábamos', 'áremos', 'aremos', 'eremos', 'iremos', 'arían', 'erían', 'irían',
        'ندو', 'ando', 'iendo', 'endo', 'indo', 'ados', 'adas', 'ado', 'ada', 'idos', 'idas', 'ido', 'ida',
        'atos', 'atas', 'ato', 'ata', 'ati', 'ate', 'itos', 'itas', 'ito', 'ita', 'iti', 'ite', 'uti', 'ute', 'uto', 'uta',
        'aient', 'issaient', 'issent', 'issons', 'issez', 'eront', 'iront', 'ront', 'erait', 'irait',
        'aban', 'aba', 'ían', 'ía', 'aron', 'ieron', 'arán', 'erán', 'irán', 'ará', 'erá', 'irá',
        'avam', 'ava', 'iam', 'aram', 'eram', 'iram', 'arão', 'erão', 'irão',
        'avano', 'ava', 'evano', 'eva', 'ivano', 'iva', 'arono', 'erono', 'irono', 'eranno', 'iranno',
        'amos', 'emos', 'imos', 'iamo', 'ions', 'iez', 'ons', 'ez', 'ent', 'ant',
        'ées', 'ée', 'és', 'é', 'es', 'as', 'os', 'is', 'us', 'a', 'e', 'i', 'o', 's', 't'
      ];
      for (const end of romanceEndings) {
        if (base.endsWith(end) && base.length - end.length >= 3) {
          const stem = base.slice(0, -end.length);
          add(stem);
          add(`${stem}o`);
          add(`${stem}a`);
          add(`${stem}e`);
          if (code === 'es' || code === 'pt') {
            add(`${stem}ar`);
            add(`${stem}er`);
            add(`${stem}ir`);
          } else if (code === 'fr') {
            add(`${stem}er`);
            add(`${stem}ir`);
            add(`${stem}re`);
          } else if (code === 'it') {
            add(`${stem}are`);
            add(`${stem}ere`);
            add(`${stem}ire`);
          }
        }
      }
    } else if (code === 'ru') {
      const ruEndings = [
        'аться', 'яться', 'ться', 'тся', 'ами', 'ями', 'ого', 'его', 'ому', 'ему', 'ыми', 'ими',
        'ешь', 'ете', 'ишь', 'ите', 'ют', 'ут', 'ят', 'ат', 'ет', 'ит', 'ли', 'ла', 'ло', 'л',
        'ов', 'ев', 'ей', 'ам', 'ям', 'ах', 'ях', 'ом', 'ем', 'ой', 'ую', 'юю', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие',
        'ы', 'и', 'а', 'я', 'у', 'ю', 'е', 'о', 'ь'
      ];
      for (const end of ruEndings) {
        if (cleanWord.endsWith(end) && cleanWord.length - end.length >= 3) {
          const stem = cleanWord.slice(0, -end.length);
          add(stem);
          add(`${stem}ть`);
          add(`${stem}ти`);
          add(`${stem}ать`);
          add(`${stem}ить`);
          add(`${stem}еть`);
          add(`${stem}ый`);
          add(`${stem}ий`);
          add(`${stem}ой`);
          add(`${stem}а`);
          add(`${stem}о`);
          add(`${stem}я`);
          add(`${stem}е`);
          add(`${stem}ь`);
        }
      }
    } else if (code === 'fi') {
      const fiEndings = [
        'ssamme', 'ssänne', 'stamme', 'stänne', 'llamme', 'llänne', 'ineen', 'nsa', 'nsä',
        'ssa', 'ssä', 'sta', 'stä', 'lle', 'lla', 'llä', 'lta', 'ltä', 'ksi', 'tta', 'ttä',
        'mme', 'nne', 'vat', 'vät', 'nut', 'nyt', 'neet', 'tiin', 'ttiin', 'taan', 'tään',
        'ojen', 'iden', 'itten', 'ien', 'jen', 'ten', 'ita', 'itä', 'ja', 'jä', 'ta', 'tä',
        'na', 'nä', 'in', 'en', 'an', 'än', 'on', 'ön', 'un', 'yn', 'ni', 'si', 't', 'n', 'a', 'ä'
      ];
      for (const end of fiEndings) {
        if (cleanWord.endsWith(end) && cleanWord.length - end.length >= 3) {
          const stem = cleanWord.slice(0, -end.length);
          add(stem);
          add(`${stem}a`);
          add(`${stem}ä`);
          add(`${stem}i`);
          add(`${stem}e`);
          add(`${stem}o`);
          add(`${stem}u`);
          if (stem.endsWith('se')) {
            add(`${stem.slice(0, -2)}nen`);
          }
        }
      }
    } else if (code === 'ko') {
      const koEndings = [
        '으로부터', '에서부터', '에서는', '에게는', '으로써', '로써', '습니다', 'ㅂ니다', '입니다',
        '았어요', '었어요', '였어요', '했어요', '아요', '어요', '여요', '해요',
        '았다', '었다', '였다', '했다', '하는', '하고', '하며', '하면', '지만', '는데',
        '으로', '에서', '에게', '부터', '까지', '처럼', '보다', '마다',
        '들', '은', '는', '이', '가', '을', '를', '의', '와', '과', '도', '만', '로', '에', '고', '며', '면'
      ];
      for (const end of koEndings) {
        if (cleanWord.endsWith(end) && cleanWord.length - end.length >= 1) {
          const stem = cleanWord.slice(0, -end.length);
          add(stem);
          add(`${stem}다`);
          add(`${stem}하다`);
        }
      }
    } else if (code === 'ja') {
      const jaEndings = [
        'ませんでした', 'ていました', 'ています', 'ました', 'ません', 'ている', 'ていた',
        'なかった', 'なければ', 'られる', 'させる', 'れます', 'せます', 'ます', 'たい', 'ない',
        'かった', 'くて', 'って', 'んで', 'いて', 'いで', 'して', 'った', 'んだ', 'いた', 'いだ', 'した',
        'て', 'た', 'る', 'い', 'な', 'に'
      ];
      for (const end of jaEndings) {
        if (cleanWord.endsWith(end) && cleanWord.length - end.length >= 1) {
          const stem = cleanWord.slice(0, -end.length);
          add(stem);
          add(`${stem}る`);
          add(`${stem}う`);
          add(`${stem}く`);
          add(`${stem}す`);
          add(`${stem}つ`);
          add(`${stem}ぬ`);
          add(`${stem}む`);
          add(`${stem}い`);
          add(`${stem}する`);
        }
      }
    } else if (code === 'ga') {
      const base = this.lemmatizeIrish(cleanWord).lemma;
      add(base);
      const gaEndings = ['aíonn', 'íonn', 'eann', 'ann', 'fidh', 'faidh', 'acha', 'anna', 'tha', 'the', 'adh', 'eadh'];
      for (const end of gaEndings) {
        if (base.endsWith(end) && base.length - end.length >= 3) {
          add(base.slice(0, -end.length));
        }
      }
    }

    return Array.from(candidates);
  }

  /**
   * Checks whether a token is a high-frequency trivial stopword.
   */
  static isStopword(word: string, langCode: string): boolean {
    if (!word) return true;
    const code = this.normalizeLanguageCode(langCode);
    const clean = word.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');
    if (!clean || clean.length <= 1) return true;
    const langSet = COMMON_STOPWORDS[code];
    if (langSet && langSet.has(clean)) return true;
    return false;
  }

  /**
   * Tokenizes an authentic reading passage into word candidates with their host sentence
   * and relative position ratio (0.0 to 1.0) across the passage.
   */
  static tokenizePassage(
    passage: string,
    langCode: string
  ): Array<{ original: string; clean: string; sentence: string; positionRatio: number }> {
    if (!passage || typeof passage !== 'string') return [];

    const code = this.normalizeLanguageCode(langCode);

    // Split passage into sentences
    const sentenceDelimiters = /([.!?。！？\n]+)/;
    const rawSentences = passage.split(sentenceDelimiters);
    const sentences: string[] = [];
    for (let i = 0; i < rawSentences.length; i += 2) {
      const sent = ((rawSentences[i] || '') + (rawSentences[i + 1] || '')).trim();
      if (sent.length > 0) sentences.push(sent);
    }

    const results: Array<{ original: string; clean: string; sentence: string; positionRatio: number }> = [];
    const seen = new Set<string>();

    const isCjk = code === 'zh' || code === 'ja';
    const totalSentences = Math.max(1, sentences.length);

    sentences.forEach((sentence, sIdx) => {
      const positionRatio = totalSentences <= 1 ? 0 : sIdx / (totalSentences - 1);

      if (isCjk) {
        // CJK text segmentation: extract 2-4 character segments
        const cleanChars = sentence.replace(/[.,!?:;()„“"»«[\]/|\\—–\s。！？、]/g, '');
        for (let i = 0; i < cleanChars.length; i++) {
          for (let len = 4; len >= 2; len--) {
            if (i + len <= cleanChars.length) {
              const seg = cleanChars.substring(i, i + len);
              const key = seg.toLowerCase();
              if (!seen.has(key) && !this.isStopword(key, langCode)) {
                seen.add(key);
                results.push({ original: seg, clean: key, sentence, positionRatio });
              }
            }
          }
        }
      } else {
        // Spaced languages
        const words = sentence.split(/[\s,.;:!?()„“"»«[\]/|\\—–-]+/);
        words.forEach(rawWord => {
          const clean = rawWord.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–]/g, '');
          if (clean.length > 1 && !this.isStopword(clean, langCode) && !seen.has(clean)) {
            seen.add(clean);
            results.push({ original: rawWord, clean, sentence, positionRatio });
          }
        });
      }
    });

    return results;
  }
}


