import type {
  Resource,
  ResourceId,
  ApiEventName,
  AppEventsPayload,
  EventsResult,
} from '@cloudcommerce/types';
import type { ApiConfig, ApiError } from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import { PubSub } from '@google-cloud/pubsub';
import api from '@cloudcommerce/api';
import config, { logger } from '../config';
import { EVENT_SKIP_FLAG, GET_PUBSUB_TOPIC } from '../const';

declare global {
  // eslint-disable-next-line
  var $transformApiEvents: undefined | (
    <T extends Resource>(
      resource: T,
      result: EventsResult<`events/${T}`>['result'],
    ) => Promise<EventsResult<`events/${T}`>['result']>
  );
}

const parseEventName = (
  evName: ApiEventName,
  baseApiEventsFilter: Record<string, string>,
) => {
  const [resource, actionName] = evName.split('-');
  const params: ApiConfig['params'] = { ...baseApiEventsFilter };
  const bodySet: { [key: string]: any } = {};
  if (actionName === 'new' || actionName === 'delayed') {
    params.action = 'create';
  } else {
    switch (resource) {
      case 'orders':
        switch (actionName) {
          case 'paid':
            bodySet['financial_status.current'] = 'paid';
            break;
          case 'readyForShipping':
            bodySet['fulfillment_status.current'] = 'ready_for_shipping';
            break;
          case 'shipped':
          case 'delivered':
            bodySet['fulfillment_status.current'] = actionName;
            break;
          case 'cancelled':
            bodySet.status = 'cancelled';
            break;
          default: // anyStatusSet
            params.modified_fields = [
              'financial_status',
              'fulfillment_status',
              'status',
            ];
        }
        break;
      case 'products':
        params.modified_fields = actionName === 'priceSet'
          ? ['price', 'variations.price']
          : ['quantity']; // quantitySet
        break;
      case 'carts':
        params.modified_fields = ['customers']; // customerSet
        break;
      case 'applications':
        params.modified_fields = ['data', 'hidden_data']; // dataSet
        break;
      default:
    }
  }
  Object.keys(bodySet).forEach((field) => {
    params[`body.${field}`] = bodySet[field];
  });
  return { resource, params, actionName } as {
    resource: Resource,
    params: Exclude<ApiConfig['params'], undefined | string>,
    actionName: string
  };
};

const pubSubClient = new PubSub();
const tryPubSubPublish = async (
  topicName: string,
  messageObj: { messageId: string, json: any, orderingKey: string },
  retries = 0,
) => {
  // https://cloud.google.com/pubsub/docs/samples/pubsub-publisher-retry-settings
  const pubSubTopic = pubSubClient.topic(topicName, {
    messageOrdering: true,
    gaxOpts: {
      retry: {
        retryCodes: [10, 1, 4, 13, 8, 14, 2],
        backoffSettings: {
          initialRetryDelayMillis: /* 100 */ 1200,
          retryDelayMultiplier: /* 1.3 */ 2,
          maxRetryDelayMillis: /* 60000 */ 120000,
          initialRpcTimeoutMillis: 5000,
          rpcTimeoutMultiplier: 1.0,
          maxRpcTimeoutMillis: 600000,
          totalTimeoutMillis: 600000,
        },
      },
    },
  });
  try {
    await pubSubTopic.publishMessage(messageObj);
  } catch (err: any) {
    // eslint-disable-next-line no-param-reassign
    err.retries = retries;
    logger.error(err);
    if (retries <= 3) {
      await new Promise((resolve) => {
        setTimeout(() => {
          tryPubSubPublish(topicName, messageObj, retries + 1).then(resolve);
        }, 1000 * (2 ** retries));
      });
    }
  }
};

