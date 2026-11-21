import { DictionaryEntry, VocabularyHintItem, WordCandidate, IDictionaryStorageAdapter } from './types';
import { MultilingualLemmatizer } from './lemmatizer';
import { defaultStorageAdapter } from './storageAdapter';
import { extractDictionaryVocabulary } from '../../data/reading/dictionary';
import { getReadingLengthProfile } from '../../data/reading/types';

const VOCAB_CACHE_KEY = 'talkybean_vocab_cache_v1';

export class DictionaryService {
  private static adapter: IDictionaryStorageAdapter = defaultStorageAdapter;
  private static localMemoryCache = new Map<string, VocabularyHintItem>();

  /**
   * Set custom storage adapter (e.g., IndexedDBStorageAdapter).
   */
  static setStorageAdapter(adapter: IDictionaryStorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * Cache key generator for memory and localStorage
   */
  private static getCacheKey(lang: string, word: string): string {
    return `${MultilingualLemmatizer.normalizeLanguageCode(lang)}_${word.toLowerCase().trim()}`;
  }

  /**
   * Loads cached vocabulary item from memory or localStorage.
   */
  static getCachedHint(lang: string, word: string): VocabularyHintItem | null {
    const key = this.getCacheKey(lang, word);
    if (this.localMemoryCache.has(key)) {
      return this.localMemoryCache.get(key)!;
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${VOCAB_CACHE_KEY}_${key}`);
        if (stored) {
          const parsed = JSON.parse(stored) as VocabularyHintItem;
          this.localMemoryCache.set(key, parsed);
          return parsed;
        }
      } catch {
        // Ignore storage read errors
      }
    }
    return null;
  }

  /**
   * Persists vocabulary item into memory and localStorage.
   */
  static setCachedHint(lang: string, word: string, hint: VocabularyHintItem) {
    const key = this.getCacheKey(lang, word);
    this.localMemoryCache.set(key, hint);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(`${VOCAB_CACHE_KEY}_${key}`, JSON.stringify(hint));
      } catch {
        // Ignore storage write quota exceptions
      }
    }
  }

  /**
   * Resolves compound words or derived stems against the unified local dictionary store.
   * Zero API token cost.
   */
  private static async resolveCompoundOrRoot(
    langCode: string,
    cleanWord: string
  ): Promise<DictionaryEntry | undefined> {
    const code = MultilingualLemmatizer.normalizeLanguageCode(langCode);
    if (!cleanWord || cleanWord.length < 6 || code === 'zh' || code === 'ja') {
      return undefined;
    }

    const store = await this.adapter.load(code);

    // 1. Try 2-part compound decomposition (e.g., German/Finnish compounds with optional linking -s-, -n-, -en-, -er-, -e-)
    if (cleanWord.length >= 7) {
      const linkers = ['', 's', 'n', 'en', 'er', 'e'];
      for (let splitIdx = 3; splitIdx <= cleanWord.length - 4; splitIdx++) {
        const leftRaw = cleanWord.slice(0, splitIdx);
        const remainder = cleanWord.slice(splitIdx);

        for (const linker of linkers) {
          if (!remainder.startsWith(linker)) continue;
          const rightRaw = remainder.slice(linker.length);
          if (rightRaw.length < 4) continue;

          const rightCandidates = MultilingualLemmatizer.getCandidateLemmas(rightRaw, code);
          let rightEntry: DictionaryEntry | undefined;
          for (const rc of rightCandidates) {
            rightEntry = store.get(rc);
            if (rightEntry) break;
          }
          if (!rightEntry) continue;

          const leftCandidates = MultilingualLemmatizer.getCandidateLemmas(leftRaw, code);
          let leftEntry: DictionaryEntry | undefined;
          for (const lc of leftCandidates) {
            leftEntry = store.get(lc);
            if (leftEntry) break;
          }

          if (leftEntry && rightEntry) {
            const leftTrans = leftEntry.translations[0]?.replace(/^to\s+/i, '').trim();
            const rightTrans = rightEntry.translations[0]?.replace(/^to\s+/i, '').trim();
            const combined = leftTrans && rightTrans && leftTrans.toLowerCase() !== rightTrans.toLowerCase()
              ? `${leftTrans} ${rightTrans}`
              : (rightEntry.translations[0] || leftEntry.translations[0]);

            return {
              lemma: cleanWord,
              pos: rightEntry.pos || 'noun',
              translations: [combined]
            };
          }
        }
      }

      // 2. Check if suffix/head noun (>= 5 chars) matches a known dictionary entry
      for (let splitIdx = 3; splitIdx <= cleanWord.length - 5; splitIdx++) {
        const suffixRaw = cleanWord.slice(splitIdx);
        const suffixEntry = store.get(suffixRaw);
        if (suffixEntry) {
          return suffixEntry;
        }
      }
    }

    // 3. Check if cleanWord shares a >= 5-char root stem with a dictionary entry (within 3 chars inflectional difference)
    for (let trimLen = 1; trimLen <= 3; trimLen++) {
      if (cleanWord.length - trimLen < 5) break;
      const prefixStem = cleanWord.slice(0, -trimLen);
      const stemEntry = store.get(prefixStem);
      if (stemEntry) {
        return stemEntry;
      }
    }

    return undefined;
  }

  /**
   * Single word lookup using intelligent lemmatizer and unified dictionary adapter.
   */
  static async lookupWord(
    langCode: string,
    word: string,
    sentence?: string
  ): Promise<VocabularyHintItem | null> {
    if (!word) return null;
    const code = MultilingualLemmatizer.normalizeLanguageCode(langCode);
    const clean = word.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');
    if (!clean || clean.length <= 1) return null;

    // Check cache first
    const cached = this.getCachedHint(code, clean);
    if (cached) return cached;

    // Step 1: Check all morphological candidate lemmas against local dictionary and cache
    const candidateLemmas = MultilingualLemmatizer.getCandidateLemmas(clean, code);
    const { lemma, posGuess, ruleApplied } = MultilingualLemmatizer.lemmatize(clean, code);

    let entry: DictionaryEntry | undefined;
    for (const cand of candidateLemmas) {
      const cachedCand = this.getCachedHint(langCode, cand);
      if (cachedCand) {
        return cachedCand;
      }
      entry = await this.adapter.get(langCode, cand);
      if (entry) break;
    }

    // Step 2: Compound word or root-stem lookup
    if (!entry && clean.length >= 6) {
      entry = await this.resolveCompoundOrRoot(langCode, clean);
    }

    if (entry) {
      const hint: VocabularyHintItem = {
        originalWord: word,
        lemma: entry.lemma,
        translation: entry.translations.slice(0, 2).join(' / '),
        pos: entry.pos,
        gender: entry.gender,
        explanation: entry.definition || (ruleApplied ? `Inflected form of ${entry.lemma}` : undefined),
        source: 'dictionary'
      };
      this.setCachedHint(langCode, clean, hint);
      return hint;
    }

    // Step 3: Heuristic hint if lemma identified
    if (lemma && lemma !== clean) {
      const hint: VocabularyHintItem = {
        originalWord: word,
        lemma: lemma,
        translation: `${lemma}`,
        pos: posGuess || 'word',
        explanation: `Base form of ${word}`,
        source: 'dictionary'
      };
      return hint;
    }

    return null;
  }

  /**
   * 3-Stage Vocabulary Pipeline for authentic reading passages:
   * Stage A: Extract vocabulary candidates across the full passage via unified local dictionary,
   *          multi-rule morphological lemmatizer, compound-word analyzer, and local cache.
   * Stage B: Prioritize remaining unmatched words by word length across all three passage sections
   *          (first 1/3, middle 1/3, final 1/3).
   * Stage C: Single capped batch call to /api/ai/vocab-batch (<= 25 words) with zero extra token overhead.
   */
  static async extractPassageVocabulary(
    passage: string,
    langCode: string,
    nativeLang: string = 'en',
    userLevel: string = 'A1'
  ): Promise<Record<string, string>> {
    if (!passage || typeof passage !== 'string') return {};

    const code = MultilingualLemmatizer.normalizeLanguageCode(langCode);
    const dictionaryHints: Record<string, string> = {};

    // Pre-populate phrase and stem matches from thematic dictionary across the entire passage
    const directThematicMatches = extractDictionaryVocabulary(passage, code, 0, 800);
    Object.entries(directThematicMatches).forEach(([k, v]) => {
      if (k && v) {
        dictionaryHints[k.toLowerCase().trim()] = v;
      }
    });

    // --- STAGE A: Local Tokenization, Multi-Lemma Lookup & Compound Resolution ---
    const rawCandidates = MultilingualLemmatizer.tokenizePassage(passage, code);
    const candidateMap = new Map<string, WordCandidate>();

    for (const item of rawCandidates) {
      const { lemma: primaryLemma } = MultilingualLemmatizer.lemmatize(item.clean, code);
      const candidateLemmas = MultilingualLemmatizer.getCandidateLemmas(item.clean, code);
      let targetLemma = primaryLemma || item.clean;
      let entry: DictionaryEntry | undefined;

      // 1. Check local cache first (zero cost)
      for (const cand of candidateLemmas) {
        const cached = this.getCachedHint(code, cand);
        if (cached && cached.translation && cached.translation.toLowerCase() !== cand.toLowerCase()) {
          entry = {
            lemma: cached.lemma || cand,
            pos: (cached.pos as any) || 'noun',
            translations: [cached.translation]
          };
          targetLemma = entry.lemma;
          break;
        }
      }

      // 2. Check unified local dictionary across all candidate lemmas
      if (!entry) {
        for (const cand of candidateLemmas) {
          entry = await this.adapter.get(code, cand);
          if (entry) {
            targetLemma = entry.lemma || cand;
            break;
          }
        }
      }

      // 3. Check compound decomposition or root-stem match
      if (!entry && item.clean.length >= 6) {
        entry = await this.resolveCompoundOrRoot(code, item.clean);
        if (entry) {
          targetLemma = entry.lemma || targetLemma;
        }
      }

      // 4. Also check if pre-populated thematic match resolved this token or its lemma
      if (!entry) {
        const thematicTrans = dictionaryHints[item.clean] || dictionaryHints[targetLemma];
        if (thematicTrans) {
          entry = {
            lemma: targetLemma,
            pos: 'noun',
            translations: [thematicTrans]
          };
        }
      }

      const coverage: 'matched' | 'missing' = entry ? 'matched' : 'missing';

      candidateMap.set(item.clean, {
        original: item.original,
        clean: item.clean,
        lemma: targetLemma,
        sentence: item.sentence,
        coverage,
        entry,
        positionRatio: item.positionRatio
      });
    }

    // Populate all local dictionary matches immediately across all three thirds of the passage
    const difficultBatch: Array<{
      original: string;
      clean: string;
      lemma: string;
      sentence: string;
      positionRatio: number;
    }> = [];

    candidateMap.forEach((cand, clean) => {
      if (cand.coverage === 'matched' && cand.entry && cand.entry.translations.length > 0) {
        const primaryTranslation = cand.entry.translations.slice(0, 2).join(' / ');
        dictionaryHints[clean] = primaryTranslation;
        dictionaryHints[cand.original.toLowerCase().trim()] = primaryTranslation;
        if (cand.lemma) {
          dictionaryHints[cand.lemma.toLowerCase().trim()] = primaryTranslation;
        }
        if (cand.entry.lemma) {
          dictionaryHints[cand.entry.lemma.toLowerCase().trim()] = primaryTranslation;
        }
      } else {
        difficultBatch.push({
          original: cand.original,
          clean: cand.clean,
          lemma: cand.lemma,
          sentence: cand.sentence,
          positionRatio: cand.positionRatio ?? 0.5
        });
      }
    });

    console.log(`[DictionaryService] Unified local dictionary resolved ${Object.keys(dictionaryHints).length} vocabulary keys across full passage. Unmatched candidates: ${difficultBatch.length}`);

    // --- STAGE B & C: Length-Prioritized Full-Passage Selection for Capped AI Batch (<= 25 words) ---
    if (difficultBatch.length > 0) {
      // Partition unmatched words into First 1/3, Middle 1/3, and Final 1/3 of the passage
      const third1 = difficultBatch.filter(item => item.positionRatio < 0.34);
      const third2 = difficultBatch.filter(item => item.positionRatio >= 0.34 && item.positionRatio < 0.67);
      const third3 = difficultBatch.filter(item => item.positionRatio >= 0.67);

      // Sort each section by word length descending (prioritizing longer content words)
      const sortByLengthDesc = (a: typeof difficultBatch[0], b: typeof difficultBatch[0]) =>
        b.clean.length - a.clean.length;
      third1.sort(sortByLengthDesc);
      third2.sort(sortByLengthDesc);
      third3.sort(sortByLengthDesc);

      // Interleave longest content words across all three thirds up to the level-scaled cap (A1-B1: 25, B2: 30, C1: 35)
      const selectedBatch: typeof difficultBatch = [];
      const maxBatchSize = getReadingLengthProfile(code, userLevel).aiVocabBatchCap;
      let idx = 0;
      while (
        selectedBatch.length < maxBatchSize &&
        (idx < third1.length || idx < third2.length || idx < third3.length)
      ) {
        if (idx < third1.length && selectedBatch.length < maxBatchSize) {
          selectedBatch.push(third1[idx]);
        }
        if (idx < third2.length && selectedBatch.length < maxBatchSize) {
          selectedBatch.push(third2[idx]);
        }
        if (idx < third3.length && selectedBatch.length < maxBatchSize) {
          selectedBatch.push(third3[idx]);
        }
        idx++;
      }

      const endpoint = typeof window !== 'undefined'
        ? '/api/ai/vocab-batch'
        : (process.env.APP_URL ? `${process.env.APP_URL}/api/ai/vocab-batch` : null);

      if (endpoint && selectedBatch.length > 0) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              languageCode: code,
              nativeLanguage: nativeLang,
              level: userLevel,
              items: selectedBatch.map(item => ({
                original: item.original,
                lemma: item.lemma,
                sentence: item.sentence
              }))
            })
          });

          if (response.ok) {
            const data = await response.json();
            if (data && Array.isArray(data.items)) {
              data.items.forEach((resolved: any) => {
                if (resolved && resolved.original && resolved.translation) {
                  const orig = resolved.original.trim();
                  const trans = resolved.translation.trim();
                  const cleanOrig = orig.toLowerCase().replace(/[.,!?:;()„“"»«[\]/|\\—–\s]/g, '');

                  dictionaryHints[orig.toLowerCase()] = trans;
                  if (cleanOrig) dictionaryHints[cleanOrig] = trans;
                  if (resolved.lemma) {
                    dictionaryHints[resolved.lemma.toLowerCase().trim()] = trans;
                  }

                  // Cache resolved item for future passages
                  this.setCachedHint(code, cleanOrig || orig, {
                    originalWord: orig,
                    lemma: resolved.lemma || orig,
                    translation: trans,
                    pos: resolved.pos || 'word',
                    explanation: resolved.explanation,
                    source: 'ai_contextual'
                  });
                }
              });
            }
          } else {
            console.warn(`[DictionaryService] Stage C batch AI returned status ${response.status}. Falling back smoothly to local morphological analysis.`);
          }
        } catch (networkErr) {
          console.warn('[DictionaryService] Stage C batch AI network error (offline or unreachable); local dictionary ensures continuous functionality.', networkErr);
        }
      }
    }

    // Propagate lemma translations to any remaining inflected occurrences in the passage
    difficultBatch.forEach(item => {
      if (!dictionaryHints[item.clean]) {
        const candidateLemmas = MultilingualLemmatizer.getCandidateLemmas(item.clean, code);
        for (const candLemma of candidateLemmas) {
          const existingTrans = dictionaryHints[candLemma];
          if (existingTrans) {
            dictionaryHints[item.clean] = existingTrans;
            dictionaryHints[item.original.toLowerCase().trim()] = existingTrans;
            break;
          }
        }
      }
    });

    return dictionaryHints;
  }
}

