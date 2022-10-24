import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import logger from 'firebase-functions/lib/logger';
import { Products } from '@cloudcommerce/api/types';
import productBackToStock from './functions-to-offers-notification/back-to-stock';
import productChangePrice from './functions-to-offers-notification/change-price';

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
  if (resource === 'products') {
    try {
      const product = apiDoc as Products;
      if (apiEvent.modified_fields.includes('quantity')
      && product.quantity && product.quantity > 0) {
        return productBackToStock(apiEvent, appData, apiDoc as Products);
      }

      if (apiEvent.modified_fields.includes('price')) {
        return productChangePrice(apiEvent, appData, apiDoc as Products);
      }
    } catch (e) {
      logger.error(e);
      return null;
    }
  }
  return null;
};

export default handleApiEvent;
