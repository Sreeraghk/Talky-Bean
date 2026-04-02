import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { LanguageLevel, Message, SpeakingStyle } from '../types';
import { AiService } from '../services/AiService';

interface UseGeminiChatProps {
  level: LanguageLevel;
  speakingStyle: SpeakingStyle;
  context: string;
  vocabulary: string[];
  history?: Message[];
  onTranscriptUpdate: (text: string, isUser: boolean, isFinal?: boolean) => void;
  onNewWordLearned: (german: string, english: string) => void;
  onGrammarTip: (german: string, explanation: string) => void;
}

export function useGeminiChat({
  level,
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
  
  const personaInstruction = `YOUR PERSONA:
  - You are DeutschBuddy, a friendly and supportive German-speaking companion.
  - You speak standard German clearly and naturally.`;

  const styleInstruction = speakingStyle === 'Formal' 
    ? `SPEAKING STYLE: FORMAL
       - Use proper, textbook German with correct grammar and formal structures.
       - Maintain a professional and polite tone.
       - Focus on clarity and grammatical accuracy.`
    : `SPEAKING STYLE: CASUAL
       - You are the user's human best friend.
       - Speak like a normal friend, not a textbook.
       - Use daily, one-to-one conversational German as spoken in the street, college, school, or office.
       - Incorporate common slang and idioms naturally.
       - Do not stress over perfect grammar; prioritize natural flow and common slang/idioms.
       - Keep the conversation light, silly, and informal.`;

  const systemInstruction = `You are DeutschBuddy, the user's supportive and motivating German-speaking best friend.
  
  ${personaInstruction}
  
  Your goal is to have a natural, friendly human-to-human conversation. 
  Talk like a real friend would—casual, empathetic, and engaging. 
  Avoid sounding like an AI, a tutor, or a language learning application.
  
  ${styleInstruction}
  
  CRITICAL BEHAVIOR RULES:
  1. BE CONCISE: Keep your responses short and natural (1-2 sentences max). Real friends don't give long lectures in casual chat.
  2. TURN-TAKING: Only reply ONCE for every user message. Do not be overly proactive or "interfere" by talking multiple times in a row. Let the user lead the conversation.
  3. SINGLE MESSAGE INPUT: Expect the user to speak their entire thought in one go. Do not split your understanding into multiple messages.
  4. NATURAL TONE: Use casual German. Avoid formal structures unless appropriate for the context.
  
  ARCHITECTURE CHANGE: You are now part of a text-based pipeline. 
  Your response MUST follow this exact structure for every message:
  
  Part 1 (The Conversation): Write your German response clearly. Do not use emojis or special symbols. This part will be read aloud by a TTS engine.
  ---
  Part 2 (Significant Translations): Provide a list of 2-4 significant German words used in the sentence with their English meanings. DO NOT provide a full English translation of the entire message.
  
  Example Response:
  Hallo! Wie geht es dir heute? Hast du gut geschlafen?
  ---
  Vocabulary:
  - heute (today)
  - geschlafen (slept)
  
  CONVERSATION INITIATION PROTOCOL:
  1. NEW CHAT / RESTART: If you receive a message like "INITIATE_CONVERSATION", start with a warm, short German welcome and a simple question.
  2. DETECTING BREAKS: If the user says "START", "RESET", or "NEW TOPIC", provide a new, concise opening sentence.
  
  Current Context: ${context}
  User's German Level: ${level}
  
  Guidelines:
  1. Speak primarily in German at a level appropriate for ${level}.
  2. Keep the conversation flowing naturally and concisely.
  3. The user has previously learned these words: ${vocabulary.join(', ')}. Use them naturally.
  4. Occasionally provide a brief, friendly grammar tip in English if you notice a mistake. Provide it in the format [GRAMMAR_TIP: german_example - explanation_in_english].
  5. Identify new words the user might have learned and provide them in the format [LEARNED_WORD: german - english].
  
  CRITICAL: Only Part 1 (before the ---) should be in German. Part 2 (after the ---) must be in English.
  Do not use emojis in Part 1.`;

  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  onTranscriptUpdateRef.current = onTranscriptUpdate;

  const onNewWordLearnedRef = useRef(onNewWordLearned);
  onNewWordLearnedRef.current = onNewWordLearned;

  const onGrammarTipRef = useRef(onGrammarTip);
  onGrammarTipRef.current = onGrammarTip;

  const sendMessage = useCallback(async (text: string, silent = false) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Add user message to UI immediately if not silent
      if (!silent) {
        onTranscriptUpdateRef.current(text, true);
      }

      const chat = ai.chats.create({
        model: AiService.getModelName(),
        config: {
          systemInstruction,
        },
        history: history.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const responseStream = await chat.sendMessageStream({ message: text });
      let fullText = "";
      let hasStartedConversation = false;

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
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, systemInstruction, history]);

  return {
    isProcessing,
    sendMessage
  };
}
