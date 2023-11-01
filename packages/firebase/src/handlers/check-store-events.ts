import type {
  Resource,
  ApiEventName,
  AppEventsPayload,
  EventsResult,
} from '@cloudcommerce/types';
import { getFirestore } from 'firebase-admin/firestore';
import { error, info } from 'firebase-functions/logger';
import { PubSub } from '@google-cloud/pubsub';
import api, { ApiConfig } from '@cloudcommerce/api';
import config from '../config';
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
    params: Exclude<ApiConfig['params'], undefined>,
    actionName: string
  };
};

const pubSubClient = new PubSub();
const tryPubSubPublish = (
  topicName: string,
  messageObj: { messageId: string, json: any },
  retries = 0,
) => {
  pubSubClient.topic(topicName).publishMessage(messageObj)
    .catch((err) => {
      // eslint-disable-next-line no-param-reassign
      err.retries = retries;
      error(err);
      if (retries <= 3) {
        setTimeout(() => {
          tryPubSubPublish(topicName, messageObj, retries + 1);
        }, 1000 * (2 ** retries));
      }
    });
};

export default async () => {
  const timestamp = Date.now();
  const documentRef = getFirestore().doc('storeEvents/last');
  const documentSnapshot = await documentRef.get();
  const lastRunTimestamp: number = documentSnapshot.get('timestamp')
    || Date.now() - 1000 * 60 * 5;
  const lastNonOrdersTimestamp: number = documentSnapshot.get('nonOrdersTimestamp')
    || 0;
  const baseApiEventsFilter = {
    'flag!': EVENT_SKIP_FLAG,
    'timestamp>': new Date(lastRunTimestamp - 1).toISOString(),
    'timestamp<': new Date(timestamp).toISOString(),
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
  listenedEvents.forEach(async (listenedEventName) => {
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
          params['timestamp<'] = new Date(timestamp - delayedMs).toISOString();
        } else {
          params['timestamp>'] = new Date(lastNonOrdersTimestamp).toISOString();
        }
      }
    }
    let { data: { result } } = await api.get(`events/${resource}`, {
      params,
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
    if (!result.length) return;
    info(`> '${listenedEventName}' ${result.length} events`);
    const resourceIdsRead: string[] = [];
    result.forEach(async (apiEvent) => {
      const resourceId = apiEvent.resource_id;
      if (resourceIdsRead.includes(resourceId)) {
        return;
      }
      resourceIdsRead.push(resourceId);
      const apiDoc = resource !== 'applications'
        ? (await api.get(`${resource}/${resourceId}`)).data
        : null;
      activeApps.forEach((app) => {
        const appConfig = subscribersApps.find(({ appId }) => appId === app.app_id);
        if (appConfig?.events.includes(listenedEventName)) {
          const topicName = GET_PUBSUB_TOPIC(app.app_id);
          const json: AppEventsPayload = {
            evName: listenedEventName,
            apiEvent,
            apiDoc: apiDoc || app,
            app,
          };
          const messageObj = {
            messageId: `${resourceId}_${apiEvent.timestamp}`,
            json,
          };
          tryPubSubPublish(topicName, messageObj);
        }
      });
    });
    info(`> '${listenedEventName}' events: `, {
      result: result.map((apiEvent) => ({
        timestamp: apiEvent.timestamp,
        resource_id: apiEvent.resource_id,
      })),
    });
  });
  return documentRef.set({
    timestamp,
    nonOrdersTimestamp: isOrdersOnly ? lastNonOrdersTimestamp : timestamp,
    activeApps,
    listenedEvents,
  });
};
