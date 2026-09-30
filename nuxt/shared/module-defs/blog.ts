/**
 * Blog Module Definition
 *
 * Describes the blog module's capabilities: route matching, content fetching
 * for locale switching, and sitemap URL generation.
 */
import type { ModuleDefinition, SitemapUrl } from '../modules';

export const blogModule: ModuleDefinition = {
  name: 'blog',

  reservedSegments: ['blog'],

  matchRoute(segments: string[]) {
    // /[locale]/blog/[slug] — only detail pages need locale resolution
    if (segments[1] === 'blog' && segments[2]) {
      return { kind: 'article', slug: segments[2], prefix: 'blog' };
    }
    return null;
  },

  contentFetcher: {
    collection: 'articles',
    pathPrefix: 'blog',
  },

  async sitemapProvider(strapi, siteUrl) {
    type SitemapArticle = {
      slug: string;
      locale: string;
      publishedAt: string;
      seo?: { metaRobots?: string } | null;
      localizations?: Array<{ locale: string; slug: string }>;
    };

    const articles = await strapi.collection<SitemapArticle>('articles', {
      locale: 'all' as unknown as string,
      sort: 'publishedAt:desc',
    });

    const urls: SitemapUrl[] = [];

    for (const article of articles) {
      const noindex = article.seo?.metaRobots?.includes('noindex');
      if (noindex) continue;

      urls.push({
        loc: `${siteUrl}/${article.locale}/blog/${article.slug}`,
        lastmod: article.publishedAt,
        alternates: article.localizations?.reduce<Record<string, string>>(
          (acc, l) => {
            acc[l.locale] = `${siteUrl}/${l.locale}/blog/${l.slug}`;
            return acc;
          },
          {
            [article.locale]: `${siteUrl}/${article.locale}/blog/${article.slug}`,
          },
        ),
      });
    }

    return urls;
  },
};
