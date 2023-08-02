import type { Products, Carts, SearchItem } from '@cloudcommerce/api/types';
import { price as getPrice } from '@ecomplus/utils';

type CartItem = Carts['items'][0];

export default (
  product: (Partial<Products> | Partial<SearchItem>) & { _id: Products['_id'] },
  variationId?: Products['_id'],
  quantity?: number,
) => {
  if (typeof quantity !== 'number' || Number.isNaN(quantity)) {
    quantity = product.min_quantity || 1;
  }
  const minQuantity = product.min_quantity || 0;
  const variation = variationId && product.variations
    ? product.variations.find(({ _id }) => _id === variationId)
    : undefined;
  const item: CartItem = {
    product_id: product._id,
    variation_id: variationId,
    sku: variation?.sku || product.sku,
    name: variation?.name || product.name,
    slug: product.slug,
    production_time: variation?.production_time || product.production_time,
    currency_id: product.currency_id,
    currency_symbol: product.currency_symbol,
    base_price: variation?.base_price || product.base_price,
    max_quantity: product.quantity,
    quantity: minQuantity > 0 ? Math.max(minQuantity, quantity) : quantity,
    price: getPrice(product),
  };
  if (variation?.picture_id && product.pictures) {
    item.picture = product.pictures.find((_picture) => {
      return _picture._id === variation.picture_id;
    });
  }
  if (!item.picture && product.pictures) {
    [item.picture] = product.pictures;
  }
  return item;
};
