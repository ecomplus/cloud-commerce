/* eslint-disable import/prefer-default-export */
import type { Orders } from '@cloudcommerce/types';
import type { AxiosError } from 'axios';
import api from '@cloudcommerce/api';
import '@cloudcommerce/firebase/lib/init';
import * as functions from 'firebase-functions/v1';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';
import { getAsaasAxios } from './util/asaas-api';

type PaymentEntry = Exclude<Orders['payments_history'], undefined>[0]

const {
  storeId,
  httpsFunctionOptions,
} = config.get();

const setAsaasEnv = async () => {
  if (!process.env.ASAAS_API_KEY) {
    const appData = await getAppData('asaas');
    process.env.ASAAS_API_KEY = appData.asaas_api_key;
    if (appData.asaas_sandbox) {
      process.env.ASAAS_ENV = 'sandbox';
    }
  }
};

const parseAsaasStatus = (asaasStatus: string): PaymentEntry['status'] | null => {
  switch (asaasStatus) {
    case 'CREDIT_CARD_CAPTURE_REFUSED':
      return 'unauthorized';
    case 'AWAITING_CHARGEBACK_REVERSAL':
    case 'CHARGEBACK_DISPUTE':
    case 'CHARGEBACK_REQUESTED':
      return 'in_dispute';
    case 'RECEIVED_IN_CASH_UNDONE':
    case 'DELETED':
      return 'voided';
    case 'REFUND_IN_PROGRESS':
    case 'REFUNDED':
      return 'refunded';
    case 'PENDING':
    case 'RESTORED':
      return 'pending';
    case 'RECEIVED':
    case 'CONFIRMED':
      return 'paid';
    case 'REPROVED_BY_RISK_ANALYSIS':
      return 'unauthorized';
    case 'AWAITING_RISK_ANALYSIS':
      return 'under_analysis';
    default:
      return null;
  }
};

const updatePaymentStatus = async ({
  orderId,
  transactionId,
  asaasStatus,
  flag = 'webhook',
}: {
  orderId: Orders['_id'],
  transactionId?: string,
  asaasStatus: string,
  flag?: string,
}) => {
  const status = parseAsaasStatus(asaasStatus);
  if (!status) {
    logger.warn(`Unexpected Asaas status for ${orderId}`, { asaasStatus });
    return;
  }
  await api.post(`orders/${orderId}/payments_history`, {
    date_time: new Date().toISOString(),
    status,
    transaction_id: transactionId,
    flags: ['asaas', flag, asaasStatus],
  });
  logger.info(`Updated ${orderId} to ${status}`);
};

export const asaas = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { body, headers } = req;
      const asaasStatus = (body?.event as string | undefined)?.replace(/^PAYMENT_/, '');
      const asaasPaymentId = body?.payment?.id;
      if (req.method !== 'POST' || !asaasStatus || !asaasPaymentId) {
        res.sendStatus(405);
        return;
      }
      await setAsaasEnv();
      const { ASAAS_API_KEY } = process.env;
      if (!ASAAS_API_KEY) {
        res.sendStatus(403);
        return;
      }
      const asaasKeyId = `${ASAAS_API_KEY}`.substring(0, 6) + `${ASAAS_API_KEY}`.slice(-3);
      if (headers['asaas-access-token'] !== `${storeId}_${asaasKeyId}`) {
        logger.warn('Unauthorized webhook', {
          asaasStatus,
          asaasPaymentId,
        });
        res.sendStatus(401);
        return;
      }
      logger.info(`Asaas webhook ${asaasPaymentId} ${asaasStatus}`);
      const status = parseAsaasStatus(asaasStatus);
      if (!status) {
        res.sendStatus(204);
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
        await updatePaymentStatus({
          orderId: order._id,
          transactionId: transaction._id,
          asaasStatus,
        });
        res.sendStatus(201);
        return;
      }
      res.sendStatus(200);
    }),

  cronCheckPayments: functions
    .region(config.get().httpsFunctionOptions.region)
    .runWith({ timeoutSeconds: 540 })
    .pubsub.schedule(process.env.CRONTAB_ASAAS_CHECK_PAYMENTS || '18 18,5 * * *')
    .timeZone('America/Sao_Paulo')
    .onRun(async () => {
      await setAsaasEnv();
      const { ASAAS_API_KEY } = process.env;
      if (!ASAAS_API_KEY) return;
      const d = new Date();
      const isOddHourExec = !!(d.getHours() % 2);
      d.setDate(d.getDate() - 30);
      const endpoint = 'orders'
        + '?fields=_id,transactions'
        + '&transactions.app.intermediator.code=asaas3'
        + '&financial_status.current=pending'
        + `&created_at>=${d.toISOString()}`
        + `&sort=${(isOddHourExec ? '-' : '')}number`
        + '&limit=500' as `orders?${string}`;
      const { data: { result: orders } } = await api.get(endpoint);
      logger.info(`${orders.length} orders listed`, {
        orderIds: orders.map(({ _id }) => _id),
      });
      const asaasAxios = await getAsaasAxios();
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        const transaction = order.transactions?.find(({ app }) => {
          return app?.intermediator?.code === 'asaas3';
        });
        const asaasPaymentId = transaction?.intermediator?.transaction_id;
        if (!asaasPaymentId) continue;
        let asaasStatus: string | undefined;
        try {
          // eslint-disable-next-line no-await-in-loop
          const { data } = await asaasAxios.get(`/v3/payments/${asaasPaymentId}/status`);
          asaasStatus = data.status;
        } catch (_err: any) {
          const err: AxiosError = _err;
          const status = err.response?.status;
          logger.warn(`Failed with ${status} reading Asaas status for ${order._id}`);
          if (status === 404 || status === 400) continue;
          logger.error(err);
          break;
        }
        if (!asaasStatus) continue;
        const status = parseAsaasStatus(asaasStatus);
        if (!status || status === 'pending') continue;
        updatePaymentStatus({
          orderId: order._id,
          transactionId: transaction._id,
          asaasStatus,
          flag: 'cron',
        });
      }
    }),
};
