/**
 * Data classification for platform-independent storage.
 * Enables clean routing in native mobile architectures:
 *  - 'device_preference'    -> @capacitor/preferences / native SharedPreferences / NSUserDefaults
 *  - 'temporary_ui'          -> In-memory state / sessionStorage
 *  - 'auth_session'          -> Secure Enclave / KeyStore / Keychain
 *  - 'subscription_cache'    -> NON-AUTHORITATIVE optimistic UI cache (reconciled against Firestore/server)
 *  - 'persistent_user_data'  -> SQLite / IndexedDB / Firestore offline cache
 */
export type StorageCategory =
  | 'temporary_ui'
  | 'device_preference'
  | 'auth_session'
  | 'subscription_cache'
  | 'persistent_user_data';

export interface StorageEntryMetadata {
  category: StorageCategory;
  description: string;
  /**
   * Whether client-side stored value can be considered authoritative.
   * Security-critical: Must be false for subscriptions, entitlements, token limits, and role assignments.
   */
  isAuthoritative: boolean;
}

/**
 * Registry of stored values and their security/architectural classification
 */
export const STORAGE_REGISTRY: Record<string, StorageEntryMetadata> = {
  // 1. Temporary UI state (volatile, reset-safe)
  active_tab: { category: 'temporary_ui', description: 'Currently active navigation tab', isAuthoritative: true },
  reading_selected: { category: 'temporary_ui', description: 'Selected reading comprehension module', isAuthoritative: true },
  reading_answers: { category: 'temporary_ui', description: 'In-progress reading quiz answers', isAuthoritative: true },
  reading_mode: { category: 'temporary_ui', description: 'Casual vs Pro reading timer mode', isAuthoritative: true },
  grammar_selected_topic: { category: 'temporary_ui', description: 'Active grammar topic id', isAuthoritative: true },
  grammar_selected_module: { category: 'temporary_ui', description: 'Active grammar lesson module', isAuthoritative: true },

  // 2. Device-local preferences (hardware-tied UX settings)
  app_theme: { category: 'device_preference', description: 'Light vs Dark UI theme', isAuthoritative: true },
  speech_speed: { category: 'device_preference', description: 'TTS audio playback speed multiplier', isAuthoritative: true },
  speaking_style: { category: 'device_preference', description: 'Voice roleplay speaking style', isAuthoritative: true },
  auto_mic_delay: { category: 'device_preference', description: 'Delay before auto-activating mic', isAuthoritative: true },
  is_auto_mode: { category: 'device_preference', description: 'Auto-conversational speech loop toggle', isAuthoritative: true },

  // 3. Non-secret device & session metadata (NEVER stores Firebase refresh tokens, ID tokens, or secrets)
  device_uuid: { category: 'auth_session', description: 'Non-secret hardware or browser device identifier', isAuthoritative: true },
  session_id: { category: 'auth_session', description: 'Non-secret active UI session identifier', isAuthoritative: true },

  // 4. Subscription / Entitlement state
  // CRITICAL ARCHITECTURE RULE: Non-authoritative optimistic UI cache.
  // The client must NEVER trust this value as proof of purchase; Firestore / Backend is the single source of truth.
  subscription_state: {
    category: 'subscription_cache',
    description: 'Optimistic UI cache of subscription state (reconciled by Firestore/backend)',
    isAuthoritative: false
  },

  // 5. Persistent user data
  user_profile: { category: 'persistent_user_data', description: 'Local cached copy of user learning goals and profile', isAuthoritative: false },
  completed_grammar_topics: { category: 'persistent_user_data', description: 'Locally cached list of completed grammar topics', isAuthoritative: false },
  offline_modules: { category: 'persistent_user_data', description: 'Cached lesson modules for instant offline load', isAuthoritative: false },
};

export interface IStorageDriver {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * In-memory fallback driver for restricted environments (e.g., privacy mode, WebView storage quota locks)
 */
class MemoryStorageDriver implements IStorageDriver {
  private memoryMap = new Map<string, string>();
  getItem(key: string): string | null {
    return this.memoryMap.has(key) ? this.memoryMap.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.memoryMap.set(key, value);
  }
  removeItem(key: string): void {
    this.memoryMap.delete(key);
  }
}

/**
 * Standard Web LocalStorage Driver with memory fallback
 */
class WebStorageDriver implements IStorageDriver {
  private fallback = new MemoryStorageDriver();

  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // In sandbox or private browsing
    }
    return this.fallback.getItem(key);
  }

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Quota exceeded or restricted
    }
    this.fallback.setItem(key, value);
  }

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {}
    this.fallback.removeItem(key);
  }
}

