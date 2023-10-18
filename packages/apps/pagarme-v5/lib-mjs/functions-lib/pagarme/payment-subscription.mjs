import logger from 'firebase-functions/logger';
import axios from './create-axios.mjs';
import { parseAddress } from './parses-utils.mjs';

const paymentMethods = {
  credit_card: 'credit_card',
  banking_billet: 'boleto',
  account_deposit: 'pix',
};

const parseIntervalPlan = {
  // day, week, month ou year.
  Diaria: {
    interval: 'day',
    interval_count: 1,
  },
  Semanal: {
    interval: 'week',
    interval_count: 1,
  },
  Mensal: {
    interval: 'month',
    interval_count: 1,

  },
  Bimestral: {
    interval: 'month',
    interval_count: 2,
  },
  Trimestral: {
    interval: 'month',
    interval_count: 3,
  },
  Semestral: {
    interval: 'month',
    interval_count: 6,
  },
  Anual: {
    interval: 'year',
    interval_count: 1,
  },
};

const createSubscription = async (params, appData, storeId, plan, customer) => {
  const pagarmeAxios = axios(appData.pagarme_api_token);

  const orderId = params.order_id;
  const { amount, items } = params;

  const paymentMethod = paymentMethods[params.payment_method.code] || 'credit_card';

  const intervalPlan = parseIntervalPlan[plan.periodicity];

  const statementDescriptor = appData.soft_descriptor || params?.domain
    .replace('www.', '')
    .replace('https://', '')
    .split('.')[0] || '*';

  const pagarmeSubscription = {
    code: orderId,
    payment_method: paymentMethod,
    currency: 'BRL',
    interval: intervalPlan.interval || 'month',
    interval_count: intervalPlan.interval_count || 1,
    billing_type: 'prepaid', //
    customer,
    statement_descriptor: (`Assinatura ${statementDescriptor}`).substring(13),
  };

  pagarmeSubscription.metada = {
    order_number: params.order_number,
    store_id: storeId,
    order_id: orderId,
    platform_integration: 'ecomplus',
  };

  if (paymentMethod === 'credit_card') {
    pagarmeSubscription.card_token = params.credit_card.hash;
  }

  pagarmeSubscription.discounts = [];
  pagarmeSubscription.items = [];

  items.forEach(async (item) => {
    if (item.quantity > 0) {
      const itemSubscription = {
        name: item.name || item.variation_id || item.product_id,
        quantity: item.quantity,
        description: item.name || item.variation_id || item.product_id,
        id: `pi_${item.sku}`,
        status: 'active',
        pricing_scheme: {
          scheme_type: 'unit',
          price: Math.floor((item.final_price || item.price) * 100),
        },
      };
      // if the item is a bonus, create a discount for repeat one time
      if (
        item.flags && (item.flags.includes('freebie')
          || item.flags.includes('discount-set-free'))
      ) {
        itemSubscription.cycles = 1;
      }

      pagarmeSubscription.items.push(itemSubscription);
    }
  });

  if (amount.freight) {
    const itemFreight = {
      name: 'Frete',
      quantity: 1,
      description: 'Frete',
      id: `pi_freight_${orderId}`,
      status: 'active',
      pricing_scheme: {
        scheme_type: 'unit',
        price: Math.floor((amount.freight).toFixed(2) * 1000) / 10,
      },
    };
    pagarmeSubscription.items.push(itemFreight);
  }

  // console.log('>> amount ', JSON.stringify(amount))
  // Add once discont, but webhook invoce check discount plan
  const discountSubscription = amount.discount && {
    value: `${Math.floor((amount.discount).toFixed(2) * 1000) / 10}`,
    discount_type: 'flat',
    cycles: 1,
  };

  if (discountSubscription) {
    pagarmeSubscription.discounts.push(discountSubscription);
  }

  logger.log('[PagarMe V5] Subscription: ', JSON.stringify(pagarmeSubscription));

  return pagarmeAxios.post(
    '/subscriptions',
    pagarmeSubscription,
  );
};

const createPayment = async (params, appData, customer) => {
  const pagarmeAxios = axios(appData.pagarme_api_token);

  const { amount, items } = params;

  const address = parseAddress(params.to || params.billing_address);

  logger.log('[PagarMe V5] Try payment');
  let discountEach;
  if (amount.discount) {
    const quantityItems = items.reduce((acumulador, item) => {
      return acumulador + (item.quantity || 0);
    }, 0);
    discountEach = amount.discount / quantityItems;
  }

  const paymentMethod = paymentMethods[params.payment_method.code] || 'credit_card';
  const methodConfig = appData[params.payment_method.code];

  const statementDescriptor = appData.soft_descriptor || params?.domain
    .replace('www.', '')
    .replace('https://', '')
    .split('.')[0] || '*';

  const pagarmeOrder = { customer };

  const phone = customer.phones[0];
  if (amount.freight) {
    pagarmeOrder.shipping = {
      amount: Math.floor((amount.freight) * 100),
      description: 'Frete',
      recipient_name: customer.name,
      recipient_phone: `${phone?.area_code || ''}${phone?.number}`,
      address,
    };
  }

  if (params.browser_ip) {
    pagarmeOrder.ip = params.browser_ip;
  }

  pagarmeOrder.items = [];

  items.forEach(async (item) => {
    if (item.quantity > 0) {
      const itemOrder = {
        quantity: item.quantity,
        description: item.name || item.variation_id || item.product_id,
        code: item.sku || item.variation_id || item.product_id,
        amount: Math.floor(((item.final_price || item.price) - (discountEach || 0)) * 100),
      };
      pagarmeOrder.items.push(itemOrder);
    }
  });

  const payment = {
    payment_method: paymentMethod,
    amount: Math.floor((amount.total)) * 100,
  };

  if (paymentMethod === 'credit_card') {
    payment.credit_card = {
      operation_type: 'auth_and_capture', // auth_only
      installments: params.installments_number || 1,
      statement_descriptor: statementDescriptor.substring(13),
      card_token: params.credit_card.hash,
      card: {
        billing_address: address,
      },
    };
  } else if (paymentMethod === 'pix') {
    payment.pix = {
      expires_in: (methodConfig.due_time || 60) * 60,
    };
  } else {
    payment.boleto = {
      due_at: new Date(new Date().getTime()
        + ((methodConfig.days_due_date || 1) * 24 * 60 * 60 * 1000)).toISOString(),
      instructions: methodConfig.instructions || statementDescriptor,
      billing_address: address,
    };
  }

  pagarmeOrder.payments = [payment];

  logger.log('[PagarMe V5] Order PagarMe: ', JSON.stringify(pagarmeOrder));

  return pagarmeAxios.post(
    '/orders',
    pagarmeOrder,
  );
};

export {
  createSubscription,
  createPayment,
};
