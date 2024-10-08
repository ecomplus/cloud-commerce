import type { ResourceId, Products, CheckoutBody } from '@cloudcommerce/types';
import type { Items, Item } from '../../types';
import api from '@cloudcommerce/api';
import { logger } from '@cloudcommerce/firebase/lib/config';

type BodyCheckItem = Products | Products & Exclude<Products['variations'], undefined>[number] | undefined;

const checkOnPromotion = (product: Products) => {
  if (typeof product !== 'object' || product === null) {
    // prevent fatal error
    logger.error(new Error('`product` must be an object'));
    return false;
  }

  const promoDates = product.price_effective_date;
  if (promoDates) {
    const now = new Date();
    if (promoDates.start) {
      // start date and time in ISO 8601
      if (new Date(promoDates.start) > now) {
        return false;
      }
    }
    if (promoDates.end) {
      // promotion end date and time in ISO 8601
      if (new Date(promoDates.end) < now) {
        return false;
      }
    }
  }
  // default to no promotion
  if (product.base_price && product.price) {
    return !!(product.base_price > product.price);
  }
  return false;
};

const getPrice = (product: Products, item: Item) => {
  // promotional sale price
  if (checkOnPromotion(product)) {
    return product.price;
  }
  if (product) {
    // Products do not have final_price properties
    // test final price for cart item object
    return (typeof item.final_price === 'number'
      ? item.final_price
    // use the maximum value between sale and base price
      : Math.max(product.base_price || 0, product.price || 0)
    );
  }
  // default to zero
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

    const checkItem = (product:Products) => {
      if (!product.available) {
        removeItem();
      } else {
        let body: BodyCheckItem;

        // check variation if any
        if (!item.variation_id) {
          body = product;
        } else {
        // find respective variation
          let variation:Exclude<Products['variations'], undefined>[number] | undefined;
          if (product.variations) {
            variation = product.variations.find(
              (variationFind) => variationFind._id === item.variation_id,
            );
          }
          if (variation) {
          // merge product body with variation object
            body = Object.assign(product, variation);
          }
        }
        // logger.log(body._id)

        if (!body || (body.min_quantity && body.min_quantity > item.quantity)) {
        // cannot handle current item
        // invalid variation or quantity lower then minimum
          removeItem();
        } else {
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
          //
          item.final_price = getPrice(body, item);
          proceedItem();
        }
      }
    };

    const checkKitProduct = (kitProduct: Products, kitProductId: string) => {
      if (item.kit_product) {
        if (kitProduct.available && kitProduct.kit_composition) {
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
          if (!isFixedQuantity && kitProduct.min_quantity) {
            // use parent product min quantity
            packQuantity = kitProduct.min_quantity;
          }

          if (kitItem && (kitItem.quantity === undefined
            || item.quantity % kitItem.quantity === 0)) {
            // valid kit item and quantity
            let kitTotalQuantity = 0;
            items.forEach((itemFind) => {
              if (itemFind.kit_product && itemFind.kit_product._id === kitProductId) {
                kitTotalQuantity += itemFind.quantity;
              }
            });

            const minPacks = kitItem.quantity
              ? item.quantity / kitItem.quantity
              : 1;
            if (kitTotalQuantity && kitTotalQuantity % (minPacks * packQuantity) === 0) {
              // matched pack quantity
              item.kit_product.price = getPrice(kitProduct, item);
              item.kit_product.pack_quantity = packQuantity;
              /* TODO: slug is not a property on item
              if (kitProduct.slug) {
                item.slug = kitProduct.slug;
              } */
              if (item.kit_product.price) {
                // set final price from kit
                item.final_price = item.kit_product.price / packQuantity;
              }
              proceedItem();
            }
          }
        }

        // remove items with invalid kit
        let index = 0;
        while (index < items.length) {
          const itemKit = items[index].kit_product;
          if (itemKit && itemKit._id === kitProductId) {
            items.splice(index, 1);
          } else {
            index += 1;
          }
        }
        doFinally();
      }
    };

    if (item.kit_product) {
      // GET public kit product object
      const kitProductId = item.kit_product._id;
      try {
      // eslint-disable-next-line no-await-in-loop
        const kitProduct = (await api.get(`products/${kitProductId}`, {
          isNoAuth: true,
        })).data;

        if (kitProduct) {
          checkKitProduct(kitProduct, kitProductId);
        } else {
          removeItem();
        }
      } catch (err) {
        logger.error(err);
        // remove cart item
        removeItem();
      }
    } else {
      // GET public product object
      try {
        // eslint-disable-next-line no-await-in-loop
        const product = (await api.get(`products/${item.product_id as ResourceId}`, {
          isNoAuth: true,
        })).data;

        if (product) {
          checkItem(product);
        } else {
          // remove cart item
          removeItem();
        }
      } catch (err) {
        logger.error(err);
        // remove cart item
        removeItem();
      }
    }
  }
  return items;
};
