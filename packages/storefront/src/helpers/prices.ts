import type { ListPaymentsResponse } from '@cloudcommerce/types';

export type DiscountOption = Exclude<ListPaymentsResponse['discount_option'], undefined>;

// Kept free of runtime imports so `.astro` files can use it without pulling
// the modules info state into the SSR entry, where it runs `$storefront.onLoad`
// on module evaluation, before `ssr-context` has set the global up.
export const getPriceWithDiscount = (price: number, discount: DiscountOption) => {
  const { type, value } = discount;
  if (!value || (discount.min_amount && price < discount.min_amount)) {
    return price;
  }
  let priceWithDiscount: number;
  if (type === 'percentage') {
    priceWithDiscount = price * ((100 - value) / 100);
  } else {
    priceWithDiscount = price - value;
  }
  return priceWithDiscount > 0 ? priceWithDiscount : 0;
};
