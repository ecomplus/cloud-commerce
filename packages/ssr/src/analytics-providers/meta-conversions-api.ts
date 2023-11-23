import type { AnalyticsEvent } from '../analytics-events';
import axios, { AxiosResponse } from 'axios';

const version = 'v18.0';
const metaAxios = axios.create({
  baseURL: `https://graph.facebook.com/${version}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

const url = `/${process.env.FB_PIXEL_ID}/events?access_token=${process.env.FB_GRAPH_TOKEN}`;

const sendEvent = (
  metaEvents: AnalyticsEvent[],
  pageLocation: string,
  userData: { [x: string]: string | undefined },

) => {
  if (process.env.FB_PIXEL_ID && process.env.FB_GRAPH_TOKEN) {
    const requests: Promise<AxiosResponse<any, any>>[] = [];
    let data: { [x: string]: any }[] = [];

    metaEvents.forEach((event, index) => {
      const body = event;
      if (body.name === 'PageView') {
        body.name = 'Lead';
        body.params = {
          content_name: event.params?.page_title,
        };
      }

      data.push({
        event_name: body.name,
        event_time: Date.now(),
        event_source_url: pageLocation,
        action_source: 'website',
        user_data: userData,
        custom_data: body.params,
      });

      if (data.length === 1000 || index === metaEvents.length - 1) {
        requests.push(
          metaAxios.post(url, { data }),
        );
        data = [];
      }
    });

    return requests;
  }
  // throw new Error('Meta credentials not found');
  return null;
};

// https://developers.facebook.com/docs/meta-pixel/reference#standard-events
export default sendEvent;