export class StorageService {
  private static PREFIX = 'talkybean_';
  private static driver: IStorageDriver = new WebStorageDriver();

  /**
   * Allow pluggable storage driver for native platform adaptation (e.g. Capacitor Preferences)
   */
  static setDriver(customDriver: IStorageDriver) {
    this.driver = customDriver;
  }

  /**
   * Device-local preference storage
   */
  static setPreference<T>(key: string, value: T): void {
    this.save(key, value);
  }

  static getPreference<T>(key: string, defaultValue?: T): T {
    return this.load<T>(key, undefined, defaultValue);
  }

  /**
   * Temporary UI state storage
   */
  static setUiState<T>(key: string, value: T): void {
    this.save(`ui_${key}`, value);
  }

  static getUiState<T>(key: string, defaultValue?: T): T {
    return this.load<T>(`ui_${key}`, undefined, defaultValue);
  }

  /**
   * Non-authoritative subscription cache
   */
  static setSubscriptionCache<T>(state: T): void {
    this.save('subscription_state_v3', state);
  }

  static getSubscriptionCache<T>(defaultValue?: T): T {
    return this.load<T>('subscription_state_v3', undefined, defaultValue);
  }

  /**
   * Persistent user data storage
   */
  static setPersistentData<T>(key: string, data: T, lang?: string): void {
    this.save(key, data, lang);
  }

  static getPersistentData<T>(key: string, lang?: string, defaultValue?: T): T {
    return this.load<T>(key, lang, defaultValue);
  }

  /**
   * Generic save with prefix and language scoping.
   * Security guard: refuses to write auth tokens, refresh tokens, or secrets into localStorage.
   */
  static save<T>(key: string, data: T, lang?: string): void {
    if (/(refresh_?token|id_?token|access_?token|auth_?token|secret|password|credential)/i.test(key)) {
      console.error(`[StorageService] Blocked attempt to persist sensitive key "${key}" in browser storage.`);
      return;
    }
    const finalKey = lang ? `${this.PREFIX}${lang}_${key}` : `${this.PREFIX}${key}`;
    try {
      this.driver.setItem(finalKey, JSON.stringify(data));
    } catch (e) {
      console.warn(`[StorageService] Failed to save key: ${finalKey}`, e);
    }
  }

  /**
   * Generic load with migration support
   */
  static load<T>(key: string, lang?: string, defaultValue?: T): T {
    const finalKey = lang ? `${this.PREFIX}${lang}_${key}` : `${this.PREFIX}${key}`;
    try {
      let saved = this.driver.getItem(finalKey);
      if (saved === null) {
        // Fallback and migrate from legacy langeasy_ prefix
        const legacyPrefix = 'langeasy_';
        const legacyKey = lang ? `${legacyPrefix}${lang}_${key}` : `${legacyPrefix}${key}`;
        const legacySaved = this.driver.getItem(legacyKey);
        if (legacySaved !== null) {
          try {
            this.driver.setItem(finalKey, legacySaved);
            this.driver.removeItem(legacyKey);
            saved = legacySaved;
          } catch {}
        }
      }
      if (saved !== null && saved !== '') {
        try {
          return JSON.parse(saved);
        } catch {
          return saved as unknown as T;
        }
      }
    } catch (e) {
      console.error(`[StorageService] Failed to load key: ${finalKey}`, e);
    }
    return defaultValue as T;
  }

  static remove(key: string, lang?: string): void {
    const finalKey = lang ? `${this.PREFIX}${lang}_${key}` : `${this.PREFIX}${key}`;
    this.driver.removeItem(finalKey);
  }

  /**
   * Safe migration helper for legacy keys
   */
  static migrateLegacy(oldKey: string, newKey: string, lang?: string): void {
    const value = this.driver.getItem(oldKey);
    if (value !== null) {
      const targetKey = lang ? `${this.PREFIX}${lang}_${newKey}` : `${this.PREFIX}${newKey}`;
      if (this.driver.getItem(targetKey) === null) {
        this.driver.setItem(targetKey, value);
      }
      this.driver.removeItem(oldKey);
    }
  }
}
