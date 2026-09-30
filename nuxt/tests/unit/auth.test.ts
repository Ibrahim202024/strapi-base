import { describe, it, expect } from 'vitest';
import { validateCredentials } from '../../shared/lib/auth';

describe('auth utilities', () => {
  describe('validateCredentials', () => {
    it('accepts valid login credentials', () => {
      expect(
        validateCredentials({
          email: 'user@example.com',
          password: 'secret123',
        }),
      ).toBeNull();
    });

    it('accepts valid registration credentials', () => {
      expect(
        validateCredentials({
          email: 'user@example.com',
          password: 'secret123',
          username: 'johndoe',
          requireUsername: true,
        }),
      ).toBeNull();
    });

    it('rejects missing email', () => {
      const result = validateCredentials({ password: 'secret123' });
      expect(result).toBeTruthy();
      expect(result).toContain('email');
    });

    it('rejects invalid email format', () => {
      expect(
        validateCredentials({ email: 'not-an-email', password: 'secret123' }),
      ).toContain('email');
    });

    it('rejects empty email', () => {
      expect(
        validateCredentials({ email: '', password: 'secret123' }),
      ).toContain('email');
    });

    it('rejects short password', () => {
      const result = validateCredentials({
        email: 'user@example.com',
        password: '12345',
      });
      expect(result).toContain('6 characters');
    });

    it('rejects missing password', () => {
      const result = validateCredentials({ email: 'user@example.com' });
      expect(result).toBeTruthy();
    });

    it('rejects short username when required', () => {
      const result = validateCredentials({
        email: 'user@example.com',
        password: 'secret123',
        username: 'ab',
        requireUsername: true,
      });
      expect(result).toContain('Username');
    });

    it('rejects missing username when required', () => {
      const result = validateCredentials({
        email: 'user@example.com',
        password: 'secret123',
        requireUsername: true,
      });
      expect(result).toContain('Username');
    });

    it('ignores username when not required', () => {
      expect(
        validateCredentials({
          email: 'user@example.com',
          password: 'secret123',
          requireUsername: false,
        }),
      ).toBeNull();
    });

    it('handles non-string email', () => {
      expect(
        validateCredentials({ email: 42, password: 'secret123' }),
      ).toContain('email');
    });

    it('handles non-string password', () => {
      expect(
        validateCredentials({ email: 'user@example.com', password: 123456 }),
      ).toBeTruthy();
    });
  });
});
