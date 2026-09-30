import type { Core } from '@strapi/strapi';

const populate = {
  "image": true
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    ctx.query.populate = populate;
    await next();
  };
};
