# Neop Website Starter

> Production-ready bilingual (Arabic + English) website starter.
> **Strapi 5** CMS + **Nuxt 4** frontend. Config-driven module system.

## Stack

| Layer | Tech |
|-------|------|
| CMS | Strapi 5 |
| Frontend | Nuxt 4 (SSR + prerender) |
| Database | SQLite (dev) / MySQL 8 (prod) |
| Styling | TailwindCSS v4 |
| Package Manager | Yarn 4.5.0 |
| Node | 22.x+ |
| Deployment | Docker / PM2 / any Node host |

## Features

- **Bilingual** â€” Arabic (RTL) and English (LTR) from day one
- **Module System** â€” config-driven enable/disable for Blog, Auth, Shop, and future modules
- **Dynamic Zones** â€” 7 CMS block types with fallback rendering
- **SEO** â€” sitemap.xml, robots.txt, JSON-LD (Organization, WebSite, WebPage, BreadcrumbList, Article), hreflang, noindex
- **Tracking** â€” GTM, GA4, Meta Pixel, Snapchat, TikTok, LinkedIn, Google Ads with consent banner (GDPR-ready)
- **Forms** â€” CMS-configurable fields, server-side submission with write token
- **Redirects** â€” 301/302 managed from Strapi, instant webhook cache invalidation
- **Preview** â€” Secure Strapi Admin draft preview (AES-256-GCM encrypted session)
- **Security** â€” API token auth, CORS, rate limiting, security headers
- **Announcement Bar** â€” CMS-driven with date range, dismissible
- **Popup** â€” 4 trigger modes, 3 frequency modes, date-range, backdrop
- **Docker** â€” docker-compose for local dev, multi-stage Dockerfiles
- **CI** â€” GitHub Actions: lint, build

## Quick Start

### Requirements

- Node.js 22+
- Yarn 4+
- Docker (optional, for MySQL) or a MySQL 8.0 instance

### 1. Install

```bash
git clone <repo> && cd neop-website-starter
yarn install
yarn setup
```

`yarn setup` installs both `strapi/` and `nuxt/` dependencies, creates `.env` files from examples, and propagates the preview secret.

### 2. Database

**Option A â€” SQLite (quickest, no Docker):**
Strapi uses SQLite by default. No setup needed.

**Option B â€” MySQL:**
```bash
docker compose up -d mysql
# Wait for healthy: docker compose ps
```
Then update `strapi/.env` with the MySQL connection.

### 3. Seed demo data (optional)

```bash
yarn seed
```

Imports 191 demo entities and 115 media assets. This is destructive â€” it wipes existing data.

### 4. Development

```bash
yarn dev
# Strapi: http://localhost:1337
# Nuxt:   http://localhost:3001
```

On first start, Strapi prompts to create a Super Admin at `http://localhost:1337/admin`.

### 5. Copy the API token

Strapi's bootstrap creates a read-only API token on first startup:
```
STRAPI_API_TOKEN: xxxxxxxxxxxx
```
Copy it to `nuxt/.env` as `STRAPI_API_TOKEN`, then restart Nuxt.

## Localized Slugs (Pages)

The Page content type uses a **`string`** field for `slug` (not `uid`), allowing Unicode characters — including Arabic — in URLs:

| Locale | Slug | URL |
|--------|------|-----|
| `en` | `home` | `/en/home` |
| `ar` | `الرئيسية` | `/ar/الرئيسية` |

### How it works

1. **`[locale]/index.vue`** redirects the locale root (`/en`, `/ar`) to the localized homepage slug via a 301
2. **`[locale]/[slug].vue`** fetches any CMS page by its localized slug from Strapi
3. **Locale switcher** resolves cross-locale slugs automatically via Strapi's `localizations` array

### Homepage configuration

The homepage redirect map is in `[locale]/index.vue`:

```ts
const HOMEPAGE_SLUGS: Record<string, string> = { en: 'home', ar: 'الرئيسية' };
```

Update this map when changing homepage slugs in Strapi.

### Creating a localized page

1. In Strapi admin, go to **Content Manager → Pages → Create new entry**
2. Set the slug for the default locale (e.g., `home`)
3. Switch locale in the dropdown, set the localized slug (e.g., `الرئيسية`)
4. **Save & Publish** both versions

> **Note:** Since `slug` is a `string` field (not `uid`), auto-generation is not available. Enter slugs manually.

## Module System

Modules are controlled by a single build-time config file:

```
nuxt/neop.config.ts
```

