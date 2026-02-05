import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import { getFirestore } from 'firebase-admin/firestore';
import addInstallments from './functions-lib/payments/add-installments.mjs';
import { createSubscription, createPayment } from './functions-lib/pagarme/payment-subscription.mjs';
import { getPlanInTransction } from './functions-lib/pagarme/handle-plans.mjs';
import { parserInvoiceStatusToEcom, parseAddress } from './functions-lib/pagarme/parses-utils.mjs';
import axios from './functions-lib/pagarme/create-axios.mjs';

export default async (modBody) => {
  const colletionFirebase = getFirestore().collection('pagarmeV5Subscriptions');

  const { params, application } = modBody;

  const appData = { ...application.data, ...application.hidden_data };

  if (!process.env.PAGARMEV5_API_TOKEN) {
    const pagarmeApiToken = appData.pagarme_api_token;
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
  logger.info(`Transaction ${orderId} ${params.type}`);

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
      name: buyer.fullname?.substring(0, 64),
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
      const methodConfigName = params.payment_method.code === 'credit_card' ? appData.credit_card.label : appData.banking_billet.label;
      let labelPaymentGateway = params.payment_method.name.replace('- Pagar.me', '');
      labelPaymentGateway = labelPaymentGateway.replace(methodConfigName, '');

      const plan = getPlanInTransction(labelPaymentGateway, appData.recurrence);
      const { data: subcription } = await createSubscription(
        params,
        appData,
        storeId,
        plan,
        pagarMeCustomer,
      );
      subscriptionPagarmeId = subcription.id;
      logger.info(`Subscription ${subscriptionPagarmeId} for ${orderId}`, { subcription });
      const { data: { data: invoices } } = await pagarmeAxios.get(`/invoices?subscription_id=${subscriptionPagarmeId}`);
      const { data: charge } = await pagarmeAxios.get(`/charges/${invoices[0].charge.id}`);
      const transactionPagarme = charge.last_transaction;

      transaction.status = {
        updated_at: invoices[0].created_at || new Date().toISOString(),
        current: parserInvoiceStatusToEcom(invoices[0].status),
      };

      transaction.intermediator = {
        transaction_id: invoices[0].id,
        transaction_code: `${subscriptionPagarmeId || ''}`,
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
    } else {
      // type payment
      let installmentsNumber = params.installments_number;
      let finalAmount = amount.total;
      if (installmentsNumber > 1 && appData.installments) {
        // list all installment options
        const { gateway } = addInstallments(amount, appData.installments);
        const installmentOption = gateway.installment_options
          && gateway.installment_options.find(({ number }) => number === installmentsNumber);
        if (installmentOption) {
          transaction.installments = installmentOption;
          transaction.installments.total = installmentOption.number * installmentOption.value;
          finalAmount = transaction.installments.total;
        } else {
          installmentsNumber = 1;
        }
      }
      const { data: payment } = await createPayment({
        storeId,
        params,
        appData,
        customer: pagarMeCustomer,
        finalAmount,
        installmentsNumber,
      });
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
    logger.warn(`Failed transaction for ${orderId}`, {
      params,
      appData,
      body: error.config?.data,
      response: error.response?.data,
      status: error.response?.status,
    });
    logger.error(error);
    const errCode = isRecurrence ? 'PAGARMEV5_SUBSCRIPTION_ERR' : 'PAGARMEV5_TRANSACTION_ERR';
    let { message } = error;
    const err = new Error(`${errCode}- ${orderId} => ${message}`);
    if (error.response) {
      const { status, data } = error.response;
      if (status !== 401 && status !== 403) {
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
    return {
      error: errCode,
      message,
    };
  }
};
