/**
 * Tracking composable — Neop Website Starter.
 *
 * Reads tracking IDs from Strapi's tracking-settings single type,
 * then injects the configured scripts after consent is given.
 *
 * This runs client-side only (scripts are injected into the DOM).
 * The useTrackingSettings() composable fetches from Strapi server-side
 * during SSR so the IDs are available on first paint without a round trip.
 */
import type { TrackingSettings } from '#shared/types/strapi';

function injectScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.src = src;
  s.async = true;
  document.head.appendChild(s);
}

function injectInlineScript(id: string, code: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement('script');
  s.id = id;
  s.innerHTML = code;
  document.head.appendChild(s);
}

export function useTracking(settings: TrackingSettings | null | undefined) {
  const { hasAnalytics, hasMarketing, hasDecided } = useConsent();

  function initGtm(id: string) {
    injectInlineScript('neop-gtm', `
      window.dataLayer = window.dataLayer || [];
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');
    `);
  }

  function initGa4(id: string) {
    injectScript('neop-ga4-script', `https://www.googletagmanager.com/gtag/js?id=${id}`);
    injectInlineScript('neop-ga4-init', `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`);
  }

  function initMetaPixel(id: string) {
    injectInlineScript('neop-meta-pixel', `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`);
  }

  function initSnapchatPixel(id: string) {
    injectInlineScript('neop-snap-pixel', `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init','${id}',{});snaptr('track','PAGE_VIEW');`);
  }

  function initTikTokPixel(id: string) {
    injectInlineScript('neop-tiktok-pixel', `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e+"_"+Date.now()]={pid:e,tag:n};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${id}');ttq.page()}(window,document,'ttq');`);
  }

  function initLinkedInInsight(id: string) {
    injectInlineScript('neop-linkedin-insight', `_linkedin_partner_id="${id}";window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];window._linkedin_data_partner_ids.push(_linkedin_partner_id);`);
    injectScript('neop-linkedin-script', 'https://snap.licdn.com/li.lms-analytics/insight.min.js');
  }

  function initGoogleAds(id: string) {
    injectScript('neop-gads-script', `https://www.googletagmanager.com/gtag/js?id=${id}`);
    injectInlineScript('neop-gads-init', `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`);
  }

  function activate(s: TrackingSettings) {
    // GTM — activates on analytics OR marketing consent (GTM manages its own consent)
    if (s.gtm_id && (hasAnalytics.value || hasMarketing.value)) initGtm(s.gtm_id);
    // GA4 — analytics consent required
    if (s.ga4_id && hasAnalytics.value) initGa4(s.ga4_id);
    // Meta Pixel — marketing consent required
    if (s.meta_pixel_id && hasMarketing.value) initMetaPixel(s.meta_pixel_id);
    // Snapchat Pixel — marketing consent required
    if (s.snapchat_pixel_id && hasMarketing.value) initSnapchatPixel(s.snapchat_pixel_id);
    // TikTok Pixel — marketing consent required
    if (s.tiktok_pixel_id && hasMarketing.value) initTikTokPixel(s.tiktok_pixel_id);
    // LinkedIn Insight — marketing consent required
    if (s.linkedin_insight_id && hasMarketing.value) initLinkedInInsight(s.linkedin_insight_id);
    // Google Ads — marketing consent required
    if (s.google_ads_id && hasMarketing.value) initGoogleAds(s.google_ads_id);
    // Search Console / Bing verification tags are injected via useSeoMeta() instead
  }

  if (import.meta.client && settings) {
    // If consent is already decided (returning visitor), activate immediately.
    if (hasDecided.value) activate(settings);

    // Listen for future consent changes.
    window.addEventListener('neop:consent', () => {
      if (settings) activate(settings);
    }, { once: false });
  }
}
