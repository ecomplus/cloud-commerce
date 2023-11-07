import { EventEmitter } from 'node:events';

const analyticsEmitter = new EventEmitter();

const sendAnalyticsEvents = ({ url, events }) => {
  analyticsEmitter.emit('send', { url, events });
  /* @TODO:
  Parse received events in GA4 (pageview and Measure ecommerce)
  format and dispatch to GA Measurement API, Facebook Conversions API and
  TikTok Analytics API.
  - Get credentials from env vars, e.g. `process.env.GA_MEASUREMENT_ID`;
  - May receive multiple events in a unique request, and dispatch multiple
  events in one POST if possible;
  - Consider Google Click ID (`?gclid=`), Facebook Click ID (`?fbclid=`)
  and maybe TikTok one from `url` query string;
  - Send the events in parallel for all APIs with `Promise.all(sendingEvents)`;
  - No CORS!
  */
};

export default sendAnalyticsEvents;

export { sendAnalyticsEvents, analyticsEmitter };
