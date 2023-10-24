import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import { getFirestore } from 'firebase-admin/firestore';
import { createSubscription, createPayment } from './functions-lib/pagarme/payment-subscription.mjs';
import { getPlanInTransction } from './functions-lib/pagarme/handle-plans.mjs';
import { parserInvoiceStatusToEcom, parseAddress } from './functions-lib/pagarme/parses-utils.mjs';
import axios from './functions-lib/pagarme/create-axios.mjs';

export default async (appData) => {
  const colletionFirebase = getFirestore().collection('pagarmeV5Subscriptions');

  const { params, application } = appData;

  const configApp = { ...application.data, ...application.hidden_data };

  if (!process.env.PAGARMEV5_API_TOKEN) {
    const pagarmeApiToken = configApp.pagarme_api_token;
    if (pagarmeApiToken && typeof pagarmeApiToken === 'string') {
      process.env.PAGARMEV5_API_TOKEN = pagarmeApiToken;
    } else {
      logger.warn('Missing PAGARMEV5 API TOKEN');
    }
  }

  const pagarmeAxios = axios(process.env.PAGARMEV5_API_TOKEN);
  const { storeId } = config.get();

  const orderId = params.order_id;

  const { amount, to, buyer } = params;
  logger.log(`[PagarMe V5] Transaction #${orderId}`);
  logger.log(`[PagarMe V5] Type transaction ${params.type}`);

  const paymentMethod = params.payment_method.code;

  const transaction = {
    amount: amount.total,
  };

  const isRecurrence = params.type === 'recurrence';
  let subscriptionPagarmeId;
  let address;

  if (to && to.street) {
    address = parseAddress(to);
  } else if (params.billing_address) {
    address = parseAddress(params.billing_address);
  }

  let redirectToPayment = false;
  try {
    const pagarMeCustomer = {
      name: buyer.fullname,
      type: buyer.registry_type === 'j' ? 'company' : 'individual',
      email: buyer.email,
      code: buyer.customer_id,
      document: buyer.doc_number,
      document_type: buyer.registry_type === 'j' ? 'cnpj' : 'cpf',
      address,
      phones: {
        [`${buyer.phone.type === 'personal' ? 'mobile_phone' : 'home_phone'}`]: {
          country_code: `${(buyer.phone.country_code || 55)}`,
          area_code: (buyer.phone.number).substring(0, 2),
          number: (buyer.phone.number).substring(2),
        },
      },
    };
    const birthDate = buyer.birth_date;
    if (birthDate && birthDate.year && birthDate.day) {
      pagarMeCustomer.birthday = `${birthDate.year}-`
        + `${birthDate.month.toString().padStart(2, '0')}-`
        + birthDate.day.toString().padStart(2, '0');
    }

    if (isRecurrence) {
      const methodConfigName = params.payment_method.code === 'credit_card' ? configApp.credit_card.label : configApp.banking_billet.label;
      let labelPaymentGateway = params.payment_method.name.replace('- Pagar.me', '');
      labelPaymentGateway = labelPaymentGateway.replace(methodConfigName, '');

      const plan = getPlanInTransction(labelPaymentGateway, configApp.recurrence);
      const { data: subcription } = await createSubscription(
        params,
        configApp,
        storeId,
        plan,
        pagarMeCustomer,
      );
      logger.log(`[PagarMe V5] Response: ${JSON.stringify(subcription)}`);
      subscriptionPagarmeId = subcription.id;
      // /invoices
      const { data: { data: invoices } } = await pagarmeAxios.get(`/invoices?subscription_id=${subscriptionPagarmeId}`);
      logger.log(`[PagarMe V5] Invoices: ${JSON.stringify(invoices)}`);

      const { data: charge } = await pagarmeAxios.get(`/charges/${invoices[0].charge.id}`);

      logger.log(`[PagarMe V5] Charge: ${JSON.stringify(charge)}`);
      const transactionPagarme = charge.last_transaction;

      transaction.status = {
        updated_at: invoices[0].created_at || new Date().toISOString(),
        current: parserInvoiceStatusToEcom(invoices[0].status),
      };

      transaction.intermediator = {
        transaction_id: invoices[0].id,
        transaction_code: `${transactionPagarme.acquirer_auth_code || ''}`,
        transaction_reference: `${transactionPagarme.acquirer_tid || ''}`,
      };

      if (paymentMethod === 'banking_billet') {
        transaction.banking_billet = {
          // code: charge.last_transaction.barcode,
          valid_thrud: charge.last_transaction.due_at,
          link: charge.last_transaction.pdf,
        };
        transaction.payment_link = charge.last_transaction.url;
        redirectToPayment = true;
      }
      // console.log('>> transaction ', JSON.stringify(transaction))
      await colletionFirebase.doc(orderId)
        .set({
          status: subcription.status,
          orderNumber: params.order_number,
          created_at: new Date().toISOString(),
          plan,
          subscriptionPagarmeId,
          invoicePagarmeId: invoices[0].id,
          changePagarmeId: charge.id,
          items: subcription.items,
          amount,
        })
        .catch(logger.error);

      // logger.log('[PagarMe V5] Save Firebase');
    } else {
      // type payment
      const { data: payment } = await createPayment(params, configApp, pagarMeCustomer);
      logger.log(`[PagarMe V5] Response: ${JSON.stringify(payment)}`);
      const [charge] = payment.charges;

      const transactionPagarme = charge.last_transaction;

      transaction.status = {
        updated_at: charge.created_at || new Date().toISOString(),
        current: parserInvoiceStatusToEcom(charge.status),
      };

      transaction.intermediator = {
        transaction_id: payment.id,
        transaction_code: `${transactionPagarme.acquirer_auth_code || ''}`,
        transaction_reference: `${transactionPagarme.acquirer_tid || ''}`,
      };

      if (paymentMethod === 'account_deposit') {
        let notes = '<div style="display:block;margin:0 auto"> ';
        notes += `<img src="${transactionPagarme.qr_code_url}" style="display:block;margin:0 auto"> `;
        notes += '</div>';
        transaction.notes = notes;
        if (transactionPagarme.qr_code) {
          transaction.intermediator.transaction_code = transactionPagarme.qr_code;
        }
        if (transactionPagarme.expires_at) {
          transaction.account_deposit = {
            valid_thru: transactionPagarme.expires_at,
          };
        }
      } else if (paymentMethod === 'banking_billet') {
        transaction.banking_billet = {
          // code: charge.last_transaction.barcode,
          valid_thrud: charge.last_transaction.due_at,
          link: charge.last_transaction.pdf,
        };
        transaction.payment_link = charge.last_transaction.url;
        redirectToPayment = true;
      }
    }

    return {
      redirect_to_payment: redirectToPayment,
      transaction,
    };
  } catch (error) {
    logger.error(error);
    // try to debug request error
    const errCode = isRecurrence ? 'PAGARME_SUBSCRIPTION_ERR' : 'PAGARME_TRANSACTION_ERR';
    let { message } = error;
    const err = new Error(`${errCode}- ${orderId} => ${message}`);
    if (error.response) {
      const { status, data } = error.response;
      if (status !== 401 && status !== 403) {
        // err.payment = JSON.stringify(pagarmeTransaction)
        err.status = status;
        if (typeof data === 'object' && data) {
          err.response = JSON.stringify(data);
        } else {
          err.response = data;
        }
      } else if (data && Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) {
        message = data.errors[0].message;
      }
    }
    // logger.error(err);
    return {
      error: errCode,
      message,
    };
  }
};
