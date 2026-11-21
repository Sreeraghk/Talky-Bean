import { DictionaryEntry, IDictionaryStorageAdapter } from './types';
import { loadLexiconModule } from './lexicons';
import { EXPANDED_READING_DICTIONARY } from './lexicons/expandedReadingLexicon';
import { MultilingualLemmatizer } from './lemmatizer';
import { MULTILINGUAL_DICTIONARY, ALL_PREMADE_PASSAGES } from '../../data/reading';

/**
 * In-Memory Dictionary Storage Adapter
 * Lazily loads requested language lexicons on demand and unifies them with
 * MULTILINGUAL_DICTIONARY, EXPANDED_READING_DICTIONARY, and all curated
 * vocabularyHints across ALL_PREMADE_PASSAGES.
 * Indexed by canonical lemma, surface key, recognized inflected forms, and derivational root stems.
 */
export class InMemoryStorageAdapter implements IDictionaryStorageAdapter {
  private stores = new Map<string, Map<string, DictionaryEntry>>();

  private static extractRootStems(word: string, code: string): string[] {
    if (!word || word.length < 5 || code === 'zh' || code === 'ja' || code === 'ko') return [];
    const stems: string[] = [];
    const derivationalSuffixes = [
      'ungen', 'ung', 'keiten', 'keit', 'heiten', 'heit', 'schaften', 'schaft',
      'tionen', 'tion', 'sionen', 'sion', 'ionen', 'ion',
      'lichen', 'liche', 'licher', 'liches', 'lich',
      'ischen', 'ische', 'ischer', 'isches', 'isch',
      'baren', 'bare', 'barer', 'bares', 'bar',
      'samen', 'same', 'samer', 'sames', 'sam',
      'losen', 'lose', 'loser', 'loses', 'los',
      'igen', 'ige', 'iger', 'iges', 'ig',
      'ciones', 'ción', 'siones', 'sión', 'dades', 'dad', 'tades', 'tad',
      'mientos', 'miento', 'mentos', 'mento', 'zioni', 'zione', 'ções', 'ção',
      'iamo', 'iendo', 'ando', 'ieren', 'en', 'er', 'ie', 'ia'
    ];
    for (const suf of derivationalSuffixes) {
      if (word.endsWith(suf) && word.length - suf.length >= 4) {
        stems.push(word.slice(0, -suf.length));
      }
    }
    return stems;
  }

