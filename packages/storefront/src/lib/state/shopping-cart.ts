import type { Products, CartSet, SearchItem } from '@cloudcommerce/api/types';
import { computed } from 'vue';
import api from '@cloudcommerce/api';
import { useDebounceFn, watchDebounced } from '@vueuse/core';
import mitt from 'mitt';
import { requestIdleCallback } from '@@sf/sf-lib';
import useStorage from '@@sf/state/use-storage';
import addItem from '@@sf/state/shopping-cart/add-cart-item';
import removeItem from '@@sf/state/shopping-cart/remove-cart-item';
import parseProduct from '@@sf/state/shopping-cart/parse-product';

type CartItem = CartSet['items'][0];
const storageKey = 'ecomShoppingCart';
const emptyCart = {
  subtotal: 0,
  items: [],
};
const shoppingCart = useStorage<CartSet & { subtotal: number }>(storageKey, emptyCart);
const totalItems = computed(() => {
  return shoppingCart.items.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);
});

const addCartItem = (newItem: CartItem) => {
  return addItem(shoppingCart, newItem);
};
const removeCartItem = (itemId: string) => {
  return removeItem(shoppingCart, itemId);
};
const resetCartItems = (items?: CartItem[]) => {
  shoppingCart.items.splice(0, shoppingCart.items.length);
  items?.forEach(addCartItem);
};
const addProductToCart = (
  product: (Partial<Products> | Partial<SearchItem>) & { _id: Products['_id'] },
  variationId?: Products['_id'],
  quantity?: number,
) => {
  return addCartItem(parseProduct(product, variationId, quantity));
};

const updateCartState = async () => {
  if (!shoppingCart.items.length) {
    if (shoppingCart.subtotal) shoppingCart.subtotal = 0;
    return;
  }
  const productIds = shoppingCart.items.map((item) => item.product_id)
    .filter((_id) => typeof _id === 'string' && _id.length === 24);
  if (!productIds.length) {
    resetCartItems();
    return;
  }
  try {
    const { data } = await api.get('products', {
      params: { _id: productIds },
      fields: [
        "sku",
        "name",
        "slug",
        "available",
        "visible",
        "price",
        "base_price",
        "quantity",
        "min_quantity",
        "inventory",
        "kit_composition",
        "pictures.normal",
        "variations._id",
        "variations.sku",
        "variations.name",
        "variations.production_time",
        "variations.base_price",
        "variations.picture_id",
      ] as const,
    });
    const storedItems = [...shoppingCart.items];
    resetCartItems();
    data.result.forEach((productItem) => {
      const storedItem = storedItems.find((item) => item.product_id === productItem._id);
      if (!storedItem) return;
      const { variation_id: variationId, quantity } = storedItem;
      const cartItem = addProductToCart(productItem, variationId, quantity);
      if (!cartItem) return;
      if (storedItem._id) {
        cartItem._id = storedItem._id;
      }
      cartItem.customizations = storedItem.customizations;
      cartItem.flags = storedItem.flags;
    });
  } catch (err) {
    console.error(err);
  }
};

export default shoppingCart;

export {
  totalItems,
  shoppingCart,
  addCartItem,
  removeCartItem,
  resetCartItems,
  parseProduct,
  addProductToCart,
  updateCartState,
};

type CartEvent = {
  addCartItem: CartItem,
  removeCartItem: CartItem,
};
const cartEmitter = mitt<CartEvent>();
const cloneItems = () => shoppingCart.items.map((item) => ({ ...item }));
let oldItems = cloneItems();
const emitCartEvents = useDebounceFn((items: CartItem[]) => {
  ['addCartItem' as const, 'removeCartItem' as const].forEach((evName) => {
    const isAdd = evName === 'addCartItem';
    const baseItems = isAdd ? items : oldItems;
    const compareItems = isAdd ? oldItems : items;
    baseItems.forEach((baseItem) => {
      if (!baseItem.quantity) return;
      const compareItem = compareItems.find(({ _id }) => _id === baseItem._id);
      const compareQnt = compareItem?.quantity || 0;
      if (baseItem.quantity > compareQnt) {
        cartEmitter.emit(evName, {
          ...baseItem,
          quantity: baseItem.quantity - compareQnt,
        });
      }
    });
  });
  oldItems = cloneItems();
}, 200);

const cartItemMiddlewares: Array<(item: CartItem) => void> = [];

export const addCartItemMiddleware = (cb: (item: CartItem) => void) => {
  cartItemMiddlewares.push(cb);
};

watchDebounced(shoppingCart.items, (items) => {
  items.forEach((item) => {
    let finalPrice = item.kit_product?.price && item.kit_product.pack_quantity
      ? item.kit_product.price / item.kit_product.pack_quantity
      : item.price;
    if (Array.isArray(item.customizations)) {
      item.customizations.forEach((customization) => {
        if (customization.add_to_price) {
          const { type, addition } = customization.add_to_price;
          finalPrice += type === 'fixed'
            ? addition
            : item.price * (addition / 100);
        }
      });
    }
    item.final_price = finalPrice;
    const min = item.min_quantity || 1;
    const max = item.max_quantity;
    if (
      typeof item.quantity !== 'number'
      || Number.isNaN(item.quantity)
      || item.quantity < min
    ) {
      setTimeout(() => {
        item.quantity = min;
      }, 9);
    } else if (max && item.quantity > max) {
      setTimeout(() => {
        item.quantity = max;
      }, 9);
    }
    cartItemMiddlewares.forEach((midd) => midd(item));
  });
  shoppingCart.subtotal = items.reduce((acc, item) => {
    const { quantity } = item;
    const price = (item.final_price || item.price);
    if (!(quantity > 0) || !(price > 0)) return acc;
    return acc + (item.quantity * (item.final_price || item.price));
  }, 0);
  emitCartEvents(items);
}, {
  debounce: 50,
});

export const cartEvents = {
  on: cartEmitter.on,
  off: cartEmitter.off,
};

if (!import.meta.env.SSR && !window.location.pathname.startsWith('/app/')) {
  requestIdleCallback(updateCartState);
  (window as any).__shoppingCart = shoppingCart;
}
