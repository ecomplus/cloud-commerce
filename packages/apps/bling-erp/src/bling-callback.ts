import type { Request, Response } from 'firebase-functions/v1';
import type { Applications } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import checkEnableApi from './bling-auth/check-enable-api';
import importProduct from './integration/import-product-from-bling';
import importOrder from './integration/import-order-from-bling';
import afterQueue from './integration/after-bling-queue';

let hasWarnedNoToken = false;

const getRetorno = (body: any) => {
  if (typeof body !== 'object' || !body) return null;
  if (body.retorno) return body.retorno;
  if (typeof body.data === 'string') {
    try {
      return JSON.parse(body.data).retorno;
    } catch {
      return null;
    }
  }
  return null;
};

export default async (req: Request, res: Response) => {
  const retorno = getRetorno(req.body);
  if (!retorno) {
    logger.info(`Unexpected Bling callback: ${JSON.stringify(req.body)}`);
    res.status(200).send('Ignoring invalid request body');
    return;
  }

  const { apps: { blingErp: { appId } } } = config.get();
  const applicationId = req.query._id;
  const appEndpoint = applicationId && typeof applicationId === 'string'
    ? `applications/${applicationId}` as `applications/${Applications['_id']}`
    : `applications/app_id:${appId}` as const;
  const application = (await api.get(appEndpoint)).data;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  const callbackToken = process.env.BLINGERP_CALLBACK_TOKEN || appData.callback_token;
  if (callbackToken) {
    if (req.query.token !== callbackToken) {
      res.sendStatus(401);
      return;
    }
  } else if (!hasWarnedNoToken) {
    hasWarnedNoToken = true;
    logger.warn('Bling callback accepted without token validation,'
      + ' set `BLINGERP_CALLBACK_TOKEN` and append `?token=` to the callback URL on Bling');
  }
  if (!(await checkEnableApi())) {
    logger.warn('> Error in request to Bling API');
    res.sendStatus(403);
    return;
  }

  const runQueueEntry = async (
    queueEntry: Record<string, any>,
    handler: any,
    canCreateNew = false,
  ) => {
    try {
      const payload = await handler(
        {},
        queueEntry,
        appData,
        canCreateNew,
        Boolean(queueEntry.isHiddenQueue),
      );
      return await afterQueue(queueEntry, appData, application, payload);
    } catch (err: any) {
      return afterQueue(queueEntry, appData, application, err);
    }
  };

  const { pedidos, estoques } = retorno;
  if (Array.isArray(pedidos)) {
    for (let i = 0; i < pedidos.length; i++) {
      const { numero } = pedidos[i].pedido || pedidos[i];
      if (numero) {
        logger.info(`> Bling callback order ${numero}`);
        // eslint-disable-next-line no-await-in-loop
        await runQueueEntry({
          action: 'importation',
          queue: 'order_numbers',
          nextId: String(numero),
          isNotQueued: true,
          isHiddenQueue: true,
        }, importOrder);
      }
    }
  }

  if (Array.isArray(estoques) && appData.import_quantity !== false) {
    for (let i = 0; i < estoques.length; i++) {
      const { id, codigo } = estoques[i].estoque || estoques[i];
      /*
      Variations created on Bling without a SKU have an empty `codigo`, and are
      imported with the Bling ID as SKU, so it's also the queue reference.
      */
      const sku = codigo || (id && String(id));
      if (sku) {
        logger.info(`> Bling callback stock ${sku} (${id})`);
        /*
        `import_product` is what enables creating the product on the store when
        it's not found by SKU, so it must drive `canCreateNew` here.
        */
        // eslint-disable-next-line no-await-in-loop
        await runQueueEntry({
          action: 'importation',
          queue: 'skus',
          nextId: `${sku};:`,
          _blingId: id,
          isNotQueued: true,
          isHiddenQueue: true,
        }, importProduct, Boolean(appData.import_product));
      }
    }
  }

  res.sendStatus(200);
};
