/* eslint-disable import/prefer-default-export */
import type { AppModuleBody } from '@cloudcommerce/types';
import handleCalculateShipping from '../lib-mjs/calculate-jadlog.mjs';

export const calculateShipping = async (modBody: AppModuleBody) => {
  return handleCalculateShipping(modBody);
};
