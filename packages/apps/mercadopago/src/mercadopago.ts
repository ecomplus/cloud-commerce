import '@cloudcommerce/firebase/lib/init';
/* eslint-disable import/prefer-default-export */
import type { AppModuleBody } from '@cloudcommerce/types';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import handleListPayments from './mp-list-payments';
import handleCreateTransaction from './mp-create-transaction';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody, getFirestore());
};
