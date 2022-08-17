/* eslint-disable import/prefer-default-export */
import type { AppModuleBody } from '@cloudcommerce/types';
import { logger } from 'firebase-functions';

export const applyDiscount = async (modBody: AppModuleBody) => {
  logger.info(modBody);
  return {};
};
