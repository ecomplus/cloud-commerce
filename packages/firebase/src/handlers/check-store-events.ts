import type { EventSub } from '../types';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';
import getEnv from '../env';

export default async () => {
  const { authenticationId, apiKey } = getEnv();
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
  ].forEach(async (resource) => {
    const { data: { result } } = await api({
      authenticationId,
      apiKey,
      endpoint: `events/${resource as 'orders'}`,
    });
    logger.info(`${resource} events: `, result);
  });
  return true;
};
