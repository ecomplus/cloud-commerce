import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';
import getEnv from '../env';

export default async () => {
  const { authenticationId, apiKey } = getEnv();
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
