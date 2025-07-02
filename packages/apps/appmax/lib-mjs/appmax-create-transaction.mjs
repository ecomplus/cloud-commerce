import { logger } from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import parseStatus from './lib/parse-status.mjs';
import getCustomer from './lib/appmax/get-customer.mjs';
import createOrder from './lib/appmax/create-order.mjs';
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
  const { APPMAX_TOKEN } = process.env;
  if (!APPMAX_TOKEN) {
    return {
      error: 'NO_APPMAX_KEYS',
      message: 'Chave de API e/ou criptografia não configurada (lojista deve configurar o aplicativo)',
    };
  }

  // https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
  const {
    order_id: orderId,
    amount,
    buyer,
    items,
  } = params;
  // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
  const transaction = {
    amount: amount.total,
  };

  const customerId = await getCustomer(
    buyer,
    params.to,
    items,
    params.browser_ip,
    params.utm,
    APPMAX_TOKEN,
  );
  const appmaxOrderId = await createOrder(
    items,
    amount,
    customerId,
    APPMAX_TOKEN,
  );
  const appmaxTransaction = {
    'access-token': APPMAX_TOKEN,
    'cart': {
      order_id: appmaxOrderId,
    },
    'customer': {
      customer_id: customerId,
    },
  };

  let appmaxBaseUri;
  if (params.payment_method.code === 'credit_card') {
    appmaxBaseUri = 'https://admin.appmax.com.br/api/v3/payment/credit-card';
    let installmentsNumber = params.installments_number;
    if (installmentsNumber > 1) {
      if (appData.installments) {
        // list all installment options
        const { gateway } = addInstallments(amount.total, appData.installments);
        const installmentOption = gateway.installment_options
          && gateway.installment_options.find(({ number }) => number === installmentsNumber);
        if (installmentOption) {
          transaction.installments = installmentOption;
          transaction.installments.total = installmentOption.number * installmentOption.value;
        } else {
          installmentsNumber = 1;
        }
      }
    }
    appmaxTransaction.payment = {
      CreditCard: {
        cvv: params.credit_card?.cvv,
        token: params.credit_card?.hash,
        document_number: buyer.doc_number.length > 11
          ? buyer.doc_number.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
          : buyer.doc_number.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
        installments: installmentsNumber,
        soft_descriptor: appData.soft_descriptor
          || (`${params.domain}_APPMAX`).substring(0, 13),
      },
    };
  } else if (params.payment_method.code === 'account_deposit') {
    appmaxBaseUri = 'https://admin.appmax.com.br/api/v3/payment/pix';
    const pixConfig = appData.account_deposit;
    const dueTime = pixConfig.due_time || 60;
    const currentDate = new Date();
    const timeZoneOffset = currentDate.getTimezoneOffset();
    const date = new Date(currentDate.getTime() + (dueTime * 60000) - (timeZoneOffset * 60000));
    appmaxTransaction.payment = {
      pix: {
        document_number: buyer.doc_number,
        expiration_date: date.toISOString().slice(0, 19).replace('T', ' '),
      },
    };
  } else {
    // banking billet
    appmaxBaseUri = 'https://admin.appmax.com.br/api/v3/payment/boleto';
    transaction.banking_billet = {};
    appmaxTransaction.payment = {
      Boleto: {
        document_number: buyer.doc_number,
      },
    };
    const boleto = appData.banking_billet;
    if (boleto) {
      if (boleto.instructions) {
        appmaxTransaction.boleto_instructions = boleto.instructions
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .substr(0, 255);
        transaction.banking_billet.text_lines = [appmaxTransaction.boleto_instructions];
      }
    }
  }

  if (!items.find(({ quantity }) => quantity)) {
    return {
      error: 'NO_APPMAX_ITEMS',
      message: 'Any item with quantity to proceed',
    };
  }

  try {
    const response = await axios({
      method: 'post',
      url: appmaxBaseUri,
      headers: { 'User-Agent': 'SEC07-Lintfr-VA3' },
      data: appmaxTransaction,
    });

    const data = response.data?.data;
    if (data && response.data.status === 200) {
      const paymentMethod = data.type === 'Boleto'
        ? 'banking_billet'
        : (data.type === 'CreditCard' && 'credit_card') || 'account_deposit';
      transaction.intermediator = {
        payment_method: {
          code: paymentMethod || params.payment_method.code,
        },
      };
      [
        ['pay_reference', 'transaction_code'],
        ['pay_reference', 'transaction_reference'],
      ].forEach(([dataField, transactionField]) => {
        if (data[dataField]) {
          transaction.intermediator[transactionField] = String(data[dataField]);
        }
      });
      transaction.intermediator.transaction_id = String(appmaxOrderId);
      transaction.intermediator.buyer_id = String(customerId);
      if (transaction.banking_billet) {
        if (data.boleto_payment_code) {
          transaction.banking_billet.code = data.boleto_payment_code;
        }
        if (data.pdf) {
          transaction.banking_billet.link = data.pdf;
          transaction.payment_link = data.pdf;
        }
        if (data.due_date) {
          transaction.banking_billet.valid_thru = new Date(data.due_date).toISOString();
        }
      } else if (data.upsell_hash && params.credit_card) {
        transaction.credit_card = {
          holder_name: params.credit_card.name,
          last_digits: params.credit_card.number?.slice(-4),
          token: params.credit_card.hash,
        };
      } else if (paymentMethod === 'account_deposit') {
        const qrCode = data.pix_emv;
        transaction.intermediator.transaction_code = qrCode;
        const qrCodeSrc = `https://gerarqrcodepix.com.br/api/v1?brcode=${qrCode}&tamanho=256`;
        transaction.notes = `<img src="${qrCodeSrc}" style="display:block;margin:0 auto">`;
        if (data.pix_expiration_date) {
          transaction.account_deposit = {
            valid_thru: new Date(data.pix_expiration_date).toISOString(),
          };
        }
      }
      transaction.status = {
        updated_at: data.date_created || data.date_updated || new Date().toISOString(),
        current: parseStatus(data.status),
      };
      return { transaction };
    }

    logger.warn(`Unexpected Appmax payment response for ${orderId}`, {
      statusCode: response.status,
      data,
      appmaxTransaction,
    });
    return {
      error: 'APPMAX_TRANSACTION_UNEXPECTED',
      message: `Received status ${response.status}/${response.data?.status}`,
    };
  } catch (error) {
    const { response } = error;
    if (
      response?.status === 400
      && params.payment_method.code === 'credit_card'
      && response.data?.text?.includes('autorizada')
    ) {
      transaction.intermediator = {
        payment_method: { code: params.payment_method.code },
      };
      transaction.status = {
        updated_at: new Date().toISOString(),
        current: 'unauthorized',
      };
      return { transaction };
    }

    logger.warn(`Transaction failed for ${orderId}`, {
      appmaxTransaction,
    });
    const errCode = 'APPMAX_TRANSACTION_ERR';
    let { message } = error;
    if (error.response) {
      const { status, data } = error.response;
      if (status !== 401 && status !== 403) {
        const err = new Error(`${errCode} - ${orderId} => ${message}`);
        err.payment = JSON.stringify(appmaxTransaction);
        err.status = status;
        if (typeof data === 'object' && data) {
          err.response = JSON.stringify(data);
        } else {
          err.response = data;
        }
        logger.error(err);
      } else if (Array.isArray(data?.errors) && data.errors[0]?.message) {
        message = data.errors[0].message;
      }
    }
    return {
      error: errCode,
      message,
    };
  }
};
