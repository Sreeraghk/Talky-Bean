import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

export interface VoiceOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  gender?: 'male' | 'female';
  voiceId?: string;
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
    if (this.isNative) {
      try {
        await TextToSpeech.speak({
          text: options.text,
          lang: options.lang || 'de-DE',
          rate: options.rate || 1.0,
          pitch: options.pitch || 1.0,
          volume: options.volume || 1.0,
          category: 'ambient',
        });
      } catch (error) {
        console.error('Native TTS error, falling back to Web:', error);
        await this.webSpeak(options);
      }
    } else {
      await this.webSpeak(options);
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
        
        // Apply persona-specific variations to make them sound like different people
        if (options.voiceId) {
          switch (options.voiceId) {
            case 'hans':
              pitch = 0.8; // Deeper male voice
              rate *= 0.9; // Slightly slower, more deliberate
              break;
            case 'lukas':
              pitch = 1.0; // Normal male voice
              rate *= 1.1; // Slightly faster, energetic
              break;
            case 'greta':
              pitch = 1.1; // Higher female voice
              rate *= 1.15; // Fast, lively Berlin energy
              break;
            case 'heidi':
              pitch = 1.3; // Very high, sweet female voice
              rate *= 0.85; // Slower, gentle Southwestern pace
              break;
          }
        }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = options.volume || 1.0;
        
        if (window.speechSynthesis) {
          const voices = window.speechSynthesis.getVoices();
          const deVoices = voices.filter(v => v.lang.startsWith('de'));
          
          if (deVoices.length > 0) {
            let selectedVoice = null;
            
            // Try to find a voice matching the gender and language
            const maleKeywords = ['male', 'man', 'boy', 'hans', 'stefan', 'markus', 'lukas', 'google deutsch'];
            const femaleKeywords = ['female', 'woman', 'girl', 'greta', 'heidi', 'marlene', 'anna', 'google german'];
            
            if (options.gender === 'male') {
              selectedVoice = deVoices.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)));
            } else {
              selectedVoice = deVoices.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
            }
            
            // If no gender match, try to pick different voices for different IDs if available
            if (!selectedVoice && deVoices.length >= 2) {
              const index = options.voiceId === 'hans' || options.voiceId === 'greta' ? 0 : 1;
              selectedVoice = deVoices[index % deVoices.length];
            }
            
            utterance.voice = selectedVoice || deVoices[0];
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
        if (status.speechRecognition === 'granted') return true;
        
        const newStatus = await SpeechRecognition.requestPermissions();
        return newStatus.speechRecognition === 'granted';
      } catch (error) {
        console.error('Error checking native permissions:', error);
        return false;
      }
    }
    return true; // Browser handles permissions via prompt
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
