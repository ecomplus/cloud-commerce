import { addInstallments } from './util/vindi-utils.mjs';

export default async (modBody) => {
  const { application, params } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.vindi_api_key) {
    process.env.VINDI_API_KEY = appData.vindi_api_key;
  }
  if (appData.vindi_public_key) {
    process.env.VINDI_PUBLIC_KEY = appData.vindi_public_key;
  }
  const { VINDI_API_KEY, VINDI_PUBLIC_KEY } = process.env;
  if (!VINDI_API_KEY || !VINDI_PUBLIC_KEY) {
    return {
      error: 'NO_VINDI_KEYS',
      message: 'Chave de API e/ou criptografia não configurada (lojista deve configurar o aplicativo)',
    };
  }

  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const amount = params.amount || {};
  // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
  const response = {
    payment_gateways: [],
  };

  const { discount } = appData;
  if (discount && discount.value > 0) {
    if (discount.apply_at !== 'freight') {
      // default discount option
      const { value } = discount;
      response.discount_option = {
        label: appData.discount_option_label,
        value,
      };
      // specify the discount type and min amount is optional
      ['type', 'min_amount'].forEach((prop) => {
        if (discount[prop]) {
          response.discount_option[prop] = discount[prop];
        }
      });
    }

    if (amount.total) {
      // check amount value to apply discount
      if (amount.total < discount.min_amount) {
        discount.value = 0;
      } else {
        delete discount.min_amount;

        // fix local amount object
        const maxDiscount = amount[discount.apply_at || 'subtotal'];
        let discountValue;
        if (discount.type === 'percentage') {
          discountValue = maxDiscount * (discount.value / 100);
        } else {
          discountValue = discount.value;
          if (discountValue > maxDiscount) {
            discountValue = maxDiscount;
          }
        }
        if (discountValue > 0) {
          amount.discount = (amount.discount || 0) + discountValue;
          amount.total -= discountValue;
          if (amount.total < 0) {
            amount.total = 0;
          }
        }
      }
    }
  }

  // common payment methods data
  const intermediator = {
    name: 'Vindi',
    link: 'https://app.vindi.com.br/',
    code: 'vindi_app',
  };
  const paymentTypes = [];
  if (appData.enable_subscription) {
    paymentTypes.push('recurrence');
  }
  if (!appData.disable_bill) {
    paymentTypes.push('payment');
  }

  // setup payment gateway objects
  ['credit_card', 'banking_billet', 'account_deposit'].forEach((paymentMethod) => {
    paymentTypes.forEach((type) => {
      const methodConfig = appData[paymentMethod] || {};
      if (!methodConfig.disable) {
        const isCreditCard = paymentMethod === 'credit_card';
        const isPix = paymentMethod === 'account_deposit';
        let label = methodConfig.label;
        if (!label) {
          if (isCreditCard) {
            label = 'Cartão de crédito';
          } else if (isPix) {
            label = 'Pix';
          } else {
            label = 'Boleto bancário';
          }
        }
        if (type === 'recurrence' && appData.subscription_label) {
          label = appData.subscription_label + label;
        }
        const gateway = {
          label,
          icon: methodConfig.icon,
          text: methodConfig.text,
          payment_method: {
            code: paymentMethod,
            name: `${label} - ${intermediator.name}`,
          },
          type,
          intermediator,
        };

        if (isCreditCard) {
          if (!gateway.icon) {
            gateway.icon = 'https://ecom-pagarme5.web.app/credit-card.png';
          }
          gateway.js_client = {
            // @TODO: Fix to a project controlled URL
            script_uri: 'https://us-central1-ecom-vindi.cloudfunctions.net/app/vindi-hash.js',
            onload_expression: `window._vindiKey="${VINDI_PUBLIC_KEY}";`
              + `window._vindiSandbox=${Boolean(appData.vindi_sandbox)};`,
            cc_hash: {
              function: '_vindiHash',
              is_promise: true,
            },
          };
          const { installments } = appData;
          if (installments) {
            // list all installment options and default one
            addInstallments(amount, installments, gateway, response);
          }
        }

        if (methodConfig.discount) {
          gateway.discount = methodConfig.discount;
        } else if (
          discount
          && (discount[paymentMethod] === true
            || (!isCreditCard && discount[paymentMethod] !== false))
        ) {
          gateway.discount = discount;
          if (response.discount_option && !response.discount_option.label) {
            response.discount_option.label = label;
          }
        }

        response.payment_gateways.push(gateway);
      }
    });
  });

  return response;
};
