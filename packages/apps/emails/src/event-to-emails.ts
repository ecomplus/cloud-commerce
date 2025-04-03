import type { ApiError, Orders, Customers } from '@cloudcommerce/api/types';
import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type { PaymentHistoryEntry, FulfillmentsEntry } from './util/emails-utils';
import { logger } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import { sendEmail } from '@cloudcommerce/emails';
import { getStore, getMailRender } from './util/emails-utils';
import getMailTempl from './util/get-mail-templ';

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const { action, resource } = apiEvent;
  if (!evName.startsWith('orders-') || action === 'delete') {
    logger.warn(`Skipping ${resource} ${action}`);
    return null;
  }
  const order = apiDoc as Orders;
  if (!order.buyers?.length) {
    logger.warn('Skipping order document without buyer');
    return null;
  }
  const appData = { ...app.data, ...app.hidden_data };
  const store = getStore();
  const modifiedFields = apiEvent.modified_fields.filter((field) => {
    return field === 'payments_history' || field === 'fulfillments';
  }) as Array<'payments_history' | 'fulfillments'>;
  if (!modifiedFields.length) {
    return null;
  }
  const lang = appData.lang === 'Inglês' ? 'en_us' : (store.lang || 'pt_br');
  const orderId = order._id;
  const customerId = order.buyers[0]._id;
  let customer: Customers | undefined;
  try {
    customer = (await api.get(`customers/${customerId}`)).data;
  } catch (err: any) {
    const error: ApiError = err;
    if (error.statusCode === 404) {
      logger.warn(`Customer not found by id ${customerId}`, { orderId });
      return null;
    }
  }
  if (customer) {
    for (let i = 0; i < modifiedFields.length; i++) {
      const subresource = modifiedFields[i];
      if (order[subresource]?.length) {
        const sortedRecords = order[subresource]
          .sort((
            a: PaymentHistoryEntry | FulfillmentsEntry,
            b: PaymentHistoryEntry | FulfillmentsEntry,
          ) => {
            if (!a.date_time || !b.date_time) return 0;
            return a.date_time > b.date_time ? -1 : 1;
          });
        const lastStatusRecord = sortedRecords[0];
        if (lastStatusRecord.customer_notified) {
          continue;
        }
        const { status } = lastStatusRecord;
        const lastNotification = sortedRecords.find((entry) => entry.customer_notified);
        if (lastNotification && lastNotification?.status === status) {
          continue;
        }
        let templKey: typeof status | 'new_order' = status;
        if (subresource === 'payments_history') {
          if (evName === 'orders-new') {
            templKey = 'new_order';
          } else if (!lastNotification && order.status !== 'cancelled') {
            switch (status) {
              case 'unauthorized':
              case 'in_dispute':
              case 'refunded':
              case 'voided':
                break;
              default:
                templKey = 'new_order';
            }
          }
        }
        const mailTempl = getMailTempl(templKey);
        if (!mailTempl) {
          logger.warn(`Skipped unmatched template for ${templKey}`);
          continue;
        }
        const subject = `${mailTempl.subject[lang]} #${order.number}`;
        const mailOptions = (appData[templKey] || {}) as {
          disable_customer?: boolean,
          disable_merchant?: boolean,
          custom_message?: string,
          template_id?: string,
        };
        const customMessage = mailOptions.custom_message;
        if (subresource === 'payments_history') {
          if (!order.financial_status) {
            order.financial_status = {
              current: status as PaymentHistoryEntry['status'],
            };
          }
        } else if (!order.fulfillment_status) {
          order.fulfillment_status = {
            current: status as FulfillmentsEntry['status'],
          };
        }
        // eslint-disable-next-line no-await-in-loop
        const render = await getMailRender(mailTempl.templ);
        // eslint-disable-next-line no-await-in-loop
        const html = await render(
          store,
          customer,
          order,
          lang,
          customMessage,
        );
        if (html) {
          const buyerMailAddress = {
            name: customer.display_name,
            email: customer.main_email,
          };
          const merchantMailAddress = {
            name: customer.display_name,
            email: appData.lojista_mail || store.contact_email,
          };
          // eslint-disable-next-line no-await-in-loop
          await sendEmail(
            {
              to: !mailOptions.disable_customer
                ? [buyerMailAddress]
                : [merchantMailAddress],
              bcc: !mailOptions.disable_customer && !mailOptions.disable_merchant
                ? [merchantMailAddress]
                : undefined,
              subject,
              html,
              templateId: mailOptions.template_id,
              templateData: {
                store,
                customer,
                order,
                lang,
                customMessage,
              },
            },
          );
          api.patch(`orders/${orderId}/${subresource}/${lastStatusRecord._id}`, {
            customer_notified: true,
          }).catch(logger.warn);
        }
      }
    }
  }
  return null;
};

export default handleApiEvent;
