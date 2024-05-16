import type { AppOrId } from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import logger from 'firebase-functions/logger';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';

export default async (
  queueEntry: Record<string, any>,
  appData: Record<string, any>,
  application: AppOrId,
  payload: any,
) => {
  const isError = payload instanceof Error;
  const isImportation = queueEntry.action.endsWith('importation');
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
        notes = `Error: Status ${status} \n${JSON.stringify(data)}`;
        if (isQueued && (!status || status === 429 || status >= 500)) {
          return setTimeout(() => {
            throw payload;
          }, 2000);
        }
        if (config) {
          const { url, method, data: reqData } = config;
          notes += `\n\n-- Request -- \n${method} ${url} \n${JSON.stringify(reqData)}`;
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
  const { action, queue, nextId } = queueEntry;
  let queueList = appData[action][queue];
  if (Array.isArray(queueList)) {
    const idIndex = queueList.indexOf(nextId);
    if (idIndex > -1) {
      queueList.splice(idIndex, 1);
    }
  } else {
    queueList = [];
  }
  const data = {
    [action]: {
      ...appData[action],
      [queue]: queueList,
    },
  };
  logger.info(JSON.stringify(data));
  return updateAppData(application, data);
};
