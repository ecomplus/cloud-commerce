import type {
  AppModuleBody,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import { createHmac } from 'node:crypto';
import logger from 'firebase-functions/logger';
import { img as getImg } from '@ecomplus/utils';
import config from '@cloudcommerce/firebase/lib/config';
import Pagaleve from './pagaleve-constructor';

const { region } = config.get().httpsFunctionOptions;
const baseUri = `https://${region}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;

const pagaleveCreateTransaction = async (body: AppModuleBody<'create_transaction'>) => {
  const { params, application } = body;
  const appData = { ...application.data, ...application.hidden_data };
  const {
    PAGALEVE_USERNAME,
    PAGALEVE_PASSWORD,
    PAGALEVE_SANDBOX,
  } = process.env;
  if (PAGALEVE_USERNAME) appData.username = PAGALEVE_USERNAME;
  if (PAGALEVE_PASSWORD) appData.password = PAGALEVE_PASSWORD;
  const isSandbox = !!PAGALEVE_SANDBOX;
  const pagaleve = new Pagaleve(appData.username, appData.password, isSandbox);

  const orderId = params.order_id || '';
  const orderNumber = params.order_number;
  const { amount, buyer, items } = params;
  const isPix = params.payment_method.code === 'account_deposit';
  const transaction: CreateTransactionResponse['transaction'] = {
    intermediator: {
      payment_method: params.payment_method,
    },
    currency_id: params.currency_id,
    currency_symbol: params.currency_symbol,
    amount: amount.total,
    status: {
      current: 'pending',
    },
  };
  const finalAmount = Math.floor(amount.total * 100);
  const finalFreight = amount.freight ? Math.floor(amount.freight * 100) : 0;

  const parseAddress = (_to: Exclude<(typeof params)['to'], undefined>) => ({
    name: _to.name,
    city: _to.city,
    state: _to.province_code,
    street: _to.street,
    zip_code: _to.zip,
    neighborhood: _to.borough,
    number: String(_to.number) || 's/n',
    complement: _to.complement || undefined,
  });
  const shippingAddr = params.to && parseAddress(params.to);
  const billingAddr = params.billing_address
    ? parseAddress(params.billing_address)
    : shippingAddr;

  const hash = createHmac('sha256', appData.password)
    .update(orderId).digest('hex');
  const pagaleveTransaction: Record<string, any> = {
    cancel_url: `https://${params.domain}/app/#/order/${orderNumber}/${orderId}`,
    approve_url: `https://${params.domain}/app/#/order/${orderNumber}/${orderId}`,
    webhook_url: `${baseUri}/pagaleve-webhook?order_id=${orderId}&hash=${hash}`,
    is_pix_upfront: !!isPix,
    order: {
      reference: orderId,
      description: `Order from e-com.plus ${orderNumber}`,
      shipping: {
        amount: finalFreight || 0,
        address: shippingAddr,
      },
      amount: finalAmount,
      items: [],
      timestamp: new Date().toISOString(),
      type: 'ORDINARY',
    },
    shopper: {
      cpf: String(buyer.doc_number),
      first_name: buyer.fullname.replace(/\s.*/, ''),
      last_name: buyer.fullname.replace(/[^\s]+\s/, ''),
      email: buyer.email,
      phone: buyer.phone.number,
      billing_address: billingAddr,
    },
  };
  let totalQuantity = 0;
  items.forEach((item) => {
    if (item.quantity > 0) {
      totalQuantity += item.quantity;
      const objImg = getImg(item);
      pagaleveTransaction.order.items.push({
        name: item.name || item.sku,
        sku: item.sku,
        quantity: item.quantity,
        price: Math.floor((item.final_price || item.price) * 100),
        url: `https://${params.domain}`,
        reference: item.product_id,
        image: objImg && objImg.url ? objImg.url : `https://${params.domain}`,
      });
    }
  });
  const birthDate = buyer.birth_date;
  if (birthDate && birthDate.year && birthDate.month && birthDate.day) {
    pagaleveTransaction.birth_date = `${birthDate.year}-`
      + `${birthDate.month.toString().padStart(2, '0')}-`
      + birthDate.day.toString().padStart(2, '0');
  }

  if (totalQuantity > 0) {
    try {
      await pagaleve.preparing;
      const { data } = await pagaleve.axios.post('/v1/checkouts', pagaleveTransaction, {
        maxRedirects: 0,
      });
      transaction.payment_link = data.redirect_url || data.checkout_url;
      if (isPix && data.timestamp) {
        transaction.account_deposit = {
          valid_thru: data.timestamp,
        };
      }
      if (data.id) {
        transaction.intermediator = {
          transaction_id: data.id,
          transaction_code: data.id,
        };
      }
      return {
        redirect_to_payment: true,
        transaction,
      } as CreateTransactionResponse;
    } catch (error: any) {
      const errCode = 'PAGALEVE_TRANSACTION_ERR';
      let { message } = error;
      const err: any = new Error(`${errCode} #${orderId} => ${message}`);
      if (error.response) {
        const { status, data } = error.response;
        if (status !== 401 && status !== 403) {
          err.transaction = transaction;
          err.status = status;
          if (typeof data === 'object' && data) {
            err.response = JSON.stringify(data);
          } else {
            err.response = data;
          }
        } else if (Array.isArray(data?.errors) && data.errors[0]?.message) {
          message = data.errors[0].message;
        }
      }
      logger.error(err);
      return {
        status: 409,
        error: errCode,
        message,
      };
    }
  }

  return {
    status: 400,
    error: 'PAGALEVE_TRANSACTION_INVALID',
    message: 'Não há itens disponíveis no pedido',
  };
};

export default pagaleveCreateTransaction;
