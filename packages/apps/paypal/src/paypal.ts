import type { AppModuleBody } from '@cloudcommerce/types';
import '@cloudcommerce/firebase/lib/init';
import handleListPayments from '../lib-mjs/modules/list-payment.mjs';
import handleCreateTransaction from '../lib-mjs/modules/create-transaction.mjs';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody);
};
