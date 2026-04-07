import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { getLanguageConfig } from '../config/languages';

export interface VoiceOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  gender?: 'male' | 'female';
  voiceId?: string;
  languageCode?: string;
  useGeminiTTS?: boolean;
}

export interface RecognitionResult {
  transcript: string;
  isFinal: boolean;
}

class NativeVoiceService {
  private isNative = Capacitor.isNativePlatform();
  private webRecognition: any = null;
  private nativeListeners: any[] = [];

  async speak(options: VoiceOptions): Promise<void> {
    const config = getLanguageConfig(options.languageCode || 'de');
    const lang = options.lang || config.ttsLang;

    if (options.useGeminiTTS) {
      await this.geminiSpeak(options);
      return;
    }

    if (this.isNative) {
      try {
        await TextToSpeech.speak({
          text: options.text,
          lang: lang,
          rate: options.rate || 1.0,
          pitch: options.pitch || 1.0,
          volume: options.volume || 1.0,
          category: 'ambient',
        });
      } catch (error) {
        console.error('Native TTS error, falling back to Web:', error);
        await this.webSpeak({ ...options, lang });
      }
    } else {
      await this.webSpeak({ ...options, lang });
    }
  }

  private async geminiSpeak(options: VoiceOptions): Promise<void> {
    const { AiService } = await import('./AiService');
    const { Modality } = await import('@google/genai');
    const ai = AiService.getClient();
    const config = getLanguageConfig(options.languageCode || 'de');

    const audioPrompt = `Speak the following ${config.name} text. 
    
    CRITICAL INSTRUCTIONS FOR AUTHENTICITY:
    1. PACE: Speak at a natural, authentic speed for a human conversation. Not too fast, not robotic.
    2. PAUSES: Strictly follow the "..." and "-" markers for pauses and shifts.
    3. INTONATION: Use expressive, human-like intonation. Pay close attention to ALL CAPS words for emphasis.
    
    TEXT:
    ${options.text}`;

    try {
      const response = await ai.models.generateContent({
        model: AiService.getSpeechModelName(),
        contents: [{ parts: [{ text: audioPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { 
              prebuiltVoiceConfig: { voiceName: 'Kore' } 
            },
          },
        },
      });

      const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        // Gemini TTS returns raw PCM (16-bit, 24kHz, mono).
        // We need to wrap it in a WAV header for the browser to play it.
        const pcmData = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
        const wavData = this.encodeWAV(pcmData, 24000);
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        
        return new Promise((resolve) => {
          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            resolve();
          };
          audio.play();
        });
      }
    } catch (error) {
      console.error('Gemini TTS error, falling back to local:', error);
      // Fallback to local TTS
      if (this.isNative) {
        await TextToSpeech.speak({
          text: options.text,
          lang: options.lang || config.ttsLang,
          rate: options.rate || 1.0,
          pitch: options.pitch || 1.0,
          volume: options.volume || 1.0,
          category: 'ambient',
        });
      } else {
        await this.webSpeak(options);
      }
    }
  }

