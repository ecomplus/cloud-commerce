// https://business-api.tiktok.com/portal/docs?id=1741601162187777
// https://business-api.tiktok.com/portal/docs?rid=oyn7lhbo6ar&id=1771100799076354

import type { AnalyticsEvent } from '../analytics-events';
import axios, { AxiosResponse } from 'axios';

const version = 'v1.3';
const ttkAxios = axios.create({
  baseURL: `https://business-api.tiktok.com/open_api/${version}/event/track`,
  headers: {
    'Content-Type': 'application/json',
    'Access-Token': process.env.TIKTOK_ACCESS_TOKEN,
  },
});

const sendEvent = (
  ttkEvents: AnalyticsEvent[],
  user: { [x: string]: string | undefined },
) => {
  if (process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_PIXEL_ID) {
    const requests: Promise<AxiosResponse<any, any>>[] = [];
    let data: { [x: string]: any }[] = [];

    ttkEvents.forEach((event, index) => {
      const body = event;
      if (body.name === 'PageView') {
        body.name = 'Contact';
      }

      data.push({
        event: body.name,
        event_time: Date.now(),
        user,
        page: {
          url: body.params?.page_location || event.params?.page_location,
        },
        properties: body.params,
      });

      if (data.length === 1000 || index === ttkEvents.length - 1) {
        requests.push(
          ttkAxios.post('/', {
            event_source: 'web',
            event_source_id: process.env.TIKTOK_PIXEL_ID,
            data,
          }),
        );
        data = [];
      }
    });

    return requests;
  }
  // throw new Error('TikTok Access Token not found');
  return null;
};

export default sendEvent;
