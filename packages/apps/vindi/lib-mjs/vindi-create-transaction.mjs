import $config, { logger } from '@cloudcommerce/firebase/lib/config';
import updateAppData from '@cloudcommerce/firebase/lib/helpers/update-app-data';
import {
  addInstallments,
  createVindiAxios,
  parseVindiStatus,
} from './util/vindi-utils.mjs';

export default async (modBody) => {
  const { application, params } = modBody;
  const appData = {
    ...application.data,
    ...application.hidden_data,
  };
  if (appData.vindi_api_key) {
    process.env.VINDI_API_KEY = appData.vindi_api_key;
  }
  const { VINDI_API_KEY } = process.env;
  if (!VINDI_API_KEY) {
    return {
      error: 'NO_VINDI_KEYS',
      message: 'Chave de API e/ou criptografia não configurada (lojista deve configurar o aplicativo)',
    };
  }
  const vindiAxios = createVindiAxios(VINDI_API_KEY, appData.vindi_sandbox);
  const { storeId } = $config.get();

  // https://apx-mods.e-com.plus/api/v1/create_transaction/schema.json?store_id=100
  const orderId = params.order_id;
  const {
    amount, buyer, to, items,
  } = params;
  // https://apx-mods.e-com.plus/api/v1/create_transaction/response_schema.json?store_id=100
  const transaction = {
    amount: amount.total,
  };

  // must always create Vindi customer before
  const vindiMetadata = {
    order_number: params.order_number,
    store_id: storeId,
    order_id: orderId,
    order_type: params.type,
  };
  const vindiCustomer = {
    name: buyer.fullname,
    email: buyer.email,
    registry_code: buyer.doc_number,
    code: `${buyer.customer_id}:${Date.now()}`,
    phones: [{
      phone_type: !buyer.phone.type || buyer.phone.type === 'personal' ? 'mobile' : 'landline',
      number: `${(buyer.phone.country_code || '55')}${buyer.phone.number}`,
    }],
    notes: `E-Com Plus => Pedido #${params.order_number} em ${params.domain}`,
    metadata: vindiMetadata,
  };
  const parseAddress = (_to) => ({
    street: _to.street,
    number: String(_to.number) || 'S/N',
    additional_details: _to.complement,
    zipcode: _to.zip,
    neighborhood: _to.borough,
    city: _to.city,
    state: _to.province_code || _to.province,
    country: _to.country_code || 'BR',
  });
  if (to && to.street) {
    vindiCustomer.address = parseAddress(to);
  } else if (params.billing_address) {
    vindiCustomer.address = parseAddress(params.billing_address);
  }

  // strart mounting Vindi bill object
  const vindiBill = {
    code: String(params.order_number),
    metadata: vindiMetadata,
  };

  let finalAmount = Math.floor(amount.total * 100) / 100;
  if (params.payment_method.code === 'credit_card') {
    let installmentsNumber = params.installments_number;
    if (installmentsNumber > 1) {
      if (appData.installments) {
        // list all installment options
        const { gateway } = addInstallments(amount, appData.installments);
        const installmentOption = gateway.installment_options
          && gateway.installment_options.find(({ number }) => number === installmentsNumber);
        if (installmentOption) {
          transaction.installments = installmentOption;
          transaction.installments.total = Math.round(
            installmentOption.number * installmentOption.value * 100,
          ) / 100;
          finalAmount = transaction.installments.total;
        } else {
          installmentsNumber = 1;
        }
      }
    }
    vindiBill.payment_method_code = 'credit_card';
    vindiBill.installments = installmentsNumber;
  } else if (params.payment_method.code === 'account_deposit') {
    vindiBill.payment_method_code = 'pix';
  } else {
    vindiBill.payment_method_code = appData.banking_billet?.is_yapay
      ? 'bank_slip_yapay' : 'bank_slip';
  }

  try {
    const { data: vindiCustomerRes } = await vindiAxios({
      url: '/customers',
      method: 'post',
      timeout: 12000,
      data: vindiCustomer,
    });
    vindiBill.customer_id = vindiCustomerRes.customer?.id || vindiCustomerRes.id;

    let vindiProductId = appData.vindi_product_id;
    if (!vindiProductId) {
      // must explicitly create a product before bill
      const { data: vindiProductRes } = await vindiAxios({
        url: '/products',
        method: 'post',
        timeout: 12000,
        data: {
          name: `Pedido na loja ${params.domain}`,
          code: `ecomplus-${Date.now()}`,
          status: 'active',
          description: 'Produto pré-definido para pedidos através da plataforma E-Com Plus',
          pricing_schema: {
            price: 100,
            schema_type: 'flat',
          },
        },
      });
      vindiProductId = vindiProductRes.product?.id || vindiProductRes.id;
      await updateAppData(application, {
        vindi_product_id: vindiProductId,
      }, {
        isHiddenData: true,
        canSendPubSub: false,
      });
    }

    if (params.credit_card && params.credit_card.hash) {
      vindiBill.payment_profile = {
        payment_method_code: vindiBill.payment_method_code,
        allow_as_fallback: true,
        gateway_token: params.credit_card.hash,
      };
      if (params.payer && params.payer.doc_number) {
        vindiBill.payment_profile.registry_code = params.payer.doc_number;
      }
    }

    if (params.type === 'recurrence') {
      // async handle plan subscription
      // must register all products and a plan on Vindi
      // check products metadata to prevent duplication
      return {
        data: {
          id: 0,
          charges: [{
            id: 0,
            status: 'pending',
          }],
        },
      };
    }

    /*
    "Apesar do bill_item suportar um esquema de precificação (pricing_schema)
    com quantidade (quantity), recomendamos utilizar apenas o parâmetro
    amount para evitar complexidade desnecessária no desenvolvimento.
    Se pricing_schema, quantity e amount forem informados ao mesmo tempo,
    garanta que todos sejam mutuamente válidos"
    */
    // create a product for current order
    let description = '';
    if (items.length === 1) {
      description = `${items[0].quantity}x ${items[0].sku} - ${items[0].name}`;
    } else {
      items.forEach(({ quantity, sku }) => {
        description += `${quantity}x ${sku}; `;
      });
    }
    if (description.length > 255) {
      description = description.substring(0, 250) + ' ...';
    }
    vindiBill.bill_items = [{
      product_id: vindiProductId,
      amount: finalAmount,
      description,
    }];
    // create Vindi single bill
    const { data: vindiBillRes } = await vindiAxios({
      url: '/bills',
      method: 'post',
      data: vindiBill,
    });

    const createdBill = vindiBillRes.bill || vindiBillRes;
    const vindiCharge = createdBill.charges[0];
    if (vindiCharge.amount) {
      transaction.amount = Number(vindiCharge.amount);
    }
    transaction.intermediator = {
      buyer_id: String(vindiBill.customer_id),
      transaction_code: String(vindiCharge.id),
      transaction_reference: String(createdBill.id),
    };

    if (vindiCharge.payment_method) {
      transaction.intermediator.payment_method = {
        code: vindiCharge.payment_method.code || params.payment_method.code,
      };
      if (vindiCharge.payment_method.name) {
        transaction.intermediator.payment_method.name = vindiCharge.payment_method.name;
      }
    }
    if (vindiCharge.print_url) {
      transaction.payment_link = vindiCharge.print_url;
      if (params.payment_method.code === 'banking_billet') {
        transaction.banking_billet = {
          link: vindiCharge.print_url,
        };
      } else if (params.payment_method.code === 'account_deposit') {
        transaction.payment_link = vindiCharge.print_url || createdBill.url;
      }
    } else if (params.payment_method.code === 'account_deposit' && createdBill.url) {
      transaction.payment_link = createdBill.url;
    }

    const vindiTransaction = vindiCharge.last_transaction;
    if (vindiTransaction) {
      transaction.intermediator.transaction_id = String(vindiTransaction.id);
      if (vindiTransaction.payment_profile && vindiTransaction.payment_profile.token) {
        transaction.credit_card = {
          token: vindiTransaction.payment_profile.token,
        };
        if (vindiTransaction.payment_profile.card_number_last_four) {
          transaction.credit_card.last_digits = vindiTransaction
            .payment_profile.card_number_last_four;
        }
        if (vindiTransaction.payment_profile.payment_company) {
          transaction.credit_card.company = vindiTransaction
            .payment_profile.payment_company.name;
        }
      }
    }

    transaction.status = {
      updated_at: vindiBillRes.updated_at || vindiBillRes.created_at || new Date().toISOString(),
      current: parseVindiStatus(vindiCharge.status),
    };
    return {
      redirect_to_payment: Boolean(transaction.payment_link),
      transaction,
    };
  } catch (error) {
    // try to debug request error
    const errCode = 'VINDI_BILL_ERR';
    let { message } = error;
    const err = new Error(`${errCode} ${orderId} => ${message}`);
    if (error.response) {
      const { status, data } = error.response;
      if (status !== 401 && status !== 403) {
        if (error.config) {
          err.url = error.config.url;
          err.data = error.config.data;
        } else {
          err.bill = JSON.stringify(vindiBill);
        }
        err.customer = JSON.stringify(vindiCustomer);
        err.status = status;
        if (typeof data === 'object' && data) {
          err.response = JSON.stringify(data);
        } else {
          err.response = data;
        }
      } else if (data?.errors?.[0]?.message) {
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
