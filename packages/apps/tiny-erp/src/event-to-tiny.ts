import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import { logger } from '@cloudcommerce/firebase/lib/config';
import exportProduct from './integration/export-product-to-tiny';
import exportOrder from './integration/export-order-to-tiny';
import importProduct from './integration/import-product-from-tiny';
import importOrder from './integration/import-order-from-tiny';
import afterQueue from './integration/after-tiny-queue';

// Async integration handlers
const integrationHandlers = {
  exportation: {
    product_ids: exportProduct,
    order_ids: exportOrder,
  },
  importation: {
    skus: importProduct,
    order_numbers: importOrder,
  },
};

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const resourceId = apiEvent.resource_id;
  logger.info(`>> ${resourceId} - Action: ${apiEvent.action}`);
  const key = `${evName}_${resourceId}`;
  if (
    evName === 'applications-dataSet'
    && !apiEvent.modified_fields.includes('data')
  ) {
    logger.info(`>> ${key} - Skipped application event without \`data\` changes`);
    return null;
  }
  const appData = { ...app.data, ...app.hidden_data };
  if (
    Array.isArray(appData.ignore_events)
    && appData.ignore_events.includes(evName)
  ) {
    logger.info(`>> ${key} - Ignored event`);
    return null;
  }

  if (!process.env.TINYERP_TOKEN) {
    const tinyToken = appData.tiny_api_token;
    if (typeof tinyToken === 'string' && tinyToken) {
      process.env.TINYERP_TOKEN = tinyToken;
    } else {
      logger.warn('Missing Tiny API token');
    }
  }

  if (process.env.TINYERP_TOKEN) {
    let integrationConfig;
    let canCreateNew = false;
    let isQueued = false;
    if (evName === 'applications-dataSet') {
      integrationConfig = appData;
      canCreateNew = true;
      isQueued = true;
    } else if (evName === 'orders-anyStatusSet') {
      canCreateNew = Boolean(appData.new_orders);
      integrationConfig = {
        _exportation: {
          order_ids: [resourceId],
        },
      };
    } else {
      if (evName === 'products-new') {
        if (!appData.new_products) {
          return null;
        }
      } else if (!appData.update_price) {
        return null;
      }
      integrationConfig = {
        _exportation: {
          product_ids: [resourceId],
        },
      };
    }

    if (integrationConfig) {
      const actions = Object.keys(integrationHandlers);
      actions.forEach((action) => {
        for (let i = 1; i <= 3; i++) {
          actions.push(`${('_'.repeat(i))}${action}`);
        }
      });
      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const actionQueues = integrationConfig[action];

        if (typeof actionQueues === 'object' && actionQueues) {
          // eslint-disable-next-line guard-for-in, no-restricted-syntax
          for (const queue in actionQueues) {
            const ids = actionQueues[queue];
            if (Array.isArray(ids) && ids.length) {
              const isHiddenQueue = action.charAt(0) === '_';
              const handlerName = action.replace(/^_+/, '');
              const handler = integrationHandlers[handlerName][queue.toLowerCase()];
              const nextId = ids[0];

              if (
                typeof nextId === 'string'
                && nextId.length
                && handler
              ) {
                const debugFlag = `#${action}/${queue}/${nextId}`;
                logger.info(`> Starting ${debugFlag}`, {
                  canCreateNew,
                });
                const queueEntry = {
                  action,
                  queue,
                  nextId,
                  key,
                  app,
                  isNotQueued: !isQueued,
                };
                return handler(
                  apiDoc,
                  queueEntry,
                  appData,
                  canCreateNew,
                  isHiddenQueue,
                ).then((payload: any) => {
                  return afterQueue(queueEntry, appData, app, payload);
                }).catch((err: any) => {
                  return afterQueue(queueEntry, appData, app, err);
                });
              }
            }
          }
        }
      }
    }
  }
  // Nothing to do
  return null;
};

export default handleApiEvent;
