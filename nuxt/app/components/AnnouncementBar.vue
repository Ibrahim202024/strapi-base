<script setup lang="ts">
import type { AnnouncementBar } from '#shared/types/strapi';

const props = defineProps<{
  data?: AnnouncementBar | null;
}>();

// Check dismissal state in localStorage (client-only)
const dismissed = ref(false);
onMounted(() => {
  dismissed.value = localStorage.getItem('neop-bar-dismissed') === '1';
});

function dismiss() {
  dismissed.value = true;
  localStorage.setItem('neop-bar-dismissed', '1');
}

// Compute visibility: enabled, within date range, not dismissed
const visible = computed(() => {
  const d = props.data;
  if (!d?.enabled || dismissed.value) return false;
  const now = Date.now();
  if (d.start_date && new Date(d.start_date).getTime() > now) return false;
  if (d.end_date && new Date(d.end_date).getTime() < now) return false;
  return true;
});
</script>

<template>
  <div
    v-if="visible"
    class="relative flex items-center justify-center gap-3 px-4 py-2 text-sm text-center"
    :style="{
      backgroundColor: data?.background_color ?? '#1a1a2e',
      color: data?.text_color ?? '#ffffff',
    }"
    role="banner"
    aria-label="Announcement"
  >
    <span>{{ data?.message }}</span>
    <a
      v-if="data?.link_url"
      :href="data.link_url"
      class="underline font-semibold hover:opacity-80 transition-opacity"
    >
      {{ data?.link_text ?? 'Learn more' }}
    </a>
    <button
      v-if="data?.dismissible !== false"
      class="absolute end-3 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition-opacity"
      aria-label="Dismiss announcement"
      @click="dismiss"
    >
      &#x2715;
    </button>
  </div>
</template>
