import type { EventSub } from '../types';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
import getEnv from '../env';

export default async () => {
  const { apiAuth } = getEnv();
  const eventsSubs = await getFirestore().collection('eventsSubs').get();
  const listenedEvents: EventSub['event'][] = [];
  eventsSubs.forEach((doc) => {
    const eventSub = doc.data() as EventSub;
    if (!listenedEvents.includes(eventSub.event)) {
      listenedEvents.push(eventSub.event);
    }
  });
  logger.info({ listenedEvents });
  [
    'orders',
    'products',
    'carts',
    'customers',
  ].forEach(async (resource) => {
    let { data: { result } } = await api
      .get(`events/${resource as 'orders'}`, apiAuth);
    /*
    global.api_events_middleware = async (
      resource: string,
      result: EventsResult,
    }) => {
      if (resource === 'orders') {
        await axios.port(url, result);
      }
      return result;
    };
    */
    const middleware = global.api_events_middleware;
    if (typeof middleware === 'function') {
      result = await middleware(resource, result);
    }
    logger.info(`${resource} events: `, result);
  });
  return true;
};
