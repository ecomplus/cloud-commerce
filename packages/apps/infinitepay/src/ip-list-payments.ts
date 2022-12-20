import type {
  AppModuleBody,
  ListPaymentsParams,
  ListPaymentsResponse,
} from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import IPAxios from './functions-lib/ip-auth/create-access';
import addInstallments from './functions-lib/add-installments';
import { readFile, responseError, isSandbox } from './functions-lib/utils';

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
  };

  const disableLinkPayment = configApp.payment_link ? configApp.payment_link.disable : false;

  if (!configApp.infinitepay_user && !disableLinkPayment) {
    return responseError(409, 'NO_INFINITE_USER', 'Username da InfinitePay não configurado');
  }
  if ((!configApp.client_id || !configApp.client_secret)) {
    return responseError(409, 'NO_INFINITE_KEY', 'Client ID/Client Secrect InfinitePay não configurado');
  }

  if (configApp.pix && configApp.pix.enable && !configApp.pix.key_pix) {
    return responseError(409, 'NO_INFINITE_KEY_PIX', 'Chave Pix InfinitePay não configurada');
  }

  logger.log('>(App: InfinitePay) List Payment', `${isSandbox ? ' Sandbox' : ''}`);

  let tokenJWT: string | undefined;
  try {
    const ipAxios = new IPAxios({
      clientId: configApp.client_id,
      clientSecret: configApp.client_secret,
      typeScope: 'card',
      isSandbox,
    });

    await ipAxios.preparing;
    tokenJWT = ipAxios.cardTokenization;
  } catch (err: any) {
    logger.error('>(App: InfinitePay) Error =>', err);
    return responseError(409, 'NO_INFINITE_AUTH', 'Error getting authentication');
  }

  // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  const listPaymentMethods = ['credit_card', 'account_deposit'];

  const intermediator = {
    name: 'InfinitePay',
    link: 'https://infinitepay.io/',
    code: 'infinitepay',
  };

  // setup payment gateway object
  listPaymentMethods.forEach((paymentMethod) => {
    const isPix = paymentMethod === 'account_deposit';
    const isCreditCard = paymentMethod === 'credit_card';
    // const isLinkPayment = paymentMethod === 'payment_link';

    const methodConfig = isPix ? configApp.pix : (configApp[paymentMethod] || {});
    const minAmount = methodConfig.min_amount || 0;

    const methodEnable = isPix ? methodConfig.enable : !methodConfig.disable;

    // Workaround for showcase
    const validateAmount = amount.total ? (amount.total >= minAmount) : true;

    if (methodEnable && validateAmount) {
      const label = methodConfig.label || (isCreditCard ? 'Cartão de crédito' : 'Pix');

      const gateway: Gateway = {
        label,
        icon: methodConfig.icon,
        text: methodConfig.text,
        payment_method: {
          code: paymentMethod as CodePaymentMethod,
          name: `${label} - ${intermediator.name}`,
        },
        intermediator,
      };

      const { installments, discount } = configApp;
      if (installments && isCreditCard) {
        // list all installment options and default one
        addInstallments(amount.total, installments, gateway, response);
      }

      if (isPix && !gateway.icon) {
        gateway.icon = 'https://us-central1-ecom-pix.cloudfunctions.net/app/pix.png';
      }

      if (isCreditCard) {
        if (!gateway.icon) {
          gateway.icon = 'https://us-central1-ecom-infinitepay.cloudfunctions.net/app/infinitepay.png';
          // gateway.icon = `${baseUri}/infinitepay.png`;
        }
        //
        gateway.js_client = {
          script_uri: `https://ipayjs.infinitepay.io/${isSandbox
            ? 'development' : 'production'}/ipay-latest.min.js`,
          onload_expression: `window._infiniteJwtTokenCard="${tokenJWT}";
           window._infiniteCardSandbox="${isSandbox}";
           ${readFile('../../assets/onload-expression.min.js')}`,
          cc_hash: {
            function: '_infiniteHashCard',
            is_promise: true,
          },
        };
      }

      if (isPix && discount && discount.value > 0
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
            label: configApp.discount_option_label || `${label}`,
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
    }
  });

  return response;
};
