import { LexiconModule } from '../types';

/**
 * Lazy Dynamic Lexicon Loader
 * Loads only the requested language into memory on demand.
 * Avoids loading all 11 dictionaries at app startup.
 */
export async function loadLexiconModule(langCode: string): Promise<LexiconModule | null> {
  const code = (langCode || '').toLowerCase().trim();
  try {
    switch (code) {
      case 'de': {
        const mod = await import('./de');
        return mod.default || mod.germanLexicon;
      }
      case 'es': {
        const mod = await import('./es');
        return mod.default || mod.spanishLexicon;
      }
      case 'fr': {
        const mod = await import('./fr');
        return mod.default || mod.frenchLexicon;
      }
      case 'it': {
        const mod = await import('./it');
        return mod.default || mod.italianLexicon;
      }
      case 'pt': {
        const mod = await import('./pt');
        return mod.default || mod.portugueseLexicon;
      }
      case 'ja': {
        const mod = await import('./ja');
        return mod.default || mod.japaneseLexicon;
      }
      case 'zh': {
        const mod = await import('./zh');
        return mod.default || mod.chineseLexicon;
      }
      case 'ko': {
        const mod = await import('./ko');
        return mod.default || mod.koreanLexicon;
      }
      case 'ru': {
        const mod = await import('./ru');
        return mod.default || mod.russianLexicon;
      }
      case 'ga': {
        const mod = await import('./ga');
        return mod.default || mod.irishLexicon;
      }
      case 'fi': {
        const mod = await import('./fi');
        return mod.default || mod.finnishLexicon;
      }
      default:
        console.warn(`[LexiconLoader] Unsupported language code: ${code}`);
        return null;
    }
  } catch (err) {
    console.error(`[LexiconLoader] Failed to dynamically load lexicon for ${code}:`, err);
    return null;
  }
}
