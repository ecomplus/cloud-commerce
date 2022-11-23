import '@cloudcommerce/firebase/lib/init';
import type { AppModuleBody } from '@cloudcommerce/types';
import { getFirestore } from 'firebase-admin/firestore';
import handleListPayments from './ip-list-payments';
import handleCreateTransaction from './ip-create-transaction';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody, getFirestore());
};
