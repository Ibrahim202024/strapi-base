import { DEFAULT_LOCALE, type Locale, isLocale, localeDir } from '#shared/lib/i18n';

/**
 * The current locale, read from the `[locale]` route param.
 *
 * Every page under `pages/[locale]/` has it; anything else falls back to the
 * default. Returned as a computed so it survives client-side navigation
 * between locales.
 */
export function useLocale() {
  const route = useRoute();
  return computed<Locale>(() => {
    const value = route.params.locale;
    const raw = Array.isArray(value) ? value[0] : value;
    return isLocale(raw) ? raw : DEFAULT_LOCALE;
  });
}

/**
 * The `dir` attribute value for the current locale.
 * Returns 'rtl' for Arabic, 'ltr' for everything else.
 */
export function useDir() {
  const locale = useLocale();
  return computed(() => localeDir(locale.value));
}

/**
 * Rejects an unknown `[locale]` with a 404 instead of rendering a page with
 * empty content. Without it `/de/blog` would fetch nothing from Strapi and
 * render an empty shell with a 200.
 */
export function assertLocale(locale: string): void {
  if (!isLocale(locale)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Page not found',
      fatal: true,
    });
  }
}
