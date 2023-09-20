<script setup lang="ts">
export interface Props {
  html: string;
}

const { html } = defineProps<Props>();
const parsedHTML = html.replace(/<(img|iframe) /g, '<$1 loading="lazy" ');
</script>

<template>
  <article class="overflow-x-auto lg:overflow-x-hidden prose !max-w-full" v-once>
    <div
      class="[&_table]:max-w-full [&_img]:max-w-full [&_iframe]:max-w-full"
      v-html="parsedHTML"
    ></div>
  </article>
</template>
