import type { Response } from 'firebase-functions';
import type { Orders } from '@cloudcommerce/types';
import type {
  Amount, BodyOrder,
  BodyPaymentHistory,
  OrderPaymentHistory,
  TransactionOrder,
} from '../../types/index';
import { logger } from 'firebase-functions';
import api from '@cloudcommerce/api';
import { sendError } from './utils';

const checkoutRespond = async (
  res: Response,
  orderId:string & {length: 24},
  orderNumber: number | undefined,
  usrMsg: { en_us: string, pt_br: string },
  transaction?: TransactionOrder,
) => {
  if (transaction) {
    try {
      const transactionId = (await api.post(
        `orders/${orderId}/transactions`,
        transaction as any,
      )).data._id;
      transaction._id = transactionId;
    } catch (e) {
      logger.error(e);
      return sendError(
        res,
        409,
        'CKT704',
        'Create transaction Error',
        usrMsg,
      );
    }
  }
  return res.send({
    status: 200,
    order: {
      _id: orderId,
      number: orderNumber,
    },
    transaction,
  });
};

const newOrder = async (orderBody: BodyOrder) => {
  try {
    const orderId = (await api.post('orders', orderBody)).data._id;
    return new Promise<Orders|null>((resolve) => {
      setTimeout(async () => {
        try {
          const order = (await api.get(`orders/${orderId}`)).data;
          resolve(order);
        } catch (e) {
          logger.error(e);
          resolve(null);
        }
      }, 800);
    });
  } catch (e) {
    logger.error(e);
    return null;
  }
};

const cancelOrder = async (
  staffNotes: string,
  orderId: string & {length: 24},
  isOrderCancelled: boolean,
  res: Response,
  usrMsg: { en_us: string, pt_br: string },
  errorMessage?: string,
) => {
  let msgErro: string | undefined;
  if (!isOrderCancelled) {
    const msgCancell = () => {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const body = {
            status: 'cancelled',
            staff_notes: staffNotes,
          };
          if (errorMessage) {
            body.staff_notes += ` - \`${errorMessage.substring(0, 200)}\``;
          }
          try {
            const response = await api.patch(`orders/${orderId}`, body);
            if (response.status === 204) {
              isOrderCancelled = true;
            }
          } catch (e) {
            logger.error(e);
          }
          resolve(`${body.staff_notes}`);
        }, 400);
      });
    };
    msgErro = await msgCancell() as string;
  }
  return sendError(
    res,
    409,
    'CKT704',
    msgErro || staffNotes,
    usrMsg,
  );
};

const saveTransaction = (
  orderId: string,
  transactionBody: any, // TODO: error type 'status' incompatible
) => {
  return new Promise((resolve, reject) => {
    api.post(
      `orders/${orderId}/transactions`,
      transactionBody,
    )
      .then(({ data }) => {
        resolve(data._id);
      })
      .catch((e) => {
        reject(e);
      });
  });
};

const addPaymentHistory = async (
  orderId: string,
  paymentHistory: BodyPaymentHistory[],
  isFirstTransaction: boolean,
  paymentEntry: BodyPaymentHistory,
  dateTime: string,
  loyaltyPointsBalance: number,
  amount: Amount,
) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const body: OrderPaymentHistory = {
        amount,
      };
      body.payments_history = paymentHistory;

      if (isFirstTransaction) {
        body.financial_status = {
          current: paymentEntry.status,
          updated_at: dateTime,
        };
      }
      if (loyaltyPointsBalance > 0) {
        const balance = Math.round(loyaltyPointsBalance * 100) / 100;
        body.amount = {
          ...amount,
          balance,
          total: amount.total - balance,
        };
      }

      try {
        const response = await api.patch(`orders/${orderId}`, body);
        if (response.status === 204) {
          resolve(true);
        } else {
          reject(new Error('Error adding payment history'));
        }
      } catch (e) {
        logger.error(e);
        reject(e);
      }
    }, isFirstTransaction ? 200 : 400);
  });
};

export {
  newOrder,
  cancelOrder,
  saveTransaction,
  addPaymentHistory,
  checkoutRespond,
};
