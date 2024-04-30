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

const sendToTiktok = async ({
  events,
  pageLocation,
  user,
}: {
  events: AnalyticsEvent[],
  pageLocation: string,
  user: { [x: string]: string | undefined },
}) => {
  if (process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_PIXEL_ID) {
    let data: Array<Record<string, any>> = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      data.push({
        event: event.name,
        event_time: event.time || Math.floor(Date.now() / 1000),
        event_id: event.id,
        user,
        page: {
          url: pageLocation,
        },
        properties: event.params,
      });
      if (data.length === 99 || i === events.length - 1) {
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
