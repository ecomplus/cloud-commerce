import type { GtagEventMessage } from '@@sf/state/use-analytics';
import { useDebounceFn } from '@vueuse/core';
import config from '@cloudcommerce/config';
import { looksLikeBot, getDigestHex } from '@@sf/sf-lib';
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
const _sendServerEvents = useDebounceFn(async (variantCtx?: AnalyticsVariantCtx) => {
  const fbUserData: Record<string, any> = {};
  const purchaseEvent = eventsToSend.find((event) => {
    return event.type === 'gtag' && event.name === 'purchase';
  }) as (GtagEventMessage['event'] & { name: 'purchase' }) | undefined;
  if (purchaseEvent) {
    const { params } = purchaseEvent;
    fbUserData.external_id = params.buyer_id;
    fbUserData.em = params.buyer_email_hash;
    fbUserData.ph = params.buyer_phone_hash;
    fbUserData.fn = params.buyer_given_name_hash;
    fbUserData.ln = params.buyer_family_name_hash;
    fbUserData.ct = params.shipping_addr_city_hash;
    fbUserData.zp = params.shipping_addr_zip_hash;
    try {
      const provinceCode = params.shipping_addr_province_code;
      if (provinceCode?.length === 2) {
        fbUserData.st = await getDigestHex(provinceCode.toLowerCase());
      }
      const countryCode = params.shipping_addr_country_code || config.get().countryCode;
      if (countryCode.length === 2) {
        fbUserData.country = await getDigestHex(countryCode.toLowerCase());
      }
    } catch { /**/ }
  }
  afetch(`/_analytics`, {
    method: 'POST',
    body: {
      exp_variant_string: variantCtx?.expVariantString,
      ...getAnalyticsContext(),
      fb_user_data: fbUserData,
      events: eventsToSend,
    },
  });
  eventsToSend = [];
}, 1000);

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
      GTAG_USER_DATA,
      GOOGLE_ADS_ID,
      fbq,
      FBQ_AUTO_PAGEVIEW,
      ttq,
      TTQ_AUTO_PAGEVIEW,
    } = window as Window & {
      gtag?: Gtag.Gtag,
      GTAG_AUTO_PAGEVIEW?: boolean,
      GTAG_USER_DATA?: boolean,
      fbq?: (act: string, val: string, payload?: any, ctx?: any) => any,
      FBQ_AUTO_PAGEVIEW?: boolean,
      ttq?: { page: () => any, track: (val: string, payload?: any, ctx?: any) => any },
      TTQ_AUTO_PAGEVIEW?: boolean,
    };
    const hasGtag = typeof gtag === 'function';
    if (hasGtag && (!GTAG_AUTO_PAGEVIEW || name !== 'page_view')) {
      gtag('event', name, params);
      if (name === 'purchase') {
        if (GOOGLE_ADS_ID) {
          gtag('event', 'conversion', {
            send_to: GOOGLE_ADS_ID,
            value: Number(params.value),
            currency: params.currency,
            transaction_id: params.transaction_id,
          });
        }
        if (GTAG_USER_DATA) {
          const gtagUserData: any = {};
          if (params.buyer_email_hash) {
            gtagUserData.sha256_email_address = params.buyer_email_hash;
          }
          if (params.buyer_phone_hash) {
            gtagUserData.sha256_phone_number = params.buyer_phone_hash;
          }
          const firstNameHash = params.buyer_given_name_hash
            || params.buyer_display_name_hash;
          if (firstNameHash) {
            gtagUserData.address = {
              'address.sha256_first_name': firstNameHash,
            };
            if (params.buyer_family_name_hash) {
              gtagUserData.address['address.sha256_last_name'] = params.buyer_family_name_hash;
            }
            if (params.shipping_addr_country_code) {
              gtagUserData.address['address.country'] = params.shipping_addr_country_code;
            }
            if (params.shipping_addr_province_code) {
              gtagUserData.address['address.region'] = params.shipping_addr_province_code;
            }
          }
          if (Object.keys(gtagUserData).length) {
            gtag('set', 'user_data', gtagUserData);
          }
        }
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
