import type { Orders } from '@cloudcommerce/types';
import ecomUtils from '@ecomplus/utils';
import formatDate from '../helpers/format-tiny-date';
import parseStatus from './status-to-tiny';

export default (order: Orders, appData) => {
  const orderRef = String(order.number) || order._id;
  const tinyOrder: Record<string, any> = {
    numero_pedido_ecommerce: orderRef,
    data_pedido: formatDate(new Date(order.opened_at || order.created_at)),
    ecommerce: 'E-Com Plus',
    situacao: parseStatus(order),
    itens: [],
  };

  const buyer = order.buyers && order.buyers[0];
  const shippingLine = order.shipping_lines && order.shipping_lines[0];
  const transaction = order.transactions && order.transactions[0];
  const shippingAddress = shippingLine && shippingLine.to;
  const billingAddress = transaction && transaction.billing_address;

  const parseAddress = (address, tinyObject) => {
    [
      ['street', 'endereco', 50],
      ['number', 'numero', 10],
      ['complement', 'complemento', 50],
      ['borough', 'bairro', 30],
      ['zip', 'cep', 10],
      ['city', 'cidade', 30],
      ['province_code', 'uf', 30],
    ].forEach(([addressField, tinyField, maxLength]) => {
      if (address[addressField]) {
        tinyObject[tinyField] = String(address[addressField])
          .substring(0, maxLength as number).replace('&', 'e');
      }
    });
  };

  if (buyer) {
    const tinyCustomer: Record<string, any> = {
      codigo: buyer._id,
      nome: (buyer.corporate_name
        || ecomUtils.fullName(buyer)).substring(0, 30).replace('&', 'e')
        || `Comprador de #${orderRef}`,
      tipo_pessoa: buyer.registry_type === 'j' ? 'J' : 'F',
    };
    if (buyer.display_name) {
      tinyCustomer.nome_fantasia = buyer.display_name
        .substring(0, 30).replace('&', 'e');
    }
    if (buyer.doc_number && buyer.doc_number.length <= 18) {
      tinyCustomer.cpf_cnpj = buyer.doc_number;
    }
    if (
      buyer.inscription_number && buyer.inscription_number.length <= 18
      && buyer.inscription_type !== 'Municipal'
    ) {
      tinyCustomer.ie = buyer.inscription_number;
    }
    if (buyer.main_email && buyer.main_email.length <= 50) {
      tinyCustomer.email = buyer.main_email;
    }
    if (shippingAddress) {
      parseAddress(billingAddress || shippingAddress, tinyCustomer);
    }
    const phone = buyer.phones && buyer.phones[0];
    if (phone) {
      tinyCustomer.fone = phone.country_code ? `+${phone.country_code} ` : '';
      tinyCustomer.fone += phone.number;
    }
    tinyOrder.cliente = tinyCustomer;
  } else {
    tinyOrder.cliente = {
      nome: `Comprador de #${orderRef}`,
    };
  }

  if (shippingAddress) {
    tinyOrder.endereco_entrega = {};
    parseAddress(shippingAddress, tinyOrder.endereco_entrega);
    if (shippingAddress.name) {
      tinyOrder.endereco_entrega.nome_destinatario = shippingAddress.name.substring(0, 60);
    }
  }

  if (order.items) {
    order.items.forEach((item) => {
      if (item.quantity) {
        const itemRef = (item.sku || item._id || Math.random().toString()).substring(0, 60);
        tinyOrder.itens.push({
          item: {
            codigo: itemRef,
            descricao: item.name ? item.name.substring(0, 120) : itemRef,
            unidade: 'UN',
            quantidade: item.quantity,
            valor_unitario: ecomUtils.price(item),
          },
        });
      }
    });
  }

  if (order.payment_method_label) {
    tinyOrder.meio_pagamento = order.payment_method_label;
  }
  if (transaction) {
    switch (transaction.payment_method.code) {
      case 'credit_card':
        tinyOrder.forma_pagamento = 'credito';
        break;
      case 'banking_billet':
        tinyOrder.forma_pagamento = 'boleto';
        break;
      case 'account_deposit':
        tinyOrder.forma_pagamento = 'deposito';
        break;
      case 'online_debit':
      case 'debit_card':
      case 'balance_on_intermediary':
        tinyOrder.forma_pagamento = 'debito';
        break;
      default:
        tinyOrder.forma_pagamento = 'multiplas';
    }
    if (!tinyOrder.meio_pagamento && transaction.payment_method.name) {
      tinyOrder.meio_pagamento = transaction.payment_method.name.substring(0, 100);
    }
  }

  const tinyErpOrderParser = global.$tinyErpOrderParser;
  if (tinyErpOrderParser && typeof tinyErpOrderParser === 'function') {
    tinyErpOrderParser({ tinyOrder, order });
  }

  if (order.shipping_method_label) {
    tinyOrder.forma_frete = order.shipping_method_label;
  }
  if (shippingLine) {
    tinyOrder.forma_envio = 'X';
    if (shippingLine.app) {
      const { carrier } = shippingLine.app;
      if (carrier) {
        if (/correios/i.test(carrier)) {
          tinyOrder.forma_envio = 'C';
        } else if (/b2w/i.test(carrier)) {
          tinyOrder.forma_envio = 'B';
        } else if (/mercado envios/i.test(carrier)) {
          tinyOrder.forma_envio = 'M';
        } else {
          tinyOrder.forma_envio = 'T';
        }
      }
      if (
        (!tinyOrder.forma_envio || tinyOrder.forma_envio === 'X' || tinyOrder.forma_envio === 'T')
        && shippingLine.app.service_name && /(pac|sedex)/i.test(shippingLine.app.service_name)
      ) {
        tinyOrder.forma_envio = 'C';
      }
      if (!tinyOrder.forma_frete && shippingLine.app.label) {
        tinyOrder.forma_frete = shippingLine.app.label;
      }
    }
  } else {
    tinyOrder.forma_envio = 'S';
  }

  const { amount } = order;
  if (amount) {
    if (typeof amount.freight === 'number') {
      tinyOrder.valor_frete = amount.freight;
      if (amount.tax) {
        tinyOrder.valor_frete += amount.tax;
      }
    }
    if (amount.discount) {
      tinyOrder.valor_desconto = amount.discount;
    }
  }

  if (order.notes) {
    tinyOrder.obs = order.notes.substring(0, 100);
  }
  if (order.extra_discount && order.extra_discount.discount_coupon) {
    tinyOrder.obs = `${(tinyOrder.obs || '')} - ${order.extra_discount.discount_coupon}`
      .substring(0, 100);
  }
  if (order.staff_notes) {
    tinyOrder.obs_internas = order.staff_notes.substring(0, 100);
  }

  if (appData.tiny_order_data && typeof appData.tiny_order_data === 'object') {
    Object.keys(appData.tiny_order_data).forEach((field) => {
      let value = appData.tiny_order_data[field];
      switch (value) {
        case undefined:
        case '':
        case null:
          break;
        default:
          if (typeof value === 'string') {
            value = value.trim();
            if (value) {
              tinyOrder[field] = value;
            }
          } else {
            tinyOrder[field] = value;
          }
      }
    });
  }
  return tinyOrder;
};
