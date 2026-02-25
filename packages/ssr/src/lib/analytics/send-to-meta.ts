import type { AnalyticsEvent } from './send-analytics-events';
import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';

const {
  FB_PIXEL_ID,
  FB_GRAPH_TOKEN,
  DEBUG_SERVER_ANALYTICS,
} = process.env;
// https://developers.facebook.com/docs/meta-pixel/reference#standard-events
const version = 'v18.0';
const metaAxios = axios.create({
  baseURL: `https://graph.facebook.com/${version}`,
  headers: {
    'Content-Type': 'application/json',
  },
});
const endpoint = FB_PIXEL_ID && FB_GRAPH_TOKEN
  ? `/${FB_PIXEL_ID}/events?access_token=${FB_GRAPH_TOKEN}`
  : null;

const sendToMeta = async ({
  events,
  pageLocation,
  userData,
  pageTitle,
}: {
  events: AnalyticsEvent[],
  pageLocation: string,
  userData: { [x: string]: string | undefined },
  pageTitle?: string,
}) => {
  if (!endpoint) return;
  let data: Array<Record<string, any>> = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    data.push({
      event_name: event.name,
      event_time: event.time || Math.floor(Date.now() / 1000),
      event_id: event.id,
      event_source_url: pageLocation,
      action_source: 'website',
      user_data: userData,
      custom_data: event.name === 'PageView'
        ? {
          content_name: pageTitle || '',
          ...event.params,
        }
        : event.params,
    });
    if (event.name === 'Purchase' && DEBUG_SERVER_ANALYTICS?.toLowerCase() === 'true') {
      logger.info('Meta purchase', { event });
    }
    if (data.length === 99 || i === events.length - 1) {
      // eslint-disable-next-line no-await-in-loop
      await metaAxios.post(endpoint, { data });
      data = [];
    }
  }
};

export default sendToMeta;
