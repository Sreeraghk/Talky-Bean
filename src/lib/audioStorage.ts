import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'deutschbuddy_audio_db';
const STORE_NAME = 'audio_blobs';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export const AudioStorage = {
  async set(id: string, base64Data: string): Promise<void> {
    const db = await getDB();
    await db.put(STORE_NAME, base64Data, id);
  },

  async get(id: string): Promise<string | null> {
    const db = await getDB();
    return (await db.get(STORE_NAME, id)) || null;
  },

  async delete(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(STORE_NAME, id);
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear(STORE_NAME);
  }
};
