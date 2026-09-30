# Changelog

## [Unreleased] — 2026-09-30

### Added

- **Localized Slugs** — Page slugs now support Unicode characters (Arabic, etc.)
  - Changed `slug` field from `uid` to `string` type in the Page content type schema
  - `/en/home` and `/ar/الرئيسية` now work as expected
  - Locale switcher resolves cross-locale slugs via Strapi's `localizations` array

- **Homepage Redirect** — `[locale]/index.vue` now issues a 301 redirect to the localized homepage slug
  - `/en` → `/en/home`
  - `/ar` → `/ar/الرئيسية`
  - Configure slugs in the `HOMEPAGE_SLUGS` map in `[locale]/index.vue`

- **Arabic (ar) locale** — Added to Strapi's i18n configuration

### Changed

- **`[locale]/[slug].vue`** — Removed the `homepage` slug block. The homepage is now served at its own localized slug, not hardcoded to `homepage`

- **`yarn seed` / `yarn export`** — Updated scripts:
  - Replaced `cd strapi &&` with `yarn --cwd strapi` for Windows PowerShell compatibility
  - `yarn seed` now uses `--only-content-types` to import only content types that exist in the current schema, and `--exclude files` to skip missing upload binaries

### Fixed

- **Windows compatibility** — `seed` and `export` scripts no longer use `&&` operator which fails in PowerShell

### Notes for team

- **Strapi admin credentials**: Create your admin at `http://localhost:1337/admin` on first run
- **Seed data**: The current seed export may be empty. After creating content in Strapi, run `yarn export` to update the seed file
- **Slug field**: Since `slug` is now a `string` (not `uid`), auto-slug-generation is not available. Enter slugs manually in Strapi