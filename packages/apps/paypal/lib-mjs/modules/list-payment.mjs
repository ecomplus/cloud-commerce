// generate default payment gateway object
import newPaymentGateway from '../new-payment-gateway.mjs';
// parse list payments body from Mods API to PayPal model
import parsePaymentBody from '../parse-payment-body.mjs';
// create PayPal payment request
import createPaypalPayment from '../paypal-api/create-payment.mjs';
import { responseError } from '../utils.mjs'

export default async (data) => {
  // const { params, application } = req.body;
  const { application } = data;
  const { params } = data;

  // app configured options
  const config = {
    ...application.data,
    ...application.hidden_data,
  };
  const paypalClientId = config.paypal_client_id;
  const paypalSecret = config.paypal_secret;
  const paypalEnv = config.paypal_sandbox ? 'sandbox' : 'live';
  const enableNewSpb = Boolean(params.lang === 'en_us' || config.enable_new_spb);

  if (!paypalClientId) {
    // must have configured PayPal app ID and secret
    return responseError(
      400,
      'LIST_PAYMENTS_ERR',
      'PayPal Client ID is unset on app hidden data (merchant must configure the app)',
    );
  }

  // params object follows list payments request schema:
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  if (!params.lang) {
    // set PT-BR as default
    params.lang = 'pt_br';
  }
  const amount = params.amount || {};

  // start mounting response body
  // https://apx-mods.e-com.plus/api/v1/list_payments/response_schema.json?store_id=100
  const response = {
    payment_gateways: [],
  };

  // calculate discount value
  const { discount } = config;
  if (discount && discount.value > 0) {
    if (discount.apply_at !== 'freight') {
      // default discount option
      const { value } = discount;
      response.discount_option = {
        label: config.discount_option_label,
        value,
      };
      // specify the discount type and min amount is optional
      const fieldsDiscountOption = ['type', 'min_amount'];

      fieldsDiscountOption.forEach((prop) => {
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

  // preset PayPal payment if needed
  let paypalPayment;
  const setupPaypalPayment = async () => {
    const paypalPlus = Boolean(params.payment_method && params.payment_method.code === 'credit_card');
    const createdPayment = await createPaypalPayment(
      paypalEnv,
      paypalClientId,
      paypalSecret,
      parsePaymentBody(params),
      paypalPlus,
    );
    paypalPayment = createdPayment;
  };

  const addPaymentGateway = (paypalPlus) => {
    // add payment gateway object to response
    const paymentGateway = newPaymentGateway(params.lang, paypalPlus, enableNewSpb);
    if (params.payment_method && params.payment_method.code
      !== paymentGateway.payment_method.code) {
      return;
    }
    response.payment_gateways.unshift(paymentGateway);

    // merge configured options to payment gateway object
    const fieldsPaymentGatway = ['label', 'text', 'icon'];
    fieldsPaymentGatway.forEach((prop) => {
      if (config[prop]) {
        paymentGateway[prop] = config[prop];
      }
    });
    if (paypalPlus && config.ppp_label) {
      paymentGateway.label = config.ppp_label;
    }

    // check available discount by payment method
    if (discount && discount.value > 0) {
      paymentGateway.discount = discount;
      if (response.discount_option && !response.discount_option.label) {
        response.discount_option.label = paymentGateway.label;
      }
    }

    const installmentsOption = config.installments_option;
    if (installmentsOption && installmentsOption.max_number) {
      // default configured installments option
      response.installments_option = installmentsOption;

      if (amount.total) {
        // map to payment gateway installments
        paymentGateway.installment_options = [];
        const minInstallment = installmentsOption.min_installment || 5;
        for (let number = 2; number <= installmentsOption.max_number; number++) {
          // check installment value and configured minimum
          const value = amount.total / number;
          if (value >= minInstallment) {
            paymentGateway.installment_options.push({
              number,
              value,
              // PayPal only supports interest-free installments
              tax: false,
            });
          } else {
            break;
          }
        }
      }
    }

    // PayPal Checkout JS client
    const jsClient = paymentGateway.js_client;
    const locales = params.lang.split('_');
    const paypalLocale = `${locales[0]}_${(locales[1] || locales[0]).toUpperCase()}`;
    let paypalScript;

    if (!paypalPlus) {
      if (enableNewSpb) {
        // https://developer.paypal.com/docs/checkout/integrate/
        paypalScript = 'https://www.paypal.com/sdk/js'
          + `?client-id=${paypalClientId}`
          + `&currency=${params.currency_id}`
          + `&locale=${paypalLocale}`;
        if (!config.enable_standard_card_fiels) {
          paypalScript += '&disable-funding=card';
        }
        if (config.paypal_debug) {
          paypalScript += '&debug=true';
        }
      } else {
        // https://developer.paypal.com/docs/archive/checkout/integrate/
        paypalScript = 'https://www.paypalobjects.com/api/checkout.js';
      }
    } else {
      // https://developer.paypal.com
      // /docs/integration/paypal-plus/mexico-brazil/integrate-a-payment-selection-page/
      paypalScript = 'https://www.paypalobjects.com/webstatic/ppplusdcc/ppplusdcc.min.js';
    }
    jsClient.script_uri = paypalScript;

    if (!paypalPayment && (paypalPlus || !enableNewSpb) && params.can_fetch_when_selected) {
      // refetch for JS Client with onload expression (and Payment ID) when payment selected
      paymentGateway.fetch_when_selected = true;
      delete jsClient.onload_expression;
    } else {
      // setup global variables on client for onload expression
      let onloadExpression = `window._paypalEnv="${paypalEnv}";window._paypalLocale="${paypalLocale}";`;
      if (paypalPayment) {
        // payment request ID and approval URL for PayPal Plus
        // https://developer.paypal.com/docs/integration/paypal-plus/mexico-brazil/create-a-payment-request/
        onloadExpression += `window._paypalPaymentId="${paypalPayment.id}";`
          + `window._paypalInvoiceNumber="${paypalPayment.transactions[0].invoice_number}";`;
        if (Array.isArray(paypalPayment.links)) {
          const linkObj = paypalPayment.links.find(({ rel }) => rel === 'approval_url');
          if (linkObj) {
            onloadExpression += `window._paypalApprovalUrl="${linkObj.href}";`;
          }
        }
      }
      if (config.enable_standard_card_fiels) {
        // https://developer.paypal.com/docs/checkout/integration-features/standard-card-fields/
        // standard card fields is disabled by default due to bugs (BR only ?)
        onloadExpression += 'window._paypalStCardFields=true;';
      }
      if (config.disable_remembered_cards) {
        onloadExpression += 'window._paypalDisallowRemembered=true;';
      }

      // add order amount on JS expression
      const paypalOrder = {};
      if (amount.total) {
        paypalOrder.purchase_units = [{
          amount: {
            value: amount.total.toFixed(2),
          },
        }];
      }
      jsClient.onload_expression = onloadExpression
        + `window._paypalOrderObj=${JSON.stringify(paypalOrder)};`
        + jsClient.onload_expression;
    }
  };

  try {
    // eslint-disable-next-line no-async-promise-executor
    await new Promise(async (resolve, reject) => {
      if (
        params.customer && params.items && !params.is_checkout_confirmation
        && (params.payment_method || !params.can_fetch_when_selected)
      ) {
        if (config.enable_paypal_plus || !enableNewSpb) {
          // prevent list payments timeout
          let skip = false;
          const timeout = setTimeout(() => {
            skip = true;
            resolve();
          }, 8000);

          // start PayPal integration flux creating payment request
          await setupPaypalPayment()
            .catch((err) => {
              if (err.response && err.response.httpStatusCode === 401) {
                // invalid PayPal credentials
                reject(err);
              }
            })
            .finally(() => {
              if (!skip) {
                clearTimeout(timeout);
                resolve();
              }
            });
        }
      }
      resolve();
    });

    if (!config.disable_spb || !config.enable_paypal_plus) {
      // common PayPal SPB payment
      addPaymentGateway();
    }
    if (config.enable_paypal_plus) {
      // also add payment gateway for PayPal Plus
      addPaymentGateway(true);
    }
    if (response.payment_gateways.length > 1 && params.lang === 'pt_br') {
      // prevent two payment methods with same icon for credit card
      response.payment_gateways[1].icon = 'https://www.paypalobjects.com/webstatic/pt_PT/mktg/logo-center/bdg_secured_by_pp_pt.png';
    }
    // finally send success response
    return response;
  } catch (err) {
    const { message } = err;

    return responseError(
      err.response.httpStatusCode || 400,
      'UNABLE_TO_LIST_PAYMENTS',
      (err.response && err.response.error_description) || message,
    );
  }
};
