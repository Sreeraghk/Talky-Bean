export type LanguageLevel = string;
export type SpeakingStyle = 'Formal' | 'Casual';

export interface VocabularyWord {
  id: string;
  word: string;
  translation: string;
  learnedAt: number;
  languageCode: string;
  theme?: string;
  isBookmarked?: boolean;
  isRemovedFromTimeline?: boolean;
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
  overallFluency?: number;
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
  userAnswers?: string[];
  isSubmitted?: boolean;
  usedBankIndices?: number[];
  matches?: Record<string, string>;
  chatMessages?: { text: string; sender: 'user' | 'ai' }[];
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
  translations?: Record<string, string>;
}

export interface ConversationHistory {
  [scenarioId: string]: Message[];
}

export interface RolePlayScenario {
  id: string;
  title: string;
  description: string;
  context: string;
  imageUrl?: string;
  category?: 'Social' | 'Daily Life' | 'Career' | 'Travel' | 'Relationships';
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes?: number;
  activeLearnersCount?: number;
}

export type ExamType = string;

export interface ListeningQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswerIndex: number;
  userAnswerIndex?: number;
  vocabularyHints?: Record<string, string>;
  audioId?: string; // For Teil 1 and 3 where each question has its own clip
  script?: string; // For Teil 1 and 3
}

export interface ListeningModule {
  id: string;
  level: LanguageLevel;
  examType: ExamType;
  teil?: 1 | 2 | 3;
  title: string;
  scenario?: string;
  script?: string; // For Teil 2 (single long script)
  audioId?: string; // For Teil 2 (single long audio)
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
  reading: number;
  grammar: number;
  lastAssessment: number;
  reasoning: string;
}

export interface UserProfile {
  name: string;
  email: string;
  goals: string; // The user's description (max 250 words)
  nativeLanguage?: string;
  targetLanguage?: string;
  age?: string;
  experienceLevel?: string;
  aiAssessment?: string; // Gemini's short note about the user
  fluencyAssessment?: FluencyAssessment;
  lastUpdated: number;
}

export type VocabularyExerciseType = 'matching' | 'fill-in-the-blank' | 'multiple-choice';

export interface VocabularyExercise {
  id: string;
  type: VocabularyExerciseType;
  level: LanguageLevel;
  language: string;
  content: {
    pairs?: { id: string; left: string; right: string }[];
    sentence?: string;
    options?: string[];
    correctAnswer?: string;
    correctAnswerIndex?: number;
    word?: string; // For fill-in-the-blank
    questions?: any[]; // For multi-question exercises
  };
  isCompleted: boolean;
  score?: number;
  userAnswer?: any;
  currentQuestionIndex?: number;
  createdAt: number;
}

export type AdvancedExerciseType = 'mix-and-match' | 'context-master' | 'speed-choice';

export interface AdvancedExercise {
  id: string;
  type: AdvancedExerciseType;
  question: string;
  data: {
    pairs?: { id: string; term: string; definition: string }[]; // mix-and-match
    passage?: string; // context-master
    options?: string[]; // speed-choice / context-master
    correctAnswerIndex?: number;
    explanation: string;
    timeLimit?: number; // speed-choice
  };
  difficulty: number;
}

export interface ReadingQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options?: string[];
  correctAnswerIndex: number;
  vocabularyHints: Record<string, string>;
  explanation: string;
}

export interface ReadingExercise {
  id: string;
  passage: string;
  questions: ReadingQuestion[];
  vocabularyHints: Record<string, string>; // Comprehensive hints for the passage
  type: 'mcq' | 'tf';
}

export interface ReadingModule {
  id: string;
  level: LanguageLevel;
  moduleNumber: number;
  theme: string;
  exercises: ReadingExercise[];
  isCompleted: boolean;
  score?: number; // Total score across both exercises
  maxScore: number; // Usually 10
  createdAt: number;
  isFallback?: boolean;
  fallbackNotice?: string;
}

export type AssessmentMode = 'casual' | 'professional';

export type AssessmentQuestionFormat = 
  | 'format-1-mcq'
  | 'format-2-fill-blanks'
  | 'format-3-error-correction'
  | 'format-4-sentence-transformation'
  | 'format-5-word-order'
  | 'format-6-conversation-completion'
  | 'format-7-correct-sentence'
  | 'format-8-short-writing';

export interface AssessmentQuestion {
  id: string;
  format: AssessmentQuestionFormat;
  prompt: string;
  englishReference?: string; // MANDATORY for Format 5 word-order
  context?: string;          // Passage, dialogue, or scenario
  options?: string[];        // For MCQ, conversation completion, correct sentence
  correctAnswer: string | string[]; // Target string or array of blank values
  wordBank?: string[];       // For fill-in-blanks & word-order
  underlinedParts?: { id: string; text: string; isError: boolean; correction?: string }[]; // Format 3
  transformationRule?: string; // Format 4
  dialogue?: { speaker: string; text: string; isMissing?: boolean }[]; // Format 6
  writingCues?: string[];    // Format 8 requirements (e.g. "Use Akkusativ", "Include 'deshalb'")
  grammarCategory: string;   // e.g. "Dative Prepositions", "Subjunctive II"
  grammarRuleRef: string;
  explanation: string;
  timeLimitSeconds: number;  // 90s for F1-F5; 120s for F6-F8
  
  // User interaction & scoring state
  userAnswer?: any;
  isSubmitted?: boolean;
  isCorrect?: boolean;
  score?: number;            // 0 to 1
  timeSpentSeconds?: number;
}

export interface AdaptiveAssessmentModule {
  id: string;
  index: number;             // 0 to 99 (Modules 1-100)
  level: LanguageLevel;      // A1, A2, B1, B2, C1
  language: string;          // de, fr, es, it, etc.
  title: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  score?: number;            // 0 to 100
  questions: AssessmentQuestion[];
  unlockedAt?: number;
  completedAt?: number;
  mode?: AssessmentMode;
  currentQuestionIndex?: number;
  chatMessages?: { text: string; sender: 'user' | 'ai' }[];
  totalTimeSeconds?: number;
}
