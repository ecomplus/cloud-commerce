import type { AnalyticsEvent } from './send-analytics-events';
import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';

const {
  GA_API_SECRET,
  GA_MEASUREMENT_ID,
  DEBUG_SERVER_ANALYTICS,
} = process.env;
const ga4Axios = axios.create({
  baseURL: 'https://www.google-analytics.com',
  headers: {
    'Content-Type': 'application/json',
  },
});
const endpoint = GA_API_SECRET && GA_MEASUREMENT_ID
  ? `/mp/collect?api_secret=${GA_API_SECRET}&measurement_id=${GA_MEASUREMENT_ID}`
  : null;

const sendToGa4 = async ({
  events,
  clientId,
  sessionId,
  userProperties,
  utm = {},
  originIp,
  originUserAgent,
}: {
  events: AnalyticsEvent[],
  clientId: string,
  sessionId: string,
  userProperties?: { [k: string]: { value: string } },
  utm?: {
    source?: string,
    medium?: string,
    campaign?: string,
    term?: string,
    content?: string
  },
  originIp?: string,
  originUserAgent?: string,
}) => {
  if (!endpoint) return;
  const data = {
    client_id: clientId,
    user_properties: userProperties,
    events: [] as Array<{ name: string, params: Record<string, any> }>,
  };
  const headers: Record<string, string | undefined> = {
    'X-Forwarded-For': originIp,
    'User-Agent': originUserAgent,
  };
  for (let i = 0; i < events.length; i++) {
    const { name, params, time } = events[i];
    const event = { name, params: { ...params } };
    event.params.session_id = sessionId;
    event.params.engagement_time_msec = `${time ? time * 1000 : Date.now()}`;
    data.events.push(event);
    if (name === 'page_view') {
      data.events.push({
        name: 'campaign_details',
        params: {
          source: utm.source,
          medium: utm.medium,
          campaign: utm.campaign,
          term: utm.term,
          content: utm.content,
          session_id: sessionId,
          engagement_time_msec: event.params.engagement_time_msec,
        },
      });
    }
    if (name === 'purchase' && DEBUG_SERVER_ANALYTICS?.toLowerCase() === 'true') {
      logger.info('GA4 purchase', { event });
    }
    if (data.events.length === 24 || i === events.length - 1) {
      // eslint-disable-next-line no-await-in-loop
      await ga4Axios.post(endpoint, data, { headers });
      data.events = [];
    }
  }
};

export default sendToGa4;
