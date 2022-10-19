import type { AppEventsPayload, Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
import parseOrderToSend from './parse-data-to-send';
import { sgSendMail, updateOrderSubresource, handleErr } from './utils';

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
  try {
    const appData = {
      ...application.data,
      ...application.hidden_data,
    };

    const apiKey = appData.sendgrid_api_key;
    logger.log('# Order');
    const { action } = trigger;
    const modifiedFields: AppEventsPayload['apiEvent']['modified_fields'] = [];
    trigger.modified_fields.forEach((field) => {
      if (field === 'payments_history' || field === 'fulfillment') {
        modifiedFields.push(field);
      }
    });

    if (action !== 'delete') {
      const triggerBody = trigger.body;
      const resourceId = trigger.resource_id;
      const insertedId = triggerBody._id || null;
      const orderId = resourceId;

      const [{ data: store }] = await Promise.all([
        api.get('stores/me'),
        // api.get(`orders/${orderId}`),
      ]);

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
                  a: { [x:string]: any; },
                  b: { [x:string]: any; },
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

            if (!isCustomerNotified && lastNotifiedStatus !== checkStatus) {
              logger.log('> Notify the customer <');
              let emailData: any;

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
                  emailData = parseOrderToSend(appData, 'new_order', order, store, customer);
                } else if (
                  checkStatus !== 'under_analysis'
                  || Date.now() - new Date(order.created_at).getTime() > 180000
                ) {
                  emailData = parseOrderToSend(appData, checkStatus, order, store, customer);
                }
              } else {
                if (!order.fulfillment_status) {
                  order.fulfillment_status = {
                    current: checkStatus as Exclude<Orders['fulfillment_status'], undefined>['current'],
                  };
                }
                emailData = parseOrderToSend(appData, checkStatus, order, store, customer);
              }

              if (emailData) {
                try {
                  await sgSendMail(emailData, apiKey);
                  logger.log('>> Email sent');
                  if (subresource === 'payments_history' || subresource === 'fulfillment') {
                    await updateOrderSubresource(orderId, subresource, lastValidRecord, insertedId);
                  }
                  return { message: 'SUCCESS' };
                } catch (e) {
                  logger.error(e);
                  return handleErr(e);
                }
              } else {
                logger.log('>> Do not send email, email data not found or trigger not configured');
                return { message: 'SUCCESS' };
              }
            } else {
              // logger.log('>> Customer already notified of this status')
              return { message: 'SUCCESS' };
            }
          });
        } else {
          // logger.error('>> Not Found Customer')
          return { status: 404, message: 'Not Found Customer' };
        }
      } else {
        // logger.error('>> Not found Order or Store')
        return { status: 404, message: 'Not found Order or Store' };
      }
    } else {
      // logger.log('>> Not send Email, ', action)
      return { message: 'SUCCESS' };
    }
  } catch (err) {
    logger.error(err);
    return null;
  }
  return { message: 'SUCCESS' };
};
