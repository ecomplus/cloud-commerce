/* eslint-disable import/prefer-default-export */
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import Pagarme from 'pagarme';
import qs from 'qs';
import parseStatus from './functions-lib/parse-status-to-ecom';

const ECHO_SUCCESS = 'OK';

export const pagarme = {
  webhook: functions
    .region(config.get().httpsFunctionOptions.region)
    .https.onRequest(async (req, res) => {
      const { method } = req;
      if (method !== 'POST') {
        res.sendStatus(405);
      } else {
        // read configured E-Com Plus app data
        const app = (await api.get(
          `applications?app_id=${config.get().apps.pagarMe.appId}&fields=hidden_data`,
        )).data.result;

        if (!process.env.PAGARME_TOKEN) {
          const pagarmeToken = app[0].hidden_data?.pagarme_api_key;
          if (typeof pagarmeToken === 'string' && pagarmeToken) {
            process.env.PAGARME_TOKEN = pagarmeToken;
          } else {
            logger.warn('Missing PagarMe API token');
          }
        }

        // https://docs.pagar.me/docs/gerenciando-postbacks
        const pagarmeTransaction = req.body && req.body.transaction;
        if (pagarmeTransaction && pagarmeTransaction.metadata) {
          // const storeId = parseInt(pagarmeTransaction.metadata.store_id, 10);
          const orderId = pagarmeTransaction.metadata.order_id;

          if (/^[a-f0-9]{24}$/.test(orderId)) {
            logger.log('>(App:PagarMe) Webhook Order: ', orderId);

            // validate Pagar.me postback
            // https://github.com/pagarme/pagarme-js/issues/170#issuecomment-503729557
            const verifyBody = qs.stringify(req.body);
            const headerSignature = req.headers['x-hub-signature'];

            if (headerSignature && !Array.isArray(headerSignature)) {
              const signature = headerSignature.replace('sha1=', '');
              if (!Pagarme.postback
                .verifySignature(process.env.PAGARME_TOKEN, verifyBody, signature)) {
                res.sendStatus(403);
              } else {
                try {
                  // get E-Com Plus order
                  const order = (await api.get(`orders/${orderId}`)).data;

                  if (order && order.transactions) {
                    // add new transaction status to payment history
                    const transaction = order.transactions?.find(({ intermediator }) => {
                      return intermediator
                        && intermediator.transaction_id === String(pagarmeTransaction.id);
                    });

                    const bodyPaymentHistory = {
                      date_time: new Date().toISOString(),
                      status: parseStatus(req.body.current_status || pagarmeTransaction.status),
                      notification_code: req.body.fingerprint,
                      flags: ['pagarme'],
                    } as any; // TODO: incompatible type=> amount and status

                    if (transaction) {
                      Object.assign(bodyPaymentHistory, { transaction_id: transaction._id });
                    }
                    if (req.body.old_status) {
                      bodyPaymentHistory.flags.push(`old:${req.body.old_status}`.substring(0, 20));
                    }
                    // return appSdk.apiRequest(storeId, resource, method, body);
                    await api.post(`orders/${orderId}/payments_history`, bodyPaymentHistory);
                    res.status(200).send(ECHO_SUCCESS);
                  } else {
                    //
                    res.status(404).send('>(App:PagarMe) Order not found');
                  }
                } catch (err: any) {
                  err.metadata = pagarmeTransaction.metadata;
                  logger.error('(App:PagarMe) =>', err);
                  res.sendStatus(500);
                }
              }
            }
          }
        }
        res.sendStatus(404);
      }
    }),
};
