import type { AppEventsPayload } from '@cloudcommerce/types';
import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import { handleErr } from './utils';
// const { firestore } = require('firebase-admin');

export default async (
  trigger: AppEventsPayload['apiEvent'],
  application: AppEventsPayload['app'],
) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  logger.log('# Carts');
  if (appData.is_abandoned_after_days) {
    const cartId = trigger.resource_id;
    try {
      const cart = (await api.get(`carts/${cartId}`)).data;
      if (cart) {
        const { customers, available, completed } = cart;
        if (available && completed === false) {
          const afterDaysInMs = (appData.is_abandoned_after_days || 1) * 24 * 60 * 60 * 1000;
          const createAt = new Date();
          const sendIn = new Date(createAt.getTime() + afterDaysInMs);
          const customerId = customers[0];

          getFirestore()
            .collection('sg_abandoned_cart')
            .doc(cartId)
            .set({
              cartId,
              customerId,
              createAt,
              sendIn,
            }, { merge: true })
            .then(() => {
              // console.log('>> Cart saved successfully')
              return { message: 'SUCCESS' };
            });
        } else {
          // console.log('>> Cart already completed or available')
          return { message: 'SUCCESS' };
        }
      } else {
        // console.error('>> Not Found Cart')
        return { status: 400, message: 'Not Found Cart' };
      }
    } catch (err) {
      return handleErr(err);
    }
  } else {
    // console.error('>> Send email for abandoned carts not configured #s: ', storeId)
    return { status: 400, message: 'Send email for abandoned carts not configuredt' };
  }
  return { message: 'SUCCESS' };
};
