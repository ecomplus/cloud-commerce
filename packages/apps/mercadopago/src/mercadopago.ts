import '@cloudcommerce/firebase/lib/init';
/* eslint-disable import/prefer-default-export */
import type { AppModuleBody } from '@cloudcommerce/types';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import { onRequest } from 'firebase-functions/v2/https';
import config from '@cloudcommerce/firebase/lib/config';
import handleListPayments from './modules/list-payments';
import handleCreateTransaction from './modules/create-transaction';
import handleMPWebhook from './app-functions/webhook-and-status';

export const listPayments = async (modBody: AppModuleBody) => {
  return handleListPayments(modBody);
};

export const createTransaction = async (modBody: AppModuleBody) => {
  return handleCreateTransaction(modBody, getFirestore());
};

const { httpsFunctionOptions } = config.get();

export const mercadopago = {
  webhook: onRequest(httpsFunctionOptions, (req, res) => {
    const { method } = req;
    if (method === 'POST') {
      handleMPWebhook(req, res, getFirestore());
    } else {
      res.sendStatus(405);
    }
  }),
};
