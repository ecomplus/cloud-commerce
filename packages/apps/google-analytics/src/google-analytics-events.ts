/* eslint-disable import/prefer-default-export */
import type { Orders } from '@cloudcommerce/types';
import type { EventItem, EventParams } from '../types';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import logger from 'firebase-functions/logger';
import axios from 'axios';

const Axios = axios.create({
  baseURL: 'https://www.google-analytics.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const resourceId = apiEvent.resource_id;
  logger.info('>> ', resourceId, ' - Action: ', apiEvent.action);
  const key = `${evName}_${resourceId}`;
  const appData = { ...app.data, ...app.hidden_data };
  if (
    Array.isArray(appData.ignore_events)
    && appData.ignore_events.includes(evName)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }
  logger.info(`> Webhook ${resourceId} [${evName}]`);

  const measurementId = appData.measurement_id;
  const apiSecret = appData.api_secret;

  const order = apiDoc as Orders;
  const orderId = order._id;

  const buyer = order.buyers && order.buyers[0];
  const clientIp = order.client_ip;

  if (orderId && buyer && clientIp && order.items) {
    try {
      if (measurementId && apiSecret) {
        const url = `/mp/collect?api_secret=${apiSecret}&measurement_id=${measurementId}`;

        const items = order.items.map((item) => {
          const eventItem: EventItem = {
            item_id: item.product_id,
            item_name: item.name || item.sku || '',
            price: item.final_price || item.price,
            quantity: item.quantity,
          };

          if (item.variation_id) {
            eventItem.item_variant = item.variation_id;
          }
          if (item.kit_product) {
            eventItem.item_list_id = item.kit_product._id;
            eventItem.item_list_name = item.kit_product.name;
          }
          return eventItem;
        });

        const params: EventParams = {
          currency: order.currency_id || 'BRL',
          transaction_id: (order.transactions && order.transactions[0]._id) || orderId,
          value: order.amount.total,
          items,
        };
        if (order.amount.freight) {
          params.shipping = order.amount.freight;
        }

        if (order.amount.tax || order.amount.extra) {
          params.tax = (order.amount.tax || 0) + (order.amount.extra || 0);
        }

        if (order.extra_discount?.discount_coupon) {
          params.coupon = order.extra_discount.discount_coupon;
        }

        const body = {
          client_id: `${buyer._id}`,
          events: [{
            name: 'purchase',
            params,
          }],
        };

        await Axios.post(url, body);
        return null;
      }
      logger.warn('>> (App google-analytics): measurement_id or api_secret not found (App config)');
      return null;
    } catch (err: any) {
      logger.error('>> (App google-analytics): event error => ', err);
      return null;
    }
  }
  logger.warn('>>(App google-analytics): orderId , buyer or clientIp not found');
  return null;
};

export const analytics = {
  onStoreEvent: createAppEventsFunction(
    'googleAnalytics',
    handleApiEvent,
  ) as any,
};
