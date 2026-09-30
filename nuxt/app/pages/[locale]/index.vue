<script setup lang="ts">
/**
 * Locale root → redirect to the localized homepage slug.
 *
 * The actual homepage content lives at /en/home (or /ar/الرئيسية),
 * served by [slug].vue. This page just redirects so `/en` and `/ar`
 * don't 404.
 */
const route = useRoute();
assertLocale(String(route.params.locale));

const locale = useLocale();

const HOMEPAGE_SLUGS: Record<string, string> = { en: 'home', ar: 'الرئيسية' };

await navigateTo(`/${locale.value}/${HOMEPAGE_SLUGS[locale.value] ?? 'home'}`, { redirectCode: 301 });
</script>

<template>
  <div />
</template>
