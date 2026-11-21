import { VocabularyWord, VocabularyExercise, VocabularyExerciseType, LanguageLevel } from '../types';
import { AiService } from './AiService';
import { StorageService } from './StorageService';
import { SUPPORTED_LANGUAGES } from '../config/languages';
import { NATIVE_LANGUAGE_NAMES } from './LocalizationService';
import { MULTILINGUAL_DICTIONARY } from '../data/reading/dictionary';
import { MultilingualLemmatizer } from './dictionary/lemmatizer';
import { loadLexiconModule } from './dictionary/lexicons';
import { LexiconModule } from './dictionary/types';

const STORAGE_KEY = 'deutschbuddy_vocabulary_exercises';

// Common English words (stop words + core A1-C1 gloss vocabulary) for deterministic English detection
const COMMON_ENGLISH_WORDS = new Set([
  // Function words, articles, pronouns, prepositions, auxiliaries
  'a', 'an', 'the', 'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'from', 'into', 'onto',
  'upon', 'out', 'up', 'down', 'off', 'over', 'under', 'above', 'below', 'between', 'among',
  'through', 'during', 'before', 'after', 'since', 'until', 'while', 'about', 'against',
  'without', 'within', 'along', 'across', 'behind', 'beyond', 'near', 'towards', 'toward',
  'and', 'or', 'but', 'nor', 'so', 'yet', 'if', 'because', 'although', 'though', 'unless',
  'whether', 'while', 'where', 'when', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'its', 'our', 'their', 'mine', 'yours', 'hers', 'ours', 'theirs',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves', 'oneself',
  'this', 'that', 'these', 'those', 'such', 'some', 'any', 'no', 'not', 'none', 'nothing',
  'something', 'anything', 'everything', 'someone', 'anyone', 'everyone', 'nobody', 'somebody',
  'each', 'every', 'either', 'neither', 'both', 'all', 'many', 'much', 'more', 'most',
  'few', 'fewer', 'little', 'less', 'least', 'several', 'enough', 'other', 'another',
  'be', 'am', 'is', 'are', 'was', 'were', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'done',
  'can', 'could', 'will', 'would', 'shall', 'should', 'may', 'might', 'must',
  // High-frequency English nouns, verbs, adjectives, and adverbs that commonly appear as single-word glosses
  'house', 'home', 'building', 'apartment', 'room', 'door', 'window', 'wall', 'floor', 'roof',
  'table', 'chair', 'bed', 'kitchen', 'bathroom', 'garden', 'street', 'road', 'way', 'path',
  'city', 'town', 'village', 'country', 'world', 'earth', 'land', 'place', 'area', 'space',
  'school', 'university', 'college', 'class', 'lesson', 'course', 'study', 'studies', 'student',
  'teacher', 'professor', 'education', 'knowledge', 'science', 'research', 'book', 'page',
  'word', 'sentence', 'language', 'letter', 'text', 'story', 'history', 'article', 'newspaper',
  'work', 'job', 'profession', 'career', 'office', 'company', 'business', 'economy', 'market',
  'money', 'price', 'cost', 'value', 'bank', 'shop', 'store', 'customer', 'colleague',
  'person', 'people', 'human', 'man', 'men', 'woman', 'women', 'child', 'children', 'boy', 'girl',
  'baby', 'family', 'parent', 'parents', 'father', 'mother', 'son', 'daughter', 'brother', 'sister',
  'friend', 'friends', 'partner', 'neighbor', 'guest', 'doctor', 'patient',
  'day', 'night', 'morning', 'afternoon', 'evening', 'today', 'tomorrow', 'yesterday',
  'week', 'weekend', 'month', 'year', 'time', 'hour', 'minute', 'second', 'moment',
  'past', 'present', 'future', 'season', 'spring', 'summer', 'autumn', 'fall', 'winter',
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
  'water', 'food', 'bread', 'butter', 'cheese', 'jam', 'milk', 'coffee', 'tea', 'juice',
  'meat', 'fish', 'fruit', 'vegetables', 'vegetable', 'meal', 'breakfast', 'lunch', 'dinner',
  'sun', 'moon', 'sky', 'star', 'cloud', 'rain', 'snow', 'wind', 'storm', 'weather',
  'nature', 'environment', 'forest', 'tree', 'flower', 'plant', 'mountain', 'hill', 'valley',
  'river', 'lake', 'sea', 'ocean', 'beach', 'island', 'animal', 'dog', 'cat', 'bird',
  'car', 'bus', 'train', 'bicycle', 'bike', 'airplane', 'plane', 'flight', 'ship', 'boat',
  'station', 'airport', 'ticket', 'trip', 'journey', 'travel', 'vacation', 'holiday',
  'body', 'head', 'face', 'eye', 'eyes', 'ear', 'nose', 'mouth', 'hand', 'hands', 'arm', 'leg', 'foot', 'heart', 'mind', 'spirit',
  'health', 'healthy', 'nutrition', 'diet', 'movement', 'exercise', 'sleep', 'rest', 'recovery',
  'relaxation', 'habit', 'prevention', 'healthcare', 'medicine', 'illness', 'disease', 'pain',
  'life', 'death', 'love', 'peace', 'war', 'freedom', 'law', 'right', 'rights', 'politics', 'society', 'culture',
  'music', 'art', 'movie', 'film', 'game', 'sport', 'picture', 'photo', 'color', 'light', 'sound', 'voice',
  'problem', 'solution', 'question', 'answer', 'reason', 'cause', 'result', 'effect', 'goal', 'target',
  'success', 'failure', 'chance', 'opportunity', 'challenge', 'change', 'development', 'progress',
  'experience', 'example', 'fact', 'truth', 'idea', 'thought', 'opinion', 'feeling', 'sense',
  'part', 'side', 'end', 'beginning', 'start', 'middle', 'top', 'bottom', 'front', 'back',
  'thing', 'object', 'matter', 'kind', 'type', 'sort', 'form', 'system', 'group', 'number', 'amount',
  'power', 'electricity', 'technology', 'computer', 'phone', 'internet', 'network', 'data',
  'nonsense', 'rubbish', 'folks', 'guys', 'awesome', 'cool', 'great', 'nice', 'fine', 'okay',
  // Common English verbs (base, past, participle)
  'go', 'goes', 'went', 'gone', 'going', 'walk', 'walked', 'walking', 'stroll',
  'come', 'comes', 'came', 'coming', 'arrive', 'arrived',
  'see', 'sees', 'saw', 'seen', 'seeing', 'look', 'looked', 'looking', 'watch', 'watched',
  'give', 'gives', 'gave', 'given', 'giving', 'take', 'takes', 'took', 'taken', 'taking',
  'speak', 'speaks', 'spoke', 'spoken', 'speaking', 'talk', 'talked', 'talking', 'say', 'said', 'tell', 'told',
  'find', 'finds', 'found', 'finding', 'stay', 'stayed', 'remain', 'remained',
  'stand', 'stood', 'lie', 'lay', 'sit', 'sat', 'know', 'knew', 'known', 'think', 'thought',
  'bring', 'brought', 'drive', 'drove', 'driven', 'ride', 'rode', 'fly', 'flew', 'flown',
  'eat', 'ate', 'eaten', 'drink', 'drank', 'drunk', 'sleep', 'slept',
  'write', 'wrote', 'written', 'read', 'reading', 'help', 'helped', 'assist',
  'understand', 'understood', 'learn', 'learned', 'learnt', 'study', 'studied',
  'live', 'lived', 'reside', 'worked', 'working', 'develop', 'developed',
  'reach', 'reached', 'achieve', 'achieved', 'decide', 'decided', 'improve', 'improved',
  'use', 'used', 'utilize', 'discover', 'discovered', 'protect', 'protected', 'promote', 'foster',
  'make', 'made', 'making', 'get', 'got', 'gotten', 'getting', 'put', 'keep', 'kept',
  'let', 'begin', 'began', 'begun', 'seem', 'seemed', 'turn', 'turned', 'show', 'showed', 'shown',
  'hear', 'heard', 'play', 'played', 'run', 'ran', 'move', 'moved', 'like', 'liked',
  'believe', 'believed', 'hold', 'held', 'happen', 'happened', 'provide', 'provided',
  'lose', 'lost', 'pay', 'paid', 'meet', 'met', 'include', 'included', 'continue', 'continued',
  'change', 'changed', 'lead', 'led', 'follow', 'followed', 'stop', 'stopped', 'create', 'created',
  'allow', 'allowed', 'add', 'added', 'spend', 'spent', 'grow', 'grew', 'grown',
  'open', 'opened', 'win', 'won', 'offer', 'offered', 'remember', 'remembered',
  'consider', 'considered', 'appear', 'appeared', 'buy', 'bought', 'wait', 'waited',
  'serve', 'served', 'send', 'sent', 'expect', 'expected', 'build', 'built', 'fall', 'fell', 'fallen',
  'cut', 'reach', 'sell', 'sold', 'require', 'required', 'report', 'reported', 'try', 'tried', 'need', 'needed', 'feel', 'felt',
  // Common English adjectives & adverbs
  'good', 'better', 'best', 'bad', 'worse', 'worst', 'new', 'old', 'young',
  'big', 'small', 'large', 'little', 'great', 'high', 'low', 'long', 'short',
  'full', 'empty', 'easy', 'hard', 'difficult', 'simple', 'complex', 'important', 'necessary',
  'possible', 'impossible', 'different', 'same', 'similar', 'available', 'likely', 'sure', 'certain',
  'free', 'clear', 'true', 'false', 'right', 'wrong', 'real', 'strong', 'weak', 'fast', 'slow',
  'early', 'late', 'warm', 'hot', 'cold', 'cool', 'fresh', 'sweet', 'bitter', 'sour', 'salty',
  'clean', 'dirty', 'beautiful', 'pretty', 'ugly', 'happy', 'glad', 'sad', 'angry', 'afraid',
  'tired', 'hungry', 'thirsty', 'sick', 'ill', 'rich', 'poor', 'expensive', 'cheap',
  'quiet', 'calm', 'loud', 'noisy', 'bright', 'dark', 'heavy', 'light', 'soft', 'deep', 'wide', 'narrow',
  'balanced', 'renewable', 'sustainable', 'modern', 'ancient', 'traditional', 'daily', 'weekly', 'monthly',
  'always', 'never', 'often', 'sometimes', 'usually', 'rarely', 'already', 'still', 'yet',
  'again', 'together', 'alone', 'almost', 'nearly', 'quite', 'very', 'really', 'too', 'also',
  'only', 'just', 'even', 'now', 'then', 'here', 'there', 'everywhere', 'nowhere',
  'away', 'forward', 'inside', 'outside', 'maybe', 'perhaps', 'however', 'therefore', 'suddenly', 'quickly', 'slowly'
]);

