import { useDebounceFn } from '@vueuse/core';
import {
  useAnalytics,
  trackingIds,
  getPageViewParams,
  getAnalyticsContext,
  emitGtagEvent,
  watchGtagEvents,
} from '@@sf/state/use-analytics';
import afetch from '../../helpers/afetch';
import parseGtagToFbq from '../../analytics/event-to-fbq';
import parseGtagToTtq from '../../analytics/event-to-ttq';

type AnalyticsEvent = {
  type: 'gtag' | 'fbq' | 'ttq',
  name: string,
  params?: Record<string, any>,
};
let eventsToSend: Array<AnalyticsEvent> = [];
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
const sendServerEvent = (analyticsEvent: AnalyticsEvent) => {
  eventsToSend.push(analyticsEvent);
  _sendServerEvents();
};

if (!import.meta.env.SSR) {
  useAnalytics();
  watchGtagEvents(async (evMessage) => {
    const { name, params } = evMessage.event;
    sendServerEvent({ type: 'gtag', name, params });
    const {
      gtag,
      dataLayer,
      fbq,
      ttq,
    } = window as {
      gtag?: Gtag.Gtag,
      dataLayer?: Array<any>,
      fbq?: (action: string, value: string, payload?: any) => any,
      ttq?: { page: () => any, track: (value: string, payload?: any) => any },
    };
    if (typeof gtag === 'function') {
      gtag('event', name, params);
    }
    // https://developers.google.com/analytics/devguides/migration/ecommerce/gtm-ga4-to-ua#4_enable_the_gtagjs_api
    if (dataLayer && typeof dataLayer.push === 'function') {
      dataLayer.push(['event', name, params]);
    }
    const fbqEvents = await parseGtagToFbq(evMessage);
    fbqEvents.forEach((fbqEvent) => {
      if (!fbqEvent.name) return;
      sendServerEvent({ type: 'fbq', ...fbqEvent });
      if (typeof fbq === 'function') {
        fbq('track', fbqEvent.name, fbqEvent.params);
      }
    });
    const ttqEvents = await parseGtagToTtq(evMessage);
    ttqEvents.forEach((ttqEvent) => {
      if (!ttqEvent.name) return;
      sendServerEvent({ type: 'ttk', ...ttqEvent });
      if (typeof ttq?.page === 'function') {
        if (ttqEvent.name === 'PageView') {
          ttq.page();
        } else {
          ttq.track(ttqEvent.name, ttqEvent.params);
        }
      }
    });
  });

  let lastPageLocation = '';
  const sendPageView = () => {
    const pageLocation = window.location.toString();
    if (pageLocation === lastPageLocation) return;
    emitGtagEvent('page_view', {
      ...getPageViewParams(),
      page_location: pageLocation,
      client_id: trackingIds.g_client_id || trackingIds.client_id,
    });
    lastPageLocation = pageLocation;
  };
  sendPageView();
  window.addEventListener('storefront:apiContext', () => {
    try {
      (window as any).dataLayer.push(function resetAndSend() {
        // @ts-ignore
        this.reset();
        sendPageView();
      });
    } catch {
      sendPageView();
    }
  });
}
