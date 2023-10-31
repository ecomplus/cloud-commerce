import api from '@cloudcommerce/api';
import logger from 'firebase-functions/logger';
// import config from '@cloudcommerce/firebase/lib/config';
import { getFirestore } from 'firebase-admin/firestore';
import ecomUtils from '@ecomplus/utils';
import axios from './functions-lib/pagarme/create-axios.mjs';
import { getOrderWithQueryString } from './functions-lib/api-utils.mjs';
import { getDocFirestore } from './functions-lib/firestore-utils.mjs';

const colletionFirebase = getFirestore().collection('pagarmeV5Subscriptions');

const eventOrderCancelled = async (
  apiDoc,
  pagarmeAxios,
) => {
  const order = apiDoc;
  if (order?.transactions[0]?.type === 'recurrence') {
    const { data: { data: subcriptions } } = await pagarmeAxios.get(`/subscriptions?code=${order._id}`);
    if (subcriptions && subcriptions[0].status !== 'canceled') {
      try {
        logger.log(`> (App PagarMe V5): Try cancel subscription: #${order._id}`);
        await pagarmeAxios.delete(`/subscriptions/${subcriptions[0].id}`);
        logger.log('> (App PagarMe V5):  Successfully canceled');
        await colletionFirebase.doc(order._id)
          .set({
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          }, { merge: true })
          .catch(logger.error);

        logger.log('>> SUCESSS');
        return null;
      } catch (err) {
        logger.error('> (App PagarMe V5): Error when canceling in Pagar.Me, return the status');
        await api.patch(order._id, { status: 'open' })
          .catch(logger.error);

        return null;
      }
    } else {
      logger.log('> (App PagarMe V5): Subscription already canceled or does not exist');
      return null;
    }
  }
  // edit items order order Original
  return null;
};

const eventProducts = async (
  apiDoc,
  pagarmeAxios,
) => {
  // console.log('> Edit product ', resourceId, 's: ', storeId);
  const product = apiDoc;

  let query = 'status!=cancelled&transactions.type=recurrence';
  query += '&transactions.app.intermediator.code=pagarme';
  query += `&items.product_id=${product._id}`;

  const result = await getOrderWithQueryString(query);

  if (result && result.length) {
    let i = 0;
    while (i < result.length) {
      const updateItemPagarme = [];
      // eslint-disable-next-line no-await-in-loop
      const order = (await api.get(`orders/${result[i]._id}`)).data;
      // eslint-disable-next-line no-await-in-loop
      const docSubscription = await getDocFirestore(colletionFirebase, result[i]._id);
      logger.log('> (App PagarMe v5): Order ', JSON.stringify(order), ' ', JSON.stringify(docSubscription));
      if (order && docSubscription) {
        const itemsUpdate = [];
        order.items.forEach((orderItem) => {
          if (orderItem.product_id === product._id) {
            if (orderItem.variation_id) {
              const variation = product.variations
                .find((itemFind) => itemFind.sku === orderItem.sku);

              let quantity = orderItem.quantity;
              if (variation && variation.quantity < orderItem.quantity) {
                quantity = variation.quantity;
              } else if (!variation) {
                quantity = 0;
              }
              const newItem = {
                sku: variation.sku,
                price: ecomUtils.price({ ...product, ...variation }),
                quantity,
              };
              if ((orderItem.final_price && orderItem.final_price !== newItem.price)
                || orderItem.price !== newItem.price || orderItem.quantity !== newItem.quantity) {
                itemsUpdate.push(newItem);
              }
            } else {
              const newItem = {
                sku: product.sku,
                price: ecomUtils.price(product),
                quantity: product.quantity < orderItem.quantity
                  ? product.quantity : orderItem.quantity,
              };
              if ((orderItem.final_price && orderItem.final_price !== newItem.price)
                || orderItem.price !== newItem.price || orderItem.quantity !== newItem.quantity) {
                itemsUpdate.push(newItem);
              }
            }
          }
        });

        if (itemsUpdate.length) {
          docSubscription?.items?.forEach((itemPagarme) => {
            const itemToEdit = itemsUpdate.find((itemFind) => itemPagarme.id === `pi_${itemFind.sku}`);
            if (itemToEdit && !itemPagarme.cycles) {
              itemPagarme.quantity = itemToEdit.quantity;
              itemPagarme.pricing_scheme.price = Math.floor((itemToEdit.price) * 100);
              updateItemPagarme.push({
                subscription_id: docSubscription.subscriptionPagarmeId,
                item: itemPagarme,
              });
            }
          });
        }
      }
      // order not found or error
      if (updateItemPagarme.length) {
        logger.log('> (App PagarMe V5): Try update item in Pagar.Me');
        try {
          // eslint-disable-next-line no-await-in-loop
          await Promise.all(updateItemPagarme.map((itemPagarme) => {
            return pagarmeAxios.put(
              `/subscriptions/${itemPagarme.subscription_id}/items/${itemPagarme.item.id}`,
              {
                ...itemPagarme.item,
              },
            );
          }));
        } catch (err) {
          logger.error(err);
          /* When creating a new order, check the items saved in Pagar.Me
            with the original order items

           No need to save to firestore
          */
        }
      }
      i += 1;
    }
    logger.log('>> SUCESSS');
    return null;
  }
  logger.log('>> Orders not found ');
  return null;
};

const handleApiEvent = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const resourceId = apiEvent.resource_id;
  logger.info('>> ', resourceId, ' - Action: ', apiEvent.action);
  const key = `${evName}_${resourceId}`;
  const configApp = { ...app.data, ...app.hidden_data };
  if (
    Array.isArray(configApp.ignore_events)
    && configApp.ignore_events.includes(evName)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }
  logger.info(`> Webhook ${resourceId} [${evName}] => ${apiDoc}`);

  if (!process.env.PAGARMEV5_API_TOKEN) {
    const pagarmeApiToken = configApp.pagarme_api_token;
    if (pagarmeApiToken && typeof pagarmeApiToken === 'string') {
      process.env.PAGARMEV5_API_TOKEN = pagarmeApiToken;
    } else {
      logger.warn('Missing PAGARMEV5 API TOKEN');
      return null;
    }
  }

  try {
    const pagarmeAxios = axios(process.env.PAGARMEV5_API_TOKEN);

    if (evName === 'orders-cancelled') {
      return eventOrderCancelled(apiDoc, pagarmeAxios);
    }

    if (evName.startsWith('products-') && evName !== 'products-new') {
      return eventProducts(apiDoc, pagarmeAxios);
    }

    return null;
  } catch (error) {
    const statusCode = error.response?.status;
    if (statusCode === 404) {
      logger.warn('> (App PagarMe V5): Subscription not found in PagarMe');
      return null;
    }
    if (statusCode === 401 || statusCode === 403) {
      logger.warn('> (App PagarMe V5): Unauthorized subscription deletion request');
      return null;
    }
    throw error;
  }
};

export default handleApiEvent;
