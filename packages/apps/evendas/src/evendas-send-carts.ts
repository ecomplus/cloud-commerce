import type { ApiError, ResourceId } from '@cloudcommerce/api/types';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { getFirestore } from 'firebase-admin/firestore';
import axios from 'axios';

export const sendAbandonedCarts = async () => {
  const snapshot = await getFirestore().collection('evendasCartsToSend')
    .where('sendAt', '<=', new Date())
    .orderBy('sendAt')
    .limit(100)
    .get();
  const { docs } = snapshot;
  logger.info(`${docs.length} carts to send`);
  for (let i = 0; i < docs.length; i++) {
    const { data, url } = docs[i].data();
    const cartId = docs[i].ref.id as ResourceId;
    // eslint-disable-next-line no-await-in-loop
    const response = await api.get(`carts/${cartId}`)
      .catch((_error) => {
        const error = _error as ApiError;
        if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
          docs[i].ref.delete();
          logger.warn(`Failed reading cart ${cartId}`, {
            status: error.statusCode,
            response: error.data,
          });
          return;
        }
        throw error;
      });
    if (!response) continue;
    const { data: cart } = response;
    if (cart.completed) continue;
    data.cart = cart;
    // eslint-disable-next-line no-await-in-loop
    await axios.post(url, data).catch((error) => {
      if (error.response) {
        const { status } = error.response;
        if (status < 500) {
          logger.warn(`Failed ${url} with cart ${cartId}`, { data });
          return;
        }
        throw error;
      }
    });
    docs[i].ref.delete();
  }
};

export default sendAbandonedCarts;
