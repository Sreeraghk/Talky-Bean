import { Purchases, CustomerInfo, PurchasesPackage, PurchasesOfferings } from '@revenuecat/purchases-capacitor';
import { platformService } from './PlatformService';
import { ApiService } from './ApiService';
import { SubscriptionService, SubscriptionState } from './SubscriptionService';
import { CloudStatsService } from './CloudStatsService';

export interface PurchaseInitOptions {
  planId: string;
  onSuccess: (state: SubscriptionState) => void;
  onError: (err: Error) => void;
}

export const REVENUECAT_ENTITLEMENT_ID = 'TALKY_BEAN_PRO';

/**
 * Universal Payments Adapter
 * Dynamically routes payment checkouts to the authoritative, compliant gateway for each platform:
 *  - Web: Dodo Payments (RBI + PROGA 2025 compliant)
 *  - Android: Native Google Play Billing via RevenueCat Capacitor SDK
 *  - iOS: Native Apple StoreKit 2 via RevenueCat Capacitor SDK
 */
export class UniversalPaymentsAdapter {
  public static readonly ENTITLEMENT_ID = REVENUECAT_ENTITLEMENT_ID;
  private static isRevenueCatInitialized = false;
  private static currentAppUserId: string | null = null;

  /**
   * Initializes RevenueCat on native devices using the authenticated Firebase user UID.
   */
  static async initializeNativeBilling(): Promise<boolean> {
    if (!platformService.isNative()) {
      return false;
    }

    try {
      const user = CloudStatsService.getCurrentUser();
      const appUserID = user?.uid || undefined;

      const apiKey = platformService.isAndroid()
        ? (import.meta.env.VITE_REVENUECAT_GOOGLE_API_KEY || '')
        : (import.meta.env.VITE_REVENUECAT_APPLE_API_KEY || '');

      if (!apiKey) {
        console.warn(
          `[RevenueCat] Native billing API key is not configured for platform: ${platformService.getConfig().type}. ` +
          `Set ${platformService.isAndroid() ? 'VITE_REVENUECAT_GOOGLE_API_KEY' : 'VITE_REVENUECAT_APPLE_API_KEY'} in environment.`
        );
        return false;
      }

      if (!this.isRevenueCatInitialized) {
        await Purchases.configure({
          apiKey,
          appUserID: appUserID || undefined
        });
        this.isRevenueCatInitialized = true;
        this.currentAppUserId = appUserID || null;
        console.log(`[RevenueCat] Initialized successfully for user: ${appUserID || 'anonymous'}`);
      } else if (appUserID && this.currentAppUserId !== appUserID) {
        await Purchases.logIn({ appUserID });
        this.currentAppUserId = appUserID;
        console.log(`[RevenueCat] Identified user: ${appUserID}`);
      }

      return true;
    } catch (err) {
      console.error('[RevenueCat] Initialization error:', err);
      return false;
    }
  }

  /**
   * Safe logout helper for native RevenueCat session.
   * Invoked on Firebase sign-out to prevent entitlement leakage across different users on same device.
   */
  static async logOut(): Promise<void> {
    if (!platformService.isNative()) {
      return;
    }
    try {
      if (this.isRevenueCatInitialized) {
        await Purchases.logOut();
      }
      this.currentAppUserId = null;
      console.log('[RevenueCat] User logged out successfully.');
    } catch (err) {
      console.warn('[RevenueCat] Purchases.logOut error (handled safely):', err);
    }
  }

  /**
   * Shared native entitlement check for TALKY_BEAN_PRO
   */
  static async checkNativeEntitlement(): Promise<boolean> {
    if (!platformService.isNative()) {
      return false;
    }

    try {
      const initialized = await this.initializeNativeBilling();
      if (!initialized) return false;

      const { customerInfo } = await Purchases.getCustomerInfo();
      return Boolean(customerInfo.entitlements.active[this.ENTITLEMENT_ID]?.isActive);
    } catch (err) {
      console.warn('[RevenueCat] Error checking entitlement:', err);
      return false;
    }
  }

  /**
   * Restores purchases on native Android / iOS platforms and reconciles authoritatively.
   */
  static async restorePurchases(): Promise<{ restored: boolean; message: string }> {
    if (!platformService.isNative()) {
      const serverState = await SubscriptionService.refreshAuthoritativeSubscription();
      return {
        restored: serverState.isActive,
        message: serverState.isActive
          ? 'Active subscription found and restored!'
          : 'No active web subscription found for this account.'
      };
    }

    try {
      const initialized = await this.initializeNativeBilling();
      if (!initialized) {
        throw new Error('Native billing is not configured. Please ensure RevenueCat store API keys are set.');
      }

      const { customerInfo } = await Purchases.restorePurchases();
      const hasPro = Boolean(customerInfo.entitlements.active[this.ENTITLEMENT_ID]?.isActive);

      if (hasPro) {
        // Authoritative reconciliation with backend - do not grant local-only Pro
        const state = await SubscriptionService.refreshAuthoritativeSubscription();
        return {
          restored: true,
          message: 'Purchases successfully restored!'
        };
      } else {
        return {
          restored: false,
          message: 'No previous purchases found for this store account.'
        };
      }
    } catch (err: any) {
      console.error('[RevenueCat] Restore purchases failed:', err);
      return {
        restored: false,
        message: err?.message || 'Failed to restore purchases. Please try again.'
      };
    }
  }

