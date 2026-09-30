<script setup lang="ts">
/**
 * Shop index stub — for architecture verification only.
 * This page validates that a future Shop module can register routes
 * through the module system without modifying Core.
 */
const route = useRoute();
assertLocale(String(route.params.locale));

const locale = useLocale();
const { data: global } = await useGlobal(locale);

useNeopSeo({
  seo: computed(() => ({ metaTitle: 'Shop' })),
  global,
  locale,
});
</script>

<template>
  <div class="relative overflow-hidden pt-40 pb-20">
    <Container class="relative z-10">
      <Heading data-reveal>Shop</Heading>
      <p class="text-muted mt-8 text-center">
        Shop module coming soon.
      </p>
    </Container>
  </div>
</template>
