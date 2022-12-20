import type { Orders, Applications } from '@cloudcommerce/types';
import GalaxpayAxios from './auth/create-access';

const checkAmountItemsOrder = (
  amount: Orders['amount'],
  items: Exclude<Orders['items'], undefined>,
  plan: { [x: string]: any },
) => {
  let subtotal = 0;
  let item: Exclude<Orders['items'], undefined>[number];
  for (let i = 0; i < items.length; i++) {
    item = items[i];
    if (item.flags && (item.flags.includes('freebie') || item.flags.includes('discount-set-free'))) {
      items.splice(i, 1);
    } else {
      subtotal += item.quantity * (item.final_price || item.price);
    }
  }
  amount.subtotal = subtotal;
  amount.total = amount.subtotal + (amount.tax || 0) + (amount.freight || 0) + (amount.extra || 0);
  let planDiscount;
  if (plan && plan.discount) {
    if (plan.discount.percentage) {
      planDiscount = amount[plan.discount.apply_at];
      planDiscount *= ((plan.discount.value) / 100);
    }
  }
  // if the plan doesn't exist, because it's subscription before the update
  if (plan) {
    amount.discount = (plan.discount && !plan.discount.percentage
      ? plan.discount.value : planDiscount) || 0;
  }
  if (amount.discount) {
    amount.total -= amount.discount;
  }
  const total: any = amount.total - (amount.discount || 0); // BUG :(
  return Math.floor(total.toFixed(2) * 100);
};

const updateValueSubscription = (
  appData: Applications,
  subscriptionId: string,
  amount: Orders['amount'],
  items: Exclude<Orders['items'], undefined>,
  plan: { [x: string]: any },
  // GalaxPaySubscription: { [x: string]: any },
) => {
  const value = checkAmountItemsOrder({ ...amount }, [...items], { ...plan });

  return new Promise((resolve, reject) => {
    const galaxpayAxios = new GalaxpayAxios({
      galaxpayId: appData.hidden_data?.galaxpay_id,
      galaxpayHash: appData.hidden_data?.galaxpay_hash,
    });

    galaxpayAxios.preparing
      .then(async () => {
        if (galaxpayAxios.axios) {
          const { data } = await galaxpayAxios.axios.put(`subscriptions/${subscriptionId}/myId`, { value });
          if (data.type) {
            resolve(true);
          }
        }
      }).catch((err) => {
        reject(err);
      });
  });
};

export {
  updateValueSubscription,
  checkAmountItemsOrder,
};
