/**
 * Article JSON-LD for Blog detail pages.
 *
 * Lives inside the Blog module — Core has no dependency on this.
 * Call from the blog article page component.
 */
import type { Article, SchemaSettings } from '#shared/types/strapi';
import { strapiMedia } from '#shared/lib/media';

export function useJsonLdArticle(options: {
  article: Ref<Article | null | undefined>;
  url: Ref<string>;
  locale: Ref<string>;
  strapiUrl: string;
  /** Organization name from SchemaSettings, for publisher. */
  publisherName?: Ref<string | null | undefined>;
  publisherLogo?: Ref<string | null | undefined>;
}) {
  const jsonLd = computed(() => {
    const a = options.article.value;
    if (!a) return null;

    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: a.title,
      description: a.description,
      url: options.url.value,
      inLanguage: options.locale.value,
      datePublished: a.publishedAt,
    };

    if (a.image?.url) {
      schema.image = strapiMedia(a.image.url, options.strapiUrl);
    }

    const publisherName = options.publisherName?.value;
    if (publisherName) {
      const publisher: Record<string, unknown> = {
        '@type': 'Organization',
        name: publisherName,
      };
      if (options.publisherLogo?.value) {
        publisher.logo = options.publisherLogo.value;
      }
      schema.publisher = publisher;
    }

    return JSON.parse(JSON.stringify(schema));
  });

  useHead({
    script: computed(() =>
      jsonLd.value
        ? [
            {
              type: 'application/ld+json',
              key: 'neop-article-schema',
              innerHTML: JSON.stringify(jsonLd.value),
            },
          ]
        : [],
    ),
  });
}
