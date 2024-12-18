import type { CartSet } from '@cloudcommerce/api/types';

type CartItem = CartSet['items'][0];
type ItemKitProduct = Exclude<CartItem['kit_product'], undefined>;
type ItemKitComposition = Exclude<ItemKitProduct['composition'], undefined>;

const matchKitItem = (cartItem: CartItem, kitItem: ItemKitComposition[number]) => {
  return kitItem._id === cartItem.product_id
    && kitItem.variation_id === cartItem.variation_id
    && kitItem.quantity === cartItem.quantity;
};

const removeCartItem = (cart: CartSet, itemId: string): Array<CartItem> => {
  const cartItemIndex = cart.items.findIndex((item) => {
    return item._id === itemId;
  });
  if (cartItemIndex === -1) return [];
  const cartItem = cart.items[cartItemIndex];
  cart.items.splice(cartItemIndex, 1);
  const removedItems: Array<CartItem> = [cartItem];
  if (cartItem.kit_product) {
    const { _id: kitProductId, composition } = cartItem.kit_product;
    if (composition) {
      for (let i = 0; i < composition.length; i++) {
        if (matchKitItem(cartItem, composition[i])) {
          composition.splice(i, 1);
        }
      }
    }
    let i = 0;
    while (i < cart.items.length) {
      const _cartItem = cart.items[i];
      if (_cartItem.kit_product?._id !== kitProductId) {
        i += 1;
        continue;
      }
      if (composition) {
        const kitItemIndex = composition.findIndex((kitItem) => {
          return matchKitItem(_cartItem, kitItem);
        });
        if (kitItemIndex === -1) {
          i += 1;
          continue;
        }
        composition.splice(kitItemIndex, 1);
      }
      removedItems.push(cart.items[i]);
      cart.items.splice(i, 1);
    }
  }
  return removedItems;
};

export default removeCartItem;

export { matchKitItem, removeCartItem };
