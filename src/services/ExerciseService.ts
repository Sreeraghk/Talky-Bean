import { LanguageLevel, Exercise, VocabularyWord, GrammarTip } from "../types";
import { PerformanceService } from "./PerformanceService";
import { AiService } from "./AiService";
import { Type } from "@google/genai";
import { getLanguageConfig } from "../config/languages";

export class ExerciseService {
  static async generateAdaptiveExercise(
    level: LanguageLevel,
    vocabulary: VocabularyWord[],
    grammarTips: GrammarTip[],
    languageCode: string
  ): Promise<Exercise> {
    const overallPerformance = PerformanceService.getOverallPerformance();
    const langConfig = getLanguageConfig(languageCode);
    const langName = langConfig.name;
    
    // Choose type based on history or random
    const type = Math.random() > 0.5 ? 'vocabulary' : 'grammar';
    const items = type === 'vocabulary' ? vocabulary : grammarTips;
    
    if (items.length === 0) {
      // Fallback if no items learned yet
      return this.generateGenericExercise(level, type, languageCode);
    }

    // Select items needing practice
    const needingPracticeIds = PerformanceService.getItemsNeedingPractice(type, 3);
    const candidateItems = items.filter(i => needingPracticeIds.includes(i.id));
    const targetItem = candidateItems.length > 0 
      ? candidateItems[Math.floor(Math.random() * candidateItems.length)]
      : items[Math.floor(Math.random() * items.length)];

    const targetText = type === 'vocabulary' 
      ? (targetItem as VocabularyWord).word 
      : (targetItem as GrammarTip).rule;

    const prompt = `Generate a ${langName} ${type} exercise for level ${level}.
    
    Context:
    - Target Item: ${targetText}
    - User Performance: ${overallPerformance < 0.5 ? 'Struggling' : overallPerformance > 0.8 ? 'Advanced' : 'Intermediate'}
    - Difficulty Adjustment: ${overallPerformance < 0.5 ? 'Make it easier' : overallPerformance > 0.8 ? 'Make it more challenging' : 'Maintain current level'}
    
    The exercise should be a multiple-choice question testing the user's understanding of the target item in a realistic context.
    
    Provide the response in JSON format with the following structure:
    {
      "question": "The question in ${langName}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "A brief explanation of why the answer is correct and how it relates to the grammar/vocabulary rule.",
      "difficulty": 0.5
    }`;

    const ai = AiService.getClient();
    const response = await ai.models.generateContent({
      model: AiService.getModelName(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.NUMBER }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation", "difficulty"]
        }
      },
    });

    const data = JSON.parse(response.text);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      ...data,
      relatedItemId: targetItem.id
    };
  }

  private static async generateGenericExercise(level: LanguageLevel, type: 'vocabulary' | 'grammar', languageCode: string): Promise<Exercise> {
    const langConfig = getLanguageConfig(languageCode);
    const langName = langConfig.name;
    
    const prompt = `Generate a generic ${langName} ${type} exercise for level ${level}.
    The user hasn't learned any specific words yet, so choose a common topic for this level.
    
    Provide the response in JSON format with the following structure:
    {
      "question": "The question in ${langName}",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswerIndex": 0,
      "explanation": "A brief explanation.",
      "difficulty": 0.5
    }`;

    const ai = AiService.getClient();
    const response = await ai.models.generateContent({
      model: AiService.getModelName(),
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.NUMBER }
          },
          required: ["question", "options", "correctAnswerIndex", "explanation", "difficulty"]
        }
      },
    });

    const data = JSON.parse(response.text);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      ...data,
      relatedItemId: 'generic'
    };
  }
}
