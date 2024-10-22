import '@cloudcommerce/firebase/lib/init';
import type { AppModuleBody } from '@cloudcommerce/types';
import handleListPayments from '../lib-mjs/braspag-list-payments.mjs';
import handleCreateTransaction from '../lib-mjs/braspag-create-transaction.mjs';

export const listPayments = async (modBody: AppModuleBody<'list_payments'>) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody<'create_transaction'>) => {
  return handleCreateTransaction(modBody);
};
