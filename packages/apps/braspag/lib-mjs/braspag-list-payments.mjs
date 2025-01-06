import fs from 'node:fs';
import { join as joinPath } from 'node:path';
import url from 'node:url';
import { logger } from '@cloudcommerce/firebase/lib/config';
import TokenSOPBraspag from './lib/braspag/sop/get-access-token.mjs';
import addInstallments from './lib/payments/add-installments.mjs';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const listPayments = async ({ params, application }) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  const listPaymentMethod = ['banking_billet', 'account_deposit'];
  const providersCieloBanking = [
    'Simulado',
    'Bradesco2',
    'BancoDoBrasil2',
    'BancoDoBrasil3',
  ];

  if (appData.braspag_admin?.client_id) {
    process.env.BRASPAG_CLIENT_ID = appData.braspag_admin.client_id;
    process.env.BRASPAG_CLIENT_SECRET = appData.braspag_admin.client_secret;
  }
  if (appData.merchant_id) {
    process.env.BRASPAG_MERCHANT_ID = appData.merchant_id;
    process.env.BRASPAG_MERCHANT_KEY = appData.merchant_key;
  }
  if (typeof appData.is_cielo === 'boolean') {
    process.env.BRASPAG_API_TYPE = appData.is_cielo ? 'cielo' : 'braspag';
  }
  if (!process.env.BRASPAG_API_TYPE) {
    process.env.BRASPAG_API_TYPE = 'braspag';
  }
  if (!process.env.BRASPAG_MERCHANT_ID || !process.env.BRASPAG_MERCHANT_KEY) {
    return {
      status: 409,
      error: 'NO_BRASPAG_KEYS',
      message: 'merchantId e/ou merchantKey da API indefinido(s) (lojista deve configurar o aplicativo)',
    };
  }
  const isCielo = process.env.BRASPAG_API_TYPE === 'cielo';
  const isSandbox = appData.credit_card?.provider === 'Simulado';

  let accessTokenSOP;
  if (process.env.BRASPAG_CLIENT_ID) {
    const getTokenSOPBraspag = new TokenSOPBraspag(isSandbox);
    try {
      await getTokenSOPBraspag.preparing;
      accessTokenSOP = await getTokenSOPBraspag.accessToken;
      if (accessTokenSOP) {
        listPaymentMethod.push('credit_card');
      }
    } catch (error) {
      logger.error(error);
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

  const { discount } = appData;
  listPaymentMethod.forEach(async (paymentMethod) => {
    const isPix = paymentMethod === 'account_deposit';
    const isCreditCard = paymentMethod === 'credit_card';
    const methodConfig = appData[paymentMethod] || {};
    let methodEnable = !methodConfig.disable;

    if (paymentMethod === 'banking_billet' && isCielo) {
      // https://developercielo.github.io/manual/cielo-ecommerce#boleto
      methodEnable = providersCieloBanking.includes(methodConfig.provider);
      logger.warn('Provider for banking billet not allowed for Cielo API');
    }

    const amount = { ...params.amount } || {};
    const minAmount = methodConfig?.min_amount || 0;
    const isValidAmount = amount.total ? (amount.total >= minAmount) : true;
    if (methodEnable && isValidAmount) {
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

      if (discount[paymentMethod]) {
        if (discount.apply_at !== 'freight') {
          // default discount option
          response.discount_option = {
            label: appData.discount_option_label || gateway.label,
            min_amount: discount.min_amount,
            apply_at: discount.apply_at,
            type: discount.type,
            value: discount.value,
          };
        }

        // check amount value to apply discount
        if (!(amount.total < discount.min_amount)) {
          gateway.discount = {
            apply_at: discount.apply_at,
            type: discount.type,
            value: discount.value,
          };
          // fix local amount object
          const applyDiscount = discount.apply_at;
          const maxDiscount = amount[applyDiscount || 'subtotal'];
          let discountValue;
          if (discount.type === 'percentage') {
            discountValue = maxDiscount * (discount.value / 100);
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

      if (isCreditCard) {
        const fingerprintApp = appData.fingerprint_app;
        /*
        if (!gateway.icon) {
          gateway.icon = `${hostingUri}/credit-card.png`
        }
        */

        // https://braspag.github.io//manual/braspag-pagador

        let baseScriptUri = 'https://www.pagador.com.br'; // https://www.pagador.com.br/post/scripts/silentorderpost-1.0.min.js
        if (isCielo) {
          // https://developercielo.github.io/manual/cielo-ecommerce

          // SANDBOX https://transactionsandbox.pagador.com.br/post/scripts/silentorderpost-1.0.min.js
          // PRODUÇÃO https://transaction.cieloecommerce.cielo.com.br/post/scripts/silentorderpost-1.0.min.js
          baseScriptUri = isSandbox
            ? 'https://transactionsandbox.pagador.com.br'
            : 'https://transaction.cieloecommerce.cielo.com.br';
        }

        gateway.js_client = {
          script_uri: `${baseScriptUri}/post/scripts/silentorderpost-1.0.min.js`,
          onload_expression: `window._braspagAccessToken="${accessTokenSOP}";`
            + `window._braspagIsSandbox=${isSandbox};`
            + `window._braspagFingerprintApp="${fingerprintApp}";`
            + fs.readFileSync(joinPath(__dirname, '../assets/braspag-onload-expression.min.js'), 'utf8'),
          cc_hash: {
            function: '_braspagHashCard',
            is_promise: true,
          },
        };
        const { installments } = appData;
        if (installments) {
          // list all installment options and default one
          addInstallments(amount, installments, gateway, response);
        }
      }
      response.payment_gateways.push(gateway);
    }
  });
  return response;
};

export default listPayments;
