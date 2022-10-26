import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import { sgSendMail } from './utils';
import parseCartToSend from './parse-data-to-send';

export default async () => {
  try {
    logger.log('# Check abandoned carts');
    const [application] = (await api.get(
      'applications?app_id=129856&fields=hidden_data,data',
    )).data.result;

    const appData = {
      ...application.data,
      ...application.hidden_data,
    };

    let filterCartsDate = '';
    const limitDate = new Date();
    limitDate.setHours(limitDate.getHours() - (appData.abandoned_cart_delay || 3));
    const lastNotificationSent = (await getFirestore().doc('sendGrid/lastCartSent').get()).data();
    if (lastNotificationSent && lastNotificationSent.time) {
      const lastNotifiedCart = new Date(lastNotificationSent.time);
      filterCartsDate += `&create_at>=${lastNotifiedCart.toISOString()}`;
    } else {
      const limitStartDate = new Date();
      limitStartDate.setHours(limitDate.getHours() - (8 * (appData.abandoned_cart_delay || 3)));
      filterCartsDate += `&create_at>=${limitStartDate.toISOString()}`;
    }

    filterCartsDate += `&created_at<=${limitDate.toISOString()}`;

    const [
      { data: { result: abandonedCarts } },
      { data: store },
    ] = await Promise.all([
      api.get(`carts?completed=false&available=true${filterCartsDate}&limit=100&sort=created_at`),
      api.get('stores/me'),
    ]);

    if (abandonedCarts.length && store) {
      for (let i = 0; i < abandonedCarts.length; i++) {
        const cart = abandonedCarts[i];
        const customerId = cart.customers ? cart.customers[0] : null;

        logger.log(`>> Preparing to send email to: ${customerId}, about cart:${cart._id} `);

        const apiKey = appData.sendgrid_api_key;
        const merchantEmail = appData.sendgrid_mail;
        if (apiKey && merchantEmail && customerId) {
          // eslint-disable-next-line no-await-in-loop
          const customer = (await api.get(`customers/${customerId}`)).data;
          if (cart && customer) {
            const emailData = parseCartToSend(appData, 'abandoned_cart', cart, store, customer);
            if (emailData) {
              // eslint-disable-next-line no-await-in-loop
              await sgSendMail(emailData, apiKey);
              // save last cart
              getFirestore()
                .doc('sendGrid/lastCartSent')
                .set({
                  time: cart.created_at,
                }).catch(logger.error);
            } else {
              logger.log('>> Do not send email, email data not found or trigger not configured');
            }
          }
        }
      }
    }
  } catch (err) {
    logger.error('>> Error => ', err);
  }
};
