import type {
  AppModuleBody,
  CreateTransactionParams,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import type { PagHiperApp } from '../types/config-app';
import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import axios from './functions-lib/create-axios';

type ItemsPagHiper = {
  description: string,
  item_id: string,
  quantity: number,
  price_cents: number,
}

const responseError = (status: number | null, error: string, message: string) => {
  return {
    status: status || 409,
    error,
    message,
  };
};

const createTransactionPagHiper = async (
  body: { [x: string]: any },
  isPix?: boolean,
): Promise<any> => {
  // create new transaction to PagHiper API
  // https://dev.paghiper.com/reference#gerar-boleto
  if (!isPix && process.env.PAGHIPER_PARTNER_ID) {
    body.partners_id = process.env.PAGHIPER_PARTNER_ID;
  } else if (isPix && process.env.PAGHIPER_PIX_PARTNER_ID) {
    body.partners_id = process.env.PAGHIPER_PIX_PARTNER_ID;
  }

  // returns request promise
  const endpoint = `/${(isPix ? 'invoice' : 'transaction')}/create/`;
  return new Promise((resolve, reject) => {
    axios(isPix).post(endpoint, body)
      .then(({ data }) => {
        // save transaction ID on database first
        let createRequest: any;
        if (isPix) {
          createRequest = data.pix_create_request;
        }
        if (!createRequest) {
          createRequest = data.create_request;
        }

        resolve(createRequest);
      })
      .catch(reject);
  });
};

export default async (appData: AppModuleBody) => {
  const locationId = config.get().httpsFunctionOptions.region;
  const baseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;

  const webhookUrl = `${baseUri}/paghiper-webhook`;

  // treat module request body
  const { application } = appData;
  const params = appData.params as CreateTransactionParams;

  // app configured options
  const configApp = {
    ...application.data,
    ...application.hidden_data,
  } as PagHiperApp;

  const orderId = params.order_id;
  const orderNumber = params.order_number;
  const {
    amount,
    items,
    buyer,
    to,
  } = params;

  const billingAddress = params.billing_address;

  logger.log(`> (App PagHiper): Create transaction for #${orderId}`);
  let transaction: CreateTransactionResponse['transaction'] = {
    amount: amount.total,
  };

  // params object follows create transaction request schema:
  // https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
  //   const orderId = params.order_id;
  //   logger.log(`> Create transaction for #${storeId} ${orderId}`);
  // setup transaction body to PagHiper reference

  // https://dev.paghiper.com/reference#gerar-boleto
  const address = billingAddress || to;

  const paghiperTransaction: { [x: string]: any } = {
    order_id: orderId || orderNumber || new Date().getTime().toString(),
    payer_email: buyer.email,
    payer_name: buyer.fullname,
    payer_cpf_cnpj: buyer.doc_number,
    payer_phone: buyer.phone.number,
    payer_street: address?.street || '',
    payer_number: address?.number || '',
    payer_complement: address?.complement || '',
    payer_district: address?.borough || '',
    payer_city: address?.city || '',
    payer_state: address?.province_code || '',
    payer_zip_code: address?.zip ? address.zip.replace(/\D/g, '') : '',
    notification_url: webhookUrl,
    discount_cents: amount.discount ? Math.round(amount.discount * 100) : '',
    shipping_price_cents: amount.freight ? Math.round(amount.freight * 100) : '',
    fixed_description: true,
    type_bank_slip: 'boletoA4',
    days_due_date: 5,
    per_day_interest: true,
    items: [] as ItemsPagHiper[],
  };

  // parse transaction items list
  items.forEach((item) => {
    paghiperTransaction.items.push({
      description: item.name || item.product_id,
      item_id: item.sku || item.product_id,
      quantity: item.quantity,
      price_cents: Math.round((item.final_price || item.price) * 100),
    });
  });

  const isPix = params.payment_method.code === 'account_deposit';
  if (isPix) {
    paghiperTransaction.notification_url += '/pix';
  }

  // use configured PagHiper API key
  paghiperTransaction.apiKey = configApp.paghiper_api_key;
  // merge configured banking billet options
  const options = configApp.banking_billet_options;
  if (typeof options === 'object' && options !== null) {
    // options must have only valid properties for PagHiper transaction object
    Object.keys(options).forEach((prop) => {
      if (options[prop]) {
        paghiperTransaction[prop] = options[prop];
      }
    });
  }

  try {
    // send request to PagHiper API
    const createRequest = await createTransactionPagHiper(paghiperTransaction, isPix);

    // transaction created successfully
    // https://dev.paghiper.com/reference#exemplos
    // mount response body
    // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
    transaction = {
      intermediator: {
        transaction_id: createRequest.transaction_id,
        transaction_code: createRequest.transaction_id,
        transaction_reference: createRequest.order_id,
      },
      amount: createRequest.value_cents
        ? parseInt(createRequest.value_cents, 10) / 100
        // use amount from create transaction request body
        : params.amount.total,
    };

    if (isPix) {
      // https://dev.paghiper.com/reference#exemplos-pix
      const pixCode = createRequest.pix_code;
      if (transaction.intermediator) {
        transaction.intermediator.transaction_code = pixCode.emv;
      }
      const pixCodeUrls = ['pix_url', 'qrcode_image_url', 'bacen_url'];
      for (let i = 0; i < pixCodeUrls.length; i++) {
        const pixUrl = pixCode[pixCodeUrls[i]];
        if (pixUrl && pixUrl.startsWith('http')) {
          transaction.payment_link = pixUrl;
          break;
        }
      }
      transaction.notes = `<img src="${pixCode.qrcode_image_url}" `
        + 'style="display:block;max-width:100%;margin:0 auto" />';
    } else {
      const bankSlip = createRequest.bank_slip;
      transaction.payment_link = bankSlip.url_slip;
      transaction.banking_billet = {
        code: bankSlip.digitable_line,
        link: bankSlip.url_slip_pdf,
      };
      if (createRequest.due_date) {
        transaction.banking_billet.valid_thru = new Date(createRequest.due_date).toISOString();
      }
    }

    return {
      redirect_to_payment: false,
      transaction,
    };
  } catch (err: any) {
    let { message } = err;
    let statusCode: number | null;
    if (!err.request) {
      // not Axios error ?
      logger.error('> (App PagHiper) =>', err);
      statusCode = 500;
    } else {
      let debugMsg = 'Can\'t create transaction: ';
      if (err.config) {
        debugMsg += `${err.config.url} `;
      }
      if (err.response) {
        debugMsg += err.response.status;

        // https://dev.paghiper.com/reference#mensagens-de-retorno-2
        if (err.response.status === 200) {
          const { data } = err.response;
          if (data) {
            debugMsg += ` ${typeof data === 'object' ? JSON.stringify(data) : data}`;
            debugMsg += ` ${JSON.stringify(paghiperTransaction)}`;
            if (data.create_request && data.create_request.response_message) {
              message = data.create_request.response_message;
            }
          }
        }
      } else {
        debugMsg += message;
      }
      logger.error('> (App PagHiper) =>', debugMsg);
      statusCode = 409;
    }

    // return error status code
    return responseError(
      statusCode,
      'CREATE_TRANSACTION_ERR',
      message,
    );
  }
};
