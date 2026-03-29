import { useState, useCallback, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LanguageLevel, Message } from '../types';

interface UseGeminiChatProps {
  level: LanguageLevel;
  context: string;
  vocabulary: string[];
  history?: Message[];
  onTranscriptUpdate: (text: string, isUser: boolean) => void;
  onNewWordLearned: (german: string, english: string) => void;
}

export function useGeminiChat({
  level,
  context,
  vocabulary,
  history = [],
  onTranscriptUpdate,
  onNewWordLearned
}: UseGeminiChatProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const systemInstruction = `You are DeutschBuddy, the user's supportive and motivating German-speaking best friend.
  
  Your goal is to have a natural, routine human-to-human conversation. 
  Talk like a real friend would—casual, empathetic, and engaging. 
  Avoid sounding like an AI, a tutor, or a language learning application.
  
  ARCHITECTURE CHANGE: You are now part of a text-based pipeline. 
  Your response MUST follow this exact structure for every message:
  
  Part 1 (The Conversation): Write your German response clearly. Do not use emojis or special symbols. This part will be read aloud by a TTS engine.
  ---
  Part 2 (The Vocabulary/Translation): Provide the English Translation of your response and a list of 3-5 difficult German words used in the sentence with their English meanings.
  
  Example Response:
  Hallo! Wie geht es dir heute? Ich freue mich, dich zu sehen.
  ---
  Hello! How are you today? I am happy to see you.
  Vocabulary:
  - freuen (to be happy/rejoice)
  - sehen (to see)
  
  CONVERSATION INITIATION PROTOCOL:
  1. NEW CHAT / RESTART: If you receive a message like "INITIATE_CONVERSATION", start with a warm German welcome and an engaging question.
  2. DETECTING BREAKS: If the user says "START", "RESET", or "NEW TOPIC", or if there is a significant shift (like changing levels), "take the mic" and provide a new opening sentence.
  3. DYNAMIC STARTING: Vary your openings. Sometimes start with a question about the user's day, sometimes a "would you rather" scenario, or a cultural fact about Germany.
  
  Current Context: ${context}
  User's German Level: ${level}
  
  Guidelines:
  1. Speak primarily in German at a level appropriate for ${level}.
  2. Keep the conversation flowing naturally.
  3. If you identify new words the user might have learned, include them in the vocabulary list.
  4. The user has previously learned these words: ${vocabulary.join(', ')}. Use them naturally.
  
  CRITICAL: Only Part 1 (before the ---) should be in German. Part 2 (after the ---) must be in English.
  Do not use emojis in Part 1.`;

  const sendMessage = useCallback(async (text: string, silent = false) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Add user message to UI immediately if not silent
      if (!silent) {
        onTranscriptUpdate(text, true);
      }

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
        },
        history: history.map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: text });
      const fullText = response.text;
      
      if (fullText) {
        onTranscriptUpdate(fullText, false);
        
        // Extract learned words if any (we can use a specific format or just parse the vocab list)
        // For now, let's stick to the user's requested format.
      }
    } catch (error) {
      console.error("Gemini Chat Error:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, systemInstruction, onTranscriptUpdate, history]);

  return {
    isProcessing,
    sendMessage
  };
}
