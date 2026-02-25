/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import type { Orders } from '@cloudcommerce/types';
import type { Request, Response } from 'firebase-functions/v1';
import * as functions from 'firebase-functions/v1';
import api from '@cloudcommerce/api';
import { Endpoint } from '@cloudcommerce/api/types';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';
import { getYapayAxios } from './util/yapay-api';

type PaymentEntry = Exclude<Orders['payments_history'], undefined>[0]

const parseYapayStatus = (statusId: number): PaymentEntry['status'] => {
  switch (statusId) {
    case 4:
      return 'pending';
    case 5:
      return 'under_analysis';
    case 6:
      return 'paid';
    case 7:
      return 'voided';
    case 24:
      return 'refunded';
    case 87:
      return 'unauthorized';
    default:
      return 'pending';
  }
};

const listOrdersByTransaction = async (transactionId: string) => {
  const filters = `?transactions.intermediator.transaction_id=${transactionId}`
    + '&fields=_id,transactions._id,transactions.app,transactions.intermediator,transactions.status';
  const { result } = (await api.get(`/orders${filters}` as Endpoint)).data;
  return result as Orders[];
};

const handleWebhook = async (req: Request, res: Response) => {
  const { body } = req;
  const transactionToken = body.token_transaction;
  if (!transactionToken) {
    return res.sendStatus(400);
  }

  logger.info(`> Yapay notification for ${transactionToken}`);
  if (!process.env.YAPAY_API_TOKEN) {
    const appData = await getAppData('yapay');
    if (appData.yapay_api_token) {
      process.env.YAPAY_API_TOKEN = appData.yapay_api_token;
    }
  }
  const { YAPAY_API_TOKEN } = process.env;
  if (!YAPAY_API_TOKEN) {
    logger.warn('Missing Yapay API Token');
    return res.sendStatus(403);
  }

  try {
    const yapayAxios = await getYapayAxios();
    const { data: yapayResponse } = await yapayAxios.get('/transactions/get_by_token', {
      params: {
        token_transaction: transactionToken,
      },
    });
    if (yapayResponse.message_response?.message !== 'success') {
      logger.error('Yapay API error', { yapayResponse });
      return res.sendStatus(500);
    }

    const yapayData = yapayResponse.data_response.transaction;
    const yapayTransactionId = yapayData.transaction_id.toString();
    const status = parseYapayStatus(yapayData.status_id);
    logger.info(`Yapay ${yapayTransactionId} -> '${status}' (${yapayData.status_id})`, {
      yapayData,
    });
    const orders = await listOrdersByTransaction(yapayTransactionId);
    if (!orders.length) {
      logger.warn(`Order not found for transaction ${yapayTransactionId}`);
      return res.sendStatus(404);
    }

    await Promise.all(orders.map(async (order) => {
      const { _id: orderId, transactions } = order;
      let transactionId: string | undefined;
      if (transactions) {
        const transaction = transactions.find(
          (t) => t.intermediator?.transaction_id === yapayTransactionId,
        );
        if (transaction) {
          if (transaction.status?.current === status) {
            return;
          }
          transactionId = transaction._id;
        }
      }
      await api.post(`orders/${orderId}/payments_history`, {
        date_time: new Date().toISOString(),
        status,
        transaction_id: transactionId,
        flags: ['yapay', `${yapayData.status_id}`],
      });
    }));

    return res.sendStatus(200);
  } catch (err: any) {
    logger.error('Yapay webhook error', err);
    return res.status(500).send({
      error: 'yapay_webhook_error',
      message: err.message,
    });
  }
};

const { httpsFunctionOptions } = config.get();

export const yapay = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest((req, res) => {
      if (req.method !== 'POST') {
        res.sendStatus(405);
      } else {
        handleWebhook(req, res);
      }
    }),
};
