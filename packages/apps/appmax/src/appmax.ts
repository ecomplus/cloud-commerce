import '@cloudcommerce/firebase/lib/init';
import type { AppModuleBody } from '@cloudcommerce/types';
import handleListPayments from '../lib-mjs/appmax-list-payments.mjs';
import handleCreateTransaction from '../lib-mjs/appmax-create-transaction.mjs';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody);
};
