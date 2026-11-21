import { PremadePassage, normalizeLevel } from './types';
import { GERMAN_PASSAGES } from './german';
import { SPANISH_PASSAGES } from './spanish';
import { FRENCH_PASSAGES } from './french';
import { ITALIAN_PASSAGES } from './italian';
import { PORTUGUESE_PASSAGES } from './portuguese';
import { JAPANESE_PASSAGES } from './japanese';
import { CHINESE_PASSAGES } from './chinese';
import { KOREAN_PASSAGES } from './korean';
import { RUSSIAN_PASSAGES } from './russian';
import { IRISH_PASSAGES } from './irish';
import { FINNISH_PASSAGES } from './finnish';

export type { PremadeQuestion, PremadePassage } from './types';
export { normalizeLevel, getPassageLengthMetric } from './types';
export { extractDictionaryVocabulary, MULTILINGUAL_DICTIONARY } from './dictionary';
export {
  GERMAN_PASSAGES,
  SPANISH_PASSAGES,
  FRENCH_PASSAGES,
  ITALIAN_PASSAGES,
  PORTUGUESE_PASSAGES,
  JAPANESE_PASSAGES,
  CHINESE_PASSAGES,
  KOREAN_PASSAGES,
  RUSSIAN_PASSAGES,
  IRISH_PASSAGES,
  FINNISH_PASSAGES
};

export const ALL_PREMADE_PASSAGES: PremadePassage[] = [
  ...GERMAN_PASSAGES,
  ...SPANISH_PASSAGES,
  ...FRENCH_PASSAGES,
  ...ITALIAN_PASSAGES,
  ...PORTUGUESE_PASSAGES,
  ...JAPANESE_PASSAGES,
  ...CHINESE_PASSAGES,
  ...KOREAN_PASSAGES,
  ...RUSSIAN_PASSAGES,
  ...IRISH_PASSAGES,
  ...FINNISH_PASSAGES
];

/**
 * Returns a high-quality precompiled passage matching the requested language and level,
 * with variation (avoiding recently encountered titles if possible).
 */
export function getPremadeFallbackPassage(
  language: string,
  level: string,
  excludedTitles: string[] = []
): PremadePassage | null {
  const lang = (language || '').toLowerCase().trim();
  const targetLevel = normalizeLevel(lang, level);

  const matchingPassages = ALL_PREMADE_PASSAGES.filter(p => {
    return p.language.toLowerCase() === lang && normalizeLevel(p.language, p.level) === targetLevel;
  });

  if (matchingPassages.length === 0) {
    // Secondary fallback: match language only if specific level isn't found
    const langOnly = ALL_PREMADE_PASSAGES.filter(p => p.language.toLowerCase() === lang);
    if (langOnly.length > 0) {
      return langOnly[Math.floor(Math.random() * langOnly.length)];
    }
    return null;
  }

  // Filter out recently used titles to provide variety
  const fresh = matchingPassages.filter(p => !excludedTitles.includes(p.title));
  const pool = fresh.length > 0 ? fresh : matchingPassages;

  // Pick a random passage from candidate pool
  return pool[Math.floor(Math.random() * pool.length)];
}
