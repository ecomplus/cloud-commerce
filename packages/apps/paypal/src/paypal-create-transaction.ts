import type {
  AppModuleBody,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import type { AxiosError } from 'axios';
import { logger } from '@cloudcommerce/firebase/lib/config';
import parseToPaypalPayment from './util/parse-to-paypal-payment';
import {
  readPaypalPayment,
  editPaypalPayment,
  executePaypalPayment,
} from './util/paypal-api';

export default async (modBody: AppModuleBody<'create_transaction'>) => {
  const {
    application,
    params,
  } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.paypal_client_id) {
    process.env.PAYPAL_CLIENT_ID = appData.paypal_client_id;
  }
  if (appData.paypal_secret) {
    process.env.PAYPAL_CLIENT_SECRET = appData.paypal_secret;
  }
  process.env.PAYPAL_ENV = appData.paypal_sandbox
    ? 'sandbox'
    : process.env.PAYPAL_ENV || 'live';
  const {
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
  } = process.env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return {
      error: 'NO_PAYPAL_KEYS',
      message: 'Client ID ou Secret não configurado (lojista deve configurar o aplicativo)',
    };
  }

  const {
    order_id: orderId,
  } = params;

  const paypalPayerId = params.intermediator_buyer_id;
  let paypalPaymentId: string | undefined;
  let paypalOrderId: string | undefined;
  let paypalInvoiceNumber: string | undefined;
  let paypalPayment: Record<string, any> | undefined;

  if (paypalPayerId && params.open_payment_id) {
    const paymentIdParts = params.open_payment_id.split('/');
    paypalPaymentId = paymentIdParts[0];
    paypalOrderId = paymentIdParts[1];
    paypalInvoiceNumber = paymentIdParts[2];
    if (paypalPaymentId && paypalOrderId) {
      // Must read payment before execute to get installments info
      let initialPaypalPayment: Record<string, any> | undefined;
      const mergePaypalPayment: Record<string, any> = {};
      try {
        initialPaypalPayment = await readPaypalPayment(paypalPaymentId);
        if (initialPaypalPayment) {
          ['credit_financing_offered'].forEach((paymentProp) => {
            mergePaypalPayment[paymentProp] = initialPaypalPayment![paymentProp];
          });
        }
      } catch (_err) {
        logger.warn(_err);
      }

      // https://developer.paypal.com
      // /docs/integration/paypal-plus/mexico-brazil/test-your-integration-and-execute-the-payment/
      const round = (n?: number) => (n ? Math.round(n * 100) / 100 : 0);
      const total = round(params.amount.total);
      let subtotal = 0;
      let isPaymentUptodate = false;
      try {
        const { amount } = initialPaypalPayment!.transactions[0];
        subtotal = round(Number(amount.details.subtotal));
        if (amount.total) {
          const amountDiff = total - round(Number(amount.total));
          if (!amountDiff || round(Math.abs(amountDiff)) <= 0.02) {
            // Ignore round diff
            isPaymentUptodate = true;
          } else {
            // Try to update payment amount before execute
            const createPaymentBody = parseToPaypalPayment(params);
            const paypalPaymentEdit = [{
              op: 'replace',
              path: '/transactions/0/amount',
              value: createPaymentBody.transactions[0].amount,
            }, {
              op: 'replace',
              path: '/transactions/0/item_list/items',
              value: createPaymentBody.transactions[0].item_list.items,
            }];
            await editPaypalPayment(
              paypalPaymentId,
              paypalPaymentEdit,
            );
            isPaymentUptodate = true;
          }
        }
      } catch {
        subtotal = round(params.amount.subtotal);
      }

      const tryExecute = async () => {
        const paypalPaymentExecute: Record<string, any> & { payer_id: string } = {
          payer_id: paypalPayerId!,
        };
        if (!isPaymentUptodate) {
          // Must specify execution amount
          const freight = round(params.amount.freight);
          const fixedSubtotal = subtotal + freight <= total ? subtotal : total - freight;
          paypalPaymentExecute.transactions = [{
            amount: {
              total: total.toFixed(2),
              currency: params.currency_id || 'BRL',
              details: {
                subtotal: fixedSubtotal.toFixed(2),
                shipping: freight.toFixed(2),
                tax: (total - fixedSubtotal - freight).toFixed(2),
              },
            },
          }];
        }
        logger.info(`Executing ${paypalPaymentId} for ${orderId}`);
        let executedPaypalPayment: Record<string, any> | undefined;
        try {
          executedPaypalPayment = await executePaypalPayment(
            paypalPaymentId!,
            paypalPaymentExecute,
          );
        } catch (_err) {
          const err = _err as AxiosError;
          logger.warn(`Failed executing payment ${paypalPaymentId} for ${orderId}`, {
            request: err.config?.data,
            status: err.response?.status,
            response: err.response?.data,
          });
          let shouldRetry = false;
          if ((err.response?.data as any)?.name === 'INVALID_PAYER_ID') {
            // Check payer ID from original payment
            const paypalPayer = initialPaypalPayment?.payer || mergePaypalPayment.payer;
            const initialPayerId = paypalPayer?.payer_info?.payer_id;
            if (initialPayerId && initialPayerId !== paypalPayerId) {
              paypalPaymentExecute.payer_id = initialPayerId;
              shouldRetry = true;
            }
          } else if (paypalPaymentExecute.transactions?.[0]?.amount?.details) {
            // Retry without transaction amount details (optional)
            delete paypalPaymentExecute.transactions[0].amount.details;
            shouldRetry = true;
          }
          if (shouldRetry) {
            executedPaypalPayment = await new Promise((resolve, reject) => {
              setTimeout(() => {
                executePaypalPayment(paypalPaymentId!, paypalPaymentExecute)
                  .then(resolve).catch(reject);
              }, 300);
            });
          } else {
            throw err;
          }
        }
        paypalPayment = {
          ...executedPaypalPayment,
          ...mergePaypalPayment,
        };
      };

      await tryExecute().catch((_err) => {
        const err = _err as AxiosError;
        const paypalError = (err.response?.data as any)?.name;
        if (paypalError === 'INSTRUMENT_DECLINED') {
          logger.warn(`INSTRUMENT_DECLINED ${paypalPaymentId} for ${orderId}`);
        } else {
          const error: any = new Error('PayPal execute with error');
          error.request = err.config?.data;
          error.response = err.response?.data;
          error.status = err.response?.status;
          error.initialPaypalPayment = initialPaypalPayment;
          error.isPaymentUptodate = isPaymentUptodate;
          error.amount = params.amount;
          error.subtotal = subtotal;
          logger.error(error);
        }
        return {
          status: 400,
          error: `PAYPAL_${paypalError}`,
          message: err.message,
        };
      });
    } else {
      return {
        status: 400,
        error: 'PAYPAL_PAYMENT_UNKNOWN',
        message: 'Unknown PayPal Payment/Order IDs',
      };
    }
  } else {
    paypalOrderId = params.open_payment_id;
  }

  logger.info(`New PayPal order ${paypalOrderId} for ${orderId}`);
  if (paypalPayment) {
    let amount: number | undefined;
    let transactionCode: string | undefined;
    let paymentLink: string | undefined;
    let paymentReference: string | undefined;
    let saleStatus = 'under_analysis' as 'paid' | 'under_analysis';
    if (Array.isArray(paypalPayment.transactions)) {
      const paypalTransaction = paypalPayment.transactions[0];
      if (paypalTransaction) {
        // PayPal Plus executed payment
        const paypalSale = Array.isArray(paypalTransaction.related_resources)
          && paypalTransaction.related_resources[0]
          && paypalTransaction.related_resources[0].sale;
        saleStatus = paypalSale && (paypalSale.state === 'completed')
          ? 'paid'
          : 'under_analysis';
        paymentReference = paypalOrderId;
        transactionCode = paypalSale ? paypalSale.id : paymentReference;
        amount = paypalTransaction.amount && parseFloat(paypalTransaction.amount.total);
      }
    }

    if (amount && amount >= params.amount.total * 0.975) {
      const transaction: CreateTransactionResponse['transaction'] = {
        amount,
        intermediator: {
          transaction_id: paypalPayment.id,
          transaction_code: transactionCode,
        },
        status: {
          current: saleStatus,
        },
      };
      if (paymentLink) {
        transaction.payment_link = paymentLink;
      }
      const transactionReference = paypalInvoiceNumber || paymentReference;
      if (transactionReference) {
        transaction.intermediator!.transaction_reference = transactionReference;
      }
      const creditFinancing = paypalPayment.credit_financing_offered;
      if (creditFinancing && creditFinancing.term) {
        transaction.installments = {
          number: creditFinancing.term,
          tax: false,
        };
        ['monthly_payment', 'total_cost'].forEach((creditFinancingProp) => {
          if (creditFinancing[creditFinancingProp]) {
            const value = parseFloat(creditFinancing[creditFinancingProp].value);
            if (value) {
              const installmentsProp = creditFinancingProp === 'total_cost'
                ? 'total' : 'value';
              transaction.installments![installmentsProp] = value;
            }
          }
        });
      }

      if (params.amount.total && params.amount.total !== amount) {
        // Save received amount on custom fields just for debug
        transaction.custom_fields = transaction.custom_fields || [];
        Object.keys(params.amount).forEach((amountField) => {
          if (typeof params.amount[amountField] === 'number') {
            if (transaction.custom_fields!.length >= 10) {
              return;
            }
            transaction.custom_fields!.push({
              field: `pr_amount_${amountField}`,
              value: params.amount[amountField].toString(),
            });
          }
        });
      }
      return { transaction };
    }
    return {
      error: 'PAYPAL_TRANSACTION_INVALID',
      message: 'PayPal order ID not valid for this create transaction request',
    };
  }

  return {
    error: 'PAYPAL_TRANSACTION_NOOP',
    message: `No valid PayPal response for #${orderId}`,
  };
};
