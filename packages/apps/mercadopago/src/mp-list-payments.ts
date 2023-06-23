import type {
  AppModuleBody,
  ListPaymentsParams,
  ListPaymentsResponse,
} from '@cloudcommerce/types';
import * as path from 'node:path';
import * as fs from 'node:fs';
import url from 'node:url';
import logger from 'firebase-functions/logger';

type Gateway = ListPaymentsResponse['payment_gateways'][number]
type CodePaymentMethod = Gateway['payment_method']['code']

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default (data: AppModuleBody) => {
  const { application } = data;
  const params = data.params as ListPaymentsParams;
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const amount = params.amount || { total: undefined };
  // const initialTotalAmount = amount.total;

  const config = {
    ...application.data,
    ...application.hidden_data,
  };

  if (!process.env.MERCADOPAGO_TOKEN) {
    const mpAccessToken = config.mp_access_token;
    if (typeof mpAccessToken === 'string' && mpAccessToken) {
      process.env.MERCADOPAGO_TOKEN = mpAccessToken;
    } else {
      logger.warn('Missing Mercadopago access token');
    }
  }

  if (!config.mp_public_key || !process.env.MERCADOPAGO_TOKEN) {
    return {
      error: 'LIST_PAYMENTS_ERR',
      message: 'The public key is not defined in the app '
        + 'or the MERCADOPAGO_TOKEN is not defined in the environment variables',
    };
  }

  // start mounting response body
  // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  // calculate discount value
  const { discount } = config;
  if (discount && discount.value) {
    if (discount.apply_at !== 'freight') {
      // default discount option
      const { value } = discount;
      response.discount_option = {
        label: config.discount_option_label,
        value,
      };
      // specify the discount type and min amount is optional
      const discountTypeMinAmount = ['type', 'min_amount'];
      discountTypeMinAmount.forEach(
        (prop) => {
          if (response.discount_option && discount[prop]) {
            response.discount_option[prop] = discount[prop];
          }
        },
      );
    }

    if (amount.total) {
      // check amount value to apply discount
      if (amount.total < discount.min_amount) {
        discount.value = 0;
      } else {
        delete discount.min_amount;

        // fix local amount object
        const maxDiscount = amount[discount.apply_at || 'subtotal'];
        let discountValue: number;
        if (discount.type === 'percentage') {
          discountValue = (maxDiscount * discount.value) / 100;
        } else {
          discountValue = discount.value;
          if (discountValue > maxDiscount) {
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

  // setup payment gateway objects
  const intermediator = {
    code: 'mercadopago',
    link: 'https://www.mercadopago.com.br',
    name: 'Mercado Pago',
  };
  const listPaymentMethods = ['banking_billet', 'credit_card'];
  if (config.account_deposit && config.account_deposit.key_pix) {
    // pix Configured
    listPaymentMethods.push('account_deposit');
  }
  listPaymentMethods.forEach((paymentMethod) => {
    const isCreditCard = paymentMethod === 'credit_card';
    const methodConfig = isCreditCard ? config : config[paymentMethod];
    const minAmount = methodConfig.min_amount || 0;
    const methodEnable = methodConfig.enable || (isCreditCard && !methodConfig.disable);
    if (methodConfig && methodEnable && (amount.total === undefined || amount.total >= minAmount)) {
      let label: string;
      if (methodConfig.label) {
        label = methodConfig.label;
      } else if (isCreditCard) {
        label = 'Cartão de crédito';
      } else {
        label = paymentMethod === 'account_deposit' ? 'Pix' : 'Boleto bancário';
      }
      const gateway: Gateway = {
        label,
        icon: methodConfig.icon,
        text: methodConfig.text,
        payment_method: {
          code: paymentMethod as CodePaymentMethod,
          name: `${label} - ${intermediator.name}`,
        },
        intermediator,
        type: 'payment',
      };

      if (isCreditCard) {
        if (!gateway.icon) {
          // gateway.icon = `${baseUri}/checkout-stamp.png`; // TODO: baseUri
          gateway.icon = 'https://us-central1-mercadopago-ecom.cloudfunctions.net/app/checkout-stamp.png';
        }
        gateway.js_client = {
          script_uri: 'https://secure.mlstatic.com/sdk/javascript/v1/mercadopago.js',
          onload_expression: `window.Mercadopago.setPublishableKey("${config.mp_public_key}");
          ${fs.readFileSync(path.join(__dirname, '../assets/onload-expression.min.js'), 'utf8')}`,
          cc_brand: {
            function: '_mpBrand',
            is_promise: true,
          },
          cc_hash: {
            function: '_mpHash',
            is_promise: true,
          },
          cc_installments: {
            function: '_mpInstallments',
            is_promise: true,
          },
        };

        // default configured default installments option
        const installmentsOption = config.installments_option;
        if (installmentsOption && installmentsOption.max_number) {
          response.installments_option = installmentsOption;
          const minInstallment = installmentsOption.min_installment;

          // optional configured installments list
          if (amount.total && Array.isArray(config.installments) && config.installments.length) {
            gateway.installment_options = [];
            config.installments.forEach(({ number, interest }) => {
              if (number >= 2) {
                const value = amount.total / number;
                if (gateway.installment_options && value >= minInstallment) {
                  gateway.installment_options.push({
                    number,
                    value: interest > 0 ? (value + value * interest) / 100 : value,
                    tax: Boolean(interest),
                  });
                }
              }
            });
          }
        }
      }

      // check available discount by payment method
      if (discount && discount.value && discount[paymentMethod] !== false) {
        gateway.discount = {
          apply_at: 'total',
          type: 'fixed',
          value: 0,
        };
        ['apply_at', 'type', 'value'].forEach(
          (field) => {
            if (gateway.discount && discount[field]) {
              gateway.discount[field] = discount[field];
            }
          },
        );
        if (response.discount_option && !response.discount_option.label) {
          response.discount_option.label = label;
        }
      }

      response.payment_gateways.push(gateway);
    }
  });

  return response;
};
