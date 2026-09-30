/**
 * Redirect middleware � reads from Strapi ``redirection`` collection.
 *
 * Runs on every server request. Looks up the request path in the cached
 * redirections list and sends a 301 or 302 as configured.
 *
 * The list is cached in-process for 60 seconds to avoid a Strapi call on
 * every page load. It is invalidated by the webhook handler.
 */
import { createStrapiClient } from '#shared/lib/strapi';
import type { Redirection } from '#shared/types/strapi';

// In-process cache � shared across requests on the same server instance.
let cache: Redirection[] | null = null;
let cacheExpiry = 0;
const CACHE_TTL = 60_000; // 60 s

async function getRedirections(): Promise<Redirection[]> {
  if (cache && Date.now() < cacheExpiry) return cache;

  try {
    const config = useRuntimeConfig();
    const strapi = createStrapiClient(
      config.public.strapiUrl as string,
      config.strapiApiToken as string | undefined
    );
    const items = await strapi.collection<Redirection>('redirections');
    cache = items;
    cacheExpiry = Date.now() + CACHE_TTL;
    return items;
  } catch {
    // If Strapi is unreachable, return empty � do not crash the site.
    return cache ?? [];
  }
}

/** Call this from the webhook handler to force an immediate refresh. */
export function invalidateRedirectCache() {
  cache = null;
  cacheExpiry = 0;
}

export default defineEventHandler(async (event) => {
  // Only handle GET/HEAD � POST etc. are API calls, not navigations.
  if (!['GET', 'HEAD'].includes(event.method)) return;

  // Skip Nuxt internals and API routes.
  const url = event.path ?? getRequestURL(event).pathname;
  if (url.startsWith('/_nuxt') || url.startsWith('/api/') || url.startsWith('/__')) return;

  const redirections = await getRedirections();

  // Match on `from` first (new field), fall back to `source` (old field).
  const match = redirections.find((r) => {
    const from = r.from ?? r.source ?? '';
    return from === url || from === url.replace(/\/$/, '');
  });

  if (!match) return;

  const to = match.to ?? match.destination ?? '/';
  const code = match.status_code === 'code_302' ? 302 : 301;
  return sendRedirect(event, to, code);
});
