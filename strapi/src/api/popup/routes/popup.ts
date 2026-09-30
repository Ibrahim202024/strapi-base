import { factories } from '@strapi/strapi';
export default factories.createCoreRouter('api::popup.popup', {
  config: {
    find: {
      middlewares: ['api::popup.popup-populate'],
    },
  },
});
