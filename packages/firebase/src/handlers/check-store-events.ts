import type { Resource, AppEventsTopic } from '@cloudcommerce/types';
import logger from 'firebase-functions/lib/logger';
import api, { ApiConfig } from '@cloudcommerce/api';
import getEnv from '../env';
import config from '../config';

const parseEventsTopic = (eventsTopic: AppEventsTopic) => {
  const [resource, eventName] = eventsTopic.split('-');
  const params: ApiConfig['params'] = {};
  const bodySet: { [key: string]: any } = {};
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
      default:
    }
  }
  Object.keys(bodySet).forEach((field) => {
    params[`body.${field}`] = bodySet[field];
  });
  return { resource, params } as {
    resource: Resource;
    params: ApiConfig['params'];
  };
};

export default async () => {
  const { apps } = config.get();
  const { apiAuth } = getEnv();
  const subscribersApps: Array<{ appId: number, events: AppEventsTopic[] }> = [];
  Object.keys(apps).forEach((appName) => {
    const appObj = apps[appName];
    if (appObj.events && appObj.events.length) {
      subscribersApps.push(appObj);
    }
  });
  const activeSubscribersApps = (await api.get('applications', {
    params: {
      state: 'active',
      app_id: subscribersApps.map(({ appId }) => appId),
      fields: 'app_id',
    },
  })).data.result;
  logger.info({ activeSubscribersApps });
  const listenedEvents: AppEventsTopic[] = [];
  subscribersApps.forEach(({ appId, events }) => {
    if (activeSubscribersApps.find((app) => app.app_id === appId)) {
      events.forEach((eventsTopic) => {
        listenedEvents.push(eventsTopic);
      });
    }
  });
  logger.info({ listenedEvents });
  listenedEvents.forEach(async (eventsTopic) => {
    const { resource, params } = parseEventsTopic(eventsTopic);
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
    logger.info(`> '${eventsTopic}' events: `, result);
  });
  return true;
};
