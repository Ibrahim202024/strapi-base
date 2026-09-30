<script setup lang="ts">
import type { Popup } from '#shared/types/strapi';

/**
 * Popup overlay — renders the Strapi `popup` single type.
 *
 * Trigger modes:
 *   - on_load:        show immediately when page loads
 *   - on_delay:       show after `delay_seconds` seconds
 *   - on_scroll:      show when the user scrolls past 50% of the page
 *   - on_exit_intent: show when the cursor leaves the viewport (desktop only)
 *
 * Display frequency controls how often a visitor sees the popup:
 *   - every_visit:      always show
 *   - once_per_session: suppress for the rest of the browser session
 *   - once_ever:        suppress permanently via localStorage
 *
 * Date-range filtering and the `enabled` flag are checked before any trigger
 * activates, so content authors have full scheduling control from Strapi.
 */

const props = defineProps<{
  data?: Popup | null;
}>();

const visible = ref(false);
const triggered = ref(false);

/** Has this popup already been shown, per the display_frequency setting? */
function alreadySeen(freq: Popup['display_frequency']): boolean {
  if (freq === 'every_visit') return false;
  if (freq === 'once_per_session') return sessionStorage.getItem('neop-popup-seen') === '1';
  if (freq === 'once_ever') return localStorage.getItem('neop-popup-seen') === '1';
  return false;
}

function markSeen(freq: Popup['display_frequency']) {
  if (freq === 'once_per_session') sessionStorage.setItem('neop-popup-seen', '1');
  if (freq === 'once_ever') localStorage.setItem('neop-popup-seen', '1');
}

/** Whether the popup is within its configured date range. */
function inDateRange(d: Popup): boolean {
  const now = Date.now();
  if (d.start_date && new Date(d.start_date).getTime() > now) return false;
  if (d.end_date && new Date(d.end_date).getTime() < now) return false;
  return true;
}

function show() {
  if (triggered.value) return;
  triggered.value = true;
  visible.value = true;
}

function close() {
  visible.value = false;
  if (props.data) markSeen(props.data.display_frequency);
}

onMounted(() => {
  const d = props.data;
  if (!d?.enabled) return;
  if (!inDateRange(d)) return;
  if (alreadySeen(d.display_frequency)) return;

  switch (d.trigger) {
    case 'on_load':
      show();
      break;

    case 'on_delay':
      setTimeout(show, (d.delay_seconds ?? 3) * 1000);
      break;

    case 'on_scroll': {
      const onScroll = () => {
        const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        if (scrollPct >= 0.5) {
          show();
          window.removeEventListener('scroll', onScroll);
        }
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      break;
    }

    case 'on_exit_intent': {
      const onLeave = (e: MouseEvent) => {
        if (e.clientY <= 0) {
          show();
          document.removeEventListener('mouseout', onLeave);
        }
      };
      document.addEventListener('mouseout', onLeave);
      break;
    }
  }
});

const strapiUrl = useStrapiUrl();
</script>

<template>
  <Teleport to="body">
    <Transition name="popup">
      <div
        v-if="visible"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-label="data?.title ?? 'Popup'"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="close"
        />

        <!-- Panel -->
        <div
          class="popup-panel relative z-10 w-full max-w-md rounded-2xl border border-neutral-700 bg-neutral-900/95 p-6 shadow-2xl backdrop-blur-lg"
        >
          <!-- Close button -->
          <button
            class="absolute end-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            aria-label="Close popup"
            @click="close"
          >
            &#x2715;
          </button>

          <!-- Image -->
          <img
            v-if="data?.image?.url"
            :src="data.image.url.startsWith('/') ? `${strapiUrl}${data.image.url}` : data.image.url"
            :alt="data.image.alternativeText ?? data.title ?? ''"
            class="mb-4 w-full rounded-lg object-cover"
            loading="lazy"
          />

          <!-- Title -->
          <h2
            v-if="data?.title"
            class="mb-2 text-xl font-bold text-white"
          >
            {{ data.title }}
          </h2>

          <!-- Content -->
          <p
            v-if="data?.content"
            class="mb-5 text-sm leading-relaxed text-neutral-300"
          >
            {{ data.content }}
          </p>

          <!-- CTA -->
          <a
            v-if="data?.cta_url && data?.cta_text"
            :href="data.cta_url"
            class="inline-block w-full rounded-lg bg-white px-5 py-2.5 text-center text-sm font-semibold text-black transition-colors hover:bg-neutral-200"
            @click="close"
          >
            {{ data.cta_text }}
          </a>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-enter-active,
.popup-leave-active {
  transition: opacity 0.3s ease;
}
.popup-enter-active .popup-panel,
.popup-leave-active .popup-panel {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
}
.popup-enter-from .popup-panel {
  opacity: 0;
  transform: scale(0.95) translateY(0.5rem);
}
.popup-leave-to .popup-panel {
  opacity: 0;
  transform: scale(0.95) translateY(0.5rem);
}
</style>
