import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::schema-settings.schema-settings', {
  config: {
    find: {
      middlewares: ['api::schema-settings.schema-settings-populate'],
    },
  },
});
