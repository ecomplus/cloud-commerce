import type { AppEventsPayload } from '@cloudcommerce/types';
import functions from 'firebase-functions';
import config from '../config';
import { GET_PUBSUB_TOPIC } from '../const';

const { logger } = functions;

type PubSubHandler<TMessage> = (
  json: TMessage,
  context: functions.EventContext,
  message: functions.pubsub.Message,
) => Promise<any>;
type ApiEventHandler = PubSubHandler<AppEventsPayload>;
type ExecOptions = {
  eventMaxAgeMs?: number,
  memory?: '128MB' | '256MB' | '512MB' | '1GB',
};

const createPubSubFunction = (
  pubSubTopic: string,
  fn: PubSubHandler<any>,
  {
    eventMaxAgeMs = 60000,
    memory = '256MB',
  }: ExecOptions = {},
) => {
  const { httpsFunctionOptions: { region } } = config.get();
  return functions.region(region)
    .runWith({
      failurePolicy: eventMaxAgeMs > 0,
      memory,
    })
    .pubsub.topic(pubSubTopic).onPublish((message, context) => {
      const eventAgeMs = Date.now() - Date.parse(context.timestamp);
      if (eventAgeMs > eventMaxAgeMs) {
        logger.warn(`Dropping event ${context.eventId} with age[ms]: ${eventAgeMs}`, {
          data: message.json,
        });
        return Promise.resolve(null);
      }
      return fn(message.json, context, message);
    });
};

const createAppEventsFunction = (
  appNameOrId: string | number,
  fn: ApiEventHandler,
  options?: ExecOptions,
) => {
  let appId: number;
  if (typeof appNameOrId === 'string') {
    appId = config.get().apps[appNameOrId].appId;
  } else {
    appId = appNameOrId;
  }
  return createPubSubFunction(GET_PUBSUB_TOPIC(appId), fn, options);
};

export default createPubSubFunction;

export { createPubSubFunction, createAppEventsFunction };

export type { PubSubHandler, ApiEventHandler };
