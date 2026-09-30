import { describe, it, expect } from 'vitest';
import { blogModule } from '../../shared/module-defs/blog';
import { MODULE_DEFINITIONS } from '../../shared/module-defs/registry';
import neopConfig from '../../neop.config';

describe('Module System', () => {
  describe('NeopConfig', () => {
    it('has all required module entries', () => {
      expect(neopConfig.modules).toHaveProperty('blog');
      expect(neopConfig.modules).toHaveProperty('auth');
      expect(neopConfig.modules).toHaveProperty('shop');
      expect(neopConfig.modules).toHaveProperty('services');
      expect(neopConfig.modules).toHaveProperty('portfolio');
      expect(neopConfig.modules).toHaveProperty('team');
      expect(neopConfig.modules).toHaveProperty('careers');
    });

    it('each module has required config fields', () => {
      for (const [, cfg] of Object.entries(neopConfig.modules)) {
        expect(cfg).toHaveProperty('enabled');
        expect(cfg).toHaveProperty('route');
        expect(typeof cfg.enabled).toBe('boolean');
        expect(typeof cfg.route).toBe('string');
        expect(cfg.route.startsWith('/')).toBe(true);
      }
    });
  });

  describe('MODULE_DEFINITIONS', () => {
    it('has a definition for blog', () => {
      expect(MODULE_DEFINITIONS.blog).toBeDefined();
      expect(MODULE_DEFINITIONS.blog.name).toBe('blog');
    });

    it('has a definition for auth', () => {
      expect(MODULE_DEFINITIONS.auth).toBeDefined();
      expect(MODULE_DEFINITIONS.auth.name).toBe('auth');
    });

    it('has a definition for shop', () => {
      expect(MODULE_DEFINITIONS.shop).toBeDefined();
      expect(MODULE_DEFINITIONS.shop.name).toBe('shop');
    });

    it('all definitions have reservedSegments', () => {
      for (const [, def] of Object.entries(MODULE_DEFINITIONS)) {
        expect(Array.isArray(def.reservedSegments)).toBe(true);
        expect(def.reservedSegments.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Blog Module Definition', () => {
    it('has name "blog"', () => {
      expect(blogModule.name).toBe('blog');
    });

    it('reserves the "blog" segment', () => {
      expect(blogModule.reservedSegments).toContain('blog');
    });

    describe('matchRoute', () => {
      it('matches /[locale]/blog/[slug]', () => {
        const result = blogModule.matchRoute?.(['en', 'blog', 'my-post']);
        expect(result).toEqual({
          kind: 'article',
          slug: 'my-post',
          prefix: 'blog',
        });
      });

      it('does not match /[locale]/blog (index)', () => {
        const result = blogModule.matchRoute?.(['en', 'blog']);
        expect(result).toBeNull();
      });

      it('does not match /[locale]/other', () => {
        const result = blogModule.matchRoute?.(['en', 'about']);
        expect(result).toBeNull();
      });
    });

    it('has a contentFetcher', () => {
      expect(blogModule.contentFetcher).toBeDefined();
      expect(blogModule.contentFetcher?.collection).toBe('articles');
      expect(blogModule.contentFetcher?.pathPrefix).toBe('blog');
    });

    it('has a sitemapProvider', () => {
      expect(blogModule.sitemapProvider).toBeDefined();
      expect(typeof blogModule.sitemapProvider).toBe('function');
    });
  });
});
