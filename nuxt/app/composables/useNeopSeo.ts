import { localeDir } from '#shared/lib/i18n';
import { strapiMedia } from '#shared/lib/media';
import type { Global, Seo } from '#shared/types/strapi';

/**
 * Page metadata � Neop Website Starter SEO composable.
 *
 * Reads Strapi's `shared.seo` component and the site-wide `global.seo`
 * fallback, then sets all head tags through Nuxt's useSeoMeta / useHead.
 *
 * Handles:
 *  - Title, description, OG, Twitter cards
 *  - Canonical URL
 *  - lang + dir (RTL for Arabic)
 *  - noindex/nofollow from metaRobots field
 *  - hreflang alternate links
 */
export function useNeopSeo(options: {
  seo: Ref<Seo | null | undefined>;
  global: Ref<Global | null | undefined>;
  locale: Ref<string>;
  /**
   * Map of locale -> localized path (without leading slash or locale prefix).
   * Used to generate hreflang alternate links.
   * Example: { en: 'about', ar: 'about' }
   */
  localizedPaths?: Ref<Record<string, string> | undefined>;
}) {
  const { seo, global, locale, localizedPaths } = options;
  const strapiUrl = useStrapiUrl();
  const siteUrl = useRuntimeConfig().public.siteUrl as string;
  const route = useRoute();

  const fallback = computed(() => global.value?.seo ?? null);

  const title = computed(
    () => seo.value?.metaTitle || fallback.value?.metaTitle || 'Neop'
  );
  const description = computed(
    () => seo.value?.metaDescription || fallback.value?.metaDescription || ''
  );
  const image = computed(() =>
    strapiMedia(
      seo.value?.metaImage?.url ?? fallback.value?.metaImage?.url,
      strapiUrl
    )
  );
  const canonical = computed(() => {
    // Prefer explicit canonical from Strapi, fall back to current URL.
    const explicit = (seo.value as { canonicalURL?: string | null })?.canonicalURL;
    return explicit || new URL(route.path, siteUrl).href;
  });

  // noindex/nofollow from Strapi's metaRobots field.
  // Example value: 'noindex, nofollow'
  const robots = computed(() => (seo.value as { metaRobots?: string | null })?.metaRobots || null);

  // dir attribute: 'rtl' for Arabic, 'ltr' for everything else.
  const dir = computed(() => localeDir(locale.value));

  // Set lang + dir on <html> per-page.
  useHead({
    htmlAttrs: { lang: locale, dir },
    link: [
      { rel: 'canonical', href: canonical },
      // Hreflang alternate links � helps search engines serve the right locale.
      ...Object.entries(localizedPaths?.value ?? {}).map(([loc, path]) => ({
        rel: 'alternate' as const,
        hreflang: loc,
        href: path === '' ? `${siteUrl}/${loc}` : `${siteUrl}/${loc}/${path}`,
      })),
    ],
  });

  useSeoMeta({
    title,
    description,
    robots: () => robots.value ?? undefined,
    ogTitle: () => seo.value?.ogTitle || title.value,
    ogDescription: () => seo.value?.ogDescription || description.value,
    ogType: 'website',
    ogUrl: canonical,
    ogImage: () => image.value ?? undefined,
    twitterCard: () =>
      (seo.value?.twitterCard as 'summary_large_image') ||
      'summary_large_image',
    twitterTitle: () => seo.value?.twitterTitle || title.value,
    twitterDescription: () =>
      seo.value?.twitterDescription || description.value,
    twitterImage: () => seo.value?.twitterImage ?? undefined,
  });
}
