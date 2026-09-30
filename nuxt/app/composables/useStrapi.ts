import { createStrapiClient } from '#shared/lib/strapi';

/**
 * The Strapi client, bound to the configured backend URL.
 *
 * Pages call this inside `useAsyncData`, so it runs at build time for the
 * prerendered routes and the result is embedded in the payload � the browser
 * never repeats the request. Draft reads deliberately do *not* go through
 * here; they live behind `/api/preview-content` on the server, because the
 * cookie that authorises them is HttpOnly.
 *
 * The `strapiApiToken` is a private runtimeConfig value � it is NEVER
 * serialised into the client bundle or sent to the browser.
 */
export function useStrapiClient() {
  const config = useRuntimeConfig();
  return createStrapiClient(config.public.strapiUrl, config.strapiApiToken as string | undefined);
}

/** The Strapi origin, for building media URLs in components. */
export function useStrapiUrl(): string {
  return useRuntimeConfig().public.strapiUrl;
}
