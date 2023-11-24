import ecomUtils from '@ecomplus/utils';
import api from '@cloudcommerce/api';

const getOrderById = async (orderId) => {
  const { data } = await api.get(`orders/${orderId}`);
  return data;
};

const addPaymentHistory = async (orderId, body) => {
  return api.post(`orders/${orderId}/payments_history`, body);
};

const updateTransaction = (orderId, body, transactionId) => {
  const urlTransaction = transactionId ? `/${transactionId}` : '';
  const method = transactionId ? 'PATCH' : 'POST';

  return api[method](`orders/${orderId}/transactions${urlTransaction}`, body);
};

const getOrderIntermediatorTransactionId = async (invoiceId) => {
  let queryString = `?transactions.intermediator.transaction_id=${invoiceId}`;
  queryString += '&fields=transactions,financial_status.current,status';
  const data = await api.get(`orders${queryString}`);

  return data?.result.length ? data?.result[0] : null;
};

const checkItemsAndRecalculeteOrder = (amount, items, plan, itemsPagarme) => {
  let subtotal = 0;
  let item;
  let i = 0;
  while (i < items.length) {
    item = items[i];

    if (item.flags && (item.flags.includes('freebie') || item.flags.includes('discount-set-free'))) {
      items.splice(i, 1);
    } else {
      // eslint-disable-next-line no-loop-func
      const itemFound = itemsPagarme.find((itemFind) => itemFind.id === `pi_${item.sku}`);

      if (itemFound) {
        item.quantity = itemFound.quantity;
        if (item.final_price) {
          item.final_price = (itemFound.pricing_scheme.price / 100);
        }
        item.price = (itemFound.pricing_scheme.price / 100);
        subtotal += item.quantity * (item.final_price || item.price);
        i += 1;
      } else {
        items.splice(i, 1);
      }
    }
  }

  if (subtotal > 0) {
    amount.subtotal = subtotal;
    amount.total = amount.subtotal + (amount.tax || 0)
      + (amount.freight || 0) + (amount.extra || 0);

    let planDiscount;
    if (plan && plan.discount) {
      if (plan.discount.type === 'percentage') {
        planDiscount = amount[plan.discount.apply_at];
        planDiscount *= ((plan.discount.value) / 100);
      }
    }
    // if the plan doesn't exist, because it's subscription before the update
    amount.discount = plan ? ((plan.discount && plan.discount.type !== 'percentage' ? plan.discount.value : planDiscount) || 0) : (amount.discount || 0);

    amount.total -= amount.discount;
    amount.total = amount.total > 0 ? amount.total : 0;

    return amount.total > 0 ? Math.floor((amount.total).toFixed(2) * 1000) / 10 : 0;
  }

  return 0;
};

const createNewOrderBasedOld = (oldOrder, plan, status, charge, subscriptionPagarme) => {
  const {
    buyers, items, domain, amount,
  } = oldOrder;
  const channelType = oldOrder.channel_type;
  const shippingLines = oldOrder.shipping_lines;
  const shippingMethodLabel = oldOrder.shipping_method_label;
  const paymentMethodLabel = oldOrder.payment_method_label;
  const originalTransaction = oldOrder.transactions[0];

  const portion = charge.code?.replace(`${oldOrder._id}-`, '');
  const itemsPagarme = subscriptionPagarme.items;

  checkItemsAndRecalculeteOrder(amount, items, plan, itemsPagarme);
  if (amount.balance) {
    delete amount.balance;
  }

  items.forEach((item) => {
    if (item.stock_status && item.stock_status !== 'unmanaged') {
      item.stock_status = 'pending';
    }
  });
  const transactionPagarme = charge.last_transaction;

  const transactions = [
    {
      amount: amount.total,
      status: {
        updated_at: transactionPagarme.updated_at || new Date().toISOString(),
        current: status,
      },
      intermediator: {
        transaction_id: `${charge.invoice.id}`,
        transaction_code: `${transactionPagarme.acquirer_auth_code || ''}`,
        transaction_reference: `${transactionPagarme.acquirer_tid || ''}`,
      },
      payment_method: originalTransaction.payment_method,
      app: originalTransaction.app,
      _id: ecomUtils.randomObjectId(),
      notes: `Parcela #${portion} referente à ${plan?.label || 'Assinatura'}`,
      custom_fields: originalTransaction.custom_fields,
    },
  ];

  transactions[0].payment_link = transactionPagarme.url;

  const financialStatus = {
    updated_at: transactionPagarme.updated_at || new Date().toISOString(),
    current: status,
  };

  let notes = `Parcela #${portion} desconto de ${plan.discount.type === 'percentage' ? '' : 'R$'}`;
  notes += ` ${plan.discount.value} ${plan.discount.type === 'percentage' ? '%' : ''}`;
  notes += ` sobre ${plan.discount.apply_at}`;

  const body = {
    opened_at: new Date().toISOString(),
    items,
    shipping_lines: shippingLines,
    buyers,
    channel_type: channelType,
    domain,
    amount,
    shipping_method_label: shippingMethodLabel,
    payment_method_label: paymentMethodLabel,
    transactions,
    financial_status: financialStatus,
    subscription_order: {
      _id: oldOrder._id,
      number: oldOrder.number,
    },
    notes,
    staff_notes: `Valor cobrado no Pagar.Me R$${(charge.amount) / 100}`,
  };
  return api.post('orders', body);
};

// const updateOrder = async (orderId, body) => {
//   return api.patch(`orders/${orderId}`, body);
// };

const getOrderWithQueryString = async (query) => {
  const { data } = await api.get(`orders?${query}`);

  return data?.result.length ? data?.result : null;
};

const getProductById = async (productId) => {
  const { data } = await api.get(`products/${productId}`);
  return data;
};

const checkItemCategory = async (categoryIds, itemsPagarme, itemsApi) => {
  let i = 0;

  const itemsIdPagarmeDelete = [];
  while (i < itemsPagarme.length) {
    const itemPagarme = itemsPagarme[i];
    // Obs.: freight is one item, initially do not remove freight
    const isItemFreigth = itemPagarme?.id?.startsWith('pi_freight_');
    const itemFound = itemsApi.find((itemFind) => itemPagarme.id === `pi_${itemFind.sku}`);
    const itemFoundIndex = itemsApi.indexOf(itemFound);

    if (itemFound && !isItemFreigth) {
      // eslint-disable-next-line no-await-in-loop
      const product = await getProductById(itemFound.product_id);
      if (product.categories) {
        let canSign = false;
        product.categories.forEach((category) => {
          if (categoryIds.includes(category._id)) {
            canSign = true;
          }
        });

        if (!canSign) {
          itemsIdPagarmeDelete.push(itemPagarme.id);
          itemsApi.splice(itemFoundIndex, 1);
        }
      } else {
        itemsIdPagarmeDelete.push(itemPagarme.id);
        itemsApi.splice(itemFoundIndex, 1);
      }
    } else if (!isItemFreigth) {
      itemsIdPagarmeDelete.push(itemPagarme.id);
    }
    i += 1;
  }

  return itemsIdPagarmeDelete;
};

export {
  getOrderById,
  addPaymentHistory,
  updateTransaction,
  getOrderIntermediatorTransactionId,
  createNewOrderBasedOld,
  getOrderWithQueryString,
  getProductById,
  checkItemCategory,
};
