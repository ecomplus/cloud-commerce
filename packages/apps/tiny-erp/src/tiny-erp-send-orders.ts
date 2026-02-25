import type { Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';
import exportOrderToTiny from './integration/export-order-to-tiny';

export const sendWaitingOrders = async () => {
  const startDate = new Date();
  const isEvenHour = !(startDate.getHours() % 2);

  const appData = await getAppData('tinyErp', ['hidden_data', 'data']);
  if (!process.env.TINYERP_TOKEN) {
    const tinyToken = appData?.tiny_api_token;
    if (!tinyToken) {
      logger.warn('Missing Tiny API token');
      return;
    }
    process.env.TINYERP_TOKEN = tinyToken;
  }

  const d = new Date();
  d.setDate(d.getDate() - 60);
  const fields = [
    '_id',
    'number',
    'amount',
    'financial_status',
    'fulfillment_status',
    'fulfillments',
    'shipping_lines',
    'buyers',
    'items',
    'transactions',
    'opened_at',
    'created_at',
    'notes',
    'staff_notes',
    'extra_discount',
    'payment_method_label',
    'shipping_method_label',
  ] as const;
  const endpoint = 'orders'
    + `?fields=${fields.join(',')}`
    + '&financial_status.current=paid'
    + '&fulfillment_status.current=null'
    + `&updated_at>=${d.toISOString()}`
    + `&sort=${isEvenHour ? 'number' : '-number'}`
    + '&limit=200' as `orders?${string}`;

  logger.info('Start sending orders to Tiny', { endpoint });

  try {
    const { data } = await api.get(endpoint);
    const orders = data.result;
    logger.info(`${orders.length} orders listed`, {
      ids: orders.map(({ _id }) => _id),
      numbers: orders.map(({ number }) => number),
    });

    let createdCount = 0;
    let skippedCount = 0;
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i] as Orders;
      if (!order.number) continue;
      try {
        const queueEntry = { nextId: order._id };
        // eslint-disable-next-line no-await-in-loop
        const result = await exportOrderToTiny(order, queueEntry, appData, true);
        if (result && typeof result === 'object' && 'registros' in result) {
          createdCount += 1;
        } else {
          skippedCount += 1;
        }
      } catch (error: any) {
        const err = new Error(`Failed sending order ${order.number} to Tiny`);
        logger.error(err, {
          orderId: order._id,
          orderNumber: order.number,
          request: error.config,
          response: error.response?.data,
        });
      }
      // Rate limit: 150ms between requests
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => { setTimeout(resolve, 150); });
    }

    logger.info(`Finished sending orders to Tiny: ${createdCount} created, ${skippedCount} skipped`);
  } catch (_err: any) {
    if (_err.response) {
      const err = new Error('Failed listing orders for Tiny');
      logger.error(err, {
        request: _err.config,
        response: _err.response.data,
      });
    } else {
      logger.error(_err);
    }
  }
};

export default sendWaitingOrders;
