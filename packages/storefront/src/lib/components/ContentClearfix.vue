<script setup lang="ts">
export type Props = {
  html: string;
}

const { html } = defineProps<Props>();
const parsedHTML = html.replace(/<(img|iframe) /g, '<$1 loading="lazy" ');
</script>

<template>
  <article class="!max-w-full overflow-x-auto prose" v-once>
    <div
      class="[&_iframe]:max-w-full [&_img]:max-w-full [&_table]:max-w-full"
      v-html="parsedHTML"
    ></div>
  </article>
</template>
