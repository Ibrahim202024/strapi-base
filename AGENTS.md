# AGENTS.md

Guidance for LLM agents working in this repository.

## Repo Overview

Neop Website Starter is a Strapi 5 + Nuxt 4 bilingual (Arabic + English) website starter with a config-driven module system.

- `strapi/`: Strapi 5 backend, content types, components, seeded demo data, SQLite default database.
- `nuxt/`: Nuxt 4 frontend, localized `en` and `ar` routes, draft preview, module system, and authentication.
- Root: setup/dev/format scripts using Yarn 4.5.0. Each directory keeps its own lockfile; this is not a Yarn workspace.

## First Read

Before editing, read:

- `README.md`
- `package.json`
- `nuxt/package.json`
- `strapi/package.json`
- `nuxt/neop.config.ts` — module configuration
- `nuxt/shared/modules.ts` — module type system
- Relevant files under `nuxt/app`, `nuxt/shared`, or `strapi/src`.

## Commands

Run commands from the correct directory.

- Root setup: `yarn setup` (installs Strapi and Nuxt, creates `.env` files)
- Root dev: `yarn dev` (Strapi + Nuxt)
- Check environment consistency: `yarn check:env`
- Seed Strapi: `yarn seed`
- Format check: `yarn check:format`
- Format fix: `yarn fix:format`
- Strapi dev: `cd strapi && yarn develop`
- Strapi build: `cd strapi && yarn build`
- Nuxt directly: `cd nuxt && yarn dev`
- Nuxt build: `cd nuxt && yarn build`

## Setup

Run once after cloning, from the repo root:

```sh
yarn install          # install root deps first
yarn setup            # installs strapi/ and nuxt/, creates .env files
yarn seed             # imports demo data into SQLite (191 entities, 115 assets)
```

`yarn setup` installs each directory in turn, creates any missing `.env` from its `.env.example`, and propagates `PREVIEW_SECRET` from `strapi/.env` to `nuxt/.env`. It is safe to re-run: existing `.env` files are left alone and an already-configured preview secret is preserved.

`yarn seed` is destructive — it wipes existing data before importing. Re-run it to reset to the demo baseline.

After setup, verify both apps are healthy:

```sh
cd strapi && yarn build
cd nuxt && yarn build
```

First `yarn develop` in `strapi/` will prompt to create a Super Admin at `http://localhost:1337/admin`; the seed does not include admin credentials.

## Environment

Create local env files before running the apps:

- `cp ./strapi/.env.example ./strapi/.env`
- `cp ./nuxt/.env.example ./nuxt/.env`

`yarn setup` does this automatically. Do not commit real secrets. Keep demo placeholders only. Set a matching `PREVIEW_SECRET` in both `strapi/.env` and `nuxt/.env` for draft/preview mode to work.

## Module System

The project uses a config-driven module system. Module configuration lives in `nuxt/neop.config.ts`.

- **Core** (`app/pages/`, `app/components/`, `app/composables/`) knows that modules exist but never imports from individual modules.
- **Modules** (`app/modules/<name>/`) contain their own pages, components, and composables.
- Module definitions live in `shared/module-defs/`.
- Routes are registered at build time via `pages:extend` in `nuxt.config.ts`.
- Disabled modules are not bundled, their routes are not registered, and their components are not auto-imported.

When modifying a module, only touch files inside `app/modules/<name>/` and `shared/module-defs/<name>.ts`. When modifying Core, verify that no module-specific logic is introduced.

## Coding Style

- Prefer small, direct changes over broad refactors.
- Prefer `type` over `interface` unless extending existing interfaces or matching local code.
- Prefer `unknown` over `any`; tighten existing broad types incrementally.
- Use explicit comparisons:
  - Prefer `value === undefined`, `value === null`, `items.length === 0`, `enabled === true`.
  - Avoid relying on broad truthy/falsy checks for new code.
- Keep existing Prettier settings: semicolons, single quotes, 2 spaces, trailing commas where valid.
- Add comments only when they explain non-obvious behavior.

## Strapi Changes

- Update content-type schemas under `strapi/src/api/**/content-types/**/schema.json`.
- Update components under `strapi/src/components/**`.
- When adding a new dynamic-zone component, update both Strapi schema/components and the Nuxt dynamic-zone mapping.
- Be careful with `deepPopulate`: it affects default GET API responses globally.
- The default database is SQLite at `strapi/.tmp/data.db`; do not commit generated database files.
- Disabling a frontend module does NOT delete or disable its Strapi content types. Schema and frontend availability are separate concerns.

## Frontend Changes

The Nuxt frontend renders all Strapi content: the full dynamic-zone block set, CMS-driven pages, `en`/`ar` routing, draft preview, and module-provided pages (blog, auth, etc.).

- Core routes live under `nuxt/app/pages/[locale]`.
- Module routes live under `nuxt/app/modules/<name>/pages/`.
- Core components live under `nuxt/app/components/`.
- Module components live under `nuxt/app/modules/<name>/components/`.
- Composables follow the same pattern.
- Use the `@/` alias from `nuxt/tsconfig.json`.
- Keep server data fetching in server components/helpers unless interactivity requires a client component.
- When touching localized pages, verify localized slugs and locale switcher behavior.

## SEO & Structured Data

- `useNeopSeo()` — page-level metadata (title, OG, canonical, hreflang, robots).
- `useJsonLdOrganization()` — Organization/LocalBusiness (layout-level, from SchemaSettings).
- `useJsonLdWebSite()` — WebSite schema (layout-level).
- `useJsonLdWebPage()` — WebPage schema (per CMS page).
- `useJsonLdBreadcrumb()` — BreadcrumbList (per page).
- Module-specific schemas (e.g. `useJsonLdArticle()` in Blog) live inside their module.

## Verification

Choose the smallest useful check for the change:

- Docs-only: `yarn check:format`
- Nuxt UI/data changes: `cd nuxt && yarn build`
- Strapi schema/backend changes: `cd strapi && yarn build`
- Full confidence path: `yarn check:format`, `cd nuxt && yarn build`, `cd strapi && yarn build`
