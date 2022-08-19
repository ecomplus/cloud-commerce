/* eslint-disable import/prefer-default-export */
import type { AppModuleBody } from '@cloudcommerce/types';
import * as handleApplyDiscount from '../lib-cjs/apply-discount.cjs';

export const applyDiscount = async (modBody: AppModuleBody) => {
  return handleApplyDiscount(modBody);
};
