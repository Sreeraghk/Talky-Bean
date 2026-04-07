import { GrammarTopic, RolePlayScenario, ListeningModule, LanguageLevel } from '../types';
import { GERMAN_GRAMMAR_TOPICS } from './de/grammarTopics';
import { GERMAN_ROLE_PLAY_SCENARIOS } from './de/rolePlayScenarios';
import { GERMAN_STARTER_LISTENING } from './de/starterListening';

export interface LanguageContent {
  grammarTopics: GrammarTopic[];
  rolePlayScenarios: RolePlayScenario[];
  starterListening: { [level in LanguageLevel]?: ListeningModule };
}

const LANGUAGE_DATA: Record<string, LanguageContent> = {
  de: {
    grammarTopics: GERMAN_GRAMMAR_TOPICS,
    rolePlayScenarios: GERMAN_ROLE_PLAY_SCENARIOS,
    starterListening: GERMAN_STARTER_LISTENING,
  },
  fr: {
    grammarTopics: [],
    rolePlayScenarios: [],
    starterListening: {},
  },
  es: {
    grammarTopics: [],
    rolePlayScenarios: [],
    starterListening: {},
  }
};

export function getLanguageContent(lang: string): LanguageContent {
  return LANGUAGE_DATA[lang] || LANGUAGE_DATA['de'];
}
