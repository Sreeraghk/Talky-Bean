import { 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithCredential, 
  OAuthProvider, 
  Auth 
} from 'firebase/auth';
import { platformService } from './PlatformService';

export interface NativeAuthResult {
  user: User;
  provider: 'google' | 'apple' | 'email';
}

/**
 * Universal Authentication Adapter
 * Routes auth requests gracefully between:
 *  - Web: standard Firebase signInWithPopup (or redirect)
 *  - Native Android: Native Google Sign-In SDK -> GoogleAuthProvider.credential -> signInWithCredential
 *  - Native iOS: Native Apple Sign In / Google Sign-In -> OAuthProvider.credential -> signInWithCredential
 */
export class UniversalAuthAdapter {
  /**
   * Universal Google Sign-In
   */
  static async signInWithGoogle(auth: Auth): Promise<User> {
    if (platformService.isNative()) {
      // On Native Android / iOS, window.open / signInWithPopup fails or gets blocked by OAuth policy
      // Check for available Capacitor Google Auth plugin or fallback to deep-link flow
      const globalWindow = window as any;
      if (globalWindow.GoogleAuth && typeof globalWindow.GoogleAuth.signIn === 'function') {
        const googleUser = await globalWindow.GoogleAuth.signIn();
        const idToken = googleUser.authentication?.idToken || googleUser.idToken;
        if (!idToken) {
          throw new Error('Google Sign-In returned empty ID token.');
        }
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        return result.user;
      }

      // If native plugin is not yet registered, provide human-readable actionable instruction
      throw new Error(
        'Native Google Sign-In requires the native GoogleAuth Capacitor plugin on mobile. Please use email/password sign-in or enable Google Sign-In plugin.'
      );
    }

    // Web Browser execution: standard popup
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  /**
   * Generates a 256-bit cryptographically random nonce and its SHA-256 hex digest
   * for Sign in with Apple OIDC replay protection.
   */
  private static async createAppleAuthNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
    const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
    if (!cryptoObj || typeof cryptoObj.getRandomValues !== 'function' || !cryptoObj.subtle) {
      throw new Error('Web Crypto API is required for secure Sign in with Apple nonce generation.');
    }
    const bytes = new Uint8Array(32);
    cryptoObj.getRandomValues(bytes);
    const rawNonce = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    const digestBuffer = await cryptoObj.subtle.digest('SHA-256', new TextEncoder().encode(rawNonce));
    const hashedNonce = Array.from(new Uint8Array(digestBuffer), (b) => b.toString(16).padStart(2, '0')).join('');
    return { rawNonce, hashedNonce };
  }

  /**
   * Universal Sign in with Apple (Mandatory for App Store review if 3P social logins are offered)
   */
  static async signInWithApple(auth: Auth): Promise<User> {
    if (platformService.isIOS() || platformService.isNative()) {
      const globalWindow = window as any;
      if (globalWindow.SignInWithApple && typeof globalWindow.SignInWithApple.authorize === 'function') {
        const { rawNonce, hashedNonce } = await this.createAppleAuthNonce();
        const appleRes = await globalWindow.SignInWithApple.authorize({
          scopes: 'email name',
          nonce: hashedNonce
        });
        const idToken = appleRes?.response?.identityToken;
        if (!idToken || typeof idToken !== 'string') {
          throw new Error('Sign in with Apple returned an empty identity token.');
        }
        const provider = new OAuthProvider('apple.com');
        // Pass the original unhashed rawNonce so Firebase verifies SHA-256(rawNonce) === token.nonce
        const credential = provider.credential({
          idToken,
          rawNonce
        });
        const result = await signInWithCredential(auth, credential);
        return result.user;
      }

      throw new Error(
        'Sign in with Apple requires the native SignInWithApple plugin on iOS devices.'
      );
    }

    // Web execution
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    const result = await signInWithPopup(auth, provider);
    return result.user;
  }

  /**
   * Checks whether Google Sign-In is functional in the current environment.
   * On Web: Fully supported via Firebase signInWithPopup.
   * On Native Mobile: Only supported if the native GoogleAuth Capacitor plugin is initialized.
   */
  static isGoogleSignInAvailable(): boolean {
    if (!platformService.isNative()) return true;
    const globalWindow = window as any;
    return Boolean(globalWindow.GoogleAuth && typeof globalWindow.GoogleAuth.signIn === 'function');
  }

  /**
   * Checks whether Sign in with Apple is functional in the current environment.
   * On Web: Supported on Apple devices/browsers.
   * On Native Mobile: Only supported if the native SignInWithApple Capacitor plugin is initialized.
   */
  static isAppleSignInAvailable(): boolean {
    if (platformService.isNative()) {
      const globalWindow = window as any;
      return Boolean(globalWindow.SignInWithApple && typeof globalWindow.SignInWithApple.authorize === 'function');
    }
    return typeof navigator !== 'undefined' && /Macintosh|iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  /**
   * Checks if Apple Sign In should be shown to the user
   */
  static isAppleSignInSupported(): boolean {
    return this.isAppleSignInAvailable();
  }
}
