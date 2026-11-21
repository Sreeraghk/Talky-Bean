/**
 * Application-wide AI configuration.
 * Centralizing these values allows for easy swapping of models 
 * and operational constraints without modifying core logic.
 * 
 * PLUG-AND-PLAY: To upgrade the AI, simply change the 'primaryModel' ID below.
 */
export const AI_CONFIG = {
  // Model ID - Set to gemini-3.8-flash as recommended by Gemini API guidelines
  primaryModel: "gemini-3.8-flash", 
  
  // Operational Constraints
  maxOutputTokens: 8192,
  contextCacheTTLMinutes: 30,
  
  // Voice Persona Settings
  voiceSettings: {
    pitch: 1.0,
    rate: 1.05,
    gender: 'female' as const,
    voiceName: 'Default Native', // Set to a generic name as the system now dynamically picks the best native voice
    ssmlSettings: {
      prosody: '<prosody contour="(0%,+0Hz) (50%,+2Hz) (100%,-3Hz)" rate="1.05" pitch="+2st">',
      break: '<break time="300ms"/>'
    }
  },
  
  // AI Persona & Behavior Rules
  rules: {
    maxSentences: 2,
    maxCharacters: 140,
    fillerFrequency: 5,
    maxWords: 20,
    style: "Hemingway - active voice, no adverbs, contractions only",
    persona: "supportive, slightly witty female peer (not an assistant)"
  }
};

/**
 * Developer Info: Available stable models & aliases
 * - gemini-flash-latest (Auto-upgrading to the latest production-ready Flash model)
 * - gemini-3.5-flash (Our default core intelligence)
 * - gemini-3.1-pro-preview (Greater reasoning and deep processing)
 */
