<script setup lang="ts">
/**
 * Cookie consent banner.
 *
 * State is persisted in localStorage as JSON under 'neop-consent'.
 * Tracking composables read this state before injecting scripts.
 */

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decided: boolean;
};

const DEFAULT_CONSENT: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  decided: false,
};

const consent = useState<ConsentState>('consent', () => ({ ...DEFAULT_CONSENT }));
const bannerVisible = ref(false);

onMounted(() => {
  try {
    const stored = localStorage.getItem('neop-consent');
    if (stored) {
      const parsed = JSON.parse(stored) as ConsentState;
      consent.value = { ...DEFAULT_CONSENT, ...parsed };
    }
  } catch {}
  bannerVisible.value = !consent.value.decided;
});

function saveConsent(state: Partial<ConsentState>) {
  consent.value = { ...consent.value, ...state, necessary: true, decided: true };
  try {
    localStorage.setItem('neop-consent', JSON.stringify(consent.value));
  } catch {}
  bannerVisible.value = false;
  // Emit to tracking layer
  window.dispatchEvent(new CustomEvent('neop:consent', { detail: consent.value }));
}

function acceptAll() { saveConsent({ analytics: true, marketing: true }); }
function acceptNecessary() { saveConsent({ analytics: false, marketing: false }); }
</script>

<template>
  <Transition name="cookie-banner">
    <div
      v-if="bannerVisible"
      class="fixed bottom-4 start-4 end-4 md:start-auto md:end-6 md:max-w-md z-50 rounded-xl bg-neutral-900 border border-neutral-700 p-5 shadow-2xl"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
    >
      <p class="text-sm text-neutral-300 mb-4">
        We use cookies to improve your experience. Analytics and marketing
        cookies are optional.
      </p>
      <div class="flex gap-2 flex-wrap">
        <button
          class="flex-1 rounded-lg bg-white text-black text-sm font-semibold py-2 px-4 hover:bg-neutral-200 transition-colors"
          @click="acceptAll"
        >
          Accept All
        </button>
        <button
          class="flex-1 rounded-lg border border-neutral-600 text-neutral-300 text-sm py-2 px-4 hover:border-neutral-400 transition-colors"
          @click="acceptNecessary"
        >
          Necessary Only
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.cookie-banner-enter-from,
.cookie-banner-leave-to {
  opacity: 0;
  transform: translateY(1rem);
}
</style>
