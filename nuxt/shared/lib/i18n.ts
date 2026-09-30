/**
 * Locale configuration � Neop Website Starter.
 *
 * Supports English (LTR) and Arabic (RTL).
 * Routing is plain Nuxt file routes under a `[locale]` segment rather than
 * `@nuxtjs/i18n`: all translated content comes from Strapi, keyed by locale.
 */

export const LOCALES = ['en', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Locales that are written right-to-left. */
export const RTL_LOCALES = new Set<Locale>(['ar']);

/** Returns true when the locale is right-to-left. */
export function isRtl(locale: string): boolean {
  return RTL_LOCALES.has(locale as Locale);
}

/** HTML `dir` attribute value for the given locale. */
export function localeDir(locale: string): 'rtl' | 'ltr' {
  return isRtl(locale) ? 'rtl' : 'ltr';
}

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** `Intl` language tags for the supported locales. */
export const intlTag = (locale: string): string =>
  locale === 'ar' ? 'ar-SA' : 'en-US';

export function formatDate(
  value: string | null | undefined,
  locale: string
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(intlTag(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}


/**
 * Builds the `localizedPaths` map LocaleSwitcher expects.
 *
 * `prefix` is whatever sits between the locale and the slug � `blog` for
 * articles, `products` for products, empty for pages. The current locale is
 * seeded from `slug` because Strapi omits the entry's own locale from its
 * `localizations` list.
 */
export function localizedPaths(
  currentLocale: string,
  slug: string,
  localizations: Array<{ locale: string; slug: string }> | undefined,
  prefix = ''
): Record<string, string> {
  const withPrefix = (value: string) => (prefix ? `${prefix}/${value}` : value);

  return (localizations ?? []).reduce<Record<string, string>>(
    (acc, localization) => {
      acc[localization.locale] = withPrefix(localization.slug);
      return acc;
    },
    { [currentLocale]: withPrefix(slug) }
  );
}
