import type { ResourceId, Products, CartSet } from '@cloudcommerce/api/types';
import { computed } from 'vue';
import useStorage from './use-storage';
import addItem from './shopping-cart/add-cart-item';
import parseProduct from './shopping-cart/parse-product';

const storageKey = 'SHOPPING_CART';
const emptyCart = {
  items: [],
};
const cart = useStorage<CartSet>(storageKey, emptyCart);

const cartItems = computed(() => {
  return cart.items.map((item) => {
    item.final_price = item.kit_product?.price && item.kit_product.pack_quantity
      ? item.kit_product.price / item.kit_product.pack_quantity
      : item.price;
    if (Array.isArray(item.customizations)) {
      item.customizations.forEach((customization) => {
        if (customization.add_to_price) {
          const { type, addition } = customization.add_to_price;
          item.final_price += type === 'fixed'
            ? addition
            : item.price * (addition / 100);
        }
      });
    }
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
    return acc + (item.quantity * item.final_price);
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

const addCartItem = (newItem: CartSet['items'][0]) => {
  const cartObj = shoppingCart.value;
  const upsertedItem = addItem(cartObj, newItem);
  if (upsertedItem) {
    // Force reactivity
    shoppingCart.value.items = cartObj.items;
  }
};

const addProductToCart = (
  product: Products,
  variationId?: ResourceId,
  quantity?: number,
) => addCartItem(parseProduct(product, variationId, quantity));

export default shoppingCart;

export {
  shoppingCart,
  addCartItem,
  parseProduct,
  addProductToCart,
};
