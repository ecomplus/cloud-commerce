import type { ApiEventHandler } from '@cloudcommerce/firebase/lib/helpers/pubsub';
import type {
  Carts,
  Customers,
  Orders,
  ResourceId,
} from '@cloudcommerce/api/types';
import { logger } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import axios from 'axios';

const updateManualQueue = async (
  manualQueue: any[] | null,
  appId: ResourceId,
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
  appId: ResourceId,
  customer?: Customers,
  docId?: ResourceId,
  isCart?: boolean,
) => {
  const url = options && options.webhook_uri;
  if (url && !urls.includes(url) && (!isCart || options.send_carts)) {
    urls.push(url);
    logger.info(`Event ${isCart ? 'cart' : 'order'} => ${url}`);

    if (
      options.skip_pending === true
      && (!doc.financial_status || doc.financial_status.current === 'pending')
    ) {
      return null;
    }

    logger.info(`> Sending ${isCart ? 'cart' : 'order'} notification`);
    let headers: { Authorization: string; } | undefined;
    const webhookAppToken = options.webhook_token;
    if (typeof webhookAppToken === 'string' && webhookAppToken) {
      process.env.WEBHOOKS_TOKEN = webhookAppToken;
    }

    if (process.env.WEBHOOKS_TOKEN) {
      headers = {
        Authorization: `Bearer ${process.env.WEBHOOKS_TOKEN}`,
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
    logger.info(`>> ${key} - Ignored event`);
    return null;
  }

  try {
    if (appData.webhooks) {
      let docId = apiDoc._id as ResourceId;
      let manualQueue: any[] | null = null;
      const isCart = evName === 'carts-delayed';

      if (evName === 'applications-dataSet') {
        const body = appData;
        if (body && Array.isArray(body.manual_queue) && body.manual_queue.length) {
          manualQueue = body.manual_queue;
          const nextId = manualQueue[0];
          if (typeof nextId === 'string' && /[a-f0-9]{24}/.test(nextId)) {
            docId = nextId.trim() as ResourceId;
          }
          manualQueue.shift();
        }
      }

      if (docId) {
        let customer: Customers | undefined;
        let doc: Carts | Orders;
        if (isCart) {
          doc = apiDoc as Carts;
          if (doc.completed || doc.available === false) {
            return null;
          }
          const customerId = doc.customers && apiDoc.customers[0];
          if (customerId) {
            customer = (await api.get(`customers/${customerId}`)).data;
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
