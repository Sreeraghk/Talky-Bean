import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'talkybean_audio_db';
const STORE_NAME = 'audio_blobs';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;
const memoryCache = new Map<string, string>();

function getDB(): Promise<IDBPDatabase | null> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    }).catch((err) => {
      console.warn('[AudioStorage] IndexedDB initialization failed, falling back to memory cache:', err);
      return null as any;
    });
  }
  return dbPromise;
}

/**
 * Platform-resilient Audio Storage
 * Uses IndexedDB in standard browsers, with an in-memory cache fallback for private/webview sandboxes.
 */
export const AudioStorage = {
  async set(id: string, base64Data: string): Promise<void> {
    try {
      const db = await getDB();
      if (db) {
        await db.put(STORE_NAME, base64Data, id);
        return;
      }
    } catch (e) {
      console.warn('[AudioStorage] Write to IndexedDB failed, writing to memory cache:', e);
    }
    memoryCache.set(id, base64Data);
  },

  async get(id: string): Promise<string | null> {
    try {
      const db = await getDB();
      if (db) {
        const result = await db.get(STORE_NAME, id);
        if (result) return result;
      }
    } catch (e) {
      console.warn('[AudioStorage] Read from IndexedDB failed, reading memory cache:', e);
    }
    return memoryCache.get(id) || null;
  },

  async delete(id: string): Promise<void> {
    try {
      const db = await getDB();
      if (db) {
        await db.delete(STORE_NAME, id);
      }
    } catch (e) {
      // Ignored
    }
    memoryCache.delete(id);
  },

  async clear(): Promise<void> {
    try {
      const db = await getDB();
      if (db) {
        await db.clear(STORE_NAME);
      }
    } catch (e) {
      // Ignored
    }
    memoryCache.clear();
  }
};
