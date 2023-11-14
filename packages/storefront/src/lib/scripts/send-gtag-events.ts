import { watchOnce } from '@vueuse/core';
import { isLogged } from '@@sf/state/customer-session';
import {
  sessionIds,
  sendGtagEvent,
  watchGtagEvents,
} from '@@sf/state/use-analytics';

if (!import.meta.env.SSR) {
  watchGtagEvents(({ event: { name, params } }) => {
    const { gtag } = window as any;
    if (typeof gtag === 'function') {
      gtag('event', name, params);
    }
  });

  const { $storefront: { settings } } = globalThis;
  let lastPageLocation = '';
  const sendPageView = () => {
    const pageLocation = window.location.toString();
    if (pageLocation === lastPageLocation) return;
    sendGtagEvent('page_view', {
      page_location: pageLocation,
      client_id: sessionIds.g_client_id || sessionIds.client_id,
      language: settings.lang,
      page_title: document.title,
      user_agent: navigator.userAgent,
    });
    lastPageLocation = pageLocation;
  };
  sendPageView();
  document.addEventListener('astro:load', sendPageView);

  if (isLogged.value) {
    sendGtagEvent('login');
  } else {
    watchOnce(isLogged, () => sendGtagEvent('login'));
  }
}
