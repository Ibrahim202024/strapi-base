/**
 * Dynamic Sitemap
 *
 * GET /sitemap.xml (routed via routeRules in nuxt.config.ts)
 *
 * Module-aware: core always contributes Page URLs. Each enabled module that
 * declares a `sitemapProvider` contributes its own URLs. Adding a new module
 * with sitemap support requires only a provider in its definition — this
 * handler does not change.
 *
 * Excludes pages where seo.metaRobots contains 'noindex'.
 */
import { createStrapiClient } from '#shared/lib/strapi';
import type { Page } from '#shared/types/strapi';
import type { SitemapUrl } from '#shared/modules';
import { MODULE_DEFINITIONS } from '#shared/module-defs/registry';
import { getEnabledModuleConfigs } from '#shared/module-defs/config';

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
let cached: { xml: string; expiry: number } | null = null;

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=600');

  if (cached && Date.now() < cached.expiry) return cached.xml;

  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');
  const strapi = createStrapiClient(
    config.public.strapiUrl as string,
    config.strapiApiToken as string | undefined
  );

  const urls: SitemapUrl[] = [];

  // ── Core: Pages ──────────────────────────────────────────────────────────
  try {
    const pages = await strapi.collection<Page>('pages', { locale: 'all' as unknown as string });
    for (const page of pages) {
      const noindex = (page.seo as { metaRobots?: string } | undefined)?.metaRobots?.includes('noindex');
      if (noindex) continue;
      const path = page.slug === 'homepage' ? '' : page.slug;
      urls.push({
        loc: `${siteUrl}/${page.locale}${path ? '/' + path : ''}`,
        alternates: page.localizations?.reduce<Record<string, string>>((acc, l) => {
          const lpath = l.slug === 'homepage' ? '' : l.slug;
          acc[l.locale] = `${siteUrl}/${l.locale}${lpath ? '/' + lpath : ''}`;
          return acc;
        }, { [page.locale]: `${siteUrl}/${page.locale}${path ? '/' + path : ''}` }),
      });
    }
  } catch { /* Strapi unreachable — degrade gracefully */ }

  // ── Module providers ─────────────────────────────────────────────────────
  // Each enabled module with `sitemap: true` and a `sitemapProvider` in its
  // definition contributes URLs. No per-module `if` statements needed here.
  const enabledModules = getEnabledModuleConfigs();

  for (const { name, config: cfg } of enabledModules) {
    if (cfg.sitemap !== true) continue;

    const def = MODULE_DEFINITIONS[name];
    if (!def?.sitemapProvider) continue;

    try {
      const moduleUrls = await def.sitemapProvider(strapi, siteUrl);
      urls.push(...moduleUrls);
    } catch {
      // Module provider failed — skip, don't break the whole sitemap.
    }
  }

  // ── Build XML ────────────────────────────────────────────────────────────
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls.map(({ loc, lastmod, alternates }) => {
      const alts = alternates
        ? Object.entries(alternates).map(([lang, href]) =>
            `  <xhtml:link rel="alternate" hreflang="${lang}" href="${href}"/>`
          ).join('\n')
        : '';
      return [
        '  <url>',
        `    <loc>${loc}</loc>`,
        lastmod ? `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>` : '',
        alts,
        '  </url>',
      ].filter(Boolean).join('\n');
    }),
    '</urlset>',
  ].join('\n');

  cached = { xml, expiry: Date.now() + CACHE_TTL };
  return xml;
});
