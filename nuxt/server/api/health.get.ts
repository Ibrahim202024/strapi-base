/**
 * Health check endpoint — GET /api/health
 *
 * Returns a 200 JSON response with uptime, timestamp, and a Strapi
 * connectivity check. Used by load balancers, monitoring, and deploy
 * scripts to verify the Nuxt server is alive and can reach Strapi.
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl as string;

  let strapiOk = false;
  try {
    const resp = await fetch(`${strapiUrl}/_health`, {
      signal: AbortSignal.timeout(3000),
    });
    strapiOk = resp.ok;
  } catch {
    strapiOk = false;
  }

  return {
    status: strapiOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    strapi: strapiOk ? 'reachable' : 'unreachable',
  };
});
