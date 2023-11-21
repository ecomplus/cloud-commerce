import { EventEmitter } from 'node:events';

const analyticsEmitter = new EventEmitter();

export type AnalyticsEvents = Array<{
  type: string,
  name: string,
  params?: Record<string, any>,
}>;

const sendAnalyticsEvents = (
  { url, events }: { url: string, events: AnalyticsEvents },
  payload: Record<string, any> = {},
) => {
  analyticsEmitter.emit('send', { url, events });
  const gtagEvents: AnalyticsEvents = [];
  const fbqEvents: AnalyticsEvents = [];
  const ttqEvents: AnalyticsEvents = [];
  events.forEach((event) => {
    switch (event.type) {
      case 'gtag': gtagEvents.push(event); break;
      case 'fbq': fbqEvents.push(event); break;
      case 'ttq': ttqEvents.push(event); break;
      default:
    }
  });
  events.filter((event) => event.type === 'gtag');
  console.log('gtag events:', {
    gtagEvents,
    page_title: payload.page_title,
    client_id: payload.g_client_id || payload.client_id,
    session_id: payload.g_session_id || payload.session_id,
  });
  /* @TODO:
  - Get credentials from env vars, e.g. `process.env.GA_MEASUREMENT_ID`;
  - May receive multiple events in a unique request, and dispatch multiple
  events in one POST if possible;
  - Consider Google Click ID (`?gclid=`), Facebook Click ID (`?fbclid=`)
  and maybe TikTok one from payload;
  - Send the events in parallel for all APIs with `Promise.all(sendingEvents)`;
  - No CORS!
  */
};

export default sendAnalyticsEvents;

export { sendAnalyticsEvents, analyticsEmitter };
