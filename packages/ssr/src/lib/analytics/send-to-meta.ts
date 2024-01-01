import type { AnalyticsEvent } from '../analytics-events';
import axios from 'axios';

// https://developers.facebook.com/docs/meta-pixel/reference#standard-events
const version = 'v18.0';
const metaAxios = axios.create({
  baseURL: `https://graph.facebook.com/${version}`,
  headers: {
    'Content-Type': 'application/json',
  },
});
const endpoint = `/${process.env.FB_PIXEL_ID}/events`
  + `?access_token=${process.env.FB_GRAPH_TOKEN}`;

const sendToMeta = async (
  events: AnalyticsEvent[],
  pageLocation: string,
  userData: { [x: string]: string | undefined },
  pageTitle?: string,
) => {
  if (process.env.FB_PIXEL_ID && process.env.FB_GRAPH_TOKEN) {
    let data: Array<Record<string, any>> = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.name === 'PageView') {
        event.name = 'Lead';
        if (pageTitle) {
          event.params = {
            content_name: pageTitle,
          };
        }
      }
      data.push({
        event_name: event.name,
        event_time: Date.now(),
        event_source_url: pageLocation,
        action_source: 'website',
        user_data: userData,
        custom_data: event.params,
      });
      if (data.length === 999 || i === events.length - 1) {
        // eslint-disable-next-line no-await-in-loop
        await metaAxios.post(endpoint, { data });
        data = [];
      }
    }
  }
};

export default sendToMeta;
