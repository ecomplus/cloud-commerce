<script setup lang="ts">
import type { Products, Carts, ListPaymentsResponse } from '@cloudcommerce/types';
import usePrices from '@@sf/composables/use-prices';

export interface Props {
  product?: Partial<Carts['items'][0]> & Partial<Products> & { price: Products['price'] };
  price?: number;
  basePrice?: number;
  isAmountTotal?: boolean,
  installmentsOption?: ListPaymentsResponse['installments_option'];
  discountOption?: ListPaymentsResponse['discount_option'];
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  product: () => ({ price: 0 }),
});
const exposed = usePrices(props);
const { salePrice } = exposed;
</script>

<template>
  <slot v-bind="exposed">
    <div data-prices>
      {{ salePrice }}
    </div>
  </slot>
</template>
