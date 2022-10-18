import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import logger from 'firebase-functions/lib/logger';
import handleOrder from './functios-to-sendgrid/handle-orders';
import saveCarts from './functios-to-sendgrid/save-carts';

/*
'orders-new'
'orders-anyStatusSet'
'orders-paid'
'orders-readyForShipping'
'orders-shipped'
'orders-delivered'
'orders-cancelled'
'carts-new'
*/

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  logger.log('>> API Events for SendGrid');

  const { resource, action } = apiEvent;
  const appData = { ...app.data, ...app.hidden_data };
  const resourceId = apiEvent.resource_id;
  const key = `${evName}_${resourceId}`;

  if (
    Array.isArray(appData.ignore_events)
    && appData.ignore_events.includes(evName)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }

  if (!appData.sendgrid_api_key || appData.sendgrid_api_key === '') {
    logger.info('Webhook for, SendGrid API key not configured');
    return null;
  }

  if (!appData.sendgrid_mail || appData.sendgrid_mail === '') {
    logger.info('Webhook, SendGrid Merchant email not configured');
    return null;
  }

  logger.log('> ', action, ': ', resource, ' <');
  switch (resource) {
    case 'carts': // abandoned cart
      return saveCarts(apiEvent, app);

    case 'orders':
      return handleOrder(apiEvent, app);
    default:
      break;
  }
  // Nothing to do
  return null;
};

export default handleApiEvent;
