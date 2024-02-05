import type { AnalyticsEvent } from '../analytics-events';
import axios from 'axios';

const ga4Axios = axios.create({
  baseURL: 'https://www.google-analytics.com',
  headers: {
    'Content-Type': 'application/json',
  },
});
const endpoint = '/mp/collect'
  + `?api_secret=${process.env.GA_API_SECRET}`
  + `&measurement_id=${process.env.GA_MEASUREMENT_ID}`;

const sendToGa4 = async (
  events: AnalyticsEvent[],
  clientId: string,
  sessionId: string,
  userProperties?: { [k: string]: { value: string } },
  utm: {
    source?: string,
    medium?: string,
    campaign?: string,
    term?: string,
    content?: string
  } = {},
) => {
  if (process.env.GA_API_SECRET && process.env.GA_MEASUREMENT_ID) {
    const data = {
      client_id: clientId,
      user_properties: userProperties,
      events: [] as AnalyticsEvent[],
    };
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.name === 'page_view') {
        event.name = 'campaign_details';
        event.params = {
          source: utm.source,
          medium: utm.medium,
          campaign: utm.campaign,
          term: utm.term,
          content: utm.content,
          session_id: sessionId,
        };
      } else if (event.params) {
        Object.assign(event.params, { session_id: sessionId });
      }
      data.events.push(event);
      if (data.events.length === 25 || i === events.length - 1) {
        // eslint-disable-next-line no-await-in-loop
        await ga4Axios.post(endpoint, data);
        data.events = [];
      }
    }
  }
};

export default sendToGa4;
