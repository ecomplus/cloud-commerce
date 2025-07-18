import type { AxiosError } from 'axios';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';
import sendToGa4 from './send-to-ga4';
import sendToMeta from './send-to-meta';
import sendToTiktok from './send-to-tiktok';
import sendToAwin from './send-to-awin';

export type AnalyticsEvent = {
  id?: string,
  time?: number,
  sent?: boolean,
  name: string,
  params?: Record<string, any>,
  type?: string,
}

export type GroupedAnalyticsEvents = Array<AnalyticsEvent & {
  type: 'gtag' | 'fbq' | 'ttq',
}>;

export const sendAnalyticsEvents = async (
  { url, events }: { url: string, events: GroupedAnalyticsEvents },
  payload: Record<string, any> = {},
) => {
  const eventsByType: Record<string, AnalyticsEvent[] | undefined> = {};
  events.forEach((ev) => {
    if (!eventsByType[ev.type]) {
      eventsByType[ev.type] = [];
    }
    (eventsByType[ev.type] as AnalyticsEvent[]).push(ev);
  });
  const sendingEvents: Promise<any>[] = [];
  const storingEvents: Promise<any>[] = [];
  const {
    gtag: gaEvents,
    fbq: metaEvents,
    ttq: tiktokEvents,
  } = eventsByType;
  if (gaEvents) {
    const pageView = gaEvents.find(({ name }) => {
      return name === 'page_view';
    });
    const productView = gaEvents.find(({ name, params }) => {
      return name === 'view_item'
        && params?.items?.[0]?.item_list_id === 'product-page';
    });
    if (pageView || productView) {
      const db = getFirestore();
      if (pageView && url) {
        const storing = db.collection('ssrPageViews')
          .add({ url, at: Timestamp.now() });
        storingEvents.push(storing);
      }
      const productId = productView?.params?.items?.[0]?.object_id;
      if (typeof productId === 'string' && /[0-9a-f]{24}/.test(productId)) {
        const storing = db.doc(`ssrProductViews/${productId}`)
          .set({ countUnsaved: FieldValue.increment(1) }, { merge: true });
        storingEvents.push(storing);
      }
    }
    const sessionId = payload.g_session_id || payload.session_id;
    const clientId = payload.g_client_id || payload.client_id;
    // https://developers.google.com/analytics/devguides/collection/protocol/ga4/user-properties?client_type=gtag
    const userProperties = payload.user_agent
      ? {
        user_agent: { value: payload.user_agent },
      } as Record<string, { value: string }>
      : undefined;
    if (userProperties && payload.exp_variant_string) {
      userProperties.exp_variant_string = { value: payload.exp_variant_string };
    }
    sendingEvents.push(sendToGa4({
      events: gaEvents.filter(({ sent, name, params }) => {
        // Cannot deduplicate GA4 events by ID exepting purchase
        return !sent || (name === 'purchase' && !!params?.transaction_id);
      }),
      clientId,
      sessionId,
      userProperties,
      utm: payload.utm,
      originIp: payload.ip,
      originUserAgent: payload.user_agent,
    }));
    sendingEvents.push(sendToAwin({
      events: gaEvents,
      awc: payload.awc,
      channel: payload.awin_channel,
    }));
  }
  if (metaEvents) {
    sendingEvents.push(sendToMeta({
      events: metaEvents,
      pageLocation: url,
      userData: {
        ...payload.fb_user_data,
        client_ip_address: payload.ip,
        client_user_agent: payload.user_agent,
        fbc: payload.fbc,
        fbp: payload.fbp,
      },
      pageTitle: payload.page_title,
    }));
  }
  if (tiktokEvents) {
    sendingEvents.push(sendToTiktok({
      events: tiktokEvents,
      pageLocation: url,
      user: {
        ...payload.tt_user,
        ip: payload.ip,
        user_agent: payload.user_agent,
        ttclid: payload.ttclid,
      },
    }));
  }
  await Promise.all([
    Promise.allSettled(sendingEvents).then((results) => {
      for (let i = 0; i < results.length; i++) {
        const { status } = results[i];
        if (status === 'rejected') {
          const reason: AxiosError = (results[i] as PromiseRejectedResult).reason;
          const message = reason.config?.url
            ? `${reason.config.method} ${reason.config.url}`
              + ` failed with ${reason.response?.status}`
            : reason.message;
          const err = new Error(message);
          logger.warn(err, {
            request: reason.config && {
              url: reason.config.url,
              method: reason.config.method,
              headers: reason.config.headers,
              data: reason.config.data,
            },
            response: reason.response && {
              headers: reason.response.headers,
              data: reason.response.data,
            },
          });
        }
      }
    }),
    Promise.all(storingEvents).catch(logger.error),
  ]);
};

export default sendAnalyticsEvents;
