<script setup lang="ts">
import type { Products, ListPaymentsResponse } from '@cloudcommerce/types';
import usePrices from '@@sf/composables/use-prices';
import useComponentVariant from '@@sf/composables/use-component-variant';

export interface Props {
  product?: Partial<Products> & { price: number, final_price?: number };
  price?: number;
  basePrice?: number;
  isAmountTotal?: boolean,
  installmentsOption?: ListPaymentsResponse['installments_option'];
  discountOption?: ListPaymentsResponse['discount_option'];
  isBig?: boolean;
  isLiteral?: boolean;
  hasCashback?: boolean;
  hasPriceOptions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasCashback: true,
  hasPriceOptions: true,
});
const prices = usePrices(props);
const {
  hasVariedPrices,
  salePrice,
  comparePrice,
  cashbackPercentage,
  cashbackValue,
  installmentsNumber,
  monthlyInterest,
  installmentValue,
  priceWithDiscount,
  discountLabel,
} = prices;
const componentVariant = useComponentVariant(props);
</script>

<template>
  <div class="text-base-600" :data-prices="componentVariant">
    <slot v-if="comparePrice" name="compare" v-bind="{ salePrice, comparePrice }">
      <span class="text-base-500 mr-1" data-prices-compare>
        <slot name="compare-pre">
          <small v-if="isLiteral">
            {{ `${$t.i19from} ` }}
          </small>
        </slot>
        <slot name="compare-value" v-bind="{ salePrice, comparePrice }">
          <s>{{ $money(comparePrice) }}</s>
        </slot>
        <slot name="compare-post">
          <small v-if="isLiteral">
            {{ ` ${$t.i19to}` }}
          </small>
        </slot>
      </span>
    </slot>
    <slot name="sale" v-bind="{ salePrice }">
      <strong class="inline-block text-base-800" data-prices-sale>
        <slot name="sale-pre">
          <small v-if="hasVariedPrices">
            {{ `${$t.i19asOf} ` }}
          </small>
        </slot>
        <slot name="sale-value" v-bind="{ salePrice }">
          {{ $money(salePrice) }}
        </slot>
        <slot name="sale-post" />
      </strong>
    </slot>
    <Fade slide="down">
      <slot
        v-if="cashbackValue"
        name="cashback"
        v-bind="{ salePrice, cashbackValue, cashbackPercentage }"
      >
        <div v-if="hasCashback" class="relative z-10" data-prices-cashback>
          <span :data-tooltip="$t.i19get$1back
            .replace('$1', $percentage(cashbackPercentage))">
            <slot name="cashback-pre">
              <i class="i-cashback mr-1"></i>
            </slot>
            <slot
              name="cashback-value"
              v-bind="{ salePrice, cashbackValue, cashbackPercentage }"
            >
              <span class="font-medium">
                {{ $money(cashbackValue) }}
              </span>
            </slot>
            <slot name="cashback-post">
              <small> cashback</small>
            </slot>
          </span>
        </div>
      </slot>
    </Fade>
    <Fade slide="down">
      <slot
        v-if="installmentValue"
        name="installment"
        v-bind="{ salePrice, installmentValue, installmentsNumber, monthlyInterest }"
      >
        <div v-if="hasPriceOptions" data-prices-installment>
          <slot name="installment-pre">
            <small v-if="isLiteral">
              {{ `${$t.i19upTo} ` }}
            </small>
          </slot>
          <slot
            name="installment-value"
            v-bind="{ salePrice, installmentValue, installmentsNumber, monthlyInterest }"
          >
            {{ installmentsNumber }}x
            <small v-if="isLiteral">
              {{ ` ${$t.i19of} ` }}
            </small>
            <span>{{ $money(installmentValue) }}</span>
          </slot>
          <slot name="installment-post">
            <small v-if="!monthlyInterest && isLiteral">
              {{ $t.i19interestFree }}
            </small>
          </slot>
        </div>
      </slot>
    </Fade>
    <Fade slide="down">
      <slot
        v-if="priceWithDiscount < salePrice"
        name="discount"
        v-bind="{ salePrice, priceWithDiscount, discountLabel }"
      >
        <div v-if="hasPriceOptions" data-prices-discount>
          <slot name="discount-pre">
            <small v-if="!discountLabel">
              {{ `${$t.i19asOf} ` }}
            </small>
          </slot>
          <slot
            name="discount-value"
            v-bind="{ salePrice, priceWithDiscount, discountLabel }"
          >
            <span>{{ $money(priceWithDiscount) }}</span>
          </slot>
          <slot name="discount-post">
            <small v-if="discountLabel">
              {{ ` ${discountLabel}` }}
            </small>
          </slot>
        </div>
      </slot>
    </Fade>
  </div>
</template>

<style>
[data-prices-compare] {
  font-size: 87%;
}
[data-prices-cashback],
[data-prices-installment],
[data-prices-discount] {
  font-size: 90%;
}
[data-prices] small {
  @apply lowercase;
  font-size: 92%;
}
[data-prices~=Big] {
  @apply text-lg;
}
[data-prices~=Big] [data-prices-sale] {
  @apply text-5xl block;
}
</style>
