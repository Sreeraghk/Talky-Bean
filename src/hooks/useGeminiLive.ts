import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { LanguageLevel, Message } from '../types';

interface UseGeminiLiveProps {
  level: LanguageLevel;
  context: string;
  speed: number;
  vocabulary: string[];
  showGrammarExplanations: boolean;
  history?: Message[];
  onTranscriptUpdate: (text: string, isUser: boolean) => void;
  onAudioData: (data: string) => void;
  onInterrupted: () => void;
  onNewWordLearned: (german: string, english: string) => void;
}

export function useGeminiLive({
  level,
  context,
  speed,
  vocabulary,
  showGrammarExplanations,
  history = [],
  onTranscriptUpdate,
  onAudioData,
  onInterrupted,
  onNewWordLearned
}: UseGeminiLiveProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Use refs for callbacks to avoid stale closures
  const callbacksRef = useRef({
    onTranscriptUpdate,
    onAudioData,
    onInterrupted,
    onNewWordLearned
  });

  useEffect(() => {
    callbacksRef.current = {
      onTranscriptUpdate,
      onAudioData,
      onInterrupted,
      onNewWordLearned
    };
  }, [onTranscriptUpdate, onAudioData, onInterrupted, onNewWordLearned]);

  // Handle mid-session toggle
  useEffect(() => {
    if (isConnected && sessionRef.current) {
      const message = showGrammarExplanations 
        ? "Please start providing a brief, natural grammar tip in English occasionally after your German responses."
        : "Please stop providing grammar tips and just focus on our natural conversation.";
      
      sessionRef.current.sendRealtimeInput({ text: message });
    }
  }, [showGrammarExplanations, isConnected]);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Zephyr" } },
          },
          systemInstruction: `You are DeutschBuddy, the user's supportive and motivating German-speaking best friend.
          
          Your goal is to have a natural, routine human-to-human conversation. 
          Talk like a real friend would—casual, empathetic, and engaging. 
          Avoid sounding like an AI, a tutor, or a language learning application.
          Don't use formal introductions, repetitive greetings, or "as an AI" language.
          
          CRITICAL: Keep your responses concise and focused on the immediate conversation. 
          Don't lecture, don't explain grammar unless explicitly asked or if showGrammarExplanations is true.
          Just talk like a friend. If the user says "Hello", just say "Hallo! Wie geht's?" or something similar.
          Don't say "As your German buddy, I'm here to help you learn...".
          
          Current Context: ${context}
          User's German Level: ${level}
          
          Guidelines:
          1. Speak primarily in German at a level appropriate for ${level}.
          2. Keep the conversation flowing naturally. Ask follow-up questions about their day, feelings, or the context.
          3. If the user struggles, offer gentle help or switch to English briefly to explain, then return to German.
          4. The user has previously learned these words: ${vocabulary.join(', ')}. Use them naturally in context.
          ${history && history.length > 0 ? `Previous conversation: ${history.slice(-10).map(m => `${m.sender === 'user' ? 'User' : 'AI'}: ${m.text}`).join('\n')}. Continue naturally from here.` : ""}
          ${showGrammarExplanations ? "Occasionally provide a brief, friendly grammar tip in English if you notice a mistake, but keep it very conversational." : ""}
          Identify new words the user might have learned and provide them in the format [LEARNED_WORD: german - english].`,
          outputAudioTranscription: {},
          inputAudioTranscription: {}, 
        },
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startAudioCapture();
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log("Live Message Received:", JSON.stringify(message));
            try {
              const serverContent = message.serverContent;
              if (!serverContent) return;

              // Handle Model Turn (AI Audio)
              if (serverContent.modelTurn) {
                const modelTurn = serverContent.modelTurn;
                if (modelTurn.parts) {
                  for (const part of modelTurn.parts) {
                    if (part.inlineData?.data) {
                      callbacksRef.current.onAudioData(part.inlineData.data);
                    }
                    // Fallback: If outputTranscription is missing, use modelTurn text
                    if (!serverContent.outputTranscription && part.text) {
                      console.log("AI ModelTurn Text Received (Fallback):", part.text);
                      const cleanText = part.text.replace(/\[LEARNED_WORD:.*?\]/g, '').trim();
                      if (cleanText) {
                        callbacksRef.current.onTranscriptUpdate(cleanText, false);
                      }
                    }
                    // Always check for learned words
                    if (part.text) {
                      const learnedWordMatch = part.text.match(/\[LEARNED_WORD: (.*?) - (.*?)\]/);
                      if (learnedWordMatch) {
                        callbacksRef.current.onNewWordLearned(learnedWordMatch[1], learnedWordMatch[2]);
                      }
                    }
                  }
                }
              }

              // Handle AI Transcription (Spontaneous display)
              if (serverContent.outputTranscription) {
                const text = serverContent.outputTranscription.text;
                if (text) {
                  console.log("AI Transcription Received:", text);
                  // Clean up learned word tags from display text
                  const cleanText = text.replace(/\[LEARNED_WORD:.*?\]/g, '').trim();
                  if (cleanText) {
                    callbacksRef.current.onTranscriptUpdate(cleanText, false);
                  }
                }
              }

              // Handle User Transcription (Spontaneous display)
              if (serverContent.inputTranscription) {
                const text = serverContent.inputTranscription.text;
                if (text) {
                  callbacksRef.current.onTranscriptUpdate(text, true);
                }
              }

              if (serverContent.interrupted) {
                callbacksRef.current.onInterrupted();
              }
            } catch (error) {
              console.error("Error processing Live message:", error);
            }
          },
          onclose: () => {
            setIsConnected(false);
            stopAudioCapture();
          },
          onerror: (error) => {
            console.error("Gemini Live Error:", error);
            setIsConnected(false);
            setIsConnecting(false);
            stopAudioCapture();
          }
        }
      });

      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to connect to Gemini Live:", error);
      setIsConnecting(false);
    }
  }, [level, context, speed, history, onTranscriptUpdate, onAudioData, onInterrupted, onNewWordLearned, isConnected, isConnecting]);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsConnected(false);
    stopAudioCapture();
  }, []);

  const startAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert to 16-bit PCM
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        
        if (sessionRef.current) {
          sessionRef.current.sendRealtimeInput({
            audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
          });
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error) {
      console.error("Error starting audio capture:", error);
    }
  };

  const stopAudioCapture = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const sendMessage = useCallback((text: string) => {
    if (sessionRef.current && isConnected) {
      sessionRef.current.sendRealtimeInput({ text });
    }
  }, [isConnected]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage
  };
}
