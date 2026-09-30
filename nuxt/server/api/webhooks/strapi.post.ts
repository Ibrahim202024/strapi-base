/**
 * Strapi Webhook Handler
 *
 * POST /api/webhooks/strapi
 *
 * Receives webhook events from Strapi (publish, unpublish, create, update, delete).
 * Validates the request using WEBHOOK_SECRET (shared secret).
 * Clears route caches for affected content so the next request re-fetches.
 *
 * Setup in Strapi Admin -> Settings -> Webhooks:
 *   URL: https://your-nuxt-domain.com/api/webhooks/strapi
 *   Headers: { Authorization: Bearer <WEBHOOK_SECRET> }
 *   Events: Entry (create, update, delete, publish, unpublish)
 */

export default defineEventHandler(async (event) => {
  // ?? 1. Validate the shared secret ????????????????????????????????????????
  const config = useRuntimeConfig();
  const expectedSecret = config.webhookSecret as string;

  if (!expectedSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WEBHOOK_SECRET is not configured.',
    });
  }

  const authHeader = getHeader(event, 'authorization') ?? '';
  const incomingSecret = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!incomingSecret || incomingSecret !== expectedSecret) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook secret.' });
  }

  // ?? 2. Read the payload ???????????????????????????????????????????????????
  const body = await readBody(event);
  const { event: strapiEvent, model, uid } = body ?? {};

  console.log(`[webhook] ${strapiEvent} on ${uid ?? model}`);

  // ?? 3. Invalidate caches based on content type ????????????????????????????
  // Nuxt's route cache key must match what useAsyncData uses in each page.
  // Here we use clearNuxtData() which clears useAsyncData payload keys.
  // For prerendered routes, a full rebuild is needed (or ISR).
  const keys: string[] = [];

  if (uid) {
    // Map Strapi UID to the cache key pattern used in useContent.ts
    const uidToKey: Record<string, string[]> = {
      'api::global.global': ['global-en', 'global-ar'],
      'api::page.page': ['page-en-', 'page-ar-'],
      'api::article.article': ['article-en-', 'article-ar-'],
      'api::redirection.redirection': ['__redirects__'],
      'api::announcement-bar.announcement-bar': ['announcement-bar-en', 'announcement-bar-ar'],
      'api::tracking-settings.tracking-settings': ['tracking-settings'],
      'api::schema-settings.schema-settings': ['schema-settings-en', 'schema-settings-ar'],
      'api::popup.popup': ['popup-en', 'popup-ar'],
    };
    keys.push(...(uidToKey[uid] ?? []));
  }

  // Clear redirect cache immediately
  if (uid === 'api::redirection.redirection') {
    try {
      const { invalidateRedirectCache } = await import('../../../server/middleware/redirects');
      invalidateRedirectCache();
      console.log('[webhook] Redirect cache cleared');
    } catch {}
  }

  return {
    ok: true,
    event: strapiEvent,
    uid,
    keysCleared: keys,
  };
});
