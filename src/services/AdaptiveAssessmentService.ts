import { 
  LanguageLevel, 
  AdaptiveAssessmentModule, 
  AssessmentQuestion, 
  AssessmentQuestionFormat,
  AssessmentMode 
} from '../types';
import { AiService } from './AiService';
import { getLanguageContent } from '../data';
import { getLanguageConfig } from '../config/languages';
import { FluencyService } from './FluencyService';

const MAX_ACTIVE_UNFINISHED = 4;
const TOTAL_MODULES = 100;

export interface DoubtContext {
  questionIndex: number;
  totalQuestions: number;
  level: string;
  moduleTitle: string;
  format: AssessmentQuestionFormat;
  prompt: string;
  context?: string;
  englishReference?: string;
  options?: string[];
  correctAnswer: any;
  userAnswer?: any;
  explanation: string;
  grammarCategory: string;
  grammarRuleRef?: string;
  recentChatHistory?: { text: string; sender: 'user' | 'ai' }[];
}

export class AdaptiveAssessmentService {
  private static listeners: Set<() => void> = new Set();

  static subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error("[AdaptiveAssessmentService] Listener error:", err);
      }
    });
  }

  private static getStorageKey(language: string, level: LanguageLevel): string {
    return `talkybean_adaptive_assessment_${language}_${level}`;
  }

  /**
   * Retrieves all modules for a given language & CEFR level.
   * If none exist in localStorage, builds the 100-module locked framework.
   */
  static getModules(level: LanguageLevel, language: string): AdaptiveAssessmentModule[] {
    const key = this.getStorageKey(language, level);
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === TOTAL_MODULES) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("[AdaptiveAssessmentService] Error reading modules:", e);
    }

    // Initialize 100 modules — ALL INITIALLY LOCKED
    const initial: AdaptiveAssessmentModule[] = Array.from({ length: TOTAL_MODULES }).map((_, idx) => ({
      id: `adapt_${language}_${level.toLowerCase()}_mod_${idx + 1}`,
      index: idx,
      level,
      language,
      title: `Grammar Assessment Module ${idx + 1}`,
      isUnlocked: false,
      isCompleted: false,
      questions: []
    }));

    this.saveModules(initial, level, language);
    return initial;
  }

  /**
   * Persists the modules list for a language and level.
   */
  static saveModules(modules: AdaptiveAssessmentModule[], level: LanguageLevel, language: string): void {
    const key = this.getStorageKey(language, level);
    try {
      localStorage.setItem(key, JSON.stringify(modules));
      this.notifyListeners();
    } catch (e) {
      console.error("[AdaptiveAssessmentService] Save error:", e);
    }
  }

  /**
   * Returns all active unfinished exercises across all levels for the language.
   * Used to enforce the strict 4-unfinished-exercise limit.
   */
  static getActiveUnfinishedModules(language: string): AdaptiveAssessmentModule[] {
    const levels: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
    const active: AdaptiveAssessmentModule[] = [];

    for (const lvl of levels) {
      const mods = this.getModules(lvl, language);
      const inProgress = mods.filter(m => m.isUnlocked && !m.isCompleted);
      active.push(...inProgress);
    }

    return active;
  }

  /**
   * Checks whether the user is permitted to unlock another module.
   */
  static canUnlockModule(language: string): { can: boolean; reason?: string; activeCount: number; activeModules: AdaptiveAssessmentModule[] } {
    const active = this.getActiveUnfinishedModules(language);
    if (active.length >= MAX_ACTIVE_UNFINISHED) {
      return {
        can: false,
        reason: `You have reached the maximum limit of ${MAX_ACTIVE_UNFINISHED} active unfinished exercises. Please complete or delete an in-progress exercise before starting a new one.`,
        activeCount: active.length,
        activeModules: active
      };
    }
    return {
      can: true,
      activeCount: active.length,
      activeModules: active
    };
  }

  /**
   * Deletes / Resets a module, freeing up a quota slot.
   */
  static deleteOrResetModule(language: string, level: LanguageLevel, moduleId: string): void {
    const modules = this.getModules(level, language);
    const updated = modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          isUnlocked: false,
          isCompleted: false,
          score: undefined,
          questions: [],
          mode: undefined,
          currentQuestionIndex: 0,
          chatMessages: [],
          unlockedAt: undefined,
          completedAt: undefined,
          totalTimeSeconds: undefined
        };
      }
      return m;
    });

    this.saveModules(updated, level, language);
  }

  /**
   * Unlocks a module and initiates AI generation of the 20-question cycle.
   */
  static async unlockAndGenerateModule(
    level: LanguageLevel,
    language: string,
    index: number,
    mode?: AssessmentMode
  ): Promise<AdaptiveAssessmentModule> {
    const quotaCheck = this.canUnlockModule(language);
    if (!quotaCheck.can) {
      throw new Error(quotaCheck.reason);
    }

    const modules = this.getModules(level, language);
    const targetModule = modules[index];
    if (!targetModule) {
      throw new Error(`Module ${index + 1} not found`);
    }

    // Retrieve relevant grammar curriculum topics
    const langContent = getLanguageContent(language);
    const allTopics = langContent.grammarTopics.filter(t => t.level === level);
    const topicNames = allTopics.map(t => t.name);

    // Generate 20 questions in strict 8-format sequence
    const questions = await this.generate20Questions(level, language, index + 1, topicNames);

    const updatedModule: AdaptiveAssessmentModule = {
      ...targetModule,
      title: `Level ${level} Assessment — Module ${index + 1}`,
      isUnlocked: true,
      isCompleted: false,
      mode,
      unlockedAt: Date.now(),
      currentQuestionIndex: 0,
      questions,
      chatMessages: []
    };

    modules[index] = updatedModule;
    this.saveModules(modules, level, language);
    return updatedModule;
  }

  /**
   * Updates an in-progress module's questions, state, and answers.
   */
  static updateModuleProgress(
    level: LanguageLevel,
    language: string,
    updatedModule: AdaptiveAssessmentModule
  ): void {
    const modules = this.getModules(level, language);
    const idx = modules.findIndex(m => m.id === updatedModule.id);
    if (idx !== -1) {
      modules[idx] = updatedModule;
      this.saveModules(modules, level, language);

      // If just completed, record in FluencyService
      if (updatedModule.isCompleted && updatedModule.score !== undefined) {
        FluencyService.updateFluency(language, level, 'grammar', {
          moduleId: updatedModule.id,
          moduleTitle: updatedModule.title,
          score: updatedModule.score,
          completedAt: Date.now()
        });
      }
    }
  }

  /**
   * Generates 20 questions across 2.5 cycles of Formats 1–8.
   */
  private static async generate20Questions(
    level: LanguageLevel,
    language: string,
    moduleNum: number,
    topics: string[]
  ): Promise<AssessmentQuestion[]> {
    const langConfig = getLanguageConfig(language);
    const langName = langConfig.name;
    const sampledTopics = topics.length > 0 ? topics.slice(0, 10).join(', ') : 'core grammar fundamentals, verb conjugation, prepositions, cases, and sentence structure';

    // Strict format plan for 20 questions (2.5 cycles of Formats 1-8):
    const formatCycle: AssessmentQuestionFormat[] = [
      'format-1-mcq',
      'format-2-fill-blanks',
      'format-3-error-correction',
      'format-4-sentence-transformation',
      'format-5-word-order',
      'format-6-conversation-completion',
      'format-7-correct-sentence',
      'format-8-short-writing',
      // Cycle 2:
      'format-1-mcq',
      'format-2-fill-blanks',
      'format-3-error-correction',
      'format-4-sentence-transformation',
      'format-5-word-order',
      'format-6-conversation-completion',
      'format-7-correct-sentence',
      'format-8-short-writing',
      // Half-cycle:
      'format-1-mcq',
      'format-2-fill-blanks',
      'format-3-error-correction',
      'format-4-sentence-transformation'
    ];

    try {
      const prompt = `You are a certified CEFR examination board examiner for ${langName}.
Generate a comprehensive 20-question grammar assessment module for CEFR Level ${level} (Module #${moduleNum}).
Target Syllabus Topics: ${sampledTopics}.

CRITICAL REQUIREMENTS:
1. Every question MUST rigorously test grammar at Level ${level}.
2. Mix different grammar concepts across questions (do NOT group by topic).
3. Follow the EXACT sequence of 20 question formats:
   Q1: format-1-mcq (Contextual multiple choice with 4 distinct options)
   Q2: format-2-fill-blanks (Sentence with [blank] and a wordBank of 4-6 choices, correctAnswer as the target string)
   Q3: format-3-error-correction (A sentence divided into 3-4 underlined segments where exactly ONE has a grammar error, plus the correct fix)
   Q4: format-4-sentence-transformation (Given sentence + transformationRule, e.g. "Convert to passive voice" or "Put in past tense", and the correct transformation)
   Q5: format-5-word-order (MANDATORY: provide 'englishReference' first! Provide the correct target sentence, plus 'wordBank' with the target language words/phrases shuffled)
   Q6: format-6-conversation-completion (A short 2-turn dialogue between Person A and Person B where Person B's response has a blank, with 3 options)
   Q7: format-7-correct-sentence (Select which of 3-4 sentences is grammatically flawless)
   Q8: format-8-short-writing (A short writing scenario with 2 specific grammar constraints in 'writingCues', sample ideal response in 'correctAnswer')
   (Repeat Q9-Q16 matching Formats 1-8; Q17-Q20 matching Formats 1-4).

Return pure JSON matching this structure:
{
  "questions": [
    {
      "format": "format-1-mcq",
      "prompt": "Choose the grammatically correct option to complete the passage.",
      "context": "Context passage or sentence...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "grammarCategory": "Dative Prepositions",
      "explanation": "Detailed explanation of the grammatical principle.",
      "englishReference": ""
    },
    ...
  ]
}`;

      const ai = AiService.getClient();
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      const raw = response.text || "";
      const clean = raw.replace(/```json\n?|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length >= 20) {
        return parsed.questions.slice(0, 20).map((q: any, i: number) => {
          const fmt = formatCycle[i];
          const isHigherFormat = fmt === 'format-6-conversation-completion' || fmt === 'format-7-correct-sentence' || fmt === 'format-8-short-writing';
          return {
            id: `q_${moduleNum}_${i + 1}_${Math.random().toString(36).substr(2, 6)}`,
            format: fmt,
            prompt: q.prompt || `Question ${i + 1}`,
            context: q.context || '',
            englishReference: q.englishReference || (fmt === 'format-5-word-order' ? (q.englishReference || q.context || "Translate and arrange in correct order:") : undefined),
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            wordBank: q.wordBank || (fmt === 'format-5-word-order' && typeof q.correctAnswer === 'string' ? q.correctAnswer.split(' ').sort(() => Math.random() - 0.5) : []),
            underlinedParts: q.underlinedParts || (fmt === 'format-3-error-correction' ? [
              { id: 'p1', text: 'Ich bin', isError: false },
              { id: 'p2', text: 'gestern nach', isError: false },
              { id: 'p3', text: 'der Kino gegangen', isError: true, correction: 'ins Kino gegangen' }
            ] : undefined),
            transformationRule: q.transformationRule || (fmt === 'format-4-sentence-transformation' ? "Rewrite into the past tense." : undefined),
            dialogue: q.dialogue || (fmt === 'format-6-conversation-completion' ? [
              { speaker: 'Anna', text: 'Kommst du heute Abend zur Party?' },
              { speaker: 'Lukas', text: '[blank]', isMissing: true }
            ] : undefined),
            writingCues: q.writingCues || (fmt === 'format-8-short-writing' ? ['Use a modal verb', 'Express polite request'] : undefined),
            grammarCategory: q.grammarCategory || (topics[i % (topics.length || 1)] || 'Syntax & Case Agreement'),
            grammarRuleRef: q.grammarRuleRef || `CEFR ${level} Specification`,
            explanation: q.explanation || 'Grammar verification check.',
            timeLimitSeconds: isHigherFormat ? 120 : 90
          };
        });
      }
    } catch (err) {
      console.warn("[AdaptiveAssessmentService] AI generation fallback triggered:", err);
    }

    // Resilient authentic fallback builder
    return this.generateFallbackQuestions(level, language, moduleNum, formatCycle, topics);
  }

  /**
   * Generates authentic, curated CEFR assessment items if the network or AI service is unavailable.
   */
  private static generateFallbackQuestions(
    level: LanguageLevel,
    language: string,
    moduleNum: number,
    formatCycle: AssessmentQuestionFormat[],
    topics: string[]
  ): AssessmentQuestion[] {
    const isGerman = language === 'de';

    return formatCycle.map((format, idx) => {
      const qNum = idx + 1;
      const isHigher = format === 'format-6-conversation-completion' || format === 'format-7-correct-sentence' || format === 'format-8-short-writing';
      const timeLimitSeconds = isHigher ? 120 : 90;
      const category = topics[idx % (topics.length || 1)] || 'Case Agreement & Word Order';

      if (format === 'format-1-mcq') {
        return {
          id: `fb_${moduleNum}_${qNum}`,
          format,
          prompt: isGerman 
            ? "Wählen Sie die grammatisch korrekte Form aus, um den Satz zu vervollständigen." 
            : "Choose the grammatically correct form to complete the statement.",
          context: isGerman 
            ? "Nach dem langen Arbeitstag fährt Herr Weber mit ___ Zug nach Hause." 
            : "After a long workday, he travels by train back home.",
          options: isGerman 
            ? ["dem", "den", "der", "das"] 
            : ["by", "with", "on", "in"],
          correctAnswer: isGerman ? "dem" : "by",
          grammarCategory: category,
          grammarRuleRef: isGerman ? "Dativ nach Präposition 'mit'" : "Prepositional Collocations",
          explanation: isGerman 
            ? "Die Präposition 'mit' verlangt immer den Dativ. Der Zug ist maskulin: dem Zug." 
            : "'By' is the correct preposition used with modes of transportation.",
          timeLimitSeconds
        };
      }

      if (format === 'format-2-fill-blanks') {
        return {
          id: `fb_${moduleNum}_${qNum}`,
          format,
          prompt: isGerman 
            ? "Füllen Sie die Lücke mit der passenden Verbform aus." 
            : "Fill in the blank with the appropriate verb form.",
          context: isGerman 
            ? "Wenn das Wetter morgen schön ist, [blank] wir einen Ausflug ins Grüne." 
            : "If the weather is fine tomorrow, we [blank] an excursion.",
          correctAnswer: isGerman ? "machen" : "will make",
          wordBank: isGerman 
            ? ["machen", "gemacht", "machte", "machest"] 
            : ["will make", "made", "making", "makes"],
          grammarCategory: category,
          grammarRuleRef: "Conditional clause (Konditionalsatz)",
          explanation: isGerman 
            ? "Im Hauptsatz nach einem einleitenden Nebensatz steht das konjugierte Verb an erster Stelle der Hauptsatzklammer (Inversion): machen wir." 
            : "First conditional uses the present in the condition and future in the main clause.",
          timeLimitSeconds
        };
      }

      if (format === 'format-3-error-correction') {
        return {
          id: `fb_${moduleNum}_${qNum}`,
          format,
          prompt: isGerman 
            ? "Identifizieren Sie den Grammatikfehler im Satz und korrigieren Sie ihn." 
            : "Identify the grammatical error in the sentence and provide the correction.",
          context: isGerman 
            ? "Tippen Sie auf den fehlerhaften Teil des Satzes:" 
            : "Tap the segment containing the error:",
          underlinedParts: isGerman ? [
            { id: 'p1', text: 'Gestern hat mein Kollege', isError: false },
            { id: 'p2', text: 'einen neuen Computer', isError: false },
            { id: 'p3', text: 'in der Büro gebracht.', isError: true, correction: 'ins Büro gebracht.' }
          ] : [
            { id: 'p1', text: 'Yesterday my colleague', isError: false },
            { id: 'p2', text: 'brought a new computer', isError: false },
            { id: 'p3', text: 'in the office without notice.', isError: true, correction: 'into the office without notice.' }
          ],
          correctAnswer: isGerman ? "ins Büro gebracht." : "into the office without notice.",
          grammarCategory: category,
          grammarRuleRef: "Wechselpräpositionen mit Akkusativ (Richtung/Ziel)",
          explanation: isGerman 
            ? "Die Wechselpräposition 'in' verlangt den Akkusativ bei einer Bewegung/Zielrichtung (Wohin? -> in das / ins Büro)." 
            : "'Into' is required when indicating motion directed toward an interior.",
          timeLimitSeconds
        };
      }

      if (format === 'format-4-sentence-transformation') {
        return {
          id: `fb_${moduleNum}_${qNum}`,
          format,
          prompt: isGerman 
            ? "Formen Sie den Satz entsprechend der grammatikalischen Anweisung um." 
            : "Transform the sentence according to the grammatical directive.",
          context: isGerman 
            ? "Ausgangssatz: Der Mechaniker repariert das Auto schnell." 
            : "Source sentence: The mechanic repairs the car quickly.",
          transformationRule: isGerman 
            ? "Wandeln Sie den Satz in das Zustandspassiv oder Vorgangspassiv (Präsens) um:" 
            : "Convert the sentence into the passive voice (present tense):",
          correctAnswer: isGerman 
            ? "Das Auto wird von dem Mechaniker schnell repariert." 
            : "The car is quickly repaired by the mechanic.",
          grammarCategory: category,
          grammarRuleRef: "Passivbildung mit 'werden' + Partizip II",
          explanation: isGerman 
            ? "Vorgangspassiv im Präsens: Subjekt (Akkusativ-Objekt des Aktivsatzes) + wird/werden + Partizip II ('repariert')." 
            : "Present passive requires 'is/are' + past participle + optional agent phrase.",
          timeLimitSeconds
        };
      }

      if (format === 'format-5-word-order') {
        // MANDATORY: English reference pinned at top!
        return {
          id: `fb_${moduleNum}_${qNum}`,
          format,
          prompt: isGerman 
            ? "Bringen Sie die Wörter in die korrekte Satzreihenfolge." 
            : "Arrange the words into the correct syntactic order.",
          englishReference: isGerman 
            ? "Because it was raining heavily, we stayed at home all afternoon." 
            : "Because it was raining heavily, we stayed at home all afternoon.",
          context: isGerman 
            ? "Ordnen Sie die Satzbausteine (Nebensatz mit Kausalangabe):" 
            : "Arrange the target sentence components:",
          wordBank: isGerman 
            ? ["Weil", "es", "stark", "regnete,", "blieben", "wir", "den", "ganzen", "Nachmittag", "zu", "Hause."] 
            : ["Because", "it", "rained", "heavily,", "we", "stayed", "home", "all", "afternoon."],
          correctAnswer: isGerman 
            ? "Weil es stark regnete, blieben wir den ganzen Nachmittag zu Hause." 
            : "Because it rained heavily, we stayed home all afternoon.",
          grammarCategory: category,
          grammarRuleRef: "Verb-Letzt-Stellung im Kausalsatz + Inversion im Folgesatz",
          explanation: isGerman 
            ? "Die Konjunktion 'weil' leitet einen Nebensatz ein (Verb am Ende: regnete). Der nachfolgende Hauptsatz beginnt mit dem finiten Verb (blieben wir)." 
            : "Subordinate clause followed by standard subject-verb main clause.",
          timeLimitSeconds
        };
      }

      if (format === 'format-6-conversation-completion') {
        return {
          id: `fb_${moduleNum}_${qNum}`,
          format,
          prompt: isGerman 
            ? "Wählen Sie die stilistisch und grammatisch treffende Antwort im Dialog." 
            : "Select the most accurate response to complete the conversational dialogue.",
          dialogue: isGerman ? [
            { speaker: "Dr. Müller", text: "Haben Sie den Laborbericht schon an die Kollegen weitergeleitet?" },
            { speaker: "Assistent", text: "[blank]", isMissing: true }
          ] : [
            { speaker: "Manager", text: "Have you forwarded the financial briefing to the team yet?" },
            { speaker: "Assistant", text: "[blank]", isMissing: true }
          ],
          options: isGerman ? [
            "Ja, ich habe ihn ihnen bereits heute Morgen zugeschickt.",
            "Ja, ich habe ihnen er bereits heute Morgen zugeschickt.",
            "Ja, ich bin ihn ihnen bereits geschickt.",
            "Ja, ich habe ihm sie bereits zugeschickt."
          ] : [
            "Yes, I have already sent it to them this morning.",
            "Yes, I send it already tomorrow morning.",
            "Yes, I was sending them it without notice.",
            "Yes, I am already sent it."
          ],
          correctAnswer: isGerman 
            ? "Ja, ich habe ihn ihnen bereits heute Morgen zugeschickt." 
            : "Yes, I have already sent it to them this morning.",
          grammarCategory: category,
          grammarRuleRef: "Pronomenreihung: Akkusativpronomen vor Dativpronomen",
          explanation: isGerman 
            ? "Treffen zwei Personalpronomen aufeinander, steht das Akkusativpronomen ('ihn') vor dem Dativpronomen ('ihnen')." 
            : "Present perfect correctly coordinates with the past event having present relevance.",
          timeLimitSeconds
        };
      }

      if (format === 'format-7-correct-sentence') {
        return {
          id: `fb_${moduleNum}_${qNum}`,
          format,
          prompt: isGerman 
            ? "Welcher der folgenden Sätze ist grammatisch vollkommen fehlerfrei?" 
            : "Which of the following sentences is grammatically flawless?",
          options: isGerman ? [
            "Trotz des schlechten Wetters unternahmen die Touristen eine Stadtrundfahrt.",
            "Trotz dem schlechter Wetter unternahmen die Touristen eine Stadtrundfahrt.",
            "Trotz des schlechtem Wetter unternahmen die Touristen eine Stadtrundfahrt.",
            "Trotz den schlechten Wetter haben die Touristen eine Stadtrundfahrt unternehmen."
          ] : [
            "Despite the inclement weather, the delegates concluded the summit on schedule.",
            "Despite of the inclement weather, the delegates concluded the summit on schedule.",
            "Although the inclement weather, the delegates concluded the summit on schedule.",
            "In spite the inclement weather, the delegates concluded the summit on schedule."
          ],
          correctAnswer: isGerman 
            ? "Trotz des schlechten Wetters unternahmen die Touristen eine Stadtrundfahrt." 
            : "Despite the inclement weather, the delegates concluded the summit on schedule.",
          grammarCategory: category,
          grammarRuleRef: "Präposition 'trotz' mit Genitiv",
          explanation: isGerman 
            ? "Im Standarddeutschen verlangt 'trotz' den Genitiv mit starker Adjektivdeklination: des schlechten Wetters." 
            : "'Despite' takes a noun phrase directly without 'of'.",
          timeLimitSeconds
        };
      }

      // format-8-short-writing
      return {
        id: `fb_${moduleNum}_${qNum}`,
        format: 'format-8-short-writing',
        prompt: isGerman 
          ? "Formulieren Sie einen kurzen, zusammenhängenden Satz (15–25 Wörter) anhand der Vorgaben." 
          : "Formulate a concise contextual sentence (15–25 words) fulfilling all grammatical criteria.",
        context: isGerman 
          ? "Situation: Sie können an einem vereinbarten Besprechungstermin nicht teilnehmen und schlagen höflich eine Verschiebung vor." 
          : "Situation: You are unable to attend an agreed meeting and courteously propose rescheduling.",
        writingCues: isGerman ? [
          "Verwenden Sie den Konjunktiv II der Höflichkeit (z.B. 'könnten', 'würden').",
          "Bauen Sie eine temporale Angabe mit Dativ oder Genitiv ein."
        ] : [
          "Use a conditional structure (e.g. 'would', 'could').",
          "Include a polite temporal proposal."
        ],
        correctAnswer: isGerman 
          ? "Könnten wir unser Treffen eventuell auf nächsten Donnerstag verschieben, da mir am Montag ein dringender Termin dazwischengekommen ist?" 
          : "Could we perhaps reschedule our discussion to next Thursday, as an urgent conflict arose on Monday?",
        grammarCategory: category,
        grammarRuleRef: "Konjunktiv II zur höflichen Bitte und modale Hypotaxe",
        explanation: isGerman 
          ? "Der Konjunktiv II ('Könnten wir') drückt eine professionelle, höfliche Bitte aus. Die nachgestellte Begründung nutzt die Kausalkonjunktion 'da'." 
          : "Polite conditional request pairs seamlessly with formal workplace correspondence.",
        timeLimitSeconds
      };
    });
  }

  /**
   * Gemini Tutor AI for answering questions about grammar doubts.
   */
  static async clearDoubt(message: string, context: DoubtContext, language: string): Promise<string> {
    const langConfig = getLanguageConfig(language);
    const langName = langConfig.name;

    const prompt = `You are the empathetic, expert Talky Bean AI Grammar Tutor.
The user is learning ${langName} at CEFR Level ${context.level}.
Current Exercise: "${context.moduleTitle}" (Question ${context.questionIndex + 1} of ${context.totalQuestions}).
Exercise Format: ${context.format}
Grammar Topic Tested: ${context.grammarCategory}
Grammar Rule Reference: ${context.grammarRuleRef || 'CEFR Standard'}
Question Prompt: "${context.prompt}"
Context Text: "${context.context || 'N/A'}"
${context.englishReference ? `English Reference: "${context.englishReference}"` : ''}
${context.options ? `Options: ${context.options.join(' | ')}` : ''}
Correct Answer: ${JSON.stringify(context.correctAnswer)}
Learner's Answer: ${JSON.stringify(context.userAnswer || 'Not submitted yet')}
Official Explanation: ${context.explanation}

Learner's Question / Doubt:
"${message}"

Instructions:
1. Provide a warm, crystal-clear explanation directly addressing their doubt.
2. Explain WHY the grammar rule works that way in ${langName} with clear examples.
3. Keep the tone encouraging, concise (2-4 brief paragraphs), and structured.
4. If they made an error, point out the specific linguistic mechanism (e.g. case ending, verb placement, preposition rule) without making them feel bad.`;

    try {
      const ai = AiService.getClient();
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      return response.text || "I understand your doubt! In this case, the grammar rule requires attention to the specific case ending and word order. Let me know if you would like another example.";
    } catch (err: any) {
      console.error("[AdaptiveAssessmentService] clearDoubt error:", err);
      return "I'm having a brief connection delay with the AI service. The key takeaway for this question is that the tested rule hinges on the agreement between the case marker and the verb position!";
    }
  }

  /**
   * Evaluates Format 8 (Short Writing) with instant AI feedback.
   */
  static async evaluateShortWriting(
    question: AssessmentQuestion,
    userText: string,
    language: string
  ): Promise<{ isCorrect: boolean; score: number; feedback: string }> {
    const langConfig = getLanguageConfig(language);
    const langName = langConfig.name;

    if (!userText.trim()) {
      return { isCorrect: false, score: 0, feedback: "Please enter your response before submitting." };
    }

    try {
      const prompt = `Evaluate this short ${langName} grammar response written by a CEFR Level student.
Scenario: ${question.context || question.prompt}
Required Grammar Cues: ${JSON.stringify(question.writingCues || [])}
Target / Ideal Reference: ${question.correctAnswer}
Grammar Rule: ${question.grammarCategory}

Student's Written Response:
"${userText}"

Evaluate whether the student fulfilled the grammar constraints and wrote a grammatically sound sentence in ${langName}.
Return pure JSON:
{
  "isCorrect": true, // boolean
  "score": 100,      // integer 0-100
  "feedback": "Concise 1-2 sentence assessment highlighting their grammar precision and any minor corrections."
}`;

      const ai = AiService.getClient();
      const response = await ai.models.generateContent({
        model: AiService.getModelName(),
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: "application/json" }
      });

      const raw = response.text || "";
      const clean = raw.replace(/```json\n?|```/g, "").trim();
      const data = JSON.parse(clean);

      return {
        isCorrect: !!data.isCorrect,
        score: typeof data.score === 'number' ? data.score : 80,
        feedback: data.feedback || "Well done! Your sentence applies the required grammar rules accurately."
      };
    } catch (err) {
      // Graceful heuristic evaluation if offline
      const meetsLength = userText.trim().split(/\s+/).length >= 5;
      return {
        isCorrect: meetsLength,
        score: meetsLength ? 85 : 40,
        feedback: meetsLength 
          ? "Good job constructing a complete response! Review the sample solution to compare phrasing."
          : "Your response seems a bit brief. Try providing a full clause fulfilling all requirements."
      };
    }
  }
}
