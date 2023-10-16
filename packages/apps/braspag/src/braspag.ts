import type { AppModuleBody } from '@cloudcommerce/types';
import '@cloudcommerce/firebase/lib/init';
import handleListPayments from '../lib-mjs/braspag-list-payments.mjs';
// import handleCreateTransaction from './galaxpay-create-transaction';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody);
};
