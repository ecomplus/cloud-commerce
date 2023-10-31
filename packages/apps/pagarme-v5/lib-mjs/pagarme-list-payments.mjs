import path from 'path';
import fs from 'fs';
import logger from 'firebase-functions/logger';
import api from '@cloudcommerce/api';
import addInstallments from './functions-lib/payments/add-installments.mjs';
import { discountPlanPayment } from './functions-lib/pagarme/handle-plans.mjs';

export default async (data) => {
  const { application, params } = data;
  const { items } = params;

  const configApp = {
    ...application.data,
    ...application.hidden_data,
  };

  if (!process.env.PAGARMEV5_PUBLIC_KEY) {
    const pagarmePublicKey = configApp.pagarme_public_key;
    if (pagarmePublicKey && typeof pagarmePublicKey === 'string') {
      process.env.PAGARMEV5_PUBLIC_KEY = pagarmePublicKey;
    } else {
      logger.warn('Missing PAGARMEV5 API TOKEN');
    }
  }

  if (!process.env.PAGARMEV5_API_TOKEN || !process.env.PAGARMEV5_PUBLIC_KEY) {
    return {
      error: 'NO_PAGARME_KEYS',
      message: 'Chave de API e/ou criptografia não configurada (lojista deve configurar o aplicativo)',
    };
  }

  const categoryIds = configApp.recurrency_category_ids;
  let hasRecurrence = false;
  let isAllRecurring = true;

  if (categoryIds.length) {
    try {
      const { data: { result } } = await api.get('search/v1', {
        limit: items.length,
        params: {
          _id: items.map((item) => item.product_id),
          'categories._id': categoryIds,
        },
      });

      hasRecurrence = result.length > 0;
      isAllRecurring = result.length === items.length;
    } catch (err) {
      logger.error(err);
    }
  }

  const response = {
    payment_gateways: [],
  };

  const paymentTypes = [];
  if ((isAllRecurring) && configApp.recurrence && configApp.recurrence.length
    && configApp.recurrence[0].label) {
    paymentTypes.push('recurrence');
  }

  if ((!hasRecurrence) && (!configApp.credit_card.disable || !configApp.banking_billet.disable
    || !configApp.account_deposit.disable)) {
    paymentTypes.push('payment');
  }

  // setup payment gateway objects
  const intermediator = {
    name: 'Pagar.me',
    link: 'https://pagar.me/',
    code: 'pagarme',
  };

  const listPaymentMethod = ['credit_card', 'banking_billet'];

  if (!configApp.account_deposit?.disable) {
    listPaymentMethod.push('account_deposit');
  }

  paymentTypes.forEach((type) => {
    // At first the occurrence only with credit card
    const isRecurrence = type === 'recurrence';
    const plans = isRecurrence ? configApp.recurrence : ['single_payment'];
    plans.forEach((plan) => {
      listPaymentMethod.forEach((paymentMethod) => {
        // console.log('>> List Payments ', type, ' ', plan, ' ', paymentMethod)
        const amount = { ...params.amount } || {};
        const isCreditCard = paymentMethod === 'credit_card';
        const isPix = paymentMethod === 'account_deposit';
        const methodConfig = configApp[paymentMethod] || {};
        let methodEnable = isRecurrence ? methodConfig.enable_recurrence : !methodConfig.disable;

        // Pix not active in recurrence
        methodEnable = isPix && isRecurrence ? false : methodEnable;

        const minAmount = methodConfig?.min_amount || 0;
        const validateAmount = amount.total
          ? (amount.total >= minAmount) : true; // Workaround for showcase
        if (methodEnable && validateAmount) {
          let label = isRecurrence ? plan.label : methodConfig.label;
          if (!label) {
            if (isCreditCard) {
              label = 'Cartão de crédito';
            } else {
              label = !isPix ? 'Boleto bancário' : 'Pix';
            }
          }
          const gateway = {
            label,
            icon: methodConfig.icon,
            text: methodConfig.text,
            payment_method: {
              code: paymentMethod,
              name: `${isRecurrence ? `Assinatura ${plan.periodicity} ` : ''}`
                + `${label} - ${intermediator.name}`,
            },
            type,
            intermediator,
          };

          let discount;
          if (isRecurrence) {
            discount = discountPlanPayment(label, plan, amount);
          } else {
            discount = configApp.discount;
          }

          if (discount) {
            if (isRecurrence) {
              gateway.discount = !plan.discount_first_installment?.disable
                ? plan.discount_first_installment : plan.discount;
              gateway.discount.type = discount.discountOption.type;
              response.discount_option = discount.discountOption;
            } else if (discount[paymentMethod]) {
              gateway.discount = {
                apply_at: discount.apply_at,
                type: discount.type,
                value: discount.value,
              };

              // check amount value to apply discount
              if (amount.total < (discount.min_amount || 0)) {
                delete gateway.discount;
              } else {
                delete discount.min_amount;

                // fix local amount object
                const applyDiscount = discount.apply_at;

                const maxDiscount = amount[applyDiscount || 'subtotal'];
                let discountValue;
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
              if (response.discount_option) {
                response.discount_option.min_amount = discount.min_amount;
              }
            }
          }

          if (isCreditCard) {
            if (!gateway.icon) {
              // gateway.icon = `${hostingUri}/credit-card.png`;
            }
            // https://github.com/pagarme/pagarme-js
            gateway.js_client = {
              script_uri: 'https://checkout.pagar.me/v1/tokenizecard.js',
              onload_expression: `window._pagarmeKey="${process.env.PAGARMEV5_PUBLIC_KEY}";`
                + fs.readFileSync(path.join(__dirname, '../assets/onload-expression.min.js'), 'utf8'),
              cc_hash: {
                function: '_pagarmeHash',
                is_promise: true,
              },
            };
            if (!isRecurrence) {
              const { installments } = configApp;
              if (installments) {
                // list all installment options and default one
                addInstallments(amount, response, installments, gateway);
              }
            }
          }
          response.payment_gateways.push(gateway);
        }
      });
    });
  });

  return response;
};
