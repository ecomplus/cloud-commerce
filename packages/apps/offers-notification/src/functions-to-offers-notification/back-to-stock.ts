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
  try {
    const collection = getFirestore().collection('offer_notifications');
    const productId = trigger.resource_id;

    const querySnapshot = await collection
      .where('product_id', '==', productId)
      .where('customer_criterias', '==', 'out_of_stock')
      .where('notified', '==', false)
      .get();

    if (querySnapshot && !querySnapshot.empty) {
      const store = (await api.get('stores/me')).data;

      const promises: Promise<any>[] = [];
      querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        if (data.customer_email !== '') {
          if (data.variation_id) {
            const variation = product.variations
              ? product.variations.find(({ _id }) => _id === data.variation_id)
              : null;
            if (!variation || !variation.quantity) {
              return;
            }
          }
          const customer = {
            main_email: data.customer_email,
            name: {
              given_name: data.customer_name,
            },
          };
          const html = await tm.stock(store, customer, product, 'pt_br')
            .catch((e: any) => logger.log(e));
          const promise = awsEmail(store, appData.main_email, data.customer_email, 'Produto em estoque', html)
            .then(() => collection.doc(doc.id).update({ notified: true }));
          promises.push(promise);
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
