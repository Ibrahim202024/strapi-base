# Contributing to Neop Website Starter

## Conventions

- Strapi field names: `snake_case`
- User-facing text: `i18n: localized: true`
- Public CTs: always add `shared.seo` component
- draftAndPublish: true for content, false for settings

## Module Contribution

To add a new module:

1. **Define the module name** — add it to `ModuleName` in `nuxt/shared/modules.ts`
2. **Create the definition** — `nuxt/shared/module-defs/<name>.ts` with a `ModuleDefinition`
3. **Register** — add to `MODULE_DEFINITIONS` in `nuxt/shared/module-defs/registry.ts`
4. **Add configuration** — entry in `nuxt/neop.config.ts` and `nuxt/shared/module-defs/config.ts`
5. **Implement** — create `app/modules/<name>/pages/`, `components/`, `composables/`
6. **Integrate** — add `sitemapProvider`, `navContribution`, `reservedSegments` as needed
7. **Verify disabled** — build with `enabled: false`, confirm no routes or components leak
8. **Verify enabled** — build with `enabled: true`, confirm routes resolve correctly

### Module guidelines

- A module's pages live under `app/modules/<name>/pages/`.
- A module's components live under `app/modules/<name>/components/`.
- A module must NOT import from other modules.
- A module CAN import from Core (`app/composables/`, `shared/`).
- Core must NOT import from any module.

## Component Conventions

- Use Vue 3 `<script setup lang="ts">` for all components.
- Props use `defineProps<T>()` with TypeScript interfaces.
- Emit events use `defineEmits<T>()`.
- Component names are PascalCase, matching the filename.
- Block components (DZ renderers) live in `app/components/blocks/`.
- Core UI components live in `app/components/`.
- Module components live in `app/modules/<name>/components/`.

## Server Conventions

- Server routes use Nitro's file-based routing under `nuxt/server/api/`.
- API handlers use `defineEventHandler()`.
- Authentication: session cookies are AES-256-GCM encrypted (`server/utils/session.ts`).
- Runtime config: use `useRuntimeConfig()` for environment values, never hardcode.
- Secrets are server-only (never in `runtimeConfig.public`).

## i18n Rules

- Supported locales: `en` (LTR) and `ar` (RTL)
- Never hardcode direction — use `localeDir()` or `useDir()`
- Use CSS logical properties in new components (`margin-inline-start`, `padding-inline-end`, etc.)
- All user-visible text from Strapi must use `locale` query parameter
- Route structure: `/[locale]/[slug]` — locale is always the first segment

## Security Rules

- Browser never talks to Strapi directly
- Content reads: `STRAPI_API_TOKEN` (private, server-only)
- Form submissions: `STRAPI_WRITE_TOKEN` (server-only)
- Webhooks validated with `WEBHOOK_SECRET`
- Preview: encrypted session cookie with `PREVIEW_SECRET`

## Testing

- Unit: `cd nuxt && yarn test`
- E2E: `cd nuxt && yarn test:e2e`
- Add tests for new composables and server routes

## Commits

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`