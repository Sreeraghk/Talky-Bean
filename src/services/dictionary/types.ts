/**
 * Multilingual Dictionary & Lemmatizer Types
 * Licensed under Creative Commons Attribution-ShareAlike (CC BY-SA) & Open Data definitions.
 */

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adj'
  | 'adv'
  | 'pronoun'
  | 'prep'
  | 'conj'
  | 'phrase'
  | 'idiom'
  | 'interj'
  | 'num';

export interface DictionaryEntry {
  lemma: string;                      // Base unconjugated form (e.g. "gehen", "Haus", "comer")
  pos: PartOfSpeech;                  // Part of speech
  translations: string[];             // Educational English translations: ["to go", "to walk"]
  gender?: 'm' | 'f' | 'n';           // Grammatical gender where applicable
  irregularForms?: string[];          // Common irregular inflected forms: ["ging", "gegangen"]
  definition?: string;                // Concise educational definition
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  examples?: string[];                // Example usage in target language
}

export interface VocabularyHintItem {
  originalWord: string;               // Word as it appears in text: "gegangen"
  lemma: string;                      // Canonical base lemma: "gehen"
  translation: string;                // Primary contextual translation: "to go"
  pos: string;                        // "verb"
  gender?: string;                    // "m" | "f" | "n"
  explanation?: string;               // "Past participle of gehen"
  source: 'dictionary' | 'ai_contextual';
}

export type CandidateCoverage =
  | 'matched'                         // High-confidence dictionary match
  | 'ambiguous'                       // Multiple distinct senses or polysemy
  | 'missing';                        // Not found in local dictionary

export interface WordCandidate {
  original: string;                   // "gegangen"
  clean: string;                      // "gegangen"
  lemma: string;                      // "gehen"
  sentence: string;                   // Complete sentence for context
  coverage: CandidateCoverage;
  entry?: DictionaryEntry;
  positionRatio?: number;             // Relative position in passage (0.0 to 1.0)
}

export interface LexiconModule {
  languageCode: string;
  languageName: string;
  license: string;
  attribution: string;
  entries: DictionaryEntry[];
}

/**
 * Storage adapter interface designed for in-memory and future IndexedDB migration.
 */
export interface IDictionaryStorageAdapter {
  load(languageCode: string): Promise<Map<string, DictionaryEntry>>;
  get(languageCode: string, key: string): Promise<DictionaryEntry | undefined>;
  has(languageCode: string, key: string): Promise<boolean>;
  set(languageCode: string, key: string, entry: DictionaryEntry): Promise<void>;
  clear(languageCode: string): Promise<void>;
}
