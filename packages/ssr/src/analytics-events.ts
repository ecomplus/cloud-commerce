import type { AxiosResponse } from 'axios';
import { EventEmitter } from 'node:events';
import { warn } from 'firebase-functions/logger';
import ga4Events from './analytics-providers/google-analytics';
import metaEvents from './analytics-providers/meta-conversions-api';

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
  if (eventsByType.gtag) {
    const sessionId = payload.g_session_id || payload.session_id;
    const clientId = payload.g_client_id || payload.client_id;
    const listGA4Events = ga4Events(eventsByType.gtag, clientId, sessionId, payload.utm);
    if (listGA4Events) {
      sendingEvents.push(...listGA4Events);
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
  try {
    await Promise.all(sendingEvents);
  } catch (err) {
    warn(err);
  }
};

export default sendAnalyticsEvents;

export { sendAnalyticsEvents, analyticsEmitter };
