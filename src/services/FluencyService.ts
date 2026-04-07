import { GoogleGenAI, Type } from "@google/genai";
import { AiService } from "./AiService";
import { FluencyAssessment, LanguageLevel } from "../types";
import { getLanguageConfig } from "../config/languages";

export class FluencyService {
  private static STORAGE_KEY = 'native_fluency_mirror_data';

  static getAssessment(): FluencyAssessment {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    
    return {
      overall: 0,
      listening: 0,
      speaking: 0,
      grammar: 0,
      lastAssessment: Date.now(),
      reasoning: "Your journey to native fluency begins today!"
    };
  }

  static saveAssessment(assessment: FluencyAssessment) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assessment));
    window.dispatchEvent(new CustomEvent('fluency-updated', { detail: assessment }));
  }

  static resetAssessment() {
    const initial = {
      overall: 0,
      listening: 0,
      speaking: 0,
      grammar: 0,
      lastAssessment: Date.now(),
      reasoning: "Your journey to native fluency begins today!"
    };
    this.saveAssessment(initial);
  }

  /**
   * Evaluates user fluency based on recent interaction.
   * Uses Gemini to infer overall proficiency.
   */
  static async updateFluency(
    languageCode: string,
    level: LanguageLevel,
    interactionType: 'speaking' | 'listening' | 'grammar',
    data: any
  ): Promise<FluencyAssessment> {
    const current = this.getAssessment();
    const langConfig = getLanguageConfig(languageCode);
    const ai = AiService.getClient();

    const prompt = `
      You are the "Native-Fluency Mirror" AI. Your task is to evaluate a user's progress toward 100% native-level proficiency in ${langConfig.name}.
      
      CRITICAL: You will be provided with the full conversation history. 
      - Use the AI's messages ONLY for context (to understand the difficulty of the conversation and the topic).
      - Evaluate the user's proficiency ONLY based on the user's responses.
      - If the interaction data contains AI responses or echoes of AI speech, IGNORE THEM. Focus strictly on the user's vocabulary, grammar, and fluency.
      
      NATIVE BENCHMARK (100%):
      - Vocabulary: Mastery of 10,000+ words, including deep idioms, regional slang, and technical jargon.
      - Sentence Complexity: Effortless use of nested clauses, passive voice, and subtle nuances.
      - Cultural Context: Understanding of humor, sarcasm, and cultural references.
      
      USER INTERACTION DATA:
      - Module: ${interactionType}
      - Declared Level: ${level}
      - Interaction Details: ${JSON.stringify(data)}
      
      CURRENT FLUENCY PROFILE:
      - Overall: ${current.overall}%
      - Listening: ${current.listening}%
      - Speaking: ${current.speaking}%
      - Grammar: ${current.grammar}%
      
      TASK:
      1. Analyze the user's responses for complexity, accuracy, and flow.
      2. Infer the user's overall fluency. If they only did ${interactionType}, use it as a proxy for their general skill level without penalizing them for skipping other modules.
      3. Provide a new weighted score (0-100). The growth should be cumulative and stable.
      4. Provide a short, motivating reasoning in English (max 20 words).
      
      Return the result in JSON format.
    `;

    try {
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall: { type: Type.NUMBER, description: "New overall fluency score (0-100)" },
              listening: { type: Type.NUMBER, description: "New listening score (0-100)" },
              speaking: { type: Type.NUMBER, description: "New speaking score (0-100)" },
              grammar: { type: Type.NUMBER, description: "New grammar score (0-100)" },
              reasoning: { type: Type.STRING, description: "Short feedback for the user" }
            },
            required: ["overall", "listening", "speaking", "grammar", "reasoning"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      
      const newAssessment: FluencyAssessment = {
        overall: Math.min(100, Math.max(current.overall, result.overall)), // Ensure cumulative growth
        listening: Math.min(100, Math.max(current.listening, result.listening)),
        speaking: Math.min(100, Math.max(current.speaking, result.speaking)),
        grammar: Math.min(100, Math.max(current.grammar, result.grammar)),
        lastAssessment: Date.now(),
        reasoning: result.reasoning
      };

      this.saveAssessment(newAssessment);
      return newAssessment;
    } catch (error) {
      console.error("Fluency evaluation failed:", error);
      return current;
    }
  }
}
