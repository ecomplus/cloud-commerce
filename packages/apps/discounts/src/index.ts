import type { AppEventsTopic } from '@cloudcommerce/types';
import { logger } from 'firebase-functions';

export const events: AppEventsTopic[] = [];

export const applyDiscount = async () => {
  logger.info('Hello discounts app');
  return {};
};
