export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2';

export interface VocabularyWord {
  id: string;
  german: string;
  english: string;
  learnedAt: number;
}

export interface ProgressData {
  date: string;
  wordsLearned: number;
  speakingTimeMinutes: number;
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

export const ROLE_PLAY_SCENARIOS: RolePlayScenario[] = [
  {
    id: 'doctor-doctor',
    title: 'Doctor to Doctor',
    description: 'Discussing a patient case in a hospital.',
    context: 'You are a senior doctor discussing a patient case with a junior doctor in a hospital.'
  },
  {
    id: 'senior-junior-doctor',
    title: 'Senior to Junior Doctor',
    description: 'Mentoring a junior doctor on hospital protocols.',
    context: 'You are a senior doctor mentoring a junior doctor on hospital protocols and patient care.'
  },
  {
    id: 'girlfriend-boyfriend',
    title: 'Girlfriend to Boyfriend',
    description: 'Planning a weekend trip together.',
    context: 'You are talking to your partner about planning a weekend trip to the mountains.'
  },
  {
    id: 'husband-wife',
    title: 'Husband to Wife',
    description: 'Discussing household chores and dinner plans.',
    context: 'You are discussing household chores and deciding what to cook for dinner.'
  },
  {
    id: 'business-client',
    title: 'Business Owner to Client',
    description: 'Negotiating a project timeline and budget.',
    context: 'You are a business owner negotiating a project timeline and budget with a potential client.'
  },
  {
    id: 'grammar-practice',
    title: 'Grammar Practice',
    description: 'Focus on specific German grammar rules and structures.',
    context: 'You are a German teacher helping a student practice specific grammar rules. Focus on correcting their mistakes and explaining the rules clearly.'
  },
  {
    id: 'daily-quiz',
    title: 'Daily Quiz',
    description: 'Test your knowledge with a quick daily challenge.',
    context: 'You are a quiz master. Ask the user 5 questions in German about common topics and provide feedback on their answers.'
  }
];