  async load(languageCode: string): Promise<Map<string, DictionaryEntry>> {
    const code = MultilingualLemmatizer.normalizeLanguageCode(languageCode);
    if (this.stores.has(code)) {
      return this.stores.get(code)!;
    }

    const dictMap = new Map<string, DictionaryEntry>();
    const punctRegex = /[.,!?:;()„“"»«[\]/|\\—–\s]/g;

    const indexSupplementalTerm = (rawWord: string, rawTranslation: string) => {
      if (!rawWord || !rawTranslation) return;
      const cleanWord = rawWord.toLowerCase().trim().replace(punctRegex, '');
      const cleanTrans = rawTranslation.trim();
      if (!cleanWord || cleanWord.length < (code === 'zh' || code === 'ja' ? 1 : 2) || !cleanTrans) return;
      if (MultilingualLemmatizer.isStopword(cleanWord, code)) return;

      const { lemma: derivedLemma } = MultilingualLemmatizer.lemmatize(cleanWord, code);
      const baseLemma = derivedLemma || cleanWord;
      const translations = cleanTrans.split(/\s*\/\s*/).map(s => s.trim()).filter(Boolean);
      if (translations.length === 0) return;

      const entry: DictionaryEntry = {
        lemma: baseLemma,
        pos: 'noun',
        translations
      };

      if (!dictMap.has(cleanWord)) {
        dictMap.set(cleanWord, entry);
      }
      if (baseLemma && !dictMap.has(baseLemma)) {
        dictMap.set(baseLemma, entry);
      }
      for (const rootStem of InMemoryStorageAdapter.extractRootStems(cleanWord, code)) {
        if (!dictMap.has(rootStem)) {
          dictMap.set(rootStem, entry);
        }
      }
    };

    // 1. Load core structured lexicon (highest priority)
    const lexicon = await loadLexiconModule(code);
    if (lexicon && Array.isArray(lexicon.entries)) {
      lexicon.entries.forEach(entry => {
        const cleanLemma = entry.lemma.toLowerCase().trim();
        dictMap.set(cleanLemma, entry);

        // Also index irregular inflected forms directly for O(1) lookup
        if (Array.isArray(entry.irregularForms)) {
          entry.irregularForms.forEach(form => {
            const cleanForm = form.toLowerCase().trim();
            if (cleanForm && !dictMap.has(cleanForm)) {
              dictMap.set(cleanForm, entry);
            }
          });
        }
        for (const rootStem of InMemoryStorageAdapter.extractRootStems(cleanLemma, code)) {
          if (!dictMap.has(rootStem)) {
            dictMap.set(rootStem, entry);
          }
        }
      });
    }

    // 2. Merge MULTILINGUAL_DICTIONARY entries for this language
    const thematicDict = MULTILINGUAL_DICTIONARY[code];
    if (thematicDict && typeof thematicDict === 'object') {
      Object.entries(thematicDict).forEach(([word, translation]) => {
        indexSupplementalTerm(word, translation);
        const lowerVerbatim = word.toLowerCase().trim();
        if (lowerVerbatim.includes(' ') && !dictMap.has(lowerVerbatim)) {
          dictMap.set(lowerVerbatim, {
            lemma: lowerVerbatim,
            pos: 'phrase',
            translations: [translation.trim()]
          });
        }
      });
    }

    // 3. Merge EXPANDED_READING_DICTIONARY entries for this language
    const expandedDict = EXPANDED_READING_DICTIONARY[code];
    if (expandedDict && typeof expandedDict === 'object') {
      Object.entries(expandedDict).forEach(([word, translation]) => {
        indexSupplementalTerm(word, translation);
        const lowerVerbatim = word.toLowerCase().trim();
        if (lowerVerbatim.includes(' ') && !dictMap.has(lowerVerbatim)) {
          dictMap.set(lowerVerbatim, {
            lemma: lowerVerbatim,
            pos: 'phrase',
            translations: [translation.trim()]
          });
        }
      });
    }

    // 4. Merge curated vocabularyHints across all precompiled reading passages for this language
    if (Array.isArray(ALL_PREMADE_PASSAGES)) {
      ALL_PREMADE_PASSAGES.forEach(passage => {
        if (passage.language && passage.language.toLowerCase().trim() === code && passage.vocabularyHints) {
          Object.entries(passage.vocabularyHints).forEach(([word, translation]) => {
            indexSupplementalTerm(word, translation);
          });
        }
      });
    }

    this.stores.set(code, dictMap);
    return dictMap;
  }

  async get(languageCode: string, key: string): Promise<DictionaryEntry | undefined> {
    const store = await this.load(languageCode);
    const cleanKey = key.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');
    return store.get(cleanKey) || store.get(key.toLowerCase().trim());
  }

  async has(languageCode: string, key: string): Promise<boolean> {
    const store = await this.load(languageCode);
    const cleanKey = key.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');
    return store.has(cleanKey) || store.has(key.toLowerCase().trim());
  }

  async set(languageCode: string, key: string, entry: DictionaryEntry): Promise<void> {
    const store = await this.load(languageCode);
    const cleanKey = key.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');
    store.set(cleanKey, entry);
  }

  async clear(languageCode: string): Promise<void> {
    const code = languageCode.toLowerCase().trim();
    this.stores.delete(code);
  }
}

/**
 * Storage factory with default singleton adapter.
 * Easily swappable to IndexedDBStorageAdapter when dictionary volume exceeds in-memory preferences.
 */
export const defaultStorageAdapter: IDictionaryStorageAdapter = new InMemoryStorageAdapter();