### Configuration

```ts
const config: NeopConfig = {
  modules: {
    blog: { enabled: true, route: '/blog', sitemap: true },
    auth: { enabled: true, route: '/sign-in', sitemap: false },
    shop: { enabled: false, route: '/shop', sitemap: true },
    // ... services, portfolio, team, careers
  },
};
```

### Core vs Modules

| | Core | Module |
|---|---|---|
| Pages | `app/pages/` | `app/modules/<name>/pages/` |
| Components | `app/components/` | `app/modules/<name>/components/` |
| Composables | `app/composables/` | `app/modules/<name>/composables/` |
| Dependency | None on modules | Can use Core |
| Routes | Always registered | Only when `enabled: true` |
| Bundle | Always included | Only when `enabled: true` |

**Key rule:** Core must not import from individual modules.

### Enabling a module

1. Set `enabled: true` in `neop.config.ts`
2. Mirror the change in `shared/module-defs/config.ts`
3. Rebuild

### Creating a new module

1. Add the module name to `ModuleName` in `shared/modules.ts`
2. Create a definition in `shared/module-defs/<name>.ts`
3. Register in `shared/module-defs/registry.ts`
4. Add config entry to `neop.config.ts` and `shared/module-defs/config.ts`
5. Create pages/components/composables under `app/modules/<name>/`
6. Verify build with module enabled and disabled

## Content Types

| Type | Kind | Localized | Module |
|------|------|-----------|--------|
| Page | Collection | Yes (slug per locale) | Core |
| Article | Collection | Yes | Blog |
| Category | Collection | Yes | Blog |
| Testimonial | Collection | Yes | Core |
| Form | Collection | Yes | Core |
| Form Submission | Collection | No | Core |
| Redirection | Collection | No | Core |
| Global | Single | Yes | Core |
| Announcement Bar | Single | Yes | Core |
| Popup | Single | Yes | Core |
| Tracking Settings | Single | No | Core |
| Schema Settings (JSON-LD) | Single | Yes | Core |
| Site Settings | Single | Yes | Core |
| Blog Page | Single | Yes | Blog |

## Dynamic Zone Blocks

| Component | Renderer | Description |
|-----------|----------|-------------|
| `dynamic-zone.hero` | `Hero.vue` | Hero section with heading, image, CTA |
| `dynamic-zone.testimonials` | `Testimonials.vue` | Two-row scrolling marquee |
| `dynamic-zone.how-it-works` | `HowItWorks.vue` | Step-by-step process |
| `dynamic-zone.cta` | `Cta.vue` | Call to action banner |
| `dynamic-zone.faq` | `Faq.vue` | Accordion FAQ (inline items) |
| `dynamic-zone.form-next-to-section` | `FormNextToSection.vue` | Form alongside content |
| `dynamic-zone.related-articles` | `RelatedArticles.vue` | Blog article cards |

Unknown components render a fallback warning in dev, nothing in production.

## SEO

### Meta Tags

`useNeopSeo()` handles all page metadata:
- Title, description, OG, Twitter cards
- Canonical URL
- `lang` + `dir` (RTL for Arabic)
- `noindex`/`nofollow` from Strapi's `metaRobots` field
- hreflang alternate links

### JSON-LD / Structured Data

| Schema | Source | Where |
|--------|--------|-------|
| `Organization` / `LocalBusiness` | SchemaSettings single type | Layout (global) |
| `WebSite` | SchemaSettings business name | Layout (global) |
| `WebPage` | Page SEO metadata | CMS pages |
| `BreadcrumbList` | Route segments | All pages |
| `Article` | Blog article data | Blog detail page |

Module-specific schemas (e.g. Article) live inside their module. Core has no dependency on them.

## Composables Reference

| Composable | Purpose |
|---|---|
| `useNeopSeo()` | Page-level SEO: title, OG, canonical, hreflang, robots |
| `useJsonLdOrganization()` | Organization/LocalBusiness JSON-LD from SchemaSettings |
| `useJsonLdWebSite()` | WebSite JSON-LD |
| `useJsonLdWebPage()` | WebPage JSON-LD for CMS pages |
| `useJsonLdBreadcrumb()` | BreadcrumbList JSON-LD |
| `useGlobal()` | Site-wide navbar, footer, SEO fallback |
| `useAnnouncementBar()` | Sitewide banner data |
| `useTrackingSettings()` | GTM/GA4/Pixel IDs |
| `useSchemaSettings()` | Schema.org / JSON-LD settings |
| `useTracking()` | Consent-gated tracking script injection |
| `useDataLayer()` | GTM event pusher |
| `useConsent()` | Cookie consent state |
| `useFormSubmit()` | Form submission via Nitro |
| `useLocale()` / `useDir()` | Active locale and direction |
| `useModules()` | Module-awareness API: `isEnabled()`, `getConfig()`, nav contributions |

