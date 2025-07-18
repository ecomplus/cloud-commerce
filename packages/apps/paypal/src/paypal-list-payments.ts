import type { AppModuleBody, ListPaymentsResponse } from '@cloudcommerce/types';
import type { AxiosError } from 'axios';
import * as path from 'node:path';
import * as fs from 'node:fs';
import url from 'node:url';
import { getFirestore } from 'firebase-admin/firestore';
import { logger } from '@cloudcommerce/firebase/lib/config';
import parseToPaypalPayment from './util/parse-to-paypal-payment';
import {
  createPaypalProfile,
  createPaypalWebhook,
  createPaypalPayment,
} from './util/paypal-api';

type PaymentGateway = ListPaymentsResponse['payment_gateways'][number]

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

export const paypalListPayments = async (modBody: AppModuleBody<'list_payments'>) => {
  const {
    application,
    params,
  } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.paypal_client_id) {
    process.env.PAYPAL_CLIENT_ID = appData.paypal_client_id;
  }
  if (appData.paypal_secret) {
    process.env.PAYPAL_CLIENT_SECRET = appData.paypal_secret;
  }
  process.env.PAYPAL_ENV = appData.paypal_sandbox
    ? 'sandbox'
    : process.env.PAYPAL_ENV || 'live';
  const {
    PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET,
    PAYPAL_ENV,
  } = process.env;
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    return {
      error: 'NO_PAYPAL_KEYS',
      message: 'Client ID ou Secret não configurado (lojista deve configurar o aplicativo)',
    };
  }

  const {
    lang = 'pt_br',
    amount = { total: 0 },
  } = params;
  const response: ListPaymentsResponse = {
    payment_gateways: [],
  };

  const { discount } = appData;
  if (discount && discount.value > 0) {
    if (discount.apply_at !== 'freight') {
      const { value } = discount;
      response.discount_option = {
        label: appData.discount_option_label,
        value,
      };
      ['type', 'min_amount'].forEach((prop) => {
        if (discount[prop]) {
          response.discount_option![prop] = discount[prop];
        }
      });
    }
    if (amount.total) {
      if (amount.total < discount.min_amount) {
        discount.value = 0;
      } else {
        delete discount.min_amount;
        const maxDiscount = amount[discount.apply_at || 'subtotal'];
        let discountValue: number | undefined;
        if (discount.type === 'percentage') {
          discountValue = maxDiscount * (discount.value / 100);
        } else {
          discountValue = discount.value;
          if (discountValue && discountValue > maxDiscount) {
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

  let paypalPayment: Record<string, any> | undefined;
  try {
    if (
      params.customer && params.items && !params.is_checkout_confirmation
      && (params.payment_method || !params.can_fetch_when_selected)
    ) {
      try {
        const docRef = getFirestore().doc(`paypalProfiles/${PAYPAL_CLIENT_ID}`);
        if (!(await docRef.get()).exists) {
          await createPaypalWebhook();
          const paypalProfile = await createPaypalProfile();
          if (paypalProfile) {
            await docRef.set(paypalProfile);
          }
        }
        paypalPayment = await createPaypalPayment(parseToPaypalPayment(params));
      } catch (_err: any) {
        const err = _err as AxiosError;
        if (err.response?.status === 401) {
          throw err;
        }
        logger.warn('PalPal setup failing', {
          url: err.config?.url,
          request: err.config?.data,
          response: err.response?.data,
          status: err.response?.status,
        });
        logger.error(err);
      }
    }
  } catch (_err: any) {
    const err = _err as AxiosError;
    return {
      status: err.response?.status || 400,
      error: 'PAYPAL_SETUP_ERROR',
      message: ((err.response?.data as any)?.error_description) || err.message,
    };
  }

  const addPaymentGateway = () => {
    const label = lang === 'pt_br' ? 'Cartão de crédito' : 'Credit card';
    const iconSrc = 'https://paypal.ecomplus.biz/assets/paypal-plus/icon.png';
    const paymentGateway: PaymentGateway = {
      label,
      payment_method: {
        code: 'credit_card' as const,
        name: label,
      },
      intermediator: {
        name: 'PayPal',
        link: 'https://www.paypal.com/',
        code: 'paypal',
      },
      icon: iconSrc,
      js_client: {
        onload_expression: fs.readFileSync(
          path.join(__dirname, '../assets/onload-expression.min.js'),
          'utf8',
        ),
        container_html: '<div id="pppLoading" class="p-2">'
          + '<div class="spinner-border" role="status">'
          + '<span class="sr-only">Loading...</span></div></div>'
          + '<div id="ppplus"></div>'
          + '<button class="btn btn-success btn-lg btn-block" type="submit" id="pppContinue" '
          + 'onclick="_pppApp.doContinue(); return false;"> '
          + '<i class="fas fa-lock mr-1"></i> '
          + `${(lang === 'pt_br' ? 'Finalizar compra' : 'Checkout')} </button>`,
        transaction_promise: '_pppContinue',
        script_uri: 'https://www.paypalobjects.com/webstatic/ppplusdcc/ppplusdcc.min.js',
      },
    };
    if (
      params.payment_method
      && params.payment_method?.code !== paymentGateway.payment_method.code
    ) {
      return;
    }
    response.payment_gateways.unshift(paymentGateway);
    ['label', 'text', 'icon'].forEach((prop) => {
      if (appData[prop]) {
        paymentGateway[prop] = appData[prop];
      }
    });
    if (appData.ppp_label) {
      paymentGateway.label = appData.ppp_label;
    }
    if (discount && discount.value > 0) {
      paymentGateway.discount = discount;
      if (response.discount_option && !response.discount_option.label) {
        response.discount_option.label = paymentGateway.label;
      }
    }
    const installmentsOption = appData.installments_option;
    if (installmentsOption && installmentsOption.max_number) {
      response.installments_option = installmentsOption;
      if (amount.total) {
        paymentGateway.installment_options = [];
        const minInstallment = installmentsOption.min_installment || 5;
        for (let number = 2; number <= installmentsOption.max_number; number++) {
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
    const jsClient = paymentGateway.js_client!;
    const locales = lang.split('_');
    const paypalLocale = `${locales[0]}_${(locales[1] || locales[0]).toUpperCase()}`;
    if (!paypalPayment && params.can_fetch_when_selected) {
      // Refetch for JS Client with onload expression (and Payment ID) when payment selected
      paymentGateway.fetch_when_selected = true;
      delete jsClient.onload_expression;
    } else {
      let onloadExpression = `window._paypalEnv="${PAYPAL_ENV}";`
        + `window._paypalLocale="${paypalLocale}";`;
      if (paypalPayment) {
        // Payment request ID and approval URL for PayPal Plus
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
      if (appData.disable_remembered_cards) {
        onloadExpression += 'window._paypalDisallowRemembered=true;';
      }
      const paypalOrder: Record<string, any> = {};
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
  addPaymentGateway();

  return response;
};

export default paypalListPayments;
