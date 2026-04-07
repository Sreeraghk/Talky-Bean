import { GrammarExercise, LanguageLevel, GrammarModule, GrammarExerciseType } from "../types";
import { AiService } from "./AiService";
import { Type, ThinkingLevel } from "@google/genai";
import { getLanguageConfig } from "../config/languages";
import { SCENARIOS } from "../constants/scenarios";
import { UserService } from "./UserService";

export class GrammarService {
  private static STORAGE_KEY = 'easy_lang_grammar_modules';
  private static SCENARIO_COUNTER_KEY = 'easy_lang_scenario_counter';
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

  static getActiveGenerations(level: LanguageLevel, topicId: string, languageCode: string): number[] {
    return Object.keys(this.isGenerating)
      .filter(key => key.startsWith(`${languageCode}-${level}-${topicId}-`) && this.isGenerating[key])
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
        console.warn(`[GrammarService] Transient error (${status}). Retrying in ${delay}ms...`, message);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay * 1.5);
      }
      throw e;
    }
  }

  static async generateModule(
    level: LanguageLevel,
    topicId: string,
    topicName: string,
    index: number,
    languageCode: string
  ): Promise<GrammarModule> {
    const config = getLanguageConfig(languageCode);
    const ai = AiService.getClient();
    const profile = UserService.getProfile();
    
    // Scenario Logic: Global ascending order across all topics/modules
    const currentScenarioIndex = parseInt(localStorage.getItem(this.SCENARIO_COUNTER_KEY) || '0');
    const scenario = SCENARIOS[currentScenarioIndex % SCENARIOS.length];
    
    // Increment counter for next generation
    localStorage.setItem(this.SCENARIO_COUNTER_KEY, (currentScenarioIndex + 1).toString());

    // Exercise Type Logic based on index
    const exerciseTypes: GrammarExerciseType[] = [
      'fill-in-the-blank',
      'mix-and-match',
      'choose-correct-sentence',
      'word-order'
    ];
    const targetType = exerciseTypes[index % 4];
    
    // Dynamic schema tailored to the targetType to prevent AI confusion
    const contentProperties: any = {};
    if (targetType === 'fill-in-the-blank') {
      contentProperties.sentence = { type: Type.STRING };
      contentProperties.wordBank = { type: Type.ARRAY, items: { type: Type.STRING } };
      contentProperties.correctAnswers = { type: Type.ARRAY, items: { type: Type.STRING } };
    } else if (targetType === 'mix-and-match') {
      contentProperties.pairs = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            left: { type: Type.STRING },
            right: { type: Type.STRING }
          },
          required: ["id", "left", "right"]
        }
      };
    } else if (targetType === 'choose-correct-sentence') {
      contentProperties.question = { type: Type.STRING };
      contentProperties.options = { type: Type.ARRAY, items: { type: Type.STRING } };
      contentProperties.correctAnswerIndex = { type: Type.NUMBER };
    } else if (targetType === 'word-order') {
      contentProperties.question = { type: Type.STRING };
      contentProperties.shuffledWords = { type: Type.ARRAY, items: { type: Type.STRING } };
      contentProperties.correctAnswers = { type: Type.ARRAY, items: { type: Type.STRING } };
    }

    const dynamicSchema = {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        scenario: { type: Type.STRING },
        exercises: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: [targetType] },
              content: {
                type: Type.OBJECT,
                properties: contentProperties,
                required: Object.keys(contentProperties)
              },
              vocabularyHints: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    word: { type: Type.STRING },
                    translation: { type: Type.STRING }
                  },
                  required: ["word", "translation"]
                }
              },
              explanation: { type: Type.STRING }
            },
            required: ["type", "content", "explanation"]
          }
        }
      },
      required: ["title", "exercises"]
    };

    const prompt = `Act as an Expert ${config.name} Language Instructional Designer for a Mobile App.
    Generate Module #${index + 1} for the grammar topic "${topicName}" at CEFR level ${level}.
    
    CRITICAL: This module MUST contain EXACTLY 5 exercises of the type: '${targetType}'.
    
    THEMATIC FOCUS: This entire module MUST be deeply themed around the following scenario: "${scenario}".
    ${profile?.goals ? `USER CONTEXT: The user is learning for this reason: "${profile.goals}". Tailor the sentences and vocabulary to this context.` : ''}
    
    GRAMMAR FOCUS: The exercises MUST be strictly oriented to the grammar topic "${topicName}". Every single exercise should reinforce this specific rule.
    
    CONTENT DESIGN RULES:
    - Ensure vocabulary matches the CEFR level ${level}.
    - The module must contain EXACTLY 5 exercises.
    - UNIQUENESS: This is module #${index + 1}. Ensure it is unique and distinct from previous modules on this topic.
    - CRITICAL: The exercises MUST be designed for touch/click interaction. NO keyboard input allowed.
    - WORD BANK LIMIT: For 'fill-in-the-blank' and 'word-order', the 'wordBank' or 'shuffledWords' MUST NOT exceed 8 items.
    - NO REPETITION: Do NOT repeat the same word more than once in any array (wordBank, options, shuffledWords, etc.).
    - DISTRACTORS: Include 2-4 relevant distractors in the 'wordBank' for 'fill-in-the-blank'.
    - FIELD RESTRICTION: ONLY include the fields required for the '${targetType}' type. DO NOT include 'wordBank' or 'shuffledWords' if they are not part of the type definition.
    
    INTERACTIVE TYPES & DATA REQUIREMENTS for '${targetType}':
    ${targetType === 'fill-in-the-blank' ? `
    - type: 'fill-in-the-blank'
    - content: { sentence: string (with [blank]), wordBank: string[], correctAnswers: string[] }` : ''}
    ${targetType === 'mix-and-match' ? `
    - type: 'mix-and-match'
    - content: { pairs: [{id, left, right}] }` : ''}
    ${targetType === 'choose-correct-sentence' ? `
    - type: 'choose-correct-sentence'
    - content: { question: string, options: string[], correctAnswerIndex: number }` : ''}
    ${targetType === 'word-order' ? `
    - type: 'word-order'
    - content: { question: string (English sentence), shuffledWords: string[] (German words), correctAnswers: string[] (German words in correct order) }` : ''}
    
    Return a JSON object with a 'title' (the theme), 'scenario' (the one provided), and an 'exercises' array.
    Each exercise should have:
    - type: '${targetType}'
    - content: (as defined above for '${targetType}')
    - vocabularyHints: An array of objects {word, translation} for difficult words used in the exercise (including words used in the question, sentence, AND options). Be proactive in identifying words that a learner at level ${level} might find challenging.
    - explanation: A clear grammar rule explanation in English.
    `;

    const response = await this.retry(() => ai.models.generateContent({
      model: AiService.getModelName(),
      contents: prompt,
      config: {
        systemInstruction: `You are an expert language teacher. Always return valid JSON matching the requested schema. 
        MANDATORY: You MUST generate EXACTLY 5 exercises of the requested type. 
        MANDATORY: For 'fill-in-the-blank', the 'sentence' MUST contain '[blank]' placeholders matching the number of 'correctAnswers'. 
        MANDATORY: Keep all arrays (wordBank, shuffledWords, options, pairs) concise. MAXIMUM 8 items in any array. 
        MANDATORY: DO NOT REPEAT THE SAME WORD MORE THAN ONCE IN ANY ARRAY.
        MANDATORY: Do NOT include unnecessary fields in the 'content' object. Only include what is required for the specific exercise type.`,
        responseMimeType: "application/json",
        responseSchema: dynamicSchema as any,
        maxOutputTokens: 4096,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    }));

    let data;
    try {
      data = JSON.parse(response.text);
    } catch (e) {
      console.error("[GrammarService] Failed to parse AI response:", response.text);
      throw new Error("The AI returned an invalid response. Please try generating this module again.");
    }

    const id = Math.random().toString(36).substr(2, 9);

    // Validate and clean exercises
    const cleanedExercises = (data.exercises || []).map((ex: any, i: number) => {
      if (!ex || typeof ex !== 'object') return null;
      
      const cleaned = {
        ...ex,
        id: `${id}-ex-${i}`,
        topicId,
        isCompleted: false,
        content: ex.content || {},
        vocabularyHints: Array.isArray(ex.vocabularyHints) 
          ? ex.vocabularyHints.reduce((acc: any, curr: any) => {
              if (curr.word && curr.translation) acc[curr.word] = curr.translation;
              return acc;
            }, {})
          : {}
      };

      // Fix word-order correctAnswers if it's a string or needs splitting
      if (cleaned.type === 'word-order') {
        if (typeof cleaned.content.correctAnswers === 'string') {
          cleaned.content.correctAnswers = cleaned.content.correctAnswers.split(/\s+/).filter(Boolean);
        }
        if (!cleaned.content.shuffledWords && cleaned.content.correctAnswers) {
          cleaned.content.shuffledWords = [...cleaned.content.correctAnswers].sort(() => Math.random() - 0.5);
        }
      }

      // Safety valve: Truncate excessively large arrays to prevent UI issues
      if (cleaned.content.wordBank && cleaned.content.wordBank.length > 12) {
        cleaned.content.wordBank = cleaned.content.wordBank.slice(0, 12);
      }
      if (cleaned.content.shuffledWords && cleaned.content.shuffledWords.length > 12) {
        cleaned.content.shuffledWords = cleaned.content.shuffledWords.slice(0, 12);
      }
      if (cleaned.content.options && cleaned.content.options.length > 12) {
        cleaned.content.options = cleaned.content.options.slice(0, 12);
      }
      if (cleaned.content.pairs && cleaned.content.pairs.length > 12) {
        cleaned.content.pairs = cleaned.content.pairs.slice(0, 12);
      }

      // Fix missing wordBank for fill-in-the-blank
      if (cleaned.type === 'fill-in-the-blank') {
        if (!cleaned.content.wordBank && cleaned.content.correctAnswers) {
          cleaned.content.wordBank = [...cleaned.content.correctAnswers].sort(() => Math.random() - 0.5);
        }
        // Ensure sentence has [blank]
        if (cleaned.content.sentence && !cleaned.content.sentence.includes('[blank]')) {
          // If no [blank], try to find the first correct answer and replace it
          const firstAns = cleaned.content.correctAnswers?.[0];
          if (firstAns && cleaned.content.sentence.includes(firstAns)) {
            cleaned.content.sentence = cleaned.content.sentence.replace(firstAns, '[blank]');
          }
        }
      }

      // Fix missing correctAnswerIndex for multiple-choice, choose-correct-sentence, or true-false
      if (cleaned.type === 'multiple-choice' || cleaned.type === 'choose-correct-sentence' || cleaned.type === 'true-false') {
        if (cleaned.content.correctAnswerIndex === undefined && cleaned.content.options) {
          cleaned.content.correctAnswerIndex = 0; // Default to first
        }
      }

      // Fix missing shuffledWords for word-order
      if (cleaned.type === 'word-order') {
        if (!cleaned.content.shuffledWords && cleaned.content.correctAnswers) {
          cleaned.content.shuffledWords = [...cleaned.content.correctAnswers].sort(() => Math.random() - 0.5);
        }
      }

      return cleaned;
    }).filter((ex: any) => {
      if (!ex) return false;
      // Final validation - filter out truly broken ones
      if (ex.type === 'fill-in-the-blank') {
        return ex.content?.sentence && ex.content?.correctAnswers?.length > 0 && ex.content?.sentence.includes('[blank]');
      }
      if (ex.type === 'multiple-choice' || ex.type === 'choose-correct-sentence' || ex.type === 'true-false') {
        return ex.content?.question && ex.content?.options?.length >= 2;
      }
      if (ex.type === 'mix-and-match') {
        return ex.content?.pairs?.length > 0;
      }
      if (ex.type === 'word-order') {
        return ex.content?.correctAnswers?.length > 0;
      }
      return false;
    });

    console.log(`[GrammarService] Generated ${cleanedExercises.length} exercises with types:`, cleanedExercises.map(ex => ex.type));

    return {
      id,
      level,
      topicId,
      title: data.title || `${topicName} Module ${index + 1}`,
      scenario: data.scenario || scenario,
      exercises: cleanedExercises,
      isCompleted: false,
      createdAt: Date.now(),
      unlockedAt: Date.now(),
      index
    };
  }

  static deleteModule(languageCode: string, moduleId: string) {
    console.log(`[GrammarService] Deleting module: ${moduleId} for language: ${languageCode}`);
    const allModules = this.getModules(languageCode);
    const updated = allModules.filter(m => m.id !== moduleId);
    this.saveModules(updated, languageCode);
  }

  static clearTopicModules(languageCode: string, topicId: string) {
    console.log(`[GrammarService] Clearing modules for topic: ${topicId} for language: ${languageCode}`);
    const allModules = this.getModules(languageCode);
    const updated = allModules.filter(m => m.topicId !== topicId);
    this.saveModules(updated, languageCode);
  }

  static clearModules(languageCode: string) {
    console.log(`[GrammarService] Clearing ALL modules for language: ${languageCode}`);
    localStorage.removeItem(`${this.STORAGE_KEY}_${languageCode}`);
    this.notify();
  }

  static getModules(languageCode: string): GrammarModule[] {
    const saved = localStorage.getItem(`${this.STORAGE_KEY}_${languageCode}`);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }

  static saveModules(modules: GrammarModule[], languageCode: string) {
    const key = `${this.STORAGE_KEY}_${languageCode}`;
    console.log(`[GrammarService] Saving ${modules.length} modules to localStorage key: ${key}`);
    localStorage.setItem(key, JSON.stringify(modules));
    this.notify();
  }

  static async ensureInitialModules(level: LanguageLevel, topicId: string, languageCode: string): Promise<GrammarModule[]> {
    const modules = this.getModules(languageCode);
    return modules.filter(m => m.level === level && m.topicId === topicId);
  }

  static canGenerateMore(level: LanguageLevel, topicId: string, languageCode: string): { can: boolean; reason?: string } {
    const activeGenCount = Object.keys(this.isGenerating)
      .filter(key => key.startsWith(`${languageCode}-${level}-${topicId}-`) && this.isGenerating[key])
      .length;

    const modules = this.getModules(languageCode).filter(m => m.level === level && m.topicId === topicId);
    const unfinished = modules.filter(m => !m.isCompleted).length + activeGenCount;

    if (unfinished >= 4) {
      return { 
        can: false, 
        reason: `You can have a maximum of 4 unfinished or generating modules. Finish one to unlock more.`
      };
    }

    if (modules.length + activeGenCount >= 16) {
      return { can: false, reason: 'Maximum modules reached for this topic' };
    }

    return { can: true };
  }

  static async generateSingleModule(level: LanguageLevel, topicId: string, topicName: string, languageCode: string, index: number): Promise<GrammarModule> {
    const check = this.canGenerateMore(level, topicId, languageCode);
    if (!check.can) throw new Error(check.reason);

    const key = `${languageCode}-${level}-${topicId}-${index}`;
    if (this.isGenerating[key]) throw new Error('Generation already in progress');
    this.isGenerating[key] = true;
    this.notify();

    try {
      const module = await this.generateModule(level, topicId, topicName, index, languageCode);
      const allModules = this.getModules(languageCode);
      // Remove any existing module at this index/topic/level to prevent "interference"
      const filtered = allModules.filter(m => !(m.index === index && m.topicId === topicId && m.level === level));
      this.saveModules([...filtered, module], languageCode);
      return module;
    } finally {
      this.isGenerating[key] = false;
      this.notify();
    }
  }

  static async clearDoubt(
    question: string,
    exerciseContext: string,
    languageCode: string = 'de'
  ): Promise<string> {
    const config = getLanguageConfig(languageCode);
    const ai = AiService.getClient();
    const response = await ai.models.generateContent({
      model: AiService.getModelName(),
      contents: `The user has a doubt about a grammar exercise in ${config.name}.
      Exercise Context: ${exerciseContext}
      User Question: ${question}
      
      INSTRUCTIONS:
      - Be an encouraging, inclusive, and highly appealing language tutor.
      - REPLY IN BRIEF, CRISP AND IN A MEANINGFUL WAY WITH EXAMPLES.
      - THE ANSWERS HAVE TO BE STRAIGHT TO THE POINT.
      - Provide clear, concise explanations of the grammar rule.
      - PROACTIVELY use Markdown tables to compare forms, conjugations, or cases if relevant.
      - Use bullet points and bold text to highlight key patterns.
      - Keep the tone friendly and supportive.
      - If the user made a mistake in the context provided, gently explain WHY and how to fix it.
      - Ensure the response is easy to read on a mobile screen.
      `,
      config: {
        systemInstruction: `You are a world-class language tutor. You help students understand complex grammar rules in a simple, visual, and engaging way. 
        Always prioritize clarity and use interactive formatting like tables and lists to make data digestible.
        MANDATORY: Your replies must be brief, crisp, and straight to the point, always including meaningful examples.`,
        maxOutputTokens: 1024
      }
    });

    return response.text || "I'm sorry, I couldn't process your request. Please try again.";
  }
}
