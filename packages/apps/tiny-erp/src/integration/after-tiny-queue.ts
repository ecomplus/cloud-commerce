import type { AppOrId } from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import { logger } from '@cloudcommerce/firebase/lib/config';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';

export default async (
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
  application: AppOrId,
  payload: any,
) => {
  const isError = payload instanceof Error;
  const isImportation = !!queueEntry.action?.endsWith('importation');
  const isQueued = !queueEntry.isNotQueued;
  const logs = appData.logs || [];
  const logEntry = {
    resource: /order/i.test(queueEntry.queue) ? 'orders' : 'products',
    [(isImportation ? 'tiny_id' : 'resource_id')]: queueEntry.nextId,
    success: !isError,
    imestamp: new Date().toISOString(),
  };

  let notes;
  if (payload) {
    if (!isError) {
      // payload = response
      const { data, status, config } = payload;
      if (data && data._id) {
        logEntry.resource_id = data._id;
      }
      notes = `Status ${status}`;
      if (config) {
        notes += ` [${config.url}]`;
      }
    } else {
      const { config, response } = payload as any;
      if (response) {
        const { data, status } = response;
        if (isQueued && (!status || status === 429 || status >= 500)) {
          return setTimeout(() => {
            throw payload;
          }, 2000);
        }
        notes = `Error: Status ${status} `;
        try {
          notes += `\n${JSON.stringify(data)} `;
        } catch {
          //
        }
        if (config) {
          const { url, method, data: reqData } = config;
          try {
            notes += `\n\n-- Request -- \n${method} ${url} `;
            notes += `\n${JSON.stringify(reqData)} `;
          } catch {
            //
          }
        }
        // @ts-ignore
      } else if (payload.isConfigError === true) {
        notes = payload.message;
      } else {
        notes = payload.stack;
      }
    }
  }
  if (notes) {
    logEntry.notes = notes.substring(0, 5000);
  }

  if (isQueued && (isError || !isImportation)) {
    logs.unshift(logEntry);
    await updateAppData(application, {
      logs: logs.slice(0, 200),
    }, {
      isHiddenData: true,
      canSendPubSub: false,
    });
  }
  if (isError) {
    logger.warn(`Log for ${logEntry.resource} failure`, { logEntry });
  }
  const { action, queue, nextId } = queueEntry;
  if (!action) {
    return null;
  }
  const queueList: Record<string, any>[] | undefined = appData[action]?.[queue];
  if (Array.isArray(queueList)) {
    const idIndex = queueList.indexOf(nextId);
    if (idIndex > -1) {
      queueList.splice(idIndex, 1);
      const data = {
        [action]: {
          ...appData[action],
          [queue]: queueList,
        },
      };
      try {
        logger.info(JSON.stringify(data));
      } catch {
        logger.info(`Update app queue after ${nextId} (stringify failed)`);
      }
      return updateAppData(application, data);
    }
  }
  return null;
};
