/* eslint-disable import/prefer-default-export */

import '@cloudcommerce/firebase/lib/init';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
// eslint-disable-next-line import/no-unresolved
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import handleMPWebhook from './app-functions/webhook-and-status';

const locationId = config.get().httpsFunctionOptions.region;
const onRequestV1 = functions.region(locationId).https.onRequest;

export const mercadopago = {
  webhook: onRequestV1((req, res) => {
    const { method } = req;
    if (method === 'POST') {
      handleMPWebhook(req, res, getFirestore());
    } else {
      res.sendStatus(405);
    }
  }),
};

export const baseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;
