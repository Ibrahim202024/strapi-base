/**
 * Module System — Type Definitions
 *
 * Shared between client and server. Defines the contract for module
 * definitions and the top-level Neop configuration.
 *
 * Module definitions describe *what* a module is (metadata, capabilities).
 * `NeopConfig` describes *which* modules are enabled and how they are
 * configured for a given project.
 */

import type { FetchOptions } from './lib/strapi';

// ─── Module Names ────────────────────────────────────────────────────────────

/**
 * Union of all known module identifiers.
 *
 * This is the single source of truth for module names. Adding a new module
 * means extending this union and providing a definition in the registry.
 */
export type ModuleName =
  | 'blog'
  | 'auth'
  | 'services'
  | 'portfolio'
  | 'team'
  | 'careers'
  | 'shop';

// ─── Module Configuration (neop.config.ts) ───────────────────────────────────

/** Per-module configuration in `neop.config.ts`. */
export type ModuleConfig = {
  /** Whether this module's routes, components, and integrations are active. */
  enabled: boolean;
  /** Primary URL prefix under `/:locale/` (e.g. `/blog`, `/sign-in`). */
  route: string;
  /** Whether the module contributes URLs to the sitemap. */
  sitemap?: boolean;
};

/** Top-level configuration file shape. */
export type NeopConfig = {
  modules: Record<ModuleName, ModuleConfig>;
};

// ─── Sitemap ─────────────────────────────────────────────────────────────────

export type SitemapUrl = {
  loc: string;
  lastmod?: string;
  alternates?: Record<string, string>;
};

/**
 * A function that returns sitemap URLs for a module.
 *
 * Receives a lightweight Strapi fetch helper and the canonical site URL.
 * Each module owns the logic for fetching its entries and building URLs.
 */
export type SitemapProvider = (
  strapi: {
    collection: <T>(resource: string, options?: FetchOptions) => Promise<T[]>;
  },
  siteUrl: string,
) => Promise<SitemapUrl[]>;

// ─── Navigation ──────────────────────────────────────────────────────────────

/** A module's contribution to the Navbar UI. */
export type NavContribution = {
  /** Auto-imported component name (e.g. `'AuthMenu'`). */
  component: string;
  /** Where in the navbar the component renders. */
  position: 'right';
};

// ─── Localized Path Resolution ───────────────────────────────────────────────

/** Result of a successful route match by a module. */
export type RouteMatch = {
  /** Unique kind identifier (e.g. `'article'`, `'product'`). */
  kind: string;
  /** The slug segment from the URL. */
  slug: string;
  /** Path prefix for building locale-switched URLs (e.g. `'blog'`). */
  prefix: string;
};

/**
 * Describes how a module's content should be fetched for locale switching.
 *
 * This is a data descriptor, not a composable — `useLocalizedPaths` uses it
 * to call the generic `useEntry()` helper, keeping Core free of module imports.
 */
export type ContentFetcher = {
  /** Strapi collection API ID (e.g. `'articles'`, `'products'`). */
  collection: string;
  /** URL prefix for locale-switched paths (e.g. `'blog'`). */
  pathPrefix: string;
};

// ─── Module Definition ───────────────────────────────────────────────────────

/**
 * What a module *is* — its capabilities and metadata.
 *
 * Definitions live in `shared/module-defs/` so both client and server can
 * read them. A definition does NOT decide whether the module is enabled —
 * that is `neop.config.ts`'s job.
 */
export type ModuleDefinition = {
  name: ModuleName;

  /** URL segments that this module "owns" (e.g. `['blog']`, `['sign-in', 'sign-up']`). */
  reservedSegments: string[];

  /**
   * Given the path segments after the locale, return a `RouteMatch` if this
   * module owns the route, or `null` otherwise.
   *
   * Used by the locale switcher to determine which module should provide
   * localized path data.
   */
  matchRoute?: (segments: string[]) => RouteMatch | null;

  /** Describes how to fetch content for locale switching. */
  contentFetcher?: ContentFetcher;

  /** Optional sitemap URL provider. */
  sitemapProvider?: SitemapProvider;

  /** Optional Navbar UI contribution. */
  navContribution?: NavContribution;
};
