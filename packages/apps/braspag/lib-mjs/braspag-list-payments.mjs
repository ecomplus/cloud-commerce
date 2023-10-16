import logger from 'firebase-functions/logger';
import { isSandbox, readFile } from './functions-lib/utils.mjs';
import TokenSOPBraspag from './functions-lib/braspag/sop-get-token.mjs';
import addInstallments from './functions-lib/add-payments.mjs';

export default async (data) => {
  const { application } = data;
  const params = data.params;
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const amount = params.amount || { total: undefined, discount: undefined };
  // const initialTotalAmount = amount.total;

  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  const listPaymentMethod = ['banking_billet', 'account_deposit'];

  if (!process.env.BRASPAG_MERCHANT_ID) {
    const braspagMerchantId = appData.merchant_id;
    if (braspagMerchantId && typeof braspagMerchantId === 'string') {
      process.env.BRASPAG_MERCHANT_ID = braspagMerchantId;
    } else {
      logger.warn('Missing Braspag MERCHANT ID');
    }
  }

  if (!process.env.BRASPAG_MERCHANT_KEY) {
    const braspagMerchantKey = appData.merchant_key;
    if (braspagMerchantKey && typeof braspagMerchantKey === 'string') {
      process.env.BRASPAG_MERCHANT_KEY = braspagMerchantKey;
    } else {
      logger.warn('Missing Braspag MERCHANT KEY');
    }
  }

  if (!process.env.BRASPAG_CLIENT_ID) {
    const braspagClientId = appData.braspag_admin && appData.braspag_admin.client_id;
    if (braspagClientId && typeof braspagClientId === 'string') {
      process.env.BRASPAG_CLIENT_ID = braspagClientId;
    } else {
      logger.warn('Missing Braspag CLIENT ID');
    }
  }

  if (!process.env.BRASPAG_CLIENT_SECRET) {
    const braspagClientSecret = appData.braspag_admin && appData.braspag_admin.client_id;
    if (braspagClientSecret && typeof braspagClientSecret === 'string') {
      process.env.BRASPAG_CLIENT_SECRET = braspagClientSecret;
    } else {
      logger.warn('Missing Braspag CLIENT SECRET');
    }
  }

  if (!process.env.BRASPAG_MERCHANT_ID || !process.env.BRASPAG_MERCHANT_KEY) {
    return {
      error: 'NO_BRASPAG_KEYS',
      message: 'merchantId e/ou merchantKey da API indefinido(s) (lojista deve configurar o aplicativo)',
    };
  }

  const haveCredentialsAdmin = process.env.BRASPAG_CLIENT_ID
    && process.env.BRASPAG_CLIENT_SECRET;

  let accessTokenSOP;
  const merchantId = appData.merchant_id;

  if (haveCredentialsAdmin) {
    const getTokenSOPBraspag = new TokenSOPBraspag(
      appData.braspag_admin.client_id,
      appData.braspag_admin.client_secret,
      merchantId,
      isSandbox,
    );

    try {
      await getTokenSOPBraspag.preparing;
      accessTokenSOP = await getTokenSOPBraspag.accessToken;
      if (accessTokenSOP) {
        listPaymentMethod.push('credit_card');
      }
    } catch (error) {
      logger.error('[Braspag App]', error);
    }
  }

  const response = {
    payment_gateways: [],
  };

  // setup payment gateway objects
  const intermediator = {
    name: 'Braspag',
    link: 'https://braspag.github.io/',
    code: 'braspag',
  };

  listPaymentMethod.forEach(async (paymentMethod) => {
    const isPix = paymentMethod === 'account_deposit';
    const isCreditCard = paymentMethod === 'credit_card';
    const methodConfig = appData[paymentMethod] || {};
    const methodEnable = !methodConfig.disable;

    const minAmount = methodConfig?.min_amount || 0;
    const validateAmount = amount.total
      ? (amount.total >= minAmount) : true; // Workaround for showcase

    if (methodEnable && validateAmount) {
      let label = methodConfig.label;
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
          name: `${label} - ${intermediator.name}`,
        },
        // type,
        intermediator,
      };

      const discount = appData.discount;

      if (discount[paymentMethod]) {
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

      if (isCreditCard) {
        /*
        if (!gateway.icon) {
          gateway.icon = `${hostingUri}/credit-card.png`
        }
        */

        // https://braspag.github.io//manual/braspag-pagador
        gateway.js_client = {
          script_uri: 'https://www.pagador.com.br/post/scripts/silentorderpost-1.0.min.js',
          onload_expression: `window._braspagAccessToken="${accessTokenSOP}";`
            + `window._braspagIsSandbox=${isSandbox};`
            + `${readFile('../../assets/onload-expression.min.js')}`,
          cc_hash: {
            function: '_braspagHashCard',
            is_promise: true,
          },
        };
        const { installments } = appData;
        if (installments) {
          // list all installment options and default one
          addInstallments(amount, response, installments, gateway);
        }
      }
      response.payment_gateways.push(gateway);
    }
  });

  return response;
};
