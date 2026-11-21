import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { getLanguageConfig } from '../config/languages';
import { AI_CONFIG } from '../config/aiConfig';
import { AiService } from './AiService';
import { platformService } from './PlatformService';

export interface VoiceOptions {
  text: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  gender?: 'male' | 'female';
  voiceId?: string;
  languageCode?: string;
  isNaturalMode?: boolean;
  onStart?: () => void;
}

export interface RecognitionResult {
  transcript: string;
  isFinal: boolean;
}

class NativeVoiceService {
  private webRecognition: any = null;
  private nativeListeners: any[] = [];
  private currentAudio: HTMLAudioElement | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentSessionId = 0;
  private isInternalStop = false;

  constructor() {
    // Initial platform log
    console.log(`[Buddy] Voice Subsystem initialized using strategy: ${platformService.isWeb() ? 'WEB-OPTIMIZED' : 'NATIVE-OPTIMIZED'}`);
    
    // Proactive voice loading for Web Speech API
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }

  async speak(options: VoiceOptions & { onProgress?: (percent: number) => void }): Promise<void> {
    const platform = platformService.getConfig();
    const aiConfig = AI_CONFIG;
    const config = getLanguageConfig(options.languageCode || 'de');
    const lang = options.lang || config.ttsLang;

    // Clean text: Strip all technical markers like [SPEAKER 1], [OVERLAP], [PAUSE]
    const cleanedText = options.text
      .replace(/\[SPEAKER \d+\]:?/gi, '')
      .replace(/\[[A-Z0-9_\s]+\]/gi, '') // Strip any [TAGS]
      .replace(/\s+/g, ' ')
      .trim();

    this.stopSpeaking();
    const sessionId = ++this.currentSessionId;

    let finalRate = options.rate || aiConfig.voiceSettings.rate;
    let finalPitch = options.pitch || aiConfig.voiceSettings.pitch;
    const voiceName = aiConfig.voiceSettings.voiceName;

    const finalOptions = { ...options, text: cleanedText };

    // Natural mode: slightly more pitch variation and dynamic speed
    if (finalOptions.isNaturalMode) {
      finalPitch = 1.05;
      finalRate = Math.max(0.9, finalRate * 1.02);

      // PROSODY HACK: If text has excitement (!!), increase pitch
      if (cleanedText.includes('!!')) {
        finalPitch += 0.05;
      }
      // PROSODY HACK: If text has hesitation (...), decrease rate
      if (cleanedText.includes('...')) {
        finalRate *= 0.95;
      }
      // PROSODY HACK: If text has emphasis (CAPS), increase pitch/volume
      if (/[A-Z]{2,}/.test(cleanedText)) {
        finalPitch += 0.02;
      }
    }

    if (platform.isNative) {
      try {
        if (finalOptions.onStart) finalOptions.onStart();
        // CALL NATIVE OS ENGINE (Android/iOS)
        await TextToSpeech.speak({
          text: finalOptions.text,
          lang: lang,
          rate: finalRate,
          pitch: finalPitch,
          volume: finalOptions.volume || 1.0,
          category: 'ambient',
        });
        console.log(`[Buddy] Native OS Voice conversion completed on-device.`);
      } catch (error) {
        console.error('Native TTS failed, falling back to Web strategy:', error);
        await this.webSpeak({ ...finalOptions, lang, rate: finalRate, pitch: finalPitch }, sessionId, finalOptions.onProgress, finalOptions.onStart);
      }
    } else {
      // On Web, this invovkes the browser's Web Speech API
      await this.webSpeak({ ...finalOptions, lang, rate: finalRate, pitch: finalPitch }, sessionId, finalOptions.onProgress, finalOptions.onStart);
    }
  }

