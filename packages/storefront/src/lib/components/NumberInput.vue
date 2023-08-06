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
import NumberInputControl from '@@sf/components/NumberInputControl.vue';

export type NumberInputInject = {
  value: WritableComputedRef<number>,
  isBoundMin: Ref<boolean>,
  isBoundMax: Ref<boolean>,
};

export const numberInputKey = Symbol('numberInput') as
  InjectionKey<NumberInputInject>;
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
provide(numberInputKey, {
  value,
  isBoundMin,
  isBoundMax,
});
</script>

<template>
  <div data-number-input>
    <slot name="label" v-bind="{ inputId, value }" />
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
        class="h-12 w-14 px-2 text-lg border-transparent text-center
        [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0
        [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0
        [&::-webkit-inner-spin-button]:appearance-none"
      />
      <slot
        name="controls"
        v-bind="{ value, isBoundMin, isBoundMax }"
      >
        <NumberInputControl is-minus class="order-first">
          <slot name="minus" />
        </NumberInputControl>
        <NumberInputControl class="order-last">
          <slot name="plus" />
        </NumberInputControl>
      </slot>
    </div>
  </div>
</template>
