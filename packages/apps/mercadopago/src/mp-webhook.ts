/* eslint-disable import/prefer-default-export */
import '@cloudcommerce/firebase/lib/init';
import { logger } from 'firebase-functions';
import axios from 'axios';
import api from '@cloudcommerce/api';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import { parsePaymentStatus } from './mp-create-transaction';

const ECHO_SKIP = 'SKIP';
let ECHO_SUCCESS = 'OK';

export const mercadopago = {
  webhook: functions
    .region(config.get().httpsFunctionOptions.region)
    .https.onRequest(async (req, res) => {
      const { method } = req;
      if (method === 'POST') {
        const { body } = req;
        logger.log('>> Webhook MP #', JSON.stringify(body), ' <<');
        try {
          const app = (await api.get(
            'applications?app_id=111223&fields=hidden_data',
          )).data.result;
          const accessTokenMp = app[0].hidden_data?.mp_access_token;
          if (accessTokenMp) {
            const notification = req.body;
            if (notification.type !== 'payment' || !notification.data || !notification.data.id) {
              res.status(404).send(ECHO_SKIP);
            }

            // setTimeout(() => {
            logger.log('> MP Notification for Payment #', notification.data.id);

            const docRef = getFirestore().collection('mercadopagoPayments')
              .doc(String(notification.data.id));

            docRef.get()
              .then(async (doc) => {
                if (doc.exists) {
                  const data = doc.data();
                  const orderId = data?.order_id;
                  const order = (await api.get(
                    `orders/${orderId}`,
                  )).data;
                  logger.log('>order ', JSON.stringify(order), '<');
                  if (order && order.transactions) {
                    const payment = (await axios.get(
                      `https://api.mercadopago.com/v1/payments/${notification.data.id}`,
                      {
                        headers: {
                          Authorization: `Bearer ${accessTokenMp}`,
                          'Content-Type': 'application/json',
                        },
                      },
                    )).data;
                    logger.log('>payment ', JSON.stringify(payment), ' <');
                    const methodPayment = payment.payment_method_id;

                    const transaction = order.transactions.find(({ intermediator }) => {
                      return intermediator
                        && intermediator.transaction_code === notification.data.id;
                    });
                    const status = parsePaymentStatus(payment.status);
                    if (transaction) {
                      const bodyPaymentHistory = {
                        transaction_id: transaction._id,
                        date_time: new Date().toISOString(),
                        status,
                        notification_code: String(notification.id),
                        flags: [
                          'mercadopago',
                        ],
                      } as any; // TODO: incompatible type=> amount and status

                      if (status !== order.financial_status?.current) {
                      // avoid unnecessary API request
                        await api.post(`orders/${orderId}/payments_history`, bodyPaymentHistory);
                        const updatedAt = new Date().toISOString();
                        docRef.set({ status, updatedAt }, { merge: true }).catch(logger.error);
                      }

                      if ((status === 'paid' && methodPayment === 'pix' && transaction)) {
                        let { notes } = transaction;
                        notes = notes?.replace('display:block', 'display:none'); // disable QR Code
                        notes = `${notes} # PIX Aprovado`;

                        // orders/${order._id}/transactions/${transactionId}.json { notes }
                        // Update to disable QR Code
                        try {
                          await api.patch(
                            `orders/${order._id}/transactions/${transaction._id}`,
                            { notes },
                          );
                          ECHO_SUCCESS = 'SUCCESS';
                        } catch (e) {
                          logger.error(e);
                        }
                      }

                      res.status(200).send(ECHO_SUCCESS);
                    } else {
                    // transaction not found
                      logger.log('> Transaction not found #', notification.data.id);
                      res.sendStatus(404);
                    }
                  } else {
                  // order or order transaction not found
                    logger.log('> Order Not Found #', orderId);
                    res.sendStatus(404);
                  }
                } else {
                  logger.log('> Payment not found in Firestore #', notification.data.id);
                  res.sendStatus(404);
                }
              })
              .catch((err) => {
                logger.error(err);
                res.sendStatus(503);
              });
          // }, 3000);
          } else {
            res.sendStatus(406);
          }
        } catch (e) {
          logger.error(e);
          res.sendStatus(500);
        }
      } else {
        res.sendStatus(405);
      }
    }),
};
