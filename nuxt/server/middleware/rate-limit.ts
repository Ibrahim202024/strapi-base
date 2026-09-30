const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;
const store = new Map<string, { count: number; reset: number }>();
setInterval(() => { const now = Date.now(); for (const [k, e] of store) { if (now > e.reset) store.delete(k); } }, 5 * 60_000);

export default defineEventHandler((event) => {
  if (event.method !== 'POST') return;
  const p = event.path ?? '';
  if (!p.startsWith('/api/forms') && !p.startsWith('/api/webhooks')) return;
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown';
  const key = ip + ':' + p.split('/').slice(0, 3).join('/');
  const now = Date.now();
  const entry = store.get(key) ?? { count: 0, reset: now + WINDOW_MS };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + WINDOW_MS; }
  entry.count++;
  store.set(key, entry);
  setResponseHeader(event, 'X-RateLimit-Limit', String(MAX_REQUESTS));
  setResponseHeader(event, 'X-RateLimit-Remaining', String(Math.max(0, MAX_REQUESTS - entry.count)));
  if (entry.count > MAX_REQUESTS) throw createError({ statusCode: 429, statusMessage: 'Too Many Requests. Retry in 60s.' });
});