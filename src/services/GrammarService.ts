import { GrammarExercise, LanguageLevel, GrammarModule, GrammarExerciseType } from "../types";
import { AiService } from "./AiService";
import { Type } from "@google/genai";
import { getLanguageConfig, SUPPORTED_LANGUAGES } from "../config/languages";
import { SCENARIOS } from "../constants/scenarios";
import { UserService } from "./UserService";
import { StorageService } from "./StorageService";
import { NATIVE_LANGUAGE_NAMES } from "./LocalizationService";
import { GrammarExerciseValidator } from "./GrammarExerciseValidator";
import { GrammarDiagnosticLogger } from "./GrammarDiagnosticLogger";
import { ApiService, API_ENDPOINTS } from "./ApiService";

export interface GrammarDoubtContext {
  exerciseIndex?: number;
  totalExercises?: number;
  topicName?: string;
  moduleTitle?: string;
  level?: string;
  exerciseType?: string;
  questionOrSentence: string;
  options?: string[];
  wordBank?: string[];
  correctAnswer: string;
  userAnswer?: string;
  isSubmitted?: boolean;
  score?: number | null;
  explanation?: string;
  vocabularyHints?: Record<string, string>;
  recentChatHistory?: { text: string; sender: 'user' | 'ai' }[];
}

export class GrammarService {
  private static STORAGE_KEY = 'langeasy_grammar_modules';
  private static SCENARIO_COUNTER_KEY = 'langeasy_scenario_counter';
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

