export default (body) => {
  // parse list payments module request body to PayPal reference
  // https://apx-mods.e-com.plus/api/v1/list_payments/schema.json?store_id=100
  const {
    lang, customer, amount, items, domain,
  } = body;
  // preset default order currency
  let currency = body.currency_id;
  if (!currency) {
    currency = (items.length && items[0].currency_id) || 'BRL';
  }

  // calculate rounded amount values
  const round = (n) => (n ? Math.round(n * 100) / 100 : 0);
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
      description: lang === 'pt_br' ? `Pagamento na loja ${domain}` : `Payment in store ${domain}`,
      payment_options: {
        allowed_payment_method: 'IMMEDIATE_PAY',
      },
      item_list: {
        items: [],
      },
    }],
    redirect_urls: {
      return_url: `https://${domain}/app/#/confirmation`,
      cancel_url: `https://${domain}/app/#/cancel`,
    },
  };
  const paypalItemsList = paypalPayment.transactions[0].item_list;

  // try customer address and phone number
  const address = customer && customer.addresses && customer.addresses.find((addr) => addr.default);
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
    const phone = customer.phones && customer.phones[0];
    if (phone) {
      paypalItemsList.shipping_address.phone = phone.number;
    }
  }

  // parse transaction items list
  let itemsAmount = 0;
  items.forEach((item) => {
    const price = round(item.final_price || item.price);
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
    // apply discount or subtotal hardfix
    // https://github.com/paypal/PayPal-PHP-SDK/issues/908
    let name = 'fix';
    if (amount.discount) {
      name = lang === 'pt_br' ? 'Desconto' : 'Discount';
    }

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
