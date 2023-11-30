import type { AxiosResponse } from 'axios';
import { EventEmitter } from 'node:events';
import { warn, error } from 'firebase-functions/logger';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';
import ga4Events from './analytics-providers/google-analytics';
import metaEvents from './analytics-providers/meta-conversions-api';
import tiktokEvent from './analytics-providers/tiktok-ads';

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
  const sendingEvents: Promise<AxiosResponse<any, any>>[] = [];
  const storingEvents: Promise<any>[] = [];
  if (eventsByType.gtag) {
    const sessionId = payload.g_session_id || payload.session_id;
    const clientId = payload.g_client_id || payload.client_id;
    const listGA4Events = ga4Events(eventsByType.gtag, clientId, sessionId, payload.utm);
    if (listGA4Events) {
      sendingEvents.push(...listGA4Events);
    }
    const pageView = eventsByType.gtag.find(({ name }) => {
      return name === 'page_view';
    });
    const productView = eventsByType.gtag.find(({ name, params }) => {
      return name === 'view_item' && params?.item_list_id === 'product-page';
    });
    if (pageView || productView) {
      const db = getFirestore();
      if (pageView && url) {
        const storing = db.collection('ssrPageViews')
          .add({ url, at: Timestamp.now() });
        storingEvents.push(storing);
      }
      const productId = productView?.params?.object_id;
      if (productId) {
        const storing = db.doc(`ssrProductViews/${productId}`)
          .set({ countUnsaved: FieldValue.increment(1) }, { merge: true });
        storingEvents.push(storing);
      }
    }
  }
  if (eventsByType.fbq) {
    const userData = {
      client_ip_address: payload.id,
      client_user_agent: payload.user_agent,
      fbc: payload.fbclid,
      fbp: payload.fbp,
    };
    const listMetaEvents = metaEvents(eventsByType.fbq, payload.page_location, userData);
    if (listMetaEvents) {
      sendingEvents.push(...listMetaEvents);
    }
  }
  if (eventsByType.ttk) {
    const user = {
      ip: payload.id,
      user_agent: payload.user_agent,
      ttclid: payload.ttclid,
    };
    const lisTiktokEvents = tiktokEvent(eventsByType.ttk, user);
    if (lisTiktokEvents) {
      sendingEvents.push(...lisTiktokEvents);
    }
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
