import type { Orders } from '@cloudcommerce/types';
import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';

type BodyOrder = Omit<Orders, '_id' | 'created_at' | 'updated_at' | 'store_id' >

export default async (
  orderBody:BodyOrder,
  acessToken:string,
) => {
  try {
    const orderId = (await api.post(
      'orders',
      orderBody,
      {
        headers: {
          Authorization: acessToken,
        },
      },
    )).data._id;

    return new Promise<Orders|null>((resolve) => {
      setTimeout(async () => {
        try {
          const order = (await api.get(
            `orders/${orderId}`,
            {
              headers: {
                Authorization: acessToken,
              },
            },
          )).data;
          resolve(order);
        } catch (e) {
          logger.error(e);
          resolve(null);
        }
      }, 800);
    });
  } catch (e) {
    logger.error(e);
    return null;
  }
};
