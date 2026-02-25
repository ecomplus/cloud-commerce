import type {
  AppModuleBody,
  ListPaymentsResponse,
} from '@cloudcommerce/types';
import { addInstallments } from './util/asaas-utils';

type PaymentGateway = ListPaymentsResponse['payment_gateways'][number]

export const asaasListPayments = async (modBody: AppModuleBody<'list_payments'>) => {
  const {
    application,
    params,
  } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.asaas_api_key) {
    process.env.ASAAS_API_KEY = appData.asaas_api_key;
  }
  process.env.ASAAS_ENV = appData.asaas_sandbox
    ? 'sandbox'
    : process.env.ASAAS_ENV || 'live';
  if (!process.env.ASAAS_API_KEY) {
    return {
      error: 'NO_ASAAS_KEY',
      message: 'Chave de API não configurada (lojista deve configurar o aplicativo)',
    };
  }

  const {
    amount = { total: 0 },
  } = params;
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  const { discount } = appData;
  if (discount?.value > 0) {
    if (discount.apply_at !== 'freight') {
      const { value } = discount;
      response.discount_option = {
        label: appData.discount_option_label,
        value,
      };
      const discountTypeMinAmount = ['type', 'min_amount'];
      discountTypeMinAmount.forEach((prop) => {
        if (response.discount_option && discount[prop]) {
          response.discount_option[prop] = discount[prop];
        }
      });
    }
  }

  const intermediator = {
    name: 'Asaas',
    link: 'https://www.asaas.com/',
    code: 'asaas3',
  };
  const paymentMethods: PaymentGateway['payment_method']['code'][] = [
    'account_deposit',
    'credit_card',
    'banking_billet',
  ];
  paymentMethods.forEach((paymentMethod) => {
    const methodConfig = appData[paymentMethod] || {};
    const isPix = paymentMethod === 'account_deposit';
    if (!methodConfig.enable) return;
    const isCreditCard = paymentMethod === 'credit_card'
      || paymentMethod === 'balance_on_intermediary';
    let { label } = methodConfig;
    if (!label) {
      if (isCreditCard) {
        label = 'Cartão de crédito';
      } else {
        label = !isPix ? 'Boleto bancário' : 'Pix';
      }
    }
    const gateway: PaymentGateway = {
      label,
      icon: methodConfig.icon,
      text: methodConfig.text,
      payment_method: {
        code: isCreditCard ? 'balance_on_intermediary' : paymentMethod,
        name: `${label} - ${intermediator.name}`,
      },
      intermediator,
    };
    if (methodConfig.discount) {
      gateway.discount = methodConfig.discount;
    } else if (discount?.[paymentMethod] === true) {
      gateway.discount = discount;
      if (response.discount_option && !response.discount_option.label) {
        response.discount_option.label = label;
      }
    }
    if (isCreditCard) {
      if (!gateway.icon) {
        // gateway.icon = `${baseUri}/credit-card.png`; // TODO: baseUri
        gateway.icon = 'https://ecom-pagarme5.web.app/credit-card.png';
      }
      const { installments } = appData;
      if (installments) {
        // list all installment options and default one
        addInstallments(
          amount.total,
          installments,
          gateway,
          response,
        );
      }
    }
    response.payment_gateways.push(gateway);
  });

  return response;
};

export default asaasListPayments;
