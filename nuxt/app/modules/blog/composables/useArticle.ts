/**
 * Blog-specific article data fetching.
 *
 * Thin wrapper around the generic Strapi client, typed for the Article
 * interface. Used by blog pages and the blog's localized path resolver.
 */
import type { Article } from '#shared/types/strapi';

export function useArticle(
  locale: Ref<string>,
  slug: Ref<string>,
  enabled?: Ref<boolean>,
) {
  const strapi = useStrapiClient();
  const on = computed(() => (enabled ? enabled.value : true));

  return useAsyncData<Article | null>(
    computed(() =>
      on.value ? `article-${locale.value}-${slug.value}` : 'idle:article',
    ),
    () =>
      on.value
        ? strapi.bySlug<Article>('articles', slug.value, {
            locale: locale.value,
          })
        : Promise.resolve(null),
    { watch: [locale, slug, on] },
  );
}
