import type {
  AppModuleBody,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import type { AxiosError } from 'axios';
import config, { logger } from '@cloudcommerce/firebase/lib/config';
import {
  fullName as getFullname,
  phone as getPhone,
  price as getPrice,
} from '@ecomplus/utils';
import { getYapayAxios } from './util/yapay-api';

export default async (modBody: AppModuleBody<'create_transaction'>) => {
  const {
    application,
    params,
  } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.yapay_api_token) {
    process.env.YAPAY_API_TOKEN = appData.yapay_api_token;
  }
  const { YAPAY_API_TOKEN } = process.env;
  if (!YAPAY_API_TOKEN) {
    logger.warn('Checkout missing Yapay API Token');
    return {
      error: 'NO_YAPAY_TOKEN',
      message: 'Token da conta não configurado (lojista deve configurar o aplicativo)',
    };
  }

  const locationId = config.get().httpsFunctionOptions.region;
  const webhookUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`
    + '/yapay-webhook';

  const {
    order_id: orderId,
    order_number: orderNumber,
    payment_method: paymentMethod,
    amount,
    buyer,
    items,
    billing_address: billingAddr,
    to: shippingAddr,
  } = params;
  const customerAddr = billingAddr || shippingAddr;
  const yapayAxios = await getYapayAxios();
  const transaction: CreateTransactionResponse['transaction'] = {
    amount: amount.total,
    status: {
      current: 'pending',
    },
  };

  if (paymentMethod.code !== 'account_deposit') {
    return {
      error: 'PAYMENT_METHOD_NOT_SUPPORTED',
      message: 'Apenas Pix é suportado no momento',
    };
  }

  try {
    const phone = getPhone(buyer.phone);
    const phoneContacts: Array<Record<string, any>> = [];
    if (phone) {
      const phoneNumber = phone.replace('+55', '').replace(/\D/g, '');
      if (phoneNumber.length === 11) {
        phoneContacts.push({
          type_contact: 'M',
          number_contact: phoneNumber,
        });
      } else if (phoneNumber.length === 10) {
        phoneContacts.push({
          type_contact: 'H',
          number_contact: phoneNumber,
        });
      }
    }

    const yapayTransaction = {
      customer: {
        contacts: phoneContacts.length > 0 ? phoneContacts : undefined,
        addresses: customerAddr ? [{
          type_address: 'B',
          postal_code: customerAddr.zip,
          street: customerAddr.street,
          number: customerAddr.number?.toString() || 'S/N',
          completion: customerAddr.complement,
          neighborhood: customerAddr.borough,
          city: customerAddr.city,
          state: customerAddr.province_code,
        }] : undefined,
        name: buyer.fullname || getFullname(buyer) || buyer.email,
        birth_date: buyer.birth_date?.day && buyer.birth_date?.month && buyer.birth_date?.year
          ? `${buyer.birth_date.day.toString().padStart(2, '0')}/`
            + `${buyer.birth_date.month.toString().padStart(2, '0')}/`
            + `${buyer.birth_date.year}`
          : undefined,
        [buyer.registry_type === 'p' ? 'cpf' : 'cnpj']: buyer.doc_number,
        email: buyer.email,
      },
      transaction_product: items.map((item, index) => ({
        description: item.name || item.product_id,
        quantity: item.quantity.toString(),
        price_unit: getPrice(item)?.toFixed(2) || '0.00',
        code: (index + 1).toString(),
        sku_code: item.sku || item.product_id,
        extra: item.variation_id ? `Variação: ${item.variation_id}` : undefined,
      })),
      transaction: {
        available_payment_methods: '27',
        customer_ip: params.client_ip,
        shipping_type: 'Outro',
        shipping_price: amount.freight?.toFixed(2) || '0',
        price_discount: amount.discount?.toFixed(2) || '',
        url_notification: webhookUri,
        free: `Pedido ${orderNumber}`,
      },
      payment: {
        payment_method_id: '27',
      },
    };

    const { data: yapayResponse } = await yapayAxios.post(
      '/transactions/payment',
      yapayTransaction,
    );
    if (yapayResponse.message_response?.message !== 'success') {
      throw new Error(
        yapayResponse.error_response?.message
        || yapayResponse.message_response?.message
        || 'Erro ao criar transação',
      );
    }
    const yapayData = yapayResponse.data_response.transaction;
    transaction.intermediator = {
      transaction_id: yapayData.transaction_id?.toString(),
      transaction_reference: yapayData.order_number?.toString(),
      transaction_code: yapayData.payment?.qrcode_original_path?.toString(),
      payment_method: {
        code: 'account_deposit',
        name: yapayData.payment?.payment_method_name,
      },
    };
    /*
    if (yapayData.payment.url_payment) {
      transaction.payment_link = yapayData.payment.url_payment;
    }
    */
    if (yapayData.payment.qrcode_path) {
      transaction.notes = `<img src="${yapayData.payment.qrcode_path}" style="display:block;margin:0 auto">`;
    }
    if (yapayData.max_days_to_keep_waiting_payment) {
      transaction.account_deposit = {
        valid_thru: new Date(yapayData.max_days_to_keep_waiting_payment).toISOString(),
      };
    }

    return { transaction };
  } catch (_err) {
    const err = _err as AxiosError;
    logger.warn(`Failed payment for ${orderId}`, {
      orderNumber,
      url: err.config?.url,
      request: err.config?.data,
      response: err.response?.data,
      status: err.response?.status,
    });
    logger.error(err);
    return {
      error: 'YAPAY_TRANSACTION_ERROR',
      message: err.message,
    };
  }
};
