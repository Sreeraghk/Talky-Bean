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
  framework: string;
  levels: { code: string; label: string; name: string }[];
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
        id: 'Standard',
        name: 'Standard',
        description: 'Authentic, everyday German with standard exam structure.',
        specifications: `
          - STYLE: Authentic, spontaneous, and realistic German.
          - TONE: Natural everyday language.
          - CONTENT: Real-world scenarios (e.g., train station, roommate chats, interviews).
          - QUESTIONS: Strictly use "Richtig/Falsch" (True/False) format.
        `,
        questionType: 'true-false',
        options: ['Richtig', 'Falsch']
      }
    ],
    ttsLang: 'de-DE',
    defaultGreeting: 'Hallo! Wie kann ich dir heute helfen?',
    framework: 'CEFR',
    levels: [
      { code: 'A1', label: 'A1', name: 'Beginner' },
      { code: 'A2', label: 'A2', name: 'Elementary' },
      { code: 'B1', label: 'B1', name: 'Intermediate' },
      { code: 'B2', label: 'B2', name: 'Upper Int.' },
      { code: 'C1', label: 'C1', name: 'Advanced' }
    ]
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    isLocked: false,
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
        options: ['Vrai', 'Faux', 'Peut-être']
      }
    ],
    ttsLang: 'fr-FR',
    defaultGreeting: 'Bonjour! Comment puis-je vous aider aujourd\'hui?',
    framework: 'CEFR',
    levels: [
      { code: 'A1', label: 'A1', name: 'Beginner' },
      { code: 'A2', label: 'A2', name: 'Elementary' },
      { code: 'B1', label: 'B1', name: 'Intermediate' },
      { code: 'B2', label: 'B2', name: 'Upper Int.' },
      { code: 'C1', label: 'C1', name: 'Advanced' }
    ]
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    isLocked: false,
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
        options: ['Verdadero', 'Falso']
      }
    ],
    ttsLang: 'es-ES',
    defaultGreeting: '¡Hola! ¿Cómo puedo ayudarte hoy?',
    framework: 'CEFR',
    levels: [
      { code: 'A1', label: 'A1', name: 'Beginner' },
      { code: 'A2', label: 'A2', name: 'Elementary' },
      { code: 'B1', label: 'B1', name: 'Intermediate' },
      { code: 'B2', label: 'B2', name: 'Upper Int.' },
      { code: 'C1', label: 'C1', name: 'Advanced' }
    ]
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    isLocked: false,
    exams: [
      {
        id: 'CILS',
        name: 'CILS',
        description: 'Certificazione di Italiano come Lingua Straniera.',
        specifications: `
          - STYLE: Standard Italian.
          - TONE: Natural and melodic.
          - CONTENT: Daily routines and social interactions.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['Vero', 'Falso']
      }
    ],
    ttsLang: 'it-IT',
    defaultGreeting: 'Ciao! Come posso aiutarti oggi?',
    framework: 'CEFR',
    levels: [
      { code: 'A1', label: 'A1', name: 'Beginner' },
      { code: 'A2', label: 'A2', name: 'Elementary' },
      { code: 'B1', label: 'B1', name: 'Intermediate' },
      { code: 'B2', label: 'B2', name: 'Upper Int.' },
      { code: 'C1', label: 'C1', name: 'Advanced' }
    ]
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹',
    isLocked: false,
    exams: [
      {
        id: 'CAPLE',
        name: 'CAPLE',
        description: 'Centro de Avaliação de Português Língua Estrangeira.',
        specifications: `
          - STYLE: European or Brazilian Portuguese options.
          - TONE: Clear and engaging.
          - CONTENT: Travel and lifestyle.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['Verdadeiro', 'Falso']
      }
    ],
    ttsLang: 'pt-PT',
    defaultGreeting: 'Olá! Como posso ajudar-te hoje?',
    framework: 'CEFR',
    levels: [
      { code: 'A1', label: 'A1', name: 'Beginner' },
      { code: 'A2', label: 'A2', name: 'Elementary' },
      { code: 'B1', label: 'B1', name: 'Intermediate' },
      { code: 'B2', label: 'B2', name: 'Upper Int.' },
      { code: 'C1', label: 'C1', name: 'Advanced' }
    ]
  },
  {
    code: 'zh',
    name: 'Mandarin',
    nativeName: '中文',
    flag: '🇨🇳',
    isLocked: false,
    exams: [
      {
        id: 'HSK',
        name: 'HSK',
        description: 'Hanyu Shuiping Kaoshi (Chinese Proficiency Test).',
        specifications: `
          - STYLE: Standard Mandarin Chinese.
          - TONE: Clear and formal where needed.
          - CONTENT: Daily life and academic settings.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['正确 (True)', '错误 (False)']
      }
    ],
    ttsLang: 'zh-CN',
    defaultGreeting: '你好！今天我能怎么帮你？',
    framework: 'HSK 3.0',
    levels: [
      { code: 'L1', label: 'Level 1', name: 'Beginner' },
      { code: 'L2', label: 'Level 2', name: 'Elementary' },
      { code: 'L3', label: 'Level 3', name: 'Intermediate' },
      { code: 'L4', label: 'Level 4-5', name: 'Upper Int.' },
      { code: 'L5', label: 'Level 6-7', name: 'Advanced' }
    ]
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    isLocked: false,
    exams: [
      {
        id: 'TOPIK',
        name: 'TOPIK',
        description: 'Test of Proficiency in Korean.',
        specifications: `
          - STYLE: Standard Korean with various politeness levels.
          - TONE: Authentic and varied.
          - CONTENT: Socializing, work, and public services.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['맞음 (True)', '틀림 (False)']
      }
    ],
    ttsLang: 'ko-KR',
    defaultGreeting: '안녕하세요! 오늘 무엇을 도와드릴까요?',
    framework: 'TOPIK',
    levels: [
      { code: 'L1', label: 'Level 1', name: 'Beginner' },
      { code: 'L2', label: 'Level 2', name: 'Elementary' },
      { code: 'L3', label: 'Level 3', name: 'Intermediate' },
      { code: 'L4', label: 'Level 4', name: 'Upper Int.' },
      { code: 'L5', label: 'Level 5', name: 'Advanced' }
    ]
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    isLocked: false,
    exams: [
      {
        id: 'JLPT',
        name: 'JLPT',
        description: 'Japanese-Language Proficiency Test.',
        specifications: `
          - STYLE: Natural Japanese with Keigo (polite) and casual forms.
          - TONE: Realistic and illustrative.
          - CONTENT: Living, studying, and working in Japan.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['正しい (True)', '間違い (False)']
      }
    ],
    ttsLang: 'ja-JP',
    defaultGreeting: 'こんにちは！今日はどのようなお手伝いができますか？',
    framework: 'JLPT',
    levels: [
      { code: 'N5', label: 'N5', name: 'Beginner' },
      { code: 'N4', label: 'N4', name: 'Elementary' },
      { code: 'N3', label: 'N3', name: 'Intermediate' },
      { code: 'N2', label: 'N2', name: 'Upper Int.' },
      { code: 'N1', label: 'N1', name: 'Advanced' }
    ]
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    isLocked: false,
    exams: [
      {
        id: 'TORFL',
        name: 'TORFL',
        description: 'Test of Russian as a Foreign Language.',
        specifications: `
          - STYLE: Modern standard Russian.
          - TONE: Natural and expressive.
          - CONTENT: Literature, history, and daily interactions.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['Верно', 'Неверно']
      }
    ],
    ttsLang: 'ru-RU',
    defaultGreeting: 'Привет! Чем я могу тебе сегодня помочь?',
    framework: 'TORFL / TRKI',
    levels: [
      { code: 'TEU', label: 'TEU', name: 'Beginner' },
      { code: 'TBU', label: 'TBU', name: 'Elementary' },
      { code: 'TRKI-1', label: 'TRKI-1', name: 'Intermediate' },
      { code: 'TRKI-2', label: 'TRKI-2', name: 'Upper Int.' },
      { code: 'TRKI-3', label: 'TRKI-3', name: 'Advanced' }
    ]
  },
  {
    code: 'ga',
    name: 'Irish',
    nativeName: 'Gaeilge',
    flag: '🇮🇪',
    isLocked: false,
    exams: [
      {
        id: 'TEG',
        name: 'TEG',
        description: 'Teastas Eorpach na Gaeilge.',
        specifications: `
          - STYLE: Authentic Irish from across the dialects.
          - TONE: Friendly and community-focused.
          - CONTENT: Culture, sport, and everyday Gaeilge.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['Fíor', 'Bréagach']
      }
    ],
    ttsLang: 'en-IE', // Using Irish English TTS if ga-IE isn't widely supported, but ga-IE is preferred if available
    defaultGreeting: 'Dia dhuit! Cén chaoi ar féidir liom cabhrú leat inniu?',
    framework: 'TEG',
    levels: [
      { code: 'A1', label: 'A1', name: 'Beginner' },
      { code: 'A2', label: 'A2', name: 'Elementary' },
      { code: 'B1', label: 'B1', name: 'Intermediate' },
      { code: 'B2', label: 'B2', name: 'Upper Int.' },
      { code: 'C1', label: 'C1', name: 'Advanced' }
    ]
  },
  {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    flag: '🇫🇮',
    isLocked: false,
    exams: [
      {
        id: 'YKI',
        name: 'YKI',
        description: 'Yleiset kielitutkinnot (National Certificates of Language Proficiency).',
        specifications: `
          - STYLE: Standard and spoken Finnish (puhekieli).
          - TONE: Clear and direct.
          - CONTENT: Work life and social integration in Finland.
          - QUESTIONS: Multiple choice.
        `,
        questionType: 'multiple-choice',
        options: ['Oikein', 'Väärin']
      }
    ],
    ttsLang: 'fi-FI',
    defaultGreeting: 'Hei! Kuinka voin auttaa sinua tänään?',
    framework: 'YKI',
    levels: [
      { code: '1', label: 'Basic (1)', name: 'Beginner' },
      { code: '2', label: 'Basic (2)', name: 'Elementary' },
      { code: '3', label: 'Intermed (3)', name: 'Intermediate' },
      { code: '4', label: 'Intermed (4)', name: 'Upper Int.' },
      { code: '5', label: 'Adv (5)', name: 'Advanced' }
    ]
  }
];

export const GREETINGS: Record<string, string> = {
  de: 'Hallo',
  fr: 'Bonjour',
  es: 'Hola',
  it: 'Ciao',
  pt: 'Olá',
  zh: '你好',
  ko: '안녕하세요',
  ja: 'こんにちは',
  ru: 'Привет',
  ga: 'Dia dhuit',
  fi: 'Hei'
};

export const getLanguageConfig = (code: string) => 
  SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0];
