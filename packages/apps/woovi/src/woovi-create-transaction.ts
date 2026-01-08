import type {
  AppModuleBody,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import type { AxiosError } from 'axios';
import { randomUUID } from 'node:crypto';
import { logger } from '@cloudcommerce/firebase/lib/config';
import {
  fullName as getFullname,
  phone as getPhone,
} from '@ecomplus/utils';
import { getWooviAxios } from './util/woovi-api';

export default async (modBody: AppModuleBody<'create_transaction'>) => {
  const {
    application,
    params,
  } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.woovi_app_id) {
    process.env.WOOVI_APP_ID = appData.woovi_app_id;
  }
  const { WOOVI_APP_ID } = process.env;
  if (!WOOVI_APP_ID) {
    logger.warn('Checkout missing Woovi AppID');
    return {
      error: 'NO_WOOVI_APP_ID',
      message: 'AppID não configurado (lojista deve configurar o aplicativo)',
    };
  }

  const {
    order_id: orderId,
    order_number: orderNumber,
    payment_method: paymentMethod,
    amount,
    buyer,
  } = params;
  const wooviAxios = await getWooviAxios();
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
    const correlationID = randomUUID();
    const valueInCents = Math.round(amount.total * 100);
    const phone = getPhone(buyer);
    const phoneNumber = phone
      ? phone.replace(/\D/g, '')
      : undefined;

    const wooviCharge: Record<string, any> = {
      correlationID,
      value: valueInCents,
      comment: `Pedido ${orderNumber}`,
    };

    const customerName = buyer.fullname || getFullname(buyer);
    if (customerName) {
      wooviCharge.customer = {
        name: customerName,
        email: buyer.email,
        phone: phoneNumber,
        taxID: buyer.doc_number,
      };
    }

    if (appData.expires_in) {
      wooviCharge.expiresIn = Math.max(appData.expires_in, 60 * 5);
    }

    const { data: wooviResponse } = await wooviAxios.post('/charge', wooviCharge);

    if (!wooviResponse.charge) {
      throw new Error(wooviResponse.error || 'Erro ao criar cobrança Pix');
    }

    const { charge } = wooviResponse;
    transaction.intermediator = {
      transaction_id: charge.correlationID,
      transaction_reference: charge.paymentLinkID,
      transaction_code: charge.brCode,
      payment_method: {
        code: 'account_deposit',
        name: 'Pix - Woovi',
      },
    };

    if (charge.paymentLinkUrl) {
      transaction.payment_link = charge.paymentLinkUrl;
    }

    if (charge.qrCodeImage) {
      transaction.notes = `<img src="${charge.qrCodeImage}" style="display:block;margin:0 auto">`;
    }

    if (charge.expiresDate) {
      transaction.account_deposit = {
        valid_thru: new Date(charge.expiresDate).toISOString(),
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
      error: 'WOOVI_TRANSACTION_ERROR',
      message: err.message,
    };
  }
};
