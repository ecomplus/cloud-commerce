import type { AppModuleBody } from '@cloudcommerce/types';
import type { CreateTransactionParams } from '@cloudcommerce/types/modules/create_transaction:params';
import type { CreateTransactionResponse } from '@cloudcommerce/types/modules/create_transaction:response';
import type { Firestore } from 'firebase-admin/firestore';
import config from '@cloudcommerce/firebase/lib/config';
import logger from 'firebase-functions/logger';
import IPAxios from './functions-lib/ip-auth/create-access';
import addInstallments from './functions-lib/add-installments';
import { responseError, isSandbox } from './functions-lib/utils';

type Items = {
  id: string;
  description: string | undefined;
  amount: number;
  quantity: number;
}[]

type ParseHash = {
  amount?: number;
  capture_method?: string;
  metadata: {
    origin?: string;
    payment_method?: string;
    risk?: {
      payer_ip?: string;
    };
    orderId?: string | undefined;
    orderNumber?: number;
    callback_url?: string;
    callback?: {
      validate: string;
      confirm: string;
      secret: string;
    };
    transactionReference?: number;
  };
  customer?: {
    document_number: any;
    email: any; first_name: any;
    last_name: any;
    phone_number: any;
    address?: string | undefined;
    complement?: string | undefined;
    city?: string | undefined;
    state?: string | undefined;
    country?: string;
    zip?: string | undefined;
  };
  payment?: {
    amount: number;
    installments: number | undefined;
    payment_method: string;
    capture_method: string;
  };
  order?: {
    delivery_details: any;
    id?: string | undefined;
    amount?: number;
    items?: Items;
  };
  billing_details?: any;
};

