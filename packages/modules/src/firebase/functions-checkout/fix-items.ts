import type { Products, CheckoutBody } from '@cloudcommerce/types';
import type { Items, Item } from '../../types';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';

type BodyCheckItem = Products | Products & Exclude<Products['variations'], undefined>[number] | undefined;

const checkOnPromotion = (product: Products | Item) => {
  if (typeof product !== 'object' || product === null) {
    logger.error(new Error('`product` must be an object'));
    return false;
  }
  const promoDates = (product as Products).price_effective_date;
  if (promoDates) {
    const now = new Date();
    if (promoDates.start) {
      if (new Date(promoDates.start) > now) {
        return false;
      }
    }
    if (promoDates.end) {
      if (new Date(promoDates.end) < now) {
        return false;
      }
    }
  }
  return !!((product.base_price || 0) > (product.price || 0));
};

const getPrice = (product: Products | Item) => {
  if (checkOnPromotion(product)) {
    return product.price;
  }
  if (product) {
    if (typeof (product as Item).final_price === 'number') {
      return (product as Item).final_price;
    }
    return Math.max(product.base_price || 0, product.price || 0);
  }
  return 0;
};

export default async (
  checkoutItems: CheckoutBody['items'],
): Promise<Items> => {
  const items = [...checkoutItems] as Items;
  // get each cart item
  // count done processes
  let itemsDone = 0;
  const itemsTodo = items.length;
  // eslint-disable-next-line consistent-return
  const doFinally = () => {
    // after each item
    itemsDone += 1;
    if (itemsDone === itemsTodo) {
      return items;
    }
  };

  // run item by item
  for (let i = 0; i < items.length; i++) {
    // i, item scoped
    const item = items[i] as Items[number];
    const removeItem = () => {
      // remove invalid item from list
      items.splice(i, 1);
      doFinally();
    };
    if (!item.quantity) {
      // ignore items without quantity or zero
      removeItem();
      i -= 1;
      continue;
    }

    const proceedItem = () => {
      // additions to final price
      if (Array.isArray(item.customizations)) {
        item.customizations.forEach((customization) => {
          if (item.final_price) {
            if (customization.add_to_price) {
              const { type, addition } = customization.add_to_price;
              item.final_price += type === 'fixed'
                ? addition
                : ((item.price * addition) / 100);
            }
          }
        });
      }
      // done
      doFinally();
    };

    let product: Products | undefined;
    try {
      // eslint-disable-next-line no-await-in-loop
      product = (await api.get(`products/${item.product_id}`, {
        headers: { 'x-primary-db': 'true' },
      })).data;
    } catch (err) {
      logger.error(err);
      removeItem();
    }
    if (!product?.available) {
      removeItem();
      continue;
    }
    let body: BodyCheckItem;
    // check variation if any
    if (!item.variation_id) {
      body = product;
    } else {
      // find respective variation
      const variation = product.variations?.find((_variation) => {
        return _variation._id === item.variation_id;
      });
      if (variation) {
        // merge product body with variation object
        body = Object.assign(product, variation);
      }
    }
    if (!body || (body.min_quantity && body.min_quantity > item.quantity)) {
      // cannot handle current item
      // invalid variation or quantity lower then minimum
      removeItem();
      continue;
    }
    // check quantity
    if (body.quantity && body.quantity < item.quantity) {
      // reduce to max available quantity
      item.quantity = body.quantity;
    }
    // extend item properties with body
    [
      'sku',
      'name',
      'currency_id',
      'currency_symbol',
      'price',
      'dimensions',
      'weight',
      'production_time',
      'categories',
      'brands',
    ].forEach((prop) => {
      if (body && body[prop] !== undefined) {
        item[prop] = body[prop];
      }
    });
    // price is required
    if (!item.price) {
      item.price = 0;
    }
    if (Array.isArray(item.flags)) {
      // prevent error with repeated flags
      const flags: string[] = [];
      item.flags.forEach((flag) => {
        if (!flags.includes(flag)) {
          flags.push(flag);
        }
      });
      item.flags = flags;
    }
    if (!item.kit_product) {
      item.final_price = getPrice(body);
      proceedItem();
      continue;
    }

    const kitProductId = item.kit_product._id;
    let kitProduct: Products | undefined;
    try {
      // eslint-disable-next-line no-await-in-loop
      kitProduct = (await api.get(`products/${kitProductId}`, {
        headers: { 'x-primary-db': 'true' },
      })).data;
    } catch (err) {
      logger.error(err);
      removeItem();
    }
    if (kitProduct?.available && kitProduct.kit_composition) {
      // check kit composition and quantities
      let packQuantity = 0;
      let isFixedQuantity = true;
      let kitItem: Exclude<Products['kit_composition'], undefined>[number] | undefined;
      kitProduct.kit_composition.forEach((currentKitItem) => {
        if (currentKitItem.quantity) {
          packQuantity += currentKitItem.quantity;
        } else if (isFixedQuantity) {
          isFixedQuantity = false;
        }
        if (currentKitItem._id === item.product_id) {
          kitItem = currentKitItem;
        }
      });
      if (!isFixedQuantity) {
        // use parent product min quantity
        packQuantity = kitProduct.min_quantity || 0;
      }
      if (
        kitItem
        && (kitItem.quantity === undefined || item.quantity % kitItem.quantity === 0)
      ) {
        // valid kit item and quantity
        let kitTotalQuantity = 0;
        items.forEach((_item) => {
          if (_item.kit_product?._id === kitProduct._id) {
            kitTotalQuantity += _item.quantity;
          }
        });
        const minPacks = kitItem.quantity
          ? item.quantity / kitItem.quantity
          : 1;
        if (kitTotalQuantity && kitTotalQuantity % (minPacks * packQuantity) === 0) {
          // matched pack quantity
          item.kit_product.price = getPrice(kitProduct);
          item.kit_product.pack_quantity = packQuantity;
          if (kitProduct.slug) {
            item.slug = kitProduct.slug;
          }
          if (item.kit_product.price) {
            // set final price from kit
            item.final_price = item.kit_product.price / packQuantity;
          }
          proceedItem();
          continue;
        }
      }
    }
    // remove all items with invalid kit
    let ii = 0;
    while (ii < items.length) {
      const itemKit = items[ii].kit_product;
      if (itemKit && itemKit._id === kitProductId) {
        items.splice(ii, 1);
      } else {
        ii += 1;
      }
    }
    doFinally();
  }

  return items;
};
