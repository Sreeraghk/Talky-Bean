import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword
} from 'firebase/auth';
import { SubscriptionService } from './SubscriptionService';
import firebaseConfig from '../../firebase-applet-config.json';

export class CloudStatsService {
  private static db: any = null;
  private static auth: any = null;
  private static storage: any = null;
  private static currentUser: User | null = null;
  private static authListeners = new Set<(user: User | null) => void>();
  private static initialized = false;
  private static sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  private static onLoggedOutElsewhere: (() => void) | null = null;
  private static unsubscribeSession: (() => void) | null = null;
  private static unsubscribeUserDoc: (() => void) | null = null;
  private static unsubscribeSubDoc: (() => void) | null = null;

  static setOnLoggedOutElsewhere(callback: () => void) {
    this.onLoggedOutElsewhere = callback;
  }

  static getSessionId() {
    return this.sessionId;
  }

  static getCurrentUser(): User | null {
    return this.currentUser || (this.auth ? this.auth.currentUser : null) || (getApps().length > 0 ? getAuth().currentUser : null);
  }

  static async getIdToken(forceRefresh = false): Promise<string | null> {
    let user = this.getCurrentUser();
    
    // On cold launch or mobile reload, Firebase Auth can take a few hundred ms to restore state from storage
    if (!user && this.auth) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 1500);
        const unsubscribe = onAuthStateChanged(this.auth, (resolvedUser) => {
          clearTimeout(timeout);
          if (resolvedUser) user = resolvedUser;
          unsubscribe();
          resolve();
        });
      });
    }

    if (!user) user = this.getCurrentUser();
    if (!user) return null;

    try {
      return await user.getIdToken(forceRefresh);
    } catch {
      if (!forceRefresh) {
        try {
          return await user.getIdToken(true);
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  static init(onUserChange?: (user: User | null) => void): boolean {
    if (onUserChange) {
      this.authListeners.add(onUserChange);
    }

    if (this.initialized) {
      if (onUserChange) {
        onUserChange(this.getCurrentUser());
      }
      return true;
    }
    if (!firebaseConfig) return false;

    try {
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const dbId = (firebaseConfig as any)?.firestoreDatabaseId || 'ai-studio-0230c0e0-1707-4404-bc00-f37577c217d9';
      this.db = getFirestore(app, dbId);
      this.auth = getAuth(app);
      this.storage = getStorage(app);
      this.initialized = true;

      onAuthStateChanged(this.auth, (user) => {
        this.currentUser = user;
        this.authListeners.forEach(listener => {
          try {
            listener(user);
          } catch (e) {
            console.warn('[CloudStatsService] Error in auth listener callback:', e);
          }
        });

        if (user) {
          this.syncUserRecord(user).catch(err => console.warn('[CloudStatsService] Background sync error:', err));
          this.listenToUserSubscriptionUpdates(user);
        } else {
          if (this.unsubscribeUserDoc) { this.unsubscribeUserDoc(); this.unsubscribeUserDoc = null; }
          if (this.unsubscribeSubDoc) { this.unsubscribeSubDoc(); this.unsubscribeSubDoc = null; }
        }
      });

      // Immediate notify if auth already has a currentUser
      if (this.auth?.currentUser && onUserChange) {
        onUserChange(this.auth.currentUser);
      }

      return true;
    } catch (e) {
      console.error('[CloudStatsService] Initialization error:', e);
      return false;
    }
  }

  static async syncUserRecord(user: User): Promise<void> {
    if (!this.initialized || !this.db || !user) return;
    try {
      const userRef = doc(this.db, 'users', user.uid);
      const now = Date.now();
      
      let creationTime = now;
      if (user.metadata?.creationTime) {
        creationTime = new Date(user.metadata.creationTime).getTime();
      }

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        lastLoginAt: now,
        updatedAt: now,
        createdAt: creationTime
      }, { merge: true });
    } catch (err) {
      console.warn('[CloudStatsService] Could not sync user record:', err);
    }
  }

  static listenToUserSubscriptionUpdates(user: User) {
    if (!this.db || !user) return;
    
    if (this.unsubscribeUserDoc) { this.unsubscribeUserDoc(); this.unsubscribeUserDoc = null; }
    if (this.unsubscribeSubDoc) { this.unsubscribeSubDoc(); this.unsubscribeSubDoc = null; }

    // Admin bypass: Sreeragh is always granted Pro privileges
    if (user.email?.toLowerCase() === 'sreeraghk@gmail.com' || user.uid === 'jruhO3mtqrcBDUxJ2CuPJhs2clf1') {
      console.log('[Real-time Sync]: Admin detected (sreeraghk@gmail.com). Granting permanent developer Pro entitlement.');
      SubscriptionService.toggleSubscription(true, 'free_developer_pass');
      return;
    }

    try {
      const userRef = doc(this.db, 'users', user.uid);
      this.unsubscribeUserDoc = onSnapshot(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.isProMember === true || data?.isPro === true) {
            console.log('[Real-time Sync]: Active Pro entitlement detected on Firestore user record!');
            SubscriptionService.setAuthoritativeState({
              isActive: true,
              platform: 'stripe',
              userId: user.uid,
              entitlementId: 'le_premium'
            });
          }
        }
      }, (err) => {
        console.warn('[Real-time Sync Notice]: User doc listener notice:', err);
      });

      const subRef = doc(this.db, 'users', user.uid, 'settings', 'subscription');
      this.unsubscribeSubDoc = onSnapshot(subRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data?.isActive === true) {
            console.log('[Real-time Sync]: Active Pro subscription detected on Firestore settings record!');
            SubscriptionService.setAuthoritativeState({
              isActive: true,
              platform: data.platform || 'stripe',
              userId: user.uid,
              entitlementId: data.entitlementId || 'le_premium'
            });
          } else {
            console.log('[Real-time Sync]: Inactive Pro subscription detected on Firestore settings record!');
            SubscriptionService.setAuthoritativeState({
              isActive: false,
              platform: 'none',
              userId: user.uid
            });
          }
        } else {
          // Document does not exist in Firestore for this user - reset paid subscription state so new user doesn't inherit previous user's status
          const currentSub = SubscriptionService.getSubscriptionState();
          if (currentSub.platform === 'stripe' || currentSub.platform === 'google_play' || currentSub.platform === 'apple_store') {
            SubscriptionService.setAuthoritativeState({
              isActive: false,
              platform: 'none',
              userId: user.uid
            });
          }
        }
      }, (err) => {
        console.warn('[Real-time Sync Notice]: Subscription settings listener notice:', err);
      });
    } catch (err) {
      console.warn('[Real-time Sync Notice]: Could not subscribe to user document:', err);
    }
  }

  static async login() {
    if (!this.initialized) return;
    try {
      const { UniversalAuthAdapter } = await import('./UniversalAuthAdapter');
      const user = await UniversalAuthAdapter.signInWithGoogle(this.auth);
      if (user) {
        this.syncUserRecord(user).catch(err => console.warn('[CloudStatsService] Notice:', err));
      }
    } catch (e) {
      console.error('[CloudStatsService] Login error:', e);
      throw e;
    }
  }

  static async loginWithApple() {
    if (!this.initialized) return;
    try {
      const { UniversalAuthAdapter } = await import('./UniversalAuthAdapter');
      const user = await UniversalAuthAdapter.signInWithApple(this.auth);
      if (user) {
        this.syncUserRecord(user).catch(err => console.warn('[CloudStatsService] Notice:', err));
      }
    } catch (e) {
      console.error('[CloudStatsService] Apple Login error:', e);
      throw e;
    }
  }

  static async registerWithEmail(email: string, password: string, name: string): Promise<User> {
    if (!this.initialized) throw new Error("Firebase Auth is not initialized. Please configure database first.");
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      if (name) {
        updateProfile(credential.user, { displayName: name }).catch(() => {});
      }
      this.currentUser = this.auth.currentUser || credential.user;
      if (this.currentUser) {
        this.syncUserRecord(this.currentUser).catch(err => console.warn('[CloudStatsService] Notice:', err));
      }
      return credential.user;
    } catch (e) {
      console.error('[CloudStatsService] Email Register error:', e);
      throw e;
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<User> {
    if (!this.initialized) throw new Error("Firebase Auth is not initialized. Please configure database first.");
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      this.currentUser = credential.user;
      if (this.currentUser) {
        this.syncUserRecord(this.currentUser).catch(err => console.warn('[CloudStatsService] Notice:', err));
      }
      return credential.user;
    } catch (e) {
      console.error('[CloudStatsService] Email Login error:', e);
      throw e;
    }
  }

  static async resetPassword(email: string): Promise<void> {
    if (!this.initialized) throw new Error("Firebase Auth is not initialized. Please configure database first.");
    try {
      await sendPasswordResetEmail(this.auth, email.trim());
    } catch (e) {
      console.error('[CloudStatsService] Password Reset error:', e);
      throw e;
    }
  }

  static async updateUserPassword(newPassword: string): Promise<void> {
    if (!this.initialized || !this.currentUser) {
      throw new Error("You must be logged in to update your password.");
    }
    try {
      await updatePassword(this.currentUser, newPassword);
    } catch (e) {
      console.error('[CloudStatsService] Update Password error:', e);
      throw e;
    }
  }

  static async logout() {
    if (!this.initialized) return;
    try {
      // 1. On native Android/iOS, log out of RevenueCat session safely
      try {
        const { UniversalPaymentsAdapter } = await import('./UniversalPaymentsAdapter');
        await UniversalPaymentsAdapter.logOut();
      } catch (rcErr) {
        console.warn('[CloudStatsService] RevenueCat logout error (non-fatal):', rcErr);
      }

      // 2. Firebase sign out
      await this.auth.signOut();
      this.currentUser = null;
      SubscriptionService.saveSubscriptionState({
        isActive: false,
        entitlementId: 'le_premium',
        expiresAt: null,
        productId: 'pro_monthly',
        userId: null,
        platform: 'none',
        sandbox: true,
        trialUsed: false,
        trialExpiresAt: null,
        trialStartDate: null
      });
    } catch (e) {
      console.error('[CloudStatsService] Logout error:', e);
    }
  }

  /**
   * Permanently deletes user account, Firestore subcollections, uploaded files, and auth credentials.
   * Mandated by Apple Guideline 5.1.1(v) & Google Play Data Safety policies.
   */
  static async deleteAccount(): Promise<{ success: boolean; message: string; storeSubscriptionNotice: string }> {
    if (!this.initialized || !this.currentUser) {
      throw new Error("You must be actively signed in to request account deletion.");
    }

    try {
      // 1. Obtain a fresh Firebase ID token
      const idToken = await this.currentUser.getIdToken(true);

      // 2. Call server-authoritative deletion endpoint
      const response = await fetch('/api/user/delete-account', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Account deletion failed with status ${response.status}.`);
      }

      const resData = await response.json();

      // 3. Clear RevenueCat session on native devices
      try {
        const { UniversalPaymentsAdapter } = await import('./UniversalPaymentsAdapter');
        await UniversalPaymentsAdapter.logOut();
      } catch (rcErr) {
        console.warn('[CloudStatsService] RevenueCat logout error during deletion (non-fatal):', rcErr);
      }

      // 4. Client-side sign out and local state purge
      try {
        await this.auth.signOut();
      } catch (authErr) {
        console.warn('[CloudStatsService] Auth sign out error after deletion:', authErr);
      }
      this.currentUser = null;

      // 5. Reset Subscription and clear user learning caches
      SubscriptionService.saveSubscriptionState({
        isActive: false,
        entitlementId: 'le_premium',
        expiresAt: null,
        productId: 'pro_monthly',
        userId: null,
        platform: 'none',
        sandbox: true,
        trialUsed: false,
        trialExpiresAt: null,
        trialStartDate: null
      });

      // Clear all local learning caches and stored profile data
      try {
        const preserveKeys = ['langeasy_theme', 'theme', 'has_seen_onboarding'];
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && !preserveKeys.includes(key)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      } catch (storageErr) {
        console.warn('[CloudStatsService] Local storage cleanup warning:', storageErr);
      }

      return {
        success: true,
        message: resData.message || "Account permanently deleted.",
        storeSubscriptionNotice: resData.storeSubscriptionNotice || ""
      };
    } catch (e: any) {
      console.error('[CloudStatsService] Delete Account error:', e);
      throw e;
    }
  }

  /**
   * Uploads any file to Firebase Storage under the given path or default 'uploads/' folder
   * and returns the public download URL.
   */
  static async uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
    if (!this.initialized) {
      throw new Error("Firebase Storage is not initialized.");
    }
    try {
      const uid = this.currentUser?.uid || 'anonymous';
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileRef = ref(this.storage, `${folder}/${uid}/${timestamp}_${sanitizedName}`);
      
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save file metadata in user's files subcollection in Firestore
      if (this.currentUser && this.db && uid !== 'anonymous') {
        try {
          const fileId = `${timestamp}_${Math.random().toString(36).substring(2, 7)}`;
          const userFileRef = doc(this.db, 'users', uid, 'files', fileId);
          await setDoc(userFileRef, {
            id: fileId,
            fileName: file.name,
            fileUrl: downloadURL,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size || 0,
            folder,
            uploadedAt: timestamp,
            userId: uid,
            userEmail: this.currentUser.email || ''
          });

          // Update fileCount on user document
          const userRef = doc(this.db, 'users', uid);
          const userSnap = await getDoc(userRef);
          const currentCount = userSnap.exists() ? (userSnap.data()?.fileCount || 0) : 0;
          await setDoc(userRef, {
            fileCount: currentCount + 1,
            updatedAt: timestamp
          }, { merge: true });
        } catch (metaErr) {
          console.warn('[CloudStatsService] Failed to record file metadata:', metaErr);
        }
      }

      return downloadURL;
    } catch (e) {
      console.error('[CloudStatsService] Storage Upload Error:', e);
      throw e;
    }
  }

  /**
   * Uploads user avatar image directly to Firebase Storage bucket and updates Firebase Auth profile
   */
  static async uploadAvatar(file: File): Promise<string> {
    const downloadURL = await this.uploadFile(file, 'avatars');
    if (this.currentUser) {
      try {
        await updateProfile(this.currentUser, { photoURL: downloadURL });
      } catch (err) {
        console.warn('[CloudStatsService] Could not update profile photoURL:', err);
      }
    }
    return downloadURL;
  }

  static async getAllUsersForAdmin(): Promise<any[]> {
    if (!this.initialized || !this.db) return [];
    try {
      const querySnap = await getDocs(collection(this.db, 'users'));
      const usersList: any[] = [];
      
      for (const docSnap of querySnap.docs) {
        const userData = docSnap.data();
        let isPro = Boolean(userData.isProMember || userData.isPro);
        let subDetails = null;

        try {
          const subSnap = await getDoc(doc(this.db, 'users', docSnap.id, 'settings', 'subscription'));
          if (subSnap.exists()) {
            subDetails = subSnap.data();
            if (subDetails?.isActive === true) {
              isPro = true;
            }
          }
        } catch (subErr) {
          // ignore error for individual user sub fetch
        }

        usersList.push({
          id: docSnap.id,
          uid: userData.uid || docSnap.id,
          email: userData.email || '',
          displayName: userData.displayName || '',
          createdAt: userData.createdAt || null,
          lastLoginAt: userData.lastLoginAt || null,
          isProMember: isPro,
          isPro: isPro,
          subscription: subDetails,
          ...userData
        });
      }

      return usersList.sort((a, b) => (b.lastLoginAt || b.createdAt || 0) - (a.lastLoginAt || a.createdAt || 0));
    } catch (err) {
      console.error('[CloudStatsService] Error getting all users for admin:', err);
      return [];
    }
  }

  /**
   * Authorize or cancel a user's Pro membership directly by system admin.
   */
  static async updateUserSubscriptionByAdmin(
    targetUserId: string, 
    isPro: boolean, 
    platform: string = 'stripe'
  ): Promise<{ success: boolean; message: string }> {
    if (!this.initialized || !this.db) {
      throw new Error("Firebase Firestore is not initialized.");
    }
    const adminUser = this.getCurrentUser();
    const isAdmin = adminUser && (adminUser.email?.toLowerCase() === 'sreeraghk@gmail.com' || adminUser.uid === 'jruhO3mtqrcBDUxJ2CuPJhs2clf1');
    if (!isAdmin) {
      throw new Error("Unauthorized: Only the system administrator can modify user entitlements.");
    }

    try {
      const now = Date.now();
      const userRef = doc(this.db, 'users', targetUserId);
      const subRef = doc(this.db, 'users', targetUserId, 'settings', 'subscription');

      // Update main user record
      await setDoc(userRef, {
        isProMember: isPro,
        isPro: isPro,
        role: isPro ? 'pro' : 'user',
        updatedAt: now,
        adminModifiedAt: now,
        adminModifiedBy: adminUser?.email || 'sreeraghk@gmail.com'
      }, { merge: true });

      // Update subcollection subscription document
      await setDoc(subRef, {
        isActive: isPro,
        entitlementId: isPro ? 'le_premium' : 'none',
        productId: isPro ? 'pro_monthly' : 'none',
        platform: isPro ? (platform || 'stripe') : 'none',
        grantedByAdmin: isPro,
        revokedByAdmin: !isPro,
        adminEmail: adminUser?.email || 'sreeraghk@gmail.com',
        updatedAt: now
      }, { merge: true });

      console.log(`[Admin Management] Successfully ${isPro ? 'authorized' : 'cancelled'} subscription for user ${targetUserId}`);
      return { 
        success: true, 
        message: `Successfully ${isPro ? 'authorized' : 'cancelled'} Premium for this user.` 
      };
    } catch (err: any) {
      console.error('[Admin Management Error]:', err);
      throw new Error(err?.message || "Failed to update user subscription.");
    }
  }

  static async getUserFilesForAdmin(userId: string): Promise<any[]> {
    if (!this.initialized || !this.db) return [];
    try {
      const querySnap = await getDocs(collection(this.db, 'users', userId, 'files'));
      const filesList: any[] = [];
      querySnap.forEach((docSnap) => {
        filesList.push({ id: docSnap.id, ...docSnap.data() });
      });
      return filesList;
    } catch (err) {
      console.error('[CloudStatsService] Error getting user files for admin:', err);
      return [];
    }
  }

  static async syncProgress(progressData: any) {
    if (!this.initialized || !this.currentUser || !this.db) return;
    const path = `users/${this.currentUser.uid}/stats/progress`;
    try {
      await setDoc(doc(this.db, 'users', this.currentUser.uid, 'stats', 'progress'), {
        data: progressData,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('[CloudStatsService] Could not sync progress to remote:', e);
    }
  }

  static async syncFluency(fluencyDataByLang: any) {
    if (!this.initialized || !this.currentUser || !this.db) return;
    const path = `users/${this.currentUser.uid}/stats/fluency`;
    try {
      await setDoc(doc(this.db, 'users', this.currentUser.uid, 'stats', 'fluency'), {
        data: fluencyDataByLang,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('[CloudStatsService] Could not sync fluency to remote:', e);
    }
  }

  static async syncProfile(profile: any) {
    if (!this.initialized || !this.currentUser || !this.db) return;
    const path = `users/${this.currentUser.uid}/settings/profile`;
    try {
      await setDoc(doc(this.db, 'users', this.currentUser.uid, 'settings', 'profile'), {
        data: profile,
        updatedAt: Date.now()
      });
    } catch (e) {
      console.warn('[CloudStatsService] Could not sync profile to remote:', e);
    }
  }

  static async syncPreferences(prefs: {
    speed: number;
    autoMicOnDelay: number;
    isAutoMode: boolean;
    speakingStyle: string;
    updatedAt?: number;
  }) {
    if (!this.initialized || !this.currentUser || !this.db) return;
    try {
      await setDoc(doc(this.db, 'users', this.currentUser.uid, 'settings', 'preferences'), {
        speed: prefs.speed,
        autoMicOnDelay: prefs.autoMicOnDelay,
        isAutoMode: prefs.isAutoMode,
        speakingStyle: prefs.speakingStyle,
        updatedAt: prefs.updatedAt || Date.now()
      }, { merge: true });
    } catch (e) {
      console.warn('[CloudStatsService] Could not sync preferences to remote:', e);
    }
  }

  static async getRemoteStats() {
    if (!this.initialized || !this.currentUser) return null;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      console.log('[CloudStatsService] Client is offline. Skipping remote stats fetch.');
      return null;
    }
    try {
      const uid = this.currentUser.uid;
      const [progressSnap, fluencySnap, profileSnap, subscriptionSnap, preferencesSnap] = await Promise.all([
        getDoc(doc(this.db, 'users', uid, 'stats', 'progress')).catch(() => null),
        getDoc(doc(this.db, 'users', uid, 'stats', 'fluency')).catch(() => null),
        getDoc(doc(this.db, 'users', uid, 'settings', 'profile')).catch(() => null),
        getDoc(doc(this.db, 'users', uid, 'settings', 'subscription')).catch(() => null),
        getDoc(doc(this.db, 'users', uid, 'settings', 'preferences')).catch(() => null)
      ]);

      return {
        progress: progressSnap && progressSnap.exists() ? progressSnap.data().data : null,
        fluency: fluencySnap && fluencySnap.exists() ? fluencySnap.data().data : null,
        profile: profileSnap && profileSnap.exists() ? profileSnap.data().data : null,
        subscription: subscriptionSnap && subscriptionSnap.exists() ? subscriptionSnap.data() : null,
        preferences: preferencesSnap && preferencesSnap.exists() ? preferencesSnap.data() : null
      };
    } catch (e: any) {
      if (e?.message?.includes('offline') || e?.message?.includes('Failed to get document')) {
        console.warn('[CloudStatsService] Client is offline; fetching remote stats skipped.');
      } else {
        console.error('[CloudStatsService] Remote fetch error:', e);
      }
      return null;
    }
  }

  static async getAdultConfirmationStatus(user?: User | null): Promise<boolean> {
    const targetUser = user || this.currentUser;
    if (!targetUser) return false;

    // Admin is pre-verified
    if (targetUser.uid === 'jruhO3mtqrcBDUxJ2CuPJhs2clf1' || targetUser.email?.toLowerCase() === 'sreeraghk@gmail.com') {
      return true;
    }

    try {
      const cached = localStorage.getItem(`talkybean_age_confirmed_${targetUser.uid}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.isAdultConfirmed === true) return true;
      }
    } catch {}

    // Check Firestore user record
    if (this.db) {
      try {
        const userSnap = await getDoc(doc(this.db, 'users', targetUser.uid));
        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data?.isAdultConfirmed === true) {
            localStorage.setItem(`talkybean_age_confirmed_${targetUser.uid}`, JSON.stringify({
              isAdultConfirmed: true,
              confirmedAt: data.ageConfirmedAt || Date.now()
            }));
            return true;
          }
        }
      } catch (err) {
        console.warn('[CloudStatsService] Error querying adult status:', err);
      }
    }

    return false;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, auth: any) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map((provider: any) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
