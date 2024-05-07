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
  sent: boolean,
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
    const sendServerEvent = (analyticsEvent: AnalyticsEvent & { sent: boolean }) => {
      if (looksLikeBot) return;
      eventsToSend.push({
        ...analyticsEvent,
        id: evMessage.event_id,
        time: Math.round(evMessage.timestamp / 1000),
      });
      _sendServerEvents(variantCtx);
    };
    const { name, params } = evMessage.event;
    const {
      gtag,
      GTAG_AUTO_PAGEVIEW,
      fbq,
      FBQ_AUTO_PAGEVIEW,
      ttq,
      TTQ_AUTO_PAGEVIEW,
    } = window as Window & {
      gtag?: Gtag.Gtag,
      GTAG_AUTO_PAGEVIEW?: boolean,
      fbq?: (act: string, val: string, payload?: any, ctx?: any) => any,
      FBQ_AUTO_PAGEVIEW?: boolean,
      ttq?: { page: () => any, track: (val: string, payload?: any, ctx?: any) => any },
      TTQ_AUTO_PAGEVIEW?: boolean,
    };
    const hasGtag = typeof gtag === 'function';
    if (hasGtag && (!GTAG_AUTO_PAGEVIEW || name !== 'page_view')) {
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
    sendServerEvent({
      type: 'gtag',
      name,
      params,
      sent: hasGtag,
    });
    const hasFbq = typeof fbq === 'function';
    const fbqEvents = await parseGtagToFbq(evMessage);
    fbqEvents.forEach((fbqEvent: { name: string | null, params?: any }) => {
      if (!fbqEvent.name) return;
      sendServerEvent({ type: 'fbq', sent: hasFbq, ...(fbqEvent as any) });
      if (hasFbq) {
        if (fbqEvent.name === 'PageView' && FBQ_AUTO_PAGEVIEW) return;
        fbq('track', fbqEvent.name, fbqEvent.params, { eventID: evMessage.event_id });
      }
    });
    const hasTtq = typeof ttq?.page === 'function';
    const ttqEvents = await parseGtagToTtq(evMessage);
    ttqEvents.forEach((ttqEvent: { name: string | null, params?: any }) => {
      if (!ttqEvent.name) return;
      sendServerEvent({ type: 'ttk', sent: hasTtq, ...(ttqEvent as any) });
      if (hasTtq) {
        if (ttqEvent.name === 'PageView') {
          if (TTQ_AUTO_PAGEVIEW) return;
          ttq.page();
          return;
        }
        ttq.track(ttqEvent.name, ttqEvent.params, { event_id: evMessage.event_id });
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
