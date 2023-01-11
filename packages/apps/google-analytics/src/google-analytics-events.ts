/* eslint-disable no-undef */
/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import type { Orders } from '@cloudcommerce/types';
import type { EventItem, EventParams } from '../types';
import { getFirestore } from 'firebase-admin/firestore';
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

const getSentEventFirestore = (
  collectionEventsSent: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
  orderId: string,
): Promise<FirebaseFirestore.DocumentData | undefined | false> => new Promise((resolve) => {
  const subscription = collectionEventsSent.doc(orderId);
  subscription.get()
    .then((documentSnapshot) => {
      if (documentSnapshot.exists) {
        resolve(documentSnapshot.data());
      } else {
        resolve(false);
      }
    })
    .catch(() => {
      resolve(false);
    });
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

  const enabledCustonEvent = order.financial_status?.current && appData.custom_events;
  const enabledRefundEvent = order.status === 'cancelled' && appData.refund_event !== false;

  if (orderId && buyer && clientIp && order.items) {
    try {
      if (measurementId && apiSecret && (enabledCustonEvent || enabledRefundEvent)) {
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
          id: orderId,
          currency: order.currency_id || 'BRL',
          transaction_id: orderId,
          value: order.amount.total,
          status: order.financial_status?.current || order.status,
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

        const events: {
          name: string,
          params: EventParams
        }[] = [];

        const collectionEventsSent = getFirestore().collection('googleAnalyticsEventsSent');
        let customEventsSent: string[] = [];
        const eventFirestore = await getSentEventFirestore(collectionEventsSent, orderId);

        if (enabledCustonEvent && order.financial_status) {
          const eventName = `purchase_${order.financial_status.current}`;
          customEventsSent = (eventFirestore && eventFirestore.customEventsSent) || [];

          if (customEventsSent[customEventsSent.length - 1] !== eventName) {
            events.push({
              name: eventName,
              params,
            });

            customEventsSent.push(eventName);
          }
        }

        if (enabledRefundEvent && (!eventFirestore || eventFirestore.status !== 'cancelled')) {
          events.push({
            name: 'refund',
            params,
          });
        }
        // https://developers.google.com/analytics/devguides/collection/ga4/reference/events?client_type=gtag#purchase

        const body = {
          client_id: buyer._id,
          events,
        };
        // logger.log('(App google-analytics): url: ', url, ' body: ', JSON.stringify(body));

        await Axios.post(url, body);

        collectionEventsSent.doc(orderId)
          .set({
            status: order.status,
            customEventsSent,
            updatedAt: new Date().toISOString(),
          }, { merge: true })
          .catch(logger.error);

        return null;
      }

      logger.warn('>> measurement_id or api_secret not found,'
        + ' or disabled event (App config)');

      return null;
    } catch (err: any) {
      logger.error('>> event error => ', err);
      return null;
    }
  }
  logger.warn('>> orderId , buyer or clientIp not found');
  return null;
};

export const analytics = {
  onStoreEvent: createAppEventsFunction(
    'googleAnalytics',
    handleApiEvent,
  ) as any,
};
