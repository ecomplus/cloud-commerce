import type { AppEventsPayload, Orders } from '@cloudcommerce/types';
import transactionalMails from '@ecomplus/transactional-mails';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import email from '@cloudcommerce/emails';
import { toCamelCase, updateOrderSubresource, getStore } from './utils';
import triggerActions from './trigger-actions';

const orderStatus = [
  'pending',
  'under_analysis',
  'authorized',
  'unauthorized',
  'partially_paid',
  'paid',
  'in_dispute',
  'partially_refunded',
  'refunded',
  'canceled',
  'voided',
  'invoice_issued',
  'in_production',
  'in_separation',
  'ready_for_shipping',
  'partially_shipped',
  'shipped',
  'partially_delivered',
  'delivered',
  'returned_for_exchange',
  'received_for_exchange',
  'returned',
];

export default async (
  trigger: AppEventsPayload['apiEvent'],
  application: AppEventsPayload['app'],
  order: Orders,
) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  const store = getStore();

  // logger.log('# Order');
  const { action } = trigger;
  const modifiedFields: AppEventsPayload['apiEvent']['modified_fields'] = [];
  trigger.modified_fields.forEach((field) => {
    if (field === 'payments_history' || field === 'fulfillment') {
      modifiedFields.push(field);
    }
  });

  const lang = (appData.lang && appData.lang === 'Inglês') ? 'en_us' : (store.lang || 'pt_br');
  let html: string | undefined;
  let templateId: string | undefined;

  if (action !== 'delete') {
    const triggerBody = trigger.body;
    const resourceId = trigger.resource_id;
    const insertedId = triggerBody._id || null;
    const orderId = resourceId;

    if (store && order && order.buyers && order.buyers) {
      let checkStatus: string | undefined = order.status;
      let lastValidRecord: { status: string; };
      const customerId = order.buyers[0]._id;
      const customer = (await api.get(`customers/${customerId}`)).data;
      // fulfillment payments_history
      if (customer) {
        modifiedFields.forEach(async (subresource) => {
          let isCustomerNotified: boolean = false;
          let lastNotifiedStatus: string | undefined;

          if (Array.isArray(order[subresource])) {
            const sortedRecords = order[subresource]
              .sort((
                a: { [x: string]: any; },
                b: { [x: string]: any; },
              ) => (a.date_time > b.date_time ? -1 : 1));

            lastValidRecord = sortedRecords.find(
              ({ status }) => orderStatus.includes(status),
            );

            if (lastValidRecord) {
              checkStatus = lastValidRecord.status;
            }

            isCustomerNotified = Boolean(order[subresource]
              .find((entry) => entry._id === insertedId && entry.customer_notified));

            if (!isCustomerNotified) {
              const lastNotification = sortedRecords.find((entry) => entry.customer_notified);

              if (lastNotification) {
                lastNotifiedStatus = lastNotification.status;
              }
            }
          }

          if (checkStatus) {
            const triggerStatus = toCamelCase(checkStatus);
            let subject = `${triggerActions[triggerStatus].subject[lang]} #${order.number}`;
            /*
                TODO: The SES application configuration file is in SnakeCase
                when referring to status.
                In case application settings change to CamelCase,
                change checkStatus to triggerStatus
              */

            let customMessage: any;
            if (appData[checkStatus] && appData[checkStatus].custom_message) {
              customMessage = appData[checkStatus].custom_message;
            }

            if (!isCustomerNotified && lastNotifiedStatus !== checkStatus) {
              // logger.log('> Notify the customer <');

              if (subresource === 'payments_history') {
                if (!order.financial_status) {
                  order.financial_status = {
                    current: checkStatus as Exclude<Orders['financial_status'], undefined>['current'],
                  };
                }

                if (
                  !lastNotifiedStatus
                  && order.status !== 'cancelled'
                  && checkStatus !== 'unauthorized'
                  && checkStatus !== 'in_dispute'
                  && checkStatus !== 'refunded'
                  && checkStatus !== 'voided'
                ) {
                  // new order
                  subject = `${triggerActions.newOrder.subject[lang]} #${order.number}`;
                  if (appData.new_order && appData.new_order.custom_message) {
                    customMessage = appData.new_order.custom_message;
                  } else {
                    customMessage = undefined;
                  }
                  templateId = appData.new_order && appData.new_order.templateId;
                  html = await transactionalMails.new_order(
                    store,
                    customer,
                    order,
                    lang,
                    customMessage,
                  );
                } else if (
                  checkStatus !== 'under_analysis'
                  || Date.now() - new Date(order.created_at).getTime() > 180000
                ) {
                  // TODO: appData[ ] is in SnakeCase

                  templateId = appData[checkStatus] && appData[checkStatus].templateId;
                  html = await transactionalMails[triggerStatus](
                    store,
                    customer,
                    order,
                    lang,
                    customMessage,
                  );
                }
              } else {
                if (!order.fulfillment_status) {
                  order.fulfillment_status = {
                    current: checkStatus as Exclude<Orders['fulfillment_status'], undefined>['current'],
                  };
                }

                // TODO: appData[ ] is in SnakeCase
                templateId = appData[checkStatus] && appData[checkStatus].templateId;
                html = await transactionalMails[triggerStatus](
                  store,
                  customer,
                  order,
                  lang,
                  customMessage,
                );
              }

              if (html) {
                // const template = transactionalMails.template(triggerStatus)
                // TODO: Need to change (PR) in transactionalMails?

                const to = [{
                  name: customer.display_name,
                  email: customer.main_email,
                }];
                await email.send(
                  {
                    to,
                    subject,
                    html,
                    templateId,
                    templateData: {
                      store,
                      customer,
                      order,
                      lang,
                      customMessage,
                    },
                    // template
                  },
                );
                // logger.log('>> Email sent');
                if (subresource === 'payments_history' || subresource === 'fulfillment') {
                  await updateOrderSubresource(
                    orderId,
                    subresource,
                    lastValidRecord,
                    insertedId,
                  );
                }
                return { message: 'SUCCESS' };
              }
              return { message: 'SUCCESS' };
            }
            // logger.log('>> Customer already notified of this status')
            return { message: 'SUCCESS' };
          }
          // TODO: check message
          logger.warn('(App Emails) Not Found Status');
          // Nothing to do
          return null;
        });
      } else {
        logger.warn('(App Emails) Not Found Customer');
      }
    } else {
      logger.warn('(App Emails) Not found Order or Store');
    }
  }
  // Nothing to do
  return null;
};
