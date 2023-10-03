<script lang="ts">
import {
  type Ref,
  type WritableComputedRef,
  type InjectionKey,
  ref,
  computed,
  provide,
} from 'vue';
import { useId } from '@@sf/sf-lib';
import QuantitySelectorControl from '@@sf/components/QuantitySelectorControl.vue';

export type QuantitySelectorInject = {
  value: WritableComputedRef<number>,
  isBoundMin: Ref<boolean>,
  isBoundMax: Ref<boolean>,
};

export const quantitySelectorKey = Symbol('quantitySelector') as
  InjectionKey<QuantitySelectorInject>;
</script>

<script setup lang="ts">
export interface Props {
  modelValue?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  min: 1,
});
const emit = defineEmits<{
  'update:modelValue': [value: number]
}>();
const input = ref<HTMLInputElement | null>(null);
const inputId = `NInput${useId()}`;
const value = computed({
  get() {
    return props.modelValue;
  },
  set(_value) {
    if (_value < props.min) {
      _value = props.min;
      (input.value as HTMLInputElement).value = `${_value}`;
    }
    if (props.max && _value > props.max) {
      _value = props.max;
      (input.value as HTMLInputElement).value = `${_value}`;
    }
    emit('update:modelValue', _value);
  },
});
const isBoundMin = computed(() => {
  return props.min >= value.value;
});
const isBoundMax = computed(() => {
  return (props.max as number) <= value.value;
});
provide(quantitySelectorKey, {
  value,
  isBoundMin,
  isBoundMax,
});
</script>

<template>
  <div data-quantity-selector>
    <slot name="label" v-bind="{ inputId, value }">
      <label :for="inputId" class="sr-only">
        {{ $t.i19quantity }}
      </label>
    </slot>
    <div class="flex items-center">
      <input
        ref="input"
        type="number"
        :id="inputId"
        v-model="value"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :readonly="readonly"
        class="h-12 w-14 border-transparent px-2 text-center text-lg
        [-moz-appearance:_textfield] [&::-webkit-inner-spin-button]:m-0
        [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0
        [&::-webkit-outer-spin-button]:appearance-none"
      />
      <slot
        name="controls"
        v-bind="{ value, isBoundMin, isBoundMax }"
      >
        <QuantitySelectorControl is-minus class="order-first">
          <slot name="minus" />
        </QuantitySelectorControl>
        <QuantitySelectorControl class="order-last">
          <slot name="plus" />
        </QuantitySelectorControl>
      </slot>
    </div>
  </div>
</template>
