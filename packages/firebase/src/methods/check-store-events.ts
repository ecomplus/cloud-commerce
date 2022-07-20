import type { Env } from '../types';
import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';

export default async ({ authenticationId, apiKey }: Env) => {
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
};
