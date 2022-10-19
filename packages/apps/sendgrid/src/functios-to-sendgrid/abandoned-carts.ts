import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
// eslint-disable-next-line import/no-unresolved
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
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

    const abandonedCarts = await getFirestore().collection('sg_abandoned_cart')
      .where('sendIn', '<', Timestamp.fromDate(new Date()))
      .limit(400) // https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api/rate-limits
      .get();

    const allDocsCarts = abandonedCarts.docs;

    if (allDocsCarts && Array.isArray(allDocsCarts)) {
      allDocsCarts.forEach(async (snapshot) => {
        const doc = snapshot.data();
        // logger.log('>>Doc: ', doc)
        const { storeId } = doc;
        const { cartId } = doc;
        const { customerId } = doc;
        logger.log(`>> Preparing to send email: s:${storeId}, cart:${cartId} `);
        // get app configured options

        const apiKey = appData.sendgrid_api_key;
        const merchantEmail = appData.sendgrid_mail;
        if (apiKey && merchantEmail) {
          const [{ data: store }, { data: cart }, { data: customer }] = await Promise.all([
            api.get('stores/me'),
            api.get(`carts/${cartId}`),
            api.get(`customers/${customerId}`),
          ]);
          if (cart && store && customer) {
            if (cart.available && cart.completed === false) {
              const emailData = parseCartToSend(appData, 'abandoned_cart', cart, store, customer);
              if (emailData) {
                sgSendMail(emailData, apiKey)
                  .then(() => {
                    logger.log('>> Email sent ');
                    snapshot.ref.delete()
                      .catch(logger.error);
                  })
                  .catch((err) => {
                    logger.error(`>>#${storeId} Error send email => `, err);
                  });
              } else {
                logger.log(`>> Do not send email, email data not found or trigger not configured #${storeId}`);
              }
            }
          }
        }
      });
    }
  } catch (err) {
    logger.error('>> Error => ', err);
  }
};
