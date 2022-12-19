import type { AppModuleBody, CreateTransactionParams, CreateTransactionResponse } from '@cloudcommerce/types';

export default async (appData: AppModuleBody) => {
  // treat module request body
  const { application } = appData;
  const params = appData.params as CreateTransactionParams;
  // app configured options
  const configApp = { ...application.data, ...application.hidden_data };

  const { amount, buyer } = params;

  let paymentMethodName = params.payment_method.name;
  if (paymentMethodName) {
    [paymentMethodName] = paymentMethodName.split(' ::');
  }

  let notes: string | undefined;
  let paymentLink: string | undefined;

  if (Array.isArray(configApp.payment_options) && configApp.payment_options.length) {
    let paymentOption = configApp.payment_options.find((paymentOptionFound) => {
      const paymentMethod = paymentOptionFound.payment_method;
      return paymentMethod
        && paymentMethod.code === params.payment_method.code
        && (!paymentMethod.name || paymentMethod.name === paymentMethodName);
    });

    if (!paymentOption) {
      [paymentOption] = configApp.payment_options;
    }
    if (typeof paymentOption.text === 'string') {
      notes = paymentOption.text.substring(0, 255);
    }
    if (typeof paymentOption.payment_link === 'string' && paymentOption.payment_link) {
      paymentLink = paymentOption.payment_link
        .replace(/{amount}/g, amount.total.toFixed(2).replace('.', ','))
        .replace(/{email}/g, buyer.email);
    }
  }

  const transaction: CreateTransactionResponse['transaction'] = {
    payment_link: paymentLink,
    intermediator: {
      payment_method: params.payment_method,
    },
    currency_id: params.currency_id,
    currency_symbol: params.currency_symbol,
    amount: amount.total,
    status: {
      current: 'pending',
    },
    flags: [
      'app-custom-payments',
    ],
    notes,
  };

  return {
    status: 200,
    redirect_to_payment: Boolean(paymentLink),
    transaction,
  };
};
