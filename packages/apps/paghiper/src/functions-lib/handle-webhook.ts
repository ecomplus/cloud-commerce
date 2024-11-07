import type { Orders } from '@cloudcommerce/types';
import type { Request, Response } from 'firebase-functions/v1';
import api from '@cloudcommerce/api';
import { Endpoint } from '@cloudcommerce/api/types';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import Axios from './create-axios';

const { apps } = config.get();

const CLIENT_ERR = 'invalidClient';

const listOrdersByTransaction = async (transactionCode: string) => {
  let filters = `?transactions.intermediator.transaction_id=${transactionCode}`;
  filters += '&fields=_id,transactions._id,';
  filters += 'transactions.app,transactions.intermediator,transactions.status';

  // send and return authenticated Store API request
  const { result } = (await api.get(`/orders${filters}` as Endpoint)).data;
  return result as Orders[];
};

const readNotification = async (readNotificationBody: { [x: string]: any }, isPix?: boolean) => {
  // read full notification body from PagHiper API
  // https://dev.paghiper.com/reference#qq
  // returns request promise
  const endpoint = `/${(isPix ? 'invoice' : 'transaction')}/notification/`;
  const { data } = await Axios(isPix).post(endpoint, readNotificationBody);
  return data;
};

export default async (req: Request, res: Response) => {
  const { body } = req;
  const isPix = Boolean(req.params.pix);
  // handle PagHiper notification request
  // https://dev.paghiper.com/reference#qq
  const transactionCode = (body && body.transaction_id);
  if (!transactionCode) {
    return res.sendStatus(400);
  }

  logger.info(`> Paghiper notification for ${transactionCode}`);
  // const docRef = (await collectionSubscription.doc(transactionCode).get()).data();
  const Apps = (await api.get(
    `applications?app_id=${apps.pagHiper.appId}&fields=hidden_data`,
  )).data.result;
  const configApp = Apps[0].hidden_data;
  if (!process.env.PAGHIPER_TOKEN) {
    const pagHiperToken = configApp?.paghiper_api_key;
    if (typeof pagHiperToken === 'string' && pagHiperToken) {
      process.env.PAGHIPER_TOKEN = pagHiperToken;
    } else {
      logger.warn('Missing PagHiper API token');
    }
  }

  try {
    if (process.env.PAGHIPER_TOKEN && process.env.PAGHIPER_TOKEN === body.apiKey) {
      // list order IDs for respective transaction code
      const orders = await listOrdersByTransaction(transactionCode);
      const paghiperResponse = await readNotification(
        { ...body, token: process.env.PAGHIPER_TOKEN },
        isPix,
      );

      const handleNotification = async (isRetry?: boolean) => {
        let { status } = paghiperResponse.status_request;
        logger.info(`PagHiper ${transactionCode} -> '${status}'`);
        switch (status) {
          case 'pending':
          case 'paid':
          case 'refunded':
            // is the same
            break;
          case 'canceled':
            status = 'voided';
            break;
          case 'processing':
            status = 'under_analysis';
            break;
          case 'reserved':
            // https://atendimento.paghiper.com/hc/pt-br/articles/360016177713
            status = 'authorized';
            break;
          default:
            // ignore unknow status
            return true;
        }

        try {
          // change transaction status on E-Com Plus API
          const notificationCode = body.notification_id;
          orders.forEach(async ({ _id, transactions }) => {
            let transactionId: string | undefined;
            if (transactions) {
              transactions.forEach((transaction) => {
                const { app, intermediator } = transaction;
                if (intermediator && intermediator.transaction_id === String(transactionCode)) {
                  if (transaction.status) {
                    if (
                      transaction.status.current === status
                      || (status === 'pending' && transaction.status.current === 'paid')
                    ) {
                      // ignore old/duplicated notification
                      return;
                    }
                  }
                  if (app && app.intermediator && app.intermediator.code !== 'paghiper') {
                    return;
                  }
                  transactionId = transaction._id;
                }
              });
            }

            let bodyPaymentHistory: { [x: string]: any };

            if (typeof status === 'object' && status !== null) {
              // request body object sent as 'status' function param
              bodyPaymentHistory = status;
            } else {
              bodyPaymentHistory = {
                date_time: new Date().toISOString(),
                status,
              };
              if (notificationCode) {
                bodyPaymentHistory.notification_code = notificationCode;
              }
              if (typeof transactionId === 'string' && /^[a-f0-9]{24}$/.test(transactionId)) {
                bodyPaymentHistory.transaction_id = transactionId;
              }
            }
            await api.post(`orders/${_id}/payments_history`, bodyPaymentHistory as any); // TODO: incompatible type
          });

          return res.status(204).send('SUCCESS');
        } catch (err: any) {
          //
          const { message, response } = err;
          let statusCode: number;
          if (!err.request && err.name !== CLIENT_ERR && err.code !== 'EMPTY') {
            // not Axios error ?
            logger.error(err);
            statusCode = 500;
          } else {
            const resStatus = response && response.status;
            let debugMsg = `[#${transactionCode}] Unhandled notification: `;
            if (err.config) {
              debugMsg += `${err.config.url} `;
            }
            debugMsg += (resStatus || message);

            if (!isRetry
              && ((resStatus === 401 && response.data && response.data.error_code === 132)
                || resStatus >= 500)
            ) {
              // delay and retry once
              await new Promise((resolve) => {
                setTimeout(() => {
                  resolve(true);
                }, 700);
              });
              return handleNotification(true);
              // statusCode = 503;
            }
            logger.error(debugMsg);
            statusCode = 409;
          }
          // return response with error
          return res.status(statusCode)
            .send({
              error: 'paghiper_notification_error',
              message,
            });
        }
      };
      await handleNotification();
    }

    return res.status(400).send('API key does not match');
  } catch (err: any) {
    logger.error(err);
    return res.sendStatus(500);
  }
};
