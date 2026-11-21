import { CloudStatsService } from './CloudStatsService';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  onSnapshot,
  increment
} from 'firebase/firestore';

export interface WhitelistedUser {
  email: string;
  allowed: boolean;
  tokenLimit: number | null; // null means unlimited
  tokenUsed: number;
  updatedAt: number;
}

export class DeveloperWhitelistService {
  private static COLLECTION_NAME = 'dev_whitelisted_users';
  private static cachedWhitelist: WhitelistedUser | null = null;

  private static getDb() {
    const isInitialized = CloudStatsService.init();
    if (!isInitialized) return null;
    return (CloudStatsService as any).db;
  }

  /**
   * Get in-memory cached whitelisted profile of the current user.
   */
  static getCurrentUserWhitelist(): WhitelistedUser | null {
    return this.cachedWhitelist;
  }

  /**
   * Directly override the in-memory cached whitelisted profile.
   */
  static setCurrentUserWhitelist(val: WhitelistedUser | null) {
    this.cachedWhitelist = val;
  }

  /**
   * Check if user is the admin (Sreeragh)
   */
  static isAdmin(): boolean {
    const currentUser = CloudStatsService.getCurrentUser();
    return currentUser?.email?.toLowerCase() === 'sreeraghk@gmail.com';
  }

  /**
   * Listen to the whitelist doc of the current user in real-time.
   * Helps in dynamically adjusting UI and subscription state.
   */
  static listenToCurrentUserWhitelist(onUpdate: (data: WhitelistedUser | null) => void): (() => void) | null {
    const db = this.getDb();
    if (!db) {
      this.cachedWhitelist = null;
      onUpdate(null);
      return null;
    }

    const user = CloudStatsService.getCurrentUser();
    if (!user || !user.email) {
      this.cachedWhitelist = null;
      onUpdate(null);
      return null;
    }

    const emailKey = user.email.trim().toLowerCase();
    const docRef = doc(db, this.COLLECTION_NAME, emailKey);

    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const info: WhitelistedUser = {
          email: emailKey,
          allowed: !!data.allowed,
          tokenLimit: data.tokenLimit !== undefined ? data.tokenLimit : null,
          tokenUsed: data.tokenUsed || 0,
          updatedAt: data.updatedAt || Date.now()
        };
        this.cachedWhitelist = info;
        onUpdate(info);
      } else {
        this.cachedWhitelist = null;
        onUpdate(null);
      }
    }, (error) => {
      console.warn('[DeveloperWhitelistService] Failed to listen to whitelist doc:', error);
      this.cachedWhitelist = null;
      onUpdate(null);
    });
  }

  /**
   * Fetch the list of all whitelisted users.
   * Only callable by Admin due to Firestore Security Rules.
   */
  static async getWhitelistedUsers(): Promise<WhitelistedUser[]> {
    const db = this.getDb();
    if (!db) throw new Error("Database not initialized");

    const colRef = collection(db, this.COLLECTION_NAME);
    const snap = await getDocs(colRef);
    const users: WhitelistedUser[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      users.push({
        email: docSnap.id,
        allowed: !!data.allowed,
        tokenLimit: data.tokenLimit !== undefined ? data.tokenLimit : null,
        tokenUsed: data.tokenUsed || 0,
        updatedAt: data.updatedAt || Date.now()
      });
    });

    return users.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  /**
   * Add a new user to the whitelist.
   */
  static async addWhitelistedUser(email: string, tokenLimit: number | null): Promise<void> {
    const db = this.getDb();
    if (!db) throw new Error("Database not initialized");

    const emailKey = email.trim().toLowerCase();
    const docRef = doc(db, this.COLLECTION_NAME, emailKey);

    await setDoc(docRef, {
      allowed: true,
      tokenLimit: tokenLimit,
      tokenUsed: 0,
      updatedAt: Date.now()
    });
  }

  /**
   * Change whitelist fields (allowed state, tokenLimit, reset tokenUsed, etc.)
   */
  static async updateWhitelistedUser(email: string, updates: Partial<WhitelistedUser>): Promise<void> {
    const db = this.getDb();
    if (!db) throw new Error("Database not initialized");

    const emailKey = email.trim().toLowerCase();
    const docRef = doc(db, this.COLLECTION_NAME, emailKey);

    const firestoreUpdates: any = {
      updatedAt: Date.now()
    };

    if (updates.allowed !== undefined) firestoreUpdates.allowed = updates.allowed;
    if (updates.tokenLimit !== undefined) firestoreUpdates.tokenLimit = updates.tokenLimit;
    if (updates.tokenUsed !== undefined) firestoreUpdates.tokenUsed = updates.tokenUsed;

    await updateDoc(docRef, firestoreUpdates);
  }

  /**
   * Remove user from the whitelist completely.
   */
  static async removeWhitelistedUser(email: string): Promise<void> {
    const db = this.getDb();
    if (!db) throw new Error("Database not initialized");

    const emailKey = email.trim().toLowerCase();
    const docRef = doc(db, this.COLLECTION_NAME, emailKey);

    await deleteDoc(docRef);
  }

  /**
   * Increment token usage safely.
   */
  static async incrementTokensUsed(email: string, tokensCount: number): Promise<void> {
    const db = this.getDb();
    if (!db) return;

    const emailKey = email.trim().toLowerCase();
    const docRef = doc(db, this.COLLECTION_NAME, emailKey);

    try {
      await updateDoc(docRef, {
        tokenUsed: increment(tokensCount),
        updatedAt: Date.now()
      });
    } catch (err) {
      console.warn('[DeveloperWhitelistService] Failed to increment token usage:', err);
    }
  }
}
