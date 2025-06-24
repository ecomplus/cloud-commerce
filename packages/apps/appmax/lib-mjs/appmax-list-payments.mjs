import addInstallments from './lib/payments/add-installments.mjs';

export default async (modBody) => {
  const { application, params } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (typeof appData.token === 'string' && appData.token) {
    process.env.APPMAX_TOKEN = appData.token;
  }
  if (typeof appData.public_key === 'string' && appData.public_key) {
    process.env.APPMAX_PUBLIC_KEY = appData.public_key;
  }
  const { APPMAX_TOKEN, APPMAX_PUBLIC_KEY } = process.env;
  if (!APPMAX_TOKEN || !APPMAX_PUBLIC_KEY) {
    return {
      error: 'NO_APPMAX_KEYS',
      message: 'Chave de API e/ou criptografia não configurada (lojista deve configurar o aplicativo)',
    };
  }

  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const amount = params.amount || {};
  const initialTotalAmount = amount.total;
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

  // setup payment gateway objects
  const intermediator = {
    name: 'Appmax',
    link: 'https://appmax.com.br/',
    code: 'appmax',
  };
  ['credit_card', 'banking_billet', 'account_deposit'].forEach((paymentMethod) => {
    const methodConfig = appData[paymentMethod] || {};
    const isPix = paymentMethod === 'account_deposit';
    if (!methodConfig.disable && (!isPix || methodConfig.enable)) {
      const isCreditCard = paymentMethod === 'credit_card';
      let label = methodConfig.label;
      if (!label) {
        if (isCreditCard) {
          label = 'Cartão de crédito';
        } else {
          label = !isPix ? 'Boleto bancário' : 'Pix';
        }
      }
      const isDiscountInOneParcel = discount[paymentMethod] === '1 parcela';
      if (isCreditCard && (typeof discount[paymentMethod] === 'string')) {
        discount[paymentMethod] = isDiscountInOneParcel
          || discount[paymentMethod] === 'Todas as parcelas';
      }
      const gateway = {
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
        gateway.js_client = {
          // @TODO: Fix to a project controled URL
          script_uri: 'https://ecom-appmax.web.app/card-client.js',
          onload_expression: `window._appmaxKey="${APPMAX_PUBLIC_KEY}";`,
          cc_hash: {
            function: '_appmaxHash',
            is_promise: true,
          },
        };
        const { installments } = appData;
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
