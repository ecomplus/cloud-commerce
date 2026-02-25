import type {
  AppModuleBody,
  ListPaymentsResponse,
} from '@cloudcommerce/types';

type PaymentGateway = ListPaymentsResponse['payment_gateways'][number]

export const wooviListPayments = async (modBody: AppModuleBody<'list_payments'>) => {
  const { application } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.woovi_app_id) {
    process.env.WOOVI_APP_ID = appData.woovi_app_id;
  }
  if (!process.env.WOOVI_APP_ID) {
    return {
      error: 'NO_WOOVI_APP_ID',
      message: 'AppID não configurado (lojista deve configurar o aplicativo)',
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
    name: 'Woovi',
    link: 'https://woovi.com/',
    code: 'woovi1',
  };
  const paymentMethod = 'account_deposit';
  const methodConfig = appData[paymentMethod] || {};
  let { label } = methodConfig;
  if (!label) {
    label = 'Pix';
  }
  const gateway: PaymentGateway = {
    label,
    icon: methodConfig.icon,
    text: methodConfig.text,
    payment_method: {
      code: paymentMethod,
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

  return response;
};

export default wooviListPayments;
