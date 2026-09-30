/**
 * Data Layer / Conversion Events � Neop Website Starter.
 *
 * Pushes standard events to window.dataLayer (GTM).
 * Extend this with project-specific events without modifying core tracking.
 */

type EventName =
  | 'page_view'
  | 'form_submit'
  | 'contact_click'
  | 'phone_click'
  | 'whatsapp_click'
  | 'email_click'
  | 'cta_click'
  | 'lead_submit';

export function useDataLayer() {
  function push(event: EventName, params?: Record<string, unknown>) {
    if (!import.meta.client) return;
    const dl = ((window as any).dataLayer ??= []);
    dl.push({ event, ...params });
  }

  return {
    push,
    pageView: (params?: Record<string, unknown>) => push('page_view', params),
    formSubmit: (formName: string, extra?: Record<string, unknown>) =>
      push('form_submit', { form_name: formName, ...extra }),
    ctaClick: (label: string, url?: string) =>
      push('cta_click', { cta_label: label, cta_url: url }),
    phoneClick: (phone: string) => push('phone_click', { phone }),
    whatsappClick: (phone: string) => push('whatsapp_click', { phone }),
    emailClick: (email: string) => push('email_click', { email }),
    leadSubmit: (formName: string, extra?: Record<string, unknown>) =>
      push('lead_submit', { form_name: formName, ...extra }),
  };
}
