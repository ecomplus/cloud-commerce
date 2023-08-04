import type {
  AppModuleBody,
  ListPaymentsParams,
  ListPaymentsResponse,
} from '@cloudcommerce/types';
import type { PagHiperApp } from '../types/config-app';
import logger from 'firebase-functions/logger';

const responseError = (status: number | null, error: string, message: string) => {
  return {
    status: status || 409,
    error,
    message,
  };
};

type Gateway = ListPaymentsResponse['payment_gateways'][number]
type CodePaymentMethod = Gateway['payment_method']['code']

export default async (data: AppModuleBody) => {
  const { application } = data;
  const params = data.params as ListPaymentsParams;
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const amount = params.amount || { total: undefined, discount: undefined };
  // const initialTotalAmount = amount.total;

  const configApp = {
    ...application.data,
    ...application.hidden_data,
  } as PagHiperApp;

  // setup basic required response object
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  if (!process.env.PAGHIPER_TOKEN) {
    const pagHiperToken = configApp.paghiper_api_key;
    if (typeof pagHiperToken === 'string' && pagHiperToken) {
      process.env.PAGHIPER_TOKEN = pagHiperToken;
    } else {
      logger.warn('Missing PagHiper API token');

      // must have configured PagHiper API key and token
      return responseError(
        400,
        'LIST_PAYMENTS_ERR',
        'PagHiper API key is unset on app hidden data (merchant must configure the app)',
      );
    }
  }

  const intermediator = {
    name: 'PagHiper',
    link: 'https://www.paghiper.com/',
    code: 'paghiper',
  };

  const listPaymentMethods = ['banking_billet', 'account_deposit'];

  listPaymentMethods.forEach((paymentMethod) => {
    const isPix = paymentMethod === 'account_deposit';
    const minAmount = configApp.min_amount || isPix ? 3 : 0;
    const methodConfig = isPix ? configApp.pix : configApp;

    const methodEnable = isPix ? configApp?.pix?.enable : configApp?.pix?.disable_billet;

    // Workaround for showcase
    const validateAmount = amount.total ? (amount.total >= minAmount) : true;

    if (methodEnable && validateAmount) {
      let label = methodConfig?.label;
      if (!label) {
        if (isPix) {
          label = 'Pagar com Pix';
        } else {
          label = (!params.lang || params.lang === 'pt_br') ? 'Boleto bancário' : 'Banking billet';
        }
      }

      const gateway: Gateway = {
        label,
        icon: methodConfig?.icon,
        text: methodConfig?.text,
        payment_method: {
          code: paymentMethod as CodePaymentMethod,
          name: `${label} - ${intermediator.name}`,
        },
        intermediator,
      };

      if (!gateway.icon && isPix) {
        gateway.icon = 'https://us-central1-ecom-pix.cloudfunctions.net/app/pix.png';
      }

      const discount = methodConfig?.discount;
      gateway.discount = discount;

      if (discount) {
        if (discount.value > 0) {
          if (amount.discount && (configApp.cumulative_discount === false)) {
            // can't offer cumulative discount
            delete gateway.discount;
            return;
          }

          if (discount.apply_at !== 'freight') {
            response.discount_option = {
              apply_at: discount.apply_at,
              type: discount.type,
              value: discount.value,
              label: `${label}`,
            };
          }

          if (discount.min_amount) {
            // check amount value to apply discount
            if (amount.total && amount.total < discount.min_amount) {
              delete gateway.discount;
            } else {
              delete discount.min_amount;
            }
          }
        } else if (typeof discount.value !== 'number' || Number.isNaN(discount.value)) {
          delete gateway.discount;
        }
      }

      response.payment_gateways.push(gateway);
    }
  });

  return response;
};
