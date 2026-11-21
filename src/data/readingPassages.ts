import { LanguageLevel } from "../types";
import type { PremadeQuestion, PremadePassage } from "./reading";
import {
  ALL_PREMADE_PASSAGES,
  getPremadeFallbackPassage as getFallbackFromLibrary,
  normalizeLevel,
  extractDictionaryVocabulary
} from "./reading";

export type { PremadeQuestion, PremadePassage };
export { ALL_PREMADE_PASSAGES, extractDictionaryVocabulary };

/**
 * Precompiled passages grouped by normalized CEFR level for backward compatibility.
 * Contains the complete, validated library of 275 passages across all 11 languages and 5 levels.
 */
export const PREMADE_PASSAGES: Record<LanguageLevel, PremadePassage[]> = {
  'A1': ALL_PREMADE_PASSAGES.filter(p => normalizeLevel(p.language, p.level) === 'A1'),
  'A2': ALL_PREMADE_PASSAGES.filter(p => normalizeLevel(p.language, p.level) === 'A2'),
  'B1': ALL_PREMADE_PASSAGES.filter(p => normalizeLevel(p.language, p.level) === 'B1'),
  'B2': ALL_PREMADE_PASSAGES.filter(p => normalizeLevel(p.language, p.level) === 'B2'),
  'C1': ALL_PREMADE_PASSAGES.filter(p => normalizeLevel(p.language, p.level) === 'C1'),
};

/**
 * Retrieves a precompiled passage matching the specified language and CEFR level.
 * Implements non-repetition tracking using usedTitles, and returns null if no passage
 * exists for the requested language or level (avoiding silent wrong-language substitutions).
 */
export function getPremadeFallbackPassage(
  language: string,
  level: string,
  usedTitles: string[] = []
): PremadePassage | null {
  return getFallbackFromLibrary(language, level, usedTitles);
}
