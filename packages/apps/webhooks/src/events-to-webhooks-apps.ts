import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type { Carts, Customers, Orders } from '@cloudcommerce/api/types';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import axios from 'axios';

const updateManualQueue = async (
  manualQueue: any[] | null,
  appId: string,
) => {
  if (manualQueue) {
    try {
      await api.patch(`applications/${appId}`, { data: { manual_queue: manualQueue } });
      manualQueue = null;
    } catch (err) {
      logger.error(err);
    }
  }
};

const sendWebhook = async (
  options: { [x: string]: any },
  doc: Record<string, any>,
  urls: any[],
  manualQueue: any[] | null,
  appId: string,
  customer?: Customers,
  docId?: string,
  isCart?: boolean,
) => {
  const url = options && options.webhook_uri;
  if (url && !urls.includes(url) && (!isCart || options.send_carts)) {
    urls.push(url);
    logger.log(`Event for Store ${isCart ? 'cart' : 'order'} => ${url}`);

    if (
      options.skip_pending === true
      && (!doc.financial_status || doc.financial_status.current === 'pending')
    ) {
      return null;
    }

    logger.log(`> Sending ${isCart ? 'cart' : 'order'} notification`);

    const token = options.webhook_token;
    let headers: { Authorization: string; } | undefined;

    if (token) {
      headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const body = {
      [isCart ? 'cart' : 'order']: doc,
      customer,
    };

    try {
      const { status } = await axios.post(url, body, { headers });
      if (status) {
        await updateManualQueue(manualQueue, appId);
        // logger.log(`> ${status}`);
        return status;
      }
    } catch (error: any) {
      if (error.response && error.config) {
        const err: { [x: string]: any } = { name: `#${docId} POST to ${error.config.url} failed` };
        const { status, data } = error.response;
        err.response = {
          status,
          data: JSON.stringify(data),
        };
        err.data = JSON.stringify(error.config.data);
        logger.error(err);
      } else {
        logger.error(error);
      }
    }
  }
  return null;
};

const handleApiEvent: ApiEventHandler = async ({
  evName,
  apiEvent,
  apiDoc,
  app,
}) => {
  const appData = { ...app.data, ...app.hidden_data };
  const resourceId = apiEvent.resource_id;
  const key = `${evName}_${resourceId}`;

  if (
    Array.isArray(appData.ignore_events)
    && appData.ignore_events.includes(evName)
  ) {
    logger.info('>> ', key, ' - Ignored event');
    return null;
  }

  try {
    if (appData.webhooks) {
      let docId: string | undefined;
      let manualQueue: any[] | null = null;
      let isCart: boolean | undefined;

      if (evName === 'applications-dataSet') {
        const body = appData;
        if (body && Array.isArray(body.manual_queue) && body.manual_queue.length) {
          manualQueue = body.manual_queue;
          const nextId = manualQueue[0];
          if (typeof nextId === 'string' && /[a-f0-9]{24}/.test(nextId)) {
            docId = nextId.trim();
          }
          manualQueue.shift();
        }
      } else {
        isCart = evName === 'carts-customerSet' || evName === 'carts-new';
        docId = apiDoc._id;
      }

      if (docId) {
        let customer: Customers | undefined;
        let doc: Carts | Orders;
        if (isCart) {
          doc = apiDoc as Carts;
          if (doc.completed || doc.available === false) {
            return null;
          }
          const abandonedCartDelay = 3 * 1000 * 60;
          if (Date.now() - new Date(doc.created_at).getTime() >= abandonedCartDelay) {
            const customerId = doc.customers && apiDoc.customers[0];
            if (customerId) {
              customer = (await api.get(`customers/${customerId}`)).data;
            }
          } else {
            return null;
          }
        } else {
          doc = (await api.get(`orders/${docId}`)).data;
        }

        if (doc) {
          const urls: string[] = [];
          const { webhooks } = appData;
          if (Array.isArray(webhooks)) {
            webhooks.forEach(async (webhook) => {
              await sendWebhook(
                webhook,
                doc,
                urls,
                manualQueue,
                app._id,
                customer,
                docId,
                isCart,
              );
            });
          }
          await sendWebhook(
            appData,
            doc,
            urls,
            manualQueue,
            app._id,
            customer,
            docId,
            isCart,
          );
          return null;
        }

        await updateManualQueue(manualQueue, app._id);
      }
    }
    return null;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

export default handleApiEvent;
