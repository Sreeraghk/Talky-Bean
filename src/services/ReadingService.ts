import { Type } from "@google/genai";
import { AiService } from "./AiService";
import { ReadingModule, ReadingExercise, ReadingQuestion, LanguageLevel } from "../types";
import { getPremadeFallbackPassage, extractDictionaryVocabulary } from "../data/readingPassages";
import { getReadingLengthProfile } from "../data/reading/types";
import { getLanguageConfig } from "../config/languages";
import { StorageService } from "./StorageService";
import { NATIVE_LANGUAGE_NAMES } from "./LocalizationService";
import { DictionaryService } from "./dictionary";

export class ReadingService {
  private static STORAGE_KEY_PREFIX = 'langeasy_reading_modules_';

  private static TOPIC_POOL_50: string[] = [
    "Modern Architecture & Urban Design",
    "Digital Nomads & Future of Remote Work",
    "Quantum Computing & Next-Gen Tech",
    "Sustainable Fashion & Circular Textiles",
    "Silk Road & Historical Trade Networks",
    "Commercial Space Exploration & Astronomy",
    "Biomimicry in Modern Engineering",
    "Urban Gardening & Vertical Farming",
    "AI Ethics & Algorithmic Society",
    "Renewable Energy & Power Grid Transition",
    "Marine Biology & Ocean Conservation",
    "Archaeological Discoveries & Lost Civilizations",
    "Cybersecurity & Data Privacy in the Digital Era",
    "Culinary Innovations & Modern Gastronomy",
    "Autonomous Transportation & Electric Vehicles",
    "Ancient Philosophies for Daily Life",
    "Smart Cities & Intelligent Infrastructure",
    "Cognitive Psychology & Human Habit Loops",
    "Regenerative Agriculture & Soil Health",
    "History of Cartography & World Exploration",
    "Evolution of Global E-Commerce",
    "Virtual Reality in Modern Classrooms",
    "Music Therapy & Neurological Healing",
    "Renaissance Art & Architectural Masterpieces",
    "Micro-Living & Tiny House Movement",
    "Clean Water Infrastructure & Desalination",
    "Volcanology & Tectonic Earth Dynamics",
    "Circular Economy & Industrial Recycling",
    "History of Cryptography & Secret Codes",
    "Traditional Crafts & Artisanal Preservation",
    "Biotechnology & Modern Health Breakthroughs",
    "Glacier Retreat & Polar Ecosystem Studies",
    "Global Audio Renaissance & Podcast Culture",
    "Philosophy of Time & Human Perception",
    "Evolution of Writing Systems & Alphabet History",
    "Astrobiology & the Search for Extraterrestrial Life",
    "Eco-Friendly Tourism & Cultural Heritage",
    "Origami Mathematics in Spacecraft Design",
    "Neuroscience of Mindfulness & Concentration",
    "Minimalism & Consumerism Trends",
    "Solar Weather & Geomagnetic Phenomena",
    "Artisanal Fermentation & Food Science",
    "Mythologies & Folklore Across Cultures",
    "High-Speed Rail Networks & Future Transit",
    "Wildlife Corridors & Biodiversity Hotspots",
    "Drone Logistics & Next-Gen Delivery",
    "Endangered Language Preservation",
    "Zero-Waste Urban Infrastructure",
    "Ocean Plastic Interceptors & Marine Technology",
    "Deep Space Observatories & James Webb Insights"
  ];

