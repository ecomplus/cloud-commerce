import type { AppModuleBody } from '@cloudcommerce/types';
import '@cloudcommerce/firebase/lib/init';
import handleListPayments from './ip-list-payments';
import handleCreateTransaction from './ip-create-transaction';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody);
};
