import type { EventsResult, AppEventsTopic } from '@cloudcommerce/types';
import functions from 'firebase-functions';
import config from '../config';

const { logger } = functions;

/* eslint-disable no-unused-vars */
type PubSubHandler<TMessage> = (
  json: TMessage,
  context: functions.EventContext,
  message: functions.pubsub.Message,
) => void;
type ApiEventHandler = PubSubHandler<EventsResult<'events/orders'>['result'][0]>;
/* eslint-enable no-unused-vars */

const createPubSubFunction = (
  pubSubTopic: string,
  fn: PubSubHandler<any>,
  eventMaxAgeMs = 60000,
) => {
  const { httpsFunctionOptions: { region } } = config.get();
  return functions.region(region)
    .runWith({ failurePolicy: true })
    .pubsub.topic(pubSubTopic).onPublish((message, context) => {
      const eventAgeMs = Date.now() - Date.parse(context.timestamp);
      if (eventAgeMs > eventMaxAgeMs) {
        logger.warn(`Dropping event ${context.eventId} with age[ms]: ${eventAgeMs}`);
      }
      fn(message.json, context, message);
    });
};

const createAppPubSubFunction = (
  eventsTopic: AppEventsTopic,
  appNameOrId: string | number,
  fn: ApiEventHandler,
  eventMaxAgeMs = 60000,
) => {
  let appId: number;
  if (typeof appNameOrId === 'string') {
    appId = config.get().apps[appNameOrId].appId;
  } else {
    appId = appNameOrId;
  }
  return createPubSubFunction(`app${appId}_${eventsTopic}`, fn, eventMaxAgeMs);
};

export default createPubSubFunction;

export { createPubSubFunction, createAppPubSubFunction };

export type { PubSubHandler, ApiEventHandler };
