import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  DEFAULT_LOCALE,
  isRtl,
  localeDir,
  isLocale,
  intlTag,
  formatDate,
  localizedPaths,
} from '../../shared/lib/i18n';

describe('i18n utilities', () => {
  describe('LOCALES', () => {
    it('contains en and ar', () => {
      expect(LOCALES).toContain('en');
      expect(LOCALES).toContain('ar');
    });

    it('has exactly 2 locales', () => {
      expect(LOCALES).toHaveLength(2);
    });
  });

  describe('DEFAULT_LOCALE', () => {
    it('is en', () => {
      expect(DEFAULT_LOCALE).toBe('en');
    });
  });

  describe('isRtl', () => {
    it('returns true for ar', () => {
      expect(isRtl('ar')).toBe(true);
    });

    it('returns false for en', () => {
      expect(isRtl('en')).toBe(false);
    });

    it('returns false for unknown locale', () => {
      expect(isRtl('fr')).toBe(false);
    });
  });

  describe('localeDir', () => {
    it('returns rtl for ar', () => {
      expect(localeDir('ar')).toBe('rtl');
    });

    it('returns ltr for en', () => {
      expect(localeDir('en')).toBe('ltr');
    });

    it('returns ltr for unknown locale', () => {
      expect(localeDir('de')).toBe('ltr');
    });
  });

  describe('isLocale', () => {
    it('returns true for valid locales', () => {
      expect(isLocale('en')).toBe(true);
      expect(isLocale('ar')).toBe(true);
    });

    it('returns false for invalid locales', () => {
      expect(isLocale('fr')).toBe(false);
      expect(isLocale('')).toBe(false);
      expect(isLocale(undefined)).toBe(false);
    });
  });

  describe('intlTag', () => {
    it('returns ar-SA for ar', () => {
      expect(intlTag('ar')).toBe('ar-SA');
    });

    it('returns en-US for en', () => {
      expect(intlTag('en')).toBe('en-US');
    });

    it('returns en-US for unknown locale', () => {
      expect(intlTag('fr')).toBe('en-US');
    });
  });

  describe('formatDate', () => {
    it('formats a date in English', () => {
      const result = formatDate('2024-06-15', 'en');
      expect(result).toBeTruthy();
      expect(result).toContain('2024');
    });

    it('formats a date in Arabic', () => {
      const result = formatDate('2024-06-15', 'ar');
      expect(result).toBeTruthy();
    });

    it('returns null for null input', () => {
      expect(formatDate(null, 'en')).toBeNull();
    });

    it('returns null for undefined input', () => {
      expect(formatDate(undefined, 'en')).toBeNull();
    });

    it('returns null for invalid date', () => {
      expect(formatDate('not-a-date', 'en')).toBeNull();
    });
  });

  describe('localizedPaths', () => {
    it('builds paths from localizations', () => {
      const result = localizedPaths('en', 'about', [
        { locale: 'ar', slug: 'حول' },
      ]);
      expect(result).toEqual({
        en: 'about',
        ar: 'حول',
      });
    });

    it('includes current locale slug', () => {
      const result = localizedPaths('en', 'about', []);
      expect(result).toEqual({ en: 'about' });
    });

    it('adds prefix when provided', () => {
      const result = localizedPaths(
        'en',
        'my-post',
        [{ locale: 'ar', slug: 'مقالتي' }],
        'blog',
      );
      expect(result).toEqual({
        en: 'blog/my-post',
        ar: 'blog/مقالتي',
      });
    });

    it('handles undefined localizations', () => {
      const result = localizedPaths('en', 'home', undefined);
      expect(result).toEqual({ en: 'home' });
    });

    it('handles empty prefix', () => {
      const result = localizedPaths('en', 'contact', [], '');
      expect(result).toEqual({ en: 'contact' });
    });
  });
});