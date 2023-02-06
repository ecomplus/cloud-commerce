<script setup lang="ts">
import { CategoriesList } from '@cloudcommerce/api/types';

export interface Props {
  categories: CategoriesList;
}

const props = defineProps<Props>();
const mainCategories = props.categories.filter(({ slug, parent }) => {
  return slug && !parent;
});
</script>

<template>
  <aside data-sidenav>
    <nav class="py-5" data-sidenav-nav>
      <ul>
        <li v-for="mainCategory in mainCategories" :key="mainCategory._id">
          <a :href="`/${mainCategory.slug}`">
            {{ mainCategory.name }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>
