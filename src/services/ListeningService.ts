import { LanguageLevel, ListeningModule, ExamType, ListeningQuestion } from "../types";
import { AudioStorage } from "../lib/audioStorage";
import { AiService } from "./AiService";
import { Modality, Type } from "@google/genai";
import { getLanguageConfig } from "../config/languages";
import { SCENARIOS } from "../constants/scenarios";
import { UserService } from "./UserService";

export class ListeningService {
  private static STORAGE_KEY = 'langeasy_listening_modules';
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

  private static async retry<T>(fn: () => Promise<T>, retries = 5, delay = 5000): Promise<T> {
    try {
      return await fn();
    } catch (e: any) {
      const status = e.status || e.code;
      const message = e.message || "";
      
      const isRetryable = 
        status === 429 || status === 500 || status === 503 || 
        message.includes('429') || message.includes('500') || message.includes('503') ||
        message.includes('Rpc failed') || message.includes('Internal error') ||
        message.includes('xhr error') || message.includes('RESOURCE_EXHAUSTED');

      if (retries > 0 && isRetryable) {
        // Increase delay significantly for 429 to allow quota to reset
        const nextDelay = status === 429 || message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
          ? delay * 2 
          : delay * 1.5;
          
        console.warn(`[ListeningService] Transient error (${status}). Retrying in ${delay}ms...`, message);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, nextDelay);
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
    const profile = UserService.getProfile();
    
    // Determine Teil type based on index (Module 1/index 0 -> Teil 1, Module 2/index 1 -> Teil 2, Module 3/index 2 -> Teil 3)
    const teil = ((index % 3) + 1) as 1 | 2 | 3;
    
    // Scenario Logic: 50% from list, 50% from user preference
    let scenario = "";
    const useUserPreference = Math.random() > 0.5 && profile?.aiAssessment;
    
    if (useUserPreference) {
      scenario = `Personalized context based on user's goals: ${profile?.aiAssessment}`;
    } else {
      scenario = SCENARIOS[index % SCENARIOS.length];
    }
    
    const prompt = `Act as a "Speech-Optimized Text Engine." Your goal is to generate a ${config.name} listening exam for level ${level} following a standard proficiency pattern for **Teil ${teil}**.

    THEMATIC FOCUS: This exam must be based on the following scenario: "${scenario}".
    ${profile?.goals ? `USER CONTEXT: The user is learning for this reason: "${profile.goals}".` : ''}
    
    ### TEIL ${teil} SPECIFICATIONS:
    ${teil === 1 ? `
    - TYPE: Global Understanding.
    - STRUCTURE: 5 short, independent audio clips (30-45 seconds each).
    - CONTENT: Radio news, weather reports, or short journalistic snippets.
    - QUESTIONS: 1 Right/False question per clip (Total 5 questions).
    ` : teil === 2 ? `
    - TYPE: Detailed Understanding.
    - STRUCTURE: 1 long continuous recording (~3-4 minutes).
    - CONTENT: An authentic, casual interview or a lively talk show conversation (Host + Expert).
    - QUESTIONS: 10 Right/False questions following chronological order.
    ` : `
    - TYPE: Selective Understanding.
    - STRUCTURE: 5 short, independent audio clips (15-30 seconds each).
    - CONTENT: Everyday public announcements or phone messages (train delays, supermarket offers, voice mails).
    - QUESTIONS: 1 Right/False question per clip (Total 5 questions).
    `}

    ### AUTHENTICITY & NATURALNESS (CRITICAL):
    - CONVERSATIONAL FLOW: For dialogues, ensure speakers overlap occasionally (use [OVERLAP] tag). 
    - HUMAN ELEMENTS: Include natural filler words.
    - RHYTHM: Use punctuation to indicate natural pauses. Change sentence length to create rhythm.
    - NO TEXTBOOK LANGUAGE: Use casual, authentic phrases suitable for the scenario.
    - NO LABELS: NEVER include labels like "Speaker 1:" in the script text. The script must be PURE spoken words.
    - NO ANNOUNCEMENTS: Do not include "Welcome to the test" or meta-talk.

    ### OUTPUT FORMATTING RULES:
    - INSERT DISFLUENCIES: Occasionally add natural fillers appropriate for ${config.name}.
    - STRESS CUES: Use ALL CAPS for words that need a "tonic stress".
    - MARKERS: Use ONLY [PAUSE], [LAUGH], or [BREATH] for stage directions.
    
    Provide the response in JSON format. Translate Right/False options to ${config.name}.`;

    const schema: any = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        questions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["true-false"] },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.NUMBER },
              vocabularyHints: { type: Type.OBJECT, additionalProperties: { type: Type.STRING } },
              scriptIndex: { type: Type.NUMBER }
            },
            required: ["question", "type", "options", "correctAnswerIndex"]
          }
        }
      },
      required: ["title", "questions"]
    };

    if (teil === 2) {
      schema.properties.script = { type: Type.STRING };
      schema.required.push("script");
    } else {
      schema.properties.scripts = { type: Type.ARRAY, items: { type: Type.STRING } };
      schema.required.push("scripts");
    }

    const ai = AiService.getClient();
    const response = await ai.models.generateContent({
      model: AiService.getModelName(),
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: schema
      },
    });

    const text = response.text || "";
    // Strip markdown JSON blocks if present

    // Strip markdown JSON blocks if present
    const cleanText = text.replace(/```json\n?|```/g, "").trim();
    const data = JSON.parse(cleanText || "{}");
    const questions: ListeningQuestion[] = [];

    if (teil === 2) {
      if (!data.script) throw new Error("Teil 2 requires a 'script' field.");
      const audioId = await this.generateAudio(data.script, level, config.name);
      data.questions.forEach((q: any, i: number) => {
        questions.push({ ...q, id: `q-${index}-${teil}-${i}` });
      });

      return {
        id: Math.random().toString(36).substr(2, 9),
        level,
        examType,
        teil,
        title: data.title,
        scenario: scenario,
        script: data.script,
        audioId,
        questions,
        isCompleted: false,
        createdAt: Date.now(),
        unlockedAt: Date.now(),
        index,
      };
    } else {
      if (!data.scripts || data.scripts.length === 0) throw new Error("Teil 1/3 requires 'scripts'.");
      for (let i = 0; i < Math.min(5, data.scripts.length); i++) {
        const script = data.scripts[i];
        const audioId = await this.generateAudio(script, level, config.name);
        const q = (data.questions || []).find((question: any) => question.scriptIndex === i) || (data.questions ? data.questions[i] : null);
        
        if (q) {
          questions.push({
            ...q,
            id: `q-${index}-${teil}-${i}`,
            audioId,
            script
          });
        }
      }

      return {
        id: Math.random().toString(36).substr(2, 9),
        level,
        examType,
        teil,
        title: data.title,
        scenario: scenario,
        questions,
        isCompleted: false,
        createdAt: Date.now(),
        unlockedAt: Date.now(),
        index,
      };
    }
  }

  private static async generateAudio(script: string, level: LanguageLevel, languageName: string): Promise<string> {
    if (!script) return `WEB_TTS_FALLBACK:Script failed to generate.`;
    
    // Stage 1: Clean the script for TTS consumption
    const ttsScript = script
      .replace(/\[SPEAKER \d+\]:?/gi, '')
      .replace(/\[OVERLAP\]/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // STRICT NATIVE DEVICE ENGINE POLICY: 
    // Always use the phone's native Android/iOS engine via the browser locally.
    console.log(`[ListeningService] Hard-encoding Native Device Audio Policy for ${languageName}`);
    return `WEB_TTS_FALLBACK:${ttsScript}`;
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

  static deleteModule(id: string, languageCode: string) {
    const modules = this.getModules(languageCode);
    const updated = modules.filter(m => m.id !== id);
    this.saveModules(updated, languageCode);
    AudioStorage.delete(id);
  }

  static async ensureInitialModules(level: LanguageLevel, examType: ExamType, languageCode: string): Promise<ListeningModule[]> {
    let modules = this.getModules(languageCode);
    
    // Migration: Convert old Telc/Goethe modules to Standard for German
    if (languageCode === 'de') {
      let needsMigration = false;
      const migratedModules = modules.map(m => {
        if (m.examType === 'Telc' || m.examType === 'Goethe') {
          needsMigration = true;
          return { ...m, examType: 'Standard' };
        }
        return m;
      });
      
      if (needsMigration) {
        this.saveModules(migratedModules, languageCode);
        modules = migratedModules;
      }
    }

    return modules.filter(m => m.level === level && m.examType === (languageCode === 'de' ? 'Standard' : examType));
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
