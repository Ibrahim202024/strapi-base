import type { Core } from '@strapi/strapi';

/**
 * Strapi lifecycle hooks � Neop Website Starter.
 */
export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await ensureApiToken(strapi);
  },
};

/**
 * Auto-creates a read-only API token called 'Nuxt Frontend' on first startup.
 *
 * The token is printed to the console so the developer can copy it into
 * nuxt/.env as STRAPI_API_TOKEN. On subsequent startups, if the token
 * already exists, this is a no-op.
 *
 * The token has no expiry and type 'read-only' � it cannot write data.
 */
async function ensureApiToken(strapi: Core.Strapi) {
  try {
    const TOKEN_NAME = 'Nuxt Frontend (Neop Auto)';

    const existing = await strapi.db
      .query('admin::api-token')
      .findOne({ where: { name: TOKEN_NAME } });

    if (existing) return; // Token already created on a previous start.

    const token = await (strapi as any)
      .service('admin::api-token')
      .create({
        name: TOKEN_NAME,
        description: 'Auto-generated read-only token for the Nuxt frontend.',
        type: 'read-only',
        lifespan: null, // No expiry
      });

    console.log('');
    console.log('???????????????????????????????????????????????????????????');
    console.log(' Neop � Strapi API Token Created');
    console.log(' Copy this value into nuxt/.env as STRAPI_API_TOKEN:');
    console.log('');
    console.log(' ' + token.accessKey);
    console.log('');
    console.log(' (This message only appears once.)');
    console.log('???????????????????????????????????????????????????????????');
    console.log('');
  } catch (err) {
    // Non-fatal � token creation may fail if the admin is not yet set up.
    // The developer can create the token manually in Strapi Admin.
    console.warn('[Neop] Could not auto-create API token:', (err as Error).message);
  }
}
