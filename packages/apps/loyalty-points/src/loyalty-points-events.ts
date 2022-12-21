/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import type { Orders } from '@cloudcommerce/types';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import logger from 'firebase-functions/logger';
import handleLoyaltyPointsEvent from './functions-lib/handle-loyalty-points-event';

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const resourceId = apiEvent.resource_id;
  logger.info('>> ', resourceId, ' - Action: ', apiEvent.action);
  const key = `${evName}_${resourceId}`;
  const appData = { ...app.data, ...app.hidden_data };
  const programRules = appData.programs_rules;

  if (
    (Array.isArray(appData.ignore_events)
      && appData.ignore_events.includes(evName))
    || (!Array.isArray(programRules) || !programRules.length)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }
  logger.info(`> Webhook ${resourceId} [${evName}]`);

  return handleLoyaltyPointsEvent(apiDoc as Orders, programRules, key);
};

export const loyaltypoints = {
  onStoreEvent: createAppEventsFunction(
    'loyaltyPoints',
    handleApiEvent,
  ) as any,
};
