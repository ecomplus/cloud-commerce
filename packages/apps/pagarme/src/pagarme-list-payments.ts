import type {
  AppModuleBody,
  ListPaymentsParams,
  ListPaymentsResponse,
} from '@cloudcommerce/types';
import * as path from 'node:path';
import * as fs from 'node:fs';
import url from 'node:url';
import logger from 'firebase-functions/logger';
import addInstallments from './functions-lib/add-installments';

type Gateway = ListPaymentsResponse['payment_gateways'][number]
type CodePaymentMethod = Gateway['payment_method']['code']

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default (data: AppModuleBody) => {
  const { application } = data;
  const params = data.params as ListPaymentsParams;
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const amount = params.amount || { total: undefined };
  const initialTotalAmount = amount.total;

  const configApp = {
    ...application.data,
    ...application.hidden_data,
  };

  if (!process.env.PAGARME_ENCRYPT_KEY) {
    const parameEncryptKey = configApp.pagarme_encryption_key;
    if (typeof parameEncryptKey === 'string' && parameEncryptKey) {
      process.env.PAGARME_ENCRYPT_KEY = parameEncryptKey;
    } else {
      logger.warn('Missing PagarMe Encryption key');
    }
  }

  if (!process.env.PAGARME_TOKEN) {
    const pagarmeToken = configApp.pagarme_api_key;
    if (typeof pagarmeToken === 'string' && pagarmeToken) {
      process.env.PAGARME_TOKEN = pagarmeToken;
    } else {
      logger.warn('Missing PagarMe API token');
    }
  }

  if (!process.env.PAGARME_ENCRYPT_KEY || !process.env.PAGARME_TOKEN) {
    return {
      error: 'NO_PAGARME_KEYS',
      message: 'Chave de API e/ou criptografia não configurada (lojista deve configurar o aplicativo)',
    };
  }

  // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  const { discount } = configApp;
  if (discount && discount.value > 0) {
    if (discount.apply_at !== 'freight') {
      // default discount option
      const { value } = discount;
      response.discount_option = {
        label: configApp.discount_option_label,
        value,
      };
      // specify the discount type and min amount is optional
      const discountTypeMinAmount = ['type', 'min_amount'];
      discountTypeMinAmount.forEach((prop) => {
        if (response.discount_option && discount[prop]) {
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
        let discountValue: number;
        if (discount.type === 'percentage') {
          discountValue = (maxDiscount * discount.value) / 100;
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

  // setup payment gateway objects
  const intermediator = {
    name: 'Pagar.me',
    link: 'https://pagar.me/',
    code: 'pagarme',
  };
  const listPaymentMethods = ['credit_card', 'banking_billet', 'account_deposit'];

  listPaymentMethods.forEach((paymentMethod) => {
    const methodConfig = configApp[paymentMethod] || {};
    const isPix = paymentMethod === 'account_deposit';
    if (!methodConfig.disable && (!isPix || methodConfig.enable)) {
      const isCreditCard = paymentMethod === 'credit_card';
      let { label } = methodConfig;
      if (!label) {
        if (isCreditCard) {
          label = 'Cartão de crédito';
        } else {
          label = !isPix ? 'Boleto bancário' : 'Pix';
        }
      }
      const isDiscountInOneParcel = discount[paymentMethod] === '1 parcela';
      if (isCreditCard && typeof discount[paymentMethod] === 'string') {
        discount[paymentMethod] = isDiscountInOneParcel
          || discount[paymentMethod] === 'Todas as parcelas';
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
      };

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

      if (isCreditCard) {
        if (!gateway.icon) {
          // gateway.icon = `${baseUri}/credit-card.png`; // TODO: baseUri
          gateway.icon = 'https://us-central1-ecom-pagarme.cloudfunctions.net/app/credit-card.png';
        }
        // https://github.com/pagarme/pagarme-js
        gateway.js_client = {
          script_uri: 'https://assets.pagar.me/pagarme-js/4.8/pagarme.min.js',
          onload_expression: `window._pagarmeKey="${process.env.PAGARME_ENCRYPT_KEY}";
          ${fs.readFileSync(path.join(__dirname, '../assets/onload-expression.min.js'), 'utf8')}`,
          cc_hash: {
            function: '_pagarmeHash',
            is_promise: true,
          },
        };
        const { installments } = configApp;
        if (installments) {
          const installmentsTotal = gateway.discount ? amount.total : initialTotalAmount;
          // list all installment options and default one
          addInstallments(
            installmentsTotal,
            installments,
            gateway,
            response,
            initialTotalAmount,
            isDiscountInOneParcel,
          );
        }
      }

      response.payment_gateways.push(gateway);
    }
  });

  return response;
};
