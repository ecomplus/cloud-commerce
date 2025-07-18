/* eslint-disable import/prefer-default-export */
import type { Orders } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';
import { readPaypalWebhookEvent } from './util/paypal-api';

type PaymentEntry = Exclude<Orders['payments_history'], undefined>[0]

const { httpsFunctionOptions } = config.get();

export const paypal = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { body } = req;
      const eventId = body?.id;
      if (req.method !== 'POST' || !eventId) {
        res.sendStatus(405);
        return;
      }
      // https://developer.paypal.com/docs/integration/direct/webhooks/notification-messages/
      const transactionCode = body && body.resource
        && (body.resource.sale_id || body.resource.id);
      logger.info(`PayPal webhook ${eventId}`, {
        transactionCode,
        parentPayment: body.resource?.parent_payment,
        eventType: body.event_type,
      });
      if (!transactionCode) {
        res.sendStatus(400);
        return;
      }
      if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        const appData = await getAppData('paypal');
        if (appData.paypal_client_id) {
          process.env.PAYPAL_CLIENT_ID = appData.paypal_client_id;
        }
        if (appData.paypal_secret) {
          process.env.PAYPAL_CLIENT_SECRET = appData.paypal_secret;
        }
        if (appData.paypal_sandbox) {
          process.env.PAYPAL_ENV = 'sandbox';
        }
      }
      const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
      if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        res.sendStatus(403);
        return;
      }
      const paypalEvent = await readPaypalWebhookEvent(eventId);
      const paypalEventType = paypalEvent.event_type;
      logger.info(`PayPal event type ${paypalEventType} for ${transactionCode}`);
      let status: PaymentEntry['status'] = 'pending';
      switch (paypalEventType) {
        case 'PAYMENT.AUTHORIZATION.CREATED':
        case 'PAYMENT.PAYOUTSBATCH.PROCESSING':
          status = 'under_analysis';
          break;
        case 'PAYMENT.AUTHORIZATION.VOIDED':
          status = 'unauthorized';
          break;
        case 'PAYMENT.CAPTURE.COMPLETED':
        case 'PAYMENT.SALE.COMPLETED':
        case 'PAYMENT.PAYOUTSBATCH.SUCCESS':
          status = 'paid';
          break;
        case 'PAYMENT.CAPTURE.DENIED':
        case 'PAYMENT.SALE.DENIED':
        case 'PAYMENT.PAYOUTSBATCH.DENIED':
          status = 'voided';
          break;
        case 'PAYMENT.CAPTURE.PENDING':
        case 'PAYMENT.SALE.PENDING':
          status = 'pending';
          break;
        case 'PAYMENT.CAPTURE.REFUNDED':
        case 'PAYMENT.CAPTURE.REVERSED':
        case 'PAYMENT.SALE.REFUNDED':
        case 'PAYMENT.SALE.REVERSED':
        case 'RISK.DISPUTE.CREATED':
          status = 'refunded';
          break;
        default:
          // Ignore unknow status
          return;
      }
      const {
        data: { result: [order] },
      } = await api.get('orders'
        + `?transactions.intermediator.transaction_code=${transactionCode}`
        + '&fields=_id,transactions'
        + '&limit=1' as `orders?${string}`);
      if (!order) {
        logger.warn(`Order not found for ${transactionCode}`, {
          body: req.body,
          paypalEvent,
        });
        res.sendStatus(204);
        return;
      }
      const flags = paypalEventType.split('.');
      const transaction = order.transactions?.find(({ intermediator }) => {
        return intermediator?.transaction_code === String(transactionCode);
      });
      if (transaction?._id) {
        await api.post(`orders/${order._id}/payments_history`, {
          date_time: new Date().toISOString(),
          status,
          transaction_id: transaction._id,
          flags: ['paypal', ...flags],
        });
        logger.info(`Updated ${order._id} to ${status}`);
        res.sendStatus(201);
        return;
      }
      res.sendStatus(200);
    }),
};
