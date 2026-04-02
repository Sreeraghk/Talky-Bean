import { LanguageLevel, ListeningModule } from "../types";
import { AudioStorage } from "../lib/audioStorage";
import { getLanguageContent } from "../data";
import { AiService } from "./AiService";
import { Modality } from "@google/genai";

export class ListeningService {
  private static STORAGE_KEY = 'deutschbuddy_listening_modules';
  private static isGenerating: Record<string, boolean> = {};

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

  static async generateModule(level: LanguageLevel, existingTitles: string[] = []): Promise<ListeningModule> {
    const prompt = `Generate a German listening exam module for level ${level}. 
    
    CRITICAL: The topic must be unique and different from these existing modules: ${existingTitles.join(', ')}.
    
    The script should be between 30 seconds and 2 minutes long when spoken.
    The topic should be realistic and similar to Goethe or Telc exams.
    
    Provide the response in JSON format:
    {
      "title": "A unique, descriptive title",
      "script": "The full German script",
      "questions": [
        {
          "question": "Multiple choice question in German",
          "options": ["Option A", "Option B", "Option C", "Option D"],
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
    
    const audioResponse = await this.retry(() => ai.models.generateContent({
      model: AiService.getSpeechModelName(),
      contents: [{ parts: [{ text: data.script }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      },
    }));

    const audioData = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    const id = Math.random().toString(36).substr(2, 9);

    if (audioData) {
      await AudioStorage.set(id, audioData);
    }

    return {
      id,
      level,
      title: data.title,
      script: data.script,
      questions: data.questions.map((q: any, i: number) => ({ ...q, id: `q-${i}` })),
      isCompleted: false,
      createdAt: Date.now(),
      unlockedAt: Date.now(),
    };
  }

  static async getAudio(id: string): Promise<string | null> {
    return AudioStorage.get(id);
  }

  static getModules(): ListeningModule[] {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }

  static saveModules(modules: ListeningModule[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(modules));
  }

  static async ensureInitialModules(level: LanguageLevel, language: string = 'de'): Promise<ListeningModule[]> {
    const modules = this.getModules();
    const levelModules = modules.filter(m => m.level === level);
    
    if (levelModules.length === 0) {
      // Load starter module if available
      const languageContent = getLanguageContent(language);
      const starter = languageContent.starterListening[level];
      if (starter) {
        const initial = [starter];
        this.saveModules([...modules, ...initial]);
        return initial;
      }
    }
    
    return levelModules;
  }

  static canGenerateMore(level: LanguageLevel): { can: boolean; reason?: string } {
    const modules = this.getModules().filter(m => m.level === level);
    const unfinished = modules.filter(m => !m.isCompleted).length;
    
    if (unfinished > 2) {
      return { can: false, reason: 'Finish more modules first (max 2 unfinished allowed)' };
    }
    
    if (modules.length >= 100) {
      return { can: false, reason: 'Maximum modules reached' };
    }

    return { can: true };
  }

  static async generateNextBatch(level: LanguageLevel): Promise<ListeningModule[]> {
    const check = this.canGenerateMore(level);
    if (!check.can) throw new Error(check.reason);
    
    if (this.isGenerating[level]) throw new Error('Generation already in progress');
    this.isGenerating[level] = true;

    try {
      const newModules: ListeningModule[] = [];
      for (let i = 0; i < 5; i++) {
        const currentModules = this.getModules();
        const existingTitles = currentModules.filter(m => m.level === level).map(m => m.title);
        const module = await this.generateModule(level, existingTitles);
        newModules.push(module);
        this.saveModules([...this.getModules(), module]);
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
      }
      return newModules;
    } finally {
      this.isGenerating[level] = false;
    }
  }
}
