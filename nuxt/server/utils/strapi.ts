import { createStrapiClient } from '#shared/lib/strapi';

/**
 * The Strapi client for Nitro server routes.
 *
 * Auto-imported into every server route (Nitro picks up `server/utils`).
 * Passes the read-only API token from private runtimeConfig.
 *
 * The token is NEVER sent to the browser � it only travels between the
 * Nuxt server process and the Strapi process.
 */
export function useStrapi() {
  const config = useRuntimeConfig();
  return createStrapiClient(
    config.public.strapiUrl,
    config.strapiApiToken as string | undefined
  );
}

/** The Strapi origin, for the auth helpers that build their own URLs. */
export function strapiBaseUrl(): string {
  return useRuntimeConfig().public.strapiUrl;
}
