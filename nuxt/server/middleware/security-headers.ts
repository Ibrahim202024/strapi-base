export default defineEventHandler((event) => {
  const url = getRequestURL(event);
  const referer = getRequestHeader(event, 'referer') ?? '';
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';

  // Allow Strapi admin to embed pages in an iframe (preview panel).
  // This covers both /preview/* (draft mode) and public pages (published mode).
  if (url.pathname.startsWith('/preview') || referer.startsWith(strapiUrl)) {
    setResponseHeader(event, 'Content-Security-Policy', `frame-ancestors 'self' ${strapiUrl}`);
  } else {
    setResponseHeader(event, 'X-Frame-Options', 'SAMEORIGIN');
  }

  setResponseHeader(event, 'X-Content-Type-Options', 'nosniff');
  setResponseHeader(event, 'Referrer-Policy', 'strict-origin-when-cross-origin');
  setResponseHeader(event, 'Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    setResponseHeader(event, 'Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
});