  /**
   * Universal Purchase Request Dispatcher
   */
  static async requestPurchase(options: PurchaseInitOptions): Promise<void> {
    const { planId, onSuccess, onError } = options;

    if (platformService.isAndroid()) {
      return this.purchaseNativeStore(planId, 'google_play', onSuccess, onError);
    }

    if (platformService.isIOS()) {
      return this.purchaseNativeStore(planId, 'apple_store', onSuccess, onError);
    }

    // Default: Web checkout via Dodo Payments
    return this.purchaseWithDodoWeb(planId, onSuccess, onError);
  }

  /**
   * Native Store Purchase Bridge (Android Google Play & iOS StoreKit 2 via RevenueCat)
   * Follows strict security rules:
   *  - Does NOT use dummy tokens or mock receipts.
   *  - Does NOT locally grant Pro status.
   *  - Uses RevenueCat for transaction processing.
   *  - Reconciles authoritatively with backend / Firestore.
   */
  private static async purchaseNativeStore(
    planId: string,
    platform: 'google_play' | 'apple_store',
    onSuccess: (state: SubscriptionState) => void,
    onError: (err: Error) => void
  ): Promise<void> {
    try {
      if (!platformService.isNative()) {
        throw new Error(
          `Native ${platform === 'google_play' ? 'Google Play' : 'App Store'} purchase is only available in native builds. ` +
          `For browser testing, please use Web checkout.`
        );
      }

      const initialized = await this.initializeNativeBilling();
      if (!initialized) {
        throw new Error(
          `RevenueCat billing API key is not configured for ${platform === 'google_play' ? 'Google Play' : 'App Store'}. ` +
          `Please configure VITE_REVENUECAT_${platform === 'google_play' ? 'GOOGLE' : 'APPLE'}_API_KEY.`
        );
      }

      let customerInfo: CustomerInfo | null = null;

      // 1. Attempt to fetch current offering packages
      const offerings: PurchasesOfferings = await Purchases.getOfferings();
      const currentOffering = offerings.current;

      let packageToPurchase: PurchasesPackage | undefined;
      if (currentOffering && currentOffering.availablePackages.length > 0) {
        packageToPurchase = currentOffering.availablePackages.find(p =>
          p.product.identifier === planId ||
          p.identifier.toLowerCase().includes(planId.includes('yearly') ? 'annual' : 'monthly')
        ) || currentOffering.availablePackages[0];
      }

      if (packageToPurchase) {
        const result = await Purchases.purchasePackage({ aPackage: packageToPurchase });
        customerInfo = result.customerInfo;
      } else {
        // Fallback: purchase by store product identifier directly
        const { products } = await Purchases.getProducts({ productIdentifiers: [planId] });
        if (!products || products.length === 0) {
          throw new Error(
            `Product "${planId}" not found in ${platform === 'google_play' ? 'Google Play' : 'App Store'} catalog. ` +
            `Ensure products are registered in RevenueCat and the store console.`
          );
        }
        const result = await Purchases.purchaseStoreProduct({ product: products[0] });
        customerInfo = result.customerInfo;
      }

      if (!customerInfo) {
        throw new Error('Purchase did not complete with valid store customer info.');
      }

      const hasActiveEntitlement = Boolean(
        customerInfo.entitlements.active[this.ENTITLEMENT_ID]?.isActive
      );

      if (!hasActiveEntitlement) {
        throw new Error(
          `Purchase was processed, but "${this.ENTITLEMENT_ID}" entitlement was not activated in RevenueCat.`
        );
      }

      // Authoritative synchronization with server/Firestore (NEVER grant Pro locally)
      const authoritativeState = await SubscriptionService.refreshAuthoritativeSubscription();
      onSuccess(authoritativeState);
    } catch (err: any) {
      console.error(`[UniversalPaymentsAdapter] Native ${platform} purchase error:`, err);
      // Check if user simply cancelled the native sheet
      if (err?.code === 1 || err?.userCancelled || (typeof err?.message === 'string' && err.message.includes('cancelled'))) {
        onError(new Error('Purchase was cancelled.'));
        return;
      }
      onError(err instanceof Error ? err : new Error(String(err?.message || err)));
    }
  }

  /**
   * Web: Dodo Payments Checkout Flow (Unchanged)
   */
  private static async purchaseWithDodoWeb(
    planId: string,
    onSuccess: (state: SubscriptionState) => void,
    onError: (err: Error) => void
  ): Promise<void> {
    try {
      const data = await ApiService.createCheckoutSession(planId);
      if (!data.checkoutUrl) {
        throw new Error('Checkout session did not return a valid payment URL.');
      }

      if (data.isSandbox && data.environment !== 'live_mode') {
        // Safe development sandbox fallback: activate simulated Pro subscription only in non-live mode
        SubscriptionService.toggleSubscription(true, 'stripe');
        const nextState = SubscriptionService.getSubscriptionState();
        onSuccess(nextState);
        return;
      }

      // Check for global DodoPayments overlay SDK loaded in index.html
      const DodoPayments = (window as any).DodoPayments;
      if (DodoPayments && DodoPayments.Checkout && typeof DodoPayments.Checkout.open === 'function') {
        DodoPayments.Checkout.open({ checkoutUrl: data.checkoutUrl });
      } else {
        // Fallback: direct navigation to checkout url
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      console.error('[UniversalPaymentsAdapter] Web checkout failed:', err);
      onError(err instanceof Error ? err : new Error(String(err)));
    }
  }
}
