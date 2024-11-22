import type { Response } from 'firebase-functions/v1';
import type { Orders, OrderSet } from '@cloudcommerce/types';
import type {
  Amount,
  PaymentHistory,
  OrderPaymentHistory,
} from '../../types/index';
import { logger } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import { sendError } from './checkout-utils';

const newOrder = async (orderBody: OrderSet) => {
  try {
    const orderId = (await api.post('orders', orderBody)).data._id;
    return new Promise<{ order: Orders | null, err?: any }>((resolve) => {
      setTimeout(async () => {
        try {
          const { data: order } = await api.get(`orders/${orderId}`, {
            headers: { 'x-primary-db': 'true' },
          });
          resolve({ order });
        } catch (err: any) {
          logger.error(err);
          resolve({ order: null, err });
        }
      }, 400);
    });
  } catch (err: any) {
    if (err.message === 'fetch failed') {
      logger.error(err);
    }
    return { order: null, err };
  }
};

const cancelOrder = async (
  staffNotes: string,
  orderId: Orders['_id'],
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
            status: 'cancelled' as const,
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
          } catch (err) {
            logger.error(err);
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

const addPaymentHistory = async (
  orderId: Orders['_id'],
  listPaymentsHistory: PaymentHistory[],
  isFirstTransaction: boolean,
  paymentEntry: PaymentHistory,
  dateTime: string,
  loyaltyPointsBalance: number,
  amount: Amount,
) => {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      const body: OrderPaymentHistory = {
        amount,
      };
      body.payments_history = listPaymentsHistory;
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
        await api.patch(`orders/${orderId}`, body);
        resolve(true);
      } catch (err) {
        reject(err);
      }
    }, isFirstTransaction ? 100 : 400);
  });
};

export {
  newOrder,
  cancelOrder,
  addPaymentHistory,
};
