import type { AppModuleBody } from '@cloudcommerce/types';
import '@cloudcommerce/firebase/lib/init';
import { getFirestore } from 'firebase-admin/firestore';
import handleListPayments from './galaxpay-list-payments';
import handleCreateTransaction from './galaxpay-create-transaction';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody, getFirestore());
};
