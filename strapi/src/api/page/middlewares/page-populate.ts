/**
 * `page` middleware
 */
import type { Core } from '@strapi/strapi';

const populate = {
  localizations: true,
  dynamic_zone: {
    on: {
      'dynamic-zone.hero': {
        populate: {
          CTAs: true,
        },
      },
      'dynamic-zone.testimonials': {
        populate: {
          testimonials: {
            populate: {
              user: {
                populate: {
                  image: true,
                },
              },
            },
          },
        },
      },
      'dynamic-zone.how-it-works': {
        populate: {
          steps: true,
        },
      },
      'dynamic-zone.cta': {
        populate: {
          CTAs: true,
        },
      },
      'dynamic-zone.faq': {
        populate: {
          faqs: true,
        },
      },
      'dynamic-zone.form-next-to-section': {
        populate: {
          form: {
            populate: {
              inputs: true,
            },
          },
          section: {
            populate: {
              users: {
                populate: {
                  image: true,
                },
              },
            },
          },
          social_media_icon_links: {
            populate: {
              image: true,
              link: true,
            },
          },
        },
      },
      'dynamic-zone.related-articles': {
        populate: {
          articles: true,
        },
      },
    },
  },
  seo: {
    populate: {
      metaImage: true,
    },
  },
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    ctx.query.populate = populate;
    await next();
  };
};
