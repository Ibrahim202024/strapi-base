/**
 * Neop Module Configuration
 *
 * Build-time configuration that controls which modules are active.
 * This file is the single source of truth for module enablement.
 *
 * ⚠ DO NOT place secrets, API tokens, or environment-specific values here.
 * Those belong in `.env` / Nuxt `runtimeConfig`.
 *
 * After changing this file, restart the dev server or rebuild.
 */
import type { NeopConfig } from './shared/modules';

const config: NeopConfig = {
  modules: {
    blog: {
      enabled: true,
      route: '/blog',
      sitemap: true,
    },

    auth: {
      enabled: true,
      route: '/sign-in',
      sitemap: false,
    },

    // ─── Future modules (disabled by default) ─────────────────────────────
    services: {
      enabled: false,
      route: '/services',
      sitemap: true,
    },

    portfolio: {
      enabled: false,
      route: '/portfolio',
      sitemap: true,
    },

    team: {
      enabled: false,
      route: '/team',
      sitemap: true,
    },

    careers: {
      enabled: false,
      route: '/careers',
      sitemap: true,
    },

    shop: {
      enabled: false,
      route: '/shop',
      sitemap: true,
    },
  },
};

export default config;
