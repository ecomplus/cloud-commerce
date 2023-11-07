import '@cloudcommerce/firebase/lib/init';
import type { AppModuleBody } from '@cloudcommerce/types';
import handleListPayments from '../lib-mjs/pagarme-v5-list-payments.mjs';
import handleCreateTransaction from '../lib-mjs/pagarme-v5-create-transaction.mjs';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody);
};
