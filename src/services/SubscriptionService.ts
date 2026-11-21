import { CloudStatsService, handleFirestoreError, OperationType } from './CloudStatsService';
import { platformService } from './PlatformService';
import { StorageService } from './StorageService';
import { ApiService } from './ApiService';
import { Device } from '@capacitor/device';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export interface SubscriptionState {
  isActive: boolean;
  entitlementId: string;
  expiresAt: number | null;
  productId: string;
  userId: string | null;
  platform: 'stripe' | 'google_play' | 'apple_store' | 'free_trial' | 'none' | 'free_developer_pass';
  sandbox: boolean;
  trialUsed: boolean;
  trialExpiresAt: number | null;
  trialStartDate?: number | null;
}

export interface PremiumProduct {
  id: string;
  name: string;
  priceString: string;
  billingInterval: string;
  description: string;
}

export class SubscriptionService {
  private static STORAGE_KEY = 'talkybean_subscription_state_v3';
  private static authoritativeServerState: SubscriptionState | null = null;
  private static isReconcilingWithServer = false;

  // Helper method to detect India location via timezone & browser locale
  static isUserInIndia(): boolean {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      if (
        tz.toLowerCase().includes('kolkata') ||
        tz.toLowerCase().includes('calcutta') ||
        tz.toLowerCase().includes('asia/calcutta') ||
        tz.toLowerCase().includes('asia/kolkata')
      ) {
        return true;
      }
      const navLangs = navigator.languages || [navigator.language || ''];
      for (const lang of navLangs) {
        if (lang && (lang.toLowerCase().includes('-in') || lang.toLowerCase() === 'hi' || lang.toLowerCase() === 'ta' || lang.toLowerCase() === 'te')) {
          return true;
        }
      }
    } catch (e) {
      // ignore fallback
    }
    return false;
  }

  static getRegionalPricing() {
    const inIndia = this.isUserInIndia();
    if (inIndia) {
      return {
        isIndia: true,
        currencySymbol: '₹',
        currencyCode: 'INR',
        priceValue: 399,
        priceString: '₹399 / month',
        yearlyValue: 2999,
        yearlyString: '₹2,999 / year'
      };
    }
    return {
      isIndia: false,
      currencySymbol: '$',
      currencyCode: 'USD',
      priceValue: 3.99,
      priceString: '$3.99 / month',
      yearlyValue: 29.99,
      yearlyString: '$29.99 / year'
    };
  }

  // Standard premium products
  static get PRODUCTS(): PremiumProduct[] {
    const regional = this.getRegionalPricing();
    return [
      {
        id: 'pro_monthly',
        name: 'Pro Monthly Membership',
        priceString: regional.priceString,
        billingInterval: 'monthly',
        description: 'Unlimited conversation practice daily, premium speech recognition, interactive grammar, and full AI access.'
      }
    ];
  }

  /**
   * Sets authoritative entitlement received from Firestore real-time listener or payment webhook
   */
  static setAuthoritativeState(state: Partial<SubscriptionState>): void {
    const current = this.getSubscriptionState();
    const updated: SubscriptionState = {
      ...current,
      ...state
    };
    this.authoritativeServerState = updated;
    StorageService.setSubscriptionCache(updated);
    window.dispatchEvent(new Event('subscription_change'));
  }

  /**
   * Queries the backend API to cryptographically verify user's entitlements
   * and invalidate any forged client-side localStorage values.
   */
  static async refreshAuthoritativeSubscription(): Promise<SubscriptionState> {
    const user = CloudStatsService.getCurrentUser();
    if (!user) {
      return this.getSubscriptionState();
    }

    try {
      this.isReconcilingWithServer = true;
      const res = await ApiService.getSubscriptionStatus();
      const current = this.getSubscriptionState();

      const verifiedState: SubscriptionState = {
        ...current,
        userId: user.uid,
        isActive: Boolean(res.isPro),
        entitlementId: res.isPro ? 'TALKY_BEAN_PRO' : 'le_premium',
        platform: res.isPro ? (current.platform === 'none' ? 'stripe' : current.platform) : 'none'
      };

      this.authoritativeServerState = verifiedState;
      StorageService.setSubscriptionCache(verifiedState);
      window.dispatchEvent(new Event('subscription_change'));
      return verifiedState;
    } catch (err) {
      console.warn('[SubscriptionService] Server subscription reconciliation notice:', err);
      return this.getSubscriptionState();
    } finally {
      this.isReconcilingWithServer = false;
    }
  }

  static getSubscriptionState(): SubscriptionState {
    const user = CloudStatsService.getCurrentUser();
    const currentUid = user ? user.uid : null;

    // Check if user is the admin (Sreeragh) - never requires subscription
    const isAdminUser = Boolean(
      user && (
        user.email?.toLowerCase() === 'sreeraghk@gmail.com' ||
        user.uid === 'jruhO3mtqrcBDUxJ2CuPJhs2clf1'
      )
    );

    if (isAdminUser) {
      return {
        isActive: true,
        entitlementId: 'le_premium',
        expiresAt: null,
        productId: 'admin_developer_pass',
        userId: currentUid,
        platform: 'free_developer_pass',
        sandbox: false,
        trialUsed: true,
        trialExpiresAt: null,
        trialStartDate: null
      };
    }

    // Authoritative in-memory state takes strict precedence over any unverified local storage
    if (this.authoritativeServerState && this.authoritativeServerState.userId === currentUid) {
      return this.authoritativeServerState;
    }

    // Optimistic read-through cache for instant render while awaiting server response
    const cached = StorageService.getSubscriptionCache<SubscriptionState | null>(null);

    if (cached) {
      // Prevent cross-user state leaks
      if (currentUid && cached.userId && cached.userId !== currentUid) {
        const cleanState: SubscriptionState = {
          isActive: false,
          entitlementId: 'le_premium',
          expiresAt: null,
          productId: 'pro_monthly',
          userId: currentUid,
          platform: 'none',
          sandbox: true,
          trialUsed: false,
          trialExpiresAt: null,
          trialStartDate: null
        };
        StorageService.setSubscriptionCache(cleanState);
        return cleanState;
      }

      // Handle expired active states
      if (cached.isActive && cached.expiresAt && Date.now() > cached.expiresAt) {
        cached.isActive = false;
        cached.platform = 'none';
        StorageService.setSubscriptionCache(cached);
      }

      // If cached state claims paid Pro status but has not been verified this session,
      // trigger background authoritative check with server
      if (cached.isActive && cached.platform !== 'free_trial' && user && !this.isReconcilingWithServer) {
        this.refreshAuthoritativeSubscription().catch(() => {});
      }

      return {
        trialUsed: false,
        trialExpiresAt: null,
        trialStartDate: null,
        ...cached,
        userId: currentUid
      };
    }

    // Default state: not active
    return {
      isActive: false,
      entitlementId: 'le_premium',
      expiresAt: null,
      productId: 'pro_monthly',
      userId: currentUid,
      platform: 'none',
      sandbox: true,
      trialUsed: false,
      trialExpiresAt: null,
      trialStartDate: null
    };
  }

  static saveSubscriptionState(state: SubscriptionState) {
    const user = CloudStatsService.getCurrentUser();
    state.userId = user ? user.uid : state.userId || null;
    
    // Save to isolated subscription cache
    StorageService.setSubscriptionCache(state);
    this.authoritativeServerState = state;
    
    window.dispatchEvent(new Event('subscription_change'));
  }

  static toggleSubscription(active: boolean, platform: 'stripe' | 'google_play' | 'apple_store' | 'free_trial' | 'none' | 'free_developer_pass' = 'stripe') {
    const state = this.getSubscriptionState();
    if (state.isActive === active && state.platform === platform) return;
    state.isActive = active;
    state.platform = platform;
    state.expiresAt = active ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null; // 30 days
    this.saveSubscriptionState(state);
  }

  static async getDeviceId(): Promise<string> {
    try {
      const info = await Device.getId();
      return info.identifier || (info as any).uuid;
    } catch (e) {
      let localId = localStorage.getItem('talkybean_fallback_device_uuid') || localStorage.getItem('langeasy_fallback_device_uuid');
      if (!localId) {
        localId = 'web_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem('talkybean_fallback_device_uuid', localId);
      } else {
        localStorage.setItem('talkybean_fallback_device_uuid', localId);
      }
      return localId;
    }
  }

  static async checkDeviceTrialEligibility(): Promise<boolean> {
    const deviceId = await this.getDeviceId();
    const state = this.getSubscriptionState();
    const user = CloudStatsService.getCurrentUser();
    const initialized = CloudStatsService.init();
    const db = initialized ? (CloudStatsService as any).db : null;

    if (db) {
      try {
        const deviceRef = doc(db, 'used_device_trials', deviceId);
        const snap = await getDoc(deviceRef);
        if (snap.exists()) {
          const data = snap.data();
          const currentUid = user ? user.uid : 'anonymous';
          
          if (data.userId !== currentUid) {
            if (data.userId === 'anonymous' && currentUid !== 'anonymous') {
              console.log('[SubscriptionService] Bounded anonymous device trial to registered account:', currentUid);
              await setDoc(deviceRef, {
                ...data,
                userId: currentUid,
                userEmail: user?.email || 'no-email',
              }, { merge: true });

              if (Date.now() < data.expiresAt) {
                state.isActive = true;
                state.platform = 'free_trial';
                state.trialUsed = true;
                state.expiresAt = data.expiresAt;
                state.trialExpiresAt = data.expiresAt;
                state.trialStartDate = data.activatedAt || (data.expiresAt - 14 * 24 * 60 * 60 * 1000);
                this.saveSubscriptionState(state);
              }
            } else {
              if (state.platform === 'free_trial' && state.isActive) {
                console.warn('[SubscriptionService] Hardware device trial mismatch. Revoking trial status.');
                state.isActive = false;
                this.saveSubscriptionState(state);
                return false;
              }
            }
          } else {
            // Restore active state locally if not already set (e.g., reinstallation during active trial)
            if (!state.isActive && Date.now() < data.expiresAt) {
              console.log('[SubscriptionService] Restoring verified active free trial on device.');
              state.isActive = true;
              state.platform = 'free_trial';
              state.trialUsed = true;
              state.expiresAt = data.expiresAt;
              state.trialExpiresAt = data.expiresAt;
              state.trialStartDate = data.activatedAt || (data.expiresAt - 14 * 24 * 60 * 60 * 1000);
              this.saveSubscriptionState(state);
            }
          }
        }
      } catch (err) {
        console.warn('[SubscriptionService] Failed hardware trial verification check:', err);
      }
    }
    return true;
  }

  static async startFreeTrial(): Promise<SubscriptionState> {
    const isWeb = platformService.isWeb();
    const user = CloudStatsService.getCurrentUser();

    // 1. Web validation - requires login
    if (isWeb && !user) {
      throw new Error("Please sign in or register with email to activate your 14-day free trial on the web.");
    }

    // 2. Query Firestore if initialized to ensure device hasn't already activated the trial
    const deviceId = await this.getDeviceId();
    const initialized = CloudStatsService.init();
    const db = initialized ? (CloudStatsService as any).db : null;

    if (db) {
      const devicePath = `used_device_trials/${deviceId}`;
      try {
        const deviceRef = doc(db, 'used_device_trials', deviceId);
        const deviceSnap = await getDoc(deviceRef);
        
        if (deviceSnap.exists()) {
          const data = deviceSnap.data();
          const currentUid = user ? user.uid : 'anonymous';
          
          if (data.userId !== currentUid) {
            throw new Error("This hardware device has already activated its free trial under a different account or installation. Please purchase a paid subscription to proceed.");
          } else {
            throw new Error("This device/account has already consumed its 14-day free trial.");
          }
        }
      } catch (err: any) {
        if (err.message && (err.message.includes("already activated") || err.message.includes("already consumed"))) {
          throw err;
        }
        handleFirestoreError(err, OperationType.GET, devicePath, (CloudStatsService as any).auth);
      }
    }

    // 3. Local state verification
    const state = this.getSubscriptionState();
    if (state.trialUsed) {
      throw new Error("You have already activated your 14-day free trial.");
    }

    // 4. Activate free trial
    state.isActive = true;
    state.platform = 'free_trial';
    state.trialUsed = true;
    state.expiresAt = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days
    state.trialExpiresAt = state.expiresAt;
    state.trialStartDate = Date.now();
    
    // Save locally
    this.saveSubscriptionState(state);

    // 5. Register in Firestore to prevent trial bypassing
    if (db) {
      const devicePath = `used_device_trials/${deviceId}`;
      try {
        const deviceRef = doc(db, 'used_device_trials', deviceId);
        await setDoc(deviceRef, {
          deviceId,
          activatedAt: Date.now(),
          expiresAt: state.expiresAt,
          userId: user ? user.uid : 'anonymous',
          userEmail: user && user.email ? user.email : 'anonymous',
          platform: isWeb ? 'web' : 'mobile'
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, devicePath, (CloudStatsService as any).auth);
      }
    }

    return state;
  }

  /**
   * Guides the backend or client configuration for connecting RevenueCat SDK.
   * Logs tracking telemetry connecting User UID string with RevenueCat as defined in Phase 2
   */
  static logRevenueCatSync() {
    const state = this.getSubscriptionState();
    if (!state.userId) {
      console.warn('[RevenueCat SDK] Cannot sync subscription: No authenticated User ID. Login required.');
      return false;
    }
    console.log(`[RevenueCat SDK] Synchronizing entitlement bridge:`, {
      app_user_id: state.userId,
      entitlementChecked: state.entitlementId,
      status: state.isActive ? 'BOUND_PREMIUM' : 'FREE',
      sandbox: state.sandbox
    });
    return true;
  }
}
