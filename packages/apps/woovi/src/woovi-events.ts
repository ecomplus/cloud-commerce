/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import type { Orders } from '@cloudcommerce/types';
import type { Request, Response } from 'firebase-functions/v1';
import * as functions from 'firebase-functions/v1';
import api from '@cloudcommerce/api';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';

type PaymentEntry = Exclude<Orders['payments_history'], undefined>[0]

const parseWooviStatus = (event: string): PaymentEntry['status'] | null => {
  switch (event) {
    case 'OPENPIX:CHARGE_CREATED':
      return 'pending';
    case 'OPENPIX:CHARGE_COMPLETED':
    case 'OPENPIX:CHARGE_COMPLETED_NOT_SAME_CUSTOMER_PAYER':
    case 'PIX_AUTOMATIC_COBR_COMPLETED':
      return 'paid';
    case 'OPENPIX:CHARGE_EXPIRED':
      return 'voided';
    case 'OPENPIX:TRANSACTION_REFUND_RECEIVED':
    case 'PIX_TRANSACTION_REFUND_SENT_CONFIRMED':
      return 'refunded';
    default:
      return null;
  }
};

const listOrdersByTransaction = async (correlationID: string) => {
  const filters = `?transactions.intermediator.transaction_id=${correlationID}`
    + '&fields=_id,transactions._id,transactions.app,transactions.intermediator,transactions.status';
  const { result } = (await api.get(`/orders${filters}` as `orders?${string}`)).data;
  return result as Orders[];
};

const handleWebhook = async (req: Request, res: Response) => {
  const { body } = req;
  const event = body?.event as string | undefined;
  const charge = body?.charge || body?.pix;
  if (!event || !charge) {
    logger.warn('Woovi webhook missing event or charge', { body });
    return res.sendStatus(400);
  }
  const { correlationID } = charge;
  if (!correlationID || typeof correlationID !== 'string') {
    logger.warn('Woovi webhook missing correlationID', { body });
    return res.sendStatus(400);
  }
  logger.info(`> Woovi notification: ${event}`, { correlationID });

  if (!process.env.WOOVI_APP_ID) {
    const appData = await getAppData('woovi');
    if (appData.woovi_app_id) {
      process.env.WOOVI_APP_ID = appData.woovi_app_id;
    }
  }
  const { WOOVI_APP_ID } = process.env;
  if (!WOOVI_APP_ID) {
    logger.warn('Missing Woovi AppID');
    return res.sendStatus(403);
  }

  try {
    const status = parseWooviStatus(event);
    if (!status) {
      logger.info(`Ignoring Woovi event: ${event}`);
      return res.sendStatus(204);
    }

    let orders: Orders[] = [];
    if (correlationID) {
      orders = await listOrdersByTransaction(correlationID);
    }
    if (!orders.length) {
      logger.warn('Order not found for Woovi charge', { correlationID });
      return res.sendStatus(404);
    }

    await Promise.all(orders.map(async (order) => {
      const { _id: orderId, transactions } = order;
      let transactionId: string | undefined;
      if (transactions) {
        const transaction = transactions.find(
          (t) => t.intermediator?.transaction_id === correlationID,
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
        flags: ['woovi', event],
      });
      logger.info(`Updated order ${orderId} to ${status}`);
    }));

    return res.sendStatus(200);
  } catch (err: any) {
    logger.error('Woovi webhook error', err);
    return res.status(500).send({
      error: 'woovi_webhook_error',
      message: err.message,
    });
  }
};

const { httpsFunctionOptions } = config.get();

export const woovi = {
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
