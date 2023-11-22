import type { AxiosResponse } from 'axios';
import { EventEmitter } from 'node:events';
import ga4Events from './analytics-providers/google-analytics';
import metaEvents from './analytics-providers/meta-conversions-api';

const analyticsEmitter = new EventEmitter();

export type AnalyticsEvent = {
  name: string,
  params?: Record<string, any>,
}

export type GroupedAnalyticsEvents = Array<AnalyticsEvent & { type: string }>;

const sendAnalyticsEvents = (
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

  const sendingEvents: Promise<AxiosResponse<any, any> | null>[] = [];
  if (eventsByType.gtag) {
    console.log('events to ga4:', {
      events: eventsByType.gtag,
      page_title: payload.page_title,
      client_id: payload.g_client_id || payload.client_id,
      session_id: payload.g_session_id || payload.session_id,
      gclid: payload.gclid,
      user_agent: payload.user_agent,
      ip: payload.ip,
    });
    const sessionId = payload.g_session_id || payload.session_id;
    const clientId = payload.g_client_id || payload.client_id;
    eventsByType.gtag.forEach((event) => {
      sendingEvents.push(ga4Events(event, clientId, sessionId));
    });
  }
  if (eventsByType.fbq) {
    const userData = {
      client_ip_address: payload.id,
      client_user_agent: payload.user_agent,
      fbc: payload.fbclid,
      fbp: payload.fbp,
    };
    eventsByType.fbq.forEach((event) => {
      sendingEvents.push(metaEvents(event, payload.page_location, userData));
    });
  }
  /* @TODO:
  - Get credentials from env vars, e.g. `process.env.GA_MEASUREMENT_ID`;
  - May receive multiple events in a unique request, and dispatch multiple
  events in one POST if possible;
  - Consider Google Click ID (`?gclid=`), Facebook Click ID (`?fbclid=`)
  and maybe TikTok one from payload;
  - Send the events in parallel for all APIs with `Promise.all(sendingEvents)`;
  - No CORS!
  */
  Promise.all(sendingEvents);
};

export default sendAnalyticsEvents;

export { sendAnalyticsEvents, analyticsEmitter };
