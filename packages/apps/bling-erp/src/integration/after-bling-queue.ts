import type { AppOrId } from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import { logger } from '@cloudcommerce/firebase/lib/config';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import { redactSecrets, isAuthRequest } from './helpers/redact-secrets';

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
  const logEntry: Record<string, any> = {
    resource: /order/i.test(queueEntry.queue) ? 'orders' : 'products',
    [(isImportation ? 'bling_id' : 'resource_id')]: queueEntry.nextId,
    success: !isError,
    timestamp: new Date().toISOString(),
  };

  let notes: string | undefined;
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
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(payload);
            }, 2000);
          });
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
            /* O corpo do `/oauth/token` é só credencial (o `refresh_token`),
            não ajuda o lojista a entender a falha e não pode ir para o log. */
            if (!isAuthRequest(url)) {
              notes += `\n${JSON.stringify(reqData)} `;
            }
          } catch {
            //
          }
        }
      } else if ((payload as any).isConfigError === true) {
        notes = payload.message;
      } else {
        notes = payload.stack;
      }
    }
  }
  if (notes) {
    logEntry.notes = redactSecrets(notes).substring(0, 5000);
  }

  /*
  Failures are always logged on app data, so the merchant sees them on the admin
  panel even for automatic (not manually queued) exportations. Successes are kept
  out of importation logs to avoid flooding it with stock updates.
  */
  if (isError || (isQueued && !isImportation)) {
    const [lastLog] = logs;
    /* Falha persistente repete o mesmo erro a cada callback: sem o dedupe,
    cada ocorrência viraria um `PATCH` de até ~1MB no `hidden_data`. */
    const isRepeatedError = Boolean(
      isError && lastLog
      && lastLog.success === false
      && lastLog.resource === logEntry.resource
      && (lastLog.bling_id || lastLog.resource_id) === (logEntry.bling_id || logEntry.resource_id)
      && lastLog.notes === logEntry.notes,
    );
    if (!isRepeatedError) {
      logs.unshift(logEntry);
      await updateAppData(application, {
        logs: logs.slice(0, 200),
      }, {
        isHiddenData: true,
        canSendPubSub: false,
      });
    }
  }
  if (isError) {
    logger.warn(`Log for ${logEntry.resource} failure`, { logEntry });
  }
  const { action, queue, nextId } = queueEntry;
  if (!action) {
    return null;
  }
  const queueList: string[] | undefined = appData[action]?.[queue];
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
