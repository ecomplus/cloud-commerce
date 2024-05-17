import type {
  AppModuleBody,
  CreateTransactionParams,
  CreateTransactionResponse,
} from '@cloudcommerce/types';
import { info, warn, error } from 'firebase-functions/logger';
import config from '@cloudcommerce/firebase/lib/config';
import axios from 'axios';
import { addInstallments, parsePagarmeStatus } from './pagarme-utils';

const parseAddress = (to: Exclude<CreateTransactionParams['to'], undefined>) => ({
  street: to.street,
  neighborhood: to.borough,
  city: to.city,
  state: to.province || to.province_code,
  country: to.country_code ? to.country_code.toLowerCase() : 'br',
  zipcode: to.zip,
  street_number: String(to.number) || 's/n',
  complementary: to.complement || undefined,
});

export default async (modBody: AppModuleBody<'create_transaction'>) => {
  const date = new Date();
  const locationId = config.get().httpsFunctionOptions.region;
  const baseUri = `https://${locationId}-${process.env.GCLOUD_PROJECT}.cloudfunctions.net`;
  const { application, storeId } = modBody;
  const params = modBody.params;
  const appData = { ...application.data, ...application.hidden_data };
  const notificationUrl = `${baseUri}/pagarme-webhook`;

  const orderId = params.order_id;
  const {
    amount,
    buyer,
    payer,
    to,
    items,
  } = params;
  info(`Transaction #${orderId}`);

  if (!process.env.PAGARME_TOKEN) {
    const pagarmeToken = appData.pagarme_api_key;
    if (typeof pagarmeToken === 'string' && pagarmeToken) {
      process.env.PAGARME_TOKEN = pagarmeToken;
    } else {
      warn('Missing Pagar.me API token');
      return {
        error: 'NO_PAGARME_KEYS',
        message: 'Chave de API não configurada (lojista deve configurar o aplicativo)',
      };
    }
  }

  // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
  const transaction: CreateTransactionResponse['transaction'] = {
    amount: amount.total,
  };
  // https://docs.pagar.me/docs/realizando-uma-transacao-de-cartao-de-credito
  // https://docs.pagar.me/docs/realizando-uma-transacao-de-boleto-bancario
  const pagarmeTransaction: Record<string, any> = {
    api_key: process.env.PAGARME_TOKEN,
    postback_url: notificationUrl,
    service_referer_name: process.env.PAGARME_PARTNER_ID || '63e4f99a3d1a0f00192bd247',
    soft_descriptor: ((appData.soft_descriptor as string) || `${params.domain}_PagarMe`)
      .substring(0, 13),
    metadata: {
      order_number: params.order_number,
      store_id: storeId,
      order_id: orderId,
      platform_integration: 'ecomplus',
    },
  };

  if (params.payment_method.code === 'credit_card') {
    let installmentsNumber = params.installments_number || 1;
    let finalAmount = amount.total;
    if (installmentsNumber > 1) {
      if (appData.installments) {
        const { gateway } = addInstallments(amount.total, appData.installments);
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
    Object.assign(pagarmeTransaction, {
      payment_method: 'credit_card',
      amount: Math.floor(finalAmount * 100),
      installments: installmentsNumber,
      card_hash: params.credit_card && params.credit_card.hash,
    });
  } else if (params.payment_method.code === 'account_deposit') {
    const finalAmount = amount.total;
    const pixConfig = appData.account_deposit;
    const dueTime = pixConfig.due_time || 60;
    date.setTime(date.getTime() + dueTime * 60000);
    Object.assign(pagarmeTransaction, {
      payment_method: 'pix',
      amount: Math.floor(finalAmount * 100),
      pix_expiration_date: date.toISOString(),
    });
  } else {
    // Banking billet
    transaction.banking_billet = {};
    Object.assign(pagarmeTransaction, {
      payment_method: 'boleto',
      async: false,
      amount: Math.floor(amount.total * 100),
    });
    const boletoConfig = appData.banking_billet;
    if (boletoConfig) {
      if (boletoConfig.instructions) {
        pagarmeTransaction.boleto_instructions = boletoConfig.instructions
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .substr(0, 255);
        transaction.banking_billet.text_lines = [pagarmeTransaction.boleto_instructions];
      }
      if (boletoConfig.days_due_date) {
        date.setDate(date.getDate() + boletoConfig.days_due_date);
        const parseDatePagarme = (ms: Date) => {
          const timeMs = ms.getTime() - (180000 * 60);
          const newDate = new Date(timeMs);
          const pad = (n: number) => `${Math.floor(Math.abs(n))}`.padStart(2, '0');
          return date.getFullYear()
            + '-' + pad(newDate.getMonth() + 1)
            + '-' + pad(newDate.getDate());
        };
        const stringDate = parseDatePagarme(date);
        pagarmeTransaction.boleto_expiration_date = stringDate;
      }
    }
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
    const yearDiff = date.getFullYear() - birthDate.year;
    if (
      (yearDiff > 18 && yearDiff < 150)
      || (yearDiff === 18 && birthDate.month < date.getMonth() + 1)
    ) {
      pagarmeTransaction.customer.birthday = `${birthDate.year}-`
        + `${birthDate.month.toString().padStart(2, '0')}-`
        + birthDate.day.toString().padStart(2, '0');
    }
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
  if (!pagarmeTransaction.items.length) {
    return {
      error: 'NO_CART_ITEMS',
      message: 'Nenhum item válido para a transação',
    };
  }

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
      const pagarmePaymentMethod = data.payment_method === 'pix'
        ? 'account_deposit'
        : data.payment_method;
      transaction.intermediator = {
        payment_method: {
          code: pagarmePaymentMethod || params.payment_method.code,
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
        if (data.boleto_url) {
          transaction.payment_link = data.boleto_url;
          transaction.banking_billet.link = data.boleto_url;
        }
        if (data.boleto_expiration_date) {
          const date = new Date(data.boleto_expiration_date);
          transaction.banking_billet.valid_thru = date.toISOString();
        }
      } else if (data.card) {
        transaction.credit_card = {
          holder_name: data.card.holder_name,
          last_digits: data.card.last_digits,
          company: data.card.brand,
          token: data.card.fingerprint,
        };
      } else if (pagarmePaymentMethod === 'account_deposit') {
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
        updated_at: data.date_created || data.date_updated || date.toISOString(),
        current: parsePagarmeStatus(data.status),
      };

      return {
        status: 200,
        redirect_to_payment: false,
        transaction,
      };
    }
  } catch (_err: any) {
    let { message } = _err;
    const err: any = new Error(`${message} (${orderId})`);
    let errCode = 'PAGARME_TRANSACTION_ERR_';
    if (_err.response) {
      const { status, data } = _err.response;
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
    error(err);
    return {
      error: errCode,
      message,
    };
  }

  return {
    error: 'PAGARME_TRANSACTION_NOOP',
    message: `No valid Pagar.me response for #${orderId}`,
  };
};