// Target-language function words (articles, pronouns, prepositions, conjunctions)
const TARGET_FUNCTION_WORDS: Record<string, Set<string>> = {
  de: new Set([
    'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
    'kein', 'keine', 'keinen', 'keinem', 'keiner', 'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr',
    'mich', 'dich', 'sich', 'uns', 'euch', 'mir', 'dir', 'ihm', 'ihnen', 'mein', 'dein', 'sein',
    'unser', 'euer', 'und', 'oder', 'aber', 'denn', 'sondern', 'weil', 'dass', 'wenn', 'als',
    'ob', 'obwohl', 'während', 'bevor', 'nachdem', 'seit', 'bis', 'damit', 'um', 'ohne', 'statt',
    'nicht', 'nichts', 'nie', 'niemals', 'immer', 'oft', 'manchmal', 'schon', 'noch', 'wieder',
    'sehr', 'viel', 'viele', 'mehr', 'wenig', 'ganz', 'gar', 'auch', 'nur', 'schon', 'jetzt',
    'heute', 'morgen', 'gestern', 'hier', 'dort', 'da', 'wo', 'wie', 'was', 'wer', 'wen', 'wem', 'warum', 'weshalb', 'wohin', 'woher',
    'mit', 'nach', 'bei', 'von', 'zu', 'zur', 'zum', 'aus', 'durch', 'für', 'gegen', 'auf', 'über', 'unter', 'vor', 'hinter', 'neben', 'zwischen',
    'ist', 'sind', 'war', 'waren', 'hat', 'haben', 'hatte', 'hatten', 'wird', 'werden', 'wurde', 'wurden', 'kann', 'muss', 'soll', 'will', 'darf', 'mag', 'möchte'
  ]),
  es: new Set(['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'yo', 'tú', 'tu', 'él', 'ella', 'nosotros', 'ellos', 'ellas', 'que', 'de', 'en', 'con', 'por', 'para', 'sin', 'sobre', 'pero', 'como', 'muy', 'más', 'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'es', 'son', 'está', 'están']),
  fr: new Set(['le', 'la', 'les', 'un', 'une', 'des', 'du', 'au', 'aux', 'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles', 'ce', 'cette', 'ces', 'mon', 'ton', 'son', 'notre', 'votre', 'leur', 'et', 'ou', 'mais', 'donc', 'car', 'que', 'qui', 'dans', 'sur', 'sous', 'avec', 'sans', 'pour', 'par', 'est', 'sont', 'être', 'avoir']),
  it: new Set(['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'io', 'tu', 'lui', 'lei', 'noi', 'voi', 'loro', 'che', 'di', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'ma', 'ed', 'non', 'più', 'questo', 'questa', 'sono', 'è', 'avere', 'essere']),
  pt: new Set(['o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'eu', 'tu', 'ele', 'ela', 'nós', 'vocês', 'eles', 'elas', 'que', 'de', 'em', 'com', 'por', 'para', 'sem', 'mas', 'como', 'muito', 'mais', 'este', 'esta', 'esse', 'essa', 'é', 'são'])
};

export class VocabularyService {
  // In-memory cache of loaded LexiconModules per language for synchronous normalization once loaded
  private static loadedLexicons = new Map<string, { targetSet: Set<string>; englishSet: Set<string> }>();

  private static resolveLangCode(languageCode?: string): string {
    const raw = (languageCode || 'de').toLowerCase().trim();
    if (!raw) return 'de';
    const match = SUPPORTED_LANGUAGES.find(
      l => l.code.toLowerCase() === raw || l.name.toLowerCase() === raw
    );
    return match ? match.code.toLowerCase() : raw;
  }

  /**
   * Builds and caches fast O(1) lookup sets for Target Language vs English from both
   * MULTILINGUAL_DICTIONARY and any dynamically loaded LexiconModule.
   */
  private static getSyncLanguageSets(languageCode: string): { targetSet: Set<string>; englishSet: Set<string> } {
    const code = this.resolveLangCode(languageCode);
    if (this.loadedLexicons.has(code)) {
      return this.loadedLexicons.get(code)!;
    }

    const targetSet = new Set<string>();
    const englishSet = new Set<string>();

    const dict = MULTILINGUAL_DICTIONARY[code] || MULTILINGUAL_DICTIONARY['de'] || {};
    for (const [foreignKey, englishVal] of Object.entries(dict)) {
      const cleanForeign = foreignKey.toLowerCase().trim();
      if (cleanForeign) targetSet.add(cleanForeign);

      const cleanEng = englishVal.toLowerCase().trim();
      if (cleanEng) {
        englishSet.add(cleanEng);
        cleanEng.split(/\s*\/\s*|\s*,\s*|\s*;\s*/).forEach(part => {
          const p = part.trim();
          if (p) {
            englishSet.add(p);
            if (p.startsWith('to ') && p.length > 3) {
              englishSet.add(p.slice(3).trim());
            }
          }
        });
      }
    }

    const sets = { targetSet, englishSet };
    this.loadedLexicons.set(code, sets);
    return sets;
  }

  /**
   * Ensures the full LexiconModule for a language (with lemmas, irregularForms, and translations)
   * is merged into the synchronous lookup sets.
   */
  static async ensureLexiconLoaded(languageCode: string): Promise<void> {
    const code = this.resolveLangCode(languageCode);
    const sets = this.getSyncLanguageSets(code);
    const lexicon: LexiconModule | null = await loadLexiconModule(code);
    if (lexicon && Array.isArray(lexicon.entries)) {
      for (const entry of lexicon.entries) {
        if (entry.lemma) {
          sets.targetSet.add(entry.lemma.toLowerCase().trim());
        }
        if (Array.isArray(entry.irregularForms)) {
          entry.irregularForms.forEach(form => {
            if (form) sets.targetSet.add(form.toLowerCase().trim());
          });
        }
        if (Array.isArray(entry.translations)) {
          entry.translations.forEach(tr => {
            const cleanTr = (tr || '').toLowerCase().trim();
            if (cleanTr) {
              sets.englishSet.add(cleanTr);
              if (cleanTr.startsWith('to ') && cleanTr.length > 3) {
                sets.englishSet.add(cleanTr.slice(3).trim());
              }
            }
          });
        }
      }
    }
  }

  /**
   * Computes a positive score when `text` is English and a negative score when `text`
   * belongs to the target language (`languageCode`).
   */
  static scoreAsEnglish(text: string, languageCode: string = 'de'): number {
    if (!text || typeof text !== 'string') return 0;
    const raw = text.trim();
    if (!raw) return 0;

    const code = this.resolveLangCode(languageCode);
    const lower = raw.toLowerCase();
    const { targetSet, englishSet } = this.getSyncLanguageSets(code);

    let score = 0;

    // 1. Check Reading passage "lemma (inflectedWord)" pattern, e.g., "gehen (ging)"
    const parenMatch = raw.match(/^([^\s()]+)\s+\(([^\s()]+)\)$/);
    if (parenMatch) {
      const outer = parenMatch[1].toLowerCase().replace(/[.,!?:;"'„“»«]/g, '');
      const inner = parenMatch[2].toLowerCase().replace(/[.,!?:;"'„“»«]/g, '');
      const lemmaRes = MultilingualLemmatizer.lemmatize(inner, code);
      if (
        targetSet.has(outer) ||
        targetSet.has(inner) ||
        (lemmaRes.lemma && lemmaRes.lemma.toLowerCase() === outer && lemmaRes.ruleApplied && lemmaRes.ruleApplied !== 'identity')
      ) {
        return -100; // Definitively Target Language in "lemma (clickedWord)" format
      }
    }

    // Strip optional parenthetical suffix for base token lookup
    const baseClean = lower
      .replace(/\s*\([^)]*\)\s*/g, ' ')
      .replace(/[.,!?:;()[\]{}"'„“»«—–]/g, ' ')
      .trim();

    // 2. Non-ASCII script / diacritics check (umlauts, accents, Cyrillic, CJK, Hangul)
    const hasTargetDiacriticsOrScript =
      /[äöüßÄÖÜéàèùâêîôûëïü¡¿ñáéíóúãõçÉÀÈÙÂÊÎÔÛËÏÁÉÍÓÚÃÕÇ]/.test(raw) ||
      /[\u0400-\u04FF\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af\u1100-\u11ff]/.test(raw);
    if (hasTargetDiacriticsOrScript) {
      score -= 80;
    }

    // 3. Direct dictionary / lexicon whole-string lookup
    const isExactTarget = targetSet.has(lower) || targetSet.has(baseClean);
    const isExactEnglish = englishSet.has(lower) || englishSet.has(baseClean);

    if (isExactTarget && !isExactEnglish) {
      score -= 65;
    } else if (isExactEnglish && !isExactTarget) {
      score += 65;
    }

    // 4. Check morphological lemmatizer on single token
    const tokens = baseClean.split(/\s+/).filter(Boolean);
    if (tokens.length === 1) {
      const tok = tokens[0];
      const lemmaRes = MultilingualLemmatizer.lemmatize(tok, code);
      if (lemmaRes.lemma) {
        const cleanLemma = lemmaRes.lemma.toLowerCase();
        if (targetSet.has(cleanLemma) && !englishSet.has(tok) && !COMMON_ENGLISH_WORDS.has(tok)) {
          score -= 55;
        } else if (lemmaRes.ruleApplied && lemmaRes.ruleApplied !== 'identity' && !COMMON_ENGLISH_WORDS.has(tok)) {
          score -= 35;
        }
      }
    }

    // 5. English structural patterns ("to <verb>", slash-separated English glosses)
    if (/^to\s+[a-z]{2,}/i.test(raw)) {
      score += 45;
    }
    if (raw.includes('/')) {
      const slashParts = baseClean.split('/').map(s => s.trim()).filter(Boolean);
      if (slashParts.some(p => COMMON_ENGLISH_WORDS.has(p) || englishSet.has(p))) {
        score += 40;
      }
    }

    // 6. Token-level membership in COMMON_ENGLISH_WORDS vs TARGET_FUNCTION_WORDS
    const targetFuncSet = TARGET_FUNCTION_WORDS[code] || TARGET_FUNCTION_WORDS['de'];
    for (const tok of tokens) {
      const targetHits = targetFuncSet.has(tok) || (targetSet.has(tok) && !COMMON_ENGLISH_WORDS.has(tok));
      const englishHits = COMMON_ENGLISH_WORDS.has(tok) || (englishSet.has(tok) && !targetSet.has(tok));

      if (englishHits && !targetHits) {
        score += 25;
      } else if (targetHits && !englishHits) {
        score -= 25;
      }
    }

    // 7. Language-specific morphological cues (without false-positive 'ch'/'ing'/'tion' English rules)
    if (code === 'de' && tokens.length === 1) {
      const tok = tokens[0];
      if (!COMMON_ENGLISH_WORDS.has(tok) && !englishSet.has(tok)) {
        // Classic German suffixes & prefixes
        if (
          /^(ge[a-z]{3,}(t|en)|be[a-z]{3,}|ver[a-z]{3,}|ent[a-z]{3,}|zer[a-z]{3,}|emp[a-z]{3,})/i.test(tok) ||
          /([a-z]{2,}(ung|keit|heit|schaft|chen|lein|nis|tum|bar|lich|isch|ig|los|voll|ieren|eln|ern))$/i.test(tok) ||
          /(sch|tsch|pf|tz|kn)/i.test(tok) ||
          /[a-z]{3,}en$/i.test(tok)
        ) {
          score -= 20;
        }
      }
    }

    return score;
  }

  /**
   * Normalizes a pair of strings into `{ word: englishMeaning, translation: targetWord }`.
   */
  static normalizeWordPair(
    rawWord: string,
    rawTranslation: string,
    languageCode: string = 'de'
  ): { word: string; translation: string; swapped: boolean } {
    const w = (rawWord || '').trim();
    const tr = (rawTranslation || '').trim();
    if (!w || !tr) {
      return { word: w, translation: tr, swapped: false };
    }

    const scoreW = this.scoreAsEnglish(w, languageCode);
    const scoreTr = this.scoreAsEnglish(tr, languageCode);

    // Swap if candidate 2 (tr) scores higher as English than candidate 1 (w)
    if (scoreTr > scoreW) {
      return { word: tr, translation: w, swapped: true };
    }

    return { word: w, translation: tr, swapped: false };
  }

  /**
   * Normalizes a single VocabularyWord item so `word` is English and `translation` is Target Language.
   */
  static normalizeWordItem(item: VocabularyWord, fallbackLanguageCode: string = 'de'): VocabularyWord {
    const lang = item.languageCode || fallbackLanguageCode;
    const { word, translation, swapped } = this.normalizeWordPair(item.word, item.translation, lang);
    if (!swapped && item.word === word && item.translation === translation) {
      return item;
    }
    return {
      ...item,
      word,
      translation,
      languageCode: lang
    };
  }

  /**
   * Normalizes and deduplicates an array of VocabularyWord items in place.
   * Preserves the earliest `learnedAt` timestamp when reversed duplicate entries are merged.
   */
  static normalizeVocabularyList(
    list: VocabularyWord[],
    languageCode: string = 'de'
  ): { normalized: VocabularyWord[]; changed: boolean } {
    if (!Array.isArray(list) || list.length === 0) {
      return { normalized: [], changed: false };
    }

    let changed = false;
    const byKey = new Map<string, VocabularyWord>();

    for (const rawItem of list) {
      if (!rawItem || typeof rawItem.word !== 'string' || typeof rawItem.translation !== 'string') {
        changed = true;
        continue;
      }

      // Filter out stray grammar tips that may have leaked into legacy storage
      if (rawItem.word.length > 50 || rawItem.translation.length > 65 || rawItem.word.includes(':')) {
        changed = true;
        continue;
      }

      const norm = this.normalizeWordItem(rawItem, languageCode);
      if (norm.word !== rawItem.word || norm.translation !== rawItem.translation) {
        changed = true;
      }

      // Deduplicate by canonical (englishWord + targetBaseWord)
      const targetBase = norm.translation
        .toLowerCase()
        .replace(/\s*\([^)]*\)\s*/g, '')
        .trim();
      const key = `${norm.languageCode || languageCode}::${norm.word.toLowerCase().trim()}::${targetBase}`;

      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, norm);
      } else {
        changed = true;
        // Prefer keeping the Reading "lemma (clickedWord)" format if one of the duplicates has it,
        // and preserve the earlier learnedAt timestamp
        const preferTranslation = norm.translation.includes('(') && !existing.translation.includes('(')
          ? norm.translation
          : existing.translation;
        byKey.set(key, {
          ...existing,
          translation: preferTranslation,
          learnedAt: Math.min(existing.learnedAt || Date.now(), norm.learnedAt || Date.now()),
          isBookmarked: Boolean(existing.isBookmarked || norm.isBookmarked),
          isRemovedFromTimeline: Boolean(existing.isRemovedFromTimeline && norm.isRemovedFromTimeline)
        });
      }
    }

    return {
      normalized: Array.from(byKey.values()),
      changed
    };
  }

  /**
   * Loads lexicons for all languages present in `vocabByLang` and normalizes all saved words in place.
   */
  static async normalizeAllVocabByLangAsync(
    vocabByLang: Record<string, VocabularyWord[]>
  ): Promise<{ nextMap: Record<string, VocabularyWord[]>; changed: boolean }> {
    const langCodes = Object.keys(vocabByLang || {});
    await Promise.all(langCodes.map(code => this.ensureLexiconLoaded(code)));

    let anyChanged = false;
    const nextMap: Record<string, VocabularyWord[]> = {};

    for (const code of langCodes) {
      const list = vocabByLang[code] || [];
      const { normalized, changed } = this.normalizeVocabularyList(list, code);
      nextMap[code] = normalized;
      if (changed) anyChanged = true;
    }

    return { nextMap, changed: anyChanged };
  }

  static getExercises(language: string): VocabularyExercise[] {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${language}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error loading vocabulary exercises:", e);
      return [];
    }
  }

  static saveExercises(exercises: VocabularyExercise[], language: string) {
    try {
      localStorage.setItem(`${STORAGE_KEY}_${language}`, JSON.stringify(exercises));
    } catch (e) {
      console.error("Error saving vocabulary exercises:", e);
    }
  }

  static async generateExercise(
    type: VocabularyExerciseType, 
    words: VocabularyWord[], 
    level: LanguageLevel, 
    language: string
  ): Promise<VocabularyExercise | null> {
    if (words.length < 5) {
      throw new Error("You need at least 5 words in your library to generate exercises.");
    }

    const { normalized: cleanWords } = this.normalizeVocabularyList(words, language);

    if (type === 'matching') {
      // Matching is done client-side for performance and simplicity
      const shuffled = [...cleanWords].sort(() => Math.random() - 0.5).slice(0, 5);
      const exercise: VocabularyExercise = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'matching',
        level,
        language,
        content: {
          // Left is Target Language (translation), Right is English (word)
          pairs: shuffled.map(w => ({ id: w.id, left: w.translation, right: w.word }))
        },
        isCompleted: false,
        createdAt: Date.now()
      };
      return exercise;
    }

    // For other types, use AI to generate natural context
    const ai = AiService.getClient();
    const modelName = AiService.getModelName();

    const targetWords = [...cleanWords].sort(() => Math.random() - 0.5).slice(0, 20);
    const nativeLang = StorageService.load<string>('native_language', undefined, 'en');
    const nativeName = NATIVE_LANGUAGE_NAMES[nativeLang] || 'English';
    const targetName = SUPPORTED_LANGUAGES.find(l => l.code === language)?.name || 'German';

    // Explicitly label languages for AI clarity
    const wordsList = targetWords.map(w => `${nativeName}: ${w.word}, ${targetName}: ${w.translation}`).join('; ');

    const prompt = type === 'fill-in-the-blank' 
      ? `Create 5 ${targetName} fill-in-the-blank questions for level ${level}. 
         Use the ${targetName} words from this list: ${wordsList}.
         CRITICAL: For EACH of the 5 questions, select a DIFFERENT target ${targetName} word from the list.
         For each question:
         1. Provide a short, natural sentence with the ${targetName} word replaced by "[blank]".
         2. Provide the "word" (the correct ${targetName} answer).
         3. Provide 3 other "options" (distractors). These distractors MUST be different for each question and should preferably come from the provided list to increase exposure.
         Return ONLY a JSON object with a "questions" array of objects { sentence, word, options }.`
      : `Create 5 ${targetName} multiple-choice questions for level ${level}. 
         Use the ${targetName} words from this list: ${wordsList}.
         CRITICAL: Each of the 5 questions MUST target a DIFFERENT ${targetName} word.
         For each question:
         1. Provide a "sentence" in ${targetName} where one word is missing (replaced by "[blank]").
         2. The correct answer should be the ${targetName} translation from: ${wordsList}.
         3. Provide 3 other "options" (distractors) that are plausible but incorrect ${targetName} words. Use a mix of words from the list for distractors.
         Return ONLY a JSON object with a "questions" array of objects { sentence, options, correctAnswerIndex }.`;

    try {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const text = result.text || "";
      const cleanText = text.replace(/```json\n?|```/g, "").trim();
      const data = JSON.parse(cleanText);

      const exercise: VocabularyExercise = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        level,
        language,
        content: data,
        isCompleted: false,
        createdAt: Date.now()
      };
      
      return exercise;
    } catch (e: any) {
      console.warn("AI Generation limited or errored, falling back to local mode:", e);
      return this.generateLocalExercise(type, cleanWords, level, language);
    }
  }

  static generateLocalExercise(
    type: VocabularyExerciseType,
    words: VocabularyWord[],
    level: LanguageLevel,
    language: string
  ): VocabularyExercise {
    const questionsCount = 5;
    const { normalized: cleanWords } = this.normalizeVocabularyList(words, language);
    const shuffled = [...cleanWords].sort(() => Math.random() - 0.5);
    const targetWords = shuffled.slice(0, questionsCount);
    // Target-language words are stored in `translation`, English meanings in `word`
    const bank = cleanWords.map(w => w.translation);
    
    const questions = targetWords.map(target => {
      const distractors = bank
        .filter(w => w !== target.translation)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [target.translation, ...distractors].sort(() => Math.random() - 0.5);
      const correctIdx = options.indexOf(target.translation);

      const templates = [
        `Das Wort "[blank]" bedeutet "${target.word}".`,
        `Wie sagt man "${target.word}" auf Deutsch? Es ist "[blank]".`,
        `In einem Satz: "Ich kenne das Wort [blank] (${target.word})."`,
        `Wähle die richtige Übersetzung für "${target.word}": [blank].`,
        `Fülle die Lücke: [blank] (${target.word}).`
      ];
      const sentence = templates[Math.floor(Math.random() * templates.length)];

      return {
        sentence,
        word: target.translation,
        options,
        correctAnswerIndex: correctIdx
      };
    });

    return {
      id: "local_" + Math.random().toString(36).substr(2, 9),
      type,
      level,
      language,
      content: { questions },
      isCompleted: false,
      createdAt: Date.now()
    };
  }

  static updateExerciseStatus(id: string, language: string, results: Partial<VocabularyExercise>) {
    const exercises = this.getExercises(language);
    const updated = exercises.map(ex => ex.id === id ? { ...ex, ...results } : ex);
    this.saveExercises(updated, language);
  }
}

