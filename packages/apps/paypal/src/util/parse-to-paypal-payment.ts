import type { ListPaymentsParams } from '@cloudcommerce/types';
import { price as getPrice } from '@ecomplus/utils';

export const parseToPaypalPayment = (body: ListPaymentsParams) => {
  const {
    lang = 'pt_br',
    customer,
    amount = { total: 0 },
    items,
    domain,
  } = body;
  let currency = body.currency_id;
  if (!currency && items) {
    currency = (items[0]?.currency_id) || 'BRL';
  }
  const round = (n: number | undefined) => (n ? Math.round(n * 100) / 100 : 0);
  const total = round(amount.total) || 1;
  const freight = round(amount.freight);
  const subtotal = total - freight;

  // https://developer.paypal.com/docs/integration/paypal-plus/mexico-brazil/create-a-payment-request/
  const paypalPayment = {
    intent: 'sale',
    payer: {
      payment_method: 'paypal',
    },
    application_context: {
      brand_name: domain,
      locale: lang ? lang.slice(-2).toUpperCase() : 'BR',
      shipping_preference: 'SET_PROVIDED_ADDRESS',
    },
    transactions: [{
      invoice_number: `INVOICE${Date.now().toString()}`,
      amount: {
        currency,
        total: total.toFixed(2),
        details: {
          shipping: freight.toFixed(2),
          subtotal: subtotal.toFixed(2),
        },
      },
      description: lang === 'pt_br'
        ? `Pagamento na loja ${domain}`
        : `Payment in store ${domain}`,
      payment_options: {
        allowed_payment_method: 'IMMEDIATE_PAY',
      },
      item_list: {
        items: [],
      } as Record<string, any>,
    }],
    redirect_urls: {
      return_url: `https://${domain}/app/#/confirmation`,
      cancel_url: `https://${domain}/app/#/cancel`,
    },
  };
  const paypalItemsList = paypalPayment.transactions[0].item_list;

  const address = customer?.addresses?.find((addr) => addr.default);
  if (address) {
    paypalItemsList.shipping_address = {
      recipient_name: address.name,
      line1: address.line_address
        || (address.street ? address.street + ' ' + (address.number || 'S/N') : ''),
      line2: address.complement || '',
      city: address.city,
      country_code: address.country_code || 'BR',
      postal_code: address.zip,
      state: address.province_code || address.province || '',
    };
    const phone = customer?.phones?.[0];
    if (phone) {
      paypalItemsList.shipping_address.phone = phone.number;
    }
  }

  let itemsAmount = 0;
  items?.forEach((item) => {
    const price = round(getPrice(item));
    itemsAmount += price * item.quantity;
    paypalItemsList.items.push({
      name: item.name,
      quantity: item.quantity,
      price: price.toFixed(2),
      sku: item.sku,
      currency: item.currency_id || currency,
    });
  });

  const diffSubtotal = round(subtotal) - round(itemsAmount);
  if (diffSubtotal) {
    // Apply discount or subtotal hardfix
    // https://github.com/paypal/PayPal-PHP-SDK/issues/908
    const name = amount.discount
      ? (lang === 'pt_br' && 'Desconto') || 'Discount'
      : 'fix';
    paypalItemsList.items.push({
      name,
      quantity: 1,
      price: diffSubtotal.toFixed(2),
      sku: name.toUpperCase(),
      currency,
    });
  }

  return paypalPayment;
};

export default parseToPaypalPayment;
