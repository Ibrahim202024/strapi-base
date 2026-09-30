/**
 * Shared module configuration accessor.
 *
 * This file exposes `neop.config.ts` values through `shared/` so both
 * client-side app code and server-side Nitro code can read them.
 *
 * Nitro (server) cannot resolve relative imports to the Nuxt project root
 * (`../../../neop.config`), but it CAN import from `#shared/`. This file
 * bridges that gap.
 */
import type { ModuleConfig, ModuleName, NeopConfig } from '../modules';

/**
 * Inline module configuration.
 *
 * This mirrors `neop.config.ts` and is the server-accessible source of truth.
 * When you change `neop.config.ts`, update this to match.
 *
 * TODO: In a future iteration, generate this file automatically from
 * `neop.config.ts` at build time to avoid duplication.
 */
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

/** Returns only the enabled module configs. */
export function getEnabledModuleConfigs(): Array<{
  name: ModuleName;
  config: ModuleConfig;
}> {
  return Object.entries(config.modules)
    .filter(([_, cfg]) => cfg.enabled)
    .map(([name, cfg]) => ({ name: name as ModuleName, config: cfg }));
}

/** Full config access. */
export function getModuleConfig(): NeopConfig {
  return config;
}

/** Check if a specific module is enabled. */
export function isModuleEnabled(name: ModuleName): boolean {
  return config.modules[name]?.enabled === true;
}