  private encodeWAV(pcmData: Uint8Array, sampleRate: number): Uint8Array {
    const header = new ArrayBuffer(44);
    const view = new DataView(header);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    // File length
    view.setUint32(4, 36 + pcmData.length, true);
    // RIFF type
    this.writeString(view, 8, 'WAVE');
    // Format chunk identifier
    this.writeString(view, 12, 'fmt ');
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (1 is PCM)
    view.setUint16(20, 1, true);
    // Channel count
    view.setUint16(22, 1, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate (sampleRate * blockAlign)
    view.setUint32(28, sampleRate * 2, true);
    // Block align (channelCount * bytesPerSample)
    view.setUint16(32, 2, true);
    // Bits per sample
    view.setUint16(34, 16, true);
    // Data chunk identifier
    this.writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, pcmData.length, true);

    const wav = new Uint8Array(44 + pcmData.length);
    wav.set(new Uint8Array(header), 0);
    wav.set(pcmData, 44);

    return wav;
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private webSpeak(options: VoiceOptions): Promise<void> {
    return new Promise((resolve) => {
      const startSpeaking = () => {
        const utterance = new SpeechSynthesisUtterance(options.text);
        utterance.lang = options.lang || 'de-DE';
        
        // Base rate and pitch
        let rate = options.rate || 1.0;
        let pitch = options.pitch || 1.0;
        
        // Persona-specific variations (only for German for now, but can be expanded)
        if (options.voiceId && utterance.lang.startsWith('de')) {
          switch (options.voiceId) {
            case 'hans': pitch = 0.8; rate *= 0.9; break;
            case 'lukas': pitch = 1.0; rate *= 1.1; break;
            case 'greta': pitch = 1.1; rate *= 1.15; break;
            case 'heidi': pitch = 1.3; rate *= 0.85; break;
          }
        }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = options.volume || 1.0;
        
        if (window.speechSynthesis) {
          const voices = window.speechSynthesis.getVoices();
          const targetVoices = voices.filter(v => v.lang.startsWith(utterance.lang.split('-')[0]));
          
          if (targetVoices.length > 0) {
            let selectedVoice = null;
            
            // Try to find a voice matching the gender and language
            const maleKeywords = ['male', 'man', 'boy', 'hans', 'stefan', 'markus', 'lukas', 'google deutsch', 'google french', 'google spanish'];
            const femaleKeywords = ['female', 'woman', 'girl', 'greta', 'heidi', 'marlene', 'anna', 'google german', 'google french', 'google spanish'];
            
            if (options.gender === 'male') {
              selectedVoice = targetVoices.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)));
            } else {
              selectedVoice = targetVoices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
            }
            
            if (!selectedVoice && targetVoices.length >= 2 && options.voiceId) {
              const index = options.voiceId.length;
              selectedVoice = targetVoices[index % targetVoices.length];
            }
            
            utterance.voice = selectedVoice || targetVoices[0];
          }
        }
        
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.onvoiceschanged = null;
          startSpeaking();
        };
      } else {
        startSpeaking();
      }
    });
  }

  stopSpeaking(): void {
    if (this.isNative) {
      TextToSpeech.stop().catch(err => console.error('Error stopping native TTS:', err));
    } else {
      window.speechSynthesis.cancel();
    }
  }

  async checkPermissions(): Promise<boolean> {
    if (this.isNative) {
      try {
        const status = await SpeechRecognition.checkPermissions();
        return status.speechRecognition === 'granted';
      } catch (error) {
        console.error('Error checking native permissions:', error);
        return false;
      }
    }
    
    // Web Permissions API check
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as any });
        return result.state === 'granted';
      } catch (e) {
        console.warn('Permissions API error:', e);
      }
    }
    
    return false; // Default to false if we can't verify without prompting
  }

  async requestPermissions(): Promise<boolean> {
    if (this.isNative) {
      try {
        const status = await SpeechRecognition.requestPermissions();
        return status.speechRecognition === 'granted';
      } catch (error) {
        console.error('Error requesting native permissions:', error);
        return false;
      }
    }
    
    // Web: Trigger prompt via getUserMedia
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (e) {
      console.error('Microphone request error:', e);
      return false;
    }
  }

  async startListening(lang: string = 'de-DE', onResult: (result: RecognitionResult) => void, onError: (error: any) => void, onEnd?: () => void): Promise<void> {
    // Ensure any existing session is stopped first
    await this.stopListening();

    if (this.isNative) {
      try {
        const available = await SpeechRecognition.available();
        if (!available.available) {
          throw new Error('Speech recognition not available on this device');
        }

        // Add listeners BEFORE starting
        const partialListener = await SpeechRecognition.addListener('partialResults', (data: any) => {
          if (data.matches && data.matches.length > 0) {
            onResult({ transcript: data.matches[0], isFinal: false });
          }
        });

        // Use any to bypass strict type checking for 'results' event which exists in some versions/platforms
        const resultsListener = await (SpeechRecognition as any).addListener('results', (data: any) => {
          if (data.matches && data.matches.length > 0) {
            onResult({ transcript: data.matches[0], isFinal: true });
          }
        });

        const errorListener = await (SpeechRecognition as any).addListener('error', (data: { message: string }) => {
          console.error("Native Speech Recognition Error:", data.message);
          if (onError) onError(data.message);
        });

        const stateListener = await SpeechRecognition.addListener('listeningState', (data: { status: "started" | "stopped" }) => {
          console.log(`Native Speech Recognition State: ${data.status}`);
          if (data.status === 'stopped' && onEnd) {
            // Small delay to ensure any final results are processed
            setTimeout(() => onEnd(), 300);
          }
        });

        this.nativeListeners.push(partialListener, resultsListener, stateListener, errorListener);

        // Small delay to ensure previous session is fully cleaned up
        await new Promise(resolve => setTimeout(resolve, 100));

        // Start recognition
        SpeechRecognition.start({
          language: lang,
          maxResults: 5,
          prompt: 'Sprechen Sie jetzt...',
          partialResults: true,
          popup: false,
        }).catch(err => {
          console.error('Error starting native recognition:', err);
          onError(err);
        });
      } catch (error) {
        console.error('Native STT error:', error);
        onError(error);
      }
    } else {
      this.webRecognition = this.webStartListening(lang, onResult, onError, onEnd);
    }
  }

  private webStartListening(lang: string, onResult: (result: RecognitionResult) => void, onError: (error: any) => void, onEnd?: () => void): any {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError('Speech recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = true;

    let finalizedTranscript = '';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      
      for (let i = 0; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.trim();
        if (event.results[i].isFinal) {
          // Robust merging: handle both segmented and cumulative results
          // If this result starts with the previous finalized transcript, it's cumulative
          if (finalizedTranscript && transcript.toLowerCase().startsWith(finalizedTranscript.toLowerCase().trim())) {
            finalizedTranscript = transcript;
          } else if (finalizedTranscript && finalizedTranscript.toLowerCase().includes(transcript.toLowerCase())) {
            // If it's already contained, skip it (some browsers repeat results)
            continue;
          } else {
            // Otherwise, append it
            finalizedTranscript += (finalizedTranscript ? ' ' : '') + transcript;
          }
        } else {
          interimTranscript += transcript + ' ';
        }
      }

      const fullTranscript = (finalizedTranscript + ' ' + interimTranscript).trim();
      if (fullTranscript) {
        onResult({ 
          transcript: fullTranscript, 
          isFinal: event.results[event.results.length - 1].isFinal 
        });
      }
    };

    recognition.onerror = onError;
    recognition.onend = () => {
      this.webRecognition = null;
      if (onEnd) onEnd();
    };
    recognition.start();
    return recognition;
  }

  async stopListening(): Promise<void> {
    if (this.isNative) {
      try {
        await SpeechRecognition.stop();
        for (const listener of this.nativeListeners) {
          listener.remove();
        }
        this.nativeListeners = [];
      } catch (e) {
        console.error('Error stopping native recognition:', e);
      }
    } else if (this.webRecognition) {
      try {
        this.webRecognition.stop();
        this.webRecognition = null;
      } catch (e) {
        console.error('Error stopping web recognition:', e);
      }
    }
  }
}

export const voiceService = new NativeVoiceService();
