export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type SpeakingStyle = 'Formal' | 'Casual';

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  learnedAt: number;
  languageCode: string;
  theme?: string;
}

export interface GrammarTip {
  id: string;
  rule: string;
  explanation: string;
  learnedAt: number;
  languageCode: string;
}

export interface ProgressData {
  date: string;
  wordsLearned: number;
  speakingTimeMinutes: number;
  exercisesCompleted?: number;
  averageScore?: number;
}

export interface PerformanceRecord {
  itemId: string; // ID of VocabularyWord or GrammarTip
  type: 'vocabulary' | 'grammar';
  successCount: number;
  failCount: number;
  lastAttempted: number;
  difficultyScore: number; // 0 to 1, where 1 is hardest
}

export interface Exercise {
  id: string;
  type: 'vocabulary' | 'grammar';
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty: number; // 0 to 1
  relatedItemId: string;
}

export interface GrammarTopic {
  id: string;
  level: LanguageLevel;
  name: string;
  isCompleted: boolean;
  category: 'Major' | 'MixMatch' | 'FinalIntegration';
}

export type GrammarExerciseType = 'fill-in-the-blank' | 'mix-and-match' | 'multiple-choice' | 'word-order' | 'choose-correct-sentence' | 'true-false';

export interface GrammarExercise {
  id: string;
  topicId: string;
  type: GrammarExerciseType;
  content: {
    sentence?: string; // "Ich [blank] heute [blank]."
    wordBank?: string[]; // ["gehe", "nach Hause"]
    correctAnswers?: string[]; // ["gehe", "nach Hause"]
    pairs?: { id: string; left: string; right: string }[]; // For mix-and-match
    question?: string; // For multiple-choice or choose-correct-sentence
    options?: string[]; // For multiple-choice or choose-correct-sentence
    correctAnswerIndex?: number; // For multiple-choice or choose-correct-sentence
    shuffledWords?: string[]; // For word-order
  };
  vocabularyHints?: Record<string, string>; // German word -> English meaning
  explanation: string;
  isCompleted: boolean;
  score?: number;
}

export interface GrammarBatch {
  id: string;
  topicId: string;
  exercises: GrammarExercise[];
  createdAt: number;
}

export interface GrammarModule {
  id: string;
  level: LanguageLevel;
  topicId: string;
  title: string;
  scenario?: string;
  exercises: GrammarExercise[];
  isCompleted: boolean;
  score?: number;
  createdAt: number;
  unlockedAt?: number;
  index: number; // 0-19
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
  studyNotes?: string;
}

export interface ConversationHistory {
  [scenarioId: string]: Message[];
}

export interface RolePlayScenario {
  id: string;
  title: string;
  description: string;
  context: string;
}

export type ExamType = string;

export interface ListeningQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswerIndex: number;
  userAnswerIndex?: number;
}

export interface ListeningModule {
  id: string;
  level: LanguageLevel;
  examType: ExamType;
  title: string;
  scenario?: string;
  script: string;
  audioData?: string; // Base64 audio data
  questions: ListeningQuestion[];
  isCompleted: boolean;
  score?: number;
  createdAt: number;
  unlockedAt?: number;
  index: number; // 0-99
}

export interface FluencyAssessment {
  overall: number; // 0-100
  listening: number;
  speaking: number;
  grammar: number;
  lastAssessment: number;
  reasoning: string;
}

export interface UserProfile {
  name: string;
  email: string;
  goals: string; // The user's description (max 250 words)
  aiAssessment?: string; // Gemini's short note about the user
  fluencyAssessment?: FluencyAssessment;
  lastUpdated: number;
}
