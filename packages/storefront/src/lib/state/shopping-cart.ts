import type { Products, CartSet, SearchItem } from '@cloudcommerce/api/types';
import { computed, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import mitt from 'mitt';
import useStorage from '@@sf/state/use-storage';
import addItem from '@@sf/state/shopping-cart/add-cart-item';
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
  addItem(shoppingCart, newItem);
};
const removeCartItem = (itemId: string) => {
  for (let i = 0; i < shoppingCart.items.length; i++) {
    const item = shoppingCart.items[i];
    if (item._id === itemId) {
      shoppingCart.items.splice(i, 1);
      break;
    }
  }
};
const resetCartItems = (items?: CartItem[]) => {
  while (shoppingCart.items.length) {
    shoppingCart.items.pop();
  }
  items?.forEach(addCartItem);
};
const addProductToCart = (
  product: (Partial<Products> | Partial<SearchItem>) & { _id: Products['_id'] },
  variationId?: Products['_id'],
  quantity?: number,
) => addCartItem(parseProduct(product, variationId, quantity));

export default shoppingCart;

export {
  totalItems,
  shoppingCart,
  addCartItem,
  removeCartItem,
  resetCartItems,
  parseProduct,
  addProductToCart,
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

watch(shoppingCart.items, (items) => {
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
      item.quantity = min;
    } else if (max && item.quantity > max) {
      item.quantity = max;
    }
  });
  shoppingCart.subtotal = items.reduce((acc, item) => {
    return acc + (item.quantity * (item.final_price || item.price));
  }, 0);
  emitCartEvents(items);
});

export const cartEvents = {
  on: cartEmitter.on,
  off: cartEmitter.off,
};
