import type { Resource, AppEventsTopic, AppEventsPayload } from '@cloudcommerce/types';
// eslint-disable-next-line import/no-unresolved
import { getFirestore } from 'firebase-admin/firestore';
import logger from 'firebase-functions/lib/logger';
import { PubSub } from '@google-cloud/pubsub';
import api, { ApiConfig } from '@cloudcommerce/api';
import getEnv from '../env';
import config from '../config';

const parseEventsTopic = (
  eventsTopic: AppEventsTopic,
  baseApiEventsFilter: Record<string, string>,
) => {
  const [resource, eventName] = eventsTopic.split('-');
  const params: ApiConfig['params'] = {};
  const bodySet: { [key: string]: any } = { ...baseApiEventsFilter };
  if (eventName === 'new') {
    params.action = 'create';
  } else {
    switch (resource) {
      case 'orders':
        switch (eventName) {
          case 'paid':
            bodySet['financial_status.current'] = 'paid';
            break;
          case 'readyForShipping':
            bodySet['fulfillment_status.current'] = 'ready_for_shipping';
            break;
          case 'shipped':
          case 'delivered':
            bodySet['fulfillment_status.current'] = eventName;
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
        params.modified_fields = eventName === 'priceSet'
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
  return { resource, eventName, params } as {
    resource: Resource,
    eventName: string,
    params: ApiConfig['params'],
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
      logger.error(err);
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
  const lastRunTimestamp: number = (await documentRef.get()).get('timestamp')
    || Date.now() - 1000 * 60 * 5;
  const baseApiEventsFilter = {
    'timestamp>': new Date(lastRunTimestamp - 1).toISOString(),
    'timestamp<': new Date(timestamp).toISOString(),
  };
  const { apps } = config.get();
  const { apiAuth } = getEnv();
  const subscribersApps: Array<{ appId: number, events: AppEventsTopic[] }> = [];
  Object.keys(apps).forEach((appName) => {
    const appObj = apps[appName];
    if (appObj.events && appObj.events.length) {
      subscribersApps.push(appObj);
    }
  });
  const activeAppsIds = (await api.get('applications', {
    ...apiAuth,
    params: {
      state: 'active',
      app_id: subscribersApps.map(({ appId }) => appId),
      fields: 'app_id',
    },
  })).data.result.map((app) => app.app_id);
  const listenedEvents: AppEventsTopic[] = [];
  subscribersApps.forEach(({ appId, events }) => {
    if (activeAppsIds.includes(appId)) {
      events.forEach((eventsTopic) => {
        if (!listenedEvents.includes(eventsTopic)) {
          listenedEvents.push(eventsTopic);
        }
      });
    }
  });
  listenedEvents.forEach(async (eventsTopic) => {
    const {
      resource,
      eventName,
      params,
    } = parseEventsTopic(eventsTopic, baseApiEventsFilter);
    if (resource !== 'orders' && resource !== 'carts' && new Date().getMinutes() % 5) {
      // Other resource events are not listened to every minute
      return;
    }
    let { data: { result } } = await api.get(`events/${resource}`, {
      ...apiAuth,
      params,
    });
    /*
    global.api_events_middleware = async (
      resource: string,
      result: EventsResult,
    }) => {
      if (resource === 'orders') {
        await axios.port(url, result);
      }
      return result;
    };
    */
    const middleware = global.api_events_middleware;
    if (typeof middleware === 'function') {
      result = await middleware(resource, result);
    }
    result.forEach(async (apiEvent) => {
      const apiDoc = eventName !== 'new'
        ? (await api.get(`${resource}/${apiEvent.resource_id}`, apiAuth)).data
        : null;
      subscribersApps.forEach(({ appId, events }) => {
        if (events.includes(eventsTopic) && activeAppsIds.includes(appId)) {
          const topicName = `app${appId}_${eventsTopic}`;
          const json: AppEventsPayload = { apiEvent, apiDoc };
          const messageObj = {
            messageId: `${apiEvent.resource_id}_${apiEvent.timestamp}`,
            json,
          };
          tryPubSubPublish(topicName, messageObj);
        }
      });
    });
    logger.info(`> '${eventsTopic}' events: `, result);
  });
  return documentRef.set({
    timestamp,
    activeAppsIds,
    listenedEvents,
  });
};
