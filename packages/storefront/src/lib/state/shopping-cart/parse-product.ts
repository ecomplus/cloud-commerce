import type { Products, SearchItem } from '@cloudcommerce/api/types';
import type { ExtendedCartItem } from '@@sf/state/shopping-cart';
import { price as getPrice } from '@ecomplus/utils';

export default (
  product: (Partial<Products> | Partial<SearchItem>) & { _id: Products['_id'] },
  variationId?: Products['_id'],
  quantity?: number,
) => {
  const variation = variationId && product.variations
    ? product.variations.find(({ _id }) => _id === variationId)
    : undefined;
  const mergedProduct = { ...product, ...variation };
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    quantity = mergedProduct.min_quantity || 1;
  }
  const minQuantity = mergedProduct.min_quantity || 0;
  const item: ExtendedCartItem = {
    product_id: product._id,
    variation_id: variationId,
    sku: mergedProduct.sku,
    name: mergedProduct.name,
    slug: mergedProduct.slug,
    production_time: mergedProduct.production_time,
    currency_id: mergedProduct.currency_id,
    currency_symbol: mergedProduct.currency_symbol,
    base_price: mergedProduct.base_price,
    max_quantity: mergedProduct.quantity,
    quantity: minQuantity > 0 ? Math.max(minQuantity, quantity) : quantity,
    price: getPrice(mergedProduct),
    categories: mergedProduct.categories,
    weight: mergedProduct.weight,
  };
  if (product.pictures) {
    if (variation?.picture_id) {
      item.picture = product.pictures.find((_picture) => {
        return _picture._id === variation.picture_id;
      });
    }
    if (!item.picture) {
      [item.picture] = product.pictures;
    }
  }
  return item;
};
