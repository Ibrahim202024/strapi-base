/**
 * Shop Module Definition (Stub)
 *
 * Reserves the `/shop` route for future E-commerce. The sitemap provider and
 * route matcher are placeholders — they will be implemented when the shop
 * module is built.
 *
 * This stub exists to validate that the module system can register, enable,
 * and disable a future module without touching Core.
 */
import type { ModuleDefinition } from '../modules';

export const shopModule: ModuleDefinition = {
  name: 'shop',

  reservedSegments: ['shop'],

  matchRoute(segments: string[]) {
    if (segments[1] === 'shop' && segments[2]) {
      return { kind: 'product', slug: segments[2], prefix: 'shop' };
    }
    return null;
  },

  contentFetcher: {
    collection: 'products',
    pathPrefix: 'shop',
  },

  // Sitemap provider will be implemented when product content type exists.
  sitemapProvider: undefined,
};
