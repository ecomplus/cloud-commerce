import { getFirestore } from 'firebase-admin/firestore';
import api from '@cloudcommerce/api';
import * as functions from 'firebase-functions/v1';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import createAxios from '../lib-mjs/lib/braspag/create-axios.mjs';
import { parseStatus } from '../lib-mjs/lib/braspag/parse-utils.mjs';

const { httpsFunctionOptions } = config.get();

/* eslint-disable import/prefer-default-export */
export const braspag = {
  qrCode: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { orderId } = req.query;
      if (!orderId) {
        res.sendStatus(406);
        return;
      }
      try {
        const doc = await getFirestore().doc(`braspagQrCode/${orderId}`).get();
        const qrCode = doc.data()?.qrCode as string | undefined;
        if (qrCode) {
          const img = Buffer.from(qrCode, 'base64');
          res.setHeader('Content-Length', img.length);
          res.setHeader('Content-Type', 'image/png');
          res.end(img);
        }
      } catch (err: any) {
        res.status(500);
        const { message } = err;
        res.send({
          error: 'QR_CODE_ERROR',
          message,
        });
      }
    }),

  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { method } = req;
      if (method !== 'POST') {
        res.sendStatus(405);
        return;
      }
      if (!process.env.BRASPAG_MERCHANT_KEY || !process.env.BRASPAG_API_TYPE) {
        const app = (await api.get(
          `applications?app_id=${config.get().apps.braspag.appId}&fields=hidden_data`,
        )).data.result;
        const appData = app[0]?.hidden_data || {};
        if (appData.merchant_id) {
          process.env.BRASPAG_MERCHANT_ID = appData.merchant_id;
          process.env.BRASPAG_MERCHANT_KEY = appData.merchant_key;
        }
        if (typeof appData.is_cielo === 'boolean') {
          process.env.BRASPAG_API_TYPE = appData.is_cielo ? 'cielo' : 'braspag';
        }
        if (!process.env.BRASPAG_API_TYPE) {
          process.env.BRASPAG_API_TYPE = 'braspag';
        }
      }
      if (!process.env.BRASPAG_MERCHANT_ID || !process.env.BRASPAG_MERCHANT_KEY) {
        logger.warn('Missing Braspag merchant credentials');
        res.sendStatus(409);
        return;
      }
      const { body } = req;
      if (body?.ChangeType !== 1 || !body.PaymentId) {
        res.sendStatus(204);
        return;
      }
      const appAxios = createAxios(true, false);
      const transactionId = body.PaymentId;
      const { data: { Payment: payment } } = await appAxios.get(`/sales/${transactionId}`);
      const order = (await api.get('orders', {
        params: {
          'transactions.intermediator.transaction_id': transactionId,
        },
        fields: ['transactions', 'financial_status', 'status', 'opened_at'] as const,
      })).data.result[0];
      if (!order) {
        logger.warn(`Order not found for ${transactionId}`, { body });
        res.sendStatus(204);
        return;
      }
      let dateTime = new Date();
      const status = (parseStatus[payment.Status] || 'unknown');
      if (order.financial_status?.current !== status) {
        const transaction = order.transactions?.find((_transaction) => {
          return _transaction.intermediator?.transaction_id === transactionId;
        });
        let notificationCode = `${body.ChangeType};${payment.Type};`;
        if ((status === 'refunded' || status === 'voided') && payment.VoidedDate) {
          dateTime = new Date(`${payment?.VoidedDate} UTC-3`);
          notificationCode += `${dateTime};`;
        } else if (payment.CapturedDate && status === 'paid') {
          dateTime = new Date(`${payment.CapturedDate} UTC-3`);
          notificationCode += `${dateTime.toISOString()};`;
        }
        if (order.opened_at) {
          /* Braspag invoices do not validate the payment time, only the day is informed.
          If the payment is made on the same day,
          a payment history will be generated before the order is created,
          and will not update the order status. */
          const dateOpenedAt = new Date(order.opened_at);
          if (dateTime.getTime() <= dateOpenedAt.getTime()) {
            dateTime = new Date();
          }
        }
        await api.post(`orders/${order._id}/payments_history`, {
          transaction_id: transaction?._id,
          date_time: dateTime.toISOString(),
          status,
          notification_code: notificationCode,
          flags: ['braspag'],
        });
        res.sendStatus(201);
        return;
      }
      res.sendStatus(200);
    }),
};
