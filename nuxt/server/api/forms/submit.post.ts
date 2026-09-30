/**
 * Form Submission Endpoint
 *
 * POST /api/forms/submit
 *
 * Receives form data from the browser, validates it, and creates a
 * form-submission entry in Strapi using the server-side API token.
 *
 * The browser never gets a write-capable Strapi token.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { formSlug, data } = body ?? {};

  if (!formSlug || typeof formSlug !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'formSlug is required.' });
  }
  if (!data || typeof data !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'data is required.' });
  }

  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl as string;
  const apiToken = config.strapiApiToken as string | undefined;

  // ?? Find the form by slug ?????????????????????????????????????????????????
  const findUrl = `${strapiUrl}/api/forms?filters[slug][$eq]=${encodeURIComponent(formSlug)}&pagination[limit]=1`;
  const findResp = await fetch(findUrl, {
    headers: apiToken ? { Authorization: `Bearer ${apiToken}` } : {},
  });

  if (!findResp.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Could not reach Strapi.' });
  }

  const { data: forms } = (await findResp.json()) as { data: { documentId: string; store_submissions: boolean }[] };
  const form = forms[0];

  if (!form) {
    throw createError({ statusCode: 404, statusMessage: 'Form not found.' });
  }

  // ?? Store submission if configured ????????????????????????????????????????
  if (form.store_submissions !== false) {
    const sourceUrl = getHeader(event, 'referer') ?? '';
    const ip = getRequestIP(event, { xForwardedFor: true });
    const ua = getHeader(event, 'user-agent') ?? '';

    // Prefer the dedicated write token; fall back to the read token.
    const writeToken = (config.strapiWriteToken as string | undefined) ?? apiToken;

    const submitResp = await fetch(`${strapiUrl}/api/form-submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(writeToken ? { Authorization: `Bearer ${writeToken}` } : {}),
      },
      body: JSON.stringify({
        data: {
          form: form.documentId,
          data,
          source_url: sourceUrl,
          ip_address: ip,
          user_agent: ua,
        },
      }),
    });

    if (!submitResp.ok) {
      console.error(
        `[forms/submit] Strapi returned ${submitResp.status} when creating form-submission for form "${formSlug}".`,
        await submitResp.text().catch(() => ''),
      );
    }
  }

  return { ok: true };
});
