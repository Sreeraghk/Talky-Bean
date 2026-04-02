export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type SpeakingStyle = 'Formal' | 'Casual';

export interface VocabularyWord {
  id: string;
  german: string;
  english: string;
  learnedAt: number;
}

export interface GrammarTip {
  id: string;
  german: string;
  explanation: string;
  learnedAt: number;
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

export interface GrammarExercise {
  id: string;
  topicId: string;
  type: 'fill-in-the-blank' | 'mix-and-match';
  content: {
    sentence?: string; // "Ich [blank] heute [blank]."
    wordBank?: string[]; // ["gehe", "nach Hause"]
    correctAnswers?: string[]; // ["gehe", "nach Hause"]
    pairs?: { id: string; left: string; right: string }[]; // For mix-and-match
  };
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

export interface ListeningQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  userAnswerIndex?: number;
}

export interface ListeningModule {
  id: string;
  level: LanguageLevel;
  title: string;
  script: string;
  audioData?: string; // Base64 audio data
  questions: ListeningQuestion[];
  isCompleted: boolean;
  score?: number;
  createdAt: number;
  unlockedAt?: number;
}
