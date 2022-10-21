import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type { Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/lib/logger';
import handleOrder from './functios-to-sendgrid/handle-orders';

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
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
    logger.warn('Webhook for, SendGrid API key not configured');
    return null;
  }

  if (!appData.sendgrid_mail || appData.sendgrid_mail === '') {
    logger.warn('Webhook, SendGrid Merchant email not configured');
    return null;
  }

  logger.log('> ', action, ': ', resource, ' <');
  switch (resource) {
    case 'orders':
      return handleOrder(apiEvent, app, apiDoc as Orders);
    default:
      return null;
  }
};

export default handleApiEvent;
