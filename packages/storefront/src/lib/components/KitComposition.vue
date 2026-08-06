<script setup lang="ts">
import type { ResourceId } from '@cloudcommerce/api/types';
import type { KitCompositionItem } from '@@sf/composables/use-product-details';
import { name as getName } from '@ecomplus/utils';

export type Props = {
  items: KitCompositionItem[];
  hasSelectionAlert?: boolean;
}

defineProps<Props>();
const emit = defineEmits<{
  selectVariation: [index: number, variationId: ResourceId | null],
}>();
const selectVariation = (index: number, variationId: ResourceId | null) => {
  emit('selectVariation', index, variationId);
};
const handleSelect = (index: number, ev: Event) => {
  const { value } = (ev.target as HTMLSelectElement);
  selectVariation(index, (value as ResourceId) || null);
};
</script>

<template>
  <div data-kit-composition>
    <strong class="text-sm font-medium uppercase text-base-700">
      {{ $t({ pt: 'Este kit contém', en: 'This kit contains' }) }}
    </strong>
    <ul class="mt-3 space-y-3">
      <li
        v-for="item in items"
        :key="item.index"
        class="flex items-start gap-3"
      >
        <div class="w-16 shrink-0">
          <Skeleton v-if="!item.product" class="aspect-square w-full" />
          <AImg
            v-else-if="item.product.pictures?.length"
            :picture="item.product.pictures[0]"
            :alt="getName(item.product)"
            class="w-full rounded border border-base-100"
          />
        </div>
        <div class="grow">
          <div class="flex items-start justify-between gap-2">
            <Skeleton v-if="!item.product" class="h-4 w-40" />
            <ALink
              v-else
              :href="item.product.slug ? `/${item.product.slug}` : null"
              target="_blank"
              class="text-sm text-base-800 hover:underline"
            >
              {{ getName(item.product) }}
            </ALink>
            <span
              v-if="item.quantity > 1"
              class="shrink-0 rounded bg-base-100 px-1.5 py-0.5 text-xs text-base-700"
            >
              {{ item.quantity }}x
            </span>
          </div>
          <div
            v-if="item.product && !item.isInStock"
            class="mt-1 text-sm text-warning-800"
          >
            {{ $t.i19outOfStock }}
          </div>
          <slot
            v-else-if="item.variations.length"
            name="variations"
            v-bind="{ item, selectVariation }"
          >
            <select
              class="mt-2 w-full rounded border border-base-200 bg-white
              px-2 py-1.5 text-sm"
              :class="hasSelectionAlert && !item.isSelected && 'border-warning-500'"
              :value="item.variationId || ''"
              @change="handleSelect(item.index, $event)"
            >
              <option value="" disabled>
                {{ $t.i19selectVariation }}
              </option>
              <option
                v-for="variation in item.variations"
                :key="variation._id"
                :value="variation._id"
              >
                {{ variation.name }}
              </option>
            </select>
          </slot>
        </div>
      </li>
    </ul>
  </div>
</template>
