import type {
  AppModuleBody,
  CreateTransactionParams,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import addInstallments from './functions-lib/add-installments';
import parseStatus from './functions-lib/parse-status-to-ecom';

type To = Exclude<CreateTransactionParams['to'], undefined>

const parseAddress = (to: To) => ({
  street: to.street,
  neighborhood: to.borough,
  city: to.city,
  state: to.province || to.province_code,
  country: to.country_code ? to.country_code.toLowerCase() : 'br',
  zipcode: to.zip,
  street_number: String(to.number) || 's/n',
  complementary: to.complement || undefined,
});

export default async (appData: AppModuleBody) => {
  const locationId = config.get().httpsFunctionOptions.region;
  const baseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;

  const { application, storeId } = appData;
  const params = appData.params as CreateTransactionParams;
  // app configured options
  const configApp = { ...application.data, ...application.hidden_data };
  const notificationUrl = `${baseUri}/pagarme-webhook`;

  const orderId = params.order_id;
  const {
    amount,
    buyer,
    payer,
    to,
    items,
  } = params;
  logger.log('>(App:PagarMe) Transaction #', orderId);

  // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
  const transaction: CreateTransactionResponse['transaction'] = {
    amount: amount.total,
  };

  const paymentMethod = params.payment_method.code;
  const methodConfig = configApp[paymentMethod] || {};
  const isPix = paymentMethod === 'account_deposit';
  const isCreditCard = paymentMethod === 'credit_card';

  let { label } = methodConfig;
  if (!label) {
    if (isCreditCard) {
      label = 'Cartão de crédito';
    } else {
      label = !isPix ? 'Boleto bancário' : 'Pix';
    }
  }

  // https://docs.pagar.me/docs/realizando-uma-transacao-de-cartao-de-credito
  // https://docs.pagar.me/docs/realizando-uma-transacao-de-boleto-bancario
  let pagarmeTransaction: { [key: string]: any };

  if (isCreditCard) {
    let installmentsNumber = params.installments_number;
    let finalAmount = amount.total;
    if (installmentsNumber && installmentsNumber > 1) {
      if (configApp.installments) {
        // list all installment options
        const { gateway } = addInstallments(
          amount.total,
          configApp.installments,
          {
            label,
            payment_method: params.payment_method,
          },
        );
        const installmentOption = gateway.installment_options
          && gateway.installment_options.find(({ number }) => number === installmentsNumber);
        if (installmentOption) {
          transaction.installments = installmentOption;
          finalAmount = installmentOption.number * installmentOption.value;
          transaction.installments.total = finalAmount;
        } else {
          installmentsNumber = 1;
        }
      }
    }

    pagarmeTransaction = {
      payment_method: 'credit_card',
      amount: Math.floor(finalAmount * 100),
      installments: installmentsNumber,
      card_hash: params.credit_card && params.credit_card.hash,
    };
  } else if (params.payment_method.code === 'account_deposit') {
    const finalAmount = amount.total;
    const pixConfig = configApp.account_deposit;
    const dueTime = pixConfig.due_time || 60;
    const date = new Date();
    date.setTime(date.getTime() + dueTime * 60000);
    pagarmeTransaction = {
      payment_method: 'pix',
      amount: Math.floor(finalAmount * 100),
      pix_expiration_date: date.toISOString(),
    };
  } else {
    // banking billet
    transaction.banking_billet = {};
    pagarmeTransaction = {
      payment_method: 'boleto',
      async: false,
      amount: Math.floor(amount.total * 100),
    };

    const boleto = configApp.banking_billet;
    if (boleto) {
      if (boleto.instructions) {
        pagarmeTransaction.boleto_instructions = boleto.instructions
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .substr(0, 255);
        transaction.banking_billet.text_lines = [pagarmeTransaction.boleto_instructions];
      }
      if (boleto.days_due_date) {
        const date = new Date();
        date.setDate(date.getDate() + boleto.days_due_date);
        const parseDatePagarme = (ms) => {
          const timeMs = ms.getTime() - (180000 * 60);
          const newDate = new Date(timeMs);
          const pad = (n) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
          return date.getFullYear()
            + '-' + pad(newDate.getMonth() + 1)
            + '-' + pad(newDate.getDate());
        };
        const stringDate = parseDatePagarme(date);
        pagarmeTransaction.boleto_expiration_date = stringDate;
      }
    }
  }

  if (!process.env.PAGARME_TOKEN) {
    const pagarmeToken = configApp.pagarme_api_key;
    if (typeof pagarmeToken === 'string' && pagarmeToken) {
      process.env.PAGARME_TOKEN = pagarmeToken;
    } else {
      logger.warn('Missing PagarMe API token');
    }
  }

  pagarmeTransaction.api_key = process.env.PAGARME_TOKEN;
  pagarmeTransaction.postback_url = notificationUrl;
  pagarmeTransaction.soft_descriptor = (configApp.soft_descriptor
    || `${params.domain}_PagarMe`).substring(0, 13);
  pagarmeTransaction.metadata = {
    order_number: params.order_number,
    store_id: storeId,
    order_id: orderId,
    platform_integration: 'ecomplus',
  };
  if (process.env.PAGARME_PARTNER_ID) {
    pagarmeTransaction.service_referer_name = process.env.PAGARME_PARTNER_ID;
  }

  pagarmeTransaction.customer = {
    email: buyer.email,
    name: buyer.fullname,
    external_id: buyer.customer_id,
    type: buyer.registry_type === 'j' ? 'corporation' : 'individual',
    country: (buyer.doc_country || 'BR').toLowerCase(),
    phone_numbers: [`+${(buyer.phone.country_code || '55')}${buyer.phone.number}`],
    documents: [{
      type: buyer.registry_type === 'j' ? 'cnpj' : 'cpf',
      number: buyer.doc_number,
    }],
  };
  const birthDate = buyer.birth_date;
  if (birthDate && birthDate.year && birthDate.day && birthDate.month) {
    pagarmeTransaction.customer.birthday = `${birthDate.year}-`
      + `${birthDate.month.toString().padStart(2, '0')}-${birthDate.day.toString().padStart(2, '0')}`;
  }

  if (to && to.street) {
    pagarmeTransaction.shipping = {
      name: to.name || buyer.fullname,
      fee: Math.floor((amount.freight || 0) * 100),
      address: parseAddress(to),
    };
    pagarmeTransaction.billing = {
      name: (payer || buyer).fullname,
      address: params.billing_address
        ? parseAddress(params.billing_address)
        : pagarmeTransaction.shipping.address,
    };
  } else if (params.billing_address) {
    pagarmeTransaction.billing = {
      name: (payer || buyer).fullname,
      address: parseAddress(params.billing_address),
    };
  }

  pagarmeTransaction.items = [];
  items.forEach((item) => {
    if (item.quantity > 0) {
      pagarmeTransaction.items.push({
        id: item.sku || item.variation_id || item.product_id,
        title: item.name || item.sku,
        unit_price: Math.floor((item.final_price || item.price) * 100),
        quantity: item.quantity,
        tangible: Boolean(to && to.street),
      });
    }
  });

  try {
    // https://docs.pagar.me/reference#criar-transacao
    const { data } = await axios({
      url: 'https://api.pagar.me/1/transactions',
      method: 'post',
      data: pagarmeTransaction,
    });

    if (data) {
      if (data.authorized_amount) {
        transaction.amount = data.authorized_amount / 100;
      } else if (data.amount) {
        transaction.amount = data.amount / 100;
      }
      const paymentMethodPagarMe = data.payment_method === 'pix'
        ? 'account_deposit'
        : data.payment_method;
      transaction.intermediator = {
        payment_method: {
          code: paymentMethodPagarMe || params.payment_method.code,
        },
      };
      [
        ['id', 'transaction_id'],
        ['tid', 'transaction_code'],
        ['reference_key', 'transaction_reference'],
      ].forEach(([dataField, transactionField]) => {
        if (data[dataField] && transaction.intermediator) {
          transaction.intermediator[transactionField] = String(data[dataField]);
        }
      });
      if (data.customer && data.customer.id) {
        transaction.intermediator.buyer_id = String(data.customer.id);
      }

      if (transaction.banking_billet) {
        if (data.boleto_barcode) {
          transaction.banking_billet.code = data.boleto_barcode;
        }
        if (data.boleto_url && transaction.banking_billet.link) {
          transaction.banking_billet.link = data.boleto_url;
          transaction.payment_link = transaction.banking_billet.link;
        }
        if (data.boleto_expiration_date) {
          transaction.banking_billet.valid_thru = new Date(data.boleto_expiration_date)
            .toISOString();
        }
      } else if (data.card) {
        transaction.credit_card = {
          holder_name: data.card.holder_name,
          last_digits: data.card.last_digits,
          company: data.card.brand,
          token: data.card.fingerprint,
        };
      } else if (paymentMethodPagarMe === 'account_deposit') {
        const qrCode = data.pix_qr_code;
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

      return {
        status: 200,
        redirect_to_payment: false,
        transaction,
      };
    }
    return {
      status: 409,
      message: `PAGARME_TRANSACTION_ERR Order: #${orderId} => Pagar.Me not response`,
    };
  } catch (error: any) {
    logger.error('(App:PagarMe) =>', error);
    let { message } = error;
    //
    const err = {
      message: `PAGARME_TRANSACTION_ERR Order: #${orderId} => ${message}`,
      payment: '',
      status: 0,
      response: '',
    };
    let errCode = 'PAGARME_TRANSACTION_ERR_';

    if (error.response) {
      const { status, data } = error.response;
      if (status !== 401 && status !== 403) {
        err.payment = JSON.stringify(pagarmeTransaction);
        errCode += status;
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
      status: 409,
      error: errCode,
      message,
    };
  }
};
