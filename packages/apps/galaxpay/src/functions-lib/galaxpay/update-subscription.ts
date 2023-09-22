import type { Orders } from '@cloudcommerce/types';
import logger from 'firebase-functions/logger';
import axios from 'axios';
import config from '@cloudcommerce/firebase/lib/config';
import {
  getProductsById,
} from '../ecom/request-api';
import GalaxpayAxios from './auth/create-access';

type Dimensions = {
  [k: string]: {
      value: number;
      unit?: 'mm' | 'cm' | 'm' | 'ft' | 'in' | 'yd' | 'mi';
  }
}

type Weight = {
  value: number;
  unit?: 'mg' | 'g' | 'kg' | 'lb' | 'oz';
}

type Item = Exclude<Orders['items'], undefined>[number]
  & { dimensions?: Dimensions } & { weight?: Weight }

const getNewFreight = async (
  itemsOrder: Item[],
  to,
  subtotal:number,
  shippingLineOriginal,
) => {
  const { settingsContent } = config.get();
  const urlApiModule = `https://${settingsContent.domain}/api/modules`;

  if (!shippingLineOriginal.app) return null;
  const items: Item[] = [];
  let i = 0;

  while (i < itemsOrder.length) {
    const item = itemsOrder[i];
    if (!item.dimensions) {
      // add dimensions for shipping calculation
      // eslint-disable-next-line no-await-in-loop
      const product = await getProductsById(item.product_id);
      let dimensions = product?.dimensions;
      let weight = product?.weight;

      if (item.variation_id) {
        const variation = product?.variations?.find((itemFind) => itemFind.sku === item.sku);
        if (variation?.dimensions) {
          dimensions = variation.dimensions;
        }
        if (variation?.weight) {
          weight = variation.weight;
        }
      }
      items.push({ ...item, dimensions, weight });
    } else {
      items.push({ ...item });
    }
    i += 1;
  }

  const body = {
    items,
    subtotal,
    to,
  };

  try {
    const headers = {
      accept: 'application/json',
    };

    const { data: { result } } = await axios.post(
      urlApiModule,
      body,
      { headers },
    );

    if (!result.length) return null;

    const sameApp = result.find((appFind) => appFind._id === shippingLineOriginal.app._id);

    if (sameApp) {
      const service = sameApp.response?.shipping_services?.find(
        (serviceFind) => serviceFind.service_code === shippingLineOriginal.app.service_code,
      );

      return service || sameApp.response?.shipping_services[0];
    }

    let minPrice = result[0]?.response?.shipping_services[0]?.shipping_line?.total_price;
    const indexPosition = { app: 0, service: 0 };

    for (let index = 0; index < result.length; index++) {
      const app = result[index];

      for (let j = 0; j < app.response?.shipping_services.length; j++) {
        const service = app.response?.shipping_services[j];

        if (service.service_code === shippingLineOriginal.app.service_code) {
          return service;
        }

        if (minPrice > service?.shipping_line?.total_price) {
          minPrice = service?.shipping_line?.total_price;
          indexPosition.app = index;
          indexPosition.service = j;
        }
      }
    }

    return result[indexPosition.app]?.response?.shipping_services[indexPosition.service];
  } catch (err) {
    logger.error(err);
    return null;
  }
};

const checkItemsAndRecalculeteOrder = async (
  amount: Orders['amount'],
  items: Exclude<Orders['items'], undefined>,
  plan,
  newItem,
  shippingLine?: Exclude<Orders['shipping_lines'], undefined>[number],
) => {
  let subtotal = 0;
  let item: Exclude<Orders['items'], undefined>[number];
  let i = 0;
  while (i < items.length) {
    item = items[i];
    if (newItem && item.sku === newItem.sku) {
      if (newItem.quantity === 0) {
        items.splice(i, 1);
      } else {
        if (item.final_price) {
          item.final_price = newItem.price;
        }
        item.price = newItem.price;
        item.quantity = newItem.quantity;
        subtotal += item.quantity * (item.final_price || item.price);
        i += 1;
      }
    } else if (item.flags && (item.flags.includes('freebie') || item.flags.includes('discount-set-free'))) {
      items.splice(i, 1);
    } else {
      subtotal += item.quantity * (item.final_price || item.price);
      i += 1;
    }
  }

  if (subtotal > 0) {
    if (shippingLine) {
      const service = await getNewFreight(items, shippingLine?.to, subtotal, shippingLine);

      if (service && service?.shipping_line?.total_price) {
        shippingLine = { ...shippingLine, ...service.shipping_line };
        if (shippingLine) {
          delete shippingLine._id;
        }
        amount.freight = service.shipping_line.total_price;
      }
    }

    amount.subtotal = subtotal;
    amount.total = amount.subtotal + (amount.tax || 0)
      + (amount.freight || 0) + (amount.extra || 0);

    let planDiscount;
    if (plan && plan.discount) {
      if (plan.discount.percentage || plan.discount.type === 'percentage') {
        planDiscount = amount[plan.discount.apply_at];
        planDiscount *= ((plan.discount.value) / 100);
      } else {
        planDiscount = plan.discount.value;
      }
    }

    amount.discount = planDiscount || amount.discount || 0;

    amount.total -= amount.discount || 0;
    return amount.total > 0 ? Math.floor(parseFloat(amount.total.toFixed(2)) * 1000) / 10 : 0;
  }
  return 0;
};

