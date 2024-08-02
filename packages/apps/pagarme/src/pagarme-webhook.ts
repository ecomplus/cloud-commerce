import type { ResourceId } from '@cloudcommerce/api/types';
import { createHmac } from 'node:crypto';
import api from '@cloudcommerce/api';
import * as functions from 'firebase-functions/v1';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import Pagarme from 'pagarme';
import qs from 'qs';
import { parsePagarmeStatus } from './pagarme-utils';

const { httpsFunctionOptions } = config.get();

/* eslint-disable import/prefer-default-export */
export const pagarme = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { method } = req;
      if (method !== 'POST') {
        res.sendStatus(405);
        return;
      }
      const app = (await api.get(
        `applications?app_id=${config.get().apps.pagarMe.appId}&fields=hidden_data`,
      )).data.result;

      const pagarmeToken = app[0]?.hidden_data?.pagarme_api_key;
      if (typeof pagarmeToken === 'string' && pagarmeToken) {
        process.env.PAGARME_TOKEN = pagarmeToken;
      }
      if (!process.env.PAGARME_TOKEN) {
        logger.warn('Missing PagarMe API token');
        res.sendStatus(409);
        return;
      }

      // https://docs.pagar.me/docs/gerenciando-postbacks
      let pagarmeTransaction = req.body?.transaction;
      if (pagarmeTransaction?.metadata) {
        const orderId = pagarmeTransaction.metadata.order_id as ResourceId | undefined;
        if (typeof orderId === 'string' && /^[a-f0-9]{24}$/.test(orderId)) {
          let pagarmeStatus = req.body.current_status || pagarmeTransaction.status;
          logger.info(`Order ${orderId}`);
          let isVerified = false;
          if (`${process.env.PAGARME_WEBHOOK_SKIP_SIG}`.toLowerCase() !== 'true') {
            logger.info(`Validating ${orderId} webhook signature`);
            const urlSig = req.query.sig;
            if (urlSig && typeof urlSig === 'string') {
              const notificationSig = createHmac('sha256', process.env.PAGARME_TOKEN)
                .update(orderId).digest('hex');
              isVerified = notificationSig === urlSig;
              if (!isVerified) {
                logger.warn('?sig argument is received with invalid hash');
              }
            } else {
              // validate Pagar.me postback
              // https://github.com/pagarme/pagarme-js/issues/170#issuecomment-503729557
              const headerSig = req.headers['x-hub-signature'];
              if (!headerSig || typeof headerSig !== 'string') {
                isVerified = false;
              } else {
                const verifyBody = qs.stringify(req.body);
                const sigHeader = headerSig.replace('sha1=', '');
                isVerified = !!(Pagarme.postback
                  .verifySignature(process.env.PAGARME_TOKEN, verifyBody, sigHeader));
              }
            }
          }
          if (!isVerified) {
            try {
              const { data } = await axios({
                url: `https://api.pagar.me/1/transactions/${pagarmeTransaction.id}`,
                method: 'get',
                data: { api_key: process.env.PAGARME_TOKEN },
              });
              pagarmeTransaction = data;
              if (pagarmeTransaction?.metadata?.order_id !== orderId) {
                res.sendStatus(401);
                return;
              }
              pagarmeStatus = pagarmeTransaction.status;
            } catch {
              res.sendStatus(401);
              return;
            }
          }

          try {
            const order = (await api.get(`orders/${orderId}`)).data;
            if (order && order.transactions) {
              // add new transaction status to payment history
              const transaction = order.transactions?.find(({ intermediator }) => {
                return intermediator?.transaction_id === String(pagarmeTransaction.id);
              });
              const bodyPaymentHistory = {
                date_time: new Date().toISOString(),
                status: parsePagarmeStatus(pagarmeStatus),
                notification_code: req.body.fingerprint,
                flags: ['pagarme'],
              } as any;
              if (transaction) {
                Object.assign(bodyPaymentHistory, { transaction_id: transaction._id });
              }
              if (req.body.old_status) {
                bodyPaymentHistory.flags.push(`old:${req.body.old_status}`.substring(0, 20));
              }
              await api.post(`orders/${orderId}/payments_history`, bodyPaymentHistory);
              res.status(200).send('OK');
              return;
            }
            res.status(404).send('Pagar.me order not found');
            return;
          } catch (err: any) {
            err.metadata = pagarmeTransaction.metadata;
            logger.error(err);
            res.sendStatus(500);
            return;
          }
        }
      }
      res.sendStatus(403);
    }),
};
