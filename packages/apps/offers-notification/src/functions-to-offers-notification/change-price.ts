import type { AppEventsPayload, Products } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import logger from 'firebase-functions/lib/logger';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import tm from '@ecomplus/transactional-mails';
import awsEmail from './aws-emails';

export default async (
  trigger: AppEventsPayload['apiEvent'],
  appData: {[x:string]: any},
  product: Products,
) => {
  const collection = getFirestore().collection('offer_notifications');

  const productId = trigger.resource_id;

  try {
    const querySnapshot = await collection
      .where('product_id', '==', productId)
      .where('customer_criterias', '==', 'price_change')
      .where('notified', '==', false)
      .get();

    if (querySnapshot && !querySnapshot.empty) {
      const store = (await api.get('stores/me')).data;

      const promises: Promise<any>[] = [];
      querySnapshot.forEach(async (doc) => {
        if (doc.data().customer_email !== '') {
          if (product.price && doc.data().product_price > product.price) {
            const customer = {
              main_email: doc.data().customer_email,
              name: {
                given_name: doc.data().customer_name,
              },
            };
            const html = await tm.promo(store, customer, product, 'pt_br')
              .catch((e: any) => logger.log(e));
            const promise = awsEmail(store, appData.main_email, doc.data().customer_email, 'Produto em promoção', html)
              .then(() => collection.doc(doc.id).update({ notified: true }));
            promises.push(promise);
          }
        }
      });

      await Promise.all(promises);
      return { message: 'SUCCESS' };
    }
    return { status: 404, message: 'No e-mails for this specific product' };
  } catch (err) {
    logger.error(err);
    return null;
  }
};
