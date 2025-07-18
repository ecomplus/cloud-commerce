/* eslint-disable import/prefer-default-export */
import type { Orders } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';

type PaymentEntry = Exclude<Orders['payments_history'], undefined>[0]

const { httpsFunctionOptions } = config.get();

export const asaas = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { body, headers } = req;
      const asaasStatus = body?.event;
      const asaasPaymentId = body?.payment?.id;
      if (req.method !== 'POST' || !asaasStatus || !asaasPaymentId) {
        res.sendStatus(405);
        return;
      }
      if (!process.env.ASAAS_API_KEY) {
        const appData = await getAppData('asaas');
        process.env.ASAAS_API_KEY = appData.asaas_api_key;
        if (appData.asaas_sandbox) {
          process.env.ASAAS_ENV = 'sandbox';
        }
      }
      const { ASAAS_API_KEY } = process.env;
      if (!ASAAS_API_KEY) {
        res.sendStatus(403);
        return;
      }
      if (headers['asaas-access-token'] !== `w1_${ASAAS_API_KEY}`) {
        logger.warn('Unauthorized webhook', {
          headers,
        });
        res.sendStatus(401);
        return;
      }
      logger.info(`Asaas webhook ${asaasPaymentId} ${asaasStatus}`);
      let status: PaymentEntry['status'] = 'pending';
      switch (asaasStatus) {
        case 'PAYMENT_CREDIT_CARD_CAPTURE_REFUSED':
          status = 'unauthorized';
          break;
        case 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL':
        case 'PAYMENT_CHARGEBACK_DISPUTE':
        case 'PAYMENT_CHARGEBACK_REQUESTED':
          status = 'in_dispute';
          break;
        case 'PAYMENT_RECEIVED_IN_CASH_UNDONE':
        case 'PAYMENT_DELETED':
          status = 'voided';
          break;
        case 'PAYMENT_REFUND_IN_PROGRESS':
        case 'PAYMENT_REFUNDED':
          status = 'refunded';
          break;
        case 'PAYMENT_RESTORED':
          status = 'pending';
          break;
        case 'PAYMENT_RECEIVED':
        case 'PAYMENT_CONFIRMED':
          status = 'paid';
          break;
        case 'PAYMENT_REPROVED_BY_RISK_ANALYSIS':
          status = 'unauthorized';
          break;
        case 'PAYMENT_AWAITING_RISK_ANALYSIS':
          status = 'under_analysis';
          break;
        default:
          // Ignore unknow status
          return;
      }
      const {
        data: { result: [order] },
      } = await api.get('orders'
        + `?transactions.intermediator.transaction_id=${asaasPaymentId}`
        + '&fields=_id,transactions'
        + '&limit=1' as `orders?${string}`);
      if (!order) {
        logger.warn(`Order not found for ${asaasPaymentId}`, {
          body: req.body,
        });
        res.sendStatus(204);
        return;
      }
      const transaction = order.transactions?.find(({ intermediator }) => {
        return intermediator?.transaction_id === String(asaasPaymentId);
      });
      if (transaction?._id) {
        await api.post(`orders/${order._id}/payments_history`, {
          date_time: new Date().toISOString(),
          status,
          transaction_id: transaction._id,
          flags: ['asaas', asaasStatus],
        });
        logger.info(`Updated ${order._id} to ${status}`);
        res.sendStatus(201);
        return;
      }
      res.sendStatus(200);
    }),
};
