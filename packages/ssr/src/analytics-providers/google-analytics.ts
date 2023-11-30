import type { AnalyticsEvent } from '../analytics-events';
import axios, { AxiosResponse } from 'axios';

const ga4Axios = axios.create({
  baseURL: 'https://www.google-analytics.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

const url = `/mp/collect?api_secret=${process.env.GA_API_SECRET}`
  + `&measurement_id=${process.env.GA_MEASUREMENT_ID}`;

const sendEvent = (
  analyticsEvents: AnalyticsEvent[],
  clientId: string,
  sessionId: string,
  utm?: {
    source?: string,
    medium?: string,
    campaign?: string,
    term?: string,
    content?: string
  },
) => {
  if (process.env.GA_API_SECRET && process.env.GA_MEASUREMENT_ID) {
    const requests: Promise<AxiosResponse<any, any>>[] = [];
    let events: AnalyticsEvent[] = [];

    analyticsEvents.forEach((event, index) => {
      if (event.params) {
        Object.assign(event.params, { session_id: sessionId });
      }

      const body = event;
      if (body.name === 'page_view') {
        body.name = 'campaign_details';
        body.params = {
          source: utm?.source,
          medium: utm?.medium,
          campaign: utm?.campaign,
          term: utm?.term,
          content: utm?.content,
          session_id: sessionId,
        };
      }

      events.push(body);
      if (events.length === 25 || index === analyticsEvents.length - 1) {
        events.push(body);
        requests.push(
          ga4Axios.post(url, {
            client_id: clientId,
            events,
          }),
        );
        events = [];
      }
    });

    return requests;
  }
  // throw new Error('Google Analytics credentials not found');
  return null;
};

export default sendEvent;
