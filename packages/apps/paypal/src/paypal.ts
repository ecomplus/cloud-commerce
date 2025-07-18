import '@cloudcommerce/firebase/lib/init';
import type { AppModuleBody } from '@cloudcommerce/types';
import handleListPayments from './paypal-list-payments';
import handleCreateTransaction from './paypal-create-transaction';

export const listPayments = async (modBody: AppModuleBody<'list_payments'>) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody<'create_transaction'>) => {
  return handleCreateTransaction(modBody);
};
