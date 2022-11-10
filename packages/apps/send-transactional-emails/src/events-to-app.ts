import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type { Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import handleOrder from './functios-lib/handle-orders';

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

  logger.log('> ', action, ': ', resource, ' <');
  switch (resource) {
    case 'orders':
      return handleOrder(apiEvent, app, apiDoc as Orders);
    default:
      return null;
  }
};

export default handleApiEvent;