  private static getNextUnvisitedTopic(languageCode: string, level: string, customTopic?: string): { topic: string; topicIndex: number } {
    if (customTopic && customTopic.trim()) {
      return { topic: customTopic.trim(), topicIndex: -1 };
    }

    const pool = this.TOPIC_POOL_50;
    const storageKey = `langeasy_visited_topics_${languageCode}_${level}`;
    let visitedIndices: number[] = [];

    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          visitedIndices = JSON.parse(stored);
          if (!Array.isArray(visitedIndices)) visitedIndices = [];
        }
      } catch {
        visitedIndices = [];
      }
    }

    let unvisited = pool.map((_, idx) => idx).filter(idx => !visitedIndices.includes(idx));

    if (unvisited.length === 0) {
      visitedIndices = [];
      unvisited = pool.map((_, idx) => idx);
    }

    const randomIndex = unvisited[Math.floor(Math.random() * unvisited.length)];
    visitedIndices.push(randomIndex);

    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(visitedIndices));
      } catch (e) {
        console.warn("Could not persist visited topic indices:", e);
      }
    }

    return { topic: pool[randomIndex], topicIndex: randomIndex };
  }

  /**
   * Resilient JSON parser that handles markdown fencing, boundary extraction,
   * trailing commas, and truncated model outputs without naive curly-brace slicing.
   */
  static safeParseJson(raw: string): any {
    if (!raw || typeof raw !== 'string') {
      throw new Error("Empty or non-string model output.");
    }

    const trimmed = raw.trim();

    // 1. Remove markdown fences
    let clean = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // 2. Direct JSON.parse
    try {
      return JSON.parse(clean);
    } catch {
      // Continue to structured extraction
    }

    // 3. Locate outer boundaries
    const firstObj = clean.indexOf('{');
    const firstArr = clean.indexOf('[');
    let startIdx = -1;
    let endIdx = -1;

    if (firstObj !== -1 && (firstArr === -1 || firstObj < firstArr)) {
      startIdx = firstObj;
      endIdx = clean.lastIndexOf('}');
    } else if (firstArr !== -1) {
      startIdx = firstArr;
      endIdx = clean.lastIndexOf(']');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const candidate = clean.substring(startIdx, endIdx + 1);
      try {
        return JSON.parse(candidate.replace(/,\s*([\]}])/g, '$1'));
      } catch {
        // Fall through to truncation repair
      }
    }

    // 4. Truncation repair: close strings and brackets safely using a LIFO delimiter stack
    try {
      let candidate = (startIdx !== -1) ? clean.substring(startIdx) : clean;
      candidate = candidate.replace(/,\s*$/, '');

      // Check open quotes and scan unescaped delimiters outside strings
      let inString = false;
      let isEscaped = false;
      const stack: string[] = [];

      for (let i = 0; i < candidate.length; i++) {
        const char = candidate[i];
        if (char === '\\' && inString) {
          isEscaped = !isEscaped;
          continue;
        }
        if (char === '"' && !isEscaped) {
          inString = !inString;
        } else if (!inString) {
          if (char === '{') stack.push('}');
          else if (char === '[') stack.push(']');
          else if (char === '}' || char === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === char) {
              stack.pop();
            }
          }
        }
        isEscaped = false;
      }

      // If string was left open, close it
      if (inString) {
        candidate += '"';
      }

      // Remove any trailing commas that might now be invalid before closing brackets
      candidate = candidate.replace(/,\s*$/, '');

      // Close all remaining delimiters in reverse order of opening
      while (stack.length > 0) {
        candidate += stack.pop();
      }

      return JSON.parse(candidate.replace(/,\s*([\]}])/g, '$1'));
    } catch (e) {
      console.warn("[ReadingService] JSON recovery failed for raw snippet:", trimmed.slice(0, 160));
      throw new Error("Data sanitization failure. Response format was malformed.");
    }
  }

  /**
   * Sanitizes and validates questions into robust ReadingQuestion objects.
   * Guarantees at least 5 valid questions per exercise with valid answer keys and options.
   */
  private static sanitizeQuestions(rawQuestions: any[], type: 'mcq' | 'tf', langCode: string): ReadingQuestion[] {
    const defaultTfOptions = langCode === 'es' ? ['Verdadero', 'Falso'] :
      langCode === 'fr' ? ['Vrai', 'Faux'] :
      langCode === 'de' ? ['Richtig', 'Falsch'] :
      ['True', 'False'];

    const validList: ReadingQuestion[] = [];
    const list = Array.isArray(rawQuestions) ? rawQuestions : [];

    list.forEach((q: any, i: number) => {
      if (!q || typeof q !== 'object') return;
      const questionText = typeof q.question === 'string' && q.question.trim().length > 0
        ? q.question.trim()
        : `Comprehension Query ${i + 1}`;

      let options: string[] = [];
      if (type === 'tf') {
        options = Array.isArray(q.options) && q.options.length === 2
          ? q.options.map((o: any) => String(o).trim())
          : defaultTfOptions;
      } else {
        if (Array.isArray(q.options) && q.options.length >= 2) {
          options = q.options.map((opt: any) => String(opt || "").trim()).filter(Boolean);
        }
        if (options.length < 2) {
          options = ["Option A", "Option B", "Option C", "Option D"];
        }
      }

      let correctIdx = typeof q.correctAnswerIndex === 'number' ? Math.floor(q.correctAnswerIndex) : 0;
      if (correctIdx < 0 || correctIdx >= options.length) {
        correctIdx = 0;
      }

      const explanation = typeof q.explanation === 'string' && q.explanation.trim().length > 0
        ? q.explanation.trim()
        : "Refer to the reading passage to verify this statement.";

      validList.push({
        id: `q-${type}-${i}`,
        type: type === 'mcq' ? 'multiple-choice' : 'true-false',
        question: questionText,
        options,
        correctAnswerIndex: correctIdx,
        explanation,
        vocabularyHints: {}
      });
    });

    // Enforce 5 questions per exercise
    while (validList.length < 5) {
      const idx = validList.length;
      if (type === 'tf') {
        validList.push({
          id: `q-tf-${idx}`,
          type: 'true-false',
          question: `The passage provides authentic factual context for this topic.`,
          options: defaultTfOptions,
          correctAnswerIndex: 0,
          explanation: "The text provides educational context about the subject.",
          vocabularyHints: {}
        });
      } else {
        validList.push({
          id: `q-mcq-${idx}`,
          type: 'multiple-choice',
          question: `What is the central subject of this passage?`,
          options: ["The primary theme overview", "An unrelated matter", "A secondary footnote", "An incorrect detail"],
          correctAnswerIndex: 0,
          explanation: "The passage directly focuses on introducing and exploring this subject.",
          vocabularyHints: {}
        });
      }
    }

    return validList.slice(0, 5);
  }

  /**
   * Loads a verified precompiled fallback module matching the language and level.
   * Tracks recently selected fallback titles to avoid repetitive presentation.
   */
  static getPremadeFallbackModule(language: string, level: LanguageLevel, moduleNumber: number): ReadingModule | null {
    const storageKey = `langeasy_used_fallback_${language}_${level}`;
    let usedTitles: string[] = [];
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) usedTitles = JSON.parse(stored);
      } catch {
        usedTitles = [];
      }
    }

    const passage = getPremadeFallbackPassage(language, level, usedTitles);
    if (!passage) return null;

    if (typeof localStorage !== 'undefined') {
      try {
        if (!usedTitles.includes(passage.title)) {
          usedTitles.push(passage.title);
          localStorage.setItem(storageKey, JSON.stringify(usedTitles));
        }
      } catch (e) {
        console.warn("Could not persist used fallback titles:", e);
      }
    }

    const mcqQuestions: ReadingQuestion[] = (passage.mcqQuestions || []).map((q, idx) => ({
      id: `q-mcq-${idx}`,
      type: 'multiple-choice',
      question: q.question,
      options: q.options,
      correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
      vocabularyHints: {},
      explanation: q.explanation || "Refer to the text above."
    }));

    const tfDefaultOptions = language === 'es' ? ['Verdadero', 'Falso'] :
      language === 'fr' ? ['Vrai', 'Faux'] :
      language === 'de' ? ['Richtig', 'Falsch'] :
      ['True', 'False'];

    const tfQuestions: ReadingQuestion[] = (passage.tfQuestions || []).map((q, idx) => ({
      id: `q-tf-${idx}`,
      type: 'true-false',
      question: q.question,
      options: q.options || tfDefaultOptions,
      correctAnswerIndex: typeof q.correctAnswerIndex === 'number' ? q.correctAnswerIndex : 0,
      vocabularyHints: {},
      explanation: q.explanation || "Refer to the text above."
    }));

    const rawVocabHints = {
      ...extractDictionaryVocabulary(passage.text, language, 12, 500),
      ...(passage.vocabularyHints || {})
    };

    const module: ReadingModule = {
      id: `rm-${level}-${moduleNumber}-fallback-${Date.now()}`,
      level,
      moduleNumber,
      theme: passage.title,
      exercises: [
        {
          id: 'ex-0',
          passage: passage.text,
          questions: mcqQuestions,
          vocabularyHints: rawVocabHints,
          type: 'mcq'
        },
        {
          id: 'ex-1',
          passage: passage.text,
          questions: tfQuestions,
          vocabularyHints: rawVocabHints,
          type: 'tf'
        }
      ],
      isCompleted: false,
      maxScore: 10,
      createdAt: Date.now(),
      isFallback: true,
      fallbackNotice: 'Precompiled Master Library'
    };

    return module;
  }

  /**
   * Generates a complete ReadingModule.
   * Optimizes the generation pipeline:
   * 1. Generates passage once.
   * 2. Concurrently executes vocabulary extraction and question generation (Promise.allSettled).
   * 3. If AI generation fails due to quota/network/outage, seamlessly falls back to precompiled content.
   * 4. Strictly preserves 401 unauthenticated and 403 age-verification requirements without fallback bypass.
   */
  static async generateReadingModule(
    level: LanguageLevel,
    language: string,
    moduleNumber: number,
    customTopic?: string
  ): Promise<ReadingModule> {
    const langConfig = getLanguageConfig(language);
    const langName = langConfig.name;
    const levelConfig = langConfig.levels.find(l => l.code === level);
    const levelName = levelConfig?.name || level;
    const framework = langConfig.framework;

    let theme = customTopic || `Module ${moduleNumber}`;
    let baseText = "";

    try {
      // Step 1: Generate passage once
      const retrievalResult = await this.executeChunkTask({
        task_type: "retrieve_passage",
        level,
        levelName,
        framework,
        language: langName,
        languageCode: language,
        module_index: moduleNumber,
        customTopic,
        seed: Date.now()
      });

      theme = retrievalResult.title || theme;
      baseText = (retrievalResult.text || "").trim();

      if (!baseText || baseText.length < 50) {
        throw new Error("Retrieved passage is too short or empty.");
      }

      console.log(`[ReadingService] Retrieved passage: "${theme}". Launching intelligent dictionary-first vocabulary & questions pipeline.`);

      // Step 2: Intelligent Dictionary-First Vocabulary Processing & Questions Generation
      const nativeLang = StorageService.load<string>('native_language', undefined, 'en');
      const [vocabMeanings, questionsOutcome] = await Promise.all([
        DictionaryService.extractPassageVocabulary(baseText, language, nativeLang, level),
        this.executeChunkTask({
          task_type: "generate_all_questions",
          passage: baseText,
          languageCode: language,
          language: langName,
          level
        }).then(val => ({ status: 'fulfilled' as const, value: val })).catch(err => ({ status: 'rejected' as const, reason: err }))
      ]);

      // Step 3: Populate vocabulary hints from dictionary pipeline across full passage
      const meanings: Record<string, string> = { ...vocabMeanings };

      const fallbackTerms = extractDictionaryVocabulary(baseText, language, 12, 800);
      Object.entries(fallbackTerms).forEach(([w, t]) => {
        if (!meanings[w]) meanings[w] = t;
      });

      // Step 4: Process questions with single bounded recovery if initial questions call failed
      let rawMcq: any[] = [];
      let rawTf: any[] = [];

      if (questionsOutcome.status === 'fulfilled' && questionsOutcome.value) {
        rawMcq = questionsOutcome.value.mcqQuestions || [];
        rawTf = questionsOutcome.value.tfQuestions || [];
      } else {
        console.warn("[ReadingService] Initial question generation failed; running single bounded retry...");
        try {
          const retryResult = await this.executeChunkTask({
            task_type: "generate_all_questions",
            passage: baseText,
            languageCode: language,
            language: langName,
            level
          }, 1);
          rawMcq = retryResult?.mcqQuestions || [];
          rawTf = retryResult?.tfQuestions || [];
        } catch (retryErr) {
          console.warn("[ReadingService] Question generation retry failed; synthesizing comprehension questions from passage text.", retryErr);
          rawMcq = [];
          rawTf = [];
        }
      }

      const mcqQuestions = this.sanitizeQuestions(rawMcq, 'mcq', language);
      const tfQuestions = this.sanitizeQuestions(rawTf, 'tf', language);

      // Step 5: Normalize vocabulary hints for interactive token lookup
      const normalizedHints: Record<string, string> = {};
      const cleanRegex = /[.,!?:;()„“"»«[\]/|\\—–\s]/g;

      Object.entries(meanings).forEach(([word, translation]) => {
        const lowerWord = word.toLowerCase().trim();
        const cleanWord = lowerWord.replace(cleanRegex, '');
        if (cleanWord && cleanWord.length > 1) {
          normalizedHints[cleanWord] = translation;
        }

        // Also add the verbatim word key in lowercase
        if (lowerWord && lowerWord.length > 1) {
          normalizedHints[lowerWord] = translation;
        }

        const parts = lowerWord.split(/\s+/);
        if (parts.length > 1) {
          const commonMarkers = new Set([
            'der', 'die', 'das', 'dem', 'den', 'des', 'ein', 'eine', 'einen', 'einem', 'einer', 'eines', 'und', 'ist', 'sind',
            'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'est',
            'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'y', 'es',
            'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', "un'", 'e', 'è',
            'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'e', 'é',
            'the', 'a', 'an', 'and', 'is', 'are', 'to', 'of', 'in', 'on', 'at'
          ]);
          parts.forEach(part => {
            const cleanPart = part.replace(cleanRegex, '').trim();
            if (cleanPart.length > 2 && !commonMarkers.has(cleanPart)) {
              if (!normalizedHints[cleanPart]) {
                normalizedHints[cleanPart] = translation;
              }
            }
          });
        }
      });

      const module: ReadingModule = {
        id: `rm-${level}-${moduleNumber}-${Date.now()}`,
        level,
        moduleNumber,
        theme,
        exercises: [
          {
            id: 'ex-0',
            passage: baseText,
            questions: mcqQuestions,
            vocabularyHints: normalizedHints,
            type: 'mcq'
          },
          {
            id: 'ex-1',
            passage: baseText,
            questions: tfQuestions,
            vocabularyHints: normalizedHints,
            type: 'tf'
          }
        ],
        isCompleted: false,
        maxScore: 10,
        createdAt: Date.now()
      };

      return module;
    } catch (error: any) {
      // Do NOT bypass Authentication (401) or 18+ Age Eligibility (403)
      if (
        error?.status === 401 ||
        error?.status === 403 ||
        error?.code === 'UNAUTHORIZED' ||
        error?.code === 'AGE_CONFIRMATION_REQUIRED' ||
        error?.requiresAgeConfirmation
      ) {
        throw error;
      }

      // Check if we can gracefully fallback to precompiled authentic passages
      const fallbackModule = this.getPremadeFallbackModule(language, level, moduleNumber);
      if (fallbackModule) {
        console.warn(`[ReadingService] Live generation rate-limited/busy; seamless precompiled fallback activated: "${fallbackModule.theme}"`);
        return fallbackModule;
      }

      console.warn("[ReadingService] AI generation failure and no fallback available:", error?.message || error);
      // If no precompiled passage exists for requested language / level, throw recoverable error
      const noFallbackErr: any = new Error(
        `AI generation service is temporarily unavailable (${error?.message || 'rate limit or timeout'}), and no precompiled fallback passage is available for ${langName} at level ${level}. Please try again shortly.`
      );
      noFallbackErr.code = error?.code || 'NO_FALLBACK';
      noFallbackErr.status = error?.status || 503;
      throw noFallbackErr;
    }
  }

  private static async executeChunkTask(params: any, retries = 2): Promise<any> {
    const ai = AiService.getClient();
    const modelName = AiService.getModelName();
    const nativeLang = StorageService.load<string>('native_language', undefined, 'en');
    const nativeName = NATIVE_LANGUAGE_NAMES[nativeLang] || 'English';

    let schema: any;
    let taskSpecificPrompt = "";

    const LANGUAGE_SOURCES: Record<string, string> = {
      'es': 'CVC Cervantes (Lecturas Paso a Paso)',
      'fr': 'TV5Monde (Apprendre) / Lawless French',
      'it': 'Online Italian Club / Easy Italian News',
      'pt': 'Instituto Camões (e-Learning) / Practice Portuguese',
      'zh': 'HSKReading.com / ChineseGradedReader',
      'ko': 'TOPIK Guide / TTMIK Reading Stories',
      'ja': 'NHK News Web Easy / Bento Japanese (JLPT)',
      'ru': 'Lingua.com (Russian) / RT Learn Russian',
      'ga': 'Nuacht Mhall / Foras na Gaeilge',
      'fi': 'Yle Uutiset Selkosuomeksi / Gimara',
      'de': 'German.net, Deutsche Welle (DW), Spiegel, Zeit Online'
    };

    const targetSource = LANGUAGE_SOURCES[params.languageCode] || 'Generic authentic literature and news sources';

    switch (params.task_type) {
      case 'retrieve_passage': {
        const { topic: chosenTopic } = this.getNextUnvisitedTopic(
          params.languageCode,
          params.level,
          params.customTopic
        );

        const lengthProfile = getReadingLengthProfile(params.languageCode, params.level);
        const isExtendedTier = ['B1', 'B2', 'C1'].includes(lengthProfile.normalizedTier);

        taskSpecificPrompt = `
          TASK: Write a fresh, authentic news or feature article in ${params.language} focused on the topic: "${chosenTopic}".
          PUBLICATION STYLE: Modeled after premier open-source media outlets in ${params.language} (such as ${targetSource}).
          FRAMEWORK: ${params.framework}
          LEVEL TARGET: ${params.levelName} (${params.level} — equivalent to CEFR ${lengthProfile.normalizedTier})

          [LEVEL LENGTH & STYLE SPECIFICATION]:
          - Target Length: Approximately ${lengthProfile.minLength}-${lengthProfile.maxLength} ${lengthProfile.unit}.
          - Paragraph Structure: Organize the article into ${lengthProfile.paragraphGuidance}.
          - Linguistic Profile (${lengthProfile.normalizedTier}): ${lengthProfile.styleGuidance}
          ${isExtendedTier ? `- Depth & Flow: Develop the topic naturally across paragraphs (context, key developments, expert perspectives or implications, and conclusion) so the article reaches the target length organically without padding or repetition.` : ''}

          [EDITORIAL MANDATE]:
          1. The article MUST sound like a real, contemporary feature report published by an open media network in ${params.language}.
          2. The content MUST be cohesive, informative, and tailored precisely to level ${params.level} (CEFR ${lengthProfile.normalizedTier}).
          3. Do NOT repeat fixed canned passages — generate a fresh, unique article with high educational vocabulary value.
          4. Separate paragraphs cleanly using double newlines (\\n\\n) inside the "text" field.
          5. Provide a compelling headline in ${params.language} for the output title.

          OUTPUT SCHEMA: { "title": "Headline in ${params.language}", "text": "Full article text in ${params.language}" }
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            text: { type: Type.STRING }
          },
          required: ["title", "text"]
        };
        break;
      }

      case 'extract_and_translate': {
        taskSpecificPrompt = `
          TASK: High-Density Educational Vocabulary Extraction.
          MANDATE:
          1. Identify key nouns, verbs, adjectives, and educational words from the passage.
          2. Extract up to 40-60 distinct, important vocabulary terms exactly as inflected in the passage.
          3. Provide concise 1-2 word ${nativeName} translations based on context.
          4. Exclude extremely basic function words (articles, basic prepositions).

          INPUT PASSAGE: ${params.passage}
          OUTPUT SCHEMA: { "items": [ { "original": "...", "translation": "..." }, ... ] }
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  translation: { type: Type.STRING }
                },
                required: ["original", "translation"]
              }
            }
          },
          required: ["items"]
        };
        break;
      }

      case 'generate_all_questions': {
        const tfOptionLabels = params.languageCode === 'es' ? '["Verdadero", "Falso"]' :
          params.languageCode === 'fr' ? '["Vrai", "Faux"]' :
          params.languageCode === 'de' ? '["Richtig", "Falsch"]' :
          '["True", "False"]';

        taskSpecificPrompt = `
          TASK: Comprehension Question Generation for the following ${params.level} text in ${params.language}.
          REQUIREMENTS:
          1. Generate EXACTLY 5 Multiple Choice questions ("mcqQuestions") based on the text.
             - Each question MUST have exactly 4 plausible options in ${params.language}.
             - "correctAnswerIndex" MUST be an integer 0, 1, 2, or 3 corresponding to the correct option.
             - "explanation" MUST cite and explain the exact textual reason in ${params.language}.
          2. Generate EXACTLY 5 True/False questions ("tfQuestions") based on the text.
             - Each question MUST have options ${tfOptionLabels}.
             - "correctAnswerIndex" MUST be 0 (True) or 1 (False).
             - "explanation" MUST provide the exact proof from the text in ${params.language}.
          3. Questions must test reading comprehension appropriate for ${params.level}.

          INPUT PASSAGE: ${params.passage}
        `;
        schema = {
          type: Type.OBJECT,
          properties: {
            mcqQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"]
              }
            },
            tfQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswerIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING }
                },
                required: ["question", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["mcqQuestions", "tfQuestions"]
        };
        break;
      }

      case 'translate_single': {
        taskSpecificPrompt = `
          TASK: Provide a concise translation for the single word "${params.word}".
          LANGUAGE: ${params.language}
          OUTPUT SCHEMA: { "translation": "..." }
        `;
        schema = {
          type: Type.OBJECT,
          properties: { translation: { type: Type.STRING } },
          required: ["translation"]
        };
        break;
      }

      default:
        throw new Error(`Unsupported task type: ${params.task_type}`);
    }

    const prompt = `
      ROLE: Educational API endpoint for "Talky Bean". Response must be direct JSON.
      CORE DIRECTIVES:
      1. Single-Chunk Execution: Generate ONLY exactly what is requested.
      2. Content Safety: Strictly educational.
      3. Structural Stability: Output EXACTLY one valid, sanitised JSON object matching schema.
      
      ${taskSpecificPrompt}
    `;

    try {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        isLongForm: true,
        timeoutMs: 300000,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema
        }
      });

      const text = result.text || "";
      return this.safeParseJson(text);
    } catch (error: any) {
      // Do NOT retry permanent errors (401, 403, invalid args)
      if (
        error?.status === 401 ||
        error?.status === 403 ||
        error?.code === 'UNAUTHORIZED' ||
        error?.code === 'AGE_CONFIRMATION_REQUIRED' ||
        error?.requiresAgeConfirmation
      ) {
        throw error;
      }

      const errorStr = JSON.stringify(error) + " " + (error?.message || "");

      // Fail fast on 503, UNAVAILABLE, or CIRCUIT_BREAKER_OPEN so precompiled fallback is served immediately
      if (
        error?.status === 503 ||
        error?.code === 'CIRCUIT_BREAKER_OPEN' ||
        error?.code === 'UNAVAILABLE' ||
        errorStr.includes("CIRCUIT_BREAKER_OPEN") ||
        errorStr.includes("503") ||
        errorStr.includes("UNAVAILABLE")
      ) {
        throw error;
      }

      // Do NOT retry 429 quota exhaustion
      if (error?.status === 429 || errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED")) {
        throw error;
      }

      // Reserve exponential backoff with jitter strictly for transient socket/network drops
      const isNetworkRetryable =
        errorStr.includes("Rpc failed") ||
        errorStr.includes("xhr error") ||
        errorStr.includes("timeout") ||
        errorStr.includes("NetworkError") ||
        errorStr.includes("Failed to fetch") ||
        errorStr.includes("ECONNRESET") ||
        errorStr.includes("ETIMEDOUT");

      if (retries > 0 && isNetworkRetryable) {
        const jitter = Math.floor(Math.random() * 250);
        const backoffMs = 1200 * (3 - retries) + jitter;
        console.warn(`[ReadingService] Transient network error. Retrying in ${backoffMs}ms... (${retries} retries left)`);
        await new Promise(r => setTimeout(r, backoffMs));
        return this.executeChunkTask(params, retries - 1);
      }
      throw error;
    }
  }

  static async translateWord(word: string, languageCode: string): Promise<string> {
    const cleanWord = word.toLowerCase().trim().replace(/[.,!?:;()„“"»«[\]/]/g, '');

    // Check offline dictionary & lemmatizer first to eliminate API overhead
    try {
      const dictResult = await DictionaryService.lookupWord(languageCode, cleanWord);
      if (dictResult && dictResult.translation) {
        return dictResult.translation;
      }
    } catch {
      // Continue to AI lookup on lookup exception
    }

    const ai = AiService.getClient();
    const modelName = AiService.getModelName();

    const langConfig = getLanguageConfig(languageCode);
    const sourceLang = langConfig.name;
    const nativeLangCode = StorageService.load<string>('native_language', undefined, 'en');
    const targetLang = NATIVE_LANGUAGE_NAMES[nativeLangCode] || 'English';

    const prompt = `Translate this ${sourceLang} word to ${targetLang}: ${cleanWord}. Return ONLY the direct translation, 1-2 words tops.`;

    try {
      const result = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          maxOutputTokens: 10
        }
      });

      const text = result.text || "";
      if (text) return text.trim().replace(/[.]/g, '');
    } catch (err) {
      console.warn(`[ReadingService] Translation failed`, err);
    }

    return "Error";
  }

  /**
   * Ensures that a module and all its exercises have adequate vocabulary hints.
   * If hints are missing or sparse (< 6 items), automatically populates them from the dictionary.
   */
  static ensureModuleVocabulary(module: ReadingModule, language: string): ReadingModule {
    if (!module || !Array.isArray(module.exercises)) return module;
    let modified = false;

    const updatedExercises = module.exercises.map(ex => {
      const hintCount = ex.vocabularyHints ? Object.keys(ex.vocabularyHints).length : 0;
      if (hintCount < 6 && ex.passage) {
        modified = true;
        const dictHints = extractDictionaryVocabulary(ex.passage, language, 12, 25);
        return {
          ...ex,
          vocabularyHints: { ...(ex.vocabularyHints || {}), ...dictHints }
        };
      }
      return ex;
    });

    if (modified) {
      return { ...module, exercises: updatedExercises };
    }
    return module;
  }

  static getSavedModules(language: string): ReadingModule[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const saved = localStorage.getItem(`${this.STORAGE_KEY_PREFIX}${language}`);
      if (!saved) return [];
      const parsed: ReadingModule[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];

      let modifiedAny = false;
      const repaired = parsed.map(m => {
        const checked = this.ensureModuleVocabulary(m, language);
        if (checked !== m) modifiedAny = true;
        return checked;
      });

      if (modifiedAny) {
        localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${language}`, JSON.stringify(repaired));
      }
      return repaired;
    } catch {
      return [];
    }
  }

  static saveModule(language: string, module: ReadingModule) {
    if (typeof localStorage === 'undefined') return;
    const current = this.getSavedModules(language);
    const enrichedModule = this.ensureModuleVocabulary(module, language);

    // Identity check: Same ID OR (Same Level AND Same ModuleNumber AND not custom)
    const existingIndex = current.findIndex(m =>
      m.id === enrichedModule.id ||
      (m.level === enrichedModule.level && m.moduleNumber === enrichedModule.moduleNumber && m.moduleNumber !== 999)
    );

    if (existingIndex > -1) {
      const prev = current[existingIndex];
      current[existingIndex] = {
        ...enrichedModule,
        // Preserve completed status and highest score across retries
        isCompleted: prev.isCompleted || enrichedModule.isCompleted,
        score: prev.score !== undefined ? Math.max(prev.score, enrichedModule.score ?? 0) : enrichedModule.score
      };
    } else {
      current.push(enrichedModule);
    }
    localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${language}`, JSON.stringify(current));
  }

  static deleteModule(language: string, moduleId: string) {
    if (typeof localStorage === 'undefined') return;
    const current = this.getSavedModules(language);
    const updated = current.filter(m => m.id !== moduleId);
    localStorage.setItem(`${this.STORAGE_KEY_PREFIX}${language}`, JSON.stringify(updated));
  }
}