export default async () => {
  const maxTimestamp = Date.now() - 1000 * 2;
  const documentRef = getFirestore().doc('storeEvents/last');
  const documentSnapshot = await documentRef.get();
  const lastRunTimestamp: number = documentSnapshot
    .get('timestamp') || Date.now() - 1000 * 60 * 5;
  const lastNonOrdersTimestamp: number = documentSnapshot
    .get('nonOrdersTimestamp') || 0;
  const lastPushedTimestamps: Record<Resource, number | undefined> = documentSnapshot
    .get('pushedTimestamps') || {};
  const baseApiEventsFilter = {
    'flag!': EVENT_SKIP_FLAG,
    'timestamp>': new Date(lastRunTimestamp - 1).toISOString(),
    'timestamp<': new Date(maxTimestamp).toISOString(),
  };
  const { apiEvents, apps } = config.get();
  const subscribersApps: Array<{ appId: number, events: ApiEventName[] }> = [];
  Object.keys(apps).forEach((appName) => {
    const appObj = apps[appName];
    if (appObj.events && appObj.events.length) {
      subscribersApps.push(appObj);
    }
  });
  const activeApps = (await api.get('applications', {
    params: {
      state: 'active',
      app_id: subscribersApps.map(({ appId }) => appId),
      fields: '_id,app_id,data,hidden_data',
    },
  })).data.result as Array<AppEventsPayload['app']>;
  const listenedEvents: ApiEventName[] = [];
  subscribersApps.forEach(({ appId, events }) => {
    if (activeApps.find((app) => app.app_id === appId)) {
      events.forEach((evName) => {
        if (
          !listenedEvents.includes(evName)
          && !apiEvents.disabledEvents.includes(evName)
        ) {
          listenedEvents.push(evName);
        }
      });
    }
  });
  // Some resource events are not listened to every minute
  const isOrdersOnly = Boolean(new Date().getMinutes() % 5);
  await Promise.all(listenedEvents.map(async (listenedEventName) => {
    const {
      resource,
      params,
      actionName,
    } = parseEventName(listenedEventName, baseApiEventsFilter);
    if (resource !== 'orders') {
      if (isOrdersOnly) {
        return;
      }
      if (lastNonOrdersTimestamp) {
        if (actionName === 'delayed') {
          // Defines the limits for getting events with predefined delay
          const { delayedMs } = apiEvents;
          params['timestamp>'] = new Date(lastNonOrdersTimestamp - delayedMs).toISOString();
          params['timestamp<'] = new Date(maxTimestamp - delayedMs).toISOString();
        } else {
          params['timestamp>'] = new Date(lastNonOrdersTimestamp).toISOString();
        }
      }
    }
    if (
      lastPushedTimestamps[resource]
      && lastPushedTimestamps[resource] > maxTimestamp - 1000 * 60 * 60
    ) {
      params['timestamp>'] = new Date(lastPushedTimestamps[resource] + 1).toISOString();
    }
    let { data: { result } } = await api.get(`events/${resource}`, {
      params,
      limit: Number(process.env.STORE_EVENTS_LIMIT || 50),
    });
    /*
    global.$transformApiEvents = async (resource: string, result: EventsResult) => {
      if (resource === 'orders') {
        await axios.port(url, result);
      }
      return result;
    };
    */
    const { $transformApiEvents } = global;
    if (typeof $transformApiEvents === 'function') {
      result = await $transformApiEvents(resource, result);
    }
    logger.info(`> '${listenedEventName}' ${result.length} events`, { params });
    if (!result.length) return;
    const eventsPerId: Record<ResourceId, typeof result> = {};
    result.forEach((apiEvent) => {
      const resourceId = apiEvent.resource_id;
      if (!eventsPerId[resourceId]) {
        eventsPerId[resourceId] = [];
      } else if (apiEvent.resource === 'applications') {
        const hasSameFieldsEvent = eventsPerId[resourceId].some((_apiEvent) => {
          return apiEvent.modified_fields.every((field) => {
            return _apiEvent.modified_fields.includes(field);
          });
        });
        if (hasSameFieldsEvent) return;
      }
      eventsPerId[resourceId].push(apiEvent);
    });
    await Promise.all(Object.keys(eventsPerId).map(async (key) => {
      const resourceId = key as ResourceId;
      const ascOrderedEvents = eventsPerId[resourceId].sort((a, b) => {
        if (a.timestamp < b.timestamp) return -1;
        return 1;
      });
      const fetchFreshApiDoc = async () => {
        try {
          const { data } = await api.get(`${(resource as 'orders')}/${resourceId}`, {
            headers: { 'x-primary-db': 'true' },
          });
          return data;
        } catch (_err: any) {
          const err: ApiError = _err;
          if (err.statusCode === 404) {
            return false;
          }
          throw err;
        }
      };
      const datasetAt = Date.now();
      const apiDoc = resource !== 'applications'
        ? await fetchFreshApiDoc()
        : null;
      if (apiDoc === false) {
        return;
      }
      for (let i = 0; i < ascOrderedEvents.length; i++) {
        const apiEvent = ascOrderedEvents[i];
        apiEvent.resource = resource;
        // "Ensure" messages publishing order
        /* eslint-disable no-await-in-loop */
        if (i > 0) {
          await new Promise((resolve) => { setTimeout(resolve, i * 150); });
        }
        await Promise.all(activeApps.map(async (app) => {
          const appConfig = subscribersApps.find(({ appId }) => appId === app.app_id);
          if (appConfig?.events.includes(listenedEventName)) {
            const topicName = GET_PUBSUB_TOPIC(app.app_id);
            const json: AppEventsPayload = {
              evName: listenedEventName,
              apiEvent,
              apiDoc: apiDoc || app,
              app,
              at: datasetAt,
            };
            const messageObj = {
              messageId: `${resourceId}_${apiEvent.timestamp}`,
              json,
              orderingKey: resourceId,
            };
            await tryPubSubPublish(topicName, messageObj);
            const pushedTimestamp = new Date(apiEvent.timestamp).getTime();
            if (pushedTimestamp > (lastPushedTimestamps[resource] || 0)) {
              lastPushedTimestamps[resource] = pushedTimestamp;
            }
          }
        }));
        /* eslint-enable no-await-in-loop */
      }
    }));
    logger.info(`> '${listenedEventName}' events: `, {
      result: result.map((apiEvent) => ({
        timestamp: apiEvent.timestamp,
        resource_id: apiEvent.resource_id,
      })),
    });
  }));
  const documentMergeData: Record<string, any> = {
    timestamp: maxTimestamp,
    pushedTimestamps: lastPushedTimestamps,
    activeApps,
    listenedEvents,
  };
  if (!isOrdersOnly) {
    documentMergeData.nonOrdersTimestamp = maxTimestamp;
  }
  return documentRef.set(documentMergeData, { merge: true });
};