## Environment Variables

### Nuxt (`nuxt/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Dev/prod server port (default: 3001) |
| `WEBSITE_URL` | Yes | Public site URL for canonical/sitemap |
| `STRAPI_URL` | Yes | Strapi backend URL |
| `STRAPI_API_TOKEN` | Yes | Read-only API token (server-only) |
| `PREVIEW_SECRET` | Yes | Must match Strapi's `PREVIEW_SECRET` |
| `WEBHOOK_SECRET` | No | Validates incoming Strapi webhooks |
| `SESSION_SECRET` | Yes | Cookie encryption key (â‰¥32 chars) |
| `STRAPI_WRITE_TOKEN` | No | Write token for form submissions |

### Strapi (`strapi/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `HOST` | No | Bind address (default: 0.0.0.0) |
| `PORT` | No | Port (default: 1337) |
| `APP_KEYS` | Yes | Strapi app keys |
| `API_TOKEN_SALT` | Yes | API token salt |
| `ADMIN_JWT_SECRET` | Yes | Admin JWT secret |
| `TRANSFER_TOKEN_SALT` | Yes | Transfer token salt |
| `JWT_SECRET` | Yes | JWT secret |
| `CLIENT_URL` | Yes | Frontend URL (CORS, preview) |
| `PREVIEW_SECRET` | Yes | Must match Nuxt's `PREVIEW_SECRET` |
| `DATABASE_CLIENT` | No | `sqlite` (default) or `mysql2` |
| `DATABASE_HOST` | MySQL | Database host |
| `DATABASE_PORT` | MySQL | Database port |
| `DATABASE_NAME` | MySQL | Database name |
| `DATABASE_USERNAME` | MySQL | Database user |
| `DATABASE_PASSWORD` | MySQL | Database password |
| `DATABASE_SSL` | MySQL | SSL connection |

## Project Structure

```
neop-website-starter/
â”œâ”€â”€ strapi/                      # Strapi 5 backend
â”‚   â”œâ”€â”€ src/api/                 # Content type APIs
â”‚   â”œâ”€â”€ src/components/          # Strapi components (DZ, shared, global)
â”‚   â””â”€â”€ src/admin/               # Admin panel customization
â”œâ”€â”€ nuxt/                        # Nuxt 4 frontend
â”‚   â”œâ”€â”€ neop.config.ts           # Module configuration
â”‚   â”œâ”€â”€ shared/                  # Shared types, libs, module definitions
â”‚   â”‚   â”œâ”€â”€ modules.ts           # Module type system
â”‚   â”‚   â”œâ”€â”€ module-defs/         # Module definitions + registry
â”‚   â”‚   â”œâ”€â”€ lib/                 # Strapi client, i18n, media helpers
â”‚   â”‚   â””â”€â”€ types/               # TypeScript interfaces
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ pages/               # Core routes ([locale]/index, [locale]/[slug])
â”‚   â”‚   â”œâ”€â”€ modules/             # Module routes + components + composables
â”‚   â”‚   â”‚   â”œâ”€â”€ blog/
â”‚   â”‚   â”‚   â”œâ”€â”€ auth/
â”‚   â”‚   â”‚   â””â”€â”€ shop/
â”‚   â”‚   â”œâ”€â”€ components/          # Core components (Navbar, Footer, DZ, etc.)
â”‚   â”‚   â”œâ”€â”€ composables/         # Core composables (SEO, content, tracking)
â”‚   â”‚   â””â”€â”€ layouts/             # Default layout
â”‚   â””â”€â”€ server/                  # Nitro server (API routes, middleware)
â”‚       â”œâ”€â”€ api/                 # Preview, sitemap, robots, health, forms, auth, webhooks
â”‚       â””â”€â”€ middleware/          # Rate-limit, redirects, security headers
â”œâ”€â”€ scripts/                     # Setup, dev, env orchestration
â”œâ”€â”€ docker/                      # MySQL init scripts
â”œâ”€â”€ docker-compose.yml
â”œâ”€â”€ ecosystem.config.cjs         # PM2 config
â””â”€â”€ docs/                        # Implementation audit
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT