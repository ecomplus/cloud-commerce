import { EventEmitter } from 'node:events';
import { warn, error } from 'firebase-functions/logger';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import sendToGa4 from './analytics/send-to-ga4';
import sendToMeta from './analytics/send-to-meta';
import sendToTiktok from './analytics/send-to-tiktok';

const analyticsEmitter = new EventEmitter();

export type AnalyticsEvent = {
  name: string,
  params?: Record<string, any>,
}

export type GroupedAnalyticsEvents = Array<AnalyticsEvent & { type: string }>;

const sendAnalyticsEvents = async (
  { url, events }: { url: string, events: GroupedAnalyticsEvents },
  payload: Record<string, any> = {},
) => {
  analyticsEmitter.emit('send', { url, events });
  const eventsByType: Record<string, AnalyticsEvent[] | undefined> = {};
  events.forEach(({ type, name, params }) => {
    if (!eventsByType[type]) {
      eventsByType[type] = [];
    }
    (eventsByType[type] as AnalyticsEvent[]).push({ name, params });
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
    const toGa4 = sendToGa4(gaEvents, clientId, sessionId, userProperties, payload.utm);
    sendingEvents.push(toGa4);
  }
  if (metaEvents) {
    const userData = {
      client_ip_address: payload.ip,
      client_user_agent: payload.user_agent,
      fbc: payload.fbclid,
      fbp: payload.fbp,
    };
    sendingEvents.push(sendToMeta(metaEvents, url, userData, payload.page_title));
  }
  if (tiktokEvents) {
    const userData = {
      ip: payload.ip,
      user_agent: payload.user_agent,
      ttclid: payload.ttclid,
    };
    sendingEvents.push(sendToTiktok(tiktokEvents, url, userData));
  }
  await Promise.all([
    Promise.allSettled(sendingEvents).then((results) => {
      for (let i = 0; i < results.length; i++) {
        const { status } = results[i];
        if (status === 'rejected') {
          warn((results[i] as PromiseRejectedResult).reason);
        }
      }
    }),
    Promise.all(storingEvents).catch(error),
  ]);
};

export default sendAnalyticsEvents;

export { sendAnalyticsEvents, analyticsEmitter };
