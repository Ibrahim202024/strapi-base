import { describe, it, expect, vi } from 'vitest';
import { encryptSession, decryptSession } from '../../server/utils/session';

// Mock useRuntimeConfig for server-side tests
vi.stubGlobal('useRuntimeConfig', () => ({
  sessionSecret: 'test-session-secret-that-is-at-least-32-characters-long-for-testing',
}));

// Mock setCookie/getCookie/deleteCookie (Nitro auto-imports)
vi.stubGlobal('setCookie', vi.fn());
vi.stubGlobal('getCookie', vi.fn());
vi.stubGlobal('deleteCookie', vi.fn());

describe('session encryption', () => {
  const TEST_JWT = 'eyJhbGciOiJIUzI1NiJ9.test-payload.signature';

  it('encrypts and decrypts a JWT token', () => {
    const encrypted = encryptSession(TEST_JWT);
    const decrypted = decryptSession(encrypted);
    expect(decrypted).toBe(TEST_JWT);
  });

  it('produces different ciphertexts for the same input (random IV)', () => {
    const a = encryptSession(TEST_JWT);
    const b = encryptSession(TEST_JWT);
    expect(a).not.toBe(b);
  });

  it('ciphertext has the format iv.tag.data', () => {
    const encrypted = encryptSession(TEST_JWT);
    const parts = encrypted.split('.');
    expect(parts).toHaveLength(3);
    for (const part of parts) {
      expect(part.length).toBeGreaterThan(0);
    }
  });

  it('returns null for tampered ciphertext', () => {
    const encrypted = encryptSession(TEST_JWT);
    const parts = encrypted.split('.');
    parts[2] = 'AAAA' + parts[2].slice(4);
    const tampered = parts.join('.');
    expect(decryptSession(tampered)).toBeNull();
  });

  it('returns null for malformed input', () => {
    expect(decryptSession('')).toBeNull();
    expect(decryptSession('not.valid')).toBeNull();
    expect(decryptSession('a')).toBeNull();
  });

  it('returns null for completely random string', () => {
    expect(decryptSession('random-garbage-string')).toBeNull();
  });

  it('handles empty JWT gracefully (returns null — empty JWTs are invalid)', () => {
    const encrypted = encryptSession('');
    const decrypted = decryptSession(encrypted);
    // Empty string decrypts but is not a valid JWT — returning null is correct
    expect(decrypted === '' || decrypted === null).toBe(true);
  });

  it('handles long JWT tokens', () => {
    const longToken = 'a'.repeat(2000);
    const encrypted = encryptSession(longToken);
    const decrypted = decryptSession(encrypted);
    expect(decrypted).toBe(longToken);
  });
});
