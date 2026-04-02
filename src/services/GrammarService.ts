import { GrammarExercise, LanguageLevel } from "../types";
import { getLanguageContent } from "../data";
import { AiService } from "./AiService";
import { Type } from "@google/genai";

export class GrammarService {
  static async generateExercises(
    topicId: string,
    topicName: string,
    level: LanguageLevel,
    language: string = 'de'
  ): Promise<GrammarExercise[]> {
    // Check starter content first
    const languageContent = getLanguageContent(language);
    const starter = languageContent.starterGrammar[topicId];
    if (starter) {
      return starter;
    }

    const ai = AiService.getClient();
    const response = await ai.models.generateContent({
      model: AiService.getModelName(),
      contents: `Generate 5 playful grammar exercises for the topic "${topicName}" at ${level} level in ${language === 'de' ? 'German' : language}.
      The exercises should be either 'fill-in-the-blank' or 'mix-and-match'.
      
      For 'fill-in-the-blank':
      - Use [blank] for the missing word(s).
      - Provide a wordBank with the correct words and some distractors.
      - Provide the correctAnswers in order.
      
      For 'mix-and-match':
      - Provide 4-5 pairs of phrases that need to be matched (e.g., subject and verb, or two halves of a sentence).
      
      Return a JSON array of exercises.`,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 2048,
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ['fill-in-the-blank', 'mix-and-match'] },
              content: {
                type: Type.OBJECT,
                properties: {
                  sentence: { type: Type.STRING, description: "Only for fill-in-the-blank" },
                  wordBank: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswers: { type: Type.ARRAY, items: { type: Type.STRING } },
                  pairs: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        left: { type: Type.STRING },
                        right: { type: Type.STRING }
                      }
                    }
                  }
                }
              },
              explanation: { type: Type.STRING }
            },
            required: ['type', 'content', 'explanation']
          }
        }
      }
    });

    try {
      const text = response.text.trim();
      // Basic cleanup in case of markdown blocks
      const jsonStr = text.startsWith('```json') ? text.replace(/```json|```/g, '').trim() : text;
      const data = JSON.parse(jsonStr);
      return data.map((ex: any, index: number) => ({
        ...ex,
        id: `${topicId}-${Date.now()}-${index}`,
        topicId: topicId,
        isCompleted: false
      }));
    } catch (error) {
      console.error('Failed to parse exercises:', error, 'Raw text:', response.text);
      throw new Error('Failed to generate valid exercises. Please try again.');
    }
  }

  static async clearDoubt(
    question: string,
    exerciseContext: string,
    language: string = 'German'
  ): Promise<string> {
    const ai = AiService.getClient();
    const response = await ai.models.generateContent({
      model: AiService.getModelName(),
      contents: `The user has a doubt about a grammar exercise in ${language}.
      Exercise Context: ${exerciseContext}
      User Question: ${question}
      
      Provide a clear, helpful explanation in English, using ${language} examples where appropriate.`
    });

    return response.text;
  }
}
