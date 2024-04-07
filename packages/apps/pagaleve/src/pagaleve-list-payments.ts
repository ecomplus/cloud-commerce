import type { AppModuleBody, ListPaymentsResponse } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';

const pagaleveListPayments = (body: AppModuleBody<'list_payments'>) => {
  const { application } = body;
  const params = body.params;
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };
  const appData = { ...application.data, ...application.hidden_data };
  const {
    PAGALEVE_USERNAME,
    PAGALEVE_PASSWORD,
  } = process.env;
  if (PAGALEVE_USERNAME) appData.username = PAGALEVE_USERNAME;
  if (PAGALEVE_PASSWORD) appData.password = PAGALEVE_PASSWORD;

  if (!appData.username || !appData.password) {
    logger.warn('Missign Pagaleve username/password');
    return {
      status: 409,
      error: 'NO_PAGALEVE_KEYS',
      message: 'Usuário e/ou senha não configurados pelo lojista',
    };
  }

  const amount = params.amount || {} as Exclude<(typeof params)['amount'], undefined>;
  const intermediator = {
    name: 'Pagaleve',
    link: 'https://api.pagaleve.com.br',
    code: 'pagaleve',
  };
  const { discount } = appData;
  if (discount && discount.value) {
    if (discount.apply_at !== 'freight') {
      const { value } = discount;
      response.discount_option = {
        label: 'Pix',
        value,
      };
      ['type', 'min_amount'].forEach((prop) => {
        if (discount[prop]) {
          response.discount_option![prop] = discount[prop];
        }
      });
    }

    if (amount.total) {
      if (amount.total < discount.min_amount) {
        discount.value = 0;
      } else {
        delete discount.min_amount;
        const maxDiscount = amount[discount.apply_at || 'subtotal'];
        let discountValue: number | undefined;
        if (discount.type === 'percentage') {
          discountValue = maxDiscount * (discount.value / 100);
        } else {
          discountValue = discount.value;
          if (discountValue! > maxDiscount) {
            discountValue = maxDiscount;
          }
        }
        if (discountValue) {
          amount.discount = (amount.discount || 0) + discountValue;
          amount.total -= discountValue;
          if (amount.total < 0) {
            amount.total = 0;
          }
        }
      }
    }
  }

  const listPaymentMethods = ['payment_link', 'account_deposit'] as const;
  listPaymentMethods.forEach((paymentMethod) => {
    const isLinkPayment = paymentMethod === 'payment_link';
    const methodConfig = (appData[paymentMethod] || {});
    const minAmount = Number(methodConfig.min_amount || 1);
    let validateAmount = false;
    if (amount.total && minAmount >= 0) {
      validateAmount = amount.total >= minAmount;
    }

    // Workaround for showcase
    const validatePayment = amount.total ? validateAmount : true;
    const methodEnable = !methodConfig.disable;
    if (validatePayment && methodEnable) {
      const label = methodConfig.label || (isLinkPayment ? 'Pix Parcelado' : 'Pagar com Pix');
      const gateway: ListPaymentsResponse['payment_gateways'][0] = {
        label,
        icon: methodConfig.icon,
        text: methodConfig.text,
        payment_method: {
          code: isLinkPayment ? 'balance_on_intermediary' : paymentMethod,
          name: `${label} - ${intermediator.name} `,
        },
        intermediator,
      };
      if (!gateway.icon) {
        if (isLinkPayment) {
          gateway.icon = 'https://ecom-pagaleve.web.app/pagaleve-parcelado.png';
        } else {
          gateway.icon = 'https://ecom-pagaleve.web.app/pagaleve-pix.png';
        }
      }
      if ((discount && discount.value && discount[paymentMethod] !== false)) {
        gateway.discount = {};
        ['apply_at', 'type', 'value'].forEach((field) => {
          gateway.discount![field] = discount[field];
        });
        if (response.discount_option && !response.discount_option.label) {
          response.discount_option.label = label;
        }
      }
      response.payment_gateways.push(gateway);
    }
  });

  return response;
};

export default pagaleveListPayments;
