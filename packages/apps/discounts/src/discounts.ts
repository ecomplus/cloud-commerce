/* eslint-disable import/prefer-default-export */
import type { AppModuleBody } from '@cloudcommerce/types';
import handleApplyDiscount from '../lib-mjs/apply-discount.mjs';

export const applyDiscount = async (modBody: AppModuleBody) => {
  return handleApplyDiscount(modBody);
};
