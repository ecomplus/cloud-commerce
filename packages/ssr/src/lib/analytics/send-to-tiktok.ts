import type { AnalyticsEvent } from './send-analytics-events';
import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';

const {
  TIKTOK_PIXEL_ID,
  TIKTOK_ACCESS_TOKEN,
  DEBUG_SERVER_ANALYTICS,
} = process.env;
// https://business-api.tiktok.com/portal/docs?id=1741601162187777
// https://business-api.tiktok.com/portal/docs?rid=oyn7lhbo6ar&id=1771100799076354
const version = 'v1.3';
const ttkAxios = TIKTOK_PIXEL_ID && TIKTOK_ACCESS_TOKEN
  ? axios.create({
    baseURL: `https://business-api.tiktok.com/open_api/${version}/event/track`,
    headers: {
      'Content-Type': 'application/json',
      'Access-Token': TIKTOK_ACCESS_TOKEN,
    },
  })
  : null;

const sendToTiktok = async ({
  events,
  pageLocation,
  user,
}: {
  events: AnalyticsEvent[],
  pageLocation: string,
  user: { [x: string]: string | undefined },
}) => {
  if (!ttkAxios) return;
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
    if (event.name === 'Purchase' && DEBUG_SERVER_ANALYTICS?.toLowerCase() === 'true') {
      logger.info('TikTok purchase', { event });
    }
    if (data.length === 99 || i === events.length - 1) {
      // eslint-disable-next-line no-await-in-loop
      await ttkAxios.post('/', {
        event_source: 'web',
        event_source_id: TIKTOK_PIXEL_ID,
        data,
      });
      data = [];
    }
  }
};

export default sendToTiktok;