const handleError = (
  error: any,
  transaction: CreateTransactionResponse['transaction'],
  params: CreateTransactionParams,
  orderId?: string,
) => {
  let { message } = error;
  // Handle request timeout
  // https://github.com/axios/axios/blob/d59c70fdfd35106130e9f783d0dbdcddd145b58f/lib/adapters/http.js#L213-L218
  if (error.code && error.code === 'ECONNABORTED' && message.includes('timeout')) {
    transaction.intermediator = {
      payment_method: params.payment_method,
    };
    transaction.status = {
      current: 'under_analysis',
      updated_at: new Date().toISOString(),
    };
    return {
      redirect_to_payment: false,
      transaction,
    };
  }

  logger.log('> (App: InfinitePay) Error=> ', JSON.stringify(error));

  // try to debug request error
  let errCode = 'INFINITEPAY_TRANSACTION_ERR_';
  const err = {
    message: `PAGARME_TRANSACTION_ERR Order: #${orderId} => ${message}`,
    payment: '',
    status: 0,
    response: '',
  };

  if (error.response) {
    const { status, data } = error.response;
    if (status !== 401 && status !== 403) {
      err.payment = JSON.stringify(transaction);
      errCode += status;
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

  // logger.error(err);
  return responseError(404, errCode, message);
};

export default async (appData: AppModuleBody, firestore: Firestore) => {
  const locationId = config.get().httpsFunctionOptions.region;
  const baseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;
  // body was already pre-validated on @/bin/web.js
  // treat module request body
  const { application, storeId } = appData;
  const params = appData.params as CreateTransactionParams;
  // app configured options
  const configApp = { ...application.data, ...application.hidden_data };
  const callbackUrl = `${baseUri}/infinitepay-webhook`;

  const ipAxios = new IPAxios({
    clientId: configApp.client_id,
    clientSecret: configApp.client_secret,
    typeScope: 'transactions',
    isSandbox,
  });

  const orderId = params.order_id;
  const orderNumber = params.order_number;
  const {
    amount,
    items,
    buyer,
    to,
  } = params;

  logger.log('>(App:InfinitePay) Transaction #order:', orderId, ` ${isSandbox ? ' Sandbox' : ''} <`);

  const transaction: CreateTransactionResponse['transaction'] = {
    amount: amount.total,
  };

  let finalAmount = Math.floor(amount.total * 100) / 100;
  const paymentMethod = params.payment_method.code;
  const isCreditCard = paymentMethod === 'credit_card';
  const methodConfig = configApp[paymentMethod] || {};

  let { label } = methodConfig;
  if (!label) {
    label = isCreditCard ? 'Cartão de crédito' : 'Pix';
  }

  try {
    await ipAxios.preparing;
  } catch (err: any) {
    logger.error('>(App: InfinitePay) Error =>', err);
    return responseError(409, 'NO_INFINITE_AUTH', 'Error getting authentication');
  }

  let dataHash: ParseHash;

  if (isCreditCard) {
    const buyerNames = buyer.fullname.split(' ');
    const IPCustumer = {
      document_number: buyer.doc_number,
      first_name: buyerNames[0],
      last_name: buyerNames[buyerNames.length - 1],
      email: buyer.email,
      phone_number: buyer.phone.number,
      address: to?.street,
      complement: to?.complement || undefined,
      city: to?.city,
      state: to?.province || to?.province_code,
      country: to?.country_code || 'BR',
      zip: to?.zip,
    };

    let installmentsNumber = params.installments_number;
    if (installmentsNumber && installmentsNumber > 1) {
      if (configApp.installments) {
        // list all installment options
        const { gateway } = addInstallments(
          amount.total,
          configApp.installments,
          {
            label,
            payment_method: params.payment_method,
          },
        );
        const installmentOption = gateway.installment_options
          && gateway.installment_options.find(({ number }) => number === installmentsNumber);
        if (installmentOption) {
          transaction.installments = installmentOption;
          finalAmount = Math.round(installmentOption.number * installmentOption.value * 100) / 100;
          transaction.installments.total = finalAmount;
        } else {
          installmentsNumber = 1;
        }
      }
    }

    const payerIp = params.browser_ip;
    const hash = Buffer.from(params?.credit_card?.hash || '', 'base64').toString();
    dataHash = JSON.parse(hash);

    if (dataHash.metadata) {
      dataHash.metadata.orderId = orderId;
      dataHash.metadata.orderNumber = orderNumber;
      dataHash.metadata.callback_url = callbackUrl;
      if (dataHash.metadata.risk) {
        dataHash.metadata.risk.payer_ip = payerIp;
      } else {
        dataHash.metadata.risk = {
          payer_ip: payerIp,
        };
      }
    }

    dataHash.customer = IPCustumer;
    dataHash.payment = {
      amount: Math.floor(finalAmount * 100),
      installments: installmentsNumber,
      payment_method: 'credit',
      capture_method: 'ecommerce',
    };

    const ipItems: Items = [];

    items.forEach((item) => {
      ipItems.push({
        id: item.sku || item.variation_id || item.product_id,
        description: item.name || item.sku,
        amount: Math.floor((item.final_price || item.price) * 100),
        quantity: item.quantity,
      });
    });

    dataHash.order = {
      id: orderId,
      amount: Math.floor(finalAmount * 100),
      items: ipItems,
      delivery_details: {
        document_number: (dataHash.customer && dataHash.customer.document_number)
          || buyer.doc_number,
        email: dataHash.customer.email,
        name: `${dataHash.customer.first_name} ${dataHash.customer.last_name}`,
        phone_number: `${dataHash.customer.phone_number}`,
        line1: `${to?.street}, ${String(to?.number)}` || 's/n',
        line2: to?.complement || '',
        city: to?.city,
        state: to?.province || to?.province_code,
        zip: to?.zip,
        country: to?.country_code || 'BR',
      },
    };

    dataHash.billing_details = dataHash.order.delivery_details;
    if (ipAxios.axios) {
      //
      // console.log('>> SendTransaction Infinite: ', dataHash, ' <<');
      // url: 'https://cloudwalk.github.io/infinitepay-docs/#autorizando-um-pagamento',
      const headers = {
        Accept: 'application/json',
      };

      if (isSandbox) {
        Object.assign(headers, { Env: 'mock' });
      }

      try {
        const timeout = 40000;
        const { data } = (await ipAxios.axios.post(
          '/v2/transactions',
          dataHash,
          { headers, timeout },
        )).data;

        const { attributes } = data;
        logger.log('>>(App:Infinite) Attributes: ', attributes, ' <<<');

        const intermediator = {
          transaction_id: attributes.nsu,
          payment_method: params.payment_method,
          transaction_code: '',
        };
        if (attributes.authorization_id) {
          logger.log('>>(App:Infinite) Authorized transaction in InfinitePay Order: #', orderId);
          intermediator.transaction_code = attributes.authorization_id;

          transaction.status = {
            current: 'paid',
            updated_at: attributes.created_at || new Date().toISOString(),
          };
        } else {
          logger.log('>>(App:Infinite) Unauthorized transaction in InfinitePay Order: #', orderId);
          transaction.status = {
            current: 'unauthorized',
            updated_at: attributes.created_at || new Date().toISOString(),
          };
        }
        transaction.intermediator = intermediator;

        return {
          redirect_to_payment: false,
          transaction,
        };
      } catch (err) {
        return handleError(
          err,
          transaction,
          params,
          orderId,
        );
      }
    }
    return responseError(409, 'INFINITE_REQUEST_ERR_', 'Unexpected error creating charge');
  }
  // if (paymentMethod === 'account_deposit')
  const firestoreColl = 'infinitepayTransactionsPix';

  const transactionReference = new Date().getTime();
  const secret = Buffer.from(`${storeId}-${orderId}-${transactionReference}`).toString('base64');
  logger.log('>>(App: Infinite) secret: ', (isSandbox ? secret : ''));

  dataHash = {
    amount: Math.floor(finalAmount * 100),
    capture_method: 'pix',
    metadata: {
      origin: 'ecomplus',
      payment_method: 'pix',
      callback: {
        validate: `${callbackUrl}?pix=denied`,
        confirm: `${callbackUrl}?pix=confirm`,
        secret,
      },
      orderId,
      transactionReference,
    },
  };
  if (ipAxios.axios) {
    try {
      logger.log('>>(App: Infinite) Send PIX : ', JSON.stringify(dataHash), ' <<');
      // url: 'https://cloudwalk.github.io/infinitepay-docs/#autorizando-um-pagamento',
      const headers = {
        Accept: 'application/json',
      };
      const { data } = (await ipAxios.axios.post(
        '/v2/transactions',
        dataHash,
        { headers },
      )).data;

      const { attributes } = data;

      logger.log('>>(App:Infinite) Attributes: ', attributes, ' <<<');
      const intermediator = {
        transaction_code: attributes.nsu,
        payment_method: params.payment_method,
      };
      const brCode = attributes.br_code;
      const transactionId = attributes.nsu_host;
      if (brCode && transactionId) {
        const qrCodeSrc = `https://gerarqrcodepix.com.br/api/v1?brcode=${brCode}&tamanho=256`;
        transaction.notes = '<div style="display:block;margin:0 auto"> '
          + `<img src="${qrCodeSrc}" style="display:block;margin:0 auto"> `
          + `<input readonly type="text" id="pix-copy" value="${brCode}" />`
          + `<button type="button" class="btn btn-sm btn-light"
          onclick="let codePix = document.getElementById('pix-copy') codePix.select()
          document.execCommand('copy')">Copiar Pix</button></div>`;

        logger.log('>>(App:Infinite) Authorized transaction PIX Order: #', orderId);
        Object.assign(intermediator, {
          transaction_id: transactionId,
          transaction_reference: `${transactionReference}`,
        });
        transaction.status = {
          current: 'pending',
          updated_at: attributes.created_at || new Date().toISOString(),
        };
        const updatedAt = new Date().toISOString();
        const documentRef = firestore.doc(`${firestoreColl}/${transactionId}`);
        if (documentRef) {
          documentRef.set({
            isSandbox,
            orderId,
            orderNumber,
            secret,
            transactionReference,
            status: 'pending',
            updatedAt,
          }).catch(logger.error);
        }
      } else {
        logger.log('>>(App:Infinite) Unauthorized transaction PIX Order: #', orderId);
        transaction.status = {
          current: 'unauthorized',
          updated_at: attributes.created_at || new Date().toISOString(),
        };
      }
      transaction.intermediator = intermediator;
      return {
        redirect_to_payment: false,
        transaction,
      };
    } catch (err) {
      return handleError(err, transaction, params, orderId);
    }
  }
  return responseError(409, 'INFINITE_REQUEST_ERR_', 'Unexpected error creating charge');
};
