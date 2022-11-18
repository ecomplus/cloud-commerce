/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
// import { logger } from 'firebase-functions';
// import axios from 'axios';
// import api from '@cloudcommerce/api';
// import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';

// const ECHO_SKIP = 'SKIP';
// const ECHO_SUCCESS = 'OK';

export const mercadopago = {
  webhook: functions
    .region(config.get().httpsFunctionOptions.region)
    .https.onRequest(async (req, res) => {
      const { method } = req;

      if (method === 'POST') {
        //
      } else {
        res.sendStatus(405);
      }
    }),
};