const getSubscriptionsByListMyIds = async (
  galaxpayAxios,
  listOrders,
) => {
  // Consultation on galaxpay has a limit of 100 per request
  const promises: any[] = []; // TODO:
  try {
    let myIds = '';
    await galaxpayAxios.preparing;
    // Handle when there are more than 100 orders
    for (let i = 0; i < listOrders.length; i++) {
      if ((i + 1) % 100 !== 0 && (i + 1) !== listOrders.length) {
        myIds += `${listOrders[i]},`;
      } else if ((i + 1) !== listOrders.length) {
        promises.push(
          galaxpayAxios.axios.get(`/subscriptions?myIds=${myIds}&startAt=0&&limit=100&&status=active`),
        );
        myIds = '';
      } else {
        myIds += `${listOrders[i]},`;
        promises.push(
          galaxpayAxios.axios.get(`/subscriptions?myIds=${myIds}&startAt=0&&limit=100&&status=active`),
        );
      }
    }

    const galaxPaySubscriptions = (await Promise.all(promises))
      ?.reduce((subscriptions, { data }) => {
        if (data?.Subscriptions) {
          subscriptions.push(...data.Subscriptions);
        }
        return subscriptions;
      }, []);

    return galaxPaySubscriptions;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

const updateValueSubscriptionGalaxpay = async (
  galaxpayAxios,
  subscriptionId: string,
  value: number,
  oldValue: number,
) => {
  if (!oldValue) {
    const { data } = await galaxpayAxios.axios.get(`subscriptions?myIds=${subscriptionId}&startAt=0&limit=1`);
    oldValue = data.Subscriptions[0] && data.Subscriptions[0].value;
  }

  if (oldValue !== value) {
    const { data } = await galaxpayAxios.axios.put(`subscriptions/${subscriptionId}/myId`, { value });
    if (data.type) {
      logger.log(`> Update [GP] => ${subscriptionId}:  ${oldValue} to ${value}`);
      return value;
    }
  }
  return null;
};

const checkAndUpdateSubscriptionGalaxpay = async (
  subscriptionId: string,
  amount: Orders['amount'],
  items: Exclude<Orders['items'], undefined>,
  plan,
  oldValue: number,
  shippingLine?: Exclude<Orders['shipping_lines'], undefined>[number],
) => {
  let copyShippingLine: Exclude<Orders['shipping_lines'], undefined>[number] | undefined;

  if (shippingLine) {
    copyShippingLine = { ...shippingLine };
  }
  const value = await checkItemsAndRecalculeteOrder(
    { ...amount },
    [...items],
    { ...plan },
    null,
    copyShippingLine,
  );

  const galaxpayAxios = new GalaxpayAxios({
    galaxpayId: process.env.GALAXPAY_ID,
    galaxpayHash: process.env.GALAXPAY_HASH,
  });

  await galaxpayAxios.preparing;
  return updateValueSubscriptionGalaxpay(galaxpayAxios, subscriptionId, value, oldValue);
};

const compareDocItemsWithOrder = (
  docItemsAndAmount,
  originalItems:Orders['items'],
  originalAmount: Orders['amount'],
  galapayTransactionValue,
) => {
  const finalAmount = Math.floor(parseFloat((originalAmount.total).toFixed(2)) * 1000) / 1000;

  logger.log(`Compare values: ${
    JSON.stringify(originalAmount)
  } => total: ${finalAmount} GP: ${galapayTransactionValue}`);

  if (galapayTransactionValue !== finalAmount) {
    // need update itens and recalculate order
    let i = 0;
    if (originalItems?.length) {
      while (i < originalItems.length) {
        const itemOrder = originalItems[i];
        const itemDoc = docItemsAndAmount?.items?.find(
          (itemFind: { sku: any; }) => itemFind.sku === itemOrder.sku,
        );
        if (itemDoc) {
          if (itemOrder.price !== itemDoc.price) {
            itemOrder.price = itemDoc.price;
            if (itemOrder.final_price !== itemDoc.final_price) {
              itemOrder.final_price = itemDoc.final_price;
            }
          }

          if (itemOrder.quantity !== itemDoc.quantity) {
            itemOrder.quantity = itemDoc.quantity;
          }
          i += 1;
        } else {
          originalItems.splice(i, 1);
        }
      }
    }
  }
};

export {
  checkAndUpdateSubscriptionGalaxpay,
  checkItemsAndRecalculeteOrder,
  updateValueSubscriptionGalaxpay,
  getSubscriptionsByListMyIds,
  compareDocItemsWithOrder,
};
