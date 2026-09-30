/**
 * Form submission composable.
 *
 * Submits form data to the Nuxt server route `/api/forms/submit`, which
 * forwards it to Strapi using the server-side API token.
 * The browser never talks to Strapi directly.
 */
export function useFormSubmit(formSlug: string) {
  const submitting = ref(false);
  const success = ref(false);
  const error = ref<string | null>(null);

  async function submit(data: Record<string, unknown>) {
    submitting.value = true;
    success.value = false;
    error.value = null;

    try {
      await $fetch('/api/forms/submit', {
        method: 'POST',
        body: { formSlug, data },
        credentials: 'same-origin',
      });
      success.value = true;
    } catch (err: any) {
      error.value = err?.data?.statusMessage ?? 'Submission failed. Please try again.';
    } finally {
      submitting.value = false;
    }
  }

  return { submit, submitting, success, error };
}
