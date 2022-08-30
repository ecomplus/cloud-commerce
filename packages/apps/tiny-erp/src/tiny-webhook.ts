import type { Request, Response } from 'firebase-functions';
import type { Applications } from '@cloudcommerce/types';
import { firestore } from 'firebase-admin';
import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import importProduct from './integration/import-product-from-tiny';
import importOrder from './integration/import-order-from-tiny';

let appData: Record<string, any> = {};
let application: Applications;

export default async (req: Request, res: Response) => {
  const tinyToken = req.query.token;
  if (typeof tinyToken === 'string' && tinyToken && req.body) {
    const { dados, tipo } = req.body;
    if (dados) {
      /*
      TODO: Check Tiny server IPs
      const clientIp = req.get('x-forwarded-for') || req.connection.remoteAddress
      */
      const { TINY_ERP_TOKEN } = process.env;
      if (!TINY_ERP_TOKEN || TINY_ERP_TOKEN !== tinyToken) {
        const { apps: { tinyErp: { appId } } } = config.get();
        const applicationId = req.query._id;
        const appEndpoint = applicationId && typeof applicationId === 'string'
          ? `applications/${applicationId}`
          : `applications/app_id:${appId}`;
        application = (await api.get(appEndpoint as 'applications/id')).data;
        appData = {
          ...application.data,
          ...application.hidden_data,
        };
        if (appData.tiny_api_token !== tinyToken) {
          return res.sendStatus(401);
        }
        process.env.TINY_ERP_TOKEN = tinyToken;
      }

      if (dados.idVendaTiny) {
        const orderNumber = `id:${dados.idVendaTiny}`;
        const queueEntry = {
          nextId: orderNumber,
          isNotQueued: true,
        };
        await importOrder({}, queueEntry);
      } else if (
        (tipo === 'produto' || tipo === 'estoque')
        && (dados.id || dados.idProduto)
        && (dados.codigo || dados.sku)
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
          updatedAt: firestore.Timestamp.fromDate(new Date()),
        };
        logger.info(`> Tiny webhook: ${nextId} => ${tinyStockUpdate.produto.saldo}`);
        const queueEntry = {
          nextId,
          tinyStockUpdate,
          isNotQueued: true,
          app: application,
        };
        await importProduct({}, queueEntry, appData, false, true);
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
        return res.status(200).send(mapeamentos);
      }
      return res.sendStatus(200);
    }
    logger.warn('< Invalid Tiny Webhook body', req.body);
  }
  return res.sendStatus(403);
};
