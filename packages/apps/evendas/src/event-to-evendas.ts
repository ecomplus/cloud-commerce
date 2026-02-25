import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type { ApiError, Customers, Carts } from '@cloudcommerce/api/types';
import api from '@cloudcommerce/api';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import axios from 'axios';

const handleApiEvent: ApiEventHandler = async ({
  apiEvent,
  apiDoc,
  app,
}) => {
  const appData = { ...app.data, ...app.hidden_data };
  const {
    action,
    resource,
    resource_id: resourceId,
  } = apiEvent;
  if (resource !== 'orders' && resource !== 'carts') return null;
  if (action === 'delete') return null;
  if (!process.env.EVENDAS_TOKEN) {
    process.env.EVENDAS_TOKEN = appData.evendas_token;
  }
  const { EVENDAS_TOKEN } = process.env;
  if (!EVENDAS_TOKEN) {
    logger.warn('Missing E-Vendas token');
    return null;
  }
  const { storeId } = config.get();
  const trigger = {
    store_id: storeId,
    datetime: apiEvent.timestamp,
    method: action === 'create' ? 'POST' : 'PATCH',
    action,
    resource,
    resource_id: resourceId,
    inserted_id: action === 'create' ? resourceId : undefined,
  };
  const url = `https://api.e-vendas.net.br/api/padrao/ecomplus/${EVENDAS_TOKEN}`;
  if (resource === 'carts') {
    const cart = apiDoc as Carts;
    if (cart.available && !cart.completed) {
      const abandonedCartDelay = (appData.cart_delay || 0) * 1000 * 60;
      const { customers } = cart;
      let customer: Customers | undefined;
      if (customers?.[0]) {
        try {
          customer = (await api.get(`customers/${customers[0]}`)).data;
        } catch (_error) {
          customer = undefined;
          const error = _error as ApiError;
          logger.warn(`Failed getting customer ${customers[0]} for cart ${resourceId}`, {
            statusCode: error.statusCode,
            data: error.data,
          });
        }
      }
      const sendAtMs = new Date(cart.created_at).getTime() + abandonedCartDelay;
      const docRef = getFirestore().doc(`evendasCartsToSend/${cart._id}`);
      await docRef.set({
        data: {
          storeId,
          trigger,
          cart,
          customer,
        },
        url,
        sendAt: Timestamp.fromDate(new Date(sendAtMs)),
      });
    }
    return null;
  }
  axios({
    method: 'post',
    url,
    data: {
      storeId,
      trigger,
      [resource.slice(0, -1)]: apiDoc,
    },
  });
  return null;
};

export default handleApiEvent;
