import { useDebounceFn } from '@vueuse/core';
import {
  useAnalytics,
  trackingIds,
  getPageViewParams,
  getAnalyticsContext,
  emitGtagEvent,
  watchGtagEvents,
} from '@@sf/state/use-analytics';
import { looksLikeBot } from '@@sf/sf-lib';
import afetch from '../../helpers/afetch';
import parseGtagToFbq from '../../analytics/event-to-fbq';
import parseGtagToTtq from '../../analytics/event-to-ttq';

const deployRand = import.meta.env.DEPLOY_RAND || '_';

type AnalyticsEvent = {
  type: 'gtag' | 'fbq' | 'ttq',
  name: string,
  params?: Record<string, any>,
};
type EventToServerSend = AnalyticsEvent & {
  id: string,
  time: number,
};
type AnalyticsVariantCtx = Partial<ReturnType<typeof useAnalytics>>;
let eventsToSend: Array<EventToServerSend> = [];
const _sendServerEvents = useDebounceFn((variantCtx?: AnalyticsVariantCtx) => {
  afetch(`/_analytics`, {
    method: 'POST',
    body: {
      exp_variant_string: variantCtx?.expVariantString,
      ...getAnalyticsContext(),
      events: eventsToSend,
    },
  });
  eventsToSend = [];
}, 200);

if (
  !import.meta.env.SSR
  && !window.location.search.includes(`__isrV=${deployRand}`)
) {
  const variantCtx = useAnalytics();
  watchGtagEvents(async (evMessage) => {
    const sendServerEvent = (analyticsEvent: AnalyticsEvent) => {
      if (looksLikeBot) return;
      eventsToSend.push({
        ...analyticsEvent,
        id: evMessage.event_id,
        time: Math.round(evMessage.timestamp / 1000),
      });
      _sendServerEvents(variantCtx);
    };
    const { name, params } = evMessage.event;
    sendServerEvent({ type: 'gtag', name, params });
    const {
      gtag,
      dataLayer,
      fbq,
      ttq,
    } = window as Window & {
      gtag?: Gtag.Gtag,
      dataLayer?: Array<any>,
      fbq?: (act: string, val: string, payload?: any, ctx?: any) => any,
      ttq?: { page: () => any, track: (val: string, payload?: any, ctx?: any) => any },
    };
    if (typeof gtag === 'function') {
      gtag('event', name, params);
      if (window.GOOGLE_ADS_ID && name === 'purchase') {
        gtag('event', 'conversion', {
          send_to: window.GOOGLE_ADS_ID,
          value: Number(params.value),
          currency: params.currency,
          transaction_id: params.transaction_id,
        });
      }
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
        fbq('track', fbqEvent.name, fbqEvent.params, { eventID: evMessage.event_id });
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
          ttq.track(ttqEvent.name, ttqEvent.params, { event_id: evMessage.event_id });
        }
      }
    });
  });

  let lastHref = '';
  const sendPageView = () => {
    const href = window.location.toString();
    if (href === lastHref) return;
    emitGtagEvent('page_view', {
      ...getPageViewParams(),
      client_id: trackingIds.g_client_id || trackingIds.client_id,
    });
    lastHref = href;
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
