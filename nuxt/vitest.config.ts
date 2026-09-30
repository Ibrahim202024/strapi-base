import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

/**
 * Vitest config for unit tests.
 *
 * Uses the default 'node' environment for pure utility/lib tests. The Nuxt
 * environment (`@nuxt/test-utils`) is only needed for tests that require Vue
 * composables, auto-imports, or SSR rendering — those should use per-file
 * environment overrides: `// @vitest-environment nuxt`
 *
 * Path aliases mirror those from nuxt.config.ts so shared/ imports resolve.
 */
export default defineConfig({
  resolve: {
    alias: {
      '#shared': resolve(__dirname, 'shared'),
    },
  },
  test: {
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.output/**', '**/.nuxt/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['app/**', 'server/**', 'shared/**'],
    },
  },
});