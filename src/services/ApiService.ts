import { CloudStatsService } from './CloudStatsService';
import { platformService } from './PlatformService';

/**
 * Canonical endpoints across Talky Bean
 */
export const API_ENDPOINTS = {
  AI_GENERATE_CONTENT: '/api/ai/generateContent',
  AI_GENERATE_CONTENT_STREAM: '/api/ai/generateContentStream',
  PAYMENTS_DODO_CHECKOUT: '/api/payments/dodo/checkout',
  PAYMENTS_DODO_WEBHOOK: '/api/payments/dodo/webhook',
  PAYMENTS_SUBSCRIPTION_STATUS: '/api/payments/subscription-status',
  PAYMENTS_COMPLIANCE_REPORT: '/api/payments/compliance-report',
  HEALTH: '/api/health',
} as const;

export type ApiEndpointKey = keyof typeof API_ENDPOINTS;

/**
 * Centralized API service & configuration
 * Supports seamless execution across:
 *  - Local Vite development (same-origin relative URLs)
 *  - Web production deployments (custom domain / Cloud Run)
 *  - Native mobile apps via Capacitor (resolves to authoritative backend host)
 */
export class ApiService {
  private static defaultProductionHost = 'https://talkybean.com';

  /**
   * Resolves the base URL depending on platform and environment configuration
   */
  static getBaseUrl(): string {
    const configuredBase = (typeof import.meta !== 'undefined' && (import.meta as any).env) 
      ? (import.meta as any).env.VITE_API_BASE_URL 
      : (typeof process !== 'undefined' ? process.env?.VITE_API_BASE_URL : undefined);
    if (configuredBase && typeof configuredBase === 'string' && configuredBase.trim().length > 0) {
      return configuredBase.trim().replace(/\/+$/, '');
    }

    // In native Capacitor (Android / iOS), relative requests to /api fail because
    // the webview runs under capacitor:// or https://localhost.
    // Native apps must target the remote production backend API.
    if (platformService.isNative()) {
      return this.defaultProductionHost;
    }

    // In web browser (dev server, preview, and production web),
    // relative paths keep requests on the current origin with zero CORS friction.
    return '';
  }

  /**
   * Formats a complete endpoint URL
   */
  static getEndpointUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    const base = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return base ? `${base}${cleanEndpoint}` : cleanEndpoint;
  }

  /**
   * Assembles standard HTTP headers including verified Firebase ID token when signed in
   */
  static async getAuthHeaders(customHeaders: Record<string, string> = {}, forceRefresh = false): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    try {
      const idToken = await CloudStatsService.getIdToken(forceRefresh);
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
      }
    } catch (e) {
      // Proceed without token if user is unauthenticated guest
    }

    return headers;
  }

  /**
   * Centralized authenticated fetch wrapper
   */
  static async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = this.getEndpointUrl(endpoint);
    const existingHeaders = (options.headers as Record<string, string>) || {};
    const headers = await this.getAuthHeaders(existingHeaders);

    return fetch(url, {
      ...options,
      headers
    });
  }

  /**
   * Initializes a Dodo Payments checkout session through the secure server endpoint
   */
  static async createCheckoutSession(planId: string): Promise<{
    checkoutUrl?: string;
    subscriptionId?: string;
    isSandbox?: boolean;
    environment?: string;
    metadata?: any;
  }> {
    const response = await this.fetch(API_ENDPOINTS.PAYMENTS_DODO_CHECKOUT, {
      method: 'POST',
      body: JSON.stringify({ planId })
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Payment session error (HTTP ${response.status})`);
    }

    return response.json();
  }

  /**
   * Queries the server for verified subscription status
   */
  static async getSubscriptionStatus(): Promise<{
    userId: string;
    isPro: boolean;
    entitlement: string;
    statutoryCompliance?: any;
    auditLogs?: any[];
  }> {
    const response = await this.fetch(API_ENDPOINTS.PAYMENTS_SUBSCRIPTION_STATUS, {
      method: 'GET'
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Subscription check error (HTTP ${response.status})`);
    }

    return response.json();
  }
}
