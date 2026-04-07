import { LanguageLevel } from "../types";

export interface ExamConfig {
  id: string;
  name: string;
  description: string;
  specifications: string;
  questionType: 'multiple-choice' | 'true-false';
  options: string[];
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isLocked: boolean;
  exams: ExamConfig[];
  ttsLang: string;
  defaultGreeting: string;
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    isLocked: false,
    exams: [
      {
        id: 'Telc',
        name: 'Telc',
        description: 'Authentic, spontaneous, and everyday German.',
        specifications: `
          - STYLE: Authentic, spontaneous, and slightly messy real-life German.
          - TONE: Casual, everyday language (Umgangssprache).
          - CONTENT: Real-world scenarios (e.g., a noisy train station announcement, a casual chat between roommates).
          - QUESTIONS: Strictly use "Richtig/Falsch" (True/False) format.
        `,
        questionType: 'true-false',
        options: ['Richtig', 'Falsch']
      },
      {
        id: 'Goethe',
        name: 'Goethe',
        description: 'Structured, clear, and professional Standard German.',
        specifications: `
          - STYLE: Structured, clear, and academic/professional Standard German (Hochdeutsch).
          - TONE: Formal, balanced, and precise.
          - CONTENT: Professional or educational contexts (e.g., a radio interview, a university lecture).
          - QUESTIONS: Strictly use Multiple Choice with 4 distinct options.
        `,
        questionType: 'multiple-choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D']
      }
    ],
    ttsLang: 'de-DE',
    defaultGreeting: 'Hallo! Wie kann ich dir heute helfen?'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    isLocked: true,
    exams: [
      {
        id: 'DELF',
        name: 'DELF',
        description: 'Diplôme d\'études en langue française.',
        specifications: `
          - STYLE: Standard French, clear articulation.
          - TONE: Varied (casual to formal).
          - CONTENT: Everyday situations and general topics.
          - QUESTIONS: Multiple choice and True/False.
        `,
        questionType: 'multiple-choice',
        options: ['Option A', 'Option B', 'Option C']
      }
    ],
    ttsLang: 'fr-FR',
    defaultGreeting: 'Bonjour! Comment puis-je vous aider aujourd\'hui?'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isLocked: true,
    exams: [
      {
        id: 'DELE',
        name: 'DELE',
        description: 'Diplomas de Español como Lengua Extranjera.',
        specifications: `
          - STYLE: Standard Spanish from various regions.
          - TONE: Natural and varied.
          - CONTENT: Social and professional contexts.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['Opción A', 'Opción B', 'Opción C']
      }
    ],
    ttsLang: 'es-ES',
    defaultGreeting: '¡Hola! ¿Cómo puedo ayudarte hoy?'
  }
];

export const GREETINGS: Record<string, string> = {
  de: 'Hallo',
  fr: 'Bonjour',
  es: 'Hola',
};

export const getLanguageConfig = (code: string) => 
  SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
