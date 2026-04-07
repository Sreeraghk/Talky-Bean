import { LanguageLevel, ListeningModule, ExamType, ListeningQuestion } from "../types";
import { AudioStorage } from "../lib/audioStorage";
import { AiService } from "./AiService";
import { Modality } from "@google/genai";
import { getLanguageConfig } from "../config/languages";
import { SCENARIOS } from "../constants/scenarios";
import { UserService } from "./UserService";

export class ListeningService {
  private static STORAGE_KEY = 'easy_lang_listening_modules';
  private static isGenerating: Record<string, boolean> = {};
  private static listeners: (() => void)[] = [];

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notify() {
    this.listeners.forEach(l => l());
  }

  static getActiveGenerations(level: LanguageLevel, examType: ExamType, languageCode: string): number[] {
    return Object.keys(this.isGenerating)
      .filter(key => key.startsWith(`${languageCode}-${level}-${examType}-`) && this.isGenerating[key])
      .map(key => parseInt(key.split('-').pop() || '0'));
  }

  private static async retry<T>(fn: () => Promise<T>, retries = 5, delay = 3000): Promise<T> {
    try {
      return await fn();
    } catch (e: any) {
      const status = e.status || e.code;
      const message = e.message || "";
      
      const isRetryable = 
        status === 429 || status === 500 || status === 503 || 
        message.includes('429') || message.includes('500') || message.includes('503') ||
        message.includes('Rpc failed') || message.includes('Internal error') ||
        message.includes('xhr error');

      if (retries > 0 && isRetryable) {
        console.warn(`[ListeningService] Transient error (${status}). Retrying in ${delay}ms...`, message);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay * 1.5);
      }
      throw e;
    }
  }

  static async generateModule(
    level: LanguageLevel, 
    examType: ExamType, 
    languageCode: string,
    index: number, 
    existingTitles: string[] = []
  ): Promise<ListeningModule> {
    const config = getLanguageConfig(languageCode);
    const exam = config.exams.find(e => e.id === examType) || config.exams[0];
    const profile = UserService.getProfile();
    
    // Scenario Logic: 50% from list, 50% from user preference
    let scenario = "";
    const useUserPreference = Math.random() > 0.5 && profile?.aiAssessment;
    
    if (useUserPreference) {
      scenario = `Personalized context based on user's goals: ${profile?.aiAssessment}`;
    } else {
      // Rotate through the 50 scenarios
      scenario = SCENARIOS[index % SCENARIOS.length];
    }
    
    const prompt = `Act as a "Speech-Optimized Text Engine." Your goal is to generate a ${config.name} listening exam script for level ${level} following the ${exam.name} exam format. 
    
    CRITICAL: This is for the ${exam.name} exam. 
    
    THEMATIC FOCUS: This script must be based on the following scenario: "${scenario}".
    ${profile?.goals ? `USER CONTEXT: The user is learning for this reason: "${profile.goals}". Incorporate this into the script where possible.` : ''}
    
    The topic must be unique and different from these existing modules: ${existingTitles.join(', ')}.
    
    ### EXAM-SPECIFIC ARCHITECTURE:
    ${exam.specifications}
    
    ### LINGUISTIC PROPERTIES TO SIMULATE:
    1. PROSODY: Vary pitch and intonation. Use punctuation to guide the engine (e.g., "?" for rising pitch, "!" for high energy).
    2. NATURAL PAUSING: Use "..." for brief thought pauses and "-" for sudden mid-sentence shifts in thought.
    3. ADAPTIVE PACE: Write short, punchy sentences for excitement and longer, multi-clause sentences for complex explanations to break rhythmic monotony.
    4. VOCAL EMBODIMENT: Include "breath words" and conversational anchors appropriate for ${config.name}.
    5. EMOTIONAL COLORING: Match the word choice to the sentiment—use vivid, sensory language for "bright" tones and grounded, steady vocabulary for "serious" tones.
    6. ARTICULATION: Use natural ${config.name} contractions and casual connectors to avoid the "over-enunciated" robotic feel.

    ### OUTPUT FORMATTING RULES:
    - INSERT DISFLUENCIES: Occasionally add natural fillers appropriate for ${config.name} at the start of complex sentences to simulate real-time thinking.
    - STRESS CUES: Use ALL CAPS for words that need a "tonic stress".
    - RHYTHM CONTROL: Avoid uniform sentence lengths. Mix them up constantly.
    - NO META-TEXT: Do not include "Speaker:" or [Pauses]. Just provide the raw text formatted for the TTS engine.
    
    The script should be between 1 and 3 minutes long when spoken.
    
    Provide the response in JSON format:
    {
      "title": "A unique, descriptive title",
      "script": "The full ${config.name} script following the Speech-Optimized rules above.",
      "questions": [
        {
          "question": "Question text in ${config.name}",
          "type": "${exam.questionType}",
          "options": ${JSON.stringify(exam.options)},
          "correctAnswerIndex": 0
        }
      ]
    }`;

    const ai = AiService.getClient();
    const response = await this.retry(() => ai.models.generateContent({
      model: AiService.getModelName(),
      contents: prompt,
      config: { responseMimeType: "application/json" },
    }));

    const data = JSON.parse(response.text);
    
    const audioPrompt = `Speak the following ${config.name} script for a ${level} ${exam.name} listening exam. 
    
    CRITICAL INSTRUCTIONS FOR AUTHENTICITY:
    1. PACE: Speak at a natural, authentic speed for a ${level} learner. Not too fast, not robotic.
    2. PAUSES: Strictly follow the "..." and "-" markers for pauses and shifts.
    3. INTONATION: Use expressive, human-like intonation. Pay close attention to ALL CAPS words for emphasis.
    
    SCRIPT:
    ${data.script}`;

    const audioResponse = await this.retry(() => ai.models.generateContent({
      model: AiService.getSpeechModelName(),
      contents: [{ parts: [{ text: audioPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { 
            prebuiltVoiceConfig: { voiceName: 'Kore' } 
          },
        },
      },
    }));

    const audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      console.error('[ListeningService] No audio data returned from Gemini TTS. Response:', JSON.stringify(audioResponse));
      throw new Error('Failed to generate audio for this module. Please try again.');
    }

    const id = Math.random().toString(36).substr(2, 9);
    await AudioStorage.set(id, audioData);

    return {
      id,
      level,
      examType: exam.id,
      title: data.title,
      scenario: data.scenario || scenario,
      script: data.script,
      questions: data.questions.map((q: any, i: number) => ({ ...q, id: `q-${i}` })),
      isCompleted: false,
      createdAt: Date.now(),
      unlockedAt: Date.now(),
      index,
    };
  }

  static async getAudio(id: string): Promise<string | null> {
    return AudioStorage.get(id);
  }

  static getModules(languageCode: string): ListeningModule[] {
    const saved = localStorage.getItem(`${this.STORAGE_KEY}_${languageCode}`);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }

  static saveModules(modules: ListeningModule[], languageCode: string) {
    localStorage.setItem(`${this.STORAGE_KEY}_${languageCode}`, JSON.stringify(modules));
    this.notify();
  }

  static async ensureInitialModules(level: LanguageLevel, examType: ExamType, languageCode: string): Promise<ListeningModule[]> {
    const modules = this.getModules(languageCode);
    return modules.filter(m => m.level === level && m.examType === examType);
  }

  static canGenerateMore(level: LanguageLevel, examType: ExamType, languageCode: string): { can: boolean; reason?: string; remainingToFinish?: number } {
    const modules = this.getModules(languageCode).filter(m => 
      m.level === level && 
      m.examType === examType
    );
    
    const activeGenCount = Object.keys(this.isGenerating)
      .filter(key => key.startsWith(`${languageCode}-${level}-${examType}-`) && this.isGenerating[key])
      .length;

    const unfinished = modules.filter(m => !m.isCompleted).length + activeGenCount;
    
    if (unfinished >= 4) {
      return { 
        can: false, 
        reason: `You can have a maximum of 4 unfinished or generating modules. Finish one to unlock more.`,
        remainingToFinish: 1
      };
    }
    
    if (modules.length + activeGenCount >= 100) {
      return { can: false, reason: 'Maximum modules reached' };
    }

    return { can: true };
  }

  static async generateSingleModule(level: LanguageLevel, examType: ExamType, languageCode: string, index: number): Promise<ListeningModule> {
    const check = this.canGenerateMore(level, examType, languageCode);
    if (!check.can) throw new Error(check.reason);
    
    const key = `${languageCode}-${level}-${examType}-${index}`;
    if (this.isGenerating[key]) throw new Error('Generation already in progress');
    this.isGenerating[key] = true;
    this.notify();

    try {
      const currentModules = this.getModules(languageCode);
      const existingTitles = currentModules.filter(m => m.level === level && m.examType === examType).map(m => m.title);
      const module = await this.generateModule(level, examType, languageCode, index, existingTitles);
      this.saveModules([...this.getModules(languageCode), module], languageCode);
      return module;
    } finally {
      this.isGenerating[key] = false;
      this.notify();
    }
  }
}
