import { LanguageLevel } from "../../types";

export interface PremadeQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface PremadePassage {
  title: string;
  text: string;
  level: LanguageLevel;
  language: string;
  vocabularyHints: Record<string, string>;
  mcqQuestions: PremadeQuestion[];
  tfQuestions: PremadeQuestion[];
}

/**
 * Normalizes any framework-specific level code to the standard CEFR tier (A1, A2, B1, B2, C1)
 * while preserving framework-specific compatibility.
 */
export function normalizeLevel(language: string, level: string): string {
  if (!level) return 'A1';
  const clean = level.trim().toUpperCase();

  // Already standard CEFR
  if (['A1', 'A2', 'B1', 'B2', 'C1'].includes(clean)) {
    return clean;
  }

  // Japanese JLPT mapping: N5 -> A1, N4 -> A2, N3 -> B1, N2 -> B2, N1 -> C1
  if (language === 'ja') {
    if (clean === 'N5') return 'A1';
    if (clean === 'N4') return 'A2';
    if (clean === 'N3') return 'B1';
    if (clean === 'N2') return 'B2';
    if (clean === 'N1') return 'C1';
  }

  // Mandarin HSK 3.0 mapping: L1 -> A1, L2 -> A2, L3 -> B1, L4 -> B2, L5 -> C1
  if (language === 'zh') {
    if (clean === 'L1' || clean === '1') return 'A1';
    if (clean === 'L2' || clean === '2') return 'A2';
    if (clean === 'L3' || clean === '3') return 'B1';
    if (clean === 'L4' || clean === '4') return 'B2';
    if (clean === 'L5' || clean === '5') return 'C1';
  }

  // Korean TOPIK mapping: L1 -> A1, L2 -> A2, L3 -> B1, L4 -> B2, L5 -> C1
  if (language === 'ko') {
    if (clean === 'L1' || clean === '1') return 'A1';
    if (clean === 'L2' || clean === '2') return 'A2';
    if (clean === 'L3' || clean === '3') return 'B1';
    if (clean === 'L4' || clean === '4') return 'B2';
    if (clean === 'L5' || clean === '5') return 'C1';
  }

  // Russian TORFL mapping: TEU -> A1, TBU -> A2, TRKI-1 -> B1, TRKI-2 -> B2, TRKI-3 -> C1
  if (language === 'ru') {
    if (clean === 'TEU') return 'A1';
    if (clean === 'TBU') return 'A2';
    if (clean.includes('TRKI-1')) return 'B1';
    if (clean.includes('TRKI-2')) return 'B2';
    if (clean.includes('TRKI-3')) return 'C1';
  }

  // Finnish YKI mapping: 1 -> A1, 2 -> A2, 3 -> B1, 4 -> B2, 5 -> C1
  if (language === 'fi') {
    if (clean === '1') return 'A1';
    if (clean === '2') return 'A2';
    if (clean === '3') return 'B1';
    if (clean === '4') return 'B2';
    if (clean === '5') return 'C1';
  }

  return clean;
}

/**
 * Calculates length metric appropriately:
 * - For Chinese / Japanese / Korean: character count (excluding whitespace)
 * - For alphabetic languages: word count (whitespace split)
 */
export function getPassageLengthMetric(language: string, text: string): { count: number; unit: 'words' | 'characters' } {
  if (['zh', 'ja'].includes(language)) {
    const chars = text.replace(/[\s\r\n\t]/g, '').length;
    return { count: chars, unit: 'characters' };
  }
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return { count: words, unit: 'words' };
}

export interface ReadingLengthProfile {
  normalizedTier: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  unit: 'words' | 'characters';
  minLength: number;
  maxLength: number;
  paragraphGuidance: string;
  styleGuidance: string;
  aiVocabBatchCap: number;
}

/**
 * Resolves the target reading passage length, paragraph layout, editorial style,
 * and Stage C AI vocabulary batch cap for any supported language and level.
 *
 * A1 and A2 (and their framework equivalents) preserve their existing lengths.
 * B1, B2, and C1 (and equivalents) scale progressively by ~25% per tier above A2.
 */
export function getReadingLengthProfile(language: string, level: string): ReadingLengthProfile {
  const normalized = normalizeLevel(language, level);
  const tier: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' =
    normalized === 'A2' || normalized === 'B1' || normalized === 'B2' || normalized === 'C1'
      ? normalized
      : 'A1';

  const isCharacterBased = ['zh', 'ja'].includes((language || '').toLowerCase().trim());

  switch (tier) {
    case 'A1':
      return {
        normalizedTier: 'A1',
        unit: isCharacterBased ? 'characters' : 'words',
        minLength: isCharacterBased ? 260 : 150,
        maxLength: isCharacterBased ? 380 : 220,
        paragraphGuidance: '1-2 short paragraphs',
        styleGuidance: 'Simple present tense, direct sentence structure, core high-frequency vocabulary.',
        aiVocabBatchCap: 25
      };
    case 'A2':
      return {
        normalizedTier: 'A2',
        unit: isCharacterBased ? 'characters' : 'words',
        minLength: isCharacterBased ? 340 : 200,
        maxLength: isCharacterBased ? 450 : 260,
        paragraphGuidance: '2 clear paragraphs',
        styleGuidance: 'Basic compound sentences, past tense, accessible narrative tone.',
        aiVocabBatchCap: 25
      };
    case 'B1':
      return {
        normalizedTier: 'B1',
        unit: isCharacterBased ? 'characters' : 'words',
        minLength: isCharacterBased ? 425 : 250,
        maxLength: isCharacterBased ? 560 : 325,
        paragraphGuidance: '3 well-structured paragraphs separated by blank lines (\\n\\n)',
        styleGuidance: 'Standard journalistic prose, clear main points, relative clauses, basic passive voice.',
        aiVocabBatchCap: 25
      };
    case 'B2':
      return {
        normalizedTier: 'B2',
        unit: isCharacterBased ? 'characters' : 'words',
        minLength: isCharacterBased ? 530 : 315,
        maxLength: isCharacterBased ? 700 : 405,
        paragraphGuidance: '4 well-structured paragraphs separated by blank lines (\\n\\n)',
        styleGuidance: 'Formal media vocabulary, complex syntax, abstract concepts, nuanced reporting style.',
        aiVocabBatchCap: 30
      };
    case 'C1':
      return {
        normalizedTier: 'C1',
        unit: isCharacterBased ? 'characters' : 'words',
        minLength: isCharacterBased ? 665 : 395,
        maxLength: isCharacterBased ? 875 : 505,
        paragraphGuidance: '4-5 well-structured paragraphs separated by blank lines (\\n\\n)',
        styleGuidance: 'Advanced journalistic prose, idiomatic expressions, rich vocabulary, complex sentence structures, analytical depth.',
        aiVocabBatchCap: 35
      };
  }
}
