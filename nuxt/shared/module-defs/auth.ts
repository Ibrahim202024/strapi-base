/**
 * Auth Module Definition
 *
 * Describes the auth module: sign-in/sign-up route ownership and Navbar
 * contribution. No sitemap provider — auth pages are not indexed.
 */
import type { ModuleDefinition } from '../modules';

export const authModule: ModuleDefinition = {
  name: 'auth',

  reservedSegments: ['sign-in', 'sign-up'],

  // Auth pages have identical paths in all locales — no locale resolution needed.
  matchRoute: undefined,
  contentFetcher: undefined,
  sitemapProvider: undefined,

  navContribution: {
    component: 'AuthMenu',
    position: 'right',
  },
};
