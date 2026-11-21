import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { getLanguageConfig, GREETINGS } from '../config/languages';
import { AI_CONFIG } from '../config/aiConfig';
import { ThemeService } from '../services/ThemeService';
import { LanguageLevel, Message, SpeakingStyle, VocabularyWord } from '../types';
import { AiService } from '../services/AiService';

interface UseGeminiChatProps {
  level: LanguageLevel;
  languageCode: string;
  speakingStyle: SpeakingStyle;
  context: string;
  scenarioId?: string;
  vocabulary: VocabularyWord[];
  history?: Message[];
  onTranscriptUpdate: (text: string, isUser: boolean, isFinal?: boolean, shouldSpeak?: boolean, translations?: Record<string, string>, suggestedWords?: {word: string, translation: string}[]) => void;
  onNewWordLearned: (word: string, translation: string) => void;
  onGrammarTip: (rule: string, explanation: string) => void;
}

export function useGeminiChat({
  level,
  languageCode,
  speakingStyle,
  context,
  scenarioId,
  vocabulary,
  history = [],
  onTranscriptUpdate,
  onNewWordLearned,
  onGrammarTip
}: UseGeminiChatProps) {
  const isProcessingRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const ai = useMemo(() => AiService.getClient(), []);
  
  const aiConfig = AI_CONFIG;
  const [responseCount, setResponseCount] = useState(0);
  
  const langConfig = useMemo(() => getLanguageConfig(languageCode), [languageCode]);
  const langName = langConfig.name;

  const sessionContextRef = useRef<string>("");

  // Build dynamic instructions
  const chatInstructions = useMemo(() => {
    const personaInstruction = `YOUR PERSONA:
    - You are NOT an assistant. You are a supportive, slightly witty female peer and conversation partner.
    - Your name is ${langName}Bean.
    - Tone: Warm, professional, and concise. 
    - Voice Persona: Female Human.`;

    const sessionContextFragment = sessionContextRef.current 
      ? `\nSESSION MEMORY: ${sessionContextRef.current.slice(0, 500)}`
      : "";

    const speechOptimizationRules = `CONVERSATIONAL RULES:
    1. CONCISENESS: Keep responses brief (15-25 words).
    2. FLOW: Always end your reply with a simple, open-ended question to keep the conversation moving.
    3. HEMINGWAY STYLE: Active voice, simple but expressive.
    4. CONTRACTIONS: Use "I'm", "Don't", "It's", etc. (Apply equivalent principles to ${langName}).
    5. PROSODY: Use "..." for pauses. Use expressive punctuation (!!, ?, ...) to help the TTS sound natural.
    6. HUMAN FEEL: Be polished but never robotic. ${speakingStyle === 'Casual' ? 'Use casual shortcuts common in daily speech.' : 'Maintain professional grace.'}
    7. SPONTANEITY: Refer back to things mentioned in the SESSION MEMORY.`;

    const styleIns = speakingStyle === 'Formal' 
      ? `SPEAKING STYLE: FORMAL
         - Use proper, textbook ${langName}.
         - Professional and polite tone.
         - LANGUAGE RULES:
             1. Start EVERY session strictly in ${langName}.
             2. Use ${langName} for 95% of your speech. Only use English for 1-sentence translations if the user is totally lost.
             3. If the user mixes languages, stay strictly in ${langName}.`
      : `SPEAKING STYLE: CASUAL
         - You are the user's best friend.
         - Use daily, street-level ${langName}.
         - Natural slang and idioms.
         - LANGUAGE RULES:
             1. Start EVERY session strictly in ${langName}.
             2. Use ${langName} for 95% of your speech. Only use English briefly (1 sentence max) if requested or clearly needed.
             3. If the user mixes languages, stay strictly in ${langName}.`;

    const levelIns = level === 'A1' 
      ? `LEVEL ${level} (BEGINNER): Use ONLY basic A1 vocabulary. Short, very simple sentences. Absolutely no complex or compound grammar.`
      : level === 'A2' 
      ? `LEVEL ${level} (ELEMENTARY): Use A2 vocabulary. Simple sentence connections (and, but, because).`
      : level === 'B1'
      ? `LEVEL ${level} (INTERMEDIATE): Standard B1 language for common daily topics and basic opinions.`
      : level === 'B2'
      ? `LEVEL ${level} (UPPER INTERMEDIATE): Advanced B2 vocab/idioms. Abstract topics.`
      : `LEVEL ${level} (ADVANCED/PRO): Sophisticated vocab, complex structures, sarcasm and wit.`;

    const suffixInstruction = `METADATA (MANDATORY after "---"):
    - [TRANS: ${langName} - English] (Provide 2-3 key word translations from your reply, e.g. [TRANS: Quatsch - nonsense])
    - [HELP_USER: English - ${langName}] (Provide 3 dynamic, context-specific starter phrases or useful sentence fragments in English, followed by their ${langName} translations. Provide EACH line inside a separately wrapped [HELP_USER: English - ${langName}] tag, one per line. E.g.:
      [HELP_USER: I am listening to a quiet song. - Ich höre ein ruhiges Lied.]
      [HELP_USER: That really calms me down. - Das bringt mich echt runter.]
      [HELP_USER: I am turning on Spotify. - Ich mache jetzt Spotify an.])
    - [LEARNED_WORD: ${langName} - English] (Highlight 1 key learned word, e.g. [LEARNED_WORD: Quatsch - nonsense])
    - [SESSCON: Update facts about user, max 30 words]
    
    IMPORTANT constraints on metadata after "---":
    1. Do NOT generate JSON curly braces or stringified dictionary lists in the metadata.
    2. Keep any free text commentary extremely brief (maximum of 1-2 lines in total) and purely focus on presenting 1-2 key vocabulary words and their simple English translations.`;

    return `
      STRICT INSTRUCTION: YOU MUST COMMUNICATE IN ${langName} AT A ${level} PROFICIENCY LEVEL.
      Target Language: ${langName}
      Proficiency Level: ${level}
      Persona Name: ${langName}Bean
      
      CONVERSATION FLOW:
      - Always start in ${langName}.
      - ${levelIns}
      - ${styleIns}
      - PRIMARY RULE: You are a conversation partner, not a translator. Speak 95% in ${langName}.
      - ENGAGEMENT RULE: Every single response MUST conclude with a simple question in ${langName} to engage the user.
      
      PERSONA:
      ${personaInstruction}
      
      CONSTRAINTS:
      ${speechOptimizationRules}
      
      CONTEXT:
      Current Conversation context: ${context}
      User Session Facts: ${sessionContextFragment}

      ARCHITECTURE: 
      Part 1: Natural Conversation in ${langName} (At ${level} level)
      ---
      Part 2: Metadata tags
      
      ${suffixInstruction}
      
      FAILURE TO ADHERE TO ${langName} OR LEVEL ${level} IS A CRITICAL SYSTEM ERROR.`;
  }, [langName, speakingStyle, context, level, responseCount]);

  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  onTranscriptUpdateRef.current = onTranscriptUpdate;

  const onNewWordLearnedRef = useRef(onNewWordLearned);
  onNewWordLearnedRef.current = onNewWordLearned;

  const onGrammarTipRef = useRef(onGrammarTip);
  onGrammarTipRef.current = onGrammarTip;

  const historyRef = useRef(history);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const sendMessage = useCallback(async (text: string, silent = false) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const isInitiation = text === "INITIATE_CONVERSATION";
      console.log(`[useGeminiChat] sendMessage: "${isInitiation ? 'INIT' : text}"`);
      
      // 1. Proactively add user message to history so the UI reflects it immediately
      if (!isInitiation && !silent) {
        onTranscriptUpdateRef.current(text, true, true, false);
      }

      if (isInitiation) {
        sessionContextRef.current = "";
        setResponseCount(0); // Full reset
      }
      const currentHistory = isInitiation ? [] : historyRef.current;
      
      // Safety: Cap the session context length and ensure it's a string
      const rawSessionContext = String(sessionContextRef.current || "");
      if (rawSessionContext.length > 500) {
        sessionContextRef.current = rawSessionContext.slice(0, 500) + "...";
      }
      
      // Requests are securely proxied through the server /api/ai/generateContentStream endpoint.
      if (text === "STOP_ALL") {
        isProcessingRef.current = false;
        setIsProcessing(false);
        return;
      }

      // 1. Instructions and History
      const finalInstruction = chatInstructions || "You are a helpful conversation partner.";
      
      console.log(`[useGeminiChat] Sending with instructions for: Lang=${langName}, Level=${level}, HistorySize=${currentHistory.length}`);
      
      const safeHistory = (currentHistory || []).slice(-10).map(m => {
        const role = m.sender === 'user' ? 'user' : 'model';
        const textContent = (String(m.text || "").split("---")[0]).trim();
        return {
          role: role as any,
          parts: [{ text: textContent || (role === 'user' ? "..." : "I'm listening.") }] 
        };
      });

      console.log(`[useGeminiChat] Creating chat with history size: ${safeHistory.length}`);

      const chat = ai.chats.create({
        model: AiService.getModelName(),
        config: {
          systemInstruction: finalInstruction,
          maxOutputTokens: isInitiation ? 200 : 2000
        },
        history: safeHistory
      });

      const connectionTimeout = isInitiation ? 45000 : 90000;
      const isRolePlay = scenarioId && scenarioId !== 'free-talk';

      const messageText = isInitiation 
        ? isRolePlay
          ? `STRICT MODE: START A NEW ROLEPLAY IN ${langName}. Context: ${context}. Give a SHORT (max 12 words) spontaneous opening sentence as your persona in ${langName} now. DO NOT SPEAK ENGLISH. End with --- and your metadata.`
          : `STRICT MODE: START A NEW CONVERSATION IN ${langName}. Level: ${level}. Greet me in ${langName} with a short, spontaneous opener (max 10 words). DO NOT SPEAK ENGLISH. End with --- and your metadata.` 
        : text;
      let fullText = "";
      let hasStartedConversation = false;

      console.log(`[Sync] Initiating Gemini message stream for ${langName}. [Init: ${isInitiation}]`);
      const streamPromise = chat.sendMessageStream({ message: messageText });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI response stream timed out. Please tap retry to continue.")), connectionTimeout)
      );

      const responseStream = await Promise.race([streamPromise, timeoutPromise]) as any;
      
      for await (const chunk of responseStream) {
        if (!isProcessingRef.current) break;

        let chunkText = "";
        if (chunk) {
          if (typeof chunk.text === 'string') chunkText = chunk.text;
          else if (typeof chunk.text === 'function') chunkText = chunk.text();
          else chunkText = chunk.text || "";
        }

        if (chunkText) {
          fullText += chunkText;
          
          if (fullText.includes("---") && !hasStartedConversation) {
            const spokenText = fullText.split("---")[0].trim();
            // Clean dynamic tags for initiation greeting speaking sequence
            const cleanSpoken = isInitiation 
              ? spokenText.replace(/\[(LEARNED_WORD|GRAMMAR_TIP|TRANS|HELP_USER):.*?\]/g, '').trim()
              : spokenText;
            onTranscriptUpdateRef.current(cleanSpoken, false, false, !silent);
            hasStartedConversation = true;
          } else if (!hasStartedConversation) {
            onTranscriptUpdateRef.current(fullText, false, false);
          }
        }
      }
      
      if (fullText && isProcessingRef.current) {
        // Parse translations for underlining and tooltips (symmetric dual-direction for maximum match robustness)
        const translations: Record<string, string> = {};
        const transMatches = Array.from(fullText.matchAll(/\[TRANS: (.*?) - (.*?)\]/g));
        for (const match of transMatches) {
          const val1 = match[1].trim();
          const val2 = match[2].trim();
          const key1 = val1.toLowerCase().replace(/[.,!?()[\]{}:;"'‘’“”]/g, '').trim();
          const key2 = val2.toLowerCase().replace(/[.,!?()[\]{}:;"'‘’“”]/g, '').trim();
          if (key1) translations[key1] = val2;
          if (key2) translations[key2] = val1;
        }

        // Parse learned words ([LEARNED_WORD: TargetLanguage - English]) -> pass (English, TargetLanguage)
        const learnedWordMatches = Array.from(fullText.matchAll(/\[LEARNED_WORD: (.*?) - (.*?)\]/g));
        for (const match of learnedWordMatches) {
          onNewWordLearnedRef.current(match[2].trim(), match[1].trim());
        }

        // Parse grammar tips
        const grammarTipMatches = Array.from(fullText.matchAll(/\[GRAMMAR_TIP: (.*?) - (.*?)\]/g));
        for (const match of grammarTipMatches) {
          onGrammarTipRef.current(match[1], match[2]);
        }

        // Parse Session Context (Mindful memory - take the LAST one if multiple exist)
        const sessConMatches = Array.from(fullText.matchAll(/\[SESSCON: (.*?)\]/g));
        if (sessConMatches.length > 0) {
          const lastMatch = sessConMatches[sessConMatches.length - 1][1];
          sessionContextRef.current = lastMatch.trim().slice(0, 500);
        }

        // Parse suggested words for the user (The "helping words" at the bottom)
        const suggestedWords: {word: string, translation: string}[] = [];
        const helpUserMatches = Array.from(fullText.matchAll(/\[HELP_USER: (.*?) - (.*?)\]/g));
        for (const match of helpUserMatches) {
          suggestedWords.push({ 
            word: match[1].trim(), 
            translation: match[2].trim() 
          });
        }

        // Final update with the full cleaned text and study notes
        const [spoken, notes] = fullText.split("---");
        // Robust regex to clean any bracket metadata tags ([TAG: ...]) including multi-line
        const tagCleanupRegex = /\[[A-Z_]+:[\s\S]*?\]/g;
        const cleanSpoken = spoken.replace(tagCleanupRegex, '').trim();
        const cleanNotes = notes ? notes.replace(tagCleanupRegex, '').trim() : undefined;
        const finalOutputPart = cleanSpoken + (cleanNotes ? ` --- ${cleanNotes}` : '');
        
        onTranscriptUpdateRef.current(finalOutputPart, false, true, !silent, translations, suggestedWords);
        setResponseCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      
      // Better error parsing for quota limits and token limits
      let userFriendlyMessage = error?.message || "Check connection";
      const errorString = String(error?.message || error || "");
      
      if (
        errorString.includes("out of API tokens") || 
        errorString.includes("Gemini limits") || 
        errorString.includes("RESOURCE_EXHAUSTED") || 
        error?.status === "RESOURCE_EXHAUSTED" || 
        error?.code === 429
      ) {
        userFriendlyMessage = "You have run out of API tokens or daily/per-minute Gemini limits to talk to Bean. Please configure/check your paid plans or credits.";
      } else if (errorString.includes("token count exceeds") || error?.code === 400) {
        userFriendlyMessage = "The conversation context is too large. I've reset the short-term memory to fix this.";
        sessionContextRef.current = ""; // Emergency reset
      }
      
      throw new Error(userFriendlyMessage);
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, [ai, chatInstructions, langName, level, context, scenarioId]);

  const clearSession = useCallback(() => {
    sessionContextRef.current = "";
    setResponseCount(0);
    isProcessingRef.current = false;
    setIsProcessing(false);
  }, []);

  return {
    isProcessing,
    sendMessage,
    clearSession
  };
}
