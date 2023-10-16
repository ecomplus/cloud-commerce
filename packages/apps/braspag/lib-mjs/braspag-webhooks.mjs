// REF.: // https://braspag.github.io//manual/braspag-pagador#post-de-notifica%C3%A7%C3%A3o
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import config from '@cloudcommerce/firebase/lib/config';
import axiosBraspag from './functions-lib/braspag/create-axios.mjs';
import { parseStatus } from './functions-lib/braspag/parsers.mjs';
import {
  addPaymentHistory,
  getOrderIntermediatorTransactionId,
} from './functions-lib/utils.mjs';

const getApp = async () => {
  return new Promise((resolve, reject) => {
    api.get(
      `applications?app_id=${config.get().apps.braspag.appId}&fields=hidden_data`,
    )
      .then(({ data: result }) => {
        resolve(result[0]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default async (req, res) => {
  const { body } = req;
  /*
    {
      "RecurrentPaymentId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "PaymentId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
      "ChangeType": "2"
    }
  */

  try {
    const type = body.ChangeType;

    logger.log(`>> webhook ${JSON.stringify(body)}, type:${type}`);

    const appData = await getApp();
    const { merchant_id: merchantId, merchant_key: merchantKey } = appData;

    if (type === 1) {
      // Mudança de status do pagamento
      const braspagAxios = axiosBraspag(merchantId, merchantKey, true);
      const { data: { Payment: payment } } = await braspagAxios.get(`/sales/${body.PaymentId}`);
      let dateTime = new Date().toISOString();
      logger.log('>> payment ', JSON.stringify(payment));

      const order = await getOrderIntermediatorTransactionId(body.PaymentId);
      if (order) {
        const status = (parseStatus[payment.Status] || 'unknown');
        if (order.financial_status.current !== status) {
          // updadte status
          const transaction = order.transactions.find(
            (transactionFind) => transactionFind.intermediator.transaction_id === body.PaymentId,
          );
          logger.log('>> Try add payment history');

          let notificationCode = `${type};${payment.type};`;
          if ((parseStatus[payment.Status] === 'refunded' || parseStatus[payment.Status] === 'voided')
            && payment?.VoidedDate) {
            dateTime = new Date(`${payment?.VoidedDate} UTC-3`).toISOString();
            notificationCode += `${dateTime};`;
          } else if (payment.CapturedDate && parseStatus[payment.Status] === 'paid') {
            dateTime = new Date(`${payment?.CapturedDate} UTC-3`).toISOString();
            notificationCode += `${dateTime};`;
          }

          const bodyPaymentHistory = {
            date_time: dateTime,
            status,
            notification_code: notificationCode,
            flags: ['Braspag'],
          };
          if (transaction && transaction._id) {
            bodyPaymentHistory.transaction_id = transaction._id;
          }
          // logger.log('>> ', dateTime, ' ', payment?.CapturedDate,  ' ',  payment?.VoidedDate)
          await addPaymentHistory(order._id, bodyPaymentHistory);
          logger.log(`>> Status update to ${status}`);
          return res.sendStatus(200);
        }
        logger.log(`Status is ${status}`);
        return res.sendStatus(200);
      }
      return res.status(404)
        .send({ message: `order with TransactionId #${body.PaymentId} not found` });
    }

    return res.sendStatus(405);
  } catch (error) {
    logger.error(error);
    const errCode = 'WEBHOOK_BRASPAG_INTERNAL_ERR';
    let status = 409;
    let message = error.message;
    if (error.response) {
      status = error.response.status || status;
      const { data } = error.response;
      if (status !== 401 && status !== 403) {
        message = error.response.message || message;
      } else if (data && Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) {
        message = data.errors[0].message;
      }
    }
    return res.status(status || 500)
      .send({
        error: errCode,
        message,
      });
  }
};
