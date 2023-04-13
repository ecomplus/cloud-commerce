import type { CartSet } from '@cloudcommerce/api/types';
import { randomObjectId } from '@ecomplus/utils';

type CartItem = CartSet['items'][0];

const matchItemsFlags = (item: CartItem, { flags: newItemFlags }: CartItem) => {
  if (!item.flags && !newItemFlags) {
    return true;
  }
  if (!item.flags || !newItemFlags || item.flags.length !== newItemFlags.length) {
    return false;
  }
  return item.flags.every((flag) => newItemFlags.includes(flag));
};

const addCartItem = (cart: CartSet, newItem: CartItem): null | CartItem => {
  if (
    typeof newItem.product_id !== 'string'
    || typeof newItem.quantity !== 'number' || !(newItem.quantity >= 0)
    || typeof newItem.price !== 'number' || !(newItem.price >= 0)
  ) {
    return null;
  }
  const { items } = cart;
  if (!newItem.kit_product) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (
        !item.kit_product
        && item.product_id === newItem.product_id
        && item.variation_id === newItem.variation_id
        && (!item.customizations || !item.customizations.length)
        && matchItemsFlags(item, newItem)
      ) {
        item.quantity += newItem.quantity;
        if (newItem.price) {
          item.price = newItem.price;
        }
        if (newItem.final_price) {
          item.final_price = newItem.final_price;
        }
        return item;
      }
    }
  }
  const itemCopy: CartItem = { ...newItem };
  if (
    !newItem._id
    || newItem._id === newItem.variation_id
    || items.find(({ _id }) => _id === newItem._id)
  ) {
    itemCopy._id = randomObjectId();
  }
  if (newItem.customizations) {
    const customizationsCopy: Exclude<CartItem['customizations'], undefined> = [];
    newItem.customizations.forEach((customization, i) => {
      customizationsCopy[i] = { ...customization };
    });
    itemCopy.customizations = customizationsCopy;
  }
  items.push(itemCopy);
  return itemCopy;
};

export default addCartItem;

export { matchItemsFlags, addCartItem };
