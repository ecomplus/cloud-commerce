import type { Request, Response } from 'firebase-functions/v1';
import type { Applications } from '@cloudcommerce/types';
import api from '@cloudcommerce/api';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import importProduct from './integration/import-product-from-tiny';
import importOrder from './integration/import-order-from-tiny';
import afterQueue from './integration/after-tiny-queue';

export default async (req: Request, res: Response) => {
  const tinyToken = req.query.token;
  if (typeof tinyToken !== 'string' || !tinyToken) {
    res.sendStatus(403);
    return;
  }
  const { body } = req;
  if (typeof body !== 'object' || !body) {
    res.sendStatus(422);
    return;
  }
  const { dados, tipo } = body;
  if (typeof dados !== 'object' || !dados) {
    res.sendStatus(400);
    return;
  }
  /*
  TODO: Check Tiny server IPs
  const clientIp = req.get('x-forwarded-for') || req.connection.remoteAddress
  */

  const { apps: { tinyErp: { appId } } } = config.get();
  const applicationId = req.query._id;
  const appEndpoint = applicationId && typeof applicationId === 'string'
    ? `applications/${applicationId}` as `applications/${Applications['_id']}`
    : `applications/app_id:${appId}` as const;
  const application = (await api.get(appEndpoint)).data;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (!process.env.TINYERP_TOKEN) {
    process.env.TINYERP_TOKEN = appData.tiny_api_token;
  }
  if (process.env.TINYERP_TOKEN !== tinyToken) {
    res.sendStatus(401);
    return;
  }

  if (dados.idVendaTiny) {
    const orderNumber = `id:${dados.idVendaTiny}`;
    const queueEntry = {
      nextId: orderNumber,
      isNotQueued: true,
    };
    importOrder({}, queueEntry).catch((err: any) => {
      return afterQueue(queueEntry, appData, application, err);
    });
    res.sendStatus(200);
    return;
  }

  if (
    (tipo === 'produto' || tipo === 'estoque')
    && (dados.id || dados.idProduto)
    && (dados.codigo || dados.sku)
    && (appData.update_product || appData.update_quantity !== false)
  ) {
    const nextId = String(dados.skuMapeamento || dados.sku || dados.codigo);
    const tinyStockUpdate = {
      ref: `${nextId}`,
      tipo,
      produto: {
        id: dados.idProduto,
        codigo: dados.sku,
        ...dados,
      },
    };
    logger.info(`> ${nextId} => ${tinyStockUpdate.produto.saldo}`);
    const queueEntry = {
      nextId,
      tinyStockUpdate,
      isNotQueued: true,
      app: application,
    };
    importProduct({}, queueEntry, appData, tipo === 'produto', true).catch((err: any) => {
      return afterQueue(queueEntry, appData, application, err);
    });
  }

  if (tipo === 'produto') {
    const mapeamentos: any[] = [];
    const parseTinyItem = (tinyItem) => {
      if (tinyItem) {
        const {
          idMapeamento,
          id,
          codigo,
          sku,
        } = tinyItem;
        mapeamentos.push({
          idMapeamento: idMapeamento || id,
          skuMapeamento: codigo || sku,
        });
      }
    };
    parseTinyItem(dados);
    if (Array.isArray(dados.variacoes)) {
      dados.variacoes.forEach((variacao) => {
        parseTinyItem(variacao.id ? variacao : variacao.variacao);
      });
    }
    res.status(200).send(mapeamentos);
    return;
  }
  res.sendStatus(200);
};
