/**
 * Structured Data (JSON-LD) composables — Neop Website Starter.
 *
 * Architecture:
 *   Core provides: useJsonLdOrganization, useJsonLdWebSite, useJsonLdWebPage, useJsonLdBreadcrumb
 *   Modules provide: their own schemas (e.g. useJsonLdArticle in Blog module)
 *
 * Each composable injects a single <script type="application/ld+json"> via useHead().
 * Nuxt deduplicates by `key`, so multiple calls with the same key are safe.
 *
 * All schemas respect SSR and produce valid JSON.
 */
import type { SchemaSettings, Seo, StrapiMedia } from '#shared/types/strapi';
import { strapiMedia } from '#shared/lib/media';

// ---------------------------------------------------------------------------
// Organization / LocalBusiness — from SchemaSettings
// ---------------------------------------------------------------------------

/**
 * Injects Organization or LocalBusiness JSON-LD from Strapi SchemaSettings.
 * Call once in the layout.
 */
export function useJsonLdOrganization(
  settings: Ref<SchemaSettings | null | undefined>,
  strapiUrl: string,
) {
  const jsonLd = computed(() => {
    const s = settings.value;
    if (!s) return null;

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': s.schema_type ?? 'Organization',
      name: s.business_name,
      description: s.description,
      url: s.website_url,
      telephone: s.phone,
      email: s.email,
    };

    if (s.logo?.url) {
      schema.logo = strapiMedia(s.logo.url, strapiUrl) ?? undefined;
    }

    if (s.address || s.city || s.country) {
      schema.address = {
        '@type': 'PostalAddress',
        streetAddress: s.address,
        addressLocality: s.city,
        addressCountry: s.country,
        postalCode: s.postal_code,
      };
    }

    if (s.latitude && s.longitude) {
      schema.geo = {
        '@type': 'GeoCoordinates',
        latitude: s.latitude,
        longitude: s.longitude,
      };
    }

    if (s.opening_hours) schema.openingHours = s.opening_hours;
    if (s.price_range) schema.priceRange = s.price_range;
    if (Array.isArray(s.social_profiles) && s.social_profiles.length) {
      schema.sameAs = s.social_profiles;
    }
    if (s.founded_year) schema.foundingDate = String(s.founded_year);

    // Remove undefined/null keys for clean output.
    return JSON.parse(JSON.stringify(schema));
  });

  useHead({
    script: computed(() =>
      jsonLd.value
        ? [
            {
              type: 'application/ld+json',
              key: 'neop-org-schema',
              innerHTML: JSON.stringify(jsonLd.value),
            },
          ]
        : [],
    ),
  });
}

// ---------------------------------------------------------------------------
// WebSite — global, once per page
// ---------------------------------------------------------------------------

/**
 * Injects WebSite JSON-LD. Call once in the layout.
 * Provides site-level search action and name for Google Search.
 */
export function useJsonLdWebSite(options: {
  name: Ref<string | null | undefined>;
  url: string;
  locale: Ref<string>;
}) {
  const jsonLd = computed(() => {
    const siteName = options.name.value;
    if (!siteName) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName,
      url: options.url,
      inLanguage: options.locale.value,
    };
  });

  useHead({
    script: computed(() =>
      jsonLd.value
        ? [
            {
              type: 'application/ld+json',
              key: 'neop-website-schema',
              innerHTML: JSON.stringify(jsonLd.value),
            },
          ]
        : [],
    ),
  });
}

// ---------------------------------------------------------------------------
// WebPage — per CMS page
// ---------------------------------------------------------------------------

/**
 * Injects WebPage JSON-LD for CMS-driven pages.
 * Call from page components.
 */
export function useJsonLdWebPage(options: {
  title: Ref<string | null | undefined>;
  description: Ref<string | null | undefined>;
  url: Ref<string>;
  image?: Ref<string | null | undefined>;
  locale: Ref<string>;
  datePublished?: Ref<string | null | undefined>;
  dateModified?: Ref<string | null | undefined>;
}) {
  const jsonLd = computed(() => {
    const title = options.title.value;
    if (!title) return null;

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: options.description.value,
      url: options.url.value,
      inLanguage: options.locale.value,
    };

    if (options.image?.value) schema.primaryImageOfPage = options.image.value;
    if (options.datePublished?.value) schema.datePublished = options.datePublished.value;
    if (options.dateModified?.value) schema.dateModified = options.dateModified.value;

    return JSON.parse(JSON.stringify(schema));
  });

  useHead({
    script: computed(() =>
      jsonLd.value
        ? [
            {
              type: 'application/ld+json',
              key: 'neop-webpage-schema',
              innerHTML: JSON.stringify(jsonLd.value),
            },
          ]
        : [],
    ),
  });
}

// ---------------------------------------------------------------------------
// BreadcrumbList — generic, used by all pages
// ---------------------------------------------------------------------------

export type BreadcrumbItem = {
  name: string;
  url: string;
};

/**
 * Injects BreadcrumbList JSON-LD.
 * The items array should include the full chain from Home to the current page.
 *
 * Example:
 * ```ts
 * useJsonLdBreadcrumb(computed(() => [
 *   { name: 'Home', url: 'https://example.com/en' },
 *   { name: 'Blog', url: 'https://example.com/en/blog' },
 *   { name: 'My Post', url: 'https://example.com/en/blog/my-post' },
 * ]));
 * ```
 */
export function useJsonLdBreadcrumb(items: Ref<BreadcrumbItem[]>) {
  const jsonLd = computed(() => {
    const list = items.value;
    if (list.length === 0) return null;

    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: list.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  });

  useHead({
    script: computed(() =>
      jsonLd.value
        ? [
            {
              type: 'application/ld+json',
              key: 'neop-breadcrumb-schema',
              innerHTML: JSON.stringify(jsonLd.value),
            },
          ]
        : [],
    ),
  });
}

// ---------------------------------------------------------------------------
// Legacy compat — keep the old useJsonLd name working during migration
// ---------------------------------------------------------------------------

/**
 * @deprecated Use useJsonLdOrganization() instead.
 */
export const useJsonLd = useJsonLdOrganization;
