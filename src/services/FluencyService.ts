import { GoogleGenAI, Type } from "@google/genai";
import { AiService } from "./AiService";
import { FluencyAssessment, LanguageLevel } from "../types";
import { getLanguageConfig } from "../config/languages";
import { StorageService } from "./StorageService";
import { CloudStatsService } from "./CloudStatsService";

export class FluencyService {
  private static KEY = 'fluency_v2';
  private static ALL_FLUENCY_KEY = 'all_fluency_data';

  static getAssessment(languageCode: string): FluencyAssessment {
    return StorageService.load<FluencyAssessment>(this.KEY, languageCode, {
      overall: 0,
      listening: 0,
      speaking: 0,
      reading: 0,
      grammar: 0,
      lastAssessment: Date.now(),
      reasoning: "Your journey to native fluency begins today!"
    });
  }

  static saveAssessment(languageCode: string, assessment: FluencyAssessment) {
    StorageService.save(this.KEY, assessment, languageCode);
    
    // Save to a global map for easier cloud syncing
    const all = StorageService.load<Record<string, FluencyAssessment>>(this.ALL_FLUENCY_KEY, undefined, {});
    all[languageCode] = assessment;
    StorageService.save(this.ALL_FLUENCY_KEY, all);

    // Sync to cloud
    CloudStatsService.syncFluency(all);
    
    window.dispatchEvent(new CustomEvent('fluency-updated', { detail: { languageCode, assessment } }));
  }

  static resetAssessment(languageCode: string) {
    const initial = {
      overall: 0,
      listening: 0,
      speaking: 0,
      reading: 0,
      grammar: 0,
      lastAssessment: Date.now(),
      reasoning: "Your journey to native fluency begins today!"
    };
    this.saveAssessment(languageCode, initial);
  }

  /**
   * Evaluates user fluency based on recent interaction.
   * Uses Gemini to infer overall proficiency.
   */
  static async updateFluency(
    languageCode: string,
    level: LanguageLevel,
    interactionType: 'speaking' | 'listening' | 'grammar' | 'reading',
    data: any,
    retries = 3,
    delay = 2000
  ): Promise<FluencyAssessment> {
    const current = this.getAssessment(languageCode);
    const langConfig = getLanguageConfig(languageCode);
    const ai = AiService.getClient();

    // Limit data size to avoid prompt length issues
    const sanitizedData = { ...data };
    if (sanitizedData.userMessages && Array.isArray(sanitizedData.userMessages)) {
      // Keep only the last 15 messages to keep prompt size manageable and reduce token count
      sanitizedData.userMessages = sanitizedData.userMessages.slice(-15).map((m: any) => 
        typeof m === 'string' ? m.substring(0, 500) : m
      );
    }

    const prompt = `
      You are the "Native-Fluency Mirror" AI. Your task is to provide a STRINGENT and CONSERVATIVE evaluation of a user's progress toward 100% native-level proficiency in ${langConfig.name}.
      
      CRITICAL EVALUATION SYSTEM (CEFR BASED):
      - 0-20%: A1/A2 level. Basic survival phrases, fragmented sentences, high error rate.
      - 21-45%: B1 level. Can handle familiar topics, but lacks nuance and makes systematic grammar errors.
      - 46-70%: B2/C1 level. Professional proficiency, but clearly "non-native" in rhythm, idiom usage, or subtle grammar.
      - 71-90%: C2 level. Mastery of complex topics, highly sophisticated vocabulary.
      - 91-100%: NATIVE. Absolute perfection in accent (if applicable), slang, deep cultural idioms, and zero hesitation.
      
      SCORING PHILOSOPHY:
      - Be CYNICAL. It is VERY hard to gain even 1% of native fluency at higher levels.
      - If user makes basic errors (gender, case, basic conjugation), PENALIZE heavily.
      - If vocabulary is repetitive or "textbook", cap the score at 50%.
      - If user interaction is short or too simple, DO NOT award a high score even if accurate.
      
      USER INTERACTION DATA:
      - Module: ${interactionType}
      - Declared Level: ${level}
      - Interaction Details: ${JSON.stringify(sanitizedData)}
      
      CURRENT FLUENCY PROFILE (To be adjusted):
      - Overall: ${current.overall}%
      - Listening: ${current.listening}%
      - Speaking: ${current.speaking}%
      - Reading: ${current.reading}%
      - Grammar: ${current.grammar}%
      
      TASK:
      1. Analyze user responses for sophistication, structural integrity, and natural flow.
      2. provide a REALISTIC evaluated score. 
      3. If your evaluation suggests the user is at a LOWER level than their current profile, provide that LOWER score. We will adjust it gradually in the system.
      4. Provide a motivating but honest reasoning in English (max 20 words).
      
      Return the result in JSON format.
    `;

    try {
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overall: { type: Type.NUMBER, description: "Evaluated overall fluency (0-100)" },
              listening: { type: Type.NUMBER, description: "Evaluated listening (0-100)" },
              speaking: { type: Type.NUMBER, description: "Evaluated speaking (0-100)" },
              reading: { type: Type.NUMBER, description: "Evaluated reading (0-100)" },
              grammar: { type: Type.NUMBER, description: "Evaluated grammar (0-100)" },
              reasoning: { type: Type.STRING, description: "Hones feedback" }
            },
            required: ["overall", "listening", "speaking", "reading", "grammar", "reasoning"]
          }
        }
      });

      // Robust extraction
      let text = "";
      try {
        const resp = response as any;
        if (typeof resp.text === 'string') {
          text = resp.text;
        } else {
          const responseData = resp.response || resp;
          text = responseData.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text || "";
        }
      } catch (e) {
        const resp = response as any;
        const responseData = resp.response || resp;
        text = responseData.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text || "";
      }

      const cleanText = text.replace(/```json\n?|```/g, "").trim();
      const result = JSON.parse(cleanText || "{}");
      
      // GRADUAL ADJUSTMENT LOGIC
      // We don't jump straight to the AI evaluation to keep progress feeling stable.
      // Growth is capped, and decreases are gradual.
      const adjust = (currentVal: number, evaluatedVal: number) => {
        const diff = evaluatedVal - currentVal;
        if (diff > 0) {
          // Increase: Max 1.5% jump per interaction, weighted towards small gains
          return Math.min(100, currentVal + (diff * 0.15)); 
        } else if (diff < 0) {
          // Decrease: Gradual reduction (20% of the difference) to correct falsely high scores
          return Math.max(0, currentVal + (diff * 0.2)); 
        }
        return currentVal;
      };

      const newAssessment: FluencyAssessment = {
        overall: adjust(current.overall, result.overall || 0),
        listening: adjust(current.listening, result.listening || 0),
        speaking: adjust(current.speaking, result.speaking || 0),
        reading: adjust(current.reading || 0, result.reading || 0),
        grammar: adjust(current.grammar, result.grammar || 0),
        lastAssessment: Date.now(),
        reasoning: result.reasoning || current.reasoning
      };

      this.saveAssessment(languageCode, newAssessment);
      return newAssessment;
    } catch (error: any) {
      const status = error.status || error.code;
      const message = error.message || "";
      
      const isRetryable = 
        status === 429 || 
        status === 500 || 
        status === 503 || 
        status === "UNKNOWN" ||
        message.includes("Rpc failed") ||
        message.includes("xhr error");
      
      if (retries > 0 && isRetryable) {
        console.warn(`Fluency evaluation failed (${status}). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.updateFluency(languageCode, level, interactionType, data, retries - 1, delay * 2);
      }

      console.error("Fluency evaluation failed after retries:", error);
      return current;
    }
  }
}
