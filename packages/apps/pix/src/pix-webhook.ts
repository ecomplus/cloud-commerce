/* eslint-disable import/prefer-default-export */
import type { Request, Response } from 'firebase-functions';
import '@cloudcommerce/firebase/lib/init';
import api from '@cloudcommerce/api';
import logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import Pix from './functions-lib/pix-auth/construtor';
import getPfx from './functions-lib/get-certificate';

const handler = async (req: Request, res: Response, rand: string) => {
  try {
    const querySnapshot = await getFirestore()
      .collection('pixSetup')
      .where('rand', '==', rand)
      .limit(1)
      .get();

    if (querySnapshot && !querySnapshot.empty) {
      const documentSnapshot = querySnapshot.docs[0];

      const setHookState = (isValidating = false) => {
        return documentSnapshot.ref
          .set({ isValidating }, { merge: true });
      };

      if (req.body) {
        logger.log(`> (App:Pix) Webhook (${rand}) ${JSON.stringify(req.body)}`);
        const pixHooks = req.body.pix;
        if (Array.isArray(pixHooks) && pixHooks.length) {
          if (!documentSnapshot.exists) {
            return res.sendStatus(401);
          }
          const pixApi = documentSnapshot.get('pixApi');
          if (!pixApi) {
            return res.sendStatus(410);
          }
          if (documentSnapshot.get('isValidating')) {
            setHookState();
          }

          let pfx;
          try {
            pfx = await getPfx(pixApi.certificate);
          } catch (err) {
            logger.error(err);
            return res.sendStatus(409);
          }

          let baseURL: string | undefined;
          if (pixApi.host && typeof pixApi.host === 'string') {
            baseURL = pixApi.host.startsWith('http') ? pixApi.host : `https://${pixApi.host}`;
          }

          const pix = new Pix({
            clientId: pixApi.client_id,
            clientSecret: pixApi.client_secret,
            pfx,
            baseURL,
            oauthEndpoint: pixApi.oauth_endpoint,
            tokenData: pixApi.authorization,
          });

          await pix.preparing;

          await Promise.all(pixHooks.map(async ({ endToEndId, txid }) => {
            if (pix.axios) {
              const { data } = await pix.axios.get(`/v2/cob/${txid}`);
              if (data) {
                logger.log(`> (App:Pix) Read ${txid} ${JSON.stringify(data)}`);
                const { status, infoAdicionais } = data;
                const orderInfo = infoAdicionais.find(({ nome }) => nome === 'ecom_order_id');
                if (orderInfo) {
                  const orderId = orderInfo.valor;
                  let financialStatus: string | undefined;

                  switch (status.toUpperCase()) {
                    case 'CONCLUIDA':
                      if (
                        Array.isArray(data.pix)
                        && data.pix.find(({ valor, devolucoes }) => {
                          if (
                            data.valor
                            && data.valor.original
                            && valor < data.valor.original
                          ) {
                            return false;
                          }

                          return devolucoes && devolucoes.find(
                            (devolucao: { status: string; }) => {
                              return devolucao.status === 'DEVOLVIDO';
                            },
                          );
                        })
                      ) {
                        financialStatus = 'refunded';
                      } else {
                        financialStatus = 'paid';
                      }
                      break;

                    case 'DEVOLVIDO':
                      financialStatus = 'refunded';
                      break;
                    default:
                      if (status.startsWith('REMOVIDA_')) {
                        financialStatus = 'voided';
                      }
                  }

                  if (orderId && financialStatus) {
                    const bodyPaymentHistory = {
                      date_time: new Date().toISOString(),
                      status: financialStatus,
                      notification_code: endToEndId,
                      flags: ['pixapi'],
                    } as any; // TODO: incompatible type=> amount and status;

                    await api.post(
                      `orders/${orderId}/payments_history`,
                      bodyPaymentHistory,
                    );
                  }
                }
                return data;
              }
            }
            return true;
          }));

          return res.sendStatus(200);
        }
        // not create axios instance
        return res.sendStatus(500);
      }
      // body not found
      if (!documentSnapshot.exists || !documentSnapshot.get('isValidating')) {
        setHookState(true).catch(logger.error);
        return res.sendStatus(503);
      }
      logger.log('> (App:Pix) Webhook ignored');
      setHookState().catch(logger.error);
      return res.sendStatus(200);
    }
    return res.sendStatus(410);
  } catch (err: any) {
    logger.error(err);
    if (!res.headersSent) {
      return res.sendStatus(502);
    }
    //
    return res.sendStatus(500);
  }
};

const { httpsFunctionOptions } = config.get();

export const pix = {
  webhook: functions
    .region(httpsFunctionOptions.region)
    .runWith(httpsFunctionOptions)
    .https.onRequest(async (req, res) => {
      const { method } = req;
      const rand = req.url.split('/')[1];
      if (method === 'POST' || method === 'PUT') {
        handler(req, res, rand);
      } else {
        res.sendStatus(405);
      }
    }),
};
