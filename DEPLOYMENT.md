# Deployment Guide

## Quick Reference

| Method | When |
|--------|------|
| `docker compose up` | VPS / single server |
| PM2 + ecosystem.config.cjs | VPS without Docker |

## Pre-deployment Checklist

1. Configure module system in `nuxt/neop.config.ts` (and mirror in `shared/module-defs/config.ts`)
2. Set all required environment variables
3. Build Strapi: `cd strapi && yarn build`
4. Build Nuxt: `cd nuxt && yarn build`
5. Seed demo data (optional): `yarn seed`
6. Create Strapi admin account on first startup

## Required Production Variables

**strapi/.env**
```
DATABASE_CLIENT=mysql2
DATABASE_HOST=<rds-or-cloud-db-host>
DATABASE_NAME=neop_strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=<strong>
DATABASE_SSL=true
CLIENT_URL=https://your-domain.com
PREVIEW_SECRET=<32-char-random>
APP_KEYS=<key1>,<key2>
ADMIN_JWT_SECRET=<32-char>
API_TOKEN_SALT=<32-char>
TRANSFER_TOKEN_SALT=<32-char>
JWT_SECRET=<32-char>
```

**nuxt/.env**
```
STRAPI_URL=https://cms.your-domain.com
STRAPI_API_TOKEN=<read-only-token>
PREVIEW_SECRET=<same-as-strapi>
SESSION_SECRET=<48-char>
WEBHOOK_SECRET=<32-char>
WEBSITE_URL=https://your-domain.com
```

### Build-time vs Runtime Variables

| Variable | When it's read | Where |
|----------|---------------|-------|
| `neop.config.ts` modules | Build time | `nuxt/neop.config.ts` |
| `STRAPI_URL` | Runtime | `nuxt/.env` |
| `STRAPI_API_TOKEN` | Runtime | `nuxt/.env` |
| `WEBSITE_URL` | Runtime | `nuxt/.env` |
| `SESSION_SECRET` | Runtime | `nuxt/.env` |
| Database vars | Runtime | `strapi/.env` |

## Docker Compose

```bash
docker compose build
docker compose up -d
docker compose logs strapi | grep 'STRAPI_API_TOKEN'
# Copy token to nuxt/.env, then:
docker compose restart nuxt
```

## PM2

```bash
cd strapi && yarn build && cd ..
cd nuxt && yarn build && cd ..
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup
```

## Nginx Example

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
server {
    listen 443 ssl http2;
    server_name cms.your-domain.com;
    location / {
        proxy_pass http://localhost:1337;
        proxy_set_header Host $host;
    }
}
```

## Webhooks

Strapi Admin → Settings → Webhooks:
- URL: `https://your-domain.com/api/webhooks/strapi`
- Headers: `Authorization: Bearer <WEBHOOK_SECRET>`
- Events: Entry (create, update, delete, publish, unpublish)

## Health Check

```bash
curl https://your-domain.com/api/health
# Expected: { "status": "ok", "strapi": "connected" }
```