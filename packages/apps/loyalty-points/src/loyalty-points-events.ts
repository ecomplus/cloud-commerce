/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import type { Orders } from '@cloudcommerce/types';
import {
  createAppEventsFunction,
  ApiEventHandler,
} from '@cloudcommerce/firebase/lib/helpers/pubsub';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import functions from 'firebase-functions/v1';
import handleLoyaltyPointsEvent from './functions-lib/handle-loyalty-points-event';
import addPoints from './functions-lib/cron-add-points';

const { httpsFunctionOptions: { region } } = config.get();

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const resourceId = apiEvent.resource_id;
  const key = `${evName}_${resourceId}`;
  const appData = { ...app.data, ...app.hidden_data };
  const programRules = appData.programs_rules;

  if (
    (Array.isArray(appData.ignore_events)
      && appData.ignore_events.includes(evName))
    || (!Array.isArray(programRules) || !programRules.length)
  ) {
    logger.info(`>> ${key} - Ignored event`);
    return null;
  }
  logger.info(`> Webhook ${resourceId} [${evName}]`);

  return handleLoyaltyPointsEvent(apiDoc as Orders, programRules);
};

export const loyaltypoints = {
  onStoreEvent: createAppEventsFunction('loyaltyPoints', handleApiEvent),

  cronAddPoints: functions.region(region).pubsub
    .schedule(process.env.CRONTAB_LOYALTYPOINTS_ADD_POINTS || '28 * * * *')
    .onRun(() => {
      return addPoints();
    }),
};
