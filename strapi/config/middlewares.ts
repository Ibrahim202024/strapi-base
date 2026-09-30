export default ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          // Allow media from Strapi's own origin and common cloud storage providers.
          'img-src': ["'self'", 'data:', 'blob:', 'https:'],
          'media-src': ["'self'", 'data:', 'blob:', 'https:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      // Restrict to the Nuxt origin. CLIENT_URL is the canonical frontend URL;
      // dev ports are added for local development.
      origin: [
        env('CLIENT_URL', 'http://localhost:3001'),
        'http://localhost:3001',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'strapi-encode-source-maps',
      ],
      keepHeaderOnError: true,
    },
  },
  { name: 'strapi::poweredBy', config: { enabled: false } },
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
