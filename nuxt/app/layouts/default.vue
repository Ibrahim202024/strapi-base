<script setup lang="ts">
import { localeDir } from '#shared/lib/i18n';

/**
 * Page shell: navbar, announcement bar, footer, cookie banner, and preview plumbing.
 *
 * The layout fetches `global` itself rather than taking it as a prop. Nuxt
 * layouts sit above the page in the tree, so a prop would have to travel
 * upwards; instead both call `useGlobal()` with the same key and `useAsyncData`
 * collapses them into a single request.
 *
 * `dir` is set dynamically so Arabic pages render RTL without any extra code
 * in individual pages.
 */
const route = useRoute();
const locale = useLocale();
const dir = computed(() => localeDir(locale.value));

const { data: global } = await useGlobal(locale);
const { data: announcementBar } = await useAnnouncementBar(locale);
const { data: popup } = await usePopup(locale);
const { data: trackingSettings } = await useTrackingSettings();
const { data: schemaSettings } = await useSchemaSettings(locale);

/*
 * Resolved here, not in the page: the navbar renders before the page's <slot>
 * during SSR, so anything the page published would arrive too late.
 */
const localizedPaths = useRouteLocalizedPaths();

const isDraftMode = computed(() => route.path.startsWith('/preview'));

// --- Structured Data (JSON-LD) ---
const strapiUrl = useStrapiUrl();
const siteUrl = useRuntimeConfig().public.siteUrl as string;

// Organization / LocalBusiness — from SchemaSettings
useJsonLdOrganization(computed(() => schemaSettings.value), strapiUrl);

// WebSite — from SchemaSettings business name
useJsonLdWebSite({
  name: computed(() => schemaSettings.value?.business_name ?? null),
  url: siteUrl,
  locale,
});

// Activate tracking on client after consent
if (import.meta.client) {
  useTracking(trackingSettings.value);
}
</script>

<template>
  <div :dir="dir" class="bg-charcoal h-full w-full antialiased">
    <PreviewBridge />
    <AnnouncementBar :data="announcementBar" />
    <Navbar
      :data="global?.navbar"
      :locale="locale"
      :localized-paths="localizedPaths"
    />
    <main id="main-content">
      <slot />
    </main>
    <Footer :data="global?.footer" :locale="locale" />
    <DraftModeBanner v-if="isDraftMode" />
    <CookieBanner />
    <Popup :data="popup" />
  </div>
</template>
