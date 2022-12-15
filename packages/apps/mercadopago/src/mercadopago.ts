import '@cloudcommerce/firebase/lib/init';
import type { AppModuleBody } from '@cloudcommerce/types';
import handleListPayments from './mp-list-payments';
import handleCreateTransaction from './mp-create-transaction';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody);
};
