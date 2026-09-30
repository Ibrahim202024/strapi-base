import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, basename, relative } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import neopConfig from './neop.config';
import type { ModuleName } from './shared/modules';

/**
 * Nuxt reads `.env` before this file is evaluated, so `process.env` is already
 * populated here — no explicit dotenv loading needed.
 */
const PORT = Number(process.env.PORT) || 3001;
const SITE = process.env.WEBSITE_URL || `http://localhost:${PORT}`;

// ─── Module system: build-time discovery ─────────────────────────────────────

const modulesDir = resolve(__dirname, 'app/modules');

/** Directories that exist for enabled modules. */
function moduleSubDir(name: string, sub: string): string | null {
  const dir = resolve(modulesDir, name, sub);
  return existsSync(dir) ? dir : null;
}

/** Enabled module names with their filesystem paths. */
const enabledModules = Object.entries(neopConfig.modules)
  .filter(([_, cfg]) => cfg.enabled)
  .map(([name]) => name as ModuleName);

/** Component directories from enabled modules. */
const moduleComponentDirs = enabledModules
  .map((name) => moduleSubDir(name, 'components'))
  .filter((dir): dir is string => dir !== null)
  .map((dir) => ({ path: dir, pathPrefix: false }));

/** Composable directories from enabled modules. */
const moduleComposableDirs = enabledModules
  .map((name) => moduleSubDir(name, 'composables'))
  .filter((dir): dir is string => dir !== null);

// ─── Nuxt Configuration ─────────────────────────────────────────────────────

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },

  css: ['~/assets/css/global.css'],

  /**
   * Flat component names regardless of folder, so `blocks/Hero.vue` is `<Hero>`
   * rather than `<BlocksHero>` — the subfolders group the files, they are not
   * part of the name.
   *
   * Module component directories are added conditionally based on neop.config.
   */
  components: [
    { path: '~/components', pathPrefix: false },
    ...moduleComponentDirs,
  ],

  /**
   * Auto-import composables from enabled module directories.
   */
  imports: {
    dirs: moduleComposableDirs,
  },

  app: {
    head: {
      // lang is set per-page by useNeopSeo() based on the active locale.
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
        },
      ],
      script: [
        {
          // Marks that scripts are running, before first paint. The scroll
          // reveal styles hang off this class, so with JavaScript disabled the
          // content is simply visible instead of stuck at opacity 0.
          innerHTML: "document.documentElement.classList.add('js-reveal')",
          tagPosition: 'head',
        },
      ],
    },
  },

  /**
   * `STRAPI_URL` is public because the browser needs it too: media lives on
   * Strapi, so every `<img src>` is built from it. The other two never leave
   * the server — `runtimeConfig` (as opposed to `runtimeConfig.public`) is not
   * serialised into the payload.
   */
  runtimeConfig: {
    previewSecret: process.env.PREVIEW_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    /**
     * Read-only Strapi API token — PRIVATE (server-only).
     * Never serialised into the client bundle.
     * Generate in Strapi Admin → Settings → API Tokens (type: Read-only).
     */
    strapiApiToken: process.env.STRAPI_API_TOKEN,
    /**
     * Shared secret for validating incoming Strapi webhook requests.
     * Set the same value in Strapi Admin → Settings → Webhooks.
     */
    webhookSecret: process.env.WEBHOOK_SECRET,
    strapiWriteToken: process.env.STRAPI_WRITE_TOKEN,
    public: {
      strapiUrl: process.env.STRAPI_URL || 'http://localhost:1337',
      siteUrl: SITE,
    },
  },

  /**
   * Hybrid rendering, the same shape as the Astro port.
   *
   * The public site is prerendered at build time; `/preview/**` and the API
   * routes are rendered per request. That split is what draft mode needs —
   * "what does this look like right now" cannot be answered by a page that was
   * built an hour ago.
   *
   * Routes are discovered by crawling from the two locale roots rather than
   * listed here: articles and CMS pages all come from Strapi, so any
   * hardcoded list would go stale the moment an editor adds an entry. The
   * navbar and index pages link to everything, so the crawler reaches it all.
   */
  routeRules: {
    '/': { redirect: '/en' },
    '/api/**': { prerender: false },
    '/preview/**': { prerender: false, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } },
    '/sitemap.xml': { prerender: false },
    '/robots.txt': { prerender: false },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/en', '/ar'],
      // A single unreachable entry should not fail the whole build; the route
      // falls back to being rendered on demand.
      failOnError: false,
    },
  },

  devServer: { port: PORT },


  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    typeCheck: false,
    strict: true,
  },

  // ─── Module page registration ──────────────────────────────────────────────
  hooks: {
    'pages:extend'(pages) {
      /**
       * Register module pages under the [locale] route.
       *
       * For each enabled module that has a `pages/` directory, scan it and
       * add routes as children of the [locale] dynamic segment. This mirrors
       * what Nuxt would do if the files were in `app/pages/[locale]/`.
       *
       * The [locale] parent must already exist (created by core pages).
       */
      const localeRoute = pages.find(
        (p) => p.path === '/:locale' || p.name === 'locale',
      );

      // Find or infer the [locale] parent route.
      let localeParent = localeRoute;
      if (!localeParent) {
        // Nuxt may structure it differently — look for routes with :locale param.
        localeParent = pages.find((p) => p.path.includes(':locale'));
      }

      for (const moduleName of enabledModules) {
        const pagesDir = moduleSubDir(moduleName, 'pages');
        if (!pagesDir) continue;

        const cfg = neopConfig.modules[moduleName];
        const routePrefix = cfg.route.replace(/^\//, ''); // e.g. 'blog', 'sign-in'

        // Scan module pages directory for .vue files
        const pageFiles = scanDir(pagesDir);

        for (const file of pageFiles) {
          const relPath = relative(pagesDir, file).replace(/\\/g, '/');
          const routePath = fileToRoutePath(relPath, routePrefix);
          const routeName = `locale-${routePrefix}-${relPath.replace(/\.vue$/, '').replace(/[\\/\[\]]/g, '-')}`;

          const route = {
            path: routePath,
            file,
            name: routeName.replace(/--+/g, '-').replace(/-$/, ''),
          };

          if (localeParent?.children) {
            localeParent.children.push(route);
          } else {
            // Fallback: add as top-level route with full path
            pages.push({
              ...route,
              path: `/:locale${routePath.startsWith('/') ? '' : '/'}${routePath}`,
            });
          }
        }
      }
    },
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Recursively scan a directory for .vue files. */
function scanDir(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = resolve(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...scanDir(full));
    } else if (entry.endsWith('.vue')) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Convert a file path relative to the module's pages/ dir into a route path.
 *
 * Examples:
 *   - `index.vue` with prefix `blog`     → `blog`
 *   - `[slug].vue` with prefix `blog`    → `blog/:slug`
 *   - `sign-in.vue` with prefix `sign-in` → `sign-in`
 */
function fileToRoutePath(relPath: string, prefix: string): string {
  // Remove .vue extension
  let route = relPath.replace(/\.vue$/, '');

  // Convert [param] to :param
  route = route.replace(/\[([^\]]+)\]/g, ':$1');

  // Handle index files
  if (route === 'index') {
    return prefix;
  }

  // For non-index files, check if the filename matches the prefix
  // (e.g. sign-in.vue with prefix sign-in → just 'sign-in')
  if (route === prefix) {
    return prefix;
  }

  return `${prefix}/${route}`;
}
