/* eslint-disable import/prefer-default-export */
import { createHmac, timingSafeEqual } from 'node:crypto';
import functions from 'firebase-functions/v1';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import Pagaleve from './pagaleve-constructor';

const { httpsFunctionOptions } = config.get();

const getAppHiddenData = async () => {
  const { appId } = config.get().apps.pagaleve;
  const { data } = await api.get(`applications?app_id=${appId}&fields=hidden_data`);
  return data.result[0]?.hidden_data;
};

const parseStatusToEcom = (pagaleveTransactionStatus: string) => {
  switch (pagaleveTransactionStatus.toLowerCase()) {
    case 'pending':
    case 'new':
    case 'accepted':
      return 'pending';
    case 'authorized':
    case 'completed':
    case 'paid':
      return 'paid';
    case 'expired':
    case 'declined':
    case 'abandoned':
    case 'cancelled':
    case 'canceled':
      return 'voided';
    default:
  }
  return 'unknown';
};

export const pagaleve = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { body, query: { hash } } = req;
      if (typeof hash !== 'string') {
        res.sendStatus(403);
        return;
      }
      const {
        id,
        orderReference,
        state,
        amount,
      } = (body || {}) as { [k: string]: any, orderReference?: string & { length: 24 } };
      if (typeof orderReference !== 'string' || orderReference.length !== 24) {
        res.sendStatus(400);
        return;
      }
      let appData: Record<string, any> | undefined;
      try {
        appData = await getAppHiddenData();
      } catch (err) {
        logger.error(err);
        res.sendStatus(500);
        return;
      }
      if (!appData?.password) {
        res.sendStatus(409);
        return;
      }
      const {
        PAGALEVE_USERNAME,
        PAGALEVE_PASSWORD,
        PAGALEVE_SANDBOX,
      } = process.env;
      if (PAGALEVE_USERNAME) appData.username = PAGALEVE_USERNAME;
      if (PAGALEVE_PASSWORD) appData.password = PAGALEVE_PASSWORD;
      const isSandbox = !!PAGALEVE_SANDBOX;

      const validHash = createHmac('sha256', appData.password)
        .update(orderReference).digest('hex');
      if (
        validHash.length !== hash.length
        || !timingSafeEqual(Buffer.from(hash), Buffer.from(validHash))
      ) {
        res.sendStatus(401);
        return;
      }

      const orderEndpoint = `orders/${orderReference}` as const;
      try {
        const { data: order } = await api.get(orderEndpoint);
        if (order?.transactions) {
          const transaction = order.transactions.find(({ intermediator }) => {
            return intermediator?.transaction_id === id;
          });
          if (!transaction) {
            res.sendStatus(404);
            return;
          }
          await api.post(`${orderEndpoint}/payments_history`, {
            date_time: new Date().toISOString(),
            status: parseStatusToEcom(state),
            transaction_id: transaction._id,
            flags: ['pagaleve'],
          } as Exclude<(typeof order)['payments_history'], undefined>[0]);
          if (state.toLowerCase() === 'authorized') {
            const _pagaleve = new Pagaleve(appData.username, appData.password, isSandbox);
            await _pagaleve.preparing;
            const pagalevePayment = {
              checkout_id: id,
              currency: 'BRL',
              amount,
              intent: 'CAPTURE',
            };
            await _pagaleve.axios.post('/v1/payments', pagalevePayment, {
              maxRedirects: 0,
              validateStatus(status: number) {
                return status >= 200 && status <= 301;
              },
            });
          }
        }
      } catch (error: any) {
        const { response } = error;
        let status: number | undefined;
        if (response) {
          status = response.status;
          const err: any = new Error(`Webhook failed with ${status} for #${orderReference}`);
          err.url = error.config?.url;
          err.body = error.config?.body;
          err.status = status;
          err.response = JSON.stringify(response.data);
          logger.error(err);
        } else {
          logger.error(error);
        }
        if (!res.headersSent) {
          res.send({
            status: status || 500,
            msg: `Pagaleve webhook error for ${orderReference}`,
          });
        }
      }
    }),
};
