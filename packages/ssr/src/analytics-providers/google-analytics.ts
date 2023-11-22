import type { AnalyticsEvent } from '../analytics-events';
import axios from 'axios';

const ga4Axios = axios.create({
  baseURL: 'https://www.google-analytics.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

const url = `/mp/collect?api_secret=${process.env.GA_API_TOKEN}`
  + `&measurement_id=${process.env.GA_MEASUREMENT_ID}`;

const sendEvent = (
  event: AnalyticsEvent,
  clientId: string,
  sessionId: string,
) => {
  if (process.env.GA_API_TOKEN && process.env.GA_MEASUREMENT_ID) {
    if (event.params) {
      Object.assign(event.params, { session_id: sessionId });
    }

    return ga4Axios.post(url, {
      client_id: clientId,
      events: [event],
    });
  }
  // throw new Error('Google Analytics credentials not found');
  return Promise.resolve(null);
};

export default sendEvent;
