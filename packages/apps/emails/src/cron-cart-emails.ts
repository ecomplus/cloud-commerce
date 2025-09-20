import type { ApiError } from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import getAppData from '@cloudcommerce/firebase/lib/helpers/get-app-data';
import { sendEmail } from '@cloudcommerce/emails';
import { getStore, getMailRender } from './util/emails-utils';
import getMailTempl from './util/get-mail-templ';

const sendCartEmails = async () => {
  const appData = await getAppData('emails', ['data']);
  const mailOptions = appData.abandoned_cart || {};
  if (mailOptions.disable_customer === true) {
    return;
  }
  const daysDelay = parseInt(appData.is_abandoned_after_days, 10) || 1;
  const d = new Date();
  d.setDate(d.getDate() - daysDelay);
  const {
    data: { result: abandonedCarts },
  } = await api.get('carts', {
    params: {
      'completed': false,
      'available': true,
      'flags': 'open-checkout',
      'updated_at<': d.toISOString(),
    },
    fields: ['_id', 'flags', 'completed', 'customers'] as const,
    sort: ['-updated_at'],
    limit: 100,
  });
  if (!abandonedCarts.length) {
    return;
  }
  const store = getStore();
  const lang = appData.lang === 'Inglês' ? 'en_us' : (store.lang || 'pt_br');
  const mailTempl = getMailTempl('abandoned_cart')!;
  const subject = mailTempl.subject[lang as 'pt_br'];
  const customMessage = mailOptions.custom_message;
  const render = await getMailRender(mailTempl?.templ);
  for (let i = 0; i < abandonedCarts.length; i++) {
    const cart = abandonedCarts[i];
    if (cart.completed || !cart.flags?.includes('open-checkout')) {
      logger.warn(`Invalid cart ${cart._id}`, { cart });
      continue;
    }
    const customerId = cart.customers?.[0];
    const flags: string[] = [];
    if (!customerId) {
      logger.info(`Cart ${cart._id} skipped without customer ID`);
      flags.push('email-skipped');
    } else {
      try {
        // eslint-disable-next-line no-await-in-loop
        const { data: customer } = await api.get(`customers/${customerId}`);
        // eslint-disable-next-line no-await-in-loop
        const html = await render(
          store,
          customer,
          {
            ...cart,
            permalink: `https://${store.domain}/app/#/cart/`
             + '?utm_source=ecomplus&utm_medium=email&utm_campaign=abandoned_cart'
             + `#/cart/${cart._id}`,
          },
          lang,
          customMessage,
        );
        if (html) {
          // eslint-disable-next-line no-await-in-loop
          await sendEmail(
            {
              to: [{
                name: customer.display_name,
                email: customer.main_email,
              }],
              subject,
              html,
              templateId: mailOptions.template_id,
              templateData: {
                store,
                customer,
                cart,
                lang,
                customMessage,
              },
            },
          );
          flags.push('email-sent');
        }
      } catch (err: any) {
        const error: ApiError = err;
        if (error.statusCode === 404) {
          logger.warn(`Customer not found by id ${customerId}`, { cart });
        } else {
          logger.error(err);
          continue;
        }
      }
    }
    api.patch(`carts/${cart._id}`, { flags });
  }
};

export default sendCartEmails;
