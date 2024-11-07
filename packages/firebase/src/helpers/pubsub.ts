import type { AppEventsPayload } from '@cloudcommerce/types';
import functions from 'firebase-functions/v1';
import config, { createExecContext } from '../config';
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
  maxInstances?: number,
};

const createPubSubFunction = (
  pubSubTopic: string,
  fn: PubSubHandler<any>,
  {
    eventMaxAgeMs = 60000,
    memory = '256MB',
    maxInstances = 2,
  }: ExecOptions = {},
) => {
  const { httpsFunctionOptions: { region } } = config.get();
  return functions.region(region)
    .runWith({
      failurePolicy: eventMaxAgeMs > 0,
      memory,
      maxInstances,
    })
    .pubsub.topic(pubSubTopic).onPublish((message, context) => {
      const eventAgeMs = Date.now() - Date.parse(context.timestamp);
      if (eventAgeMs > eventMaxAgeMs) {
        logger.warn(`Dropping event ${context.eventId} with age[ms]: ${eventAgeMs}`, {
          data: message.json,
        });
        return Promise.resolve(null);
      }
      return createExecContext(() => fn(message.json, context, message));
    });
};

const createAppEventsFunction = (
  appNameOrId: string | number,
  fn: ApiEventHandler,
  options?: ExecOptions,
  isSkipMiddleware = false,
) => {
  let appId: number;
  if (typeof appNameOrId === 'string') {
    appId = config.get().apps[appNameOrId].appId;
  } else {
    appId = appNameOrId;
  }
  const midd: ApiEventHandler = (payload, context, message) => {
    const {
      evName,
      apiEvent: { resource_id: resourceId, timestamp },
    } = payload;
    logger.info(`ev/${evName} ${resourceId} at ${timestamp}`);
    return fn(payload, context, message);
  };
  const _fn = isSkipMiddleware === true ? fn : midd;
  return createPubSubFunction(GET_PUBSUB_TOPIC(appId), _fn, options);
};

export default createPubSubFunction;

export { createPubSubFunction, createAppEventsFunction };

export type { PubSubHandler, ApiEventHandler };
