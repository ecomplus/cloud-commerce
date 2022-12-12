<script setup lang="ts">
import type { Products, Carts } from '@cloudcommerce/api/types';
import { price as getPrice } from '@ecomplus/utils';
import modulesInfo from '@@sf/state/modules-info';

export interface Props {
  product?: (Partial<Products> | Partial<Carts['items'][0]>) & { price: Products['price'] };
  price?: number;
  basePrice?: number;
}

export interface Exposed {
  salePrice: ComputedRef<number>;
}

type DiscountObject = { type?: 'percentage' | 'fixed', value: number };
const getPriceWithDiscount = (price: number, discount: DiscountObject) => {
  const { type, value } = discount;
  let priceWithDiscount;
  if (value) {
    if (type === 'percentage') {
      priceWithDiscount = price * ((100 - value) / 100);
    } else {
      priceWithDiscount = price - value;
    }
    return priceWithDiscount > 0 ? priceWithDiscount : 0;
  }
  return price;
};

const props = defineProps<Props>();
const extraDiscount = computed(() => {
  return modulesInfo.apply_discount.available_extra_discount;
});
const salePrice = computed(() => {
  const price = props.price || getPrice(props.product);
  const discount = extraDiscount.value;
  if (discount && (!discount.min_amount || price > discount.min_amount)) {
    return getPriceWithDiscount(price, discount);
  }
  return price;
});
defineExpose<Exposed>({ salePrice });
</script>

<template>
  <div class="price">
    {{ $t.i19from }}
    {{ $t.i19to.toLowerCase() }}
    {{ price }}
    <slot>
      <PriceSale/>
    </slot>
  </div>
</template>
