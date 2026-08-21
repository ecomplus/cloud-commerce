<template>
  <section v-if="products.length" class="w-full py-4">
    <div class="ui-section">
      <div class="mx-auto mb-2 max-w-prose text-center">
        <h3 class="text-2xl text-base-700 ui-text-brand">
          {{ title }}
        </h3>
      </div>
      <ul class="grid grid-cols-2 md:grid-cols-4">
        <li v-for="product in products" :key="product._id">
          <ProductCard :product :list-name="title" />
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { i19recommendedForYou } from '@@i18n';
import {
  type Props as UseCartRecommendationsProps,
  useCartRecommendations,
} from '@@sf/composables/use-cart-recommendations';
// Cada tema tem o seu card, então a vitrine sai com a identidade da loja
import ProductCard from '~/components/ProductCard.vue';

export type Props = UseCartRecommendationsProps & {
  title?: string;
}
const props = withDefaults(defineProps<Props>(), {
  title: i19recommendedForYou,
});
const { products } = useCartRecommendations(props);
</script>
