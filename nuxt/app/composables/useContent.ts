import type {
  AnnouncementBar,
  Form,
  Global,
  IndexPage,
  Page,
  Popup,
  SchemaSettings,
  SiteSettings,
  TrackingSettings,
} from '#shared/types/strapi';

/**
 * Shared content reads.
 *
 * Every fetch a page makes lives here rather than in the page, because the
 * layout needs some of the same data and the two must agree on the cache key.
 * `useAsyncData` dedupes by key within a render, so when the layout and the
 * page ask for the same entry it is fetched once — see `useLocalizedPaths`.
 *
 * Keys are reactive getters, so switching locale refetches instead of showing
 * the previous locale's content until a hard reload.
 */

/**
 * Reuse a result already fetched under the same key, on the server as well as
 * the client.
 *
 * This is what actually makes the sharing work. Nuxt's default `getCachedData`
 * only consults the payload while hydrating, so during SSR the layout's fetch
 * and the page's fetch of the same key each hit Strapi — the key matching buys
 * nothing. Making the payload authoritative in both places collapses them to
 * one request.
 *
 * Safe here because everything below is read-only CMS content for the current
 * render. An explicit `refresh()` — which is what the `watch` options trigger
 * on a locale change — bypasses this and refetches.
 */
const useSharedCache = <T>() => ({
  getCachedData: (key: string, nuxtApp: NuxtApp): T | undefined =>
    (nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]) as T | undefined,
});

export function useGlobal(locale: Ref<string>) {
  const strapi = useStrapiClient();

  return useAsyncData(
    computed(() => `global-${locale.value}`),
    () => strapi.single<Global>('global', { locale: locale.value }),
    { watch: [locale], ...useSharedCache<Global>() }
  );
}

/**
 * A landing single type (e.g. `blog-page`).
 *
 * Missing or unpublished is not an error here — the index still renders, just
 * without its authored heading — so a failure resolves to null rather than
 * taking the page down with it.
 */
export function useIndexPage(singleType: string, locale: Ref<string>) {
  const strapi = useStrapiClient();

  return useAsyncData(
    computed(() => `${singleType}-${locale.value}`),
    () =>
      strapi
        .single<IndexPage>(singleType, { locale: locale.value })
        .catch(() => null),
    {
      watch: [locale],
      default: () => null,
      ...useSharedCache<IndexPage | null>(),
    }
  );
}

/**
 * Generic collection entry lookup.
 *
 * Exported so the module-aware locale resolver (`useLocalizedPaths`) can
 * fetch entries for any module's collection without importing module code.
 *
 * `enabled` exists for `useLocalizedPaths`, which calls all enabled module
 * fetchers from the layout and only wants the one matching the current route
 * to fire. A disabled call resolves to null under its own `idle:` key.
 */
export function useEntry<T>(
  kind: string,
  collection: string,
  locale: Ref<string>,
  slug: Ref<string>,
  enabled?: Ref<boolean>
) {
  const strapi = useStrapiClient();
  const on = computed(() => (enabled ? enabled.value : true));

  return useAsyncData<T | null>(
    computed(() =>
      on.value ? `${kind}-${locale.value}-${slug.value}` : `idle:${kind}`
    ),
    () =>
      on.value
        ? strapi.bySlug<T>(collection, slug.value, { locale: locale.value })
        : Promise.resolve(null),
    { watch: [locale, slug, on], ...useSharedCache<T | null>() }
  );
}

export const useCmsPage = (
  locale: Ref<string>,
  slug: Ref<string>,
  enabled?: Ref<boolean>
) => useEntry<Page>('page', 'pages', locale, slug, enabled);

// ??? Phase 2 Single Types ????????????????????????????????????????????????????

/**
 * Announcement bar � sitewide banner.
 * Not draftable, not locale-specific (enabled/disabled globally).
 */
export function useAnnouncementBar(locale: Ref<string>) {
  const strapi = useStrapiClient();
  return useAsyncData(
    computed(() => `announcement-bar-${locale.value}`),
    () => strapi.single<AnnouncementBar>('announcement-bar', { locale: locale.value }).catch(() => null),
    { watch: [locale], default: () => null, ...useSharedCache<AnnouncementBar | null>() }
  );
}

/**
 * Popup � overlay configuration.
 */
export function usePopup(locale: Ref<string>) {
  const strapi = useStrapiClient();
  return useAsyncData(
    computed(() => `popup-${locale.value}`),
    () => strapi.single<Popup>('popup', { locale: locale.value }).catch(() => null),
    { watch: [locale], default: () => null, ...useSharedCache<Popup | null>() }
  );
}

/**
 * Tracking settings � not localised, loaded once per session.
 */
export function useTrackingSettings() {
  const strapi = useStrapiClient();
  return useAsyncData(
    'tracking-settings',
    () => strapi.single<TrackingSettings>('tracking-settings').catch(() => null),
    { default: () => null, ...useSharedCache<TrackingSettings | null>() }
  );
}

/**
 * Schema settings � Organization / LocalBusiness data for JSON-LD.
 */
export function useSchemaSettings(locale: Ref<string>) {
  const strapi = useStrapiClient();
  return useAsyncData(
    computed(() => `schema-settings-${locale.value}`),
    () => strapi.single<SchemaSettings>('schema-settings', { locale: locale.value }).catch(() => null),
    { watch: [locale], default: () => null, ...useSharedCache<SchemaSettings | null>() }
  );
}

/**
 * Site settings — branding, contact info, social links.
 * Localized for site_name, tagline, and address.
 */
export function useSiteSettings(locale: Ref<string>) {
  const strapi = useStrapiClient();
  return useAsyncData(
    computed(() => `site-settings-${locale.value}`),
    () => strapi.single<SiteSettings>('site-setting', { locale: locale.value }).catch(() => null),
    { watch: [locale], default: () => null, ...useSharedCache<SiteSettings | null>() }
  );
}
