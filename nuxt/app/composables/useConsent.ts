/**
 * Consent state composable.
 *
 * Reads the consent state set by CookieBanner.vue.
 * Tracking scripts should check this before loading.
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

export function useConsent() {
  const consent = useState<ConsentState>('consent', () => ({ ...DEFAULT_CONSENT }));

  const hasAnalytics = computed(() => consent.value.analytics);
  const hasMarketing = computed(() => consent.value.marketing);
  const hasDecided = computed(() => consent.value.decided);

  return { consent, hasAnalytics, hasMarketing, hasDecided };
}
