import logger from 'firebase-functions/logger';
// import { getFirestore } from 'firebase-admin';
import bodyBraspag from './functions-lib/braspag/payload-to-transaction.mjs';
import axiosBraspag from './functions-lib/braspag/create-axios.mjs';
import { parseStatus } from './functions-lib/braspag/parsers.mjs';

export default async (configApp) => {
  const { application, params } = configApp;

  const appData = {
    ...application.data,
    ...application.hidden_data,
  };

  const { amount } = params;
  const transaction = {
    amount: amount.total,
  };

  // indicates whether the buyer should be redirected to payment link right after checkout
  const redirectToPayment = false;

  const orderId = params.order_id;

  const { merchant_id: merchantId, merchant_key: merchantKey } = appData;
  const methodPayment = params.payment_method.code;

  try {
    const braspagAxios = axiosBraspag(merchantId, merchantKey);
    const body = bodyBraspag(appData, orderId, params, methodPayment);
    logger.log('[Braspag] body ', JSON.stringify(body));
    const { data } = await braspagAxios.post('/sales', body);
    logger.log('>> data ', JSON.stringify(data));

    const payment = data.Payment;
    const intermediator = {};

    if (methodPayment === 'credit_card') {
      intermediator.transaction_id = payment.PaymentId;
      intermediator.transaction_reference = payment.ProofOfSale;
      intermediator.transaction_code = payment.AcquirerTransactionId;
      // `${payment.AuthorizationCode}`

      transaction.status = {
        current: parseStatus[payment.Status] || 'unknown',
        updated_at: payment.CapturedDate ? new Date(`${payment.CapturedDate} UTC+0`).toISOString() : new Date().toISOString(),
      };
    } else if (methodPayment === 'banking_billet') {
      transaction.banking_billet = {
        code: payment.DigitableLine,
        valid_thru: new Date(payment.ExpirationDate).toISOString(),
        link: payment.Url,
      };

      intermediator.transaction_id = payment.PaymentId;
      intermediator.transaction_reference = payment.BoletoNumber;
      // transaction_code: data.retorno

      transaction.status = {
        current: 'pending',
        updated_at: new Date().toISOString(),
      };
    } /* else {
      intermediator.transaction_id = payment.PaymentId;
      intermediator.transaction_reference = payment.ProofOfSale;
      intermediator.transaction_code = payment.AcquirerTransactionId;

      const qrCodeBase64 = payment.QrCodeBase64Image;
      const qrCode = payment.QrCodeString;

      const collectionQrCode = getFirestore().collection('qr_code_braspag');
      await collectionQrCode.doc(orderId).set({ qrCode: qrCodeBase64 });

      const qrCodeSrc = `${baseUri}/qr-code?orderId=${orderId}`;

      transaction.notes = '<div style="display:block;margin:0 auto"> '
        + `<img src="${qrCodeSrc}" style="display:block;margin:0 auto; width:150px;"> `
        + `<input readonly type="text" id="pix-copy" value="${qrCode}" />`
        + `<button type="button" class="btn btn-sm btn-light" onclick="
        let codePix = document.getElementById('pix-copy')
          codePix.select()
          document.execCommand('copy')">Copiar Pix</button></div>`;

      transaction.status = {
        current: 'pending',
        updated_at: new Date().toISOString(),
      };
    } */

    transaction.intermediator = intermediator;

    return {
      redirect_to_payment: redirectToPayment,
      transaction,
    };
  } catch (error) {
    logger.log(error.response);
    // try to debug request error
    const errCode = 'BRASPAG_TRANSACTION_ERR';
    let { message } = error;
    const err = new Error(`${errCode} - ${orderId} => ${message}`);
    if (error.response) {
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
    }
    logger.error(err);
    return {
      error: errCode,
      message,
    };
  }
};
