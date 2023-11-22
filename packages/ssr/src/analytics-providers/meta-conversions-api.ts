import type { AnalyticsEvent } from '../analytics-events';
import axios from 'axios';

const version = 'v18.0';
const metaAxios = axios.create({
  baseURL: `https://graph.facebook.com/${version}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const url = `/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_GRAPH_TOKEN}`;

const sendEvent = (
  event: AnalyticsEvent,
  pageLocation: string,
  userData: { [x: string]: string | undefined },

) => {
  if (process.env.FB_PIXEL_ID && process.env.FB_GRAPH_TOKEN) {
    return metaAxios.post(url, {
      data: [
        {
          event_name: event.name,
          event_time: Date.now(),
          event_source_url: pageLocation,
          action_source: 'website',
          user_data: userData,
          custom_data: event.params,
        },
      ],
    });
  }
  // throw new Error('Meta credentials not found');
  return Promise.resolve(null);
};

// https://developers.facebook.com/docs/meta-pixel/reference#standard-events
export default sendEvent;
