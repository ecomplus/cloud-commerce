import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
import transactionalMails from '@ecomplus/transactional-mails';
import { getFirestore } from 'firebase-admin/firestore';
import email from '@cloudcommerce/emails';
import triggerActions from './trigger-actions';
import { getStore } from './utils';

export default async () => {
  try {
    // logger.log('# Check abandoned carts');
    const [application] = (await api.get(
      'applications?app_id=1243&fields=hidden_data,data',
    )).data.result;

    const store = getStore();

    const appData = {
      ...application.data,
      ...application.hidden_data,
    };

    const lang = (appData.lang && appData.lang === 'Inglês') ? 'en_us' : (store.lang || 'pt_br');

    let filterCartsDate = '';
    const limitDate = new Date();
    /*
      TODO:
      SES app abandoned_cart_delay is set in days rather than hours as suggested here
    */
    limitDate.setHours(limitDate.getHours() - (appData.abandoned_cart_delay || 3));
    const lastNotificationSent = (await getFirestore().doc('sendTransactionalEmails/lastCartSent').get()).data();
    if (lastNotificationSent && lastNotificationSent.time) {
      const lastNotifiedCart = new Date(lastNotificationSent.time);
      filterCartsDate += `&create_at>=${lastNotifiedCart.toISOString()}`;
    } else {
      const limitStartDate = new Date();
      limitStartDate.setHours(limitDate.getHours() - (8 * (appData.abandoned_cart_delay || 3)));
      filterCartsDate += `&create_at>=${limitStartDate.toISOString()}`;
    }

    filterCartsDate += `&created_at<=${limitDate.toISOString()}`;

    const
      { data: { result: abandonedCarts } } = await api.get(
        `carts?completed=false&available=true${filterCartsDate}&limit=100&sort=created_at`,
      );

    if (abandonedCarts.length && store) {
      for (let i = 0; i < abandonedCarts.length; i++) {
        const cart = abandonedCarts[i];
        const customerId = cart.customers ? cart.customers[0] : null;
        // logger.log(`>> Preparing to send email to: ${customerId}, about cart:${cart._id} `);
        if (customerId) {
          // eslint-disable-next-line no-await-in-loop
          const customer = (await api.get(`customers/${customerId}`)).data;
          if (cart && customer) {
            // eslint-disable-next-line no-await-in-loop
            const html = await transactionalMails.abandonedCart(store, customer, cart, lang);
            const subject = triggerActions.abandonedCart.subject[lang];
            const to = [{
              name: customer.display_name,
              email: customer.main_email,
            }];
            const { templateId } = appData.abandoned_car;

            // const template = transactionalMails.template(abandonedCart)
            // TODO: Or another APP? (template MJML)

            if (html && subject && to) {
              // eslint-disable-next-line no-await-in-loop
              await email.send({
                to,
                subject,
                html,
                templateId,
                templateData: {
                  store,
                  customer,
                  cart,
                  lang,
                },
                // template
              });

              // save last cart
              getFirestore()
                .doc('sendTransactionalEmails/lastCartSent')
                .set({
                  time: cart.created_at,
                }).catch(logger.error);
            }
          }
        }
      }
    }
  } catch (err) {
    logger.error('(App Emails) Error => ', err);
  }
};
