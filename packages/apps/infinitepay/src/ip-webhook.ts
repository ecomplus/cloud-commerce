/* eslint-disable import/prefer-default-export */
import type { Request, Response } from 'firebase-functions';
import type { ResourceId, Orders } from '@cloudcommerce/types';
import '@cloudcommerce/firebase/lib/init';
import api from '@cloudcommerce/api';
import logger from 'firebase-functions/logger';
import { getFirestore } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions/v1';
import config from '@cloudcommerce/firebase/lib/config';
import cryptoJS from 'crypto-js';

type DocTransactionPix = {
  orderId: ResourceId;
  secret: string;
  transactionReference: number;
}

const handleError = (error: any, res: Response, status?: number) => {
  const { response } = error;
  if (response) {
    status = response.status;
    const err = {
      message: `InfinitePay callback PIX error ${status}`,
      url: '',
      status: 0,
      response: '',
    };
    err.url = error.config && error.config.url;
    err.status = status || 500;
    err.response = JSON.stringify(response.data);
    logger.error(err);
  }

  return res.send({
    status: status || 500,
    message: '#InfinitePay callback PIX error',
  });
};

const getTransactionPix = (
  collectionTransactions: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>,
  transactionId: string,
): Promise<DocTransactionPix> => {
  return new Promise((resolve, reject) => {
    const transaction = collectionTransactions.doc(transactionId);
    transaction.get()
      .then((documentSnapshot) => {
        if (documentSnapshot.exists) {
          const documentData = documentSnapshot.data() as DocTransactionPix;

          const { orderId } = documentData;
          const { secret } = documentData;
          const { transactionReference } = documentData;
          if (orderId && secret && transactionReference) {
            resolve({
              orderId, secret, transactionReference,
            });
          }
          reject(new Error('Transaction properties not found'));
        }
        reject(new Error('Transaction not found'));
      })
      .catch((e: any) => {
        reject(e);
      });
  });
};

const handler = async (req: Request, res: Response) => {
  // https://gist.github.com/luisbebop/ca87e04da04bcf662f732b1b6848d6ca#integration-
  // const transactionId = req.body && req.body.transaction_id;
  const hasPix = req.query && req.query.pix;
  const firestoreColl = 'infinitepayTransactionsPix';

  logger.log(`>> >(App: Infinite) Webhook ${hasPix ? 'pix' : ''} <`);

  if (hasPix && hasPix === 'confirm') {
    const collectionTransactions = getFirestore().collection(firestoreColl);
    // console.log('>Has Pix: ', hasPix, ' <');
    const pixId = req.body.transaction_identification;
    if (pixId) {
      let orderId: ResourceId;
      let secret: string;
      let transactionReference: number;
      let order: Orders;
      try {
        const pixInfo = await getTransactionPix(collectionTransactions, pixId);
        orderId = pixInfo.orderId;
        secret = pixInfo.secret;
        transactionReference = pixInfo.transactionReference;
        // console.log('>PIX  o: ', orderId, ' code: ', transactionReference, ' <');
        if (secret && orderId && transactionReference) {
          // https://www.infinitepay.io/docs#validacao-de-callback-do-pix-pago
          const signature = req.headers['x-callback-signature'];
          const generatedSignature = cryptoJS.HmacSHA256(JSON.stringify(req.body), secret)
            .toString();
          if (generatedSignature === signature) {
            // get E-Com Plus order
            order = (await api.get(`orders/${orderId}`)).data;
            // add new transaction status to payment history
            const transaction = order.transactions?.find(({ intermediator }) => {
              return intermediator
                && intermediator.transaction_reference === `${transactionReference}`;
            });
            // console.log('>>Transaction ', JSON.stringify(transaction), ' <<')

            const bodyPaymentHistory = {
              date_time: new Date().toISOString(),
              status: 'paid',
              flags: ['infinitepay'],
            } as any; // TODO: incompatible type=> amount and status;
            if (transaction) {
              bodyPaymentHistory.transaction_id = transaction._id;

              await api.post(`orders/${orderId}/payments_history`, bodyPaymentHistory);

              res.sendStatus(200); // response SUCCESS

              let { notes } = transaction;
              notes = notes && notes.replace('display:block', 'display:none'); // disable QR Code
              notes = `${notes} # PIX Aprovado`;
              transaction.notes = notes;

              await api.patch(
                `orders/${order._id}/transactions/${transaction._id}`,
                { notes },
              );

              const updatedAt = new Date().toISOString();
              collectionTransactions.doc(pixId)
                .set({
                  status: 'paid',
                  updatedAt,
                }, { merge: true })
                .catch(logger.error);

              return null;
            }

            return res.send({
              status: 404,
              message: `InfinitePay transaction not found in order #${orderId}`,
            });
          }

          // logger.log('>Signature: ', signature, ' Gerate:', generatedSignature);
          return res.send({
            status: 403,
            message: 'InfinitePay callback PIX error, signature invalid ',
          });
        }

        return res.send({
          status: 404,
          message: `Transaction error #${pixId}, property not found invalid store`,
        });
      } catch (err: any) {
        logger.error('>(App: Infinite) Error=>', err);
        return handleError(err, res);
      }
    } else {
      return res.send({
        status: 404,
        message: `Transaction error #${pixId}, property not found invalid store`,
      });
    }
  }
  return res.sendStatus(403);
};

export const infinitepay = {
  webhook: functions
    .region(config.get().httpsFunctionOptions.region)
    .https.onRequest(async (req, res) => {
      const { method } = req;

      if (method === 'POST') {
        handler(req, res);
      } else {
        res.sendStatus(405);
      }
    }),
};
