import { describe, it, expect } from 'vitest';
import {
  stripStegaMarkers,
  strapiMedia,
  normalizeStrapiMediaUrl,
  isVideo,
  isAudio,
} from '../../shared/lib/media';

const STRAPI_URL = 'http://localhost:1337';

describe('media utilities', () => {
  describe('stripStegaMarkers', () => {
    it('removes zero-width characters', () => {
      expect(stripStegaMarkers('hello\u200Bworld')).toBe('helloworld');
      expect(stripStegaMarkers('test\u200C\u200D\u2060\uFEFF')).toBe('test');
    });

    it('returns clean string unchanged', () => {
      expect(stripStegaMarkers('/uploads/image.png')).toBe('/uploads/image.png');
    });

    it('handles empty string', () => {
      expect(stripStegaMarkers('')).toBe('');
    });
  });

  describe('strapiMedia', () => {
    it('returns null for null url', () => {
      expect(strapiMedia(null, STRAPI_URL)).toBeNull();
    });

    it('returns null for undefined url', () => {
      expect(strapiMedia(undefined, STRAPI_URL)).toBeNull();
    });

    it('prepends Strapi URL for relative paths', () => {
      expect(strapiMedia('/uploads/image.png', STRAPI_URL)).toBe(
        'http://localhost:1337/uploads/image.png',
      );
    });

    it('returns absolute URLs unchanged', () => {
      expect(strapiMedia('https://cdn.example.com/image.png', STRAPI_URL)).toBe(
        'https://cdn.example.com/image.png',
      );
    });

    it('returns protocol-relative URLs unchanged', () => {
      expect(strapiMedia('//cdn.example.com/image.png', STRAPI_URL)).toBe(
        '//cdn.example.com/image.png',
      );
    });

    it('returns data URLs unchanged', () => {
      const dataUrl = 'data:image/png;base64,iVBOR...';
      expect(strapiMedia(dataUrl, STRAPI_URL)).toBe(dataUrl);
    });

    it('strips stega markers from URLs', () => {
      expect(strapiMedia('/uploads/\u200Bimage.png', STRAPI_URL)).toBe(
        'http://localhost:1337/uploads/image.png',
      );
    });
  });

  describe('normalizeStrapiMediaUrl', () => {
    it('prepends base URL for /uploads/ paths', () => {
      expect(normalizeStrapiMediaUrl('/uploads/image.png', STRAPI_URL)).toBe(
        'http://localhost:1337/uploads/image.png',
      );
    });

    it('extracts pathname from full Strapi URLs', () => {
      expect(
        normalizeStrapiMediaUrl(
          'http://old-host:1337/uploads/image.png',
          STRAPI_URL,
        ),
      ).toBe('http://localhost:1337/uploads/image.png');
    });

    it('returns non-upload paths unchanged', () => {
      expect(normalizeStrapiMediaUrl('https://cdn.example.com/img.png', STRAPI_URL)).toBe(
        'https://cdn.example.com/img.png',
      );
    });

    it('strips stega markers', () => {
      expect(normalizeStrapiMediaUrl('/uploads/\u200Bimg.png', STRAPI_URL)).toBe(
        'http://localhost:1337/uploads/img.png',
      );
    });
  });

  describe('isVideo', () => {
    it('returns true for video MIME types', () => {
      expect(isVideo('video/mp4')).toBe(true);
      expect(isVideo('video/webm')).toBe(true);
    });

    it('returns false for image MIME types', () => {
      expect(isVideo('image/png')).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(isVideo(null)).toBe(false);
      expect(isVideo(undefined)).toBe(false);
    });
  });

  describe('isAudio', () => {
    it('returns true for audio MIME types', () => {
      expect(isAudio('audio/mpeg')).toBe(true);
      expect(isAudio('audio/wav')).toBe(true);
    });

    it('returns false for video MIME types', () => {
      expect(isAudio('video/mp4')).toBe(false);
    });

    it('returns false for null/undefined', () => {
      expect(isAudio(null)).toBe(false);
      expect(isAudio(undefined)).toBe(false);
    });
  });
});
