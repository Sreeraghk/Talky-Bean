import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { getLanguageConfig } from '../config/languages';
import { ThemeService } from '../services/ThemeService';
import { LanguageLevel, Message, SpeakingStyle, VocabularyWord } from '../types';
import { AiService } from '../services/AiService';

interface UseGeminiChatProps {
  level: LanguageLevel;
  languageCode: string;
  speakingStyle: SpeakingStyle;
  context: string;
  vocabulary: VocabularyWord[];
  history?: Message[];
  onTranscriptUpdate: (text: string, isUser: boolean, isFinal?: boolean) => void;
  onNewWordLearned: (word: string, translation: string) => void;
  onGrammarTip: (rule: string, explanation: string) => void;
}

export function useGeminiChat({
  level,
  languageCode,
  speakingStyle,
  context,
  vocabulary,
  history = [],
  onTranscriptUpdate,
  onNewWordLearned,
  onGrammarTip
}: UseGeminiChatProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const ai = useMemo(() => AiService.getClient(), []);
  
  const langConfig = useMemo(() => getLanguageConfig(languageCode), [languageCode]);
  const langName = langConfig.name;

  const personaInstruction = `YOUR PERSONA:
  - You are ${langName}Buddy, a friendly and supportive ${langName}-speaking companion.
  - You speak standard ${langName} clearly and naturally.
  - You are a "Speech-Optimized Text Engine." Your goal is to generate text that sounds like a human speaking, not an AI.`;

  const speechOptimizationRules = `SPEECH OPTIMIZATION (HUMAN-LIKE CONVERSATION):
  1. PROSODY: Vary pitch and intonation. Use punctuation to guide the engine (e.g., "?" for rising pitch, "!" for high energy).
  2. NATURAL PAUSING: Use "..." for brief thought pauses and "-" for sudden mid-sentence shifts in thought.
  3. ADAPTIVE PACE: Write short, punchy sentences for excitement and longer, multi-clause sentences for complex explanations to break rhythmic monotony.
  4. VOCAL EMBODIMENT: Include "breath words" and conversational anchors appropriate for ${langName} (e.g., "Hmm", "Well", "Actually", or language-specific ones like "Na ja", "Also", "Tja").
  5. EMOTIONAL COLORING: Match the word choice to the sentiment—use vivid, sensory language for "bright" tones and grounded, steady vocabulary for "serious" tones.
  6. ARTICULATION: Use natural ${langName} contractions and casual connectors to avoid the "over-enunciated" robotic feel.
  7. INSERT DISFLUENCIES: Occasionally add natural fillers appropriate for ${langName} at the start of complex sentences to simulate real-time thinking.
  8. STRESS CUES: Use ALL CAPS for words that need a "tonic stress".
  9. RHYTHM CONTROL: Avoid uniform sentence lengths. Mix them up constantly.`;

  const styleInstruction = speakingStyle === 'Formal' 
    ? `SPEAKING STYLE: FORMAL
       - Use proper, textbook ${langName} with correct grammar and formal structures.
       - Maintain a professional and polite tone.
       - Focus on clarity and grammatical accuracy.`
    : `SPEAKING STYLE: CASUAL
       - You are the user's human best friend.
       - Speak like a normal friend, not a textbook.
       - Use daily, one-to-one conversational ${langName} as spoken in the street, college, school, or office.
       - Incorporate common slang and idioms naturally.
       - Do not stress over perfect grammar; prioritize natural flow and common slang/idioms.
       - Keep the conversation light, silly, and informal.`;

  const baseInstruction = useMemo(() => `You are ${langName}Buddy, the user's supportive and motivating ${langName}-speaking best friend.
  
  ${personaInstruction}
  
  Your goal is to have a natural, friendly human-to-human conversation. 
  Talk like a real friend would—casual, empathetic, and engaging. 
  Avoid sounding like an AI, a tutor, or a language learning application.
  
  ${speechOptimizationRules}
  
  ${styleInstruction}
  
  CRITICAL BEHAVIOR RULES:
  1. BE CONCISE: Keep your responses short and natural (1-2 sentences max). Real friends don't give long lectures in casual chat.
  2. DOUBT HANDLING: If the user asks a question or expresses a doubt about the language, grammar, or a word, reply in a BRIEF, CRISP, and MEANINGFUL way with EXAMPLES. The answer must be STRAIGHT TO THE POINT.
  3. TURN-TAKING: Only reply ONCE for every user message. Do not be overly proactive or "interfere" by talking multiple times in a row. Let the user lead the conversation.
  4. SINGLE MESSAGE INPUT: Expect the user to speak their entire thought in one go. Do not split your understanding into multiple messages.
  5. NATURAL TONE: Use casual ${langName}. Avoid formal structures unless appropriate for the context.
  
  ARCHITECTURE CHANGE: You are now part of a text-based pipeline. 
  Your response MUST follow this exact structure for every message:
  
  Part 1 (The Conversation): Write your ${langName} response clearly. Do not use emojis or special symbols. This part will be read aloud by a TTS engine.
  ---
  Part 2 (Significant Translations): Provide a list of 2-4 significant ${langName} words used in the sentence with their English meanings. DO NOT provide a full English translation of the entire message.
  
  Example Response:
  Hallo! Wie geht es dir heute? Hast du gut geschlafen?
  ---
  Vocabulary:
  - heute (today)
  - geschlafen (slept)
  
  CONVERSATION INITIATION PROTOCOL:
  1. NEW CHAT / RESTART: If you receive a message like "INITIATE_CONVERSATION", start with a warm, short ${langName} welcome and a simple question.
  2. DETECTING BREAKS: If the user says "START", "RESET", or "NEW TOPIC", provide a new, concise opening sentence.
  
  Current Context: ${context}
  User's ${langName} Level: ${level}
  
  Guidelines:
  1. Speak primarily in ${langName} at a level appropriate for ${level}.
  2. Keep the conversation flowing naturally and concisely.`, [langName, personaInstruction, styleInstruction, context, level]);

  const suffixInstruction = `4. Occasionally provide a brief, friendly grammar tip in English if you notice a mistake. Provide it in the format [GRAMMAR_TIP: example - explanation_in_english].
  5. Identify new words the user might have learned and provide them in the format [LEARNED_WORD: word - translation].
  
  CRITICAL: Only Part 1 (before the ---) should be in ${langName}. Part 2 (after the ---) must be in English.
  Do not use emojis in Part 1.`;

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
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const currentHistory = text === "INITIATE_CONVERSATION" ? [] : historyRef.current;
      
      // Add user message to UI immediately if not silent
      if (!silent) {
        onTranscriptUpdateRef.current(text, true);
      }

      // Construct system instruction
      const systemInstruction = `${baseInstruction}\n${suffixInstruction}`;

      const chat = ai.chats.create({
        model: AiService.getModelName(),
        config: {
          systemInstruction: systemInstruction,
        },
        history: currentHistory.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const responseStream = await chat.sendMessageStream({ message: text });
      
      // Add a timeout for the entire stream consumption
      const streamTimeout = setTimeout(() => {
        if (!hasStartedConversation) {
          console.warn("Gemini stream timed out before starting.");
          // We don't throw here to allow the finally block to reset isProcessing
        }
      }, 15000);

      let fullText = "";
      let hasStartedConversation = false;

      try {
        for await (const chunk of responseStream) {
          const chunkText = chunk.text;
          if (chunkText) {
            fullText += chunkText;
            
            // If we are streaming the first part (before the ---), we can update the UI
            if (!fullText.includes("---")) {
              onTranscriptUpdateRef.current(fullText, false, false);
              hasStartedConversation = true;
            } else if (!hasStartedConversation) {
              // If we just hit the separator, send the first part
              const spokenText = fullText.split("---")[0].trim();
              onTranscriptUpdateRef.current(spokenText, false, false);
              hasStartedConversation = true;
            }
          }
        }
      } finally {
        clearTimeout(streamTimeout);
      }
      
      if (fullText) {
        // Parse learned words
        const learnedWordMatches = Array.from(fullText.matchAll(/\[LEARNED_WORD: (.*?) - (.*?)\]/g));
        for (const match of learnedWordMatches) {
          onNewWordLearnedRef.current(match[1], match[2]);
        }

        // Parse grammar tips
        const grammarTipMatches = Array.from(fullText.matchAll(/\[GRAMMAR_TIP: (.*?) - (.*?)\]/g));
        for (const match of grammarTipMatches) {
          onGrammarTipRef.current(match[1], match[2]);
        }

        // Final update with the full cleaned text (to ensure everything is correct)
        const cleanText = fullText.replace(/\[(LEARNED_WORD|GRAMMAR_TIP):.*?\]/g, '').trim();
        onTranscriptUpdateRef.current(cleanText, false, true);
      }
    } catch (error) {
      console.error("Gemini Chat Error:", error);
      throw error; // Rethrow so the UI can handle the failure
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, baseInstruction, suffixInstruction, ai]);

  return {
    isProcessing,
    sendMessage
  };
}
