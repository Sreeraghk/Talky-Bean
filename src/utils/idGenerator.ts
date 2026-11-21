/**
 * Cryptographically strong client-side ID generator backed by Web Crypto API.
 * Uses crypto.randomUUID() when available and falls back to 128-bit crypto.getRandomValues().
 */
export function generateSecureId(): string {
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return cryptoObj.randomUUID();
  }
  if (cryptoObj && typeof cryptoObj.getRandomValues === 'function') {
    const bytes = new Uint8Array(16);
    cryptoObj.getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  throw new Error('Cryptographically secure random generator is unavailable in this runtime.');
}
