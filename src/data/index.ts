import { GrammarTopic, RolePlayScenario, GrammarExercise, ListeningModule, LanguageLevel } from '../types';
import { GERMAN_GRAMMAR_TOPICS } from './de/grammarTopics';
import { GERMAN_ROLE_PLAY_SCENARIOS } from './de/rolePlayScenarios';
import { GERMAN_STARTER_GRAMMAR } from './de/starterGrammar';
import { GERMAN_STARTER_LISTENING } from './de/starterListening';

export interface LanguageContent {
  grammarTopics: GrammarTopic[];
  rolePlayScenarios: RolePlayScenario[];
  starterGrammar: { [topicId: string]: GrammarExercise[] };
  starterListening: { [level in LanguageLevel]?: ListeningModule };
}

export const LANGUAGE_DATA: { [key: string]: LanguageContent } = {
  de: {
    grammarTopics: GERMAN_GRAMMAR_TOPICS,
    rolePlayScenarios: GERMAN_ROLE_PLAY_SCENARIOS,
    starterGrammar: GERMAN_STARTER_GRAMMAR,
    starterListening: GERMAN_STARTER_LISTENING,
  },
  // French and Spanish can be added here when ready
  fr: {
    grammarTopics: [],
    rolePlayScenarios: [],
    starterGrammar: {},
    starterListening: {},
  },
  es: {
    grammarTopics: [],
    rolePlayScenarios: [],
    starterGrammar: {},
    starterListening: {},
  }
};

export function getLanguageContent(lang: string): LanguageContent {
  return LANGUAGE_DATA[lang] || LANGUAGE_DATA['de'];
}
