import { GoogleGenAI } from "@google/genai";

/**
 * Centralized AI Service to manage model selection and initialization.
 * This allows changing the AI model across the entire application from a single point.
 */
export class AiService {
  /**
   * The default model used for most tasks (text generation, grammar, etc.)
   * Change this value to switch to a different model (e.g., "gemini-3.1-pro-preview").
   */
  private static DEFAULT_MODEL = "gemini-3-flash-preview";

  /**
   * The model used for audio/speech generation (TTS).
   */
  private static SPEECH_MODEL = "gemini-2.5-flash-preview-tts";

  /**
   * Returns a new GoogleGenAI instance with the API key from environment variables.
   */
  static getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables.");
    }
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Returns the name of the model to be used for general content generation.
   */
  static getModelName(): string {
    return this.DEFAULT_MODEL;
  }

  /**
   * Returns the name of the model to be used for speech generation.
   */
  static getSpeechModelName(): string {
    return this.SPEECH_MODEL;
  }
}
