import type { Request, Response } from 'firebase-functions';
import { firestore } from 'firebase-admin';
import logger from 'firebase-functions/lib/logger';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import importProduct from './integration/import-product-from-tiny';
import importOrder from './integration/import-order-from-tiny';
import afterQueue from './integration/after-tiny-queue';

export default async (req: Request, res: Response) => {
  const tinyToken = req.query.token;
  if (typeof tinyToken === 'string' && tinyToken && req.body) {
    const { dados, tipo } = req.body;
    if (dados) {
      /*
      TODO: Check Tiny server IPs
      const clientIp = req.get('x-forwarded-for') || req.connection.remoteAddress
      */
      const { apps: { tinyErp: { appId } } } = config.get();
      const applicationId = req.query._id;
      const appEndpoint = applicationId && typeof applicationId === 'string'
        ? `applications/${applicationId}`
        : `applications/app_id:${appId}`;
      const application = (await api.get(appEndpoint as 'applications/id')).data;
      const appData: Record<string, any> = {
        ...application.data,
        ...application.hidden_data,
      };
      if (appData.tiny_api_token !== tinyToken) {
        return res.sendStatus(401);
      }

      if (dados.idVendaTiny) {
        let orderNumbers = appData.___importation?.order_numbers;
        if (!Array.isArray(orderNumbers)) {
          orderNumbers = [];
        }
        const orderNumber = `id:${dados.idVendaTiny}`;
        if (!orderNumbers.includes(orderNumber)) {
          logger.info(`> Tiny webhook: order ${orderNumber}`);
          const saveToQueue = () => {
            orderNumbers.push(orderNumber);
            logger.info(`> Order numbers: ${JSON.stringify(orderNumbers)}`);
            return updateAppData(application, {
              ___importation: {
                ...appData.___importation,
                order_numbers: orderNumbers,
              },
            });
          };

          const queueEntry = {
            nextId: orderNumber,
            isNotQueued: true,
          };
          try {
            const payload = await importOrder({}, queueEntry);
            await afterQueue(queueEntry, appData, application, payload);
          } catch (e) {
            await saveToQueue();
          }
        }
      }

      if (tipo === 'produto' || tipo === 'estoque') {
        if ((dados.id || dados.idProduto) && (dados.codigo || dados.sku)) {
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
          const saveToQueue = () => {
            let skus = appData.___importation && appData.___importation.skus;
            if (!Array.isArray(skus)) {
              skus = [];
            }
            if (!skus.includes(nextId)) {
              return firestore().collection('tinyErpStockUpdates').add(tinyStockUpdate)
                .then(() => {
                  skus.push(nextId);
                  logger.info(`> SKUs: ${JSON.stringify(skus)}`);
                  return updateAppData(application, {
                    ___importation: {
                      ...appData.___importation,
                      skus,
                    },
                  });
                });
            }
            return Promise.resolve(null);
          };

          const queueEntry = {
            nextId,
            tinyStockUpdate,
            isNotQueued: true,
          };
          try {
            const payload = await importProduct({}, queueEntry, appData, false, true);
            await afterQueue(queueEntry, appData, application, payload);
          } catch (e) {
            await saveToQueue();
          }
        }
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
  }
  return res.sendStatus(403);
};
