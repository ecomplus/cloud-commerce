import type {
  AppModuleBody,
  ListPaymentsParams,
  ListPaymentsResponse,
} from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';

type Gateway = ListPaymentsResponse['payment_gateways'][number]

const responseError = (status: number | null, error: string, message: string) => {
  return {
    status: status || 409,
    error,
    message: `${message} (lojista deve configurar o aplicativo)`,
  };
};

export default (data: AppModuleBody) => {
  const { application } = data;
  const params = data.params as ListPaymentsParams;
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const amount = params.amount || { total: undefined, discount: undefined };
  // const initialTotalAmount = amount.total;

  const configApp = {
    ...application.data,
    ...application.hidden_data,
  };

  if (!configApp.pix_key) {
    return responseError(409, 'NO_PIX_KEY', 'Chave Pix não configurada');
  }
  const pixApi = configApp.pix_api;
  if (!pixApi.certificate) {
    return responseError(409, 'NO_PIX_CERTIFICATE', 'Certificado .PEM ou .P12 não configurado');
  }

  let clientId: string | undefined;
  let clientSecret: string | undefined;
  let tokenData: string | undefined;
  if (pixApi.client_id && pixApi.client_secret && pixApi.authentication) {
    clientId = pixApi.client_id;
    clientSecret = pixApi.client_secret;
    tokenData = pixApi.authentication;
  } else if (process.env.PIX_CREDENTIALS) {
    try {
      const pixCredentials = JSON.parse(process.env.PIX_CREDENTIALS);
      clientId = pixCredentials.client_id;
      clientSecret = pixCredentials.client_secret;
      tokenData = pixCredentials.authentication;
    } catch (err) {
      logger.error(err);
    }
  }
  if ((!clientId || !clientSecret) && !tokenData) {
    return responseError(409, 'NO_PIX_CREDENTIALS', 'Client ID e/ou Secret não configurados');
  }

  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };
  // setup payment gateway object
  const gateway: Gateway = {
    label: 'Pagar com Pix',
    // icon: `${baseUri}/pix.png`, // TODO: baseUri
    icon: 'https://us-central1-ecom-pix.cloudfunctions.net/app/pix.png',
    payment_method: {
      code: 'account_deposit',
      name: 'Pix',
    },
    intermediator: {
      name: 'Pix',
      link: 'https://www.bcb.gov.br/estabilidadefinanceira/pix',
      code: 'pixapi',
    },
    ...configApp.gateway_options,
  };

  const { discount } = configApp;
  if (discount && discount.value > 0
    && (!amount.discount || discount.cumulative_discount !== false)) {
    gateway.discount = {
      apply_at: discount.apply_at,
      type: discount.type,
      value: discount.value,
    };
    if (discount.apply_at !== 'freight') {
      // set as default discount option
      response.discount_option = {
        apply_at: discount.apply_at,
        type: discount.type,
        value: discount.value,
        label: configApp.discount_option_label || 'Pix',
      };
    }

    if (discount.min_amount) {
      // check amount value to apply discount
      if (amount.total && amount.total < discount.min_amount) {
        delete gateway.discount;
      }
      if (response.discount_option) {
        response.discount_option.min_amount = discount.min_amount;
      }
    }
  }

  response.payment_gateways.push(gateway);
  return response;
};

export {
  responseError,
};
