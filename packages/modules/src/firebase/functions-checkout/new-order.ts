import type { Response } from 'firebase-functions/v1';
import type { ApiError } from '@cloudcommerce/api/types';
import type { OrderSet, CheckoutBody } from '@cloudcommerce/types';
import type {
  Amount,
  CheckoutTransaction,
  TransactionOrder,
  PaymentHistory,
  PaymentGateways,
} from '../../types/index';
import { logger } from '@cloudcommerce/firebase/lib/config';
import api from '@cloudcommerce/api';
import { sendError, getValidResults } from './checkout-utils';
import {
  newOrder,
  cancelOrder,
  addPaymentHistory,
} from './handle-order-transaction';
import requestModule from './request-to-module';

const usrMsg = {
  en_us: 'Your order was saved, but we were unable to make the payment, '
    + 'please contact us',
  pt_br: 'Seu pedido foi salvo, mas não conseguimos efetuar o pagamento, '
    + 'por favor entre em contato',
};

const createOrder = async (
  res: Response,
  modulesBaseURL: string,
  amount: Amount,
  checkoutBody: CheckoutBody,
  orderBody: OrderSet,
  transactions: CheckoutTransaction[],
  dateTime: string,
  paymentGateway?: PaymentGateways[number],
  paymentDiscountValue?: number,
) => {
  const { order, err } = await newOrder(orderBody);
  if (order) {
    const orderId = order._id;
    const orderNumber = order.number;
    const isOrderCancelled = false;

    let countDone = 0;
    let paymentsAmount = 0;
    let loyaltyPointsBalance = 0;
    const paymentsHistory: PaymentHistory[] = [];

    const nextTransaction = async (index = 0) => {
      const newTransaction = transactions[index];

      // merge objects to create transaction request body
      const transactionBody = {
        ...checkoutBody,
        transaction: newTransaction,
        order_id: orderId,
        order_number: orderNumber,
        // also need shipping address
        // send from shipping object if undefined on transaction object
        to: { ...checkoutBody.shipping.to },
        ...newTransaction,
        amount: { ...amount },
      };
      newTransaction.amount_part = newTransaction.amount_part || 0;
      if (transactionBody.amount && newTransaction.amount_part > 0
        && newTransaction.amount_part < 1) {
        // fix amount for multiple transactions
        const partialAmount = transactionBody.amount.total * newTransaction.amount_part;
        transactionBody.amount.discount = transactionBody.amount.discount || 0;
        transactionBody.amount.discount += transactionBody.amount.total - partialAmount;
        transactionBody.amount.total = partialAmount;
        if (transactionBody.payment_method.code === 'loyalty_points') {
          loyaltyPointsBalance += partialAmount;
        }
        delete transactionBody.amount_part;
      }
      // logger.log(JSON.stringify(transactionBody, null, 2))
      // logger.log(JSON.stringify(checkoutBody, null, 2))

      // finally pass to create transaction
      let listTransactions = await requestModule(transactionBody, modulesBaseURL, 'transaction');
      if (listTransactions) {
        listTransactions = getValidResults(listTransactions);
        const isFirstTransaction = index === 0;
        let isDone: boolean = false;
        for (let i = 0; i < listTransactions.length; i++) {
          const result = listTransactions[i];
          // treat transaction response
          const { response } = result;
          const transaction: TransactionOrder = response && response.transaction;
          if (transaction) {
            // complete transaction object with some request body fields
            [
              'type',
              'payment_method',
              'payer',
              'currency_id',
              'currency_symbol',
            ].forEach((field) => {
              if (transactionBody[field] !== undefined && transaction[field] === undefined) {
                transaction[field] = transactionBody[field];
              }
            });

            // setup transaction app object
            if (!transaction.app) {
              transaction.app = { _id: result._id };
              // complete app object with some request body fields
              const transactionOptions = Array.isArray(checkoutBody.transaction)
                ? checkoutBody.transaction.find(
                  (transactionFound) => transactionFound.app_id === result._id,
                )
                : checkoutBody.transaction;
              if (transactionOptions) {
                [
                  'label',
                  'icon',
                  'intermediator',
                  'payment_url',
                ].forEach((field) => {
                  if (transactionOptions[field] !== undefined && transaction.app) {
                    transaction.app[field] = transactionOptions[field];
                  }
                });
              }
              // logger.log(transaction.app)
            }
            if (isFirstTransaction && paymentGateway) {
              if (!transaction.app.intermediator) {
                transaction.app.intermediator = paymentGateway.intermediator;
              } else if (paymentGateway.intermediator?.code) {
                transaction.app.intermediator.code = paymentGateway.intermediator.code;
              }
              if (paymentDiscountValue) {
                transaction.discount = paymentDiscountValue;
              }
            }

            // check for transaction status
            if (!transaction.status) {
              transaction.status = {
                current: 'pending',
              };
            }
            transaction.status.updated_at = dateTime;

            if (isFirstTransaction) {
              // merge transaction body with order info and respond
              res.send({
                status: 200,
                order: {
                  _id: orderId,
                  number: orderNumber,
                },
                transaction,
              });
            }
            const currLoyaltyPointsBalance = loyaltyPointsBalance;
            api.post(`orders/${orderId}/transactions`, transaction)
              .then(({ data }) => {
                const transactionId = data._id;
                const paymentEntry: PaymentHistory = {
                  transaction_id: transactionId,
                  status: transaction.status?.current || 'unknown',
                  date_time: dateTime,
                  flags: ['checkout'],
                };
                paymentsHistory.push(paymentEntry);
                return addPaymentHistory(
                  orderId,
                  paymentsHistory,
                  isFirstTransaction,
                  paymentEntry,
                  dateTime,
                  currLoyaltyPointsBalance,
                  amount,
                );
              })
              .catch((_err: any) => {
                const error = _err as ApiError;
                logger.error(error, {
                  response: error.data,
                  transaction,
                });
              });
            index += 1;
            if (index < transactions.length) {
              nextTransaction(index);
            }
            isDone = true;
            paymentsAmount += transaction.amount;
            break;
          }
        }

        if (isDone) {
          countDone += 1;
          if (countDone === transactions.length) {
            if (amount.total / paymentsAmount > 1.01) {
              return cancelOrder(
                'Transaction amounts doesn\'t match (is lower) order total value',
                orderId,
                isOrderCancelled,
                res,
                usrMsg,
              );
            }
          }
          return true;
        }

        // unexpected response object from create transaction module
        const firstResult = listTransactions && listTransactions[0];
        let errorMessage: string | undefined;
        if (firstResult) {
          const { response } = firstResult;
          if (response) {
            // send devMsg with app response
            if (response.message) {
              errorMessage = response.message;
              if (response.error) {
                errorMessage += ` (${response.error})`;
              }
            } else {
              errorMessage = JSON.stringify(response);
            }
          } else {
            errorMessage = firstResult.error_message;
          }
        }
        if (isFirstTransaction) {
          return sendError(
            res,
            409,
            'CKT704',
            errorMessage || 'No valid transaction object',
            usrMsg,
          );
        }
        return cancelOrder(
          'Error trying to create transaction',
          orderId,
          isOrderCancelled,
          res,
          usrMsg,
          errorMessage,
        );
      }
      return sendError(
        res,
        409,
        'CKT704',
        'There was a problem saving your order, please try again later',
        usrMsg,
      );
    };

    return nextTransaction();
  }

  return sendError(
    res,
    (err?.data?.status || err?.statusCode) || 409,
    'CKT701',
    (err?.message) || 'There was a problem saving your order, please try again later',
    {
      en_us: 'There was a problem saving your order, please try again later',
      pt_br: 'Houve um problema ao salvar o pedido, por favor tente novamente mais tarde',
    },
    err?.data?.more_info,
  );
};

export default createOrder;
