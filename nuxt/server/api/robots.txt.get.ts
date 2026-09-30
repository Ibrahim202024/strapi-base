/**
 * Dynamic robots.txt
 *
 * GET /robots.txt (routed via routeRules in nuxt.config.ts)
 *
 * - In production: allow all crawlers, point to sitemap.
 * - On non-production (NODE_ENV != 'production'): disallow all.
 */
export default defineEventHandler((event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600');

  const config = useRuntimeConfig();
  const siteUrl = (config.public.siteUrl as string).replace(/\/$/, '');
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    return [
      '# Non-production environment � all crawlers blocked.',
      'User-agent: *',
      'Disallow: /',
    ].join('\n');
  }

  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# Block Strapi admin and API from indexing',
    'Disallow: /api/',
    'Disallow: /preview/',
    '',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n');
});
