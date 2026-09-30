import { isLocale, localizedPaths } from '#shared/lib/i18n';
import { MODULE_DEFINITIONS } from '#shared/module-defs/registry';
import type { ModuleDefinition } from '#shared/modules';
import neopConfig from '../../neop.config';

/**
 * Where the locale switcher should point for the current page.
 *
 * Translated entries have different slugs — `/en/blog/foo` is
 * `/ar/blog/quelque-chose`, not `/ar/blog/foo` — so swapping the locale
 * segment is wrong for anything backed by a localised Strapi entry, and sends
 * visitors (and the prerender crawler) to a 404.
 *
 * The switcher lives in the navbar, which is in the layout. During SSR the
 * layout's template renders the navbar *before* it reaches the page's `<slot>`,
 * so anything the page publishes — via state, provide/inject, or a store —
 * arrives after the links have already been written. Passing it down as a prop
 * has the same problem: there is nothing to pass yet.
 *
 * So the layout resolves it itself, from the route. That sounds like a second
 * fetch and is not one: these go through the same `useContent` helpers the page
 * uses, with the same cache keys, so `useAsyncData` returns the layout's result
 * to the page rather than asking Strapi twice.
 *
 * Module-aware: reserved segments and route matching are derived from enabled
 * module definitions rather than being hardcoded. Adding a new module with
 * localized paths requires only a `matchRoute` + `contentFetcher` in its
 * definition — this file does not change.
 */

// ─── Build module-aware lookups from enabled modules ─────────────────────────

type EnabledResolver = ModuleDefinition & { _enabled: true };

const enabledResolvers: EnabledResolver[] = Object.entries(neopConfig.modules)
  .filter(([_, cfg]) => cfg.enabled)
  .map(([name]) => MODULE_DEFINITIONS[name as keyof typeof MODULE_DEFINITIONS])
  .filter((def): def is ModuleDefinition => def !== undefined)
  .map((def) => ({ ...def, _enabled: true as const }));

/**
 * Segments under `[locale]` that are owned by enabled modules.
 * The `[slug].vue` catch-all should not match these — they belong to modules.
 */
const RESERVED = new Set(enabledResolvers.flatMap((r) => r.reservedSegments));

/** Exported so the catch-all `[slug].vue` page can check if a slug is reserved. */
export { RESERVED as MODULE_RESERVED_SEGMENTS };

// ─── Composable ──────────────────────────────────────────────────────────────

export function useRouteLocalizedPaths(): Ref<
  Record<string, string> | undefined
> {
  const route = useRoute();

  const segments = computed(() => route.path.split('/').filter(Boolean));
  const locale = computed(() => segments.value[0] ?? '');
  const section = computed(() => segments.value[1] ?? '');
  const entry = computed(() => segments.value[2] ?? '');

  /**
   * Which module owns this route, if any. Index routes and pages without a
   * module match resolve to null and fall back to the plain segment swap,
   * which is correct for them — their paths are the same in every locale.
   */
  const moduleMatch = computed(() => {
    if (!isLocale(locale.value)) return null;

    for (const resolver of enabledResolvers) {
      if (resolver.matchRoute) {
        const result = resolver.matchRoute(segments.value);
        if (result) return { resolver, ...result };
      }
    }

    // No module claimed this route — check if it's a CMS page.
    if (section.value && !entry.value && !RESERVED.has(section.value)) {
      return { resolver: null, kind: 'page', slug: section.value, prefix: '' };
    }

    return null;
  });

  const slug = computed(() => moduleMatch.value?.slug ?? '');

  // ─── Module content fetchers ─────────────────────────────────────────────
  // Call `useEntry` for each enabled module that has a `contentFetcher`.
  // All run unconditionally (composable rules), but only the matching one
  // actually fires a Strapi request — the rest resolve to null via `enabled`.

  type FetcherResult = {
    kind: string;
    prefix: string;
    data: Ref<{ slug: string; localizations?: Array<{ locale: string; slug: string }> } | null>;
  };

  const fetchers: FetcherResult[] = [];

  for (const resolver of enabledResolvers) {
    if (resolver.contentFetcher) {
      const active = computed(
        () =>
          moduleMatch.value?.kind === resolver.contentFetcher!.collection.replace(/s$/, '') ||
          moduleMatch.value?.resolver === resolver,
      );
      // Use a more reliable match: check if the current resolver is the one that matched.
      const isActive = computed(
        () => moduleMatch.value?.resolver === resolver && !!slug.value,
      );
      const { data } = useEntry(
        resolver.name,
        resolver.contentFetcher.collection,
        locale,
        slug,
        isActive,
      );
      fetchers.push({
        kind: resolver.name,
        prefix: resolver.contentFetcher.pathPrefix,
        data: data as Ref<{ slug: string; localizations?: Array<{ locale: string; slug: string }> } | null>,
      });
    }
  }

  // CMS pages are always available (core functionality).
  const pageActive = computed(
    () => moduleMatch.value?.kind === 'page' && !!slug.value,
  );
  const { data: page } = useCmsPage(locale, slug, pageActive);

  return computed(() => {
    const match = moduleMatch.value;
    if (!match) return undefined;

    // CMS page
    if (match.kind === 'page' && page.value) {
      return localizedPaths(
        locale.value,
        page.value.slug,
        page.value.localizations,
      );
    }

    // Module content
    for (const fetcher of fetchers) {
      if (match.resolver && fetcher.kind === match.resolver.name && fetcher.data.value) {
        return localizedPaths(
          locale.value,
          fetcher.data.value.slug,
          fetcher.data.value.localizations,
          fetcher.prefix,
        );
      }
    }

    return undefined;
  });
}
