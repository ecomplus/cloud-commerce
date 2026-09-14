import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type { IntegrationHandler } from './integration/integration-handler';
import { logger } from '@cloudcommerce/firebase/lib/config';
import checkEnableApi from './bling-auth/check-enable-api';
import parseEventConfig from './integration/helpers/parse-event-config';
import exportProduct from './integration/export-product-to-bling';
import exportOrder from './integration/export-order-to-bling';
import importProduct from './integration/import-product-from-bling';
import importOrder from './integration/import-order-from-bling';
import afterQueue from './integration/after-bling-queue';

// Async integration handlers
const integrationHandlers: Record<
  'exportation' | 'importation',
  Record<string, IntegrationHandler>
> = {
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
  if (!appData.client_id || !appData.client_secret) {
    logger.warn('Missing Bling client_id/client_secret');
    return null;
  }

  const eventConfig = parseEventConfig(evName, appData, resourceId);
  if (!eventConfig) {
    return null;
  }
  const {
    integrationConfig,
    canCreateNew,
    isQueued,
    isStockOnlyEvent,
  } = eventConfig;
  if (!(await checkEnableApi(appData.client_id))) {
    logger.warn('Bling API is not enabled, check the app authorization');
    return null;
  }

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
          const handlerName = action.replace(/^_+/, '') as keyof typeof integrationHandlers;
          const handler = integrationHandlers[handlerName][queue.toLowerCase()];
          const nextId = ids[0];
          if (typeof nextId === 'string' && nextId.length && handler) {
            logger.info(`> Starting #${action}/${queue}/${nextId}`, { canCreateNew });
            const queueEntry = {
              action,
              queue,
              nextId,
              key,
              app,
              isNotQueued: !isQueued,
              isStockOnlyEvent,
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
  // Nothing to do
  return null;
};

export default handleApiEvent;
