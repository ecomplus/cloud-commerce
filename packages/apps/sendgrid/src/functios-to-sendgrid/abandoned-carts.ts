import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import { sgSendMail } from './utils';
import parseCartToSend from './parse-data-to-send';

export default async () => {
  try {
    logger.log('# Check abandoned carts');
    const [application] = (await api.get(
      'applications?app_id=111223&fields=hidden_data',
    )).data.result;

    const appData = {
      ...application.data,
      ...application.hidden_data,
    };

    let minCartDate = new Date();
    minCartDate.setHours(minCartDate.getHours() - (appData.abandoned_cart_delay || 3));
    const lastDateSent = (await getFirestore().doc('sendGrid/lastCartSent').get()).data();
    if (lastDateSent && lastDateSent.created_at) {
      const lastNotifiedCartDate = new Date(lastDateSent.created_at);
      if (lastNotifiedCartDate.getTime() > minCartDate.getTime()) {
        minCartDate = lastNotifiedCartDate;
      }
    }

    const [
      { data: { result: abandonedCarts } },
      { data: store },
    ] = await Promise.all([
      api.get(`carts?completed=false&available=true&metafields.field!=sendgrid_sent&created_at>=${minCartDate.toISOString()}`),
      api.get('stores/me'),
    ]);

    if (abandonedCarts.length && store) {
      // const store = (await api.get('stores/me')).data;
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
              sgSendMail(emailData, apiKey)
                .then(() => {
                  logger.log('>> Email sent ');

                  api.post(
                    `carts/${cart._id}/metafields`,
                    {
                      field: 'sendgrid_sent',
                      value: true,
                    } as any,
                  );

                  if (i === (abandonedCarts.length - 1)) {
                    // save last cart
                    getFirestore()
                      .doc('sendGrid/lastCartSent')
                      .set({
                        cartId: cart._id,
                        create_at: cart.created_at,
                      }).catch(logger.error);
                  }
                })
                .catch((err) => {
                  logger.error('>>#Error send email => ', err);
                });
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
