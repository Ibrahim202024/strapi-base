import path from 'path';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'mysql2');
  const connections = {
    mysql2: {
      connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'neop_strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi_password'),
        ssl: env.bool('DATABASE_SSL', false) && { key: env('DATABASE_SSL_KEY', undefined), cert: env('DATABASE_SSL_CERT', undefined), ca: env('DATABASE_SSL_CA', undefined), rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) },
        charset: 'utf8mb4',
        timezone: 'UTC',
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    mysql: {
      connection: {
        host: env('DATABASE_HOST', '127.0.0.1'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'neop_strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi_password'),
      },
      pool: { min: 2, max: 10 },
    },
    postgres: {
      connection: {
        connectionString: env('DATABASE_URL'),
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'neop_strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi_password'),
        schema: env('DATABASE_SCHEMA', 'public'),
      },
      pool: { min: 2, max: 10 },
    },
    sqlite: {
      connection: { filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')) },
      useNullAsDefault: true,
    },
  };
  return { connection: { client, ...connections[client], acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000) } };
};
