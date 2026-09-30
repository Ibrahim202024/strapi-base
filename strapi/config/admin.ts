const getPreviewPathname = (uid, { locale, document }): string | null => {
  const { slug } = document;

  switch (uid) {
    case 'api::page.page':
      return `/${slug}`;
    case 'api::article.article':
      return `/blog/${slug}`;
    case 'api::blog-page.blog-page':
      return '/blog';
    default:
      return null;
  }
};

export default ({ env }) => {
  const clientUrl = env('CLIENT_URL', 'http://localhost:3001');

  const allowedOrigins = Array.from(
    new Set([
      clientUrl,
      'http://localhost:3001',
    ]),
  );
  const previewSecret = env('PREVIEW_SECRET');

  return {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
    apiToken: {
      salt: env('API_TOKEN_SALT'),
    },
    transfer: {
      token: {
        salt: env('TRANSFER_TOKEN_SALT'),
      },
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
    preview: {
      enabled: true,
      config: {
        allowedOrigins,
        async handler(uid, { documentId, locale, status }) {
          const document = await strapi
            .documents(uid)
            .findOne({ documentId, locale, status });
          const pathname = getPreviewPathname(uid, { locale, document });

          if (!pathname) {
            return null;
          }

          // URLSearchParams handles encoding — do NOT use encodeURI() here,
          // otherwise Arabic slugs get double-encoded.
          const urlSearchParams = new URLSearchParams({
            url: `/${locale ?? 'en'}${pathname}`,
            secret: previewSecret,
            status,
          });

          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};
