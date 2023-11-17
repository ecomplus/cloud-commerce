import type { Products, CartSet, SearchItem } from '@cloudcommerce/api/types';
import { computed, watch } from 'vue';
import mitt from 'mitt';
import useStorage from '@@sf/state/use-storage';
import addItem from '@@sf/state/shopping-cart/add-cart-item';
import parseProduct from '@@sf/state/shopping-cart/parse-product';

type CartItem = CartSet['items'][0];
const storageKey = 'ecomShoppingCart';
const emptyCart = {
  items: [],
};
const cart = useStorage<CartSet>(storageKey, emptyCart);

const cartItems = computed(() => {
  return cart.items.map((item) => {
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
    return item;
  });
});
const subtotal = computed(() => {
  return cartItems.value.reduce((acc, item) => {
    return acc + (item.quantity * (item.final_price || item.price));
  }, 0);
});
const totalItems = computed(() => {
  return cartItems.value.reduce((acc, item) => {
    return acc + item.quantity;
  }, 0);
});
const shoppingCart = computed({
  get() {
    return {
      ...cart,
      subtotal: subtotal.value,
    };
  },
  set(newCart) {
    Object.assign(cart, newCart, {
      subtotal: subtotal.value,
    });
  },
});

const addCartItem = (newItem: CartItem) => {
  const cartObj = shoppingCart.value;
  const upsertedItem = addItem(cartObj, newItem);
  if (upsertedItem) {
    // Force reactivity
    shoppingCart.value.items = cartObj.items;
  }
};
const removeCartItem = (itemId: string) => {
  for (let i = 0; i < shoppingCart.value.items.length; i++) {
    const item = shoppingCart.value.items[i];
    if (item._id === itemId) {
      shoppingCart.value.items.splice(i, 1);
      break;
    }
  }
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
  parseProduct,
  addProductToCart,
};

type CartEvent = {
  addCartItem: CartItem,
  removeCartItem: CartItem,
};
const cartEmitter = mitt<CartEvent>();
const cloneItems = () => shoppingCart.value.items.map((item) => ({ ...item }));
let oldItems = cloneItems();
watch(shoppingCart, ({ items }) => {
  ['addCartItem' as const, 'removeCartItem' as const].forEach((evName) => {
    const isAdd = evName === 'addCartItem';
    const baseItems = isAdd ? items : oldItems;
    const compareItems = isAdd ? oldItems : items;
    baseItems.forEach((baseItem) => {
      if (!baseItem.quantity) return;
      const compareItem = compareItems.find(({ _id }) => _id === baseItem._id);
      if (compareItem && baseItem.quantity > compareItem.quantity) {
        cartEmitter.emit(evName, {
          ...baseItem,
          quantity: baseItem.quantity - (compareItem?.quantity || 0),
        });
      }
    });
  });
  oldItems = cloneItems();
});

export const cartEvents = {
  on: cartEmitter.on,
  off: cartEmitter.off,
};
