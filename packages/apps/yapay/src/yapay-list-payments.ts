import type {
  AppModuleBody,
  ListPaymentsResponse,
} from '@cloudcommerce/types';

type PaymentGateway = ListPaymentsResponse['payment_gateways'][number]

export const yapayListPayments = async (modBody: AppModuleBody<'list_payments'>) => {
  const { application } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.yapay_api_token) {
    process.env.YAPAY_API_TOKEN = appData.yapay_api_token;
  }
  if (!process.env.YAPAY_API_TOKEN) {
    return {
      error: 'NO_YAPAY_TOKEN',
      message: 'Token da conta não configurado (lojista deve configurar o aplicativo)',
    };
  }

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
    name: 'Vindi Pagamentos',
    link: 'https://vindi.com.br/',
    code: 'yapay3',
  };
  const paymentMethods: PaymentGateway['payment_method']['code'][] = [
    'account_deposit',
    // 'credit_card',
    // 'banking_billet',
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
    response.payment_gateways.push(gateway);
  });

  return response;
};

export default yapayListPayments;