  /**
   * Builds format-tailored JSON schema with explicit descriptions and requirements.
   * Prevents missing or misplaced fields and enforces exact tokens (e.g. '[blank]').
   */
  private static buildExerciseSchema(targetType: GrammarExerciseType) {
    const contentProperties: Record<string, any> = {};
    const requiredContentFields: string[] = [];

    if (targetType === 'fill-in-the-blank') {
      contentProperties.sentence = {
        type: Type.STRING,
        description: "The complete sentence in the target language with EXACTLY one or more literal '[blank]' tokens marking the missing word(s). Example: 'Ich gebe [blank] Mann den Schlüssel.' NEVER use '___', '[...]', '(blank)', or omit '[blank]'."
      };
      contentProperties.correctAnswers = {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "The exact word(s) that correctly fill each '[blank]' in order. The number of items in this array MUST EXACTLY match the number of '[blank]' placeholders in 'sentence'."
      };
      contentProperties.wordBank = {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Between 3 and 8 distinct words in the target language. MUST contain ALL items from 'correctAnswers' plus 2 to 4 plausible distractors."
      };
      requiredContentFields.push('sentence', 'correctAnswers', 'wordBank');
    } else if (targetType === 'mix-and-match') {
      contentProperties.pairs = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING, description: "Unique identifier for this pair (e.g. 'pair-1', 'pair-2')" },
            left: { type: Type.STRING, description: "Left prompt or phrase in the target language" },
            right: { type: Type.STRING, description: "Right matching complement or translation" }
          },
          required: ["id", "left", "right"]
        },
        description: "Array of 3 to 5 matching pairs. Each pair must have unique 'id', unique 'left', and unique 'right'."
      };
      requiredContentFields.push('pairs');
    } else if (targetType === 'choose-correct-sentence') {
      contentProperties.question = {
        type: Type.STRING,
        description: "Instruction prompt in the learner's native language (e.g. 'Choose the sentence that correctly uses the dative case:')."
      };
      contentProperties.options = {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "2 to 4 distinct, complete sentences in the target language. Do NOT include '[blank]'."
      };
      contentProperties.correctAnswerIndex = {
        type: Type.INTEGER,
        description: "Zero-based integer index of the single correct sentence in the 'options' array (0, 1, 2, or 3)."
      };
      requiredContentFields.push('question', 'options', 'correctAnswerIndex');
    } else if (targetType === 'word-order') {
      contentProperties.question = {
        type: Type.STRING,
        description: "The prompt sentence in the learner's native language to be translated into the target language."
      };
      contentProperties.shuffledWords = {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Randomized array of individual words in the target language that comprise the sentence. Maximum 8 words."
      };
      contentProperties.correctAnswers = {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "The exact same words as in 'shuffledWords', ordered into the grammatically correct target language sentence."
      };
      requiredContentFields.push('question', 'shuffledWords', 'correctAnswers');
    }

    return {
      type: Type.OBJECT,
      properties: {
        type: { type: Type.STRING, enum: [targetType] },
        content: {
          type: Type.OBJECT,
          properties: contentProperties,
          required: requiredContentFields
        },
        vocabularyHints: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: "Challenging vocabulary word from the exercise in the target language" },
              translation: { type: Type.STRING, description: "Translation of the word in the learner's native language" }
            },
            required: ["word", "translation"]
          },
          description: "List of difficult words and translations for learner reference."
        },
        explanation: {
          type: Type.STRING,
          description: "Clear, concise grammatical explanation in the learner's native language explaining why the correct answer is right."
        }
      },
      required: ["type", "content", "explanation"]
    };
  }

  private static buildModuleSchema(targetType: GrammarExerciseType, scenario: string) {
    return {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "Short engaging scenario title for this module (e.g. 'At the Gas Station: Dative Practice'). Maximum 6 words."
        },
        scenario: {
          type: Type.STRING,
          enum: [scenario],
          description: "Must be exactly the provided scenario string."
        },
        exercises: {
          type: Type.ARRAY,
          items: this.buildExerciseSchema(targetType),
          description: "Array of exercises matching the target type."
        }
      },
      required: ["title", "exercises"]
    };
  }

  private static buildRegenerationSchema(targetType: GrammarExerciseType) {
    return {
      type: Type.OBJECT,
      properties: {
        exercises: {
          type: Type.ARRAY,
          items: this.buildExerciseSchema(targetType),
          description: "Array of replacement exercises matching the target type."
        }
      },
      required: ["exercises"]
    };
  }

  /**
   * Constructs prompt with format-specific rules, strict negative constraints,
   * and optional targeted feedback from previous validation failures.
   */
  private static buildPrompt(
    targetType: GrammarExerciseType,
    count: number,
    topicName: string,
    level: LanguageLevel,
    scenario: string,
    targetName: string,
    nativeName: string,
    index: number,
    userGoals?: string,
    feedbackErrors?: string[]
  ): string {
    let typeSpecificRules = '';
    if (targetType === 'fill-in-the-blank') {
      typeSpecificRules = `
FORMAT REQUIREMENTS FOR 'fill-in-the-blank':
- The 'sentence' field MUST contain literal '[blank]' token(s) indicating the missing word(s).
- STRICT NEGATIVE CONSTRAINT: NEVER use underscores ('___'), ellipsis ('[...]'), parentheses ('(blank)'), braces ('{blank}'), or '[BLANK]'. The token must be exactly lowercase '[blank]'.
- NEVER output a complete sentence without '[blank]' placeholders.
- The number of items in 'correctAnswers' MUST EXACTLY equal the number of '[blank]' tokens in 'sentence'.
- 'wordBank' MUST contain ALL words from 'correctAnswers' plus 2 to 4 plausible distractors in ${targetName} (between 3 and 8 words total).
- Example:
  sentence: "Ich helfe [blank] Mann im Laden."
  correctAnswers: ["dem"]
  wordBank: ["dem", "den", "der", "das"]`;
    } else if (targetType === 'mix-and-match') {
      typeSpecificRules = `
FORMAT REQUIREMENTS FOR 'mix-and-match':
- Provide 3 to 5 matching pairs in 'pairs'.
- Each pair must be an object: { "id": "p1", "left": "${targetName} item", "right": "matching counterpart" }.
- All 'id' values must be unique. All 'left' values must be distinct. All 'right' values must be distinct.`;
    } else if (targetType === 'choose-correct-sentence') {
      typeSpecificRules = `
FORMAT REQUIREMENTS FOR 'choose-correct-sentence':
- 'question' is a clear instruction in ${nativeName} (e.g. "Which sentence correctly uses the dative case?").
- 'options' must contain 2 to 4 complete, distinct sentences in ${targetName}. Do NOT use '[blank]'.
- 'correctAnswerIndex' must be the 0-based integer index (0, 1, 2, or 3) indicating the single grammatically correct sentence in 'options'.`;
    } else if (targetType === 'word-order') {
      typeSpecificRules = `
FORMAT REQUIREMENTS FOR 'word-order':
- 'question' is the full sentence in ${nativeName} to be translated.
- 'shuffledWords' is an array of individual ${targetName} words in scrambled order (max 8 words).
- 'correctAnswers' is an array of the exact same words in 'shuffledWords', ordered into the grammatically correct ${targetName} sentence.`;
    }

    let feedbackSection = '';
    if (feedbackErrors && feedbackErrors.length > 0) {
      feedbackSection = `
PREVIOUS ATTEMPT VALIDATION FAILURES TO FIX IMMEDIATELY:
The previous attempt was rejected due to the following specific validation errors:
${feedbackErrors.map(e => `- ${e}`).join('\n')}
Do NOT repeat these mistakes! Ensure all generated exercises strictly follow the schema and rules.`;
    }

    return `Act as an Expert ${targetName} Language Instructional Designer for a Mobile App.
Generate EXACTLY ${count} exercise(s) of type '${targetType}' for the grammar topic "${topicName}" at CEFR level ${level}.

SCENARIO THEME: Deeply theme every exercise around: "${scenario}".
${userGoals ? `USER GOAL: "${userGoals}". Tailor sentences and vocabulary to this context.` : ''}

GRAMMAR FOCUS: Strictly focus on "${topicName}". Every exercise must directly practice this grammar concept.

${typeSpecificRules}
${feedbackSection}

VOCABULARY HINTS & EXPLANATIONS:
- 'vocabularyHints': Array of { "word": string, "translation": string } for any challenging words used in the question, sentence, or options. Translations MUST be in ${nativeName}.
- 'explanation': Clear explanation in ${nativeName} of why the correct answer is grammatically right according to ${topicName} rules.

Ensure CEFR ${level} difficulty and clean, natural language. Return JSON matching the requested schema.`;
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
    const model = AiService.getModelName();
    const profile = UserService.getProfile();
    
    // Scenario Logic: Global ascending order across all topics/modules
    const currentScenarioIndex = parseInt(localStorage.getItem(this.SCENARIO_COUNTER_KEY) || '0');
    const scenario = SCENARIOS[currentScenarioIndex % SCENARIOS.length];
    localStorage.setItem(this.SCENARIO_COUNTER_KEY, (currentScenarioIndex + 1).toString());

    // Exercise Type Logic based on index
    const exerciseTypes: GrammarExerciseType[] = [
      'fill-in-the-blank',
      'mix-and-match',
      'choose-correct-sentence',
      'word-order'
    ];
    const targetType = exerciseTypes[index % 4];

    const nativeLang = StorageService.load<string>('native_language', undefined, 'en');
    const nativeName = NATIVE_LANGUAGE_NAMES[nativeLang] || 'English';
    const targetName = config.name;
    const moduleId = Math.random().toString(36).substr(2, 9);

    const TARGET_EXERCISE_COUNT = 5;
    const MAX_ATTEMPTS = 3; // 1 initial attempt + up to 2 targeted bounded regenerations
    const collectedExercises: GrammarExercise[] = [];
    let moduleTitle = `${topicName} Module ${index + 1}`;
    let moduleScenario = scenario;
    let accumulatedFeedback: string[] = [];

    const startTime = Date.now();

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const neededCount = TARGET_EXERCISE_COUNT - collectedExercises.length;
      if (neededCount <= 0) break;

      const isInitial = attempt === 1;
      const prompt = this.buildPrompt(
        targetType,
        neededCount,
        topicName,
        level,
        scenario,
        targetName,
        nativeName,
        index,
        profile?.goals,
        isInitial ? undefined : accumulatedFeedback
      );

      const schema = isInitial 
        ? this.buildModuleSchema(targetType, scenario)
        : this.buildRegenerationSchema(targetType);

      const systemInstruction = `You are an expert ${targetName} language teacher. Return valid JSON matching the requested schema.
MANDATORY: You must generate EXACTLY ${neededCount} exercises of type '${targetType}'.
MANDATORY: For 'fill-in-the-blank', the 'sentence' MUST contain literal '[blank]' placeholders matching 'correctAnswers.length'.
MANDATORY: For 'choose-correct-sentence', do NOT use '[blank]'. Provide full sentences with correctAnswerIndex.
MANDATORY: For 'mix-and-match', ensure unique IDs, lefts, and rights.
MANDATORY: For 'word-order', shuffledWords and correctAnswers must be matching permutations.`;

      let rawResponse: any;
      try {
        rawResponse = await this.retry(() => ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: schema as any,
            maxOutputTokens: 4096
          }
        }));
      } catch (callErr: any) {
        console.error(`[GrammarService] Gemini API call error on attempt ${attempt}:`, callErr);
        if (attempt === MAX_ATTEMPTS && collectedExercises.length === 0) {
          throw callErr;
        }
        continue;
      }

      let parsedData: any;
      try {
        const text = (rawResponse as any).text || "";
        const cleanText = text.replace(/```json\n?|```/g, "").trim();
        parsedData = JSON.parse(cleanText);
      } catch (parseErr) {
        console.warn(`[GrammarService] Failed to parse JSON on attempt ${attempt}:`, parseErr);
        accumulatedFeedback = ["Response was not valid JSON. Ensure strict JSON output conforming to schema."];
        continue;
      }

      if (isInitial && parsedData.title) {
        const cleanTitle = String(parsedData.title).trim();
        if (cleanTitle && cleanTitle.length <= 60 && !cleanTitle.includes('\n')) {
          moduleTitle = cleanTitle;
        }
      }
      // Always enforce the clean canonical scenario from SCENARIOS
      moduleScenario = scenario;

      const rawList = Array.isArray(parsedData.exercises) ? parsedData.exercises : [];
      const batchResult = GrammarExerciseValidator.validateBatch(
        rawList,
        targetType,
        topicId,
        `${moduleId}-a${attempt}`
      );

      // Append valid exercises
      for (const validEx of batchResult.validExercises) {
        if (collectedExercises.length < TARGET_EXERCISE_COUNT) {
          validEx.id = `${moduleId}-ex-${collectedExercises.length}`;
          collectedExercises.push(validEx);
        }
      }

      const totalReceived = rawList.length;
      const invalidCount = batchResult.invalidExercises.length;

      if (collectedExercises.length >= TARGET_EXERCISE_COUNT) {
        GrammarDiagnosticLogger.logEvent({
          model,
          topicId,
          level,
          format: targetType,
          attempt,
          totalReceived,
          validCount: collectedExercises.length,
          invalidCount,
          targetCount: TARGET_EXERCISE_COUNT,
          failures: batchResult.invalidExercises,
          action: 'accepted',
          durationMs: Date.now() - startTime
        });
        break;
      } else {
        // Collect specific feedback for next targeted bounded regeneration
        accumulatedFeedback = batchResult.invalidExercises.flatMap(inv => 
          inv.errors.map(e => `Item ${inv.rawIndex + 1}: [${e.field}] ${e.message}`)
        );

        if (attempt < MAX_ATTEMPTS) {
          GrammarDiagnosticLogger.logEvent({
            model,
            topicId,
            level,
            format: targetType,
            attempt,
            totalReceived,
            validCount: collectedExercises.length,
            invalidCount,
            targetCount: TARGET_EXERCISE_COUNT,
            failures: batchResult.invalidExercises,
            action: 'requesting_regeneration',
            durationMs: Date.now() - startTime
          });
        } else {
          GrammarDiagnosticLogger.logEvent({
            model,
            topicId,
            level,
            format: targetType,
            attempt,
            totalReceived,
            validCount: collectedExercises.length,
            invalidCount,
            targetCount: TARGET_EXERCISE_COUNT,
            failures: batchResult.invalidExercises,
            action: 'exhausted_attempts_aborted',
            durationMs: Date.now() - startTime
          });
        }
      }
    }

    if (collectedExercises.length < TARGET_EXERCISE_COUNT) {
      throw new Error(
        `Failed to generate ${TARGET_EXERCISE_COUNT} valid exercises for ${topicName} (${targetType}) after multiple attempts. Only ${collectedExercises.length} valid exercise(s) received. Module generation cancelled.`
      );
    }

    return {
      id: moduleId,
      level,
      topicId,
      title: moduleTitle,
      scenario: moduleScenario,
      exercises: collectedExercises,
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
    const key = `${this.STORAGE_KEY}_${languageCode}`;
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    try {
      const parsed: GrammarModule[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      
      // Filter out any corrupt or 0/0 modules from prior failed generations
      const validModules = parsed.filter(m => m && Array.isArray(m.exercises) && m.exercises.length > 0);
      
      let needsResave = validModules.length !== parsed.length;

      // Cleanse any bloated scenario or title strings from past prompt-echoing
      validModules.forEach(m => {
        if (m.scenario && m.scenario.length > 50) {
          const firstPart = m.scenario.split('(')[0].replace(/^scenario:\s*/i, '').trim();
          m.scenario = (firstPart && firstPart.length <= 40) ? firstPart : (SCENARIOS[m.index % SCENARIOS.length] || 'Daily Practice');
          needsResave = true;
        }
        if (m.title && m.title.length > 70) {
          m.title = m.title.slice(0, 60).trim() + '...';
          needsResave = true;
        }
      });

      // Auto-heal localStorage if corrupt modules or bloated fields were found
      if (needsResave) {
        console.warn(`[GrammarService] Cleaned up corrupted/bloated module data in storage.`);
        localStorage.setItem(key, JSON.stringify(validModules));
      }
      
      return validModules;
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
      // Dynamic generation with format-specific validation and bounded regeneration.
      // Precompiled fallback is strictly disabled per instructions.
      const module = await this.generateModule(level, topicId, topicName, index, languageCode);

      // Strict validation before saving: Never save an empty or incomplete module
      if (!module || !Array.isArray(module.exercises) || module.exercises.length === 0) {
        throw new Error(`Generated module for "${topicName}" contained no valid exercises. Storage write cancelled.`);
      }

      const allModules = this.getModules(languageCode);
      // Remove any existing module at this index/topic/level to prevent duplicate interference
      const filtered = allModules.filter(m => !(m.index === index && m.topicId === topicId && m.level === level));
      this.saveModules([...filtered, module], languageCode);
      return module;
    } catch (genErr: any) {
      console.error(`[GrammarService] Module generation failed for ${topicName} (module #${index + 1}):`, genErr);
      const rawMsg = genErr?.message || "";
      if (rawMsg.includes("Unexpected token") || rawMsg.includes("<!doctype") || rawMsg.includes("is not valid JSON")) {
        throw new Error("AI service is temporarily busy. Please wait a moment and tap again to unlock.");
      }
      throw new Error(rawMsg || "AI generation could not be completed. Please tap again to retry.");
    } finally {
      this.isGenerating[key] = false;
      this.notify();
    }
  }

  private static buildDoubtContextAndInstruction(
    question: string,
    exerciseContext: string | GrammarDoubtContext,
    languageCode: string = 'de'
  ) {
    const config = getLanguageConfig(languageCode);
    let formattedContext = '';

    if (typeof exerciseContext === 'string') {
      formattedContext = exerciseContext;
    } else {
      const lines: string[] = [
        `TARGET LANGUAGE: ${config.name} (${languageCode})`,
        `LEARNER LEVEL: ${exerciseContext.level || 'Standard'}`,
        `GRAMMAR TOPIC: ${exerciseContext.topicName || 'Grammar Practice'}`,
        `MODULE: ${exerciseContext.moduleTitle || 'Current Module'}`,
        `EXERCISE: ${exerciseContext.exerciseIndex !== undefined ? `Question ${exerciseContext.exerciseIndex + 1}` : 'Current Exercise'}${exerciseContext.totalExercises ? ` of ${exerciseContext.totalExercises}` : ''} [Type: ${exerciseContext.exerciseType || 'standard'}]`,
        `EXERCISE PROMPT / SENTENCE: "${exerciseContext.questionOrSentence}"`
      ];

      if (exerciseContext.options && exerciseContext.options.length > 0) {
        lines.push(`AVAILABLE OPTIONS: ${exerciseContext.options.join(' | ')}`);
      }
      if (exerciseContext.wordBank && exerciseContext.wordBank.length > 0) {
        lines.push(`WORD BANK: ${exerciseContext.wordBank.join(', ')}`);
      }
      lines.push(`CORRECT ANSWER: "${exerciseContext.correctAnswer}"`);
      
      const userAns = exerciseContext.userAnswer?.trim();
      lines.push(`STUDENT'S ANSWER / ATTEMPT: ${userAns ? `"${userAns}"` : '(Student has not selected or typed an answer yet)'}`);

      if (exerciseContext.isSubmitted) {
        const isCorrect = exerciseContext.score !== null && exerciseContext.score !== undefined ? exerciseContext.score >= 1 : null;
        lines.push(`SUBMISSION STATUS: Submitted (${isCorrect === true ? 'Correct' : isCorrect === false ? 'Incorrect' : 'Partially Correct'})`);
      } else {
        lines.push(`SUBMISSION STATUS: In progress (not submitted yet)`);
      }

      if (exerciseContext.explanation) {
        lines.push(`OFFICIAL GRAMMAR EXPLANATION: "${exerciseContext.explanation}"`);
      }

      if (exerciseContext.vocabularyHints && Object.keys(exerciseContext.vocabularyHints).length > 0) {
        const hints = Object.entries(exerciseContext.vocabularyHints).map(([k, v]) => `${k} = ${v}`).join('; ');
        lines.push(`VOCABULARY HINTS: ${hints}`);
      }

      if (exerciseContext.recentChatHistory && exerciseContext.recentChatHistory.length > 0) {
        const historyText = exerciseContext.recentChatHistory
          .slice(-6)
          .map(m => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
          .join('\n');
        lines.push(`RECENT CONVERSATION IN THIS EXERCISE:\n${historyText}`);
      }

      formattedContext = lines.join('\n');
    }

    const systemInstruction = `You are an expert personal language tutor assisting a student who is actively solving a specific grammar exercise in ${config.name}.

CORE SYSTEM INSTRUCTION & PRIORITY HIERARCHY:
You MUST explicitly prioritize the current exercise content provided in the prompt before offering any general linguistic explanations.

1. STRICT PRIORITY TO CURRENT EXERCISE CONTENT:
   - Always prioritize the specific sentence, prompt, options, learner's attempt, and correct answer provided in the exercise context before providing any general linguistic explanations.
   - Never start with generic grammar lectures, broad linguistic definitions, or abstract declension/conjugation tables.
   - Address the student's specific doubt in direct relation to this exact question first.
   - Any general linguistic rules or broader language concepts must be strictly secondary, concise, and introduced only after the immediate exercise sentence has been fully clarified.

2. CONTRAST THE LEARNER'S ATTEMPT WITH THE CORRECT ANSWER:
   - If the student has entered or chosen an answer (correct or incorrect), directly reference their attempt and compare it with the correct answer.
   - Pinpoint the exact grammatical trigger in this specific sentence (such as case governance by a specific preposition or verb, word order, gender agreement, or conjugation).
   - If the student's answer was correct, reinforce why that specific choice fits this sentence. If incorrect, explain why their choice fails in this exact sentence and why the correct answer is required.

3. CONCISE, DIRECT & ACTIONABLE STRUCTURE:
   - Open your response by directly answering the student's question in the context of this exercise.
   - Keep explanations concise, practical, and easy to read (2-4 clear paragraphs or bullet points).
   - Highlight key terms in ${config.name} using **bold** with brief translations in parentheses where helpful.
   - Maintain an encouraging and clear tutoring style.`;

    const userPrompt = `Current Exercise Context:
---
${formattedContext}
---

Student's Question / Doubt:
"${question}"

Priority Directive: Explicitly prioritize the current exercise content provided in the prompt before offering any general linguistic explanations. Analyze the student's attempt against the correct answer in this specific exercise first.`;

    return { systemInstruction, userPrompt };
  }

  static async clearDoubt(
    question: string,
    exerciseContext: string | GrammarDoubtContext,
    languageCode: string = 'de'
  ): Promise<string> {
    const ai = AiService.getClient();
    const { systemInstruction, userPrompt } = this.buildDoubtContextAndInstruction(question, exerciseContext, languageCode);

    return this.retry(async () => {
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: [{
          role: 'user',
          parts: [{
            text: userPrompt
          }]
        }],
        config: {
          systemInstruction,
          maxOutputTokens: 600,
          thinkingConfig: { thinkingLevel: 'low' }
        }
      });

      const responseText = response.text || "";
      if (!responseText) {
        throw new Error("Empty response from AI");
      }
      return responseText;
    });
  }

  /**
   * Real-time streaming doubt resolution with low-latency first-token delivery.
   * Calls /api/ai/generateContentStream, passing tokens directly via onChunk callback.
   * Falls back gracefully to clearDoubt if streaming fails.
   */
  static async clearDoubtStream(
    question: string,
    exerciseContext: string | GrammarDoubtContext,
    languageCode: string = 'de',
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const { systemInstruction, userPrompt } = this.buildDoubtContextAndInstruction(question, exerciseContext, languageCode);

    const payload = {
      model: AiService.getModelName(),
      contents: [{
        role: 'user',
        parts: [{ text: userPrompt }]
      }],
      config: {
        systemInstruction,
        maxOutputTokens: 600,
        thinkingConfig: { thinkingLevel: 'low' }
      }
    };

    try {
      const authHeaders = await ApiService.getAuthHeaders();
      const response = await fetch(ApiService.getEndpointUrl(API_ENDPOINTS.AI_GENERATE_CONTENT_STREAM), {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn(`[GrammarService] clearDoubtStream returned HTTP ${response.status}. Falling back to standard generation.`);
        return this.clearDoubt(question, exerciseContext, languageCode);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        return this.clearDoubt(question, exerciseContext, languageCode);
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.error) {
                console.warn('[GrammarService] Stream chunk error:', parsed.error);
                continue;
              }
              if (parsed.text) {
                accumulatedText += parsed.text;
                onChunk?.(parsed.text);
              }
            } catch {
              // Ignore SSE JSON chunk parse errors
            }
          }
        }
      }

      if (accumulatedText.trim()) {
        return accumulatedText.trim();
      }

      // If stream ended with empty text, fall back to standard clearDoubt
      return this.clearDoubt(question, exerciseContext, languageCode);
    } catch (streamErr) {
      console.warn('[GrammarService] Stream fetch encountered error. Falling back to standard generation:', streamErr);
      return this.clearDoubt(question, exerciseContext, languageCode);
    }
  }
}
