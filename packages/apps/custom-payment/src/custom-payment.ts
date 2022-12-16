import type { AppModuleBody } from '@cloudcommerce/types';
import handleListPayments from './custom-payment-list-payments';
import handleCreateTransaction from './custom-payment-create-transaction';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody);
};
