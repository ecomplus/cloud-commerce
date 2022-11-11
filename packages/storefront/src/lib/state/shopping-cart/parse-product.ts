import type { ResourceId, Products, Carts } from '@cloudcommerce/api/types';
import { price as getPrice } from '@ecomplus/utils';

type CartItem = Carts['items'][0];

export default (product: Products, variationId?: ResourceId, quantity?: number) => {
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    quantity = product.min_quantity || 1;
  }
  const item: any = { ...product };
  if (variationId && product.variations) {
    Object.assign(item, product.variations.find(({ _id }) => _id === variationId));
    delete item.variations;
  }
  item.product_id = product._id;
  if (variationId) {
    item.variation_id = variationId;
    item.slug = product.slug;
    if (item.picture_id && product.pictures) {
      const pictures = product.pictures.filter((picture) => {
        return picture._id === item.picture_id;
      });
      if (pictures.length) {
        [item.picture] = pictures;
      }
    }
  }
  if (!item.picture && product.pictures) {
    [item.picture] = product.pictures;
  }
  item.max_quantity = item.quantity || product.quantity;
  const minQuantity = item.min_quantity || product.min_quantity;
  item.quantity = minQuantity > 0 ? Math.max(minQuantity, quantity) : quantity;
  item.price = getPrice(item) || getPrice(product);
  return item as CartItem;
};
