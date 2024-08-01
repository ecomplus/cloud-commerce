import type {
  AppModuleBody,
  CreateTransactionParams,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import type { GalaxpayApp, GalaxPaySubscriptions } from '../types/config-app';
import { logger } from '@cloudcommerce/firebase/lib/config';
import { getFirestore } from 'firebase-admin/firestore';
import Galaxpay from './functions-lib/galaxpay/auth/create-access';
import { responseError } from './functions-lib/utils';
import { findPlanToCreateTransction } from './functions-lib/galaxpay/handle-plans';
import { parseStatus, parsePeriodicityToGalaxPay } from './functions-lib/all-parses';

type To = Exclude<CreateTransactionParams['to'], undefined>

const firestoreColl = 'galaxpaySubscriptions';

const parseAddress = (to: To) => ({
  zipCode: to.zip,
  street: to.street,
  number: String(to.number) || 's/n',
  complementary: to.complement || undefined,
  neighborhood: to.borough,
  city: to.city,
  state: to.province || to.province_code,
});

export default async (appData: AppModuleBody) => {
  // treat module request body
  const { application } = appData;
  const params = appData.params as CreateTransactionParams;
  // app configured options
  const configApp = {
    ...application.data,
    ...application.hidden_data,
  } as GalaxpayApp;

  const orderId = params.order_id;
  const orderNumber = params.order_number;
  const {
    amount,
    // items,
    buyer,
    to,
    type,
  } = params;

  logger.info('>(App:GalaxPay) Transaction #order:', { orderId });

  const transaction: CreateTransactionResponse['transaction'] = {
    //   type,
    amount: amount.total,
  };

  if (!process.env.GALAXPAY_ID) {
    const galaxpayId = configApp.galaxpay_id;
    if (typeof galaxpayId === 'string' && galaxpayId) {
      process.env.GALAXPAY_ID = galaxpayId;
    } else {
      logger.warn('Missing GalaxPay ID');
    }
  }

  if (!process.env.GALAXPAY_HASH) {
    const galaxpayHash = configApp.galaxpay_hash;
    if (typeof galaxpayHash === 'string' && galaxpayHash) {
      process.env.GALAXPAY_HASH = galaxpayHash;
    } else {
      logger.warn('Missing GalaxPay Hash');
    }
  }
  // setup required `transaction` response object
  const galaxpayAxios = new Galaxpay({
    galaxpayId: process.env.GALAXPAY_ID,
    galaxpayHash: process.env.GALAXPAY_HASH,
  });

  // indicates whether the buyer should be redirected to payment link right after checkout
  let redirectToPayment = false;

  switch (params.payment_method.code) {
    case 'online_debit':
      redirectToPayment = true;
      break;
    default:
      break;
  }

  // https://docs.galaxpay.com.br/subscriptions/create-without-plan

  const extraFields = [
    {
      tagName: 'order_number',
      tagValue: `${orderNumber}`,
    }];

  const galaxpayCustomer = {
    myId: buyer.customer_id,
    name: buyer.fullname,
    document: buyer.doc_number,
    emails: [buyer.email],
    phones: [parseInt(`${buyer.phone.number}`, 10)],
  };

  let methodConfigName = params.payment_method.code === 'credit_card' ? configApp.credit_card?.label
    : 'Cartão de crédito';

  methodConfigName = (params.payment_method.code === 'account_deposit'
    ? (configApp.pix?.label || 'Pix') : (configApp.banking_billet?.label || 'Boleto bancário'));

  // handle plan label to find plan by name (label)
  let labelPaymentGateway = params.payment_method.name?.replace('- GalaxPay', '');
  labelPaymentGateway = labelPaymentGateway?.replace(methodConfigName, '');

  let plan = findPlanToCreateTransction(labelPaymentGateway, configApp);

  if (!plan && configApp.plans) {
    [plan] = configApp.plans;
  }

  const finalAmount = amount.total;
  const fristPayment = new Date();

  const quantity = plan?.quantity || 0;
  const galaxpaySubscriptions: GalaxPaySubscriptions = {
    myId: `${orderId}`, // requered
    value: Math.floor(finalAmount * 100),
    quantity, //  recorrence quantity
    periodicity: parsePeriodicityToGalaxPay(plan?.periodicity) || 'monthly',
    Customer: galaxpayCustomer,
    ExtraFields: extraFields,
    mainPaymentMethodId: 'creditcard',
    firstPayDayDate: fristPayment.toISOString().split('T')[0],
  };

  if (params.payment_method.code === 'credit_card') {
    const card = {
      hash: params.credit_card?.hash,
    };

    const PaymentMethodCreditCard = {
      Card: card,
      preAuthorize: false,
    };

    galaxpaySubscriptions.PaymentMethodCreditCard = PaymentMethodCreditCard;
  } else if (params.payment_method.code === 'banking_billet') {
    if (to) {
      Object.assign(galaxpayCustomer, { Address: parseAddress(to) });
    } else if (params.billing_address) {
      Object.assign(galaxpayCustomer, { Address: parseAddress(params.billing_address) });
    }

    fristPayment.setDate(fristPayment.getDate() + (configApp.banking_billet?.add_days || 0));

    galaxpaySubscriptions.mainPaymentMethodId = 'boleto';
    galaxpaySubscriptions.Customer = galaxpayCustomer;
    [galaxpaySubscriptions.firstPayDayDate] = fristPayment.toISOString().split('T');
  } else if (params.payment_method.code === 'account_deposit') {
    // other  is PIX
    if (to) {
      Object.assign(galaxpayCustomer, { Address: parseAddress(to) });
    } else if (params.billing_address) {
      Object.assign(galaxpayCustomer, { Address: parseAddress(params.billing_address) });
    }

    const PaymentMethodPix = {
      instructions: configApp.pix?.instructions || 'Pix',
    };

    fristPayment.setDate(fristPayment.getDate() + (configApp.pix?.add_days || 0));

    galaxpaySubscriptions.mainPaymentMethodId = 'pix';
    galaxpaySubscriptions.Customer = galaxpayCustomer;
    [galaxpaySubscriptions.firstPayDayDate] = fristPayment.toISOString().split('T');
    galaxpaySubscriptions.PaymentMethodPix = PaymentMethodPix;
  }

  logger.info('>>(App:GalaxPay): subscriptions ', galaxpaySubscriptions);

  try {
    await galaxpayAxios.preparing;
  } catch (err: any) {
    logger.error('>(App: GalaxPay) Error =>', err);
    return responseError(409, 'NO_GALAXPAY_AUTH', 'Error getting authentication');
  }

  const { axios } = galaxpayAxios;
  if (axios) {
    try {
      if (type === 'recurrence') {
        const { data: { Subscription } } = await axios.post('/subscriptions', galaxpaySubscriptions);

        logger.info('>(App: GalaxPay) New Subscription ', Subscription);
        transaction.payment_link = Subscription.paymentLink;
        const transactionGalaxPay = Subscription.Transactions[0];

        transaction.status = {
          updated_at: Subscription.datetimeLastSentToOperator || new Date().toISOString(),
          current: parseStatus(transactionGalaxPay.status),
        };

        transaction.intermediator = {
          transaction_id: transactionGalaxPay.tid,
          transaction_code: transactionGalaxPay.authorizationCode,
        };

        const documentRef = getFirestore().doc(`${firestoreColl}/${orderId}`);
        if (documentRef) {
          documentRef.set({
            subscriptionLabel: plan?.label ? plan.label : 'Plano',
            status: 'open',
            orderNumber: params.order_number,
            galaxpayFristTransactionId: transactionGalaxPay.galaxPayId,
            quantity,
            create_at: new Date().toISOString(),
            plan,
          })
            .catch(logger.error);
        }

        return {
          redirect_to_payment: redirectToPayment,
          transaction,
        };
      }
      return responseError(409, 'GALAXPAY_TYPE_ERR_', 'Invalid transaction type');
    } catch (error: any) {
      // logger.log(error.response);
      // try to debug request error
      let { message } = error;
      const err = {
        message: `GALAXPAY_TRANSACTION_ERR Order: #${orderId} => ${message}`,
        payment: '',
        status: 0,
        response: '',
      };
      if (error.response) {
        const { status, data } = error.response;
        if (status !== 401 && status !== 403) {
          err.payment = JSON.stringify(transaction);
          err.status = status;
          if (typeof data === 'object' && data) {
            err.response = JSON.stringify(data);
          } else {
            err.response = data;
          }
        } else if (data && Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) {
          message = data.errors[0].message;
        }
      }
      logger.error(err);
      return responseError(409, 'GALAXPAY_TRANSACTION_ERR', message);
    }
  }
  return responseError(409, 'GALAXPAY_REQUEST_ERR_', 'Unexpected error creating charge');
};
