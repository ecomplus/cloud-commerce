import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type { Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import config from '@cloudcommerce/firebase/lib/config';
import GalaxpayAxios from '../galaxpay/auth/create-access';

const collectionSubscription = getFirestore().collection('galaxpaySubscriptions');

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
  logger.info(`> Webhook ${resourceId} [${evName}] => ${apiDoc}`);
  const galaxpayAxios = new GalaxpayAxios({
    galaxpayId: appData.galaxpay_id,
    galaxpayHash: appData.galaxpay_hash,
  });

  await galaxpayAxios.preparing;
  const { axios } = galaxpayAxios;
  if (axios) {
    if (evName === 'orders-cancelled') {
      const order = apiDoc as Orders;

      if (!order.subscription_order) {
        const documentSnapshot = await collectionSubscription.doc(order._id).get();
        if (documentSnapshot && documentSnapshot.exists) {
          const docSubscription = documentSnapshot.data();
          if (docSubscription) {
            const { status } = docSubscription.data();
            if (status !== 'cancelled') {
              try {
                await axios.delete(`/subscriptions/${order._id}/myId`);
                await collectionSubscription.doc(order._id)
                  .set({
                    status: 'cancelled',
                    updatedAt: new Date().toISOString(),
                  }, { merge: true })
                  .catch(logger.error);
              } catch (err: any) {
                const statusCode = err.response?.status;
                if (statusCode === 404) {
                  logger.warn('> (App:GalaxPay): Subscription not found in GalaxPay');
                  return null;
                }
                if (statusCode === 401 || statusCode === 403) {
                  logger.warn('> (App:GalaxPay): Unauthorized subscription deletion request');
                  return null;
                }
                throw err;
              }
            }
          }
          logger.warn('> (App:GalaxPay): Subscription not fount in Firestore');
        }
      }
      return null;
    }
    const locationId = config.get().httpsFunctionOptions.region;
    const webhookUrl = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net/galapay-webhook`;

    return axios.put('/webhooks', {
      url: webhookUrl,
      events: ['subscription.addTransaction', 'transaction.updateStatus'],
    });
  }
  logger.warn('> (App GalaxPay) Access not found');
  return null;
};

export default handleApiEvent;
