import type { Response } from 'firebase-functions';
import type { CheckoutBody } from '@cloudcommerce/types';
import type {
  BodyOrder,
  Amount,
  CheckoutTransaction,
  TransactionOrder,
  BodyPaymentHistory,
} from '../../types/index';
import logger from 'firebase-functions/lib/logger';
import { sendError, getValidResults } from './utils';
import {
  newOrder,
  cancelOrder,
  saveTransaction,
  addPaymentHistory,
  checkoutRespond,
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
  accessToken: string,
  hostname: string,
  amount: Amount,
  checkoutBody: CheckoutBody,
  orderBody:BodyOrder,
  transactions: CheckoutTransaction[],
  dateTime: string,
) => {
  // start creating new order to API

  const order = await newOrder(orderBody, accessToken);
  if (order) {
    const orderId = order._id;
    const orderNumber = order.number;
    const isOrderCancelled = false;

    let countDone = 0;
    let paymentsAmount = 0;
    let loyaltyPointsBalance = 0;
    const paymentHistory: BodyPaymentHistory[] = [];

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
      let listTransactions = await requestModule(transactionBody, hostname, 'transaction');
      if (listTransactions) {
        listTransactions = getValidResults(listTransactions);
        // simulateRequest(transactionBody, checkoutRespond, 'transaction', storeId, (results) => {
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

            // check for transaction status
            if (!transaction.status) {
              transaction.status = {
                current: 'pending',
              };
            }
            transaction.status.updated_at = dateTime;

            if (isFirstTransaction) {
              // merge transaction body with order info and respond
              return checkoutRespond(res, orderId, orderNumber, transaction);
            }

            // save transaction info on order data
            // saveTransaction(transaction, orderId, storeId, (err, transactionId) => {
            try {
              // eslint-disable-next-line no-await-in-loop
              const transactionId = await saveTransaction(
                accessToken,
                orderId,
                transaction,
              ) as string;
              // add entry to payments history
              const paymentEntry: BodyPaymentHistory = {
                transaction_id: transactionId,
                status: transaction.status.current,
                date_time: dateTime,
                flags: ['checkout'],
              };
              paymentHistory.push(paymentEntry);
              try {
                // eslint-disable-next-line no-await-in-loop
                await addPaymentHistory(
                  orderId,
                  accessToken,
                  paymentHistory,
                  isFirstTransaction,
                  paymentEntry,
                  dateTime,
                  loyaltyPointsBalance,
                  amount,
                );
              } catch (e) {
                logger.error(e);
              }
            } catch (e) {
              logger.error(e);
            }
            index += 1;
            if (index < transactions.length) {
              return nextTransaction(index);
            }
            // });
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
                accessToken,
                isOrderCancelled,
                res,
                usrMsg,
              );
            }
          }
          // return
          return checkoutRespond(res, orderId, orderNumber);
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
          accessToken,
          isOrderCancelled,
          res,
          usrMsg,
          errorMessage,
        );
      }
      // send error no exist transaction
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
  // send error
  const userMessage = {
    en_us: 'There was a problem saving your order, please try again later',
    pt_br: 'Houve um problema ao salvar o pedido, por favor tente novamente mais tarde',
  };
  return sendError(
    res,
    409,
    'CKT701',
    'There was a problem saving your order, please try again later',
    userMessage,
  );
};

export default createOrder;
