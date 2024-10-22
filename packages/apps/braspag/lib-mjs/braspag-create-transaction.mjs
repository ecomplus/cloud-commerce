import config, { logger } from '@cloudcommerce/firebase/lib/config';
import { getFirestore } from 'firebase-admin/firestore';
import createAxios from './lib/braspag/create-axios.mjs';
import { parseStatus } from './lib/braspag/parse-utils.mjs';
import bodyToBraspag from './lib/braspag/payload-to-transaction.mjs';
import addInstallments from './lib/payments/add-installments.mjs';

const createTransaction = async ({ params, application }) => {
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  const locationId = config.get().httpsFunctionOptions.region;
  const baseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;
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

  const { amount } = params;
  const transaction = { amount: amount.total };
  const timeout = 28000;
  const db = getFirestore();
  const docSOP = db.doc(`braspagAdmin/sop_${process.env.BRASPAG_CLIENT_ID}`);
  const orderId = params.order_id;
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
  const methodPayment = params.payment_method.code;
  const isSimulated = (methodPayment === 'credit_card' || methodPayment === 'banking_billet')
    && appData[methodPayment]?.provider === 'Simulado';

  try {
    const appName = process.env.BRASPAG_API_TYPE;
    const appAxios = createAxios(false, isSimulated);
    const body = bodyToBraspag(appData, orderId, params, methodPayment);
    logger.info(`>> body ${appName} ${orderId}`, { body });
    const { data } = await appAxios.post('/sales', body, { timeout });
    logger.info(`>> data ${appName} ${orderId}`, { data });

    const payment = data.Payment;
    const intermediator = {};

    if (!payment || payment.Status === 0) {
      const errorBraspag = new Error('Braspag API Error');
      const method = methodPayment === 'account_deposit'
        ? 'PIX'
        : methodPayment.replace('_', ' ');
      errorBraspag.message = `Braspag API is unable to generate payment with ${method}`;
      throw errorBraspag;
    }
    const status = parseStatus[payment.Status];

    if (methodPayment === 'credit_card') {
      // delete docSop can only be used once
      if (docSOP) {
        await docSOP.delete()
          .catch(logger.error);
      }
      intermediator.transaction_id = payment.PaymentId;
      intermediator.transaction_reference = payment.ProofOfSale;
      intermediator.transaction_code = payment.AcquirerTransactionId;
      // `${payment.AuthorizationCode}`

      if (payment.CreditCard?.Brand) {
        transaction.credit_card = {
          company: payment.CreditCard?.Brand,
        };
      }

      if (appData.installments) {
        const installmentsNumber = params.installments_number || 1;
        // list all installment options
        const { gateway } = addInstallments(amount.total, appData.installments);
        const installmentOption = gateway.installment_options
          && gateway.installment_options.find(({ number }) => number === installmentsNumber);

        if (installmentOption) {
          transaction.installments = installmentOption;
        }
      }

      transaction.status = {
        current: status || 'unknown',
        updated_at: payment.CapturedDate
          ? new Date(`${payment.CapturedDate} UTC+0`).toISOString()
          : new Date().toISOString(),
      };
    } else if (methodPayment === 'banking_billet') {
      transaction.banking_billet = {
        code: payment.DigitableLine,
        valid_thru: new Date(payment.ExpirationDate).toISOString(),
        link: payment.Url,
      };

      transaction.payment_link = payment.Url;

      intermediator.transaction_id = payment.PaymentId;
      intermediator.transaction_reference = payment.BoletoNumber;
      // transaction_code: data.retorno

      transaction.status = {
        current: 'pending',
        updated_at: new Date().toISOString(),
      };
    } else {
      intermediator.transaction_id = payment.PaymentId;
      intermediator.transaction_reference = payment.ProofOfSale;
      intermediator.transaction_code = payment.AcquirerTransactionId;

      const qrCodeBase64 = payment?.QrCodeBase64Image;
      const qrCode = payment?.QrCodeString;

      if (qrCodeBase64) {
        await db.doc(`braspagQrCode/${orderId}`).set({ qrCode: qrCodeBase64 })
          .catch(logger.error);

        const qrCodeSrc = `${baseUri}/braspag-qr-code?orderId=${orderId}`;
        transaction.notes = '<div style="display:block;margin:0 auto"> '
          + `<img src="${qrCodeSrc}" style="display:block;margin:0 auto; width:150px;"> `
          + `<input readonly type="text" id="pix-copy" value="${qrCode}" />`
          + '<button type="button" class="btn btn-sm btn-light" onclick="'
            + 'let codePix = document.getElementById(\'pix-copy\');'
            + 'codePix.select();'
            + 'document.execCommand(\'copy\');'
          + '">Copiar Pix</button></div>';
      }

      transaction.status = {
        current: 'pending',
        updated_at: new Date().toISOString(),
      };
    }

    transaction.intermediator = intermediator;

    return {
      redirect_to_payment: false,
      transaction,
    };
  } catch (error) {
    if (docSOP) {
      // delete docSop can only be used once
      await docSOP.delete().catch(logger.error);
    }
    // try to debug request error
    const errCode = 'BRASPAG_TRANSACTION_ERR';
    let { message } = error;
    const err = new Error(`${errCode} ${orderId} => ${message}`);
    if (error.code && error.code === 'ECONNABORTED' && message.includes('timeout')) {
      message = 'Braspag API timed out trying to create the transaction';
    } else if (error.response) {
      logger.warn(error.response);
      const { status, data } = error.response;
      if (status !== 401 && status !== 403) {
        err.payment = JSON.stringify(transaction);
        err.status = status;
        if (typeof data === 'object' && data) {
          err.response = JSON.stringify(data);
        } else {
          err.response = data;
        }
      } else if (data && Array.isArray(data.errors) && data.errors[0] && data.errors[0].message) {
        message = data.errors[0].message;
      }
    } else {
      logger.error(err);
    }

    return {
      status: 409,
      error: errCode,
      message,
    };
  }
};

export default createTransaction;
