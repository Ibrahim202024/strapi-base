<script setup lang="ts">
const route = useRoute();
assertLocale(String(route.params.locale));

const locale = useLocale();
const slug = computed(() => String(route.params.slug));

const { data: article } = await useArticle(locale, slug);

if (!article.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Article not found',
    fatal: true,
  });
}

const { data: global } = await useGlobal(locale);
const { data: schemaSettings } = await useSchemaSettings(locale);
const strapiUrl = useStrapiUrl();
const siteUrl = useRuntimeConfig().public.siteUrl as string;

useNeopSeo({
  seo: computed(() => article.value?.seo),
  global,
  locale,
});

// Article JSON-LD (Blog module's own schema)
useJsonLdArticle({
  article: computed(() => article.value),
  url: computed(() => `${siteUrl}/${locale.value}/blog/${slug.value}`),
  locale,
  strapiUrl,
  publisherName: computed(() => schemaSettings.value?.business_name ?? null),
});

// Breadcrumb
useJsonLdBreadcrumb(
  computed(() => [
    { name: 'Home', url: `${siteUrl}/${locale.value}` },
    { name: 'Blog', url: `${siteUrl}/${locale.value}/blog` },
    { name: article.value?.title ?? slug.value, url: `${siteUrl}/${locale.value}/blog/${slug.value}` },
  ]),
);
</script>

<template>
  <ArticleView v-if="article" :article="article" :locale="locale" />
</template>
