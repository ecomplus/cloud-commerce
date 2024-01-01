import type { AnalyticsEvent } from '../analytics-events';
import axios from 'axios';

// https://business-api.tiktok.com/portal/docs?id=1741601162187777
// https://business-api.tiktok.com/portal/docs?rid=oyn7lhbo6ar&id=1771100799076354
const version = 'v1.3';
const ttkAxios = axios.create({
  baseURL: `https://business-api.tiktok.com/open_api/${version}/event/track`,
  headers: {
    'Content-Type': 'application/json',
    'Access-Token': process.env.TIKTOK_ACCESS_TOKEN,
  },
});

const sendToTiktok = async (
  events: AnalyticsEvent[],
  pageLocation: string,
  user: { [x: string]: string | undefined },
) => {
  if (process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_PIXEL_ID) {
    let data: Array<Record<string, any>> = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.name === 'PageView') {
        event.name = 'Contact';
      }
      data.push({
        event: event.name,
        event_time: Date.now(),
        user,
        page: {
          url: pageLocation,
        },
        properties: event.params,
      });
      if (data.length === 999 || i === events.length - 1) {
        // eslint-disable-next-line no-await-in-loop
        await ttkAxios.post('/', {
          event_source: 'web',
          event_source_id: process.env.TIKTOK_PIXEL_ID,
          data,
        });
        data = [];
      }
    }
  }
};

export default sendToTiktok;
