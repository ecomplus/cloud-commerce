import { useDebounceFn, watchOnce } from '@vueuse/core';
import { isLogged } from '@@sf/state/customer-session';
import {
  trackingIds,
  getAnalyticsContext,
  emitGtagEvent,
  watchGtagEvents,
} from '@@sf/state/use-analytics';
import afetch from '../../helpers/afetch';

let eventsToSend: Array<Record<string, any>> = [];
const _sendServerEvents = useDebounceFn(() => {
  afetch(`/_analytics`, {
    method: 'post',
    body: {
      ...getAnalyticsContext(),
      events: eventsToSend,
    },
  });
  eventsToSend = [];
}, 200);
const sendServerEvent = (event: Record<string, any>) => {
  eventsToSend.push(event);
  _sendServerEvents();
};

if (!import.meta.env.SSR) {
  watchGtagEvents(({ event }) => {
    sendServerEvent(event);
    const { name, params } = event;
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
    emitGtagEvent('page_view', {
      page_location: pageLocation,
      client_id: trackingIds.g_client_id || trackingIds.client_id,
      language: settings.lang,
      page_title: document.title,
      user_agent: navigator.userAgent,
    });
    lastPageLocation = pageLocation;
  };
  sendPageView();
  document.addEventListener('astro:load', sendPageView);

  if (isLogged.value) {
    emitGtagEvent('login');
  } else {
    watchOnce(isLogged, () => emitGtagEvent('login'));
  }
}