  private webSpeak(options: VoiceOptions, sessionId: number, onProgress?: (percent: number) => void, onStart?: () => void): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }

      // CRITICAL: Force a full reset of the browser speech queue before starting a new one
      // This prevents the "silent hang" common in Chrome/Edge/Mobile
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.resume();
      } catch (e) {
        console.warn("[VoiceService] Pre-speak reset failed:", e);
      }

      const runSpeak = () => {
        if (this.currentSessionId !== sessionId) {
          resolve();
          return;
        }

        const textToSpeak = options.text
          .replace(/\[[A-Z0-9_\s]+\]/gi, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (!textToSpeak) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        this.currentUtterance = utterance;
        if (typeof window !== 'undefined') {
          (window as any)._activeUtterance = utterance; // Keep global reference to prevent garbage collection on Chrome/Safari
        }
        
        utterance.lang = options.lang || 'de-DE';
        const aiConfig = AI_CONFIG;
        let rate = options.rate || aiConfig.voiceSettings.rate;
        let pitch = options.pitch || aiConfig.voiceSettings.pitch;
        
        if (options.isNaturalMode) {
          rate = Math.max(0.7, rate * 0.95);
        }

        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = options.volume || 1.0;
        
        const voices = window.speechSynthesis.getVoices();
        const targetVoices = voices.filter(v => 
          v.lang && (v.lang.startsWith(utterance.lang.split('-')[0]) || v.lang.includes(utterance.lang.replace('-', '_')))
        );
        
        if (targetVoices.length > 0) {
          // Robust Local Voice Filtering: prioritize local (offline) voices to prevent empty or silent cloud voice streaming failures
          const localPool = targetVoices.filter(v => v.localService === true);
          const activeTargetVoices = localPool.length > 0 ? localPool : targetVoices;

          const naturalPool = activeTargetVoices.filter(v => 
            v.name.toLowerCase().includes('natural') || 
            v.name.toLowerCase().includes('google') || 
            v.name.toLowerCase().includes('premium') ||
            v.name.toLowerCase().includes('siri') ||
            v.name.toLowerCase().includes('enhanced') ||
            v.name.toLowerCase().includes('samsung')
          );

          const voicePool = naturalPool.length > 0 ? naturalPool : activeTargetVoices;
          
          const maleKeywords = ['male', 'man', 'boy', 'hans', 'stefan', 'markus', 'lukas', 'pierre', 'pablo', 'marco', 'ivan', 'thomas', 'david', 'andreas'];
          const femaleKeywords = ['female', 'woman', 'girl', 'greta', 'heidi', 'marlene', 'anna', 'élodie', 'sophie', 'maría', 'elena', 'giulia', 'melina', 'samantha'];
          
          let selectedVoice = null;
          if (options.gender === 'male') {
            selectedVoice = voicePool.find(v => maleKeywords.some(k => v.name.toLowerCase().includes(k)));
          } else {
            selectedVoice = voicePool.find(v => femaleKeywords.some(k => v.name.toLowerCase().includes(k)));
          }

          utterance.voice = selectedVoice || voicePool[0];
        }
        
        utterance.onstart = () => {
          console.log("[VoiceService] Speech output physical START.");
          if (onStart) onStart();
        };

        // Safety timeout: Browsers sometimes fail to fire onend for long strings or lockups
        // We calculate an aggressive but safe upper bound: 150ms per character + 6s buffer
        const estimatedDurationMs = (textToSpeak.length * 150) + 6000;
        const safetyTimeout = setTimeout(() => {
          console.warn("[VoiceService] UTTERANCE HANG DETECTED. Forcing resolution.");
          this.currentUtterance = null;
          if (typeof window !== 'undefined') {
            delete (window as any)._activeUtterance;
          }
          resolve();
        }, estimatedDurationMs);

        utterance.onend = () => {
          console.log("[VoiceService] Speech output physical END.");
          clearTimeout(safetyTimeout);
          if (onProgress) onProgress(100);
          this.currentUtterance = null;
          if (typeof window !== 'undefined') {
            delete (window as any)._activeUtterance;
          }
          resolve();
        };

        utterance.onerror = (e) => {
          const isBenign = (e as any)?.error === 'canceled' || (e as any)?.error === 'interrupted';
          if (!isBenign) {
            console.warn("[VoiceService] Speech output event notice:", (e as any)?.error || e);
          }
          clearTimeout(safetyTimeout);
          this.currentUtterance = null;
          if (typeof window !== 'undefined') {
            delete (window as any)._activeUtterance;
          }
          resolve();
        };

        utterance.onboundary = (event) => {
          if (onProgress && utterance.text.length > 0) {
            const percent = (event.charIndex / utterance.text.length) * 100;
            onProgress(percent);
          }
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn("[VoiceService] Hardware speak invocation notice:", e);
          clearTimeout(safetyTimeout);
          resolve();
        }
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Retry voices fetching for 1.5 seconds maximum
        let voiceRetries = 0;
        const checkVoices = setInterval(() => {
          voiceRetries++;
          const currentVoices = window.speechSynthesis.getVoices();
          if (currentVoices.length > 0 || voiceRetries > 15) {
            clearInterval(checkVoices);
            window.speechSynthesis.onvoiceschanged = null;
            // Settlement delay of 120ms to allow cancel() to completed in underlying browser thread
            setTimeout(runSpeak, 120);
          }
        }, 100);

        window.speechSynthesis.onvoiceschanged = () => {
          clearInterval(checkVoices);
          window.speechSynthesis.onvoiceschanged = null;
          setTimeout(runSpeak, 120);
        };
      } else {
        setTimeout(runSpeak, 120);
      }
    });
  }

  pauseSpeaking(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
    } else if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
  }

  resumeSpeaking(): void {
    if (this.currentAudio) {
      this.currentAudio.play().catch(() => {});
    } else if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
  }

  stopSpeaking(): void {
    this.currentSessionId++;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (platformService.isNative()) {
      TextToSpeech.stop().catch(() => {});
    } else {
      window.speechSynthesis.cancel();
    }
  }

  get isActive(): boolean {
    return !!this.currentAudio || (window.speechSynthesis && window.speechSynthesis.speaking);
  }

  get isPaused(): boolean {
    return (this.currentAudio && this.currentAudio.paused) || (window.speechSynthesis && window.speechSynthesis.paused) || false;
  }

  async checkPermissions(): Promise<boolean> {
    if (platformService.isNative()) {
      try {
        const status = await SpeechRecognition.checkPermissions();
        return status.speechRecognition === 'granted';
      } catch (error) {
        console.error('Error checking native permissions:', error);
        return false;
      }
    }
    return true; 
  }

  async requestPermissions(): Promise<boolean> {
    if (platformService.isNative()) {
      try {
        const status = await SpeechRecognition.requestPermissions();
        return status.speechRecognition === 'granted';
      } catch (error) {
        console.error('Error requesting native permissions:', error);
        return false;
      }
    }
    return true; 
  }

  async startListening(lang: string = 'de-DE', onResult: (result: RecognitionResult) => void, onError: (error: any) => void, onEnd?: () => void): Promise<void> {
    const platform = platformService.getConfig();
    console.log(`[Buddy] STT session start. Platform: ${platform.type.toUpperCase()}, Mode: ${platform.sttEngine.toUpperCase()}`);
    
    this.isInternalStop = true;
    this.stopSpeaking(); // Kill any residual TTS audio focus
    await this.stopListening();
    this.isInternalStop = false;
    
    // Platform-specific release delay: Significantly increased for native hardware transition
    const releaseDelay = platform.isNative ? 1500 : 500; 
    await new Promise(resolve => setTimeout(resolve, releaseDelay));

    if (platform.sttEngine === 'native') {
      let attempts = 0;
      const maxAttempts = 3; // Retry budget for native hardware

      const tryStartNative = async (): Promise<void> => {
        try {
          console.log(`[Buddy] STT Attempt ${attempts + 1} starting...`);
          
          // PROACTIVE hardware reset: Clear state before trying to start
          await SpeechRecognition.stop().catch(() => {});
          await new Promise(r => setTimeout(r, 400)); // Small gap for hardware transition

          if (platform.hapticsEnabled) {
            try { await Haptics.impact({ style: ImpactStyle.Light }); } catch (e) {}
          }

          // Clear old listeners safely
          for (const listener of this.nativeListeners) await listener.remove();
          this.nativeListeners = [];

          this.nativeListeners.push(await SpeechRecognition.addListener('partialResults', (data: any) => {
            console.log("[Buddy] Raw Partial Data:", JSON.stringify(data));
            const matches = data.matches || (data.value ? [data.value] : []);
            if (matches && matches.length > 0) {
              onResult({ transcript: matches[0], isFinal: false });
            }
          }));

          this.nativeListeners.push(await (SpeechRecognition as any).addListener('results', (data: any) => {
            console.log("[Buddy] Raw Final Data:", JSON.stringify(data));
            const matches = data.matches || (data.value ? [data.value] : []);
            if (matches && matches.length > 0) {
              if (platform.hapticsEnabled) {
                try { Haptics.notification({ type: (ImpactStyle as any).Success }); } catch (e) {}
              }
              onResult({ transcript: matches[0], isFinal: true });
            }
          }));

          this.nativeListeners.push(await (SpeechRecognition as any).addListener('error', (data: { message: string }) => {
            console.error("Native STT Internal Error:", data.message);
            // Some platforms send 'error' on stop, so we handle it gracefully
            if (data.message.includes('No recognizer') || data.message.includes('No match')) {
              console.log("[Buddy] Non-critical recognition error.");
            } else {
              onError(data.message);
            }
          }));

          this.nativeListeners.push(await SpeechRecognition.addListener('listeningState', (data: { status: "started" | "stopped" }) => {
            console.log(`[Buddy] Hardware State: ${data.status}`);
            if (data.status === 'stopped' && onEnd && !this.isInternalStop) {
              setTimeout(() => {
                if (!this.isInternalStop) onEnd();
              }, 300);
            }
          }));

          await SpeechRecognition.start({
            language: lang,
            maxResults: 1,
            partialResults: true,
            popup: false,
          });
          console.log("[Buddy] Hardware session confirmed STARTED.");
        } catch (error) {
          attempts++;
          if (attempts < maxAttempts) {
            console.warn(`[Buddy] STT Start attempt ${attempts} failed. Retrying...`, error);
            await new Promise(r => setTimeout(r, 200));
            return tryStartNative();
          }
          console.error('Native STT permanent failure after retries:', error);
          onError(error);
        }
      };

      await tryStartNative();
    } else {
      console.log("[Buddy] Using Web Strategy for STT.");
      this.webRecognition = this.webStartListening(lang, onResult, onError, onEnd);
    }
  }

  private webStartListening(lang: string, onResult: (result: RecognitionResult) => void, onError: (error: any) => void, onEnd?: () => void): any {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      onError('STT not supported in this browser version.');
      return null;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;
      
      // Hardware Warm-up Diagnostic
      let hasReceivedAudio = false;

      recognition.onstart = () => {
        console.log("[Buddy] Web STT hardware session active.");
      };

      recognition.onaudiostart = () => {
        console.log("[Buddy] Web STT: Audio capture started.");
        hasReceivedAudio = true;
      };

      recognition.onspeechstart = () => {
        console.log("[Buddy] Web STT: Speech detected.");
      };

      recognition.onresult = (event: any) => {
        if (!event.results || event.results.length === 0) return;
        
        hasReceivedAudio = true; // Confirmation
        console.log(`[VoiceService] Web Result Received. Total results: ${event.results.length}`);
        
        // Advanced extraction: Browser speech API result formatting varies widely
        let accumulatedTranscript = '';
        let isCurrentResultFinal = false;

        for (let i = 0; i < event.results.length; ++i) {
          const result = event.results[i];
          if (!result) continue;
          
          // Try multiple property names for the transcript string
          const segment = result[0]?.transcript || result.transcript || result.text || "";
          
          if (segment) {
            accumulatedTranscript += (accumulatedTranscript ? " " : "") + segment;
            if (result.isFinal) isCurrentResultFinal = true;
          }
        }

        const fullTranscript = accumulatedTranscript.trim();
        if (fullTranscript) {
          console.log(`[VoiceService] Captured: "${fullTranscript}" (Final: ${isCurrentResultFinal})`);
          onResult({ 
            transcript: fullTranscript, 
            isFinal: isCurrentResultFinal 
          });
        }
      };

      recognition.onerror = (event: any) => {
        const error = event.error;
        console.error("[Buddy] Web STT Logic Error:", error);
        
        // Handle specific 'network' errors which are common in browser Speech API
        if (error === 'network') {
          console.warn("[Buddy] Network error in Speech API. This often means the Google speech servers are unreachable.");
          // Don't immediately fail; notify the system so it can decide whether to retry
          onError('network-unreachable');
        } else {
          onError(error || 'unknown');
        }
      };

      recognition.onend = () => {
        if (this.webRecognition === recognition) {
          console.log("[VoiceService] Web STT hardware session ended naturally.");
          this.webRecognition = null;
        }
        if (onEnd) onEnd();
      };

      const tryStart = (retries = 3) => {
        try {
          recognition.start();
        } catch (e: any) {
          if (retries > 0 && e.message?.includes('already started')) {
            console.warn("[VoiceService] STT already active, retrying after cleanup...");
            recognition.stop();
            setTimeout(() => tryStart(retries - 1), 300);
          } else {
            console.error("[VoiceService] Web STT Start permanent failure:", e);
            onError(e);
          }
        }
      };

      tryStart();
      return recognition;
    } catch (e) {
      onError(e);
      return null;
    }
  }

  async stopListening(): Promise<void> {
    const platform = platformService.getConfig();
    console.log(`[VoiceService] Requesting hardware STOP (${platform.type.toUpperCase()})`);
    
    // Prevent event echo during intentional stop
    this.isInternalStop = true;

    if (platform.isNative) {
      try {
        // Use a race to ensure stop() doesn't hang the whole UI
        await Promise.race([
          SpeechRecognition.stop(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Stop timeout")), 1000))
        ]);
      } catch (e) {
        console.warn("[VoiceService] Native stop signal failed or timed out:", e);
      } finally {
        // ALWAYS clear listeners regardless of stop success
        for (const listener of this.nativeListeners) {
          try { await listener.remove(); } catch (e) {}
        }
        this.nativeListeners = [];
        this.isInternalStop = false;
      }
    } else if (this.webRecognition) {
      try {
        const recognition = this.webRecognition;
        this.webRecognition = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.stop();
      } catch (e) {
        console.warn("[VoiceService] Web stop signal failed:", e);
      }
    }
  }
}

export const voiceService = new NativeVoiceService();
export const speak = (options: VoiceOptions & { onProgress?: (percent: number) => void }) => voiceService.speak(options);
export const stopSpeaking = () => voiceService.stopSpeaking();
export const pauseSpeaking = () => voiceService.pauseSpeaking();
export const resumeSpeaking = () => voiceService.resumeSpeaking();
