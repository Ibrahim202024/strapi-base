<script setup lang="ts">
/*
 * CMS-driven pages: /pricing, /contact, /faq and anything else an editor adds.
 *
 * `homepage` is excluded because it renders at the locale root instead â€”
 * without this, `/en/homepage` would be a second copy of the front page.
 *
 * Static route files (`sign-in.vue`, `blog/`) take precedence over
 * this one in Nuxt's router, so those never fall through to here.
 */
const route = useRoute();
assertLocale(String(route.params.locale));

const locale = useLocale();
const slug = computed(() => String(route.params.slug));

// homepage is now served at its own localized slug (e.g. /en/home)

const { data: page } = await useCmsPage(locale, slug);

if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page not found',
    fatal: true,
  });
}

const { data: global } = await useGlobal(locale);
const siteUrl = useRuntimeConfig().public.siteUrl as string;

useNeopSeo({
  seo: computed(() => page.value?.seo),
  global,
  locale,
});

// Structured data
useJsonLdWebPage({
  title: computed(() => page.value?.seo?.metaTitle ?? slug.value),
  description: computed(() => page.value?.seo?.metaDescription ?? null),
  url: computed(() => `${siteUrl}/${locale.value}/${slug.value}`),
  locale,
});

useJsonLdBreadcrumb(
  computed(() => [
    { name: 'Home', url: `${siteUrl}/${locale.value}` },
    { name: page.value?.seo?.metaTitle ?? slug.value, url: `${siteUrl}/${locale.value}/${slug.value}` },
  ]),
);
</script>

<template>
  <DynamicZone :zone="page?.dynamic_zone" :locale="locale" />
</template>
